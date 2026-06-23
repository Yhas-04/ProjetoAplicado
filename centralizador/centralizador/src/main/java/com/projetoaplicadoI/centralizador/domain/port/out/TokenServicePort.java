package com.projetoaplicadoI.centralizador.domain.port.out;

import com.projetoaplicadoI.centralizador.domain.model.User;

public interface TokenServicePort {
    String generateToken(User user);
    String extractEmail(String token);
    boolean isTokenValid(String token);
}