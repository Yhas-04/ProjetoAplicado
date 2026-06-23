package com.projetoaplicadoI.centralizador.domain.service;

import com.projetoaplicadoI.centralizador.domain.model.User;
import com.projetoaplicadoI.centralizador.domain.port.in.LoginUseCase;
import com.projetoaplicadoI.centralizador.domain.port.out.TokenServicePort;
import com.projetoaplicadoI.centralizador.domain.port.out.UserRepositoryPort;

public class LoginService implements LoginUseCase {

    private final UserRepositoryPort userRepository;
    private final TokenServicePort tokenService;
    private final PasswordEncoderPort passwordEncoder;

    public LoginService(UserRepositoryPort userRepository,
                        TokenServicePort tokenService,
                        PasswordEncoderPort passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public String execute(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return tokenService.generateToken(user);
    }
}