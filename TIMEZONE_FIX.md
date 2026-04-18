# Timezone Fix for Check-in/Check-out Display

## Problem
Check-in and check-out times were displaying incorrectly after deployment to AWS EC2 server. The times shown were different from actual user times - typically showing UTC times instead of IST (Asia/Kolkata) times.

**Example:**
- User checks in at 2:00 PM IST
- System showed 8:30 AM (UTC time)
- Difference: 5.5 hours (UTC offset)

## Root Cause
The application was using `LocalDateTime.now()` in Java backend, which captures the server's local timezone. However:
- Database was configured for UTC (`serverTimezone=UTC`)
- No timezone handling on the frontend
- **Result:** Timezone mismatch between JVM local time and UTC database storage

## Solution Implemented

### 1. **Backend (Java Spring Boot)**

#### File: `hrms/src/main/resources/application.properties`
**Added:**
```properties
spring.jpa.properties.hibernate.jdbc.time_zone=UTC
spring.jackson.serialization.write-dates-as-timestamps=false
```

#### File: `hrms/src/main/java/com/blisssierra/hrms/entity/Attendance.java`
**Changes:**
- Changed from `LocalDateTime` to `Instant` (always UTC)
- Added `@JsonFormat` annotations to format times in ISO-8601 with UTC timezone
- Updated `@PrePersist` and `@PreUpdate` to use `Instant.now()`

```java
@Column(name = "check_in_time")
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
private Instant checkInTime;
```

#### File: `hrms/src/main/java/com/blisssierra/hrms/service/AttendanceApiService.java`
**Changes:**
- Updated `recordCheckIn()` to use `Instant.now()` instead of `LocalDateTime.now()`
- Updated `recordCheckOut()` to use `Instant.now()` instead of `LocalDateTime.now()`
- Updated `toDto()` method to format Instant times in IST (Asia/Kolkata timezone)

```java
// Convert Instant to IST timezone for display
ZoneId officeZone = ZoneId.of("Asia/Kolkata");
String checkIn = a.getCheckInTime()
    .atZone(officeZone)
    .format(DateTimeFormatter.ofPattern("HH:mm"));
```

### 2. **Frontend (React Native)**

#### File: `Nhrms/userscreens/Attendance.js`
**Changes:**
- Updated `parseAttendanceDateTime()` to properly parse backend times
- Updated `toHistoryEntry()` to handle backend's pre-formatted IST times
- Added `formatTimeString()` helper to convert "HH:mm" (24-hour) to "h:mm AM/PM" (12-hour)

**Key improvement:** Frontend no longer tries to convert timezones—it simply displays the times that the backend provides, which are already formatted in IST.

## Data Flow After Fix

```
1. User checks in at 2:00 PM IST
   ↓
2. Frontend sends verification request to backend
   ↓
3. Backend records: Instant.now() = "2024-04-18T08:30:00Z" (UTC)
   ↓
4. Backend converts to IST for response: "14:00"
   ↓
5. Frontend receives "14:00" and formats as "2:00 PM" for display
   ↓
6. User sees "2:00 PM" ✓ (correct!)
```

## API Response Format

### Attendance Status API: `GET /api/attendance/status/{empId}`
```json
{
  "checkedIn": true,
  "checkIn": "14:00",
  "checkOut": null,
  "date": "2024-04-18"
}
```

### Attendance History API: `GET /api/attendance/history/{empId}`
```json
[
  {
    "id": 1,
    "empId": "EMP001",
    "employeeName": "John Doe",
    "date": "2024-04-18",
    "checkIn": "14:00",
    "checkOut": "18:32",
    "durationMinutes": 272,
    "status": "Present"
  }
]
```

### Raw Entity Response (JSON)
Times are also included as full ISO timestamps in the entity:
```json
{
  "checkInTime": "2024-04-18T08:30:00Z",
  "checkOutTime": "2024-04-18T13:02:00Z"
}
```

## Testing the Fix

### 1. **Local Testing**
```bash
# Backend
cd hrms
mvn spring-boot:run

# Check logs for IST-formatted times:
# ✅ Check-in saved id=1 at 2024-04-18T08:30:00Z
```

### 2. **API Testing**
```bash
curl http://localhost:8080/api/attendance/status/EMP001

# Expected response:
# {
#   "checkedIn": true,
#   "checkIn": "14:00",
#   "checkOut": null,
#   "date": "2024-04-18"
# }
```

### 3. **Frontend Verification**
- User checks in at their local time
- Confirmation message shows correct time
- History displays correct check-in/out times in 12-hour format

## Configuration Notes

### Server Timezone
- **Recommended:** Run EC2 server in UTC timezone (`export TZ=UTC`)
- **Office Timezone:** IST (Asia/Kolkata) is handled in code, not server

### Database Timezone
- MySQL: `serverTimezone=UTC` (already set)
- Ensure all timestamps are stored in UTC in the database

### Hibernate Configuration
- `spring.jpa.properties.hibernate.jdbc.time_zone=UTC` ensures Hibernate handles UTC correctly

## Deployment Checklist

- [ ] Update Java backend with new Attendance entity (Instant instead of LocalDateTime)
- [ ] Update AttendanceApiService with UTC formatting
- [ ] Update application.properties with timezone settings
- [ ] Deploy new JAR file to EC2
- [ ] Restart Spring Boot application
- [ ] Clear any browser/app cache that might have old timestamps
- [ ] Test check-in/check-out with current time
- [ ] Verify attendance history shows correct times
- [ ] Check database for UTC-formatted timestamps

## Future Improvements

1. **User Timezone Preferences:** Store user's timezone preference and convert all displays accordingly
2. **API Enhancement:** Include timezone offset in API responses
3. **Admin Dashboard:** Add timezone selector in admin panel
4. **Logging:** Add timezone information to all audit logs
5. **Multiple Offices:** Support different office timezones (if expansion occurs)

## References

- [Java Instant Documentation](https://docs.oracle.com/javase/8/docs/api/java/time/Instant.html)
- [ZoneId Timezones](https://docs.oracle.com/javase/8/docs/api/java/time/ZoneId.html)
- [Spring Boot Timezone Configuration](https://spring.io/blog/2021/06/21/spring-boot-timezone-configuration)
- [React Native Date Handling](https://reactnative.dev/docs/date)
