package com.blisssierra.hrms.security;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
            String empId = jwtUtil.getEmpId(token);
            String role  = jwtUtil.getRole(token);
            Long   uid   = jwtUtil.getUserId(token);

            log.debug("JWT valid — empId={} role={} uid={}", empId, role, uid);

            // Build authority from the role claim (no DB round-trip needed)
            var auth = new UsernamePasswordAuthenticationToken(
                    empId,
                    null,
                    List.of(new SimpleGrantedAuthority(role))
            );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Store userId as detail so controllers can read it for ownership checks
            request.setAttribute("jwt_uid", uid);
            request.setAttribute("jwt_empId", empId);
            request.setAttribute("jwt_role", role);

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}