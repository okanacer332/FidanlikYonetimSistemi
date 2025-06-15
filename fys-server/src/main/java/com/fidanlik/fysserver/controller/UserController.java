package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.model.Role;
import com.fidanlik.fysserver.repository.UserRepository;
import com.fidanlik.fysserver.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import com.fidanlik.fysserver.controller.dto.UserCreateRequest;
import com.fidanlik.fysserver.controller.dto.UserUpdateRequest; // Yeni DTO importu

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.ok(null);
        }

        // Principal olarak User objesini set ettiğimiz için doğrudan cast yapabiliriz.
        User authenticatedUserPrincipal = (User) authentication.getPrincipal();
        String username = authenticatedUserPrincipal.getUsername();
        String tenantId = authenticatedUserPrincipal.getTenantId();

        Optional<User> userOptional = userRepository.findByUsernameAndTenantId(username, tenantId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
                Set<Role> roles = user.getRoleIds().stream()
                        .map(roleRepository::findById)
                        .filter(Optional::isPresent)
                        .map(Optional::get)
                        .collect(Collectors.toSet());
                user.setRoles(roles);
            }
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsersByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<User> users = userRepository.findAllByTenantId(tenantId);
        users.forEach(user -> {
            if (user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
                Set<Role> roles = user.getRoleIds().stream()
                        .map(roleRepository::findById)
                        .filter(Optional::isPresent)
                        .map(Optional::get)
                        .collect(Collectors.toSet());
                user.setRoles(roles);
            }
        });

        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserCreateRequest userCreateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        if (userRepository.findByUsernameAndTenantId(userCreateRequest.getUsername(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        if (userRepository.findByEmailAndTenantId(userCreateRequest.getEmail(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        User newUser = new User();
        newUser.setUsername(userCreateRequest.getUsername());
        newUser.setEmail(userCreateRequest.getEmail());
        newUser.setTenantId(tenantId);

        String hashedPassword = passwordEncoder.encode(userCreateRequest.getPassword());
        newUser.setPassword(hashedPassword);

        if (userCreateRequest.getRoleIds() != null) {
            newUser.setRoleIds(userCreateRequest.getRoleIds());
        } else {
            newUser.setRoleIds(java.util.Collections.emptySet());
        }

        User savedUser = userRepository.save(newUser);

        if (savedUser.getRoleIds() != null && !savedUser.getRoleIds().isEmpty()) {
            Set<Role> roles = savedUser.getRoleIds().stream()
                    .map(roleRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toSet());
            savedUser.setRoles(roles);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/{id}") // Yeni: Kullanıcı güncelleme metodu
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest userUpdateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        String currentTenantId = authenticatedUser.getTenantId();

        if (currentTenantId == null) {
            return ResponseEntity.badRequest().build(); // TenantId yoksa hata
        }

        // 1. Güncellenecek kullanıcıyı kendi tenant'ı içinde bul
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
        User userToUpdate = userOptional.get();

        // Kullanıcının kendi tenant'ına ait olup olmadığını kontrol et
        if (!userToUpdate.getTenantId().equals(currentTenantId)) {
            // Farklı bir tenant'ın kullanıcısını düzenlemeye çalışmak
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
        }

        // 2. Yetkilendirme Kontrolü
        // a. Sistem yöneticisi (okan) kendi hesabını düzenleyemez
        boolean isOkanAdmin = authenticatedUser.getUsername().equals("okan");
        if (isOkanAdmin && userToUpdate.getUsername().equals("okan")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden - Okan kendini düzenleyemez
        }

        // b. Diğer kullanıcılar sadece kendi hesaplarını düzenleyebilir
        // authenticatedUser.getRoles() metodu artık null dönmeyecek, JwtAuthenticationFilter'da dolduruluyor.
        boolean isCurrentUserAdmin = authenticatedUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("Yönetici"));

        if (!isCurrentUserAdmin && !authenticatedUser.getId().equals(userToUpdate.getId())) {
            // Yönetici olmayan bir kullanıcı, kendi dışındaki bir kullanıcıyı düzenlemeye çalışıyor
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
        }

        // 3. Güncellenecek verileri DTO'dan al
        // Kullanıcı adı ve e-posta çakışmalarını kontrol et (mevcut kullanıcı hariç)
        if (userUpdateRequest.getUsername() != null && !userUpdateRequest.getUsername().equals(userToUpdate.getUsername())) {
            if (userRepository.findByUsernameAndTenantId(userUpdateRequest.getUsername(), currentTenantId).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(null); // 409 Conflict
            }
            userToUpdate.setUsername(userUpdateRequest.getUsername());
        }
        if (userUpdateRequest.getEmail() != null && !userUpdateRequest.getEmail().equals(userToUpdate.getEmail())) {
            if (userRepository.findByEmailAndTenantId(userUpdateRequest.getEmail(), currentTenantId).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(null); // 409 Conflict
            }
            userToUpdate.setEmail(userUpdateRequest.getEmail());
        }

        // Parola güncellenecekse hash'le
        // Null kontrolünü userUpdateRequest.getPassword() üzerinde yapıyoruz
        if (userUpdateRequest.getPassword() != null && userUpdateRequest.getPassword().isPresent() && !userUpdateRequest.getPassword().get().isEmpty()) {
            String newHashedPassword = passwordEncoder.encode(userUpdateRequest.getPassword().get());
            userToUpdate.setPassword(newHashedPassword);
        }

        // Rolleri güncelle (Sadece Admin yetkili kullanıcıların rol değiştirmesine izin verilmeli)
        if (!isCurrentUserAdmin && userUpdateRequest.getRoleIds() != null && !userUpdateRequest.getRoleIds().equals(userToUpdate.getRoleIds())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null); // Yetkisiz rol değiştirme
        }
        // Admin ise rolleri güncelle
        if (isCurrentUserAdmin && userUpdateRequest.getRoleIds() != null) {
            Set<String> validRoleIds = userUpdateRequest.getRoleIds().stream()
                    .filter(roleId -> roleRepository.findById(roleId)
                            .map(r -> r.getTenantId().equals(currentTenantId))
                            .orElse(false))
                    .collect(Collectors.toSet());
            userToUpdate.setRoleIds(validRoleIds);
        }


        User updatedUser = userRepository.save(userToUpdate);

        // Kaydedilen kullanıcının rollerini doldurup geri döndür
        if (updatedUser.getRoleIds() != null && !updatedUser.getRoleIds().isEmpty()) {
            Set<Role> roles = updatedUser.getRoleIds().stream()
                    .map(roleRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toSet());
            updatedUser.setRoles(roles);
        }

        return ResponseEntity.ok(updatedUser); // 200 OK
    }
}