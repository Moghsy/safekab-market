package com.safekab.market.exception;

import org.springframework.http.HttpStatus;

/**
 * Custom runtime exception carrying an HttpStatus for granular error responses.
 */
public class ApiException extends RuntimeException {
    private final HttpStatus status;

    public ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public ApiException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}

