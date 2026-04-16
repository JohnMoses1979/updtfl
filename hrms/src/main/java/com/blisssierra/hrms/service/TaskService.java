package com.blisssierra.hrms.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.blisssierra.hrms.dto.NotificationDto;
import com.blisssierra.hrms.dto.TaskAdminRequest;
import com.blisssierra.hrms.dto.TaskUserUpdateRequest;
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.entity.Task;
import com.blisssierra.hrms.repository.EmployeeRepository;
import com.blisssierra.hrms.repository.TaskRepository;

/**
 * TaskService — now uses Employee entity only (not AppUser).
 *
 * ROOT CAUSE FIX:
 * Previously used AppUserRepository to look up assignees.
 * Employees added via AdminEmployeesScreen are saved to the `employees`
 * table, NOT `app_user`. So task assignment failed silently when the
 * selected employee didn't exist in app_user.
 *
 * Fix: use EmployeeRepository throughout. The Task entity stores:
 * assigneeId = Employee.id (Long PK)
 * assigneeEmployeeId = Employee.empId (String, e.g. "BSSE001")
 * assigneeName = Employee.name
 *
 * The frontend fetches tasks via GET /tasks/user/{empId}, which queries
 * by assigneeEmployeeId — this now matches the empId the employee logs in with.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final AdminNotificationService adminNotificationService;

    public TaskService(TaskRepository taskRepository,
            EmployeeRepository employeeRepository,
            AdminNotificationService adminNotificationService) {
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
        this.adminNotificationService = adminNotificationService;
    }

    // ── Admin queries ─────────────────────────────────────────────────────────

    public List<Task> getAllTasks() {
        return taskRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<Task> getTasksByEmployeeId(String employeeId) {
        if (employeeId == null || employeeId.trim().isEmpty()) {
            return List.of();
        }
        return taskRepository.findByAssigneeEmployeeIdIgnoreCaseOrderByUpdatedAtDesc(
                employeeId.trim());
    }

    public List<NotificationDto> getUserTaskNotifications(String employeeId) {
        if (employeeId == null || employeeId.trim().isEmpty()) {
            return List.of();
        }

        return taskRepository
                .findByAssigneeEmployeeIdIgnoreCaseAndAdminUpdatePendingForUserTrueOrderByUpdatedAtDesc(
                        employeeId.trim())
                .stream()
                .map(task -> new NotificationDto(
                        task.getId(),
                        "TASK_ASSIGNED",
                        task.getStatus() != null && !"todo".equalsIgnoreCase(task.getStatus())
                                ? "Task updated by admin"
                                : "New task assigned",
                        task.getTitle(),
                        false,
                        task.getUpdatedAt(),
                        task.getAssigneeId(),
                        task.getAssigneeName(),
                        task.getAssigneeEmployeeId(),
                        null,
                        null,
                        task.getId(),
                        "tasks"))
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getAdminTaskNotifications() {
        return taskRepository.findByUserUpdatePendingForAdminTrueOrderByUpdatedAtDesc()
                .stream()
                .map(task -> new NotificationDto(
                        task.getId(),
                        "TASK_UPDATED",
                        "Task updated by employee",
                        String.format("%s updated \"%s\" to %s (%d%%)",
                                task.getAssigneeName(),
                                task.getTitle(),
                                humanizeStatus(task.getStatus()),
                                task.getProgress()),
                        false,
                        task.getUpdatedAt(),
                        task.getAssigneeId(),
                        task.getAssigneeName(),
                        task.getAssigneeEmployeeId(),
                        null,
                        null,
                        task.getId(),
                        "tasks"))
                .collect(Collectors.toList());
    }

    // ── Employee search (used by admin task assignment dropdown) ─────────────

    /**
     * Search employees by name or empId (case-insensitive, top 10 results).
     * Returns Employee list — controller maps to DTO if needed.
     */
    public List<Employee> searchEmployees(String query) {
        if (query == null || query.trim().isEmpty()) {
            return employeeRepository.findAll();
        }
        String q = query.trim().toLowerCase();
        return employeeRepository.findAll().stream()
                .filter(e -> (e.getName() != null && e.getName().toLowerCase().contains(q)) ||
                        (e.getEmpId() != null && e.getEmpId().toLowerCase().contains(q)) ||
                        (e.getDesignation() != null && e.getDesignation().toLowerCase().contains(q)) ||
                        (e.getEmail() != null && e.getEmail().toLowerCase().contains(q)))
                .limit(10)
                .toList();
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeByEmpId(String empId) {
        if (empId == null || empId.trim().isEmpty()) {
            throw new RuntimeException("Employee ID is required");
        }
        return employeeRepository.findByEmpId(empId.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found for empId: " + empId.trim()));
    }

    // ── Task CRUD ─────────────────────────────────────────────────────────────

    public Task createTask(TaskAdminRequest request) {
        // Look up by Employee.id (Long) — sent as assigneeId from frontend
        Employee employee = employeeRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found with id: " + request.getAssigneeId()));

        Task task = new Task();
        task.setTaskCode(generateTaskCode());
        task.setTitle(request.getTitle().trim());
        task.setDescription(valueOrNull(request.getDescription()));
        task.setAssigneeId(employee.getId());
        task.setAssigneeName(employee.getName());
        task.setAssigneeEmployeeId(employee.getEmpId()); // This is what user screen queries
        task.setDueText(valueOrNull(request.getDueText()));
        task.setPriority(normalizePriority(request.getPriority()));
        task.setStatus("todo");
        task.setProgress(0);
        task.setCommentsCount(0);
        task.setAdminUpdatePendingForUser(true);
        task.setUserUpdatePendingForAdmin(false);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    public Task updateTaskByAdmin(Long taskId, TaskAdminRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        Employee employee = employeeRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found with id: " + request.getAssigneeId()));

        task.setTitle(request.getTitle().trim());
        task.setDescription(valueOrNull(request.getDescription()));
        task.setAssigneeId(employee.getId());
        task.setAssigneeName(employee.getName());
        task.setAssigneeEmployeeId(employee.getEmpId());
        task.setDueText(valueOrNull(request.getDueText()));
        task.setPriority(normalizePriority(request.getPriority()));
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            task.setStatus(normalizeStatus(request.getStatus()));
        }
        task.setAdminUpdatePendingForUser(true);
        task.setUserUpdatePendingForAdmin(false);
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    /**
     * Employee updates their own task (progress, status, comment).
     * Progress = 100 auto-sets status to "done".
     */
    public Task updateTaskByUser(Long taskId, TaskUserUpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        int progress = request.getProgress();
        String status = normalizeStatus(request.getStatus());

        // Auto-complete when progress hits 100
        if (progress >= 100) {
            progress = 100;
            status = "done";
        }

        task.setStatus(status);
        task.setPriority(normalizePriority(request.getPriority()));
        task.setProgress(progress);

        if (request.getAddComment() != null && !request.getAddComment().trim().isEmpty()) {
            task.setCommentsCount(task.getCommentsCount() + 1);
        }

        task.setAdminUpdatePendingForUser(false);
        task.setUserUpdatePendingForAdmin(true);
        task.setUpdatedAt(LocalDateTime.now());
        Task updated = taskRepository.save(task);

        adminNotificationService.createTaskUpdatedNotification(
                updated,
                String.format("%s (%s) updated \"%s\" to %s (%d%%).",
                        updated.getAssigneeName(),
                        updated.getAssigneeEmployeeId(),
                        updated.getTitle(),
                        humanizeStatus(updated.getStatus()),
                        updated.getProgress()));

        return updated;
    }

    public void markUserTaskNotificationAsRead(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.setAdminUpdatePendingForUser(false);
        taskRepository.save(task);
    }

    public void markAdminTaskNotificationAsRead(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.setUserUpdatePendingForAdmin(false);
        taskRepository.save(task);
    }

    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        taskRepository.delete(task);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String valueOrNull(String value) {
        return (value == null || value.trim().isEmpty()) ? null : value.trim();
    }

    private String normalizePriority(String priority) {
        String p = priority == null ? "medium" : priority.trim().toLowerCase();
        return List.of("low", "medium", "high", "urgent").contains(p) ? p : "medium";
    }

    private String normalizeStatus(String status) {
        String s = status == null ? "todo" : status.trim().toLowerCase();
        if ("review".equals(s) || "in review".equals(s)) {
            return "in-progress";
        }
        return List.of("todo", "in-progress", "done").contains(s) ? s : "todo";
    }

    private String generateTaskCode() {
        return "T" + UUID.randomUUID().toString().replace("-", "")
                .substring(0, 8).toUpperCase();
    }

    private String humanizeStatus(String status) {
        return switch (normalizeStatus(status)) {
            case "in-progress" -> "In Progress";
            case "done" -> "Done";
            default -> "To Do";
        };
    }
}
