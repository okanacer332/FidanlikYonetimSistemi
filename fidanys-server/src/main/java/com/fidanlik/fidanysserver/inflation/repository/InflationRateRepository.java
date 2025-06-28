package com.fidanlik.fidanysserver.inflation.repository;

import com.fidanlik.fidanysserver.inflation.model.InflationRate;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface InflationRateRepository extends MongoRepository<InflationRate, String> {
    List<InflationRate> findAllByTenantId(String tenantId);
    Optional<InflationRate> findByYearAndMonthAndTenantId(int year, int month, String tenantId);
}