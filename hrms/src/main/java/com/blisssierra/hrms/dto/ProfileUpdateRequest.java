package com.blisssierra.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String dob;
    private String designation;
    private String country;
    private String state;
    private String city;
    private String address;
    private String avatarUri; // base64 or URL
}