// client/src/services/userService.ts
import { apiClient } from '@/lib/apiClient';
// Düzeltme: `UserUpdateFormValues` tipini import et
import type { User, UserCreateFormValues, Role, UserUpdateFormValues } from '@/types/user';

// SWR hook'u: Tüm kullanıcıları getirir
export const useUsers = () => apiClient.get<User[]>('/users');

// Yeni kullanıcı oluşturur
export const createUser = (values: UserCreateFormValues): Promise<User> => {
  return apiClient.post<User>('/users', values);
};

// Kullanıcı siler
export const deleteUser = (userId: string): Promise<void> => {
  return apiClient.delete<void>(`/users/${userId}`);
};

// Mevcut bir kullanıcıyı günceller (PUT metodu)
// Düzeltme: `values` parametresinin tipini `UserUpdateFormValues` olarak değiştir
export const updateUser = (userId: string, values: UserUpdateFormValues): Promise<User> => {
  return apiClient.put<User>(`/users/${userId}`, values);
};

// Rolleri getiren servis
export const useRoles = () => apiClient.get<Role[]>('/roles');