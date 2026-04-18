package com.blisssierra.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.Instant;

/**
 * One attendance record per employee per calendar day.
 * Merged from Project A (face-verify flow) + Project B (salary trigger flow).
 * 
 * TIMEZONE FIX: Using Instant instead of LocalDateTime
 * Instant is always in UTC and timezone-independent.
 */
@Entity
@Table(name = "attendance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK: employee's unique string ID (e.g. "EMP001"). Project A authority. */
    @Column(name = "emp_id", nullable = false)
    private String empId;

    /** Denormalised display name — avoids JOIN in list queries. */
    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    /** Calendar date of this attendance event. */
    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    /** Timestamp when employee checked in (UTC). */
    @Column(name = "check_in_time")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private Instant checkInTime;

    /**
     * Timestamp when employee checked out (UTC).
     * Null while session is still open.
     */
    @Column(name = "check_out_time")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private Instant checkOutTime;

    /**
     * Whether the employee completed a present day.
     * Sourced from Project B — set to true on check-in, used by salary logic.
     */
    @Column(name = "present", nullable = false)
    private boolean present = false;

    @Column(name = "created_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private Instant createdAt;

    @Column(name = "updated_at")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}