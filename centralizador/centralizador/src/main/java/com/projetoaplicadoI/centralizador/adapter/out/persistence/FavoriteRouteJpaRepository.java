package com.projetoaplicadoI.centralizador.adapter.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRouteJpaRepository extends JpaRepository<FavoriteRouteJpaEntity, Long> {
    List<FavoriteRouteJpaEntity> findByUserId(Long userId);
    long countByUserId(Long userId);
}