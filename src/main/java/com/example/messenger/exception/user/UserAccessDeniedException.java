package com.example.messenger.exception.user;

import java.nio.file.AccessDeniedException;

public class UserAccessDeniedException extends RuntimeException {
    public UserAccessDeniedException() {
        super("Denied access");
    }

}
