// package com.blisssierra.hrms.repository;
// import com.blisssierra.hrms.entity.Employee;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;
// import java.util.Optional;
// @Repository
// public interface EmployeeRepository extends JpaRepository<Employee, Long> {
//     Optional<Employee> findByEmail(String email);
//     Optional<Employee> findByEmpId(String empId);
//     boolean existsByEmail(String email);
//     boolean existsByEmpId(String empId);
//     /**
//      * Find by short employee code (e.g. "BSS001").
//      * Sourced from Project B.
//      */
//     Optional<Employee> findByEmpCode(String empCode);
// }

package com.blisssierra.hrms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.blisssierra.hrms.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmpId(String empId);

    boolean existsByEmail(String email);

    boolean existsByEmpId(String empId);

    Optional<Employee> findByEmpCode(String empCode);

    // ISSUE 1 FIX: Find employees pending admin approval
    List<Employee> findByVerifiedTrueAndApprovedFalse();

    // Find all unverified employees
    List<Employee> findByVerifiedFalse();
}