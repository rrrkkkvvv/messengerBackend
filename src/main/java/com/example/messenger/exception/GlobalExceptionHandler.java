package com.example.messenger.exception;

import com.example.messenger.exception.conversation.ConversationNotFoundException;
import com.example.messenger.exception.user.InvalidCredentialsException;
import com.example.messenger.exception.user.UserNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice

public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(
            Exception ex
    ){
        ErrorResponseDTO errorDTO = new ErrorResponseDTO("Internal server error");
        log.error("Handle exception ",ex);
        return ResponseEntity
                .status(500)
                .body(errorDTO);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity
                .status(400)
                .body(errors);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<?> handleInvalidCredentials(InvalidCredentialsException ex) {
        log.error("Handle exception ",ex);
        return ResponseEntity.status(409).body(new ErrorResponseDTO(ex.getMessage() ));
    }


    @ExceptionHandler(exception ={UserNotFoundException.class,  ConversationNotFoundException.class})
    public ResponseEntity<?> handleNotFound(UserNotFoundException ex) {
        log.error("Handle exception ",ex);
        return ResponseEntity.status(404).body(new ErrorResponseDTO(ex.getMessage() ));
    }


}
