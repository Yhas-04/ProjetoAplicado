package com.projetoaplicadoI.centralizador.domain.model;

public class Location {
    private final String name;
    private final Double latitude;
    private final Double longitude;

    public Location(String name, Double latitude, Double longitude) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        validate();
    }

    private void validate() {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Location name is required");
        }
        if (latitude == null || latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Invalid latitude: " + latitude);
        }
        if (longitude == null || longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Invalid longitude: " + longitude);
        }
    }

    public String getName() {
        return name;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }
}