package com.projetoaplicadoI.centralizador.domain.port.out;

import java.math.BigDecimal;

public interface LocationProvider {
    BigDecimal realValue();
    String nameProvider();
}
