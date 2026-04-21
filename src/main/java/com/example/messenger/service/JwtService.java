package com.example.messenger.service;

import com.example.messenger.model.user.JwtUserSubject;
import com.example.messenger.model.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    @Value("${security.jwt.secret-key}")
    private String secretKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    private long EXPIRATION_TIME = (1000 * 60 * 60)*10;

    public String buildToken(JwtUserSubject jwtUserSubject){
        String subjectJson = objectMapper.writeValueAsString(jwtUserSubject);

        return Jwts
                .builder()
                .setSubject(subjectJson)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public JwtUserSubject extractUserData(String token) {
        return objectMapper.readValue(getClaimsFromToken(token).getSubject(), JwtUserSubject.class);
    }
    private Boolean isTokenExpired(final String token) {
        final Date expiration = getClaimsFromToken(token).getExpiration();
        return expiration.before(new Date());
    }
    public boolean isTokenValid(String token, JwtUserSubject user) {
        final JwtUserSubject userData = extractUserData(token);
        return userData.id().equals(user.id())
                && userData.email().equals(user.email())
                && !isTokenExpired(token);
    }

    private Claims getClaimsFromToken(final String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
