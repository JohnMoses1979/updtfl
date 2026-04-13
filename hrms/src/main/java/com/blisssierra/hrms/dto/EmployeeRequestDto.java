// src/main/java/com/blisssierra/hrms/dto/EmployeeRequestDto.java
package com.blisssierra.hrms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequestDto {

    @NotBlank(message = "Employee ID is required")
    private String empId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Designation is required")
    private String designation;

    // Optional — only required when creating a new employee (admin-created accounts
    // may not need face registration immediately)
    private String password;

    // Monthly CTC (e.g. 19000.0). Optional at creation time.
    private Double monthlySalary;
}