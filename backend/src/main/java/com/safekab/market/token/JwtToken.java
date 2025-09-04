package com.safekab.market.token;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;

public class JwtToken implements Token {
    private final String tokenString;
    private final Jws<Claims> jws;
    private final TokenType tokenType;

    public JwtToken(String tokenString, Jws<Claims> jws, TokenType tokenType) {
        this.tokenString = tokenString;
        this.jws = jws;
        this.tokenType = tokenType;
    }

    @Override
    public String getToken() {
        return tokenString;
    }

    @Override
    public String getType() {
        return "Bearer";
    }

    @Override
    public TokenType getTokenType() {
        return tokenType;
    }

    @Override
    public List<String> getRoles() {
        List<?> ls = jws.getBody().get("roles", List.class);
        if (ls instanceof List) {
            return ls.stream()
                    .filter(Objects::nonNull)
                    .map(String::valueOf)
                    .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }

    @Override
    public String getIssuer() {
        return jws.getBody().getIssuer();
    }

    @Override
    public String getSubject() {
        return jws.getBody().getSubject();
    }

    @Override
    public String getAudience() {
        return jws.getBody().getAudience();
    }

    @Override
    public Date getExpirationTime() {
        return jws.getBody().getExpiration();
    }

    @Override
    public Date getIssuedAtTime() {
        return jws.getBody().getIssuedAt();
    }

    @Override
    public String getId() {
        return jws.getBody().getId();
    }

    @Override
    public String getString() {
        return jws.getBody().getId();
    }

    @Override
    public boolean isValid(TokenType type) {
        return !getExpirationTime().before(new Date()) && getTokenType().equals(type);
    }

}