package com.safekab.market.token;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtBuilder implements TokenBuilder {

    private final long accessTokenValidityMs;
    private final long refreshTokenValidityMs;
    private final String issuer;
    private final Key signingKey;

    // Values are passed in via constructor (configured in a @Configuration class)
    public JwtBuilder(long accessTokenValidityMs, long refreshTokenValidityMs, String secretKey, String issuer) {
        this.accessTokenValidityMs = accessTokenValidityMs;
        this.refreshTokenValidityMs = refreshTokenValidityMs;
        this.issuer = issuer;
        // create a proper Key for HMAC signing; secretKey should be long enough for
        // HS256 (>= 32 bytes)
        this.signingKey = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Token createToken(String userId, TokenType tokenType, List<String> roles) {
        long now = System.currentTimeMillis();
        long validity = tokenType == TokenType.ACCESS ? accessTokenValidityMs : refreshTokenValidityMs;

        String jti = UUID.randomUUID().toString();

        String tokenString = Jwts.builder()
                .setId(jti)
                .setSubject(String.valueOf(userId))
                .setIssuer(issuer)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + validity))
                .claim("typ", tokenType.name())
                .claim("roles", roles)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();

        return new JwtToken(tokenString, Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseClaimsJws(tokenString), tokenType);
    }

    @Override
    public Token parseToken(String tokenString) {
        Jws<Claims> jws = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseClaimsJws(tokenString);
        return new JwtToken(tokenString, jws, TokenType
                .valueOf(jws.getBody().get("typ", String.class)));
    }

}
