package com.projetoaplicadoI.centralizador.adapter.in.dto;


public class RideRequestDTO {
    private LocationRequestDTO origin;
    private LocationRequestDTO destination;

    public RideRequestDTO() {}

    public RideRequestDTO(LocationRequestDTO origin, LocationRequestDTO destination) {
        this.origin = origin;
        this.destination = destination;
    }

    public LocationRequestDTO getOrigin() { return origin; }
    public void setOrigin(LocationRequestDTO origin) { this.origin = origin; }

    public LocationRequestDTO getDestination() { return destination; }
    public void setDestination(LocationRequestDTO destination) { this.destination = destination; }
}
