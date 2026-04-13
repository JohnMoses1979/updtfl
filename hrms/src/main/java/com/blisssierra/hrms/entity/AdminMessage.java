// package com.blisssierra.hrms.entity;

// import java.time.LocalDateTime;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.PrePersist;
// import jakarta.persistence.Table;
// import lombok.AllArgsConstructor;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;

// @AllArgsConstructor
// @NoArgsConstructor
// @Entity
// @Getter
// @Setter
// @Table(name = "admin_message")
// public class AdminMessage {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @Column(name = "recipient_user_id", nullable = false)
//     private Long recipientUserId;

//     @Column(name = "recipient_employee_id", nullable = false)
//     private String recipientEmployeeId;

//     @Column(name = "recipient_name", nullable = false)
//     private String recipientName;

//     @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
//     private String messageText;

//     @Column(name = "created_at")
//     private LocalDateTime createdAt;

//     @Column(name = "is_read")
//     private Boolean isRead = false;

//     @PrePersist
//     public void prePersist() {
//         if (createdAt == null) {
//             createdAt = LocalDateTime.now();
//         }
//         if (isRead == null) {
//             isRead = false;
//         }
//     }
// }

package com.blisssierra.hrms.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Getter
@Setter
@Table(name = "admin_message")
public class AdminMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    @Column(name = "recipient_employee_id", nullable = false)
    private String recipientEmployeeId;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    // Full message text — no truncation
    @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
    private String messageText;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_read")
    private Boolean isRead = false;

    // broadcast flag: true = sent to all employees
    @Column(name = "is_broadcast")
    private Boolean isBroadcast = false;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
        if (isBroadcast == null) {
            isBroadcast = false;
        }
    }
}