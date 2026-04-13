package com.blisssierra.hrms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blisssierra.hrms.entity.AppUser;

public interface AppManagementRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
    List<AppUser> findAllByOrderByIdDesc();
}
