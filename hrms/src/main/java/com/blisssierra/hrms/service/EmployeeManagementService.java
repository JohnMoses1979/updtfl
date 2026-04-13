// src/main/java/com/blisssierra/hrms/service/EmployeeManagementService.java
package com.blisssierra.hrms.service;
import com.blisssierra.hrms.dto.EmployeeRequestDto;
import com.blisssierra.hrms.dto.EmployeeResponseDto;
import com.blisssierra.hrms.entity.AppUser;
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.repository.AppUserRepository;
import com.blisssierra.hrms.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
/**
 * EmployeeManagementService
 *
 * Manages CRUD on the `employees` table (the authoritative employee record).
 *
 * SYNC STRATEGY:
 * The `app_user` table is used by the Task system for assignee lookups.
 * To keep things consistent without merging the tables (which would break
 * the auth system), every Employee create/update/delete is mirrored into
 * app_user automatically. This means:
 * - Admin adds employee → row appears in both `employees` and `app_user`
 * - Admin updates employee → both rows updated
 * - Admin deletes employee → both rows removed
 *
 * Employees created via signup (AuthService) are also synced here — they
 * get an app_user row created during their first login if one doesn't exist.
 *
 * Existing signup flow is completely untouched.
 */
@Service
public class EmployeeManagementService {
    private static final Logger log = LoggerFactory.getLogger(EmployeeManagementService.class);
    // Default password for admin-created accounts (employee must change on first
    // login)
    private static final String DEFAULT_PASSWORD = "changeme123";
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private AppUserRepository appUserRepository;
    // ── READ ────────────────────────────────────────────────────────────────
    public List<EmployeeResponseDto> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    public EmployeeResponseDto getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: id=" + id));
        return toDto(emp);
    }
    // ── CREATE ───────────────────────────────────────────────────────────────
    @Transactional
    public EmployeeResponseDto createEmployee(EmployeeRequestDto request) {
        String empId = request.getEmpId().trim().toUpperCase();
        String email = request.getEmail().trim().toLowerCase();
        if (employeeRepository.existsByEmpId(empId)) {
            throw new RuntimeException("Employee ID already exists: " + empId);
        }
        if (employeeRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered: " + email);
        }
        // --- Save to `employees` table ---
        Employee emp = new Employee();
        emp.setEmpId(empId);
        emp.setEmpCode(empId); // empCode = empId for admin-created employees
        emp.setName(request.getName().trim());
        emp.setEmail(email);
        emp.setDesignation(request.getDesignation().trim());
        emp.setPassword(
                request.getPassword() != null && !request.getPassword().isBlank()
                        ? request.getPassword().trim()
                        : DEFAULT_PASSWORD);
        emp.setMonthlySalary(
                request.getMonthlySalary() != null ? request.getMonthlySalary() : 0.0);
        // Admin-created accounts are pre-verified so they can log in immediately
        emp.setVerified(true);
        emp.setFaceImagePaths("");
        Employee saved = employeeRepository.save(emp);
        log.info("Employee created: empId={}, id={}", empId, saved.getId());
        // --- Mirror into `app_user` table for task assignment ---
        syncToAppUser(saved);
        return toDto(saved);
    }
    // ── UPDATE ───────────────────────────────────────────────────────────────
    @Transactional
    public EmployeeResponseDto updateEmployee(Long id, EmployeeRequestDto request) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: id=" + id));
        String newEmpId = request.getEmpId().trim().toUpperCase();
        String newEmail = request.getEmail().trim().toLowerCase();
        // Check uniqueness only if the values changed
        if (!emp.getEmpId().equals(newEmpId) && employeeRepository.existsByEmpId(newEmpId)) {
            throw new RuntimeException("Employee ID already exists: " + newEmpId);
        }
        if (!emp.getEmail().equals(newEmail) && employeeRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email already registered: " + newEmail);
        }
        String oldEmpId = emp.getEmpId();
        emp.setEmpId(newEmpId);
        emp.setEmpCode(newEmpId);
        emp.setName(request.getName().trim());
        emp.setEmail(newEmail);
        emp.setDesignation(request.getDesignation().trim());
        if (request.getMonthlySalary() != null) {
            emp.setMonthlySalary(request.getMonthlySalary());
        }
        // Only update password if explicitly provided
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            emp.setPassword(request.getPassword().trim());
        }
        Employee updated = employeeRepository.save(emp);
        log.info("Employee updated: empId={}, id={}", newEmpId, updated.getId());
        // --- Update the mirrored app_user row ---
        syncToAppUser(updated);
        // If empId changed, delete the old app_user row (syncToAppUser creates a new
        // one)
        if (!oldEmpId.equals(newEmpId)) {
            appUserRepository.findByEmployeeId(oldEmpId).ifPresent(oldUser -> {
                if (!oldUser.getEmployeeId().equals(newEmpId)) {
                    appUserRepository.delete(oldUser);
                }
            });
        }
        return toDto(updated);
    }
    // ── DELETE ───────────────────────────────────────────────────────────────
    @Transactional
    public void deleteEmployee(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: id=" + id));
        String empId = emp.getEmpId();
        // Remove from app_user first (FK safety)
        appUserRepository.findByEmployeeId(empId).ifPresent(appUserRepository::delete);
        employeeRepository.delete(emp);
        log.info("Employee deleted: empId={}, id={}", empId, id);
    }
    // ── SYNC HELPER ──────────────────────────────────────────────────────────
    /**
     * Mirror an Employee record into app_user so the Task system can assign
     * tasks to any employee without requiring manual app_user setup.
     *
     * Uses upsert logic: update if exists, insert if not.
     */
    private void syncToAppUser(Employee emp) {
        AppUser user = appUserRepository.findByEmployeeId(emp.getEmpId())
                .orElseGet(AppUser::new);
        user.setEmployeeId(emp.getEmpId());
        user.setFullName(emp.getName());
        user.setName(emp.getName());
        user.setEmail(emp.getEmail());
        user.setRole("EMPLOYEE");
        user.setDesignation(emp.getDesignation());
        user.setStatus("ACTIVE");
        appUserRepository.save(user);
        log.info("AppUser synced for empId={}", emp.getEmpId());
    }
    // ── DTO MAPPER ───────────────────────────────────────────────────────────
    private EmployeeResponseDto toDto(Employee e) {
        return new EmployeeResponseDto(
                e.getId(),
                e.getEmpId(),
                e.getName(),
                e.getEmail(),
                e.getDesignation(),
                e.getMonthlySalary(),
                e.isVerified(),
                e.getEmpCode(),
                e.getProfileImage());
    }
    // Add to EmployeeManagementService.java — make the sync method public:
    public void syncEmployeeToAppUser(Employee emp) {
        AppUser user = appUserRepository.findByEmployeeId(emp.getEmpId())
                .orElseGet(AppUser::new);
        user.setEmployeeId(emp.getEmpId());
        user.setFullName(emp.getName());
        user.setName(emp.getName());
        user.setEmail(emp.getEmail());
        user.setRole("EMPLOYEE");
        user.setDesignation(emp.getDesignation());
        user.setStatus("ACTIVE");
        appUserRepository.save(user);
        log.info("AppUser synced for empId={} (post-verification)", emp.getEmpId());
    }
}