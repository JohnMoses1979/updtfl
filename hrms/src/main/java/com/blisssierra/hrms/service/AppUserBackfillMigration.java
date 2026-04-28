package com.blisssierra.hrms.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class AppUserBackfillMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AppUserBackfillMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public AppUserBackfillMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            Integer tableCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables " +
                            "WHERE table_schema = DATABASE() AND table_name = 'app_user'",
                    Integer.class);

            if (tableCount == null || tableCount == 0) {
                return;
            }

            int updated = jdbcTemplate.update("""
                    UPDATE employees e
                    JOIN app_user a ON UPPER(a.employee_id) = UPPER(e.emp_id)
                    SET
                      e.role = CASE
                        WHEN a.role IS NULL OR TRIM(a.role) = '' THEN e.role
                        WHEN UPPER(a.role) LIKE 'ROLE_%' THEN UPPER(a.role)
                        ELSE CONCAT('ROLE_', UPPER(a.role))
                      END,
                      e.status = COALESCE(NULLIF(a.status, ''), e.status),
                      e.join_date = COALESCE(a.join_date, e.join_date),
                      e.monthly_salary = COALESCE(a.salary, e.monthly_salary),
                      e.designation = COALESCE(NULLIF(a.designation, ''), e.designation),
                      e.name = COALESCE(NULLIF(a.full_name, ''), e.name),
                      e.email = COALESCE(NULLIF(a.email, ''), e.email)
                    """);

            if (updated > 0) {
                log.info("Legacy app_user data merged into employees for {} record(s).", updated);
            }
        } catch (Exception ex) {
            log.warn("Skipping app_user backfill migration: {}", ex.getMessage());
        }
    }
}
