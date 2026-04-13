// package com.blisssierra.hrms.service;

// import com.blisssierra.hrms.entity.Salary;
// import com.blisssierra.hrms.repository.SalaryRepository;
// import com.blisssierra.hrms.repository.EmployeeRepository;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDate;

// @Service
// public class SalaryResetService {

//     private static final Logger log = LoggerFactory.getLogger(SalaryResetService.class);

//     @Autowired
//     private SalaryRepository salaryRepository;

//     @Autowired
//     private EmployeeRepository employeeRepository;

//     /**
//      * Runs at midnight on the 1st of every month.
//      * Creates fresh salary records for the new month for all employees.
//      * Old month records are preserved for payslip history.
//      */
//     @Scheduled(cron = "0 0 0 1 * *")
//     @Transactional
//     public void resetMonthlySalaries() {
//         LocalDate now = LocalDate.now();
//         int month = now.getMonthValue();
//         int year = now.getYear();
//         log.info("Monthly salary reset triggered for {}/{}", month, year);

//         employeeRepository.findAll().forEach(employee -> {
//             // Only create if not already exists for this month
//             boolean exists = salaryRepository
//                     .findByEmployeeIdAndMonthAndYear(employee.getId(), month, year)
//                     .isPresent();
//             if (!exists) {
//                 Salary s = new Salary();
//                 s.setEmployeeId(employee.getId());
//                 s.setMonth(month);
//                 s.setYear(year);
//                 s.setGrossSalary(employee.getMonthlySalary()); // default gross from employee record
//                 s.setEarnedSalary(0);
//                 s.setPresentDays(0);
//                 salaryRepository.save(s);
//                 log.info("  Created fresh salary record for empId={} {}/{}", employee.getEmpId(), month, year);
//             }
//         });
//     }
// }

// src/main/java/com/blisssierra/hrms/service/SalaryResetService.java
package com.blisssierra.hrms.service;

import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.entity.Salary;
import com.blisssierra.hrms.repository.EmployeeRepository;
import com.blisssierra.hrms.repository.SalaryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class SalaryResetService {

    private static final Logger log = LoggerFactory.getLogger(SalaryResetService.class);

    @Autowired
    private SalaryRepository salaryRepository;
    @Autowired
    private EmployeeRepository employeeRepository;

    /**
     * Runs at midnight on the 1st of every month.
     *
     * 1. Ensures the PREVIOUS month's salary record is finalized (payroll
     * generated).
     * 2. Creates a fresh salary record for the NEW month for all employees.
     *
     * Old month records are preserved for payslip history — we never delete them.
     */
    @Scheduled(cron = "0 0 0 1 * *")
    @Transactional
    public void processMonthEnd() {
        LocalDate now = LocalDate.now();

        // The month that just ended
        LocalDate prevMonthDate = now.minusMonths(1);
        int prevMonth = prevMonthDate.getMonthValue();
        int prevYear = prevMonthDate.getYear();

        // The new month starting today
        int newMonth = now.getMonthValue();
        int newYear = now.getYear();

        log.info("=== Month-end payroll processing: finalizing {}/{}, creating {}/{} ===",
                prevMonth, prevYear, newMonth, newYear);

        for (Employee employee : employeeRepository.findAll()) {
            Long empId = employee.getId();

            // ── 1. Finalize previous month (mark grossSalary from employee record) ──
            salaryRepository.findByEmployeeIdAndMonthAndYear(empId, prevMonth, prevYear)
                    .ifPresent(prev -> {
                        if (prev.getGrossSalary() == 0 && employee.getMonthlySalary() > 0) {
                            prev.setGrossSalary(employee.getMonthlySalary());
                            salaryRepository.save(prev);
                        }
                        log.info("  ✅ Finalized payroll for empId={} {}/{}: earned={}",
                                employee.getEmpId(), prevMonth, prevYear, prev.getEarnedSalary());
                    });

            // ── 2. Create fresh record for new month (if not already exists) ──────
            boolean exists = salaryRepository
                    .findByEmployeeIdAndMonthAndYear(empId, newMonth, newYear)
                    .isPresent();

            if (!exists) {
                Salary fresh = new Salary();
                fresh.setEmployeeId(empId);
                fresh.setMonth(newMonth);
                fresh.setYear(newYear);
                fresh.setGrossSalary(employee.getMonthlySalary());
                fresh.setEarnedSalary(0);
                fresh.setPresentDays(0);
                salaryRepository.save(fresh);
                log.info("  🆕 Created fresh salary record for empId={} {}/{}",
                        employee.getEmpId(), newMonth, newYear);
            }
        }

        log.info("=== Month-end processing complete ===");
    }

    /**
     * Manual trigger endpoint — call this from PayrollController if you want
     * an admin-triggered month close. Same logic as scheduled run.
     */
    @Transactional
    public void resetMonthlySalaries() {
        processMonthEnd();
    }
}