package com.fidanlik.fidanysserver.user.controller;

import com.fidanlik.fidanysserver.user.dto.UserCreateRequest;
import com.fidanlik.fidanysserver.user.dto.UserUpdateRequest;
import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Mevcut giriş yapmış kullanıcının kendi bilgilerini döndürür.
     * Herhangi bir role sahip, sadece oturum açmış olması yeterlidir.
     * @param authenticatedUser Spring Security tarafından otomatik olarak sağlanan, giriş yapmış kullanıcı.
     * @return Giriş yapmış kullanıcının detayları.
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal User authenticatedUser) {
        // @AuthenticationPrincipal sayesinde, kullanıcı null ise bu metoda hiç girilmez.
        // Spring Security bu kontrolü bizim için yapar.
        return ResponseEntity.ok(authenticatedUser);
    }

    /**
     * Bir tenant'a ait tüm kullanıcıları listeler.
     * Sadece ROLE_ADMIN yetkisine sahip kullanıcılar erişebilir.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Kullanıcı listesi.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<User>> getAllUsersByTenant(@AuthenticationPrincipal User adminUser) {
        List<User> users = userService.getAllUsersByTenant(adminUser.getTenantId());
        return ResponseEntity.ok(users);
    }

    /**
     * Yeni bir kullanıcı oluşturur.
     * Sadece ROLE_ADMIN yetkisine sahip kullanıcılar erişebilir.
     * @param userCreateRequest Oluşturulacak kullanıcı bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Oluşturulan yeni kullanıcı.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody UserCreateRequest userCreateRequest, @AuthenticationPrincipal User adminUser) {
        User savedUser = userService.createUser(userCreateRequest, adminUser.getTenantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    /**
     * Mevcut bir kullanıcıyı günceller.
     * Sadece ROLE_ADMIN yetkisine sahip kullanıcılar erişebilir.
     * @param id Güncellenecek kullanıcının ID'si.
     * @param userUpdateRequest Güncelleme bilgileri.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return Güncellenmiş kullanıcı.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest userUpdateRequest, @AuthenticationPrincipal User adminUser) {
        // Servis metodunun içinde, adminin kendi kendini silmemesi veya rolünü değiştirememesi gibi
        // ek iş kuralları eklenebilir. Şimdilik yetkilendirme bu seviyede yeterlidir.
        User updatedUser = userService.updateUser(id, userUpdateRequest, adminUser.getId(), adminUser.getTenantId(), adminUser.getRoles());
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Bir kullanıcıyı siler.
     * Sadece ROLE_ADMIN yetkisine sahip kullanıcılar erişebilir.
     * @param id Silinecek kullanıcının ID'si.
     * @param adminUser Giriş yapmış admin kullanıcısı.
     * @return HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id, @AuthenticationPrincipal User adminUser) {
        userService.deleteUser(id, adminUser.getId(), adminUser.getRoles(), adminUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}