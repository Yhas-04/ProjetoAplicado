package com.projetoaplicadoI.centralizador.domain.port.out;
public interface TokenGenerator {

    String generate(String userId, String email);

    String extractEmail(String token);

    boolean isValid(String token);
}