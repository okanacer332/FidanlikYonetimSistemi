// Bu dosya, fidanlık yönetimi ile ilgili tüm frontend tiplerini içerecektir.

// --- Ana Veri Tipleri ---

export interface PlantType {
  id: string;
  name: string;
  tenantId: string;
}

export interface Rootstock {
  id: string;
  name: string;
  tenantId: string;
}

export interface PlantSize {
  id: string;
  name: string;
  tenantId: string;
}

export interface PlantAge {
  id: string;
  name: string;
  tenantId: string;
}

export interface PlantVariety {
  id: string;
  name: string;
  plantTypeId: string;
  plantType?: PlantType; // DBRef'ten gelen dolu nesne (opsiyonel)
  tenantId: string;
}


// --- Form Değerleri için Tipler ---

export interface PlantTypeCreate {
  name: string;
}

export interface RootstockCreate {
    name: string;
}

export interface PlantSizeCreate {
    name: string;
}

export interface PlantAgeCreate {
    name: string;
}

export interface PlantVarietyCreate {
    name: string;
    plantTypeId: string;
}


// --- Birleşik Tipler ---

// Backend'deki MasterDataDTO'ya karşılık gelen tip
export interface MasterData {
    plantTypes: PlantType[];
    plantVarieties: PlantVariety[];
    rootstocks: Rootstock[];
    plantSizes: PlantSize[];
    plantAges: PlantAge[];
}

// Ana "Fidan Kimliği" (Plant) nesnesi
export interface Plant {
    id: string;
    plantType: PlantType;
    plantVariety: PlantVariety;
    rootstock: Rootstock;
    plantSize: PlantSize;
    plantAge: PlantAge;
    tenantId: string;
}

// Fidan Kimliği oluşturma formu için veri tipi
export interface PlantCreateFormValues {
    plantTypeId: string;
    plantVarietyId: string;
    rootstockId: string;
    plantSizeId: string;
    plantAgeId: string;
}