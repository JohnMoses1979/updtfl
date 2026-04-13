// src/main/java/com/blisssierra/hrms/dto/SalaryResponseDto.java
package com.blisssierra.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryResponseDto {
    private Long id;
    private Long employeeId;
    private int month;
    private int year;
    private double grossSalary;
    private double earnedSalary;
    private int presentDays;

    // Full breakdown fields for SalaryBreakdown screen
    private double basicSalary;
    private double hra;
    private double transport;
    private double specialAllowance;
    private double epf;
    private double insurance;
    private double totalDeductions;
    private double netPay;
}