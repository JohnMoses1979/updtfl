package com.blisssierra.hrms.controller;

import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.entity.Salary;
import com.blisssierra.hrms.repository.EmployeeRepository;
import com.blisssierra.hrms.repository.SalaryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * SeedController - Standalone controller for seeding test salary data.
 * Uses a completely separate base path /api/seed to avoid any conflicts.
 * 
 * TEST ENDPOINTS:
 * GET /api/seed/health → check if this controller is reachable
 * GET /api/seed/salary/{empId} → seed salary data for one employee
 * GET /api/seed/salary-all → seed salary data for ALL employees
 */
@RestController
@RequestMapping("/api/seed")
@CrossOrigin(origins = "*")
public class SeedController {

    private static final Logger log = LoggerFactory.getLogger(SeedController.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SalaryRepository salaryRepository;

    // ── Health check — open this in browser to confirm controller works ───────
    // GET http://YOUR_IP:8080/api/seed/health
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "SeedController is running. Use GET /api/seed/salary/{empId} to seed data."));
    }

    // ── Seed one employee by empId string ─────────────────────────────────────
    // GET http://YOUR_IP:8080/api/seed/salary/BSSE025
    // You can open this directly in your phone browser!
    @GetMapping("/salary/{empId}")
    public ResponseEntity<?> seedOneEmployee(@PathVariable String empId) {
        log.info("GET /api/seed/salary/{}", empId);

        String normalizedId = empId.trim().toUpperCase();
        Employee employee = employeeRepository.findByEmpId(normalizedId).orElse(null);

        if (employee == null) {
            // Try case-insensitive search
            List<Employee> all = employeeRepository.findAll();
            for (Employee e : all) {
                if (e.getEmpId() != null && e.getEmpId().equalsIgnoreCase(normalizedId)) {
                    employee = e;
                    break;
                }
            }
        }

        if (employee == null) {
            List<Employee> all = employeeRepository.findAll();
            List<String> ids = new ArrayList<>();
            for (Employee e : all)
                ids.add(e.getEmpId());
            return ResponseEntity.ok(Map.of(
                    "status", "error",
                    "message", "Employee not found: " + empId,
                    "availableEmpIds", ids));
        }

        List<Map<String, Object>> seeded = seedForEmployee(employee);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Salary data seeded for " + employee.getName(),
                "employeeId", employee.getId(),
                "empId", employee.getEmpId(),
                "records", seeded));
    }

    // ── Seed ALL employees at once ────────────────────────────────────────────
    // GET http://YOUR_IP:8080/api/seed/salary-all
    @GetMapping("/salary-all")
    public ResponseEntity<?> seedAllEmployees() {
        log.info("GET /api/seed/salary-all");

        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "status", "error",
                    "message", "No employees found in database"));
        }

        List<Map<String, Object>> results = new ArrayList<>();
        for (Employee employee : employees) {
            List<Map<String, Object>> seeded = seedForEmployee(employee);
            results.add(Map.of(
                    "empId", employee.getEmpId(),
                    "name", employee.getName(),
                    "recordsCreated", seeded.size(),
                    "records", seeded));
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Salary data seeded for " + employees.size() + " employees",
                "results", results));
    }

    // ── List all employees (to find correct empId) ────────────────────────────
    // GET http://YOUR_IP:8080/api/seed/employees
    @GetMapping("/employees")
    public ResponseEntity<?> listEmployees() {
        List<Employee> all = employeeRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Employee e : all) {
            result.add(Map.of(
                    "id", e.getId(),
                    "empId", e.getEmpId() != null ? e.getEmpId() : "null",
                    "name", e.getName() != null ? e.getName() : "null",
                    "monthlySalary", e.getMonthlySalary()));
        }
        return ResponseEntity.ok(Map.of(
                "count", all.size(),
                "employees", result));
    }

    // ── Core seeding logic ────────────────────────────────────────────────────
    private List<Map<String, Object>> seedForEmployee(Employee employee) {
        LocalDate now = LocalDate.now();
        // Present days for last 3 months + current month
        int[] presentDays = { 22, 20, 24, 15 };
        double grossSalary = employee.getMonthlySalary() > 0 ? employee.getMonthlySalary() : 19000.0;

        List<Map<String, Object>> created = new ArrayList<>();

        for (int i = 3; i >= 0; i--) {
            LocalDate targetMonth = now.minusMonths(i);
            int month = targetMonth.getMonthValue();
            int year = targetMonth.getYear();
            int days = presentDays[3 - i];
            double earned = days * 612.0;

            boolean exists = salaryRepository
                    .findByEmployeeIdAndMonthAndYear(employee.getId(), month, year)
                    .isPresent();

            String action;
            if (!exists) {
                Salary s = new Salary();
                s.setEmployeeId(employee.getId());
                s.setMonth(month);
                s.setYear(year);
                s.setGrossSalary(grossSalary);
                s.setEarnedSalary(earned);
                s.setPresentDays(days);
                salaryRepository.save(s);
                action = "CREATED";
                log.info("  Seeded: empId={} {}/{} days={} earned={}",
                        employee.getEmpId(), month, year, days, earned);
            } else {
                action = "ALREADY_EXISTS (skipped)";
                log.info("  Skipped: empId={} {}/{} already exists",
                        employee.getEmpId(), month, year);
            }

            created.add(Map.of(
                    "month", month,
                    "year", year,
                    "presentDays", days,
                    "earnedSalary", earned,
                    "grossSalary", grossSalary,
                    "action", action));
        }

        return created;
    }
}