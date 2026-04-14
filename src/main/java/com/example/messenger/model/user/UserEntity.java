package com.example.messenger.model.user;


import com.example.messenger.util.PatternConstants;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;



@Entity
@Table(name="users")
public class UserEntity {

    private static final String EMAIL_PATTERN = PatternConstants.EMAIL;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    @NotNull
    @Pattern(regexp = EMAIL_PATTERN, message = "The given email does not match the rules")
    private String email;
    @NotNull
    private String name;
    @Nullable
    private String avatarUrl;

    @Nullable
    private String googleId;
    @Nullable
    private String password;


    public UserEntity(){

    }

    public UserEntity( String email, String name, String avatarUrl, String googleId, String password) {
        this.email = email;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.googleId = googleId;
        this.password = password;
    }
    public UserEntity( String email, String name,  String password) {
        this.email = email;
        this.name = name;
        this.avatarUrl = null;
        this.googleId = null;
        this.password = password;
    }
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    @Nullable
    public String getAvatarUrl() {
        return avatarUrl;
    }

    @Nullable
    public String getGoogleId() {
        return googleId;
    }

    @Nullable
    public String getPassword() {
        return password;
    }
}
