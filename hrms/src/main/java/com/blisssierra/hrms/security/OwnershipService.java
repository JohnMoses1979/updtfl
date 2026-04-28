package com.blisssierra.hrms.security;

import com.blisssierra.hrms.repository.EmployeeRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("ownershipService")
public class OwnershipService {

    private final EmployeeRepository employeeRepository;

    public OwnershipService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    /**
     * Returns true if the authenticated user's empId maps to the given numeric
     * employee id — used for /payslip/{numericId}/... endpoints.
     */
    public boolean ownsById(Authentication auth, Long targetEmployeeId) {
        if (auth == null) {
            return false;
        }
        String empId = auth.getName();
        return employeeRepository.findByEmpId(empId.toUpperCase())
                .map(e -> e.getId().equals(targetEmployeeId))
                .orElse(false);
    }

    /**
     * Checks by empId string
     */
    public boolean owns(Authentication auth, String targetEmpId) {
        if (auth == null || targetEmpId == null) {
            return false;
        }
        return auth.getName().equalsIgnoreCase(targetEmpId.trim());
    }
}
