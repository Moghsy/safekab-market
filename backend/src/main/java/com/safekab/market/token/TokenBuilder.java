package com.safekab.market.token;

import java.util.List;

public interface TokenBuilder {
    Token createToken(String userId, TokenType tokenType, List<String> roles);

    Token parseToken(String tokenString);
}
