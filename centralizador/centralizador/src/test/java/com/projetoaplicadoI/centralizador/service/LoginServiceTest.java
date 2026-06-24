package com.projetoaplicadoI.centralizador.service;

import com.projetoaplicadoI.centralizador.domain.model.Role;
import com.projetoaplicadoI.centralizador.domain.model.User;
import com.projetoaplicadoI.centralizador.domain.port.out.TokenServicePort;
import com.projetoaplicadoI.centralizador.domain.port.out.UserRepositoryPort;
import com.projetoaplicadoI.centralizador.domain.service.LoginService;
import com.projetoaplicadoI.centralizador.domain.service.PasswordEncoderPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoginServiceTest {

    @Mock
    private UserRepositoryPort userRepository;

    @Mock
    private TokenServicePort tokenService;

    @Mock
    private PasswordEncoderPort passwordEncoder;

    @InjectMocks
    private LoginService loginService;

    private User user;

    @BeforeEach
    void setUp() {
        // ★ CORRIGIDO: Usando o construtor com 5 parâmetros ★
        user = new User(
                "123e4567-e89b-12d3-a456-426614174000",  // ← ID (String, não Long)
                "Usuario Teste",                          // ← name
                "aa@gmail.com",                           // ← email
                "hashed_password",                        // ← passwordHash
                Set.of(Role.USER)                         // ← roles
        );
    }

    @Test
    void shouldReturnTokenWhenCredentialsAreValid() {
        when(userRepository.findByEmail("aa@gmail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123123", "hashed_password")).thenReturn(true);
        when(tokenService.generateToken(user)).thenReturn("jwt_token");

        String token = loginService.execute("aa@gmail.com", "123123");

        assertEquals("jwt_token", token);
        verify(userRepository, times(1)).findByEmail("aa@gmail.com");
        verify(passwordEncoder, times(1)).matches("123123", "hashed_password");
        verify(tokenService, times(1)).generateToken(user);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail("naoexiste@gmail.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> loginService.execute("naoexiste@gmail.com", "123"));
    }

    @Test
    void shouldThrowExceptionWhenPasswordIsWrong() {
        when(userRepository.findByEmail("aa@gmail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("senha_errada", "hashed_password")).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> loginService.execute("aa@gmail.com", "senha_errada"));
    }
}