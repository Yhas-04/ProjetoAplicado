package com.projetoaplicadoI.centralizador.domain.port.out;

import java.util.List;
import java.util.Optional;

import com.projetoaplicadoI.centralizador.domain.model.FavoriteApp;
import com.projetoaplicadoI.centralizador.domain.model.FavoriteRoute;

public interface FavoriteRepositoryPort {
    FavoriteApp saveApp(FavoriteApp app);
    void deleteApp(Long id);
    Optional<FavoriteApp> findAppByUserAndProvider(Long userId, String provider);
    List<FavoriteApp> findAppsByUser(Long userId);
    FavoriteRoute saveRoute(FavoriteRoute route);
    void deleteRoute(Long id);
    Optional<FavoriteRoute> findRouteById(Long id);
    List<FavoriteRoute> findRoutesByUser(Long userId);
    long countByUser(Long userId);
}