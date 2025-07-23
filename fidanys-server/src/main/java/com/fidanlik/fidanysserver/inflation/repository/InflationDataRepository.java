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
}