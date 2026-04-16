package com.blisssierra.hrms.dto;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Notification DTO for admin notifications (signup requests, system alerts).
 */
@Data
@NoArgsConstructor
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

    // For task/message click-through notifications
    private Long taskId;
    private String targetPage;
    private Long leaveId;
    private boolean active;

    public NotificationDto(
            Long id,
            String type,
            String title,
            String body,
            boolean isRead,
            LocalDateTime createdAt,
            Long employeeId,
            String employeeName,
            String employeeEmpId,
            String employeeEmail,
            String designation,
            Long taskId,
            String targetPage) {
        this(
                id,
                type,
                title,
                body,
                isRead,
                createdAt,
                employeeId,
                employeeName,
                employeeEmpId,
                employeeEmail,
                designation,
                taskId,
                targetPage,
                null,
                false);
    }

    public NotificationDto(
            Long id,
            String type,
            String title,
            String body,
            boolean isRead,
            LocalDateTime createdAt,
            Long employeeId,
            String employeeName,
            String employeeEmpId,
            String employeeEmail,
            String designation,
            Long taskId,
            String targetPage,
            Long leaveId,
            boolean active) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.body = body;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeeEmpId = employeeEmpId;
        this.employeeEmail = employeeEmail;
        this.designation = designation;
        this.taskId = taskId;
        this.targetPage = targetPage;
        this.leaveId = leaveId;
        this.active = active;
    }
}
