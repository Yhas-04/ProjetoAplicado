package com.projetoaplicadoI.centralizador.domain.model;

import java.util.ArrayList;
import java.util.List;

public class Ride {
    private final Long id;
    private final Location origin;
    private final Location destination;
    private Double distanceKm;
    private List<Quote> quotes;

    public Ride(Long id, Location origin, Location destination) {
        this.id = id;
        this.origin = origin;
        this.destination = destination;
        this.quotes = new ArrayList<>();
        validate();
    }

    private void validate() {
        if (origin == null) {
            throw new IllegalArgumentException("Origin is required");
        }
        if (destination == null) {
            throw new IllegalArgumentException("Destination is required");
        }
    }

    public void calculateDistance() {
        this.distanceKm = haversineDistance(
                origin.getLatitude(), origin.getLongitude(),
                destination.getLatitude(), destination.getLongitude()
        );
    }

    private Double haversineDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public void addQuote(Quote quote) {
        if (quote == null) {
            throw new IllegalArgumentException("Quote cannot be null");
        }
        this.quotes.add(quote);
    }

    public List<Quote> getQuotesSortedByPrice() {
        return quotes.stream()
                .sorted((q1, q2) -> q1.getPrice().compareTo(q2.getPrice()))
                .toList();
    }

    public Long getId() {
        return id;
    }

    public Location getOrigin() {
        return origin;
    }

    public Location getDestination() {
        return destination;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public List<Quote> getQuotes() {
        return quotes;
    }
}