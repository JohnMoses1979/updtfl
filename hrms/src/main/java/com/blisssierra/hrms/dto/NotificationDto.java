package com.blisssierra.hrms.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Notification DTO for admin notifications (signup requests, system alerts).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String type; // "SIGNUP_REQUEST", "SYSTEM", "MESSAGE"
    private String title;
    private String body;
    private boolean isRead;
    private LocalDateTime createdAt;

    // For signup requests
    private Long employeeId; // Employee.id (numeric PK)
    private String employeeName;
    private String employeeEmpId;
    private String employeeEmail;
    private String designation;
}