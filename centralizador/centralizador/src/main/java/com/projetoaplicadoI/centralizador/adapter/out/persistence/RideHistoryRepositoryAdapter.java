package com.projetoaplicadoI.centralizador.adapter.out.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.projetoaplicadoI.centralizador.domain.model.RideHistoryEntry;
import com.projetoaplicadoI.centralizador.domain.port.out.RideHistoryRepositoryPort;

@Component
public class RideHistoryRepositoryAdapter implements RideHistoryRepositoryPort {

    private final RideHistoryJpaRepository repo;

    public RideHistoryRepositoryAdapter(RideHistoryJpaRepository repo) {
        this.repo = repo;
    }

    public RideHistoryEntry save(RideHistoryEntry entry) {
        RideHistoryJpaEntity e = new RideHistoryJpaEntity();
        e.setUserId(entry.getUserId());
        e.setAppProvider(entry.getAppProvider());
        e.setAppName(entry.getAppName());
        e.setOriginName(entry.getOriginName());
        e.setOriginLat(entry.getOriginLat());
        e.setOriginLng(entry.getOriginLng());
        e.setDestinationName(entry.getDestinationName());
        e.setDestinationLat(entry.getDestinationLat());
        e.setDestinationLng(entry.getDestinationLng());
        e.setPrice(entry.getPrice());
        e.setEstimatedTime(entry.getEstimatedTime());
        e.setDistance(entry.getDistance());
        e.setStatus(entry.getStatus());
        return toDomain(repo.save(e));
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    public Optional<RideHistoryEntry> findById(Long id) {
        return repo.findById(id).map(this::toDomain);
    }

    public List<RideHistoryEntry> findByUserId(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDomain).toList();
    }

    public long countByUserId(Long userId) {
        return repo.countByUserId(userId);
    }

    private RideHistoryEntry toDomain(RideHistoryJpaEntity e) {
        RideHistoryEntry entry = new RideHistoryEntry();
        entry.setId(e.getId());
        entry.setUserId(e.getUserId());
        entry.setAppProvider(e.getAppProvider());
        entry.setAppName(e.getAppName());
        entry.setOriginName(e.getOriginName());
        entry.setOriginLat(e.getOriginLat());
        entry.setOriginLng(e.getOriginLng());
        entry.setDestinationName(e.getDestinationName());
        entry.setDestinationLat(e.getDestinationLat());
        entry.setDestinationLng(e.getDestinationLng());
        entry.setPrice(e.getPrice());
        entry.setEstimatedTime(e.getEstimatedTime());
        entry.setDistance(e.getDistance());
        entry.setStatus(e.getStatus());
        entry.setCreatedAt(e.getCreatedAt());
        return entry;
    }
}