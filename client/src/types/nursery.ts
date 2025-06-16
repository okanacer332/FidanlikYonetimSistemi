// client/src/types/nursery.ts

export interface PlantType {
  id: string;
  name: string;
  tenantId: string;
}

export interface PlantTypeCreate {
  name: string;
}

export interface PlantTypeUpdate {
  name: string;
}