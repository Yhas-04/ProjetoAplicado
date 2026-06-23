package com.projetoaplicadoI.centralizador.domain.port.out;

import java.util.Optional;

import com.projetoaplicadoI.centralizador.domain.model.User;

public interface UserRepositoryPort {
    User save(User user);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}