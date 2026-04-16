// package com.blisssierra.hrms.controller;
// // src/main/java/com/blisssierra/hrms/controller/EmployeeController.java
// import java.util.List;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.PutMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.blisssierra.hrms.dto.EmployeeRequestDto;
// import com.blisssierra.hrms.dto.EmployeeResponseDto;
// import com.blisssierra.hrms.dto.ProfileUpdateRequest;
// import com.blisssierra.hrms.entity.Employee;
// import com.blisssierra.hrms.repository.EmployeeRepository;
// import com.blisssierra.hrms.service.EmployeeManagementService;

// import jakarta.validation.Valid;

// @RestController
// @RequestMapping("/api/employees")
// @CrossOrigin(origins = "*")
// public class EmployeeController {
//     private static final Logger log = LoggerFactory.getLogger(EmployeeController.class);
//     @Autowired
//     private EmployeeManagementService employeeManagementService;
//     @Autowired
//     private EmployeeRepository employeeRepository;
//     // GET /api/employees
//     @GetMapping
//     public ResponseEntity<List<EmployeeResponseDto>> getAllEmployees() {
//         log.info("GET /api/employees");
//         return ResponseEntity.ok(employeeManagementService.getAllEmployees());
//     }
//     // GET /api/employees/{id}
//     @GetMapping("/{id}")
//     public ResponseEntity<EmployeeResponseDto> getEmployeeById(@PathVariable Long id) {
//         log.info("GET /api/employees/{}", id);
//         return ResponseEntity.ok(employeeManagementService.getEmployeeById(id));
//     }
//     // POST /api/employees
//     @PostMapping
//     public ResponseEntity<EmployeeResponseDto> createEmployee(
//             @Valid @RequestBody EmployeeRequestDto request) {
//         log.info("POST /api/employees empId={}", request.getEmpId());
//         return ResponseEntity.ok(employeeManagementService.createEmployee(request));
//     }
//     // PUT /api/employees/{id}
//     @PutMapping("/{id}")
//     public ResponseEntity<EmployeeResponseDto> updateEmployee(
//             @PathVariable Long id,
//             @Valid @RequestBody EmployeeRequestDto request) {
//         log.info("PUT /api/employees/{}", id);
//         return ResponseEntity.ok(employeeManagementService.updateEmployee(id, request));
//     }
//     // DELETE /api/employees/{id}
//     @DeleteMapping("/{id}")
//     public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
//         log.info("DELETE /api/employees/{}", id);
//         employeeManagementService.deleteEmployee(id);
//         return ResponseEntity.noContent().build();
//     }
//     // GET /api/employees/by-empid/{empId}
//     @GetMapping("/by-empid/{empId}")
//     public ResponseEntity<EmployeeResponseDto> getByEmpId(@PathVariable String empId) {
//         log.info("GET /api/employees/by-empid/{}", empId);
//         Employee emp = employeeRepository.findByEmpId(empId.trim().toUpperCase())
//                 .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));
//         return ResponseEntity.ok(employeeManagementService.getEmployeeById(emp.getId()));
//     }
//     // PUT /api/employees/profile/{empId}
//     @PutMapping("/profile/{empId}")
//     public ResponseEntity<EmployeeResponseDto> updateProfile(
//             @PathVariable String empId,
//             @RequestBody ProfileUpdateRequest req) {
//         log.info("PUT /api/employees/profile/{}", empId);
//         Employee emp = employeeRepository.findByEmpId(empId.trim().toUpperCase())
//                 .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));
//         String firstName = req.getFirstName() != null ? req.getFirstName().trim() : "";
//         String lastName = req.getLastName() != null ? req.getLastName().trim() : "";
//         String fullName = (firstName + " " + lastName).trim();
//         if (!fullName.isEmpty())
//             emp.setName(fullName);
//         if (req.getDesignation() != null && !req.getDesignation().isBlank())
//             emp.setDesignation(req.getDesignation().trim());
//         if (req.getAvatarUri() != null)
//             emp.setProfileImage(req.getAvatarUri());
//         employeeRepository.save(emp);
//         employeeManagementService.syncEmployeeToAppUser(emp);
//         return ResponseEntity.ok(employeeManagementService.getEmployeeById(emp.getId()));
//     }
// }

