package com.fidanlik.fidanysserver.inflation.repository;

import com.fidanlik.fidanysserver.inflation.model.InflationData;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface InflationDataRepository extends MongoRepository<InflationData, String> {
    List<InflationData> findAllByTenantId(String tenantId);
    Optional<InflationData> findByTenantIdAndPeriod(String tenantId, String period);
}