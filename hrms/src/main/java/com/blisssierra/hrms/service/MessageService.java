// package com.blisssierra.hrms.service;

// import java.util.List;

// import org.springframework.stereotype.Service;

// import com.blisssierra.hrms.dto.MessageResponseDto;
// import com.blisssierra.hrms.dto.SendMessageRequest;
// import com.blisssierra.hrms.dto.UserOptionDto;
// import com.blisssierra.hrms.entity.AdminMessage;
// import com.blisssierra.hrms.entity.AppUser;
// import com.blisssierra.hrms.repository.AdminMessageRepository;
// import com.blisssierra.hrms.repository.AppUserRepository;

// @Service
// public class MessageService {

//     private final AppUserRepository appUserRepository;
//     private final AdminMessageRepository adminMessageRepository;

//     public MessageService(AppUserRepository appUserRepository,
//                           AdminMessageRepository adminMessageRepository) {
//         this.appUserRepository = appUserRepository;
//         this.adminMessageRepository = adminMessageRepository;
//     }

//     public List<UserOptionDto> getUsers(String search) {
//         List<AppUser> users;
//         if (search == null || search.trim().isEmpty()) {
//             users = appUserRepository.findTop20ByOrderByFullNameAsc();
//         } else {
//             users = appUserRepository.findTop20ByFullNameContainingIgnoreCaseOrderByFullNameAsc(search.trim());
//         }

//         return users.stream()
//                 .map(u -> new UserOptionDto(u.getId(), u.getEmployeeId(), u.getFullName()))
//                 .toList();
//     }

//     public MessageResponseDto sendMessage(SendMessageRequest request) {
//         if (request.getEmployeeId() == null || request.getEmployeeId().trim().isEmpty()) {
//             throw new RuntimeException("Employee ID is required");
//         }
//         if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
//             throw new RuntimeException("Message is required");
//         }

//         AppUser user = appUserRepository.findByEmployeeId(request.getEmployeeId().trim())
//                 .orElseThrow(() -> new RuntimeException("Employee not found for employeeId: " + request.getEmployeeId()));

//         AdminMessage adminMessage = new AdminMessage();
//         adminMessage.setRecipientUserId(user.getId());
//         adminMessage.setRecipientEmployeeId(user.getEmployeeId());
//         adminMessage.setRecipientName(user.getFullName());
//         adminMessage.setMessageText(request.getMessage().trim());

//         AdminMessage saved = adminMessageRepository.save(adminMessage);

//         return new MessageResponseDto(
//                 saved.getId(),
//                 saved.getRecipientEmployeeId(),
//                 saved.getRecipientName(),
//                 saved.getMessageText(),
//                 saved.getCreatedAt()
//         );
//     }

//     public List<MessageResponseDto> getMessagesForEmployee(String employeeId) {
//         return adminMessageRepository.findByRecipientEmployeeIdOrderByCreatedAtDesc(employeeId)
//                 .stream()
//                 .map(m -> new MessageResponseDto(
//                         m.getId(),
//                         m.getRecipientEmployeeId(),
//                         m.getRecipientName(),
//                         m.getMessageText(),
//                         m.getCreatedAt()
//                 ))
//                 .toList();
//     }
// }

package com.blisssierra.hrms.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blisssierra.hrms.dto.MessageResponseDto;
import com.blisssierra.hrms.dto.SendMessageRequest;
import com.blisssierra.hrms.dto.UserOptionDto;
import com.blisssierra.hrms.entity.AdminMessage;
import com.blisssierra.hrms.entity.AppUser;
import com.blisssierra.hrms.repository.AdminMessageRepository;
import com.blisssierra.hrms.repository.AppUserRepository;

