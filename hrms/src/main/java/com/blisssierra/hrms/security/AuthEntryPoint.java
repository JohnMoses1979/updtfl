package com.blisssierra.hrms.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class AuthEntryPoint
        implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * 401 — no token / invalid token
     */
    @Override
    public void commence(HttpServletRequest req,
            HttpServletResponse res,
            AuthenticationException ex)
            throws IOException {
        write(res, HttpServletResponse.SC_UNAUTHORIZED,
                "Unauthorized", "Authentication token is missing or invalid");
    }

    /**
     * 403 — valid token, wrong role
     */
    @Override
    public void handle(HttpServletRequest req,
            HttpServletResponse res,
            AccessDeniedException ex)
            throws IOException {
        write(res, HttpServletResponse.SC_FORBIDDEN,
                "Forbidden", "You do not have permission to access this resource");
    }

    private void write(HttpServletResponse res, int status,
            String error, String message) throws IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(res.getWriter(),
                Map.of("status", "error",
                        "error", error,
                        "message", message));
    }
}
