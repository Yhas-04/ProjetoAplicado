package com.projetoaplicadoI.centralizador.adapter.in.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projetoaplicadoI.centralizador.adapter.in.dto.LoginRequestDTO;
import com.projetoaplicadoI.centralizador.adapter.in.dto.LoginResponseDTO;
import com.projetoaplicadoI.centralizador.adapter.in.dto.RegisterRequestDTO;
import com.projetoaplicadoI.centralizador.adapter.in.dto.RegisterResponseDTO;
import com.projetoaplicadoI.centralizador.domain.model.User;
import com.projetoaplicadoI.centralizador.domain.port.in.LoginUseCase;
import com.projetoaplicadoI.centralizador.domain.port.in.RegisterUseCase;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final LoginUseCase loginUseCase;
    private final RegisterUseCase registerUseCase;

    public AuthController(LoginUseCase loginUseCase, RegisterUseCase registerUseCase) {
        this.loginUseCase = loginUseCase;
        this.registerUseCase = registerUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        String token = loginUseCase.execute(request.email(), request.password());
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        User user = registerUseCase.execute(request.name(), request.email(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RegisterResponseDTO(user.getId(), user.getName(), user.getEmail()));
    }
}