@Service
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    private final AppUserRepository appUserRepository;
    private final AdminMessageRepository adminMessageRepository;

    public MessageService(AppUserRepository appUserRepository,
            AdminMessageRepository adminMessageRepository) {
        this.appUserRepository = appUserRepository;
        this.adminMessageRepository = adminMessageRepository;
    }

    public List<UserOptionDto> getUsers(String search) {
        List<AppUser> users;
        if (search == null || search.trim().isEmpty()) {
            users = appUserRepository.findTop20ByOrderByFullNameAsc();
        } else {
            users = appUserRepository.findTop20ByFullNameContainingIgnoreCaseOrderByFullNameAsc(search.trim());
        }
        return users.stream()
                .map(u -> new UserOptionDto(u.getId(), u.getEmployeeId(), u.getFullName()))
                .toList();
    }

    /**
     * ISSUE 5 FIX: Send message to individual OR broadcast to all employees.
     * If employeeId is null or "ALL", sends to every employee.
     */
    public MessageResponseDto sendMessage(SendMessageRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Message is required");
        }

        // Broadcast: employeeId is null or "ALL"
        if (request.getEmployeeId() == null ||
                request.getEmployeeId().trim().isEmpty() ||
                "ALL".equalsIgnoreCase(request.getEmployeeId().trim())) {
            return sendBroadcastMessage(request.getMessage().trim());
        }

        // Individual message
        AppUser user = appUserRepository.findByEmployeeId(request.getEmployeeId().trim())
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found for employeeId: " + request.getEmployeeId()));

        AdminMessage adminMessage = new AdminMessage();
        adminMessage.setRecipientUserId(user.getId());
        adminMessage.setRecipientEmployeeId(user.getEmployeeId());
        adminMessage.setRecipientName(user.getFullName());
        adminMessage.setMessageText(request.getMessage().trim()); // ISSUE 3 FIX: full text, no truncation
        adminMessage.setIsBroadcast(false);

        AdminMessage saved = adminMessageRepository.save(adminMessage);
        log.info("Message sent to employeeId={}: {}", user.getEmployeeId(), saved.getId());

        return toDto(saved);
    }

    /**
     * ISSUE 5 FIX: Broadcast to ALL employees.
     */
    private MessageResponseDto sendBroadcastMessage(String messageText) {
        List<AppUser> allUsers = appUserRepository.findAll();
        if (allUsers.isEmpty()) {
            throw new RuntimeException("No employees found to send broadcast");
        }

        AdminMessage lastSaved = null;
        int count = 0;

        for (AppUser user : allUsers) {
            AdminMessage msg = new AdminMessage();
            msg.setRecipientUserId(user.getId());
            msg.setRecipientEmployeeId(user.getEmployeeId());
            msg.setRecipientName(user.getFullName());
            msg.setMessageText(messageText);
            msg.setIsBroadcast(true);
            lastSaved = adminMessageRepository.save(msg);
            count++;
        }

        log.info("Broadcast message sent to {} employees", count);

        if (lastSaved == null) {
            throw new RuntimeException("Failed to send broadcast message");
        }

        return new MessageResponseDto(
                lastSaved.getId(),
                "ALL",
                "All Employees",
                messageText,
                lastSaved.getCreatedAt());
    }

    /**
     * ISSUE 3 & 4 FIX:
     * - Returns full message text (no truncation)
     * - Only returns messages from the last 24 hours
     */
    public List<MessageResponseDto> getMessagesForEmployee(String employeeId) {
        LocalDateTime oneDayAgo = LocalDateTime.now().minusHours(24);

        return adminMessageRepository
                .findByRecipientEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().isAfter(oneDayAgo))
                .map(this::toDto)
                .toList();
    }

    public List<MessageResponseDto> getUnreadMessagesForEmployee(String employeeId) {
        return adminMessageRepository.findByRecipientEmployeeIdAndIsReadFalseOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public void markMessageAsRead(Long messageId) {
        AdminMessage message = adminMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));
        message.setIsRead(true);
        adminMessageRepository.save(message);
    }

    /**
     * ISSUE 4 FIX: Scheduled cleanup — deletes messages older than 24 hours.
     * Runs every hour.
     */
    @Scheduled(cron = "0 0 * * * *") // every hour
    @Transactional
    public void deleteOldMessages() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<AdminMessage> old = adminMessageRepository.findAll().stream()
                .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().isBefore(cutoff))
                .toList();

        if (!old.isEmpty()) {
            adminMessageRepository.deleteAll(old);
            log.info("Deleted {} messages older than 24 hours", old.size());
        }
    }

    private MessageResponseDto toDto(AdminMessage m) {
        return new MessageResponseDto(
                m.getId(),
                m.getRecipientEmployeeId(),
                m.getRecipientName(),
                m.getMessageText(), // ISSUE 3 FIX: full text
                m.getCreatedAt());
    }
}
