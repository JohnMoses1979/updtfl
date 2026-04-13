package com.blisssierra.hrms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequestDto {
    private String email;
}