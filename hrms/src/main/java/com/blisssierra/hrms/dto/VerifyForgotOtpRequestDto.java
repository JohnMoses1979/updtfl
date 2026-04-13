package com.blisssierra.hrms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyForgotOtpRequestDto {
    private String email;
    private String otp;
}