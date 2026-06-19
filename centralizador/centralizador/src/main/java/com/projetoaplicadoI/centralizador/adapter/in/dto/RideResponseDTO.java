package com.projetoaplicadoI.centralizador.adapter.in.dto;

import java.util.List;

public class RideResponseDTO {
    private Long id;
    private String originName;
    private Double originLatitude;
    private Double originLongitude;
    private String destinationName;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private Double distanceKm;
    private List<ProviderQuoteDTO> providers;

    public RideResponseDTO(
            Long id,
            String originName, Double originLatitude, Double originLongitude,
            String destinationName, Double destinationLatitude, Double destinationLongitude,
            Double distanceKm,
            List<ProviderQuoteDTO> providers) {
        this.id = id;
        this.originName = originName;
        this.originLatitude = originLatitude;
        this.originLongitude = originLongitude;
        this.destinationName = destinationName;
        this.destinationLatitude = destinationLatitude;
        this.destinationLongitude = destinationLongitude;
        this.distanceKm = distanceKm;
        this.providers = providers;
    }

    public Long getId() { return id; }
    public String getOriginName() { return originName; }
    public Double getOriginLatitude() { return originLatitude; }
    public Double getOriginLongitude() { return originLongitude; }
    public String getDestinationName() { return destinationName; }
    public Double getDestinationLatitude() { return destinationLatitude; }
    public Double getDestinationLongitude() { return destinationLongitude; }
    public Double getDistanceKm() { return distanceKm; }
    public List<ProviderQuoteDTO> getProviders() { return providers; }
}