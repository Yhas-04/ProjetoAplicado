package com.projetoaplicadoI.centralizador.adapter.in.web;

import com.projetoaplicadoI.centralizador.domain.model.RideHistoryEntry;
import com.projetoaplicadoI.centralizador.domain.port.in.ManageRideHistoryUseCase;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/history")
public class RideHistoryController {

    private final ManageRideHistoryUseCase useCase;

    public RideHistoryController(ManageRideHistoryUseCase useCase) {
        this.useCase = useCase;
    }

    private Long userId(Authentication auth) {
        return Long.parseLong(auth.getName());
    }

    @PostMapping
    public RideHistoryEntry save(@RequestBody RideHistoryEntry entry, Authentication auth) {
        entry.setUserId(userId(auth));
        return useCase.save(entry);
    }

    @GetMapping
    public List<RideHistoryEntry> list(Authentication auth) {
        return useCase.listByUser(userId(auth));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication auth) {
        useCase.delete(userId(auth), id);
    }

    @GetMapping("/count")
    public Map<String, Long> count(Authentication auth) {
        return Map.of("total", useCase.countByUser(userId(auth)));
    }
}