package com.example.messenger.config;

import com.example.messenger.mapper.UserMapper;
import com.example.messenger.model.user.JwtUserSubject;
import com.example.messenger.model.user.User;
import com.example.messenger.model.user.UserEntity;
import com.example.messenger.service.JwtService;
import com.example.messenger.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthFilter extends OncePerRequestFilter {
     private final JwtService jwtService;
    private final UserService userService;
    private final UserMapper userMapper;

    @Autowired
    public JwtAuthFilter( JwtService jwtService,UserService userService, UserMapper userMapper) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.userMapper = userMapper;

    }


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        JwtUserSubject userData = jwtService.extractUserData(token);

        if (userData != null && jwtService.isTokenValid(token, userData)) {

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userData,
                            null,
                            List.of()
                    );

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }


}
