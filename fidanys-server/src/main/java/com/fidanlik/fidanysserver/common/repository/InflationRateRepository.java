package com.fidanlik.fidanysserver.common.repository;

import com.fidanlik.fidanysserver.common.model.InflationRate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface InflationRateRepository extends MongoRepository<InflationRate, String> {
    Optional<InflationRate> findByYearAndMonthAndTenantId(int year, int month, String tenantId);
    List<InflationRate> findAllByTenantIdOrderByYearAscMonthAsc(String tenantId);
    List<InflationRate> findByTenantIdAndYearGreaterThanEqualAndMonthGreaterThanEqualOrderByYearAscMonthAsc(String tenantId, int startYear, int startMonth);
    List<InflationRate> findByTenantIdAndYearLessThanEqualAndMonthLessThanEqualOrderByYearAscMonthAsc(String tenantId, int endYear, int endMonth);
    List<InflationRate> findByTenantIdAndYearBetweenAndMonthBetweenOrderByYearAscMonthAsc(String tenantId, int startYear, int endYear, int startMonth, int endMonth);
}