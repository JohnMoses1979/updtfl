package com.blisssierra.hrms.dto;

 
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MessageResponseDto {
    private Long id;
    private String employeeId;
    private String recipientName;
    private String messageText;
    private LocalDateTime createdAt;

}
