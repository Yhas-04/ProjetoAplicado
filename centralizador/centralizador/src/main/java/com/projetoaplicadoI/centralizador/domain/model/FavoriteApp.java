package com.projetoaplicadoI.centralizador.domain.model;

import java.time.LocalDateTime;

public class FavoriteApp {
    private Long id;
    private Long userId;
    private String appName;
    private String appProvider;
    private LocalDateTime createdAt = LocalDateTime.now();

    public FavoriteApp() {}

    public FavoriteApp(Long userId, String appName, String appProvider) {
        this.userId = userId;
        this.appName = appName;
        this.appProvider = appProvider;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getAppName() { return appName; }
    public void setAppName(String appName) { this.appName = appName; }
    public String getAppProvider() { return appProvider; }
    public void setAppProvider(String appProvider) { this.appProvider = appProvider; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}