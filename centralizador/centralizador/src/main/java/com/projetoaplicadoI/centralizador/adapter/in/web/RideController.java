package com.projetoaplicadoI.centralizador.adapter.in.web;

import com.projetoaplicadoI.centralizador.adapter.in.dto.LocationRequestDTO;
import com.projetoaplicadoI.centralizador.adapter.in.dto.RideRequestDTO;
import com.projetoaplicadoI.centralizador.adapter.in.dto.RideResponseDTO;
import com.projetoaplicadoI.centralizador.adapter.in.dto.ProviderQuoteDTO;
import com.projetoaplicadoI.centralizador.domain.model.Ride;
import com.projetoaplicadoI.centralizador.domain.model.Quote;
import com.projetoaplicadoI.centralizador.domain.port.in.CompareRideCommand;
import com.projetoaplicadoI.centralizador.domain.port.in.CompareRideUseCase;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ride")
public class RideController {

    private final CompareRideUseCase compareRideUseCase;

    public RideController(CompareRideUseCase compareRideUseCase) {
        this.compareRideUseCase = compareRideUseCase;
    }

    @PostMapping("/compare")
    public RideResponseDTO compare(@RequestBody RideRequestDTO request) {
        LocationRequestDTO originDTO = request.getOrigin();
        LocationRequestDTO destinationDTO = request.getDestination();

        CompareRideCommand command = new CompareRideCommand(
                originDTO.getName(),
                originDTO.getLatitude(),
                originDTO.getLongitude(),
                destinationDTO.getName(),
                destinationDTO.getLatitude(),
                destinationDTO.getLongitude()
        );

        Ride ride = compareRideUseCase.execute(command);

        List<ProviderQuoteDTO> providerQuotes = ride.getQuotes()
                .stream()
                .map(this::toProviderQuoteDTO)
                .toList();

        return new RideResponseDTO(
                ride.getId(),
                ride.getOrigin().getName(),
                ride.getOrigin().getLatitude(),
                ride.getOrigin().getLongitude(),
                ride.getDestination().getName(),
                ride.getDestination().getLatitude(),
                ride.getDestination().getLongitude(),
                ride.getDistanceKm(),
                providerQuotes
        );
    }

    private ProviderQuoteDTO toProviderQuoteDTO(Quote quote) {
        return new ProviderQuoteDTO(
                quote.getProviderName(),
                quote.getPrice(),
                quote.getCurrency(),
                quote.getEstimatedTimeMinutes()
        );
    }
}