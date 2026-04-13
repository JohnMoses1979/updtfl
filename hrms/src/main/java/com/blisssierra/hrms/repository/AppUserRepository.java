package com.blisssierra.hrms.repository;

 
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.blisssierra.hrms.entity.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmployeeId(String employeeId);
    List<AppUser> findAllByOrderByFullNameAsc();
    List<AppUser> findTop20ByOrderByFullNameAsc();
    List<AppUser> findTop20ByFullNameContainingIgnoreCaseOrderByFullNameAsc(String fullName);
    List<AppUser> findTop10ByFullNameContainingIgnoreCaseOrEmployeeIdContainingIgnoreCase(String fullName, String employeeId);
    void deleteByEmployeeId(String employeeId);
}
