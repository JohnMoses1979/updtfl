// package com.blisssierra.hrms.entity;

// import java.time.LocalDateTime;

// import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.PrePersist;
// import jakarta.persistence.PreUpdate;
// import jakarta.persistence.Table;
// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Entity
// @Table(name = "employees")
// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
// public class Employee {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @Column(nullable = false)
//     private String name;

//     @Column(nullable = false, unique = true)
//     private String email;

//     @Column(name = "emp_id", nullable = false, unique = true)
//     private String empId;

//     @Column(nullable = false)
//     private String designation;

//     @Column(nullable = false)
//     private String password;

//     @Column(name = "face_image_paths", columnDefinition = "TEXT")
//     private String faceImagePaths;

//     @Column(name = "is_verified", nullable = false)
//     private boolean verified = false;

//     @Column(name = "emp_code")
//     private String empCode;

//     @Column(name = "monthly_salary")
//     private double monthlySalary;

//     @Column(name = "profile_image", columnDefinition = "TEXT")
//     private String profileImage;

//     @Column(name = "created_at")
//     private LocalDateTime createdAt;

//     @Column(name = "updated_at")
//     private LocalDateTime updatedAt;

//     @PrePersist
//     protected void onCreate() {
//         createdAt = LocalDateTime.now();
//         updatedAt = LocalDateTime.now();
//     }

//     @PreUpdate
//     protected void onUpdate() {
//         updatedAt = LocalDateTime.now();
//     }
// }

package com.blisssierra.hrms.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "emp_id", nullable = false, unique = true)
    private String empId;

    @Column(nullable = false)
    private String designation;

    @Column(nullable = false)
    private String password;

    @Column(name = "face_image_paths", columnDefinition = "TEXT")
    private String faceImagePaths;

    @Column(name = "is_verified", nullable = false)
    private boolean verified = false;

    // NEW: Admin must approve employee before they can log in
    @Column(name = "is_approved", nullable = false)
    private boolean approved = false;

    @Column(name = "emp_code")
    private String empCode;

    @Column(name = "monthly_salary")
    private double monthlySalary;

    @Column(name = "profile_image", columnDefinition = "TEXT")
    private String profileImage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}