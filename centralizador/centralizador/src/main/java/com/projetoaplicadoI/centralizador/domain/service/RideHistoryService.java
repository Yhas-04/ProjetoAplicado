package com.projetoaplicadoI.centralizador.domain.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.projetoaplicadoI.centralizador.domain.model.RideHistoryEntry;
import com.projetoaplicadoI.centralizador.domain.port.in.ManageRideHistoryUseCase;
import com.projetoaplicadoI.centralizador.domain.port.out.RideHistoryRepositoryPort;

@Service
public class RideHistoryService implements ManageRideHistoryUseCase {

    private final RideHistoryRepositoryPort repo;

    public RideHistoryService(RideHistoryRepositoryPort repo) {
        this.repo = repo;
    }

    public RideHistoryEntry save(RideHistoryEntry entry) {
        return repo.save(entry);
    }

    public List<RideHistoryEntry> listByUser(Long userId) {
        return repo.findByUserId(userId);
    }

    public void delete(Long userId, Long id) {
        repo.findById(id)
                .filter(e -> e.getUserId().equals(userId))
                .ifPresent(e -> repo.deleteById(id));
    }

    public long countByUser(Long userId) {
        return repo.countByUserId(userId);
    }
}