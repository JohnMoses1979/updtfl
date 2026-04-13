package com.blisssierra.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserOptionDto {
    private Long id;
    private String employeeId;
    private String name;

}
