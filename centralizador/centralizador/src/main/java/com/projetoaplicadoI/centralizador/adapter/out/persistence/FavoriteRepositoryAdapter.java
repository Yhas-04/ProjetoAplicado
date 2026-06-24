package com.projetoaplicadoI.centralizador.adapter.out.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.projetoaplicadoI.centralizador.domain.model.FavoriteApp;
import com.projetoaplicadoI.centralizador.domain.model.FavoriteRoute;
import com.projetoaplicadoI.centralizador.domain.port.out.FavoriteRepositoryPort;

@Component
public class FavoriteRepositoryAdapter implements FavoriteRepositoryPort {

    private final FavoriteAppJpaRepository appRepo;
    private final FavoriteRouteJpaRepository routeRepo;

    public FavoriteRepositoryAdapter(FavoriteAppJpaRepository appRepo, FavoriteRouteJpaRepository routeRepo) {
        this.appRepo = appRepo;
        this.routeRepo = routeRepo;
    }

    public FavoriteApp saveApp(FavoriteApp app) {
        FavoriteAppJpaEntity e = new FavoriteAppJpaEntity();
        e.setUserId(app.getUserId());
        e.setAppName(app.getAppName());
        e.setAppProvider(app.getAppProvider());
        return toApp(appRepo.save(e));
    }

    public void deleteApp(Long id) {
        appRepo.deleteById(id);
    }

    public Optional<FavoriteApp> findAppByUserAndProvider(Long userId, String provider) {
        return appRepo.findByUserIdAndAppProvider(userId, provider).map(this::toApp);
    }

    public List<FavoriteApp> findAppsByUser(Long userId) {
        return appRepo.findByUserId(userId).stream().map(this::toApp).toList();
    }

    public FavoriteRoute saveRoute(FavoriteRoute route) {
        FavoriteRouteJpaEntity e = new FavoriteRouteJpaEntity();
        e.setUserId(route.getUserId());
        e.setOriginName(route.getOriginName());
        e.setOriginLat(route.getOriginLat());
        e.setOriginLng(route.getOriginLng());
        e.setDestinationName(route.getDestinationName());
        e.setDestinationLat(route.getDestinationLat());
        e.setDestinationLng(route.getDestinationLng());
        return toRoute(routeRepo.save(e));
    }

    public void deleteRoute(Long id) {
        routeRepo.deleteById(id);
    }

    public Optional<FavoriteRoute> findRouteById(Long id) {
        return routeRepo.findById(id).map(this::toRoute);
    }

    public List<FavoriteRoute> findRoutesByUser(Long userId) {
        return routeRepo.findByUserId(userId).stream().map(this::toRoute).toList();
    }

    public long countByUser(Long userId) {
        return appRepo.countByUserId(userId) + routeRepo.countByUserId(userId);
    }

    private FavoriteApp toApp(FavoriteAppJpaEntity e) {
        FavoriteApp a = new FavoriteApp();
        a.setId(e.getId());
        a.setUserId(e.getUserId());
        a.setAppName(e.getAppName());
        a.setAppProvider(e.getAppProvider());
        a.setCreatedAt(e.getCreatedAt());
        return a;
    }

    private FavoriteRoute toRoute(FavoriteRouteJpaEntity e) {
        FavoriteRoute r = new FavoriteRoute();
        r.setId(e.getId());
        r.setUserId(e.getUserId());
        r.setOriginName(e.getOriginName());
        r.setOriginLat(e.getOriginLat());
        r.setOriginLng(e.getOriginLng());
        r.setDestinationName(e.getDestinationName());
        r.setDestinationLat(e.getDestinationLat());
        r.setDestinationLng(e.getDestinationLng());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }
}