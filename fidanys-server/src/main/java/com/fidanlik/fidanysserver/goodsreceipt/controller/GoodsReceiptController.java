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
import org.springframework.web.bind.annotation.*; // Import all from web.bind.annotation

import java.util.List; // Import List

@RestController
@RequestMapping("/api/v1/goods-receipts")
@RequiredArgsConstructor
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<GoodsReceipt> createGoodsReceipt(@RequestBody GoodsReceiptRequest request, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        GoodsReceipt createdReceipt = goodsReceiptService.createGoodsReceipt(
                request,
                authenticatedUser.getId(),
                authenticatedUser.getTenantId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReceipt);
    }

    // NEW ENDPOINT: Get all receipts
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF', 'ROLE_SALES')")
    public ResponseEntity<List<GoodsReceipt>> getAllGoodsReceipts(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        List<GoodsReceipt> receipts = goodsReceiptService.getAllGoodsReceiptsByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(receipts);
    }

    // NEW ENDPOINT: Cancel a receipt
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Void> cancelGoodsReceipt(@PathVariable String id, Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();
        goodsReceiptService.cancelGoodsReceipt(id, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}