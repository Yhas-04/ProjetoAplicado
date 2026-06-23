package com.projetoaplicadoI.centralizador.domain.port.in;

import com.projetoaplicadoI.centralizador.domain.model.User;

public interface RegisterUseCase {
    User execute(String name, String email, String rawPassword);
}