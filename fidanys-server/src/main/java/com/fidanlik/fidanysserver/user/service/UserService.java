// Yeni konum: src/main/java/com/fidanlik/fidanysserver/user/service/UserService.java
package com.fidanlik.fidanysserver.user.service;

import com.fidanlik.fidanysserver.user.model.User;
import com.fidanlik.fidanysserver.role.model.Role;
import com.fidanlik.fidanysserver.user.repository.UserRepository;
import com.fidanlik.fidanysserver.role.repository.RoleRepository;
import com.fidanlik.fidanysserver.user.dto.UserCreateRequest;
import com.fidanlik.fidanysserver.user.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // Yeni eklenecek metod: Kullanıcıyı username ve tenantId ile bulur
    public Optional<User> findUserByUsernameAndTenantId(String username, String tenantId) {
        Optional<User> userOptional = userRepository.findByUsernameAndTenantId(username, tenantId);
        // Eğer kullanıcı bulunursa rollerini de dolduralım
        userOptional.ifPresent(user -> {
            if (user.getRoleIds() != null && !user.getRoleIds().isEmpty()) {
                Set<Role> roles = user.getRoleIds().stream()
                        .map(roleRepository::findById)
                        .filter(Optional::isPresent)
                        .map(Optional::get)
                        .collect(Collectors.toSet());
                user.setRoles(roles);
            }
        });
        return userOptional;
    }

    // Tüm kullanıcıları tenant bazında getir
    public List<User> getAllUsersByTenant(String tenantId) {
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
        return users;
    }

    // Yeni kullanıcı oluştur
    public User createUser(UserCreateRequest userCreateRequest, String tenantId) {
        if (userRepository.findByUsernameAndTenantId(userCreateRequest.getUsername(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu kullanıcı adı bu şirkette zaten mevcut.");
        }
        if (userRepository.findByEmailAndTenantId(userCreateRequest.getEmail(), tenantId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu e-posta adresi bu şirkette zaten mevcut.");
        }

        User newUser = new User();
        newUser.setUsername(userCreateRequest.getUsername());
        newUser.setEmail(userCreateRequest.getEmail());
        newUser.setTenantId(tenantId);

        String hashedPassword = passwordEncoder.encode(userCreateRequest.getPassword());
        newUser.setPassword(hashedPassword);

        // Atanacak rolleri kontrol et ve sadece mevcut tenant'a ait olanları seç
        if (userCreateRequest.getRoleIds() != null) {
            Set<String> validRoleIds = userCreateRequest.getRoleIds().stream()
                    .filter(roleId -> roleRepository.findById(roleId)
                            .map(r -> r.getTenantId().equals(tenantId))
                            .orElse(false))
                    .collect(Collectors.toSet());
            newUser.setRoleIds(validRoleIds);
        } else {
            newUser.setRoleIds(Collections.emptySet());
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
        return savedUser;
    }

    // Kullanıcı güncelle
    public User updateUser(String id, UserUpdateRequest userUpdateRequest, String authenticatedUserId, String tenantId, Set<Role> authenticatedUserRoles) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Güncellenecek kullanıcı bulunamadı.");
        }
        User userToUpdate = userOptional.get();

        // Kullanıcının kendi tenant'ına ait olup olmadığını kontrol et
        if (!userToUpdate.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin kullanıcısını güncellemeye yetkiniz yok.");
        }

        // Yetkilendirme Kontrolü (Business Logic'i Service'e taşıdık)
        boolean isOkanAdmin = authenticatedUserRoles.stream().anyMatch(role -> role.getName().equals("Yönetici")) && userToUpdate.getUsername().equals("okan");

        // Sistem yöneticisi (okan) kendi hesabını düzenleyemez
        if (authenticatedUserId.equals(userToUpdate.getId()) && isOkanAdmin) { // Eğer giriş yapan okan ise ve kendini düzenlemeye çalışıyorsa
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sistem yöneticisi kendi hesabını düzenleyemez.");
        }

        boolean isCurrentUserAdmin = authenticatedUserRoles.stream().anyMatch(role -> role.getName().equals("Yönetici"));

        // Yönetici olmayan bir kullanıcı, kendi dışındaki bir kullanıcıyı düzenlemeye çalışamaz
        if (!isCurrentUserAdmin && !authenticatedUserId.equals(userToUpdate.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu işlemi yapmaya yetkiniz yok.");
        }

        // Kullanıcı adı ve e-posta çakışmalarını kontrol et (mevcut kullanıcı hariç)
        if (userUpdateRequest.getUsername() != null && !userUpdateRequest.getUsername().equals(userToUpdate.getUsername())) {
            if (userRepository.findByUsernameAndTenantId(userUpdateRequest.getUsername(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu kullanıcı adı bu şirkette zaten mevcut.");
            }
            userToUpdate.setUsername(userUpdateRequest.getUsername());
        }
        if (userUpdateRequest.getEmail() != null && !userUpdateRequest.getEmail().equals(userToUpdate.getEmail())) {
            if (userRepository.findByEmailAndTenantId(userUpdateRequest.getEmail(), tenantId).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu e-posta adresi bu şirkette zaten mevcut.");
            }
            userToUpdate.setEmail(userUpdateRequest.getEmail());
        }

        // Parola güncellenecekse hash'le
        if (userUpdateRequest.getPassword() != null && userUpdateRequest.getPassword().isPresent() && !userUpdateRequest.getPassword().get().isEmpty()) {
            String newHashedPassword = passwordEncoder.encode(userUpdateRequest.getPassword().get());
            userToUpdate.setPassword(newHashedPassword);
        }

        // Rolleri güncelle (Sadece Admin yetkili kullanıcıların rol değiştirmesine izin verilmeli)
        if (userUpdateRequest.getRoleIds() != null) {
            if (!isCurrentUserAdmin) {
                // Yönetici değilse ve rolleri değiştirmeye çalışıyorsa hata fırlat
                if (!userUpdateRequest.getRoleIds().equals(userToUpdate.getRoleIds())) { // Eğer rolleri değiştirme isteği varsa
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rolleri değiştirmeye yetkiniz yok.");
                }
                // Eğer roller değişmediyse ve Yönetici değilse, problem yok, devam et
            } else { // Yönetici ise rolleri güncelle
                Set<String> validRoleIds = userUpdateRequest.getRoleIds().stream()
                        .filter(roleId -> roleRepository.findById(roleId)
                                .map(r -> r.getTenantId().equals(tenantId))
                                .orElse(false))
                        .collect(Collectors.toSet());
                userToUpdate.setRoleIds(validRoleIds);
            }
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
        return updatedUser;
    }

    // Kullanıcı silme
    public void deleteUser(String id, String authenticatedUserId, Set<Role> authenticatedUserRoles, String tenantId) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Silinecek kullanıcı bulunamadı.");
        }
        User userToDelete = userOptional.get();

        if (!userToDelete.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Başka bir şirketin kullanıcısını silmeye yetkiniz yok.");
        }

        boolean isCurrentUserAdmin = authenticatedUserRoles.stream()
                .anyMatch(role -> role.getName().equals("Yönetici"));

        if (!isCurrentUserAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu kullanıcıyı silmeye yetkiniz yok.");
        }

        if (authenticatedUserId.equals(userToDelete.getId()) && userToDelete.getUsername().equals("okan")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sistem yöneticisi kendi hesabını silemez.");
        }

        userRepository.delete(userToDelete);
    }
}