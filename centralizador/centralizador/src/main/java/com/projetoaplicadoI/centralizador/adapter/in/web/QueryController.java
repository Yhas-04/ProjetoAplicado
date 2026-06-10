package com.projetoaplicadoI.centralizador.adapter.in.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping (value = "/queries")
public class QueryController {

    @GetMapping(value = "teste")
    public String test(){
        return "Teste";
    }
}
