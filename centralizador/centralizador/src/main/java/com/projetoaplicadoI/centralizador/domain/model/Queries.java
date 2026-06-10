package com.projetoaplicadoI.centralizador.domain.model;

import com.projetoaplicadoI.centralizador.domain.port.in.RideProvider;
import com.projetoaplicadoI.centralizador.domain.port.out.LocationProvider;

import java.util.Date;

public class Queries {
    private Integer id;
    private RideProvider rp;
    private Double price;
    private Date dateIn;
    private Date dateOut;
    private String namePerson;
    private LocationProvider lpin;
    private LocationProvider lpout;
    private Double kilometers;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public RideProvider getRp() {
        return rp;
    }

    public void setRp(RideProvider rp) {
        this.rp = rp;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Date getDateIn() {
        return dateIn;
    }

    public void setDateIn(Date dateIn) {
        this.dateIn = dateIn;
    }

    public Date getDateOut() {
        return dateOut;
    }

    public void setDateOut(Date dateOut) {
        this.dateOut = dateOut;
    }

    public String getNamePerson() {
        return namePerson;
    }

    public void setNamePerson(String namePerson) {
        this.namePerson = namePerson;
    }

    public LocationProvider getLpin() {
        return lpin;
    }

    public void setLpin(LocationProvider lpin) {
        this.lpin = lpin;
    }

    public LocationProvider getLpout() {
        return lpout;
    }

    public void setLpout(LocationProvider lpout) {
        this.lpout = lpout;
    }

    public Double getKilometers() {
        return kilometers;
    }

    public void setKilometers(Double kilometers) {
        this.kilometers = kilometers;
    }
}

