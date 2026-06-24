package com.projetoaplicadoI.centralizador.domain.port.in;

import com.projetoaplicadoI.centralizador.domain.model.FavoriteApp;
import com.projetoaplicadoI.centralizador.domain.model.FavoriteRoute;
import java.util.List;

public interface ManageFavoritesUseCase {
    FavoriteApp addFavoriteApp(FavoriteApp app);
    void removeFavoriteApp(Long userId, String appProvider);
    List<FavoriteApp> listFavoriteApps(Long userId);
    boolean isAppFavorite(Long userId, String appProvider);
    FavoriteRoute addFavoriteRoute(FavoriteRoute route);
    void removeFavoriteRoute(Long userId, Long id);
    List<FavoriteRoute> listFavoriteRoutes(Long userId);
    long countFavorites(Long userId);
}