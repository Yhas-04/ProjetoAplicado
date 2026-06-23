package com.projetoaplicadoI.centralizador.domain.model;

import java.util.Set;
import java.util.UUID;

public class User {

    private final String id;
    private final String name;
    private final String email;
    private final String passwordHash;
    private final Set<Role> roles;

    public User(String name, String email, String passwordHash, Set<Role> roles) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles;
    }

    public User(String id, String name, String email, String passwordHash, Set<Role> roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Set<Role> getRoles() { return roles; }
}