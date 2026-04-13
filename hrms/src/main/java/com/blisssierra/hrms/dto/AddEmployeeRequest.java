package com.blisssierra.hrms.dto;


import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AddEmployeeRequest {
    private String employeeId;
    private String fullName;
    private String email;
    private String role;
    private String designation;
    private BigDecimal salary;
    private LocalDate joinDate;

}
