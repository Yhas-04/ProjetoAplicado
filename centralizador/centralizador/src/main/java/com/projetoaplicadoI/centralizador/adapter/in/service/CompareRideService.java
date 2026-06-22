package com.projetoaplicadoI.centralizador.adapter.in.service;

import com.projetoaplicadoI.centralizador.domain.model.Location;
import com.projetoaplicadoI.centralizador.domain.model.Quote;
import com.projetoaplicadoI.centralizador.domain.model.Ride;
import com.projetoaplicadoI.centralizador.domain.port.in.CompareRideCommand;
import com.projetoaplicadoI.centralizador.domain.port.in.CompareRideUseCase;
import com.projetoaplicadoI.centralizador.domain.port.out.RideProviderPort;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompareRideService implements CompareRideUseCase {

    private final List<RideProviderPort> rideProviders;
    @PostConstruct
    public void init() {
        System.out.println("===== PROVIDERS INJETADOS =====");
        System.out.println("Total: " + rideProviders.size());
        rideProviders.forEach(p -> System.out.println(" - " + p.getProviderName()));
        System.out.println("================================");
    }

    public CompareRideService(List<RideProviderPort> rideProviders) {
        this.rideProviders = rideProviders;
    }

    @Override
    public Ride execute(CompareRideCommand command) {
        Location origin = new Location(
                command.getOriginName(),
                command.getOriginLatitude(),
                command.getOriginLongitude()
        );

        Location destination = new Location(
                command.getDestinationName(),
                command.getDestinationLatitude(),
                command.getDestinationLongitude()
        );

        Ride ride = new Ride(null, origin, destination);
        ride.calculateDistance();

        for (RideProviderPort provider : rideProviders) {
            try {
                Quote quote = provider.getQuote(origin, destination);
                ride.addQuote(quote);
            } catch (Exception e) {
                System.err.println("Error fetching quote from " + provider.getProviderName() + ": " + e.getMessage());
            }
        }

        return ride;
    }
}