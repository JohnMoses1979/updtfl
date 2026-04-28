package com.blisssierra.hrms.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blisssierra.hrms.dto.EmployeeRequestDto;
import com.blisssierra.hrms.dto.EmployeeResponseDto;
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.repository.EmployeeRepository;

@Service
public class EmployeeManagementService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeManagementService.class);
    private static final String DEFAULT_PASSWORD = "changeme123";

    @Autowired
    private EmployeeRepository employeeRepository;

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

        Employee emp = new Employee();
        emp.setEmpId(empId);
        emp.setEmpCode(empId);
        emp.setName(request.getName().trim());
        emp.setEmail(email);
        emp.setRole("ROLE_EMPLOYEE");
        emp.setDesignation(request.getDesignation().trim());
        emp.setPassword(
                request.getPassword() != null && !request.getPassword().isBlank()
                        ? request.getPassword().trim()
                        : DEFAULT_PASSWORD);
        emp.setMonthlySalary(request.getMonthlySalary() != null ? request.getMonthlySalary() : 0.0);
        emp.setVerified(true);
        emp.setApproved(true);
        emp.setStatus("ACTIVE");

        Employee saved = employeeRepository.save(emp);
        log.info("Employee created: empId={}, id={}", empId, saved.getId());
        return toDto(saved);
    }

    @Transactional
    public EmployeeResponseDto updateEmployee(Long id, EmployeeRequestDto request) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: id=" + id));

        String newEmpId = request.getEmpId().trim().toUpperCase();
        String newEmail = request.getEmail().trim().toLowerCase();

        if (!emp.getEmpId().equals(newEmpId) && employeeRepository.existsByEmpId(newEmpId)) {
            throw new RuntimeException("Employee ID already exists: " + newEmpId);
        }
        if (!emp.getEmail().equals(newEmail) && employeeRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email already registered: " + newEmail);
        }

        emp.setEmpId(newEmpId);
        emp.setEmpCode(newEmpId);
        emp.setName(request.getName().trim());
        emp.setEmail(newEmail);
        emp.setDesignation(request.getDesignation().trim());
        if (request.getMonthlySalary() != null) {
            emp.setMonthlySalary(request.getMonthlySalary());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            emp.setPassword(request.getPassword().trim());
        }

        Employee updated = employeeRepository.save(emp);
        log.info("Employee updated: empId={}, id={}", newEmpId, updated.getId());
        return toDto(updated);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: id=" + id));
        employeeRepository.delete(emp);
        log.info("Employee deleted: empId={}, id={}", emp.getEmpId(), id);
    }

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
}
