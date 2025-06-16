// fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/controller/MasterDataController.java
package com.fidanlik.fidanysserver.common.controller;

import com.fidanlik.fidanysserver.common.dto.MasterDataDTO;
import com.fidanlik.fidanysserver.fidan.service.*;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/master-data")
@RequiredArgsConstructor
public class MasterDataController {

    private final PlantTypeService plantTypeService;
    private final PlantVarietyService plantVarietyService;
    private final RootstockService rootstockService;
    private final PlantSizeService plantSizeService;
    private final PlantAgeService plantAgeService;

    @GetMapping
    public ResponseEntity<MasterDataDTO> getAllMasterData(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        String tenantId = authenticatedUser.getTenantId();

        MasterDataDTO masterData = MasterDataDTO.builder()
                .plantTypes(plantTypeService.getAllPlantTypesByTenant(tenantId))
                .plantVarieties(plantVarietyService.getAllPlantVarietiesByTenant(tenantId))
                .rootstocks(rootstockService.getAllRootstocksByTenant(tenantId))
                .plantSizes(plantSizeService.getAllPlantSizesByTenant(tenantId))
                .plantAges(plantAgeService.getAllPlantAgesByTenant(tenantId))
                .build();

        return ResponseEntity.ok(masterData);
    }
}