package com.blisssierra.hrms.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blisssierra.hrms.dto.EmployeeRequestDto;
import com.blisssierra.hrms.dto.EmployeeResponseDto;
import com.blisssierra.hrms.dto.NotificationDto;
import com.blisssierra.hrms.dto.ProfileUpdateRequest;
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.repository.EmployeeRepository;
import com.blisssierra.hrms.service.AdminNotificationService;
import com.blisssierra.hrms.service.EmployeeManagementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {
    private static final Logger log = LoggerFactory.getLogger(EmployeeController.class);

    @Autowired
    private EmployeeManagementService employeeManagementService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AdminNotificationService adminNotificationService;

    // GET /api/employees
    @GetMapping
    public ResponseEntity<List<EmployeeResponseDto>> getAllEmployees() {
        log.info("GET /api/employees");
        return ResponseEntity.ok(employeeManagementService.getAllEmployees());
    }

    // GET /api/employees/{id}
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> getEmployeeById(@PathVariable Long id) {
        log.info("GET /api/employees/{}", id);
        return ResponseEntity.ok(employeeManagementService.getEmployeeById(id));
    }

    // POST /api/employees
    @PostMapping
    public ResponseEntity<EmployeeResponseDto> createEmployee(
            @Valid @RequestBody EmployeeRequestDto request) {
        log.info("POST /api/employees empId={}", request.getEmpId());
        return ResponseEntity.ok(employeeManagementService.createEmployee(request));
    }

    // PUT /api/employees/{id}
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequestDto request) {
        log.info("PUT /api/employees/{}", id);
        return ResponseEntity.ok(employeeManagementService.updateEmployee(id, request));
    }

    // DELETE /api/employees/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        log.info("DELETE /api/employees/{}", id);
        employeeManagementService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/employees/by-empid/{empId}
    @GetMapping("/by-empid/{empId}")
    public ResponseEntity<EmployeeResponseDto> getByEmpId(@PathVariable String empId) {
        log.info("GET /api/employees/by-empid/{}", empId);
        Employee emp = employeeRepository.findByEmpId(empId.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));
        return ResponseEntity.ok(employeeManagementService.getEmployeeById(emp.getId()));
    }

    // PUT /api/employees/profile/{empId}
    @PutMapping("/profile/{empId}")
    public ResponseEntity<EmployeeResponseDto> updateProfile(
            @PathVariable String empId,
            @RequestBody ProfileUpdateRequest req) {
        log.info("PUT /api/employees/profile/{}", empId);
        Employee emp = employeeRepository.findByEmpId(empId.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));

        String firstName = req.getFirstName() != null ? req.getFirstName().trim() : "";
        String lastName = req.getLastName() != null ? req.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        if (!fullName.isEmpty())
            emp.setName(fullName);
        if (req.getDesignation() != null && !req.getDesignation().isBlank())
            emp.setDesignation(req.getDesignation().trim());
        if (req.getAvatarUri() != null)
            emp.setProfileImage(req.getAvatarUri());
        employeeRepository.save(emp);
        employeeManagementService.syncEmployeeToAppUser(emp);
        return ResponseEntity.ok(employeeManagementService.getEmployeeById(emp.getId()));
    }

    // ── ISSUE 1 FIX: Admin Approval Endpoints ────────────────────────────────

    /**
     * PUT /api/employees/{id}/approve
     * Admin approves an employee — they can now log in.
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveEmployee(@PathVariable Long id) {
        log.info("PUT /api/employees/{}/approve", id);
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: id=" + id));
        emp.setApproved(true);
        employeeRepository.save(emp);
        adminNotificationService.createApprovalActionNotification(emp, true);
        log.info("✅ Employee approved: empId={}", emp.getEmpId());
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Employee " + emp.getName() + " has been approved",
                "employeeId", emp.getId(),
                "empId", emp.getEmpId()));
    }

    /**
     * PUT /api/employees/{id}/reject
     * Admin rejects an employee signup — deletes the record.
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectEmployee(@PathVariable Long id) {
        log.info("PUT /api/employees/{}/reject", id);
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: id=" + id));
        String empId = emp.getEmpId();
        String name = emp.getName();
        adminNotificationService.createApprovalActionNotification(emp, false);
        employeeRepository.delete(emp);
        log.info("❌ Employee rejected and deleted: empId={}", empId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Employee " + name + " has been rejected and removed"));
    }

    /**
     * GET /api/employees/pending-approval
     * Returns all employees who have verified their email but are not yet approved.
     * Used by admin notification panel.
     */
    @GetMapping("/pending-approval")
    public ResponseEntity<List<NotificationDto>> getPendingApproval() {
        log.info("GET /api/employees/pending-approval");
        return ResponseEntity.ok(adminNotificationService.getActiveSignupNotifications());
    }

    /**
     * GET /api/employees/admin-notifications
     * Combined: pending approvals + system notifications for admin.
     */
    @GetMapping("/admin-notifications")
    public ResponseEntity<List<NotificationDto>> getAdminNotifications() {
        log.info("GET /api/employees/admin-notifications");
        return ResponseEntity.ok(adminNotificationService.getActiveNotifications());
    }

    @GetMapping("/admin-notifications/history")
    public ResponseEntity<List<NotificationDto>> getAdminNotificationHistory() {
        log.info("GET /api/employees/admin-notifications/history");
        return ResponseEntity.ok(adminNotificationService.getHistoryNotifications());
    }

    @PutMapping("/admin-notifications/{notificationId}/read")
    public ResponseEntity<?> markAdminNotificationAsRead(@PathVariable Long notificationId) {
        log.info("PUT /api/employees/admin-notifications/{}/read", notificationId);
        adminNotificationService.markAsRead(notificationId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Notification marked as read",
                "notificationId", notificationId));
    }
}
