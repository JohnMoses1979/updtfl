package com.blisssierra.hrms.controller;

import com.blisssierra.hrms.dto.ApiResponseDto;
import com.blisssierra.hrms.dto.ForgotPasswordRequestDto;
import com.blisssierra.hrms.dto.LoginRequestDto;
import com.blisssierra.hrms.dto.LoginResponseDto;
import com.blisssierra.hrms.dto.OtpVerifyRequestDto;
import com.blisssierra.hrms.dto.ResendOtpRequestDto;
import com.blisssierra.hrms.dto.ResetPasswordRequestDto;
import com.blisssierra.hrms.dto.SignupRequestDto;
import com.blisssierra.hrms.dto.VerifyForgotOtpRequestDto;
import com.blisssierra.hrms.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponseDto> signup(@RequestBody SignupRequestDto req) {
        log.info("POST /api/auth/signup - username={}, empId={}, email={}", req.getUsername(), req.getEmpId(), req.getEmail());
        ApiResponseDto response = authService.signup(req);
        HttpStatus status = "success".equals(response.getStatus()) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponseDto> verifyOtp(@RequestBody OtpVerifyRequestDto req) {
        log.info("POST /api/auth/verify-otp - email={}", req.getEmail());
        ApiResponseDto response = authService.verifyOtp(req);
        HttpStatus status = "success".equals(response.getStatus()) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponseDto> resendOtp(@RequestBody ResendOtpRequestDto req) {
        log.info("POST /api/auth/resend-otp - email={}", req.getEmail());
        ApiResponseDto response = authService.resendOtp(req);
        HttpStatus status = "success".equals(response.getStatus()) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto req) {
        log.info("POST /api/auth/login - username={}, empId={}, loginType={}", req.getUsername(), req.getEmpId(), req.getLoginType());
        LoginResponseDto response = authService.login(req);
        HttpStatus status = "success".equals(response.getStatus())
                ? HttpStatus.OK
                : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponseDto> health() {
        return ResponseEntity.ok(new ApiResponseDto("success", "Auth service is running"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponseDto> forgotPassword(@RequestBody ForgotPasswordRequestDto req) {
        log.info("POST /api/auth/forgot-password - email={}", req.getEmail());
        ApiResponseDto response = authService.forgotPassword(req);
        HttpStatus status = "success".equals(response.getStatus()) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/verify-forgot-otp")
    public ResponseEntity<ApiResponseDto> verifyForgotOtp(@RequestBody VerifyForgotOtpRequestDto req) {
        log.info("POST /api/auth/verify-forgot-otp - email={}", req.getEmail());
        ApiResponseDto response = authService.verifyForgotOtp(req);
        HttpStatus status = "success".equals(response.getStatus()) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponseDto> resetPassword(@RequestBody ResetPasswordRequestDto req) {
        log.info("POST /api/auth/reset-password - email={}", req.getEmail());
        ApiResponseDto response = authService.resetPassword(req);
        HttpStatus status = "success".equals(response.getStatus()) ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }
}
