package com.fidanlik.fidanysserver.goodsreceipt.controller;

import com.fidanlik.fidanysserver.goodsreceipt.dto.GoodsReceiptRequest;
import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import com.fidanlik.fidanysserver.goodsreceipt.service.GoodsReceiptService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goods-receipts")
@RequiredArgsConstructor
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    /**
     * Tedarikçiden gelen ürünler için yeni bir mal kabul fişi oluşturur.
     * Sadece ADMIN ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param request Mal kabul fişi oluşturma isteği.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Oluşturulan mal kabul fişi nesnesi.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<GoodsReceipt> createGoodsReceipt(@RequestBody GoodsReceiptRequest request, @AuthenticationPrincipal User authenticatedUser) {
        GoodsReceipt createdReceipt = goodsReceiptService.createGoodsReceipt(
                request,
                authenticatedUser.getId(),
                authenticatedUser.getTenantId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReceipt);
    }

    /**
     * Bir tenant'a ait tüm mal kabul fişlerini listeler.
     * ADMIN, WAREHOUSE_STAFF ve ACCOUNTANT (fatura kontrolü için) erişebilir.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return Mal kabul fişleri listesi.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<List<GoodsReceipt>> getAllGoodsReceipts(@AuthenticationPrincipal User authenticatedUser) {
        List<GoodsReceipt> receipts = goodsReceiptService.getAllGoodsReceiptsByTenant(authenticatedUser.getTenantId());
        return ResponseEntity.ok(receipts);
    }

    /**
     * Bir mal kabul fişini iptal eder.
     * Sadece ADMIN ve WAREHOUSE_STAFF rollerine sahip kullanıcılar erişebilir.
     * @param id İptal edilecek fişin ID'si.
     * @param authenticatedUser Giriş yapmış kullanıcı.
     * @return HTTP 204 No Content.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_WAREHOUSE_STAFF')")
    public ResponseEntity<Void> cancelGoodsReceipt(@PathVariable String id, @AuthenticationPrincipal User authenticatedUser) {
        goodsReceiptService.cancelGoodsReceipt(id, authenticatedUser.getId(), authenticatedUser.getTenantId());
        return ResponseEntity.noContent().build();
    }
}