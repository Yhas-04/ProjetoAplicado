package com.projetoaplicadoI.centralizador.adapter.out.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteAppJpaRepository extends JpaRepository<FavoriteAppJpaEntity, Long> {
    List<FavoriteAppJpaEntity> findByUserId(Long userId);
    Optional<FavoriteAppJpaEntity> findByUserIdAndAppProvider(Long userId, String provider);
    long countByUserId(Long userId);
}