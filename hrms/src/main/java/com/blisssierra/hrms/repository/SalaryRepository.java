// src/main/java/com/blisssierra/hrms/repository/SalaryRepository.java
package com.blisssierra.hrms.repository;

import com.blisssierra.hrms.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long> {

    Optional<Salary> findByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);

    // All salary records for an employee (for PayrollHistory screen)
    List<Salary> findByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);

    // All records for a given month/year (for admin payroll view)
    List<Salary> findByMonthAndYear(int month, int year);
}