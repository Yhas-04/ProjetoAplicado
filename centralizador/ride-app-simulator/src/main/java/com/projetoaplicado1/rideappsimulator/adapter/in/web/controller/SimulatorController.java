package com.projetoaplicado1.rideappsimulator.adapter.in.web.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Random;

@RestController
public class SimulatorController {

    private static final Random random = new Random();

    @GetMapping("/quote")
    public QuoteResponse getQuote(
            @RequestParam Double originLat,
            @RequestParam Double originLon,
            @RequestParam Double destLat,
            @RequestParam Double destLon) {

        double distance = calculateDistance(originLat, originLon, destLat, destLon);

        // Simula preço base: 25.00 + (distância * 1.50)
        double basePrice = 25.00 + (distance * 1.50);
        // Aplica variação aleatória (distribuição normal)
        double price = basePrice + (random.nextGaussian() * 1.50);
        price = Math.max(price, 5.0);

        // Simula tempo estimado: distância / 0.8 km/min
        int time = (int) Math.round(distance / 0.8);

        return new QuoteResponse(price, "BRL", time);
    }

    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public static class QuoteResponse {
        private final Double price;
        private final String currency;
        private final Integer time;

        public QuoteResponse(Double price, String currency, Integer time) {
            this.price = price;
            this.currency = currency;
            this.time = time;
        }

        public Double getPrice() { return price; }
        public String getCurrency() { return currency; }
        public Integer getTime() { return time; }
    }
}