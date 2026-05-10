package com.example.messenger.model.message;



import com.example.messenger.model.user.UserEntity;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;

import java.util.Date;
import java.util.Set;

public record Message(
        @NotNull
        Long id,

        @Nullable
        boolean isCallInfo,
        @Nullable
        boolean isAnswered,
        @Nullable
        boolean isEnded,
        @Nullable
        Long duration,
        @Nullable
        boolean isAudioMessage,
        @Nullable
        String audioMessage,
        @Nullable
        String messageText,
        @Nullable
        String messageImage,
        @Nullable
        Date editedAt,
        @NotNull
        Date sentAt,
        @NotNull
        Set<UserEntity> seenUsers

) {
}
