package com.blisssierra.hrms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AppUserRequest {

    @NotBlank(message = "Employee id is required")
    private String employeeId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String email;

    @NotBlank(message = "Role is required")
    private String role;

    private String designation;

    private BigDecimal salary;

    private String joinDate;

    private String status;
}
