// fidanys-server/src/main/java/com/fidanlik/fidanysserver/common/dto/MasterDataDTO.java
package com.fidanlik.fidanysserver.common.dto;

import com.fidanlik.fidanysserver.fidan.model.*;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MasterDataDTO {
    private List<PlantType> plantTypes;
    private List<PlantVariety> plantVarieties;
    private List<Rootstock> rootstocks;
    private List<PlantSize> plantSizes;
    private List<PlantAge> plantAges;
    private List<Land> lands; // Yeni eklendi
}