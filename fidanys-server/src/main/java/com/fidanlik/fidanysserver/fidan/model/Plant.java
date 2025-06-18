package com.fidanlik.fidanysserver.fidan.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "plants")
@CompoundIndex(def = "{'plantTypeId': 1, 'plantVarietyId': 1, 'rootstockId': 1, 'plantSizeId': 1, 'plantAgeId': 1, 'landId': 1, 'tenantId': 1}", unique = true)
public class Plant {
    @Id
    private String id;

    private String plantTypeId;
    private String plantVarietyId;
    private String rootstockId;
    private String plantSizeId;
    private String plantAgeId;
    private String landId;

    @DBRef
    private PlantType plantType;

    @DBRef
    private PlantVariety plantVariety;

    @DBRef
    private Rootstock rootstock;

    @DBRef
    private PlantSize plantSize;

    @DBRef
    private PlantAge plantAge;

    @DBRef
    private Land land;

    private String tenantId;

}