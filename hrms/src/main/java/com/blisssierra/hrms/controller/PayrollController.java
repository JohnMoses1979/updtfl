// package com.blisssierra.hrms.controller;

// import com.blisssierra.hrms.dto.AttendanceRecordDto;
// import com.blisssierra.hrms.dto.ApiResponseDto;
// import com.blisssierra.hrms.dto.SalaryResponseDto;
// import com.blisssierra.hrms.service.AttendanceApiService;
// import com.blisssierra.hrms.service.SalaryService;
// import com.blisssierra.hrms.repository.EmployeeRepository;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.Optional;

// /**
//  * PayrollController
//  *
//  * Exposes Project B's attendance check-in/check-out (by empId string)
//  * and salary query endpoints under /api/payroll/** to avoid conflicts
//  * with Project A's existing /api/attendance/** routes.
//  *
//  * All business logic is delegated to AttendanceApiService (merged)
//  * and SalaryService — no duplicate beans.
//  *
//  * Endpoints:
//  * POST /api/payroll/checkin/{empId} — check in by empId string
//  * POST /api/payroll/checkout/{empId} — check out by empId string
//  * GET /api/payroll/salary/{employeeId} — current month salary by numeric DB id
//  */
// @RestController
// @RequestMapping("/api/payroll")
// @CrossOrigin(origins = "*")
// public class PayrollController {

//     private static final Logger log = LoggerFactory.getLogger(PayrollController.class);

//     @Autowired
//     private AttendanceApiService attendanceApiService;

//     @Autowired
//     private SalaryService salaryService;

//     @Autowired
//     private EmployeeRepository employeeRepository;

//     // ── POST /api/payroll/checkin/{empId} ────────────────────────────────────
//     @PostMapping("/checkin/{empId}")
//     public ResponseEntity<?> checkIn(@PathVariable String empId) {
//         log.info("POST /api/payroll/checkin/{}", empId);
//         if (empId == null || empId.isBlank()) {
//             return ResponseEntity.badRequest()
//                     .body(new ApiResponseDto("error", "empId is required"));
//         }
//         AttendanceRecordDto record = attendanceApiService.recordCheckIn(empId);
//         return ResponseEntity.ok(record);
//     }

//     // ── POST /api/payroll/checkout/{empId} ───────────────────────────────────
//     @PostMapping("/checkout/{empId}")
//     public ResponseEntity<?> checkOut(@PathVariable String empId) {
//         log.info("POST /api/payroll/checkout/{}", empId);
//         if (empId == null || empId.isBlank()) {
//             return ResponseEntity.badRequest()
//                     .body(new ApiResponseDto("error", "empId is required"));
//         }
//         Optional<AttendanceRecordDto> result = attendanceApiService.recordCheckOut(empId);
//         if (result.isEmpty()) {
//             return ResponseEntity.ok(
//                     new ApiResponseDto("error",
//                             "No check-in record found for today. Please check in first."));
//         }
//         return ResponseEntity.ok(result.get());
//     }

//     // ── GET /api/payroll/salary/{employeeId} ─────────────────────────────────
//     /**
//      * Returns current month salary for an employee by their numeric DB id (Long).
//      * To look up by empId string, use GET /api/payroll/salary/by-emp/{empId}
//      */
//     @GetMapping("/salary/{employeeId}")
//     public ResponseEntity<?> getSalaryByNumericId(@PathVariable Long employeeId) {
//         log.info("GET /api/payroll/salary/{}", employeeId);
//         SalaryResponseDto dto = salaryService.getCurrentMonthSalary(employeeId);
//         return ResponseEntity.ok(dto);
//     }

//     // ── GET /api/payroll/salary/by-emp/{empId} ───────────────────────────────
//     /**
//      * Convenience endpoint: look up salary by empId string (e.g. "EMP001").
//      * Resolves empId → numeric DB id → delegates to SalaryService.
//      */
//     @GetMapping("/salary/by-emp/{empId}")
//     public ResponseEntity<?> getSalaryByEmpId(@PathVariable String empId) {
//         log.info("GET /api/payroll/salary/by-emp/{}", empId);
//         return employeeRepository.findByEmpId(empId.trim().toUpperCase())
//                 .map(emp -> ResponseEntity.ok(
//                         (Object) salaryService.getCurrentMonthSalary(emp.getId())))
//                 .orElseGet(() -> ResponseEntity.badRequest()
//                         .body(new ApiResponseDto("error", "Employee not found: " + empId)));
//     }
// }

// src/main/java/com/blisssierra/hrms/controller/PayrollController.java
package com.blisssierra.hrms.controller;

import com.blisssierra.hrms.dto.AttendanceRecordDto;
import com.blisssierra.hrms.dto.ApiResponseDto;
import com.blisssierra.hrms.dto.SalaryResponseDto;
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.entity.Salary;
import com.blisssierra.hrms.service.AttendanceApiService;
import com.blisssierra.hrms.service.SalaryResetService;
import com.blisssierra.hrms.service.SalaryService;
import com.blisssierra.hrms.repository.EmployeeRepository;
import com.blisssierra.hrms.repository.SalaryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
public class PayrollController {

