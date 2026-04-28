package com.blisssierra.hrms.service;

import com.blisssierra.hrms.dto.ApiResponseDto;
import com.blisssierra.hrms.dto.ForgotPasswordRequestDto;
import com.blisssierra.hrms.dto.LoginRequestDto;
import com.blisssierra.hrms.dto.LoginResponseDto;
import com.blisssierra.hrms.dto.OtpVerifyRequestDto;
import com.blisssierra.hrms.dto.ResendOtpRequestDto;
import com.blisssierra.hrms.dto.ResetPasswordRequestDto;
import com.blisssierra.hrms.dto.SignupRequestDto;
import com.blisssierra.hrms.dto.VerifyForgotOtpRequestDto;
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.repository.EmployeeRepository;
import com.blisssierra.hrms.security.JwtUtil;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String LOGIN_TYPE_ADMIN = "ADMIN";
    private static final String LOGIN_TYPE_EMPLOYEE = "EMPLOYEE";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_EMPLOYEE = "ROLE_EMPLOYEE";

    private static final String HARDCODED_ADMIN_USERNAME = "ADMIN";
    private static final String HARDCODED_ADMIN_PASSWORD = "admin123";

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private PasswordResetTokenStore passwordResetTokenStore;

    @Autowired
    private AdminNotificationService adminNotificationService;

    @Autowired
    private JwtUtil jwtUtil;

    public ApiResponseDto signup(SignupRequestDto req) {
        String loginType = isBlank(req.getLoginType()) ? LOGIN_TYPE_EMPLOYEE : req.getLoginType().trim().toUpperCase();
        log.info("Signup request: username={}, empId={}, loginType={}", req.getUsername(), req.getEmpId(), loginType);

        if (!LOGIN_TYPE_ADMIN.equals(loginType) && !LOGIN_TYPE_EMPLOYEE.equals(loginType)) {
            return new ApiResponseDto("error", "Invalid signup type");
        }

        if (LOGIN_TYPE_ADMIN.equals(loginType)) {
            return new ApiResponseDto("error", "Admin registration is disabled. Please use the provided admin credentials.");
        }

        if (isBlank(req.getName()) || isBlank(req.getEmail())
                || isBlank(req.getEmpId()) || isBlank(req.getDesignation())
                || isBlank(req.getPassword())) {
            return new ApiResponseDto("error", "All fields are required");
        }

        String email = req.getEmail().trim().toLowerCase();
        String empId = req.getEmpId().trim().toUpperCase();

        if (employeeRepository.existsByEmail(email)) {
            Optional<Employee> existing = employeeRepository.findByEmail(email);
            if (existing.isPresent() && existing.get().isVerified()) {
                return new ApiResponseDto("error", "An account with this email already exists");
            }
            existing.ifPresent(employeeRepository::delete);
        }

        if (employeeRepository.existsByEmpId(empId)) {
            Optional<Employee> existing = employeeRepository.findByEmpId(empId);
            if (existing.isPresent() && existing.get().isVerified()) {
                return new ApiResponseDto("error", "An account with this Employee ID already exists");
            }
            existing.ifPresent(employeeRepository::delete);
        }

        Employee employee = new Employee();
        employee.setName(req.getName().trim());
        employee.setEmail(email);
        employee.setEmpId(empId);
        employee.setDesignation(req.getDesignation().trim());
        employee.setPassword(passwordEncoder.encode(req.getPassword().trim()));
        employee.setVerified(false);
        employee.setApproved(false);
        employee.setBiometricEnabled(false);
        employee.setRole(ROLE_EMPLOYEE);
        employee.setUsername(req.getUsername());
        employeeRepository.save(employee);

        try {
            otpService.generateAndSendOtp(email, req.getName().trim());
        } catch (Exception e) {
            log.error("OTP send failed for {}: {}", email, e.getMessage());
            employeeRepository.delete(employee);
            return new ApiResponseDto("error",
                    "Registration failed: Could not send OTP email. Error: " + e.getMessage());
        }

        return new ApiResponseDto("success",
                "OTP sent to " + email + ". After verifying your email, please wait for admin approval.");
    }

    public ApiResponseDto verifyOtp(OtpVerifyRequestDto req) {
        log.info("OTP verify request: email={}", req.getEmail());
        if (isBlank(req.getEmail()) || isBlank(req.getOtp())) {
            return new ApiResponseDto("error", "Email and OTP are required");
        }

        String email = req.getEmail().trim().toLowerCase();
        OtpService.OtpValidationResult result = otpService.validateOtpDetailed(email, req.getOtp().trim());
        if (!result.isValid()) {
            return new ApiResponseDto("error", result.getMessage());
        }

        Optional<Employee> optional = employeeRepository.findByEmail(email);
        if (optional.isPresent()) {
            Employee employee = optional.get();
            employee.setVerified(true);
            if (ROLE_ADMIN.equals(employee.getRole())) {
                employee.setApproved(true);
            }
            employeeRepository.save(employee);
            if (ROLE_ADMIN.equals(employee.getRole())) {
                log.info("Admin email verified and activated: empId={}", employee.getEmpId());
            } else {
                log.info("Employee email verified and pending admin approval: empId={}", employee.getEmpId());
                adminNotificationService.createSignupRequestNotification(employee);
            }
        } else {
            log.warn("OTP verified but employee not found: {}", email);
        }

        if (optional.isPresent() && ROLE_ADMIN.equals(optional.get().getRole())) {
            return new ApiResponseDto("success", "Email verified successfully! Your admin account is active.");
        }
        return new ApiResponseDto("success",
                "Email verified successfully! Your account is pending admin approval.");
    }

    public ApiResponseDto resendOtp(ResendOtpRequestDto req) {
        log.info("Resend OTP request: email={}", req.getEmail());
        if (isBlank(req.getEmail())) {
            return new ApiResponseDto("error", "Email is required");
        }

        String email = req.getEmail().trim().toLowerCase();
        Optional<Employee> optional = employeeRepository.findByEmail(email);
        if (optional.isEmpty()) {
            return new ApiResponseDto("error", "No account found for " + email);
        }

        try {
            otpService.generateAndSendOtp(email, optional.get().getName());
        } catch (Exception e) {
            return new ApiResponseDto("error", "Failed to resend OTP: " + e.getMessage());
        }

        return new ApiResponseDto("success", "OTP resent to " + email);
    }

    public LoginResponseDto login(LoginRequestDto req) {
        log.info("Login request: username={}, empId={}, loginType={}", req.getUsername(), req.getEmpId(), req.getLoginType());
        String identifier = normalizeIdentifier(req.getUsername(), req.getEmpId());
        if (isBlank(identifier) || isBlank(req.getPassword())) {
            return errorLogin("Username and password are required");
        }
        if (isBlank(req.getLoginType())) {
            return errorLogin("Login type is required");
        }

        String loginType = req.getLoginType().trim().toUpperCase();
        if (!LOGIN_TYPE_ADMIN.equals(loginType) && !LOGIN_TYPE_EMPLOYEE.equals(loginType)) {
            return errorLogin("Invalid login type");
        }

        if (LOGIN_TYPE_ADMIN.equals(loginType)) {
            if (!HARDCODED_ADMIN_USERNAME.equals(identifier) || !HARDCODED_ADMIN_PASSWORD.equals(req.getPassword().trim())) {
                log.warn("Admin login failed: invalid credentials for identifier={}", identifier);
                return errorLogin("Invalid admin credentials");
            }

            String token = jwtUtil.generateToken(HARDCODED_ADMIN_USERNAME, ROLE_ADMIN, 0L, "Admin");
            LoginResponseDto res = new LoginResponseDto();
            res.setStatus("success");
            res.setMessage("Login successful");
            res.setToken(token);
            res.setRole(ROLE_ADMIN);
            res.setUserId(0L);
            res.setName("Admin");
            res.setEmail("admin@local");
            res.setEmpId(HARDCODED_ADMIN_USERNAME);
            res.setDesignation("ADMIN");
            res.setBiometricRequired(false);
            return res;
        }

        Optional<Employee> optional = findByIdentifier(identifier);
        if (optional.isEmpty()) {
            log.warn("Login failed: identifier={} not found", identifier);
            return errorLogin("Invalid username or password");
        }

        Employee employee = optional.get();
        if (!ROLE_EMPLOYEE.equals(employee.getRole())) {
            log.warn("Employee login blocked for identifier={} with role={}", identifier, employee.getRole());
            return errorLogin("Invalid username or password");
        }
        if (!checkPassword(req.getPassword().trim(), employee.getPassword())) {
            log.warn("Login failed: wrong password for identifier={}", identifier);
            return errorLogin("Invalid username or password");
        }
        if (!employee.isVerified()) {
            return errorLogin("Your email is not verified. Please complete OTP verification.");
        }
        if (!employee.isApproved()) {
            return errorLogin("Your account is pending admin approval. Please wait.");
        }

        String token = jwtUtil.generateToken(employee.getEmpId(), ROLE_EMPLOYEE, employee.getId(), employee.getName());
        LoginResponseDto res = new LoginResponseDto();
        res.setStatus("success");
        res.setMessage("Login successful");
        res.setToken(token);
        res.setRole(ROLE_EMPLOYEE);
        res.setUserId(employee.getId());
        res.setName(employee.getName());
        res.setEmail(employee.getEmail());
        res.setEmpId(employee.getEmpId());
        res.setDesignation(employee.getDesignation());
        res.setAvatarUri(employee.getProfileImage());
        res.setFaceImagePaths(employee.getFaceImagePaths());
        return res;
    }

    public ApiResponseDto forgotPassword(ForgotPasswordRequestDto req) {
        log.info("Forgot password request: email={}", req.getEmail());
        if (isBlank(req.getEmail())) {
            return new ApiResponseDto("error", "Email is required");
        }

        String email = req.getEmail().trim().toLowerCase();
        Optional<Employee> optional = employeeRepository.findByEmail(email);
        if (optional.isEmpty()) {
            return new ApiResponseDto("error", "If this email is registered, an OTP will be sent.");
        }

        Employee employee = optional.get();
        if (!employee.isVerified()) {
            return new ApiResponseDto("error",
                    "This account's email is not verified yet. Please complete signup first.");
        }

        try {
            otpService.generateAndSendOtp(email, employee.getName());
            return new ApiResponseDto("success", "OTP sent to " + email + ". Valid for 5 minutes.");
        } catch (Exception e) {
            log.error("Failed to send forgot-password OTP to {}: {}", email, e.getMessage());
            return new ApiResponseDto("error", "Failed to send OTP. Please try again.");
        }
    }

    public ApiResponseDto verifyForgotOtp(VerifyForgotOtpRequestDto req) {
        log.info("Verify forgot-password OTP: email={}", req.getEmail());
        if (isBlank(req.getEmail()) || isBlank(req.getOtp())) {
            return new ApiResponseDto("error", "Email and OTP are required");
        }

        String email = req.getEmail().trim().toLowerCase();
        OtpService.OtpValidationResult result = otpService.validateOtpDetailed(email, req.getOtp().trim());
        if (!result.isValid()) {
            return new ApiResponseDto("error", result.getMessage());
        }

        passwordResetTokenStore.allow(email);
        return new ApiResponseDto("success", "OTP verified. You may now reset your password.");
    }

    public ApiResponseDto resetPassword(ResetPasswordRequestDto req) {
        log.info("Reset password request: email={}", req.getEmail());
        if (isBlank(req.getEmail()) || isBlank(req.getNewPassword())) {
            return new ApiResponseDto("error", "Email and new password are required");
        }
        if (req.getNewPassword().trim().length() < 6) {
            return new ApiResponseDto("error", "Password must be at least 6 characters");
        }

        String email = req.getEmail().trim().toLowerCase();
        if (!passwordResetTokenStore.isAllowed(email)) {
            return new ApiResponseDto("error",
                    "Password reset session expired or not verified. Please restart the forgot-password process.");
        }

        Optional<Employee> optional = employeeRepository.findByEmail(email);
        if (optional.isEmpty()) {
            return new ApiResponseDto("error", "Account not found");
        }

        Employee employee = optional.get();
        employee.setPassword(passwordEncoder.encode(req.getNewPassword().trim()));
        employeeRepository.save(employee);
        passwordResetTokenStore.revoke(email);
        return new ApiResponseDto("success", "Password reset successfully. You can now sign in.");
    }

    private boolean checkPassword(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return storedPassword.equals(rawPassword);
    }

    private LoginResponseDto errorLogin(String message) {
        LoginResponseDto res = new LoginResponseDto();
        res.setStatus("error");
        res.setMessage(message);
        res.setBiometricRequired(false);
        return res;
    }

    private Optional<Employee> findByIdentifier(String identifier) {
        Optional<Employee> byUsername = employeeRepository.findByUsername(identifier);
        if (byUsername.isPresent()) {
            return byUsername;
        }
        return employeeRepository.findByEmpId(identifier);
    }

    private String normalizeIdentifier(String username, String empId) {
        if (!isBlank(username)) {
            return username.trim().toUpperCase();
        }
        if (!isBlank(empId)) {
            return empId.trim().toUpperCase();
        }
        return null;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
