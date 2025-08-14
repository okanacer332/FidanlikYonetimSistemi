package com.fidanlik.fidanysserver.goodsreceipt.repository;

import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List; // Import List

public interface GoodsReceiptRepository extends MongoRepository<GoodsReceipt, String> {
    // ADD THIS METHOD
    List<GoodsReceipt> findAllByTenantId(String tenantId);
    long countByTenantIdAndReceiptDateAfter(String tenantId, LocalDateTime date);
}