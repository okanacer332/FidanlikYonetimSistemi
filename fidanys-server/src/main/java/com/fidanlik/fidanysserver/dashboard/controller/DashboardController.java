package com.fidanlik.fidanysserver.dashboard.controller;

import com.fidanlik.fidanysserver.dashboard.dto.DashboardSummaryDTO;
import com.fidanlik.fidanysserver.dashboard.service.DashboardService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Giriş yapmış kullanıcının rolüne göre özet dashboard verilerini getirir.
     * Sadece kimliği doğrulanmış kullanıcılar bu endpoint'e erişebilir.
     * Verinin içeriği (hangi bilginin gösterileceği) servis katmanında kullanıcının rolüne göre belirlenir.
     * @param currentUser Giriş yapmış kullanıcı.
     * @return Kullanıcının rolüne özel hazırlanmış dashboard özet verileri.
     */
    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(@AuthenticationPrincipal User currentUser) {
        DashboardSummaryDTO summary = dashboardService.getDashboardSummaryForUser(currentUser);
        return ResponseEntity.ok(summary);
    }
}