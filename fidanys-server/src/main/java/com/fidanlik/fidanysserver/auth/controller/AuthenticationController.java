// Yeni konum: src/main/java/com/fidanlik/fidanysserver/auth/controller/AuthenticationController.java
package com.fidanlik.fidanysserver.auth.controller;
import com.fidanlik.fidanysserver.auth.dto.LoginRequest; // Yeni paket yolu
import com.fidanlik.fidanysserver.auth.dto.LoginResponse; // Yeni paket yolu
import com.fidanlik.fidanysserver.auth.service.AuthenticationService; // Yeni paket yolu
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    // YENİ ENDPOINT: Kullanıcının çıkış yapmasını sağlar.
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal User user) {
        authenticationService.logout(user);
        // --- DEĞİŞİKLİK BURADA ---
        // Başarılı ama içerik dönmeyen durumlar için standart olan 204 No Content yanıtını dönüyoruz.
        return ResponseEntity.noContent().build();
    }
}
