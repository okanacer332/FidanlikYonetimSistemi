package com.fidanlik.fysserver.controller;

import com.fidanlik.fysserver.model.User;
import com.fidanlik.fysserver.model.Role;
import com.fidanlik.fysserver.repository.UserRepository;
import com.fidanlik.fysserver.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // HttpStatus importu
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder; // PasswordEncoder importu
import org.springframework.web.bind.annotation.*; // RequestBody, PostMapping importları için

import java.util.List; // List importu
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

// Kullanıcı oluşturma request body'si için bir DTO oluşturacağız
import com.fidanlik.fysserver.controller.dto.UserCreateRequest; // Yeni DTO importu

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder; // Şifreyi hash'lemek için

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.ok(null);
        }

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

    @GetMapping // Tüm kullanıcıları listeleme
    public ResponseEntity<List<User>> getAllUsersByTenant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build(); // TenantId yoksa hata
        }

        List<User> users = userRepository.findAllByTenantId(tenantId);
        // Kullanıcıların rollerini de dolduralım
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

    @PostMapping // Yeni kullanıcı oluşturma
    public ResponseEntity<User> createUser(@RequestBody UserCreateRequest userCreateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.badRequest().build(); // TenantId yoksa hata
        }

        // Kullanıcı adının ve e-postanın zaten var olup olmadığını kontrol et
        if (userRepository.findByUsernameAndTenantId(userCreateRequest.getUsername(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }
        if (userRepository.findByEmailAndTenantId(userCreateRequest.getEmail(), tenantId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 Conflict
        }

        User newUser = new User();
        newUser.setUsername(userCreateRequest.getUsername());
        newUser.setEmail(userCreateRequest.getEmail());
        newUser.setTenantId(tenantId); // Yöneticinin tenantId'si ile yeni kullanıcı oluştur

        // Şifreyi BCrypt ile hash'le
        String hashedPassword = passwordEncoder.encode(userCreateRequest.getPassword());
        newUser.setPassword(hashedPassword);

        // Rolleri ID'lerine göre ata
        if (userCreateRequest.getRoleIds() != null) {
            newUser.setRoleIds(userCreateRequest.getRoleIds());
        } else {
            newUser.setRoleIds(java.util.Collections.emptySet()); // Boş küme ata
        }

        User savedUser = userRepository.save(newUser);

        // Kaydedilen kullanıcının rollerini doldurup geri döndür
        if (savedUser.getRoleIds() != null && !savedUser.getRoleIds().isEmpty()) {
            Set<Role> roles = savedUser.getRoleIds().stream()
                    .map(roleRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toSet());
            savedUser.setRoles(roles);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser); // 201 Created
    }
}