/*package com.projetoaplicadoI.centralizador.adapter.out.rideProviders;
import com.projetoaplicadoI.centralizador.domain.model.Location;
import com.projetoaplicadoI.centralizador.domain.model.Quote;
import com.projetoaplicadoI.centralizador.domain.port.out.RideProviderPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class SimulatorAdapter implements RideProviderPort {


    private final RestTemplate restTemplate;

    @Value("${app.providers.simulator.url:http://localhost:8084}")
    private String simulatorUrl;

    public SimulatorAdapter() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public Quote getQuote(Location origin, Location destination) {
        System.out.println(">>> SimulatorAdapter.getQuote() foi chamado!");

        // ★★★ USA O Locale.US PARA FORÇAR O PONTO ★★★
        String url = String.format(
                java.util.Locale.US,  // ← ADICIONE ESTE PARÂMETRO!
                "%s/quote?originLat=%f&originLon=%f&destLat=%f&destLon=%f",
                simulatorUrl,
                origin.getLatitude(),
                origin.getLongitude(),
                destination.getLatitude(),
                destination.getLongitude()
        );

        System.out.println(">>> URL: " + url);

        try {
            SimulatorQuoteResponse response = restTemplate.getForObject(url, SimulatorQuoteResponse.class);
            System.out.println(">>> Resposta recebida: price=" + response.getPrice());

            return new Quote(
                    "Simulator",
                    response.getPrice(),
                    response.getCurrency(),
                    response.getTime()
            );
        } catch (Exception e) {
            System.err.println(">>> ERRO no SimulatorAdapter: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public String getProviderName() {
        return "Simulator";
    }

    private static class SimulatorQuoteResponse {
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
*/