package com.safekab.market.exception;

import com.safekab.market.exception.ErrorResponse.FieldValidationError;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Centralized REST exception handling. All exceptions bubble up here and are
 * converted into a consistent
 * JSON structure (ErrorResponse).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, String path,
      List<FieldValidationError> validationErrors) {
    ErrorResponse body = ErrorResponse.builder()
        .status(status.value())
        .error(status.getReasonPhrase())
        .message(message)
        .path(path)
        .validationErrors(validationErrors)
        .build();
    return ResponseEntity.status(status).body(body);
  }

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ErrorResponse> handleApiException(ApiException ex, HttpServletRequest request) {
    log.warn("API error: {} - {}", ex.getStatus(), ex.getMessage());
    return build(ex.getStatus(), ex.getMessage(), request.getRequestURI(), null);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
      HttpServletRequest request) {
    List<FieldValidationError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
        .map(this::mapFieldError)
        .collect(Collectors.toList());
    String message = "Validation failed for one or more fields";
    return build(HttpStatus.BAD_REQUEST, message, request.getRequestURI(), fieldErrors);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponse> handleNotReadable(HttpMessageNotReadableException ex,
      HttpServletRequest request) {
    log.debug("Malformed JSON request", ex);
    return build(HttpStatus.BAD_REQUEST, "Malformed JSON request", request.getRequestURI(), null);
  }

  @ExceptionHandler({ MissingServletRequestParameterException.class })
  public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex,
      HttpServletRequest request) {
    String message = String.format("Missing required parameter '%s'", ex.getParameterName());
    return build(HttpStatus.BAD_REQUEST, message, request.getRequestURI(), null);
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
      HttpServletRequest request) {
    return build(HttpStatus.METHOD_NOT_ALLOWED, ex.getMessage(), request.getRequestURI(), null);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
    return build(HttpStatus.FORBIDDEN, "Access is denied", request.getRequestURI(), null);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleAuth(AuthenticationException ex, HttpServletRequest request) {
    return build(HttpStatus.UNAUTHORIZED, "Authentication failed", request.getRequestURI(), null);
  }

  @ExceptionHandler(JwtException.class)
  public ResponseEntity<ErrorResponse> handleJwt(JwtException ex, HttpServletRequest request) {
    return build(HttpStatus.UNAUTHORIZED, "Invalid or expired token", request.getRequestURI(), null);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
    log.error("Unexpected error", ex);
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request.getRequestURI(), null);
  }

  private FieldValidationError mapFieldError(FieldError fe) {
    return FieldValidationError.builder()
        .field(fe.getField())
        .message(fe.getDefaultMessage())
        .build();
  }
}
