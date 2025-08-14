package com.fidanlik.fidanysserver.inflation.repository;

import com.fidanlik.fidanysserver.inflation.model.InflationData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface InflationDataRepository extends MongoRepository<InflationData, String> {

    // Spring Data MongoDB, metot isminden sorguyu otomatik olarak türetir.
    // Bu metot, "date" alanına göre bir kayıt bulmaya yarar.
    Optional<InflationData> findByDate(LocalDate date);

    // Tarihe göre en son (azalan sırayla ilk) enflasyon verisini bulur.
    Optional<InflationData> findTopByOrderByDateDesc();

    // Düzeltildi: Belirli bir tarihten önceki veya o tarihe eşit en son enflasyon verisini bulur.
    Optional<InflationData> findTopByDateLessThanEqualOrderByDateDesc(LocalDate date);
}