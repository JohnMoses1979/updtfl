package com.blisssierra.hrms.repository;

 
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blisssierra.hrms.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByOrderByUpdatedAtDesc();
    List<Task> findByAssigneeEmployeeIdIgnoreCaseOrderByUpdatedAtDesc(String assigneeEmployeeId);
}
