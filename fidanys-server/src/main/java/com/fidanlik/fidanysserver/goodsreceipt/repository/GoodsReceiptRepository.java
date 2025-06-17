// Dosya Yolu: fidanys-server/src/main/java/com/fidanlik/fidanysserver/goodsreceipt/repository/GoodsReceiptRepository.java
package com.fidanlik.fidanysserver.goodsreceipt.repository;

import com.fidanlik.fidanysserver.goodsreceipt.model.GoodsReceipt;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GoodsReceiptRepository extends MongoRepository<GoodsReceipt, String> {
}