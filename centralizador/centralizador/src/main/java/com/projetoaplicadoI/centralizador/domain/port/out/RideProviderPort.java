package com.projetoaplicadoI.centralizador.domain.port.out;

import com.projetoaplicadoI.centralizador.domain.model.Location;
import com.projetoaplicadoI.centralizador.domain.model.Quote;

public interface RideProviderPort {
    Quote getQuote(Location origin, Location destination);
    String getProviderName();
}