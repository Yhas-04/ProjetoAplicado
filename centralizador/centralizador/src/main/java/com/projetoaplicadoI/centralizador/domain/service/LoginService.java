package com.projetoaplicadoI.centralizador.domain.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.projetoaplicadoI.centralizador.domain.model.User;
import com.projetoaplicadoI.centralizador.domain.port.in.LoginUseCase;
import com.projetoaplicadoI.centralizador.domain.port.out.TokenServicePort;
import com.projetoaplicadoI.centralizador.domain.port.out.UserRepositoryPort;

public class LoginService implements LoginUseCase {

    private static final Logger log = LoggerFactory.getLogger(LoginService.class);

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
        log.info("🔍 Tentando login com email: {}", email);

        // Busca o usuário
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("❌ Usuário não encontrado: {}", email);
                    return new IllegalArgumentException("Invalid credentials");
                });

        log.info("✅ Usuário encontrado: {}", user.getEmail());
        log.info("🔐 Hash da senha no banco: {}", user.getPasswordHash());

        // Valida a senha
        boolean matches = passwordEncoder.matches(password, user.getPasswordHash());
        log.info("🔐 Senha informada: {}", password);
        log.info("🔐 Senha válida? {}", matches);

        if (!matches) {
            log.error("❌ Senha inválida para: {}", email);
            throw new IllegalArgumentException("Invalid credentials");
        }

        log.info("✅ Login bem-sucedido para: {}", email);
        String token = tokenService.generateToken(user);
        log.info("🔑 Token gerado: {}", token);
        return token;
    }
}