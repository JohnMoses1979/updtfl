package com.blisssierra.hrms.entity;

 
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tasks")
@Getter
@Setter
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_code", nullable = false, unique = true, length = 30)
    private String taskCode;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "assignee_id", nullable = false)
    private Long assigneeId;

    @Column(name = "assignee_name", nullable = false, length = 120)
    private String assigneeName;

    @Column(name = "assignee_employee_id", nullable = false, length = 50)
    private String assigneeEmployeeId;

    @Column(name = "due_text", length = 50)
    private String dueText;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "progress", nullable = false)
    private Integer progress = 0;

    @Column(name = "comments_count", nullable = false)
    private Integer commentsCount = 0;

    @Column(name = "admin_update_pending_for_user", nullable = false)
    private Boolean adminUpdatePendingForUser = true;

    @Column(name = "user_update_pending_for_admin", nullable = false)
    private Boolean userUpdatePendingForAdmin = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
