package com.blisssierra.hrms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.blisssierra.hrms.dto.MessageResponseDto;
import com.blisssierra.hrms.dto.SendMessageRequest;
import com.blisssierra.hrms.dto.UserOptionDto;
import com.blisssierra.hrms.service.MessageService;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"*"})
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserOptionDto>> getUsers(
            @RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(messageService.getUsers(search));
    }

    @PostMapping("/send")
    public ResponseEntity<MessageResponseDto> sendMessage(@RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(request));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<MessageResponseDto>> getMessagesForEmployee(@PathVariable String employeeId) {
        return ResponseEntity.ok(messageService.getMessagesForEmployee(employeeId));
    }
}