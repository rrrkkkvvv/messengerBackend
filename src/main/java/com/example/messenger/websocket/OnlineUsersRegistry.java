package com.example.messenger.websocket;

import com.example.messenger.model.user.OnlineStatusUpdate;
import com.example.messenger.service.WebSocketMessageService;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OnlineUsersRegistry {
    ConcurrentHashMap<Long, Boolean> registry;
    WebSocketMessageService webSocketMessageService;
    public OnlineUsersRegistry(WebSocketMessageService webSocketMessageService){
        this.registry = new ConcurrentHashMap<>();
        this.webSocketMessageService=webSocketMessageService;
    }

    public void userConnected(Long userId){
        if(!registry.containsKey(userId)|| !registry.get(userId)){
            registry.put(userId, true);
            System.out.println("SENDED MSG");
            webSocketMessageService.sendMessage("/topic/onlineStatus", new OnlineStatusUpdate(userId, true));
        }

    }
    public void userDisconected(Long userId){
        if(registry.containsKey(userId)&& registry.get(userId)){
            registry.put(userId, false);
            webSocketMessageService.sendMessage("/topic/onlineStatus", new OnlineStatusUpdate(userId, false));
        }
    }
    public Long[] getOnlineUsers(){
        return registry.entrySet().stream().filter(Map.Entry::getValue).map(Map.Entry::getKey).toArray(Long[]::new);
    }
}
