package com.projetoaplicadoI.centralizador.domain.service;

import java.util.Set;

import com.projetoaplicadoI.centralizador.domain.model.Role;
import com.projetoaplicadoI.centralizador.domain.model.User;
import com.projetoaplicadoI.centralizador.domain.port.in.RegisterUseCase;
import com.projetoaplicadoI.centralizador.domain.port.out.UserRepositoryPort;

public class RegisterService implements RegisterUseCase {

    private final UserRepositoryPort userRepository;
    private final PasswordEncoderPort passwordEncoder;

    public RegisterService(UserRepositoryPort userRepository,
                           PasswordEncoderPort passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User execute(String name, String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        String passwordHash = passwordEncoder.encode(rawPassword);
        User user = new User(name, email, passwordHash, Set.of(Role.USER));
        return userRepository.save(user);
    }
}