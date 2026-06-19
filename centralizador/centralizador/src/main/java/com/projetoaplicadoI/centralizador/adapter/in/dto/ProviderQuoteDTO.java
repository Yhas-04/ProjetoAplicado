package com.projetoaplicadoI.centralizador.adapter.in.dto;

public class ProviderQuoteDTO {
    private String providerName;
    private Double price;
    private String currency;
    private Integer estimatedTimeMinutes;

    public ProviderQuoteDTO(String providerName, Double price, String currency, Integer estimatedTimeMinutes) {
        this.providerName = providerName;
        this.price = price;
        this.currency = currency;
        this.estimatedTimeMinutes = estimatedTimeMinutes;
    }

    public String getProviderName() { return providerName; }
    public Double getPrice() { return price; }
    public String getCurrency() { return currency; }
    public Integer getEstimatedTimeMinutes() { return estimatedTimeMinutes; }
}