    private static final Logger log = LoggerFactory.getLogger(PayrollController.class);

    @Autowired
    private AttendanceApiService attendanceApiService;
    @Autowired
    private SalaryService salaryService;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private SalaryRepository salaryRepository;

    // Add to PayrollController.java
    @Autowired
    private SalaryResetService salaryResetService;

    // ── Existing endpoints (unchanged) ───────────────────────────────────────

    @PostMapping("/checkin/{empId}")
    public ResponseEntity<?> checkIn(@PathVariable String empId) {
        log.info("POST /api/payroll/checkin/{}", empId);
        if (empId == null || empId.isBlank())
            return ResponseEntity.badRequest().body(new ApiResponseDto("error", "empId is required"));
        AttendanceRecordDto record = attendanceApiService.recordCheckIn(empId);
        return ResponseEntity.ok(record);
    }

    @PostMapping("/checkout/{empId}")
    public ResponseEntity<?> checkOut(@PathVariable String empId) {
        log.info("POST /api/payroll/checkout/{}", empId);
        if (empId == null || empId.isBlank())
            return ResponseEntity.badRequest().body(new ApiResponseDto("error", "empId is required"));
        Optional<AttendanceRecordDto> result = attendanceApiService.recordCheckOut(empId);
        if (result.isEmpty())
            return ResponseEntity.ok(new ApiResponseDto("error", "No check-in record found for today."));
        return ResponseEntity.ok(result.get());
    }

    // ── GET current month salary by numeric DB id ─────────────────────────────

    @GetMapping("/salary/{employeeId}")
    public ResponseEntity<?> getSalaryByNumericId(@PathVariable Long employeeId) {
        log.info("GET /api/payroll/salary/{}", employeeId);
        SalaryResponseDto dto = salaryService.getCurrentMonthSalary(employeeId);
        return ResponseEntity.ok(dto);
    }

    // ── GET salary by empId string ────────────────────────────────────────────

    @GetMapping("/salary/by-emp/{empId}")
    public ResponseEntity<?> getSalaryByEmpId(@PathVariable String empId) {
        log.info("GET /api/payroll/salary/by-emp/{}", empId);
        return employeeRepository.findByEmpId(empId.trim().toUpperCase())
                .map(emp -> ResponseEntity.ok((Object) salaryService.getCurrentMonthSalary(emp.getId())))
                .orElseGet(() -> ResponseEntity.badRequest()
                        .body(new ApiResponseDto("error", "Employee not found: " + empId)));
    }

    // ── NEW: GET full salary history for an employee ──────────────────────────
    // Used by PayrollHistory.js frontend screen

