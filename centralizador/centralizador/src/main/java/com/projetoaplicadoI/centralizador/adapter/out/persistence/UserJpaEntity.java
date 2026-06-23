package com.projetoaplicadoI.centralizador.adapter.out.persistence;

import java.util.Set;

import com.projetoaplicadoI.centralizador.domain.model.Role;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
class UserJpaEntity {

    @Id
    private String id;

    private String name;

    @Column(unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<Role> roles;

    protected UserJpaEntity() {}

    UserJpaEntity(String id, String name, String email, String passwordHash, Set<Role> roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles;
    }

    String getId() { return id; }
    String getName() { return name; }
    String getEmail() { return email; }
    String getPasswordHash() { return passwordHash; }
    Set<Role> getRoles() { return roles; }
}