package com.projetoaplicadoI.centralizador.domain.port.in;

import com.projetoaplicadoI.centralizador.domain.model.Ride;

public interface CompareRideUseCase {
    Ride execute(CompareRideCommand command);
}
