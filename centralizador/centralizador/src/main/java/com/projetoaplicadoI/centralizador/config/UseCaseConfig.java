package com.projetoaplicadoI.centralizador.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.projetoaplicadoI.centralizador.domain.port.in.LoginUseCase;
import com.projetoaplicadoI.centralizador.domain.port.in.RegisterUseCase;
import com.projetoaplicadoI.centralizador.domain.port.out.TokenServicePort;
import com.projetoaplicadoI.centralizador.domain.port.out.UserRepositoryPort;
import com.projetoaplicadoI.centralizador.domain.service.LoginService;
import com.projetoaplicadoI.centralizador.domain.service.PasswordEncoderPort;
import com.projetoaplicadoI.centralizador.domain.service.RegisterService;

@Configuration
public class UseCaseConfig {

    @Bean
    public LoginUseCase loginUseCase(UserRepositoryPort userRepository,
                                     TokenServicePort tokenService,
                                     PasswordEncoderPort passwordEncoder) {
        return new LoginService(userRepository, tokenService, passwordEncoder);
    }

    @Bean
    public RegisterUseCase registerUseCase(UserRepositoryPort userRepository,
                                           PasswordEncoderPort passwordEncoder) {
        return new RegisterService(userRepository, passwordEncoder);
    }
}