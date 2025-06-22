package com.fidanlik.fidanysserver.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Bu anotasyon, Spring'e bu hatanın 400 Bad Request olarak ele alınması gerektiğini söyler.
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) {
        super(message);
    }
}