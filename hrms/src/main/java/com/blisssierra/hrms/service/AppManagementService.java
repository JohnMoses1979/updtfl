package com.blisssierra.hrms.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.blisssierra.hrms.dto.AddEmployeeRequest;
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.repository.EmployeeRepository;

@Service
public class AppManagementService {

    private final EmployeeRepository employeeRepository;

    public AppManagementService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee addEmployee(AddEmployeeRequest request) {
        if (request.getEmployeeId() == null || request.getEmployeeId().trim().isEmpty()) {
            throw new RuntimeException("Employee ID is required");
        }
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full Name is required");
        }

        String employeeId = request.getEmployeeId().trim().toUpperCase();
        String email = request.getEmail() != null && !request.getEmail().trim().isEmpty()
                ? request.getEmail().trim().toLowerCase()
                : employeeId.toLowerCase() + "@nhrms.local";

        if (employeeRepository.existsByEmpId(employeeId)) {
            throw new RuntimeException("Employee ID already exists");
        }
        if (employeeRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        Employee employee = new Employee();
        employee.setEmpId(employeeId);
        employee.setEmpCode(employeeId);
        employee.setName(request.getFullName().trim());
        employee.setEmail(email);
        employee.setRole(normalizeRole(request.getRole()));
        employee.setDesignation(request.getDesignation() != null ? request.getDesignation().trim() : null);
        employee.setMonthlySalary(request.getSalary() != null ? request.getSalary().doubleValue() : 0.0);
        employee.setJoinDate(request.getJoinDate());
        employee.setStatus("ACTIVE");
        employee.setVerified(true);
        employee.setApproved(true);
        employee.setPassword("changeme123");

        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    private String normalizeRole(String inputRole) {
        if (inputRole == null || inputRole.trim().isEmpty()) {
            return "ROLE_EMPLOYEE";
        }
        String role = inputRole.trim().toUpperCase();
        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }
}
