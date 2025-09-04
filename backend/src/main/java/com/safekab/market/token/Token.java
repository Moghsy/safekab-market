package com.safekab.market.token;

import java.util.Date;
import java.util.List;

public interface Token {

  String getToken();

  String getType();

  String getIssuer();

  String getSubject();

  String getAudience();

  List<String> getRoles();

  Date getExpirationTime();

  Date getIssuedAtTime();

  String getId();

  String getString();

  TokenType getTokenType();

  boolean isValid(TokenType type);
}