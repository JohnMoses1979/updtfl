package com.blisssierra.hrms.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import com.blisssierra.hrms.dto.ApiResponse;
import com.blisssierra.hrms.dto.NotificationDto;
import com.blisssierra.hrms.dto.TaskAdminRequest;
import com.blisssierra.hrms.dto.TaskUserUpdateRequest;
import com.blisssierra.hrms.dto.UserOptionDto;
import com.blisssierra.hrms.entity.Task;
import com.blisssierra.hrms.service.TaskService;

import java.util.List;

/**
 * TaskController
 *
 * FIX: /api/users/* endpoints now return employees from the `employees` table
 * (via TaskService which uses EmployeeRepository).
 * Previously these returned from `app_user`, which is a different table.
 *
 * The admin task assignment dropdown calls GET /api/users/search?query=...
 * It now returns real employees who can log in and see their tasks.
 */
@RestController
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // ── Task endpoints ────────────────────────────────────────────────────────

    @GetMapping("/api/tasks/admin")
    public ApiResponse<List<Task>> getAllTasks() {
        return new ApiResponse<>(true, "Tasks fetched successfully",
                taskService.getAllTasks());
    }

    @GetMapping("/api/tasks/admin/notifications")
    public ApiResponse<List<NotificationDto>> getAdminTaskNotifications() {
        return new ApiResponse<>(true, "Admin task notifications fetched successfully",
                taskService.getAdminTaskNotifications());
    }

    @PutMapping("/api/tasks/admin/notifications/{taskId}/read")
    public ApiResponse<Void> markAdminTaskNotificationAsRead(@PathVariable Long taskId) {
        taskService.markAdminTaskNotificationAsRead(taskId);
        return new ApiResponse<>(true, "Admin task notification marked as read", null);
    }

    @PostMapping("/api/tasks/admin")
    public ApiResponse<Task> createTask(@Valid @RequestBody TaskAdminRequest request) {
        return new ApiResponse<>(true, "Task created successfully",
                taskService.createTask(request));
    }

    @PutMapping("/api/tasks/admin/{taskId}")
    public ApiResponse<Task> updateTaskByAdmin(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskAdminRequest request) {
        return new ApiResponse<>(true, "Task updated successfully",
                taskService.updateTaskByAdmin(taskId, request));
    }

    @DeleteMapping("/api/tasks/admin/{taskId}")
    public ApiResponse<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return new ApiResponse<>(true, "Task deleted successfully", null);
    }

    /**
     * GET /api/tasks/user/{employeeId}
     *
     * KEY: employeeId here is the empId string (e.g. "BSSE001") —
     * the same value the employee gets from UserContext after login.
     * TaskService queries Task.assigneeEmployeeId which is set to
     * Employee.empId during task creation.
     */
    @GetMapping("/api/tasks/user/{employeeId}")
    public ApiResponse<List<Task>> getTasksByEmployeeId(
            @PathVariable String employeeId) {
        return new ApiResponse<>(true, "User tasks fetched successfully",
                taskService.getTasksByEmployeeId(employeeId));
    }

    @GetMapping("/api/tasks/user/{employeeId}/notifications")
    public ApiResponse<List<NotificationDto>> getUserTaskNotifications(@PathVariable String employeeId) {
        return new ApiResponse<>(true, "User task notifications fetched successfully",
                taskService.getUserTaskNotifications(employeeId));
    }

    @PutMapping("/api/tasks/user/{taskId}")
    public ApiResponse<Task> updateTaskByUser(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskUserUpdateRequest request) {
        return new ApiResponse<>(true, "Task updated by user successfully",
                taskService.updateTaskByUser(taskId, request));
    }

    @PutMapping("/api/tasks/user/{taskId}/notification-read")
    public ApiResponse<Void> markUserTaskNotificationAsRead(@PathVariable Long taskId) {
        taskService.markUserTaskNotificationAsRead(taskId);
        return new ApiResponse<>(true, "User task notification marked as read", null);
    }

    // ── Employee lookup endpoints (used by admin task assignment dropdown) ────
    //
    // These were previously in UserController and returned AppUser records.
    // Now they return Employee records so the admin can assign tasks to real
    // employees who can actually log in.

    /**
     * GET /api/users
     * Returns all employees as UserOptionDto for the assignment dropdown.
     */
    @GetMapping("/api/users")
    public ApiResponse<List<UserOptionDto>> getUsers() {
        List<UserOptionDto> list = taskService.getAllEmployees().stream()
                .map(e -> new UserOptionDto(e.getId(), e.getEmpId(), e.getName()))
                .toList();
        return new ApiResponse<>(true, "Employees fetched successfully", list);
    }

    /**
     * GET /api/users/search?query=...
     * Used by admin task page to find employees when assigning a task.
     */
    @GetMapping("/api/users/search")
    public ApiResponse<List<UserOptionDto>> searchUsers(
            @RequestParam(defaultValue = "") String query) {
        List<UserOptionDto> list = taskService.searchEmployees(query).stream()
                .map(e -> new UserOptionDto(e.getId(), e.getEmpId(), e.getName()))
                .toList();
        return new ApiResponse<>(true, "Employees fetched successfully", list);
    }

    /**
     * GET /api/users/employee/{employeeId}
     * Look up a single employee by their empId string.
     */
    @GetMapping("/api/users/employee/{employeeId}")
    public ApiResponse<UserOptionDto> getUserByEmployeeId(
            @PathVariable String employeeId) {
        var emp = taskService.getEmployeeByEmpId(employeeId);
        return new ApiResponse<>(true, "Employee fetched successfully",
                new UserOptionDto(emp.getId(), emp.getEmpId(), emp.getName()));
    }
}
