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
import com.blisssierra.hrms.entity.Employee;
import com.blisssierra.hrms.repository.AdminMessageRepository;
import com.blisssierra.hrms.repository.EmployeeRepository;

@Service
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    private final EmployeeRepository employeeRepository;
    private final AdminMessageRepository adminMessageRepository;

    public MessageService(EmployeeRepository employeeRepository,
            AdminMessageRepository adminMessageRepository) {
        this.employeeRepository = employeeRepository;
        this.adminMessageRepository = adminMessageRepository;
    }

    public List<UserOptionDto> getUsers(String search) {
        List<Employee> users;
        if (search == null || search.trim().isEmpty()) {
            users = employeeRepository.findTop20ByOrderByNameAsc();
        } else {
            users = employeeRepository.findTop20ByNameContainingIgnoreCaseOrderByNameAsc(search.trim());
        }
        return users.stream()
                .map(u -> new UserOptionDto(u.getId(), u.getEmpId(), u.getName()))
                .toList();
    }

    public MessageResponseDto sendMessage(SendMessageRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Message is required");
        }

        if (request.getEmployeeId() == null ||
                request.getEmployeeId().trim().isEmpty() ||
                "ALL".equalsIgnoreCase(request.getEmployeeId().trim())) {
            return sendBroadcastMessage(request.getMessage().trim());
        }

        String employeeId = request.getEmployeeId().trim().toUpperCase();
        Employee user = employeeRepository.findByEmpId(employeeId)
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found for employeeId: " + request.getEmployeeId()));

        AdminMessage adminMessage = new AdminMessage();
        adminMessage.setRecipientUserId(user.getId());
        adminMessage.setRecipientEmployeeId(user.getEmpId());
        adminMessage.setRecipientName(user.getName());
        adminMessage.setMessageText(request.getMessage().trim());
        adminMessage.setIsBroadcast(false);

        AdminMessage saved = adminMessageRepository.save(adminMessage);
        log.info("Message sent to employeeId={}: {}", user.getEmpId(), saved.getId());
        return toDto(saved);
    }

    private MessageResponseDto sendBroadcastMessage(String messageText) {
        List<Employee> allUsers = employeeRepository.findAll();
        if (allUsers.isEmpty()) {
            throw new RuntimeException("No employees found to send broadcast");
        }

        AdminMessage lastSaved = null;
        int count = 0;
        for (Employee user : allUsers) {
            AdminMessage msg = new AdminMessage();
            msg.setRecipientUserId(user.getId());
            msg.setRecipientEmployeeId(user.getEmpId());
            msg.setRecipientName(user.getName());
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

    @Scheduled(cron = "0 0 * * * *")
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
                m.getMessageText(),
                m.getCreatedAt());
    }
}
