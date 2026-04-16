package com.blisssierra.hrms.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admin_notifications")
@Getter
@Setter
public class AdminNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_read", nullable = false)
    private Boolean read = false;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "employee_name", length = 120)
    private String employeeName;

    @Column(name = "employee_emp_id", length = 50)
    private String employeeEmpId;

    @Column(name = "employee_email", length = 150)
    private String employeeEmail;

    @Column(length = 120)
    private String designation;

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "leave_id")
    private Long leaveId;

    @Column(name = "target_page", length = 50)
    private String targetPage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (read == null) {
            read = false;
        }
        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
