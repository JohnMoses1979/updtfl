package com.blisssierra.hrms.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity           // enables @PreAuthorize on controllers
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final AuthEntryPoint authEntryPoint;

    public SecurityConfig(JwtFilter jwtFilter, AuthEntryPoint authEntryPoint) {
        this.jwtFilter = jwtFilter;
        this.authEntryPoint = authEntryPoint;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ── CORS / CSRF ──────────────────────────────────────────────
                .cors(c -> c.configurationSource(corsSource()))
                .csrf(csrf -> csrf.disable())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                // ── Session ──────────────────────────────────────────────────
                .sessionManagement(sm
                        -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // ── Exception handlers ───────────────────────────────────────
                .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authEntryPoint) // 401
                .accessDeniedHandler(authEntryPoint)) // 403

                // ── Route rules ──────────────────────────────────────────────
                .authorizeHttpRequests(auth -> auth
                // ── Public endpoints (no token needed) ───────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                        "/api/auth/signup",
                        "/api/auth/verify-otp",
                        "/api/auth/resend-otp",
                        "/api/auth/login",
                        "/api/auth/forgot-password",
                        "/api/auth/verify-forgot-otp",
                        "/api/auth/reset-password",
                        "/api/auth/health",
                        "/"
                ).permitAll()
                // ── ADMIN-only routes ─────────────────────────────────────
                .requestMatchers(
                        "/api/employees/admin-notifications/**",
                        "/api/employees/pending-approval",
                        "/api/employees/*/approve",
                        "/api/employees/*/reject",
                        "/api/leave/admin/**",
                        "/api/payroll/admin/**",
                        "/api/tasks/admin/**",
                        "/api/messages/send",
                        "/api/messages/users",
                        "/api/app-users/**",
                        "/api/seed/**"
                ).hasRole("ADMIN")
                // ── EMPLOYEE-or-ADMIN routes ──────────────────────────────
                .requestMatchers(
                        "/api/attendance/check-in",
                        "/api/attendance/check-out",
                        "/api/attendance/history/**",
                        "/api/attendance/status/**",
                        "/api/leave/user/**",
                        "/api/leave/apply",
                        "/api/payroll/salary/**",
                        "/api/payroll/history/**",
                        "/api/payslip/**",
                        "/api/tasks/user/**",
                        "/api/messages/employee/**",
                        "/api/employees/by-empid/**",
                        "/api/employees/profile/**"
                ).authenticated()
                .requestMatchers(
                        "/api/attendance",
                        "/api/attendance/all"
                ).hasRole("ADMIN")
                // ── Employee management (CRUD) — ADMIN only ───────────────
                .requestMatchers(HttpMethod.POST, "/api/employees").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/employees/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/employees/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/employees").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/employees/{id}").hasRole("ADMIN")
                .anyRequest().authenticated()
                )
                // ── JWT filter runs before Spring's auth filter ──────────────
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("*"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
