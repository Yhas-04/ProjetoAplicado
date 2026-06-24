package com.projetoaplicadoI.centralizador.domain.port.out;

import java.util.List;
import java.util.Optional;

import com.projetoaplicadoI.centralizador.domain.model.RideHistoryEntry;

public interface RideHistoryRepositoryPort {
    RideHistoryEntry save(RideHistoryEntry entry);
    void deleteById(Long id);
    Optional<RideHistoryEntry> findById(Long id);
    List<RideHistoryEntry> findByUserId(Long userId);
    long countByUserId(Long userId);
}