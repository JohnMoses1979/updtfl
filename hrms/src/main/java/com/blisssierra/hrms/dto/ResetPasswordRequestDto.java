package com.blisssierra.hrms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequestDto {
    private String email;
    private String newPassword;
}