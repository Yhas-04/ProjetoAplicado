package com.projetoaplicadoI.centralizador.adapter.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RideHistoryJpaRepository extends JpaRepository<RideHistoryJpaEntity, Long> {
    List<RideHistoryJpaEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}