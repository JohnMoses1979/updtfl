package com.blisssierra.hrms.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.blisssierra.hrms.dto.ApiResponseDto;
import com.blisssierra.hrms.dto.AttendanceRecordDto;
import com.blisssierra.hrms.service.AttendanceApiService;

/**
 * AttendanceApiController
 *
 * Endpoints:
 * POST /api/attendance/check-in body: { empId }
 * POST /api/attendance/check-out body: { empId }
 * GET /api/attendance?date=YYYY-MM-DD optional date filter
 * GET /api/attendance/all all records (admin)
 *
 * The face-verify endpoint lives in AttendanceController.java (untouched).
 */
@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceApiController {
    private static final Logger log = LoggerFactory.getLogger(AttendanceApiController.class);
    @Autowired
    private AttendanceApiService attendanceApiService;

    @Autowired
    private com.blisssierra.hrms.repository.AttendanceRepository attendanceRepository;

    // ── POST /api/attendance/check-in ────────────────────────────────────────
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody CheckInOutRequest req) {
        log.info("POST /api/attendance/check-in — empId={}", req.getEmpId());
        if (req.getEmpId() == null || req.getEmpId().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseDto("error", "empId is required"));
        }
        // recordCheckIn() will return existing record if already checked in today
        AttendanceRecordDto record = attendanceApiService.recordCheckIn(req.getEmpId());
        return ResponseEntity.ok(record);
    }

    // ── POST /api/attendance/check-out ───────────────────────────────────────
    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestBody CheckInOutRequest req) {
        log.info("POST /api/attendance/check-out — empId={}", req.getEmpId());
        if (req.getEmpId() == null || req.getEmpId().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseDto("error", "empId is required"));
        }
        // recordCheckOut() finds today's record and updates checkOutTime
        Optional<AttendanceRecordDto> result = attendanceApiService.recordCheckOut(req.getEmpId());
        if (result.isEmpty()) {
            return ResponseEntity.ok(
                    new ApiResponseDto("error",
                            "No check-in record found for today. Please check in first."));
        }
        return ResponseEntity.ok(result.get());
    }

    // ── GET /api/attendance?date=YYYY-MM-DD ──────────────────────────────────
    @GetMapping
    public ResponseEntity<List<AttendanceRecordDto>> getByDate(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        log.info("GET /api/attendance?date={}", queryDate);
        List<AttendanceRecordDto> records = attendanceApiService.getByDate(queryDate);
        return ResponseEntity.ok(records);
    }

    // ── GET /api/attendance/all ──────────────────────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<List<AttendanceRecordDto>> getAll() {
        log.info("GET /api/attendance/all");
        List<AttendanceRecordDto> records = attendanceApiService.getAll();
        return ResponseEntity.ok(records);
    }

    @GetMapping("/history/{empId}")
    public ResponseEntity<List<AttendanceRecordDto>> getEmployeeHistory(@PathVariable String empId) {
        String normId = empId.trim().toUpperCase();
        log.info("GET /api/attendance/history/{}", normId);
        List<AttendanceRecordDto> records = attendanceApiService.getEmployeeHistory(normId);
        return ResponseEntity.ok(records);
    }

    // ── Inner request body DTO ───────────────────────────────────────────────
    static class CheckInOutRequest {
        private String empId;

        public String getEmpId() {
            return empId;
        }

        public void setEmpId(String empId) {
            this.empId = empId;
        }
    }

    // Add to AttendanceApiController.java

    @GetMapping("/status/{empId}")
    public ResponseEntity<?> getStatus(@PathVariable String empId) {
        String normId = empId.trim().toUpperCase();
        LocalDate today = LocalDate.now();
        log.info("GET /api/attendance/status/{}", normId);

        Optional<com.blisssierra.hrms.entity.Attendance> existing = attendanceRepository
                .findByEmpIdAndAttendanceDate(normId, today);

        if (existing.isEmpty()) {
            return ResponseEntity.ok(java.util.Map.of(
                    "checkedIn", false,
                    "checkedOut", false,
                    "date", today.toString()));
        }

        var a = existing.get();
        boolean checkedIn = a.getCheckInTime() != null;
        boolean checkedOut = a.getCheckOutTime() != null;

        // Convert Instant times to IST (Asia/Kolkata) for display
        java.time.ZoneId officeZone = java.time.ZoneId.of("Asia/Kolkata");
        java.time.format.DateTimeFormatter timeFmt = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

        String checkInStr = checkedIn
                ? a.getCheckInTime().atZone(officeZone).format(timeFmt)
                : "";
        String checkOutStr = checkedOut
                ? a.getCheckOutTime().atZone(officeZone).format(timeFmt)
                : "";

        return ResponseEntity.ok(java.util.Map.of(
                "checkedIn", checkedIn,
                "checkedOut", checkedOut,
                "date", today.toString(),
                "checkIn", checkInStr,
                "checkOut", checkOutStr));
    }

    // // ── GET /api/attendance/status/{empId}
    // ──────────────────────────────────────
    // @GetMapping("/status/{empId}")
    // public ResponseEntity<?> getStatus(@PathVariable String empId) {
    // String normId = empId.trim().toUpperCase();
    // LocalDate today = LocalDate.now();
    // log.info("GET /api/attendance/status/{}", normId);
    // Optional<com.blisssierra.hrms.entity.Attendance> existing =
    // attendanceApiService.getTodayRecord(normId, today);
    // if (existing.isEmpty()) {
    // return ResponseEntity.ok(java.util.Map.of(
    // "checkedIn", false,
    // "checkedOut", false,
    // "date", today.toString()));
    // }
    // var a = existing.get();
    // return ResponseEntity.ok(java.util.Map.of(
    // "checkedIn", a.getCheckInTime() != null,
    // "checkedOut", a.getCheckOutTime() != null,
    // "date", today.toString(),
    // "checkIn",
    // a.getCheckInTime() != null
    // ?
    // a.getCheckInTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
    // : "",
    // "checkOut",
    // a.getCheckOutTime() != null
    // ?
    // a.getCheckOutTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
    // : ""));
    // }
}
