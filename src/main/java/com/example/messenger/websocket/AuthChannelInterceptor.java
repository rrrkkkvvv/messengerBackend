package com.example.messenger.websocket;

 import com.example.messenger.model.user.JwtUserSubject;
 import com.example.messenger.service.JwtService;
 import org.springframework.messaging.Message;
 import org.springframework.messaging.MessageChannel;
 import org.springframework.messaging.simp.stomp.StompCommand;
 import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
 import org.springframework.messaging.support.ChannelInterceptor;
 import org.springframework.messaging.support.MessageHeaderAccessor;
 import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;


 import org.springframework.stereotype.Component;

 import java.util.List;

@Component
public class AuthChannelInterceptor implements  ChannelInterceptor {
    private final JwtService jwtService;

    public AuthChannelInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public Message<?> preSend(final Message<?> message, final MessageChannel channel)  {
        final StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT == accessor.getCommand()) {
            String authHeader =
                    accessor.getFirstNativeHeader("Authorization");


            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing JWT token");
            }
            String token = authHeader.substring(7);
            JwtUserSubject userData = jwtService.extractUserData(token);
            if (userData != null && jwtService.isTokenValid(token, userData)) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userData,
                                null,
                                List.of()
                        );

                accessor.setUser(authToken);
            }
        }

        return message;

    }
}
