package com.example.messenger.websocket;

import com.example.messenger.model.user.JwtUserSubject;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketSessionListener {
    private final OnlineUsersRegistry onlineUsersRegistry;

    public WebSocketSessionListener(OnlineUsersRegistry onlineUsersRegistry) {
        this.onlineUsersRegistry = onlineUsersRegistry;
    }

    @EventListener
    public void handleConnected(SessionConnectedEvent event){
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor
                .wrap(event.getMessage());
        UsernamePasswordAuthenticationToken auth= (UsernamePasswordAuthenticationToken) accessor.getUser();
        if(auth!= null){

            JwtUserSubject userData = (JwtUserSubject) auth.getPrincipal();
            if(userData!=null){
                onlineUsersRegistry.userConnected(userData.id());
            }
        }
    }
    @EventListener
    public void handleDisconnected(SessionDisconnectEvent event){
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor
                .wrap(event.getMessage());
        UsernamePasswordAuthenticationToken auth= (UsernamePasswordAuthenticationToken) accessor.getUser();
        if(auth!= null){
            JwtUserSubject userData = (JwtUserSubject) auth.getPrincipal();
            if(userData!=null){
                onlineUsersRegistry.userDisconnected(userData.id());
            }


        }
    }
}
