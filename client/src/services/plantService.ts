import { useApiSWR } from '@/hooks/use-api-swr';
import type { Plant, MasterData, PlantCreateFormValues } from '@/types/nursery';
import { gql } from 'graphql-request';

// --- GraphQL Sorguları ---
const GET_PLANTS_QUERY = gql`
  query GetPlants {
    plants {
      id
      tenantId
      plantType { id name }
      plantVariety { id name }
      rootstock { id name }
      plantSize { id name }
      plantAge { id name }
      land { id name }
    }
  }
`;

// --- Servis Hook'ları ve Fonksiyonları ---

/**
 * Fidan listesini SWR ve GraphQL ile çeker.
 * @returns SWR response objesi (data, error, isLoading, mutate)
 */
export const usePlants = () => {
  const { data, ...rest } = useApiSWR<{ plants: Plant[] }>(GET_PLANTS_QUERY);
  return { data: data?.plants, ...rest };
};

/**
 * Master datayı (fidan türleri, çeşitleri vb.) SWR ve REST API ile çeker.
 * Not: Bu, gelecekte GraphQL'e taşınabilir.
 * @returns SWR response objesi
 */
export const useMasterData = () => useApiSWR<MasterData>('/master-data');


/**
 * Yeni bir fidan kimliği oluşturmak için backend'e POST isteği atar.
 * @param values - Yeni fidan için form verileri
 * @returns Oluşturulan yeni fidan objesi
 */
export const createPlant = async (values: PlantCreateFormValues): Promise<Plant> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fidan kimliği oluşturulamadı.');
    }
    return response.json();
};

/**
 * Belirtilen ID'ye sahip fidanı silmek için backend'e DELETE isteği atar.
 * @param plantId - Silinecek fidanın ID'si
 */
export const deletePlant = async (plantId: string): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Oturum bulunamadı.');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/plants/${plantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fidan silinemedi.');
    }
};