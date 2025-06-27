package com.fidanlik.fidanysserver.accounting.repository;

import com.fidanlik.fidanysserver.accounting.model.InflationRate;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InflationRateRepository extends MongoRepository<InflationRate, String> {
    // İleride özel sorgular gerekirse buraya eklenecek.
}