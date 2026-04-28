package com.blisssierra.hrms.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponseDto {

    private String status;
    private String message;
    private Long userId;
    private String name;
    private String email;
    private String empId;
    private String designation;
    private String token;
    private String role;
    private Boolean biometricRequired;
}
