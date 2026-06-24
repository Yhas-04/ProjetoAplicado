package com.projetoaplicadoI.centralizador.domain.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.projetoaplicadoI.centralizador.domain.model.FavoriteApp;
import com.projetoaplicadoI.centralizador.domain.model.FavoriteRoute;
import com.projetoaplicadoI.centralizador.domain.port.in.ManageFavoritesUseCase;
import com.projetoaplicadoI.centralizador.domain.port.out.FavoriteRepositoryPort;

@Service
public class FavoriteService implements ManageFavoritesUseCase {

    private final FavoriteRepositoryPort repo;

    public FavoriteService(FavoriteRepositoryPort repo) {
        this.repo = repo;
    }

    public FavoriteApp addFavoriteApp(FavoriteApp app) {
        return repo.findAppByUserAndProvider(app.getUserId(), app.getAppProvider())
                .orElseGet(() -> repo.saveApp(app));
    }

    public void removeFavoriteApp(Long userId, String appProvider) {
        repo.findAppByUserAndProvider(userId, appProvider)
                .ifPresent(app -> repo.deleteApp(app.getId()));
    }

    public List<FavoriteApp> listFavoriteApps(Long userId) {
        return repo.findAppsByUser(userId);
    }

    public boolean isAppFavorite(Long userId, String appProvider) {
        return repo.findAppByUserAndProvider(userId, appProvider).isPresent();
    }

    public FavoriteRoute addFavoriteRoute(FavoriteRoute route) {
        return repo.saveRoute(route);
    }

    public void removeFavoriteRoute(Long userId, Long id) {
        repo.findRouteById(id)
                .filter(r -> r.getUserId().equals(userId))
                .ifPresent(r -> repo.deleteRoute(id));
    }

    public List<FavoriteRoute> listFavoriteRoutes(Long userId) {
        return repo.findRoutesByUser(userId);
    }

    public long countFavorites(Long userId) {
        return repo.countByUser(userId);
    }
}