package com.safekab.market.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.safekab.market.middleware.TokenAuthenticationFilter;
import com.safekab.market.token.JwtBuilder;
import com.safekab.market.token.TokenBuilder;

@Configuration
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public TokenBuilder tokenBuilder(
            @Value("${app.token.accessExpiration:900000}") long accessTokenValidityMs,
            @Value("${app.token.refreshExpiration:604800000}") long refreshTokenValidityMs,
            @Value("${app.token.secret:safekab_secret_key}") String secretKey,
            @Value("${app.token.issuer:safekab}") String issuer,
            @Value("${app.token.type:JWT}") String tokenType) {

        if (tokenType.equalsIgnoreCase("JWT")) {
            return new JwtBuilder(accessTokenValidityMs, refreshTokenValidityMs, secretKey, issuer);
        }
        throw new IllegalArgumentException("Unsupported token type for app.token.type: " + tokenType);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, TokenBuilder tokenBuilder) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/*").permitAll()
                        .requestMatchers("/api/payment/webhook").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products", "/api/products/*")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/config").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.addFilterBefore(new TokenAuthenticationFilter(tokenBuilder), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private UrlBasedCorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        // Split, trim and ignore empty entries to avoid registering invalid origins
        for (String origin : allowedOrigins.split(",")) {
            String o = origin.trim();
            if (!o.isEmpty()) {
                config.addAllowedOrigin(o);
            }
        }
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
