package com.projetoaplicadoI.centralizador.domain.port.in;

import com.projetoaplicadoI.centralizador.domain.model.Queries;

import java.math.BigDecimal;
import java.util.List;

public interface RideProvider {
    BigDecimal estimateValue();
    List<Queries> listLastQueriesByProvider(RideProvider rideProvider);

}
