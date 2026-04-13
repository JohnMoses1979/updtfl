// src/main/java/com/blisssierra/hrms/dto/EmployeeResponseDto.java
package com.blisssierra.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDto {
    private Long id;
    private String empId;
    private String name;
    private String email;
    private String designation;
    private double monthlySalary;
    private boolean verified;
    // empCode used by payslip system — same as empId for admin-created employees
    private String empCode;

    private String profileImage;
}