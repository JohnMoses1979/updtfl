package com.blisssierra.hrms.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.blisssierra.hrms.dto.AddEmployeeRequest;
import com.blisssierra.hrms.entity.AppUser;
import com.blisssierra.hrms.repository.AppManagementRepository;

@Service
public class AppManagementService {

    private final AppManagementRepository appManagementRepository;

    public AppManagementService(AppManagementRepository appManagementRepository) {
        this.appManagementRepository = appManagementRepository;
    }

    public AppUser addEmployee(AddEmployeeRequest request) {
        if (request.getEmployeeId() == null || request.getEmployeeId().trim().isEmpty()) {
            throw new RuntimeException("Employee ID is required");
        }

        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full Name is required");
        }

        if (request.getRole() == null || request.getRole().trim().isEmpty()) {
            throw new RuntimeException("Role is required");
        }

        String employeeId = request.getEmployeeId().trim();
        if (appManagementRepository.existsByEmployeeId(employeeId)) {
            throw new RuntimeException("Employee ID already exists");
        }

        AppUser user = new AppUser();
        user.setEmployeeId(employeeId);
        user.setFullName(request.getFullName().trim());
        user.setEmail(
                request.getEmail() != null && !request.getEmail().trim().isEmpty()
                        ? request.getEmail().trim()
                        : employeeId.toLowerCase() + "@nhrms.local"
        );
        user.setRole(request.getRole().trim().toUpperCase());
        user.setDesignation(request.getDesignation());
        user.setSalary(request.getSalary());
        user.setJoinDate(request.getJoinDate());
        user.setStatus("ACTIVE");

        return appManagementRepository.save(user);
    }

    public List<AppUser> getAllEmployees() {
        return appManagementRepository.findAllByOrderByIdDesc();
    }
}
