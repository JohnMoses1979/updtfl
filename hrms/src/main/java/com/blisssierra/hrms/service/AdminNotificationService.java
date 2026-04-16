package com.blisssierra.hrms.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blisssierra.hrms.dto.NotificationDto;
import com.blisssierra.hrms.entity.AdminNotification;
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.entity.Leave;
import com.blisssierra.hrms.entity.Task;
import com.blisssierra.hrms.repository.AdminNotificationRepository;

@Service
public class AdminNotificationService {

    public static final String TYPE_SIGNUP_REQUEST = "SIGNUP_REQUEST";
    public static final String TYPE_APPROVAL_ACTION = "APPROVAL_ACTION";
    public static final String TYPE_LEAVE_REQUEST = "LEAVE_REQUEST";
    public static final String TYPE_LEAVE_ACTION = "LEAVE_ACTION";
    public static final String TYPE_TASK_UPDATED = "TASK_UPDATED";

    private final AdminNotificationRepository adminNotificationRepository;

    public AdminNotificationService(AdminNotificationRepository adminNotificationRepository) {
        this.adminNotificationRepository = adminNotificationRepository;
    }

    public List<NotificationDto> getActiveNotifications() {
        return adminNotificationRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<NotificationDto> getHistoryNotifications() {
        return adminNotificationRepository.findByActiveFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        AdminNotification notification = adminNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        notification.setRead(true);
        notification.setActive(false);
        adminNotificationRepository.save(notification);
    }

    public NotificationDto createSignupRequestNotification(Employee employee) {
        return toDto(saveNotification(
                TYPE_SIGNUP_REQUEST,
                "Employee Approval Request",
                String.format("%s (%s) is awaiting admin approval.",
                        employee.getName(),
                        employee.getEmpId()),
                true,
                employee,
                null,
                null,
                "employees"));
    }

    @Transactional
    public void createApprovalActionNotification(Employee employee, boolean approved) {
        deactivateActiveSignupRequests(employee.getId());
        saveNotification(
                TYPE_APPROVAL_ACTION,
                approved ? "Employee Approved" : "Employee Rejected",
                String.format("%s (%s) was %s by admin.",
                        employee.getName(),
                        employee.getEmpId(),
                        approved ? "approved" : "rejected"),
                false,
                employee,
                null,
                null,
                "employees");
    }

    public NotificationDto createLeaveRequestNotification(Leave leave) {
        Employee employee = leave.getEmployee();
        return toDto(saveNotification(
                TYPE_LEAVE_REQUEST,
                "Leave Request",
                String.format("%s (%s) requested leave from %s to %s.",
                        employee.getName(),
                        employee.getEmpId(),
                        leave.getStartDate(),
                        leave.getEndDate()),
                true,
                employee,
                null,
                leave,
                "leave"));
    }

    @Transactional
    public void createLeaveActionNotification(Leave leave) {
        deactivateActiveLeaveRequests(leave.getId());
        Employee employee = leave.getEmployee();
        saveNotification(
                TYPE_LEAVE_ACTION,
                "Leave Action",
                String.format("%s (%s) leave was %s for %s to %s.",
                        employee.getName(),
                        employee.getEmpId(),
                        leave.getStatus(),
                        leave.getStartDate(),
                        leave.getEndDate()),
                false,
                employee,
                null,
                leave,
                "leave");
    }

    public NotificationDto createTaskUpdatedNotification(Task task, String body) {
        Employee employee = new Employee();
        employee.setId(task.getAssigneeId());
        employee.setName(task.getAssigneeName());
        employee.setEmpId(task.getAssigneeEmployeeId());
        return toDto(saveNotification(
                TYPE_TASK_UPDATED,
                "Task Update",
                body,
                true,
                employee,
                task,
                null,
                "tasks"));
    }

    @Transactional
    public void deactivateActiveSignupRequests(Long employeeId) {
        adminNotificationRepository
                .findByTypeAndEmployeeIdAndActiveTrueOrderByCreatedAtDesc(TYPE_SIGNUP_REQUEST, employeeId)
                .forEach(notification -> {
                    notification.setActive(false);
                    notification.setRead(true);
                    adminNotificationRepository.save(notification);
                });
    }

    @Transactional
    public void deactivateActiveLeaveRequests(Long leaveId) {
        adminNotificationRepository
                .findByTypeAndLeaveIdAndActiveTrueOrderByCreatedAtDesc(TYPE_LEAVE_REQUEST, leaveId)
                .forEach(notification -> {
                    notification.setActive(false);
                    notification.setRead(true);
                    adminNotificationRepository.save(notification);
                });
    }

    public List<NotificationDto> getActiveSignupNotifications() {
        return adminNotificationRepository.findByTypeAndActiveTrueOrderByCreatedAtDesc(TYPE_SIGNUP_REQUEST)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private AdminNotification saveNotification(
            String type,
            String title,
            String body,
            boolean active,
            Employee employee,
            Task task,
            Leave leave,
            String targetPage) {
        AdminNotification notification = new AdminNotification();
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setActive(active);
        notification.setRead(!active);
        notification.setTargetPage(targetPage);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());

        if (employee != null) {
            notification.setEmployeeId(employee.getId());
            notification.setEmployeeName(employee.getName());
            notification.setEmployeeEmpId(employee.getEmpId());
            notification.setEmployeeEmail(employee.getEmail());
            notification.setDesignation(employee.getDesignation());
        }

        if (task != null) {
            notification.setTaskId(task.getId());
        }

        if (leave != null) {
            notification.setLeaveId(leave.getId());
        }

        return adminNotificationRepository.save(notification);
    }

    private NotificationDto toDto(AdminNotification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getBody(),
                Boolean.TRUE.equals(notification.getRead()),
                notification.getCreatedAt(),
                notification.getEmployeeId(),
                notification.getEmployeeName(),
                notification.getEmployeeEmpId(),
                notification.getEmployeeEmail(),
                notification.getDesignation(),
                notification.getTaskId(),
                notification.getTargetPage(),
                notification.getLeaveId(),
                Boolean.TRUE.equals(notification.getActive()));
    }
}
