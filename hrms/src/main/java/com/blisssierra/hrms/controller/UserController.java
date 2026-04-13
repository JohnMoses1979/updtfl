// package com.blisssierra.hrms.controller;

 
// import jakarta.validation.Valid;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.PutMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import com.blisssierra.hrms.dto.ApiResponse;
// import com.blisssierra.hrms.dto.AppUserRequest;
// import com.blisssierra.hrms.entity.AppUser;
// import com.blisssierra.hrms.service.TaskService;

// import java.util.List;

// @RestController
// @RequestMapping("/api/users")
// public class UserController {

//     private final TaskService taskService;

//     public UserController(TaskService taskService) {
//         this.taskService = taskService;
//     }

//     @GetMapping
//     public ApiResponse<List<AppUser>> getUsers() {
//         return new ApiResponse<>(true, "Users fetched successfully", taskService.getAllUsers());
//     }

//     @GetMapping("/search")
//     public ApiResponse<List<AppUser>> searchUsers(@RequestParam String query) {
//         return new ApiResponse<>(true, "Users fetched successfully", taskService.searchUsers(query));
//     }

//     @GetMapping("/employee/{employeeId}")
//     public ApiResponse<AppUser> getUserByEmployeeId(@PathVariable String employeeId) {
//         return new ApiResponse<>(true, "User fetched successfully", taskService.getUserByEmployeeId(employeeId));
//     }

//     @PostMapping
//     public ApiResponse<AppUser> createUser(@Valid @RequestBody AppUserRequest request) {
//         return new ApiResponse<>(true, "User created successfully", taskService.createUser(request));
//     }

//     @PutMapping("/{employeeId}")
//     public ApiResponse<AppUser> updateUser(@PathVariable String employeeId, @Valid @RequestBody AppUserRequest request) {
//         return new ApiResponse<>(true, "User updated successfully", taskService.updateUser(employeeId, request));
//     }

//     @DeleteMapping("/{employeeId}")
//     public ApiResponse<Void> deleteUser(@PathVariable String employeeId) {
//         taskService.deleteUser(employeeId);
//         return new ApiResponse<>(true, "User deleted successfully", null);
//     }
// }
