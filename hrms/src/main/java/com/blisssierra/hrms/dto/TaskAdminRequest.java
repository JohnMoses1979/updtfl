package com.blisssierra.hrms.dto;

 
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskAdminRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Assignee id is required")
    private Long assigneeId;

    private String assigneeName;

    private String assigneeEmployeeId;

    private String dueText;

    @NotBlank(message = "Priority is required")
    private String priority;

    private String status;
}
