package com.fidanlik.fidanysserver.goodsreceipt.repository;

import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional; // Import Optional

public interface GoodsReceiptRepository extends MongoRepository<GoodsReceipt, String> {
    List<GoodsReceipt> findAllByTenantId(String tenantId);
    // Bu metod GoodsReceipt modelinde 'orderId' alanı olmadığı için kaldırıldı.
    // boolean existsByOrderId(String orderId);
    Optional<GoodsReceipt> findByIdAndTenantId(String id, String tenantId);
}