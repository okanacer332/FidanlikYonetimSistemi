// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/goodsreceipt/controller/GoodsReceiptController.java
package com.fidanlik.fidanysserver.goodsreceipt.controller;

import com.fidanlik.fidanysserver.goodsreceipt.dto.GoodsReceiptRequest;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import com.fidanlik.fidanysserver.goodsreceipt.service.GoodsReceiptService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/goods-receipts")
@RequiredArgsConstructor
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_YÖNETİCİ', 'ROLE_DEPO SORUMLUSU')")
    public ResponseEntity<GoodsReceipt> createGoodsReceipt(@RequestBody GoodsReceiptRequest request, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        GoodsReceipt createdReceipt = goodsReceiptService.createGoodsReceipt(
                request,
                authenticatedUser.getId(),
                authenticatedUser.getTenantId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReceipt);
    }
}