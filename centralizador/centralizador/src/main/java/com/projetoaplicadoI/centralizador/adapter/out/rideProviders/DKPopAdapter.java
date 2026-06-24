package com.projetoaplicadoI.centralizador.adapter.out.rideProviders;
import com.projetoaplicadoI.centralizador.domain.model.Location;
import com.projetoaplicadoI.centralizador.domain.model.Quote;
import com.projetoaplicadoI.centralizador.domain.port.out.RideProviderPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Locale;

@Component
public class DKPopAdapter implements RideProviderPort {

    private final RestTemplate restTemplate;

    @Value("${app.providers.dkpop.url:http://localhost:8087}")
    private String dkpopUrl;

    public DKPopAdapter() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public Quote getQuote(Location origin, Location destination) {
        String url = String.format(
                Locale.US,
                "%s/quote?originLat=%f&originLon=%f&destLat=%f&destLon=%f",
                dkpopUrl,
                origin.getLatitude(),
                origin.getLongitude(),
                destination.getLatitude(),
                destination.getLongitude()
        );

        AppQuoteResponse response = restTemplate.getForObject(url, AppQuoteResponse.class);

        return new Quote(
                "DKPop",
                response.getPrice(),
                response.getCurrency(),
                response.getTime()
        );
    }

    @Override
    public String getProviderName() {
        return "DKPop";
    }

    private static class AppQuoteResponse {
        private Double price;
        private String currency;
        private Integer time;

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public Integer getTime() { return time; }
        public void setTime(Integer time) { this.time = time; }
    }
}
