package com.projetoaplicadoI.centralizador.adapter.in.web;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projetoaplicadoI.centralizador.domain.model.FavoriteApp;
import com.projetoaplicadoI.centralizador.domain.model.FavoriteRoute;
import com.projetoaplicadoI.centralizador.domain.port.in.ManageFavoritesUseCase;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final ManageFavoritesUseCase useCase;

    public FavoriteController(ManageFavoritesUseCase useCase) {
        this.useCase = useCase;
    }

    private Long userId(Authentication auth) {
        return Long.parseLong(auth.getName());
    }

    @PostMapping("/apps")
    public FavoriteApp addApp(@RequestBody FavoriteApp app, Authentication auth) {
        app.setUserId(userId(auth));
        return useCase.addFavoriteApp(app);
    }

    @DeleteMapping("/apps/{provider}")
    public void removeApp(@PathVariable String provider, Authentication auth) {
        useCase.removeFavoriteApp(userId(auth), provider);
    }

    @GetMapping("/apps")
    public List<FavoriteApp> listApps(Authentication auth) {
        return useCase.listFavoriteApps(userId(auth));
    }

    @GetMapping("/apps/check/{provider}")
    public Map<String, Boolean> checkApp(@PathVariable String provider, Authentication auth) {
        return Map.of("isFavorite", useCase.isAppFavorite(userId(auth), provider));
    }

    @PostMapping("/routes")
    public FavoriteRoute addRoute(@RequestBody FavoriteRoute route, Authentication auth) {
        route.setUserId(userId(auth));
        return useCase.addFavoriteRoute(route);
    }

    @DeleteMapping("/routes/{id}")
    public void removeRoute(@PathVariable Long id, Authentication auth) {
        useCase.removeFavoriteRoute(userId(auth), id);
    }

    @GetMapping("/routes")
    public List<FavoriteRoute> listRoutes(Authentication auth) {
        return useCase.listFavoriteRoutes(userId(auth));
    }

    @GetMapping("/count")
    public Map<String, Long> count(Authentication auth) {
        return Map.of("total", useCase.countFavorites(userId(auth)));
    }
}