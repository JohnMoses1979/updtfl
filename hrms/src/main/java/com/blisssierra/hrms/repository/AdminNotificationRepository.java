package com.blisssierra.hrms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blisssierra.hrms.entity.AdminNotification;

public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {

    List<AdminNotification> findByActiveTrueOrderByCreatedAtDesc();

    List<AdminNotification> findByActiveFalseOrderByCreatedAtDesc();

    List<AdminNotification> findByTypeAndActiveTrueOrderByCreatedAtDesc(String type);

    List<AdminNotification> findByTypeAndEmployeeIdAndActiveTrueOrderByCreatedAtDesc(String type, Long employeeId);

    List<AdminNotification> findByTypeAndLeaveIdAndActiveTrueOrderByCreatedAtDesc(String type, Long leaveId);
}
