// src/main/java/com/blisssierra/hrms/controller/AppManagementController.java
package com.blisssierra.hrms.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blisssierra.hrms.dto.AddEmployeeRequest;
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.service.AppManagementService;

@RestController
@RequestMapping("/api/app-users") // ← renamed from /api/employees to avoid conflict
@CrossOrigin(origins = "*")
public class AppManagementController {

    private final AppManagementService appManagementService;

    public AppManagementController(AppManagementService appManagementService) {
        this.appManagementService = appManagementService;
    }

    @PostMapping
    public ResponseEntity<Employee> addEmployee(@RequestBody AddEmployeeRequest request) {
        return ResponseEntity.ok(appManagementService.addEmployee(request));
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getEmployees() {
        return ResponseEntity.ok(appManagementService.getAllEmployees());
    }
}
