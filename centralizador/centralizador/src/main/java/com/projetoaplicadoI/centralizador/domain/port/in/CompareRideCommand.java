package com.projetoaplicadoI.centralizador.domain.port.in;
public class CompareRideCommand {
    private final String originName;
    private final Double originLatitude;
    private final Double originLongitude;
    private final String destinationName;
    private final Double destinationLatitude;
    private final Double destinationLongitude;

    public CompareRideCommand(
            String originName, Double originLatitude, Double originLongitude,
            String destinationName, Double destinationLatitude, Double destinationLongitude) {
        this.originName = originName;
        this.originLatitude = originLatitude;
        this.originLongitude = originLongitude;
        this.destinationName = destinationName;
        this.destinationLatitude = destinationLatitude;
        this.destinationLongitude = destinationLongitude;
    }

    public String getOriginName() { return originName; }
    public Double getOriginLatitude() { return originLatitude; }
    public Double getOriginLongitude() { return originLongitude; }
    public String getDestinationName() { return destinationName; }
    public Double getDestinationLatitude() { return destinationLatitude; }
    public Double getDestinationLongitude() { return destinationLongitude; }
}
