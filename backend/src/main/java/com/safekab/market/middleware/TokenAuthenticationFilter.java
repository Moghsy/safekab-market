package com.safekab.market.middleware;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.safekab.market.token.Token;
import com.safekab.market.token.TokenBuilder;
import com.safekab.market.token.TokenType;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private final TokenBuilder tokenBuilder;

    public TokenAuthenticationFilter(TokenBuilder tokenBuilder) {
        this.tokenBuilder = tokenBuilder;
    }

    @Override
    @SuppressWarnings("UseSpecificCatch")
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String token = extractToken(request);
        if (token == null || token.equals("")) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            Token parsedToken = tokenBuilder.parseToken(token);
            if (parsedToken == null || !parsedToken.isValid(TokenType.ACCESS)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            } else {
                Long principal = Long.valueOf(parsedToken.getSubject());
                List<String> roles = parsedToken.getRoles();
                List<GrantedAuthority> authorities = roles == null ? List.of()
                        : roles.stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                .collect(Collectors.toList());
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                filterChain.doFilter(request, response);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    private String extractToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }

}