    @GetMapping("/history/{employeeId}")
    public ResponseEntity<?> getSalaryHistory(@PathVariable Long employeeId) {
        log.info("GET /api/payroll/history/{}", employeeId);
        List<Salary> records = salaryRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);
        List<Map<String, Object>> result = records.stream()
                .map(s -> Map.<String, Object>of(
                        "id", s.getId(),
                        "month", s.getMonth(),
                        "monthName", Month.of(s.getMonth()).name(),
                        "year", s.getYear(),
                        "grossSalary", s.getGrossSalary(),
                        "earnedSalary", s.getEarnedSalary(),
                        "presentDays", s.getPresentDays()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ── NEW: GET all employees payroll for a specific month (admin view) ──────

    @GetMapping("/admin/monthly")
    public ResponseEntity<?> getMonthlyPayroll(
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {
        LocalDate now = LocalDate.now();
        int m = month > 0 ? month : now.getMonthValue();
        int y = year > 0 ? year : now.getYear();
        log.info("GET /api/payroll/admin/monthly month={} year={}", m, y);

        List<Salary> records = salaryRepository.findByMonthAndYear(m, y);
        List<Map<String, Object>> result = records.stream().map(s -> {
            String empName = employeeRepository.findById(s.getEmployeeId())
                    .map(Employee::getName).orElse("Unknown");
            String empCode = employeeRepository.findById(s.getEmployeeId())
                    .map(e -> e.getEmpCode() != null ? e.getEmpCode() : e.getEmpId())
                    .orElse("-");
            double earned = s.getEarnedSalary();
            double epf = 900.0;
            double insurance = 200.0;
            double netPay = earned - epf - insurance;
            return Map.<String, Object>of(
                    "id", s.getId(),
                    "employeeId", s.getEmployeeId(),
                    "employeeName", empName,
                    "empCode", empCode,
                    "month", s.getMonth(),
                    "year", s.getYear(),
                    "grossSalary", s.getGrossSalary(),
                    "earnedSalary", earned,
                    "presentDays", s.getPresentDays(),
                    "netSalary", Math.max(0, netPay));
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── NEW: Salary breakdown endpoint for SalaryBreakdown.js ────────────────

    @GetMapping("/breakdown/{employeeId}")
    public ResponseEntity<?> getSalaryBreakdown(
            @PathVariable Long employeeId,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {

        LocalDate now = LocalDate.now();
        // Default to last month (payroll is typically for last month)
        LocalDate target = month > 0 && year > 0
                ? LocalDate.of(year, month, 1)
                : now.minusMonths(1);

        int m = target.getMonthValue();
        int y = target.getYear();

        log.info("GET /api/payroll/breakdown/{} month={} year={}", employeeId, m, y);

        Optional<Salary> salaryOpt = salaryRepository.findByEmployeeIdAndMonthAndYear(employeeId, m, y);
        if (salaryOpt.isEmpty() || salaryOpt.get().getEarnedSalary() == 0) {
            return ResponseEntity.ok(Map.of(
                    "message", "No salary data for " + Month.of(m).name() + " " + y,
                    "earnedSalary", 0,
                    "grossSalary", 0,
                    "netPay", 0,
                    "earningsBreakdown", List.of(),
                    "deductionsBreakdown", List.of()));
        }

        Salary s = salaryOpt.get();
        double earned = s.getEarnedSalary();
        double basic = earned * 0.50;
        double hra = earned * 0.20;
        double transport = earned * 0.10;
        double special = earned * 0.20;
        double epf = 900.0;
        double insurance = 200.0;
        double totalDeductions = epf + insurance;
        double netPay = earned - totalDeductions;

        return ResponseEntity.ok(Map.of(
                "grossSalary", s.getGrossSalary(),
                "earnedSalary", earned,
                "presentDays", s.getPresentDays(),
                "month", m,
                "year", y,
                "deductions", totalDeductions,
                "netPay", Math.max(0, netPay),
                "earningsBreakdown", List.of(
                        Map.of("label", "Basic Salary (50%)", "amount", basic),
                        Map.of("label", "HRA (20%)", "amount", hra),
                        Map.of("label", "Transport (10%)", "amount", transport),
                        Map.of("label", "Special Allowance (20%)", "amount", special)),
                "deductionsBreakdown", List.of(
                        Map.of("label", "EPF", "amount", epf),
                        Map.of("label", "Insurance", "amount", insurance))));
    }

    /**
     * POST /api/payroll/admin/close-month
     * Admin can manually trigger month-end payroll processing.
     */
    @PostMapping("/admin/close-month")
    public ResponseEntity<?> closeMonth() {
        log.info("POST /api/payroll/admin/close-month — manual trigger");
        try {
            salaryResetService.resetMonthlySalaries();
            return ResponseEntity.ok(new ApiResponseDto("success", "Month-end payroll processed successfully"));
        } catch (Exception e) {
            log.error("Month close failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponseDto("error", e.getMessage()));
        }
    }

    // /**
    //  * POST /api/payroll/admin/seed-test-data/{empId}
    //  * Seeds realistic salary data for demo/testing purposes.
    //  * Creates records for the last 3 months + current month.
    //  * REMOVE THIS IN PRODUCTION.
    //  */
    // @PostMapping("/seed-demo/{empId}")
    // public ResponseEntity<?> seedTestData(@PathVariable String empId) {
    //     log.info("POST /api/payroll/admin/seed-test-data/{}", empId);

    //     Employee employee = employeeRepository.findByEmpId(empId.trim().toUpperCase())
    //             .orElse(null);
    //     if (employee == null) {
    //         return ResponseEntity.badRequest()
    //                 .body(new ApiResponseDto("error", "Employee not found: " + empId));
    //     }

    //     LocalDate now = LocalDate.now();
    //     int[] presentDaysPerMonth = { 22, 20, 24, new java.util.Random().nextInt(10) + 5 };

    //     for (int i = 3; i >= 0; i--) {
    //         LocalDate targetMonth = now.minusMonths(i);
    //         int month = targetMonth.getMonthValue();
    //         int year = targetMonth.getYear();
    //         int days = presentDaysPerMonth[3 - i];

    //         // Only seed if no record exists
    //         if (salaryRepository.findByEmployeeIdAndMonthAndYear(employee.getId(), month, year).isEmpty()) {
    //             Salary s = new Salary();
    //             s.setEmployeeId(employee.getId());
    //             s.setMonth(month);
    //             s.setYear(year);
    //             s.setGrossSalary(employee.getMonthlySalary() > 0 ? employee.getMonthlySalary() : 19000.0);
    //             s.setEarnedSalary(days * 612.0);
    //             s.setPresentDays(days);
    //             salaryRepository.save(s);
    //             log.info("  Seeded: empId={} {}/{} days={} earned={}",
    //                     empId, month, year, days, days * 612.0);
    //         }
    //     }

    //     return ResponseEntity.ok(new ApiResponseDto("success",
    //             "Test salary data seeded for " + empId + " (last 4 months)"));
    // }
}