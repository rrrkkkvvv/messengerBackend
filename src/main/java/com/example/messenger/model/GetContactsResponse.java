package com.example.messenger.model;

import java.util.List;

public record GetContactsResponse(
        List<ContactPreviewDto> contactsList ,
        Long[] onlineUserIds
        ) {
}
