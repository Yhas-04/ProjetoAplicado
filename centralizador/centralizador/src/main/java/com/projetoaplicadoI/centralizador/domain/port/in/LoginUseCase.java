package com.projetoaplicadoI.centralizador.domain.port.in;

public interface LoginUseCase {
    String execute(String email, String password);
}