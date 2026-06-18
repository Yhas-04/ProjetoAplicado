package com.projetoaplicadoI.centralizador.domain.port.in;

import java.math.BigDecimal;
import java.util.List;

public interface RideProvider {
    BigDecimal estimateValue();
    List<Queries> listLastQueriesByProvider(RideProvider rideProvider);

}
