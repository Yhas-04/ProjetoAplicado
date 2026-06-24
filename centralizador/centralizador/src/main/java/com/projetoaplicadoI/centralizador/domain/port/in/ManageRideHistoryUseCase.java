package com.projetoaplicadoI.centralizador.domain.port.in;

import java.util.List;

import com.projetoaplicadoI.centralizador.domain.model.RideHistoryEntry;

public interface ManageRideHistoryUseCase {
    RideHistoryEntry save(RideHistoryEntry entry);
    List<RideHistoryEntry> listByUser(Long userId);
    void delete(Long userId, Long id);
    long countByUser(Long userId);
}