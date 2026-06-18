package com.projetoaplicadoI.centralizador.domain.model;

public class Quote {
    private final String providerName;
    private final Double price;
    private final String currency;
    private final Integer estimatedTimeMinutes;

    public Quote(String providerName, Double price, String currency, Integer estimatedTimeMinutes) {
        this.providerName = providerName;
        this.price = price;
        this.currency = currency;
        this.estimatedTimeMinutes = estimatedTimeMinutes;
        validate();
    }

    private void validate() {
        if (providerName == null || providerName.isBlank()) {
            throw new IllegalArgumentException("Provider name is required");
        }
        if (price == null || price < 0) {
            throw new IllegalArgumentException("Price must be positive");
        }
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("Currency is required");
        }
        if (estimatedTimeMinutes == null || estimatedTimeMinutes < 0) {
            throw new IllegalArgumentException("Estimated time must be positive");
        }
    }

    public String getProviderName() {
        return providerName;
    }

    public Double getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }

    public Integer getEstimatedTimeMinutes() {
        return estimatedTimeMinutes;
    }
}