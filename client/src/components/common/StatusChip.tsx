'use client';

import * as React from 'react';
import { Chip, ChipProps } from '@mui/material';

// Renk haritasını genişletiyoruz
const STATUS_MAP: Record<string, ChipProps['color']> = {
  // Sipariş Durumları
  preparing: 'warning',
  shipped: 'info',
  delivered: 'success',
  // Fatura Durumları
  draft: 'default',
  sent: 'info',
  paid: 'success',
  // Genel Durumlar
  canceled: 'error',
  completed: 'success',
  // Üretim Partisi Durumları
  created: 'default',
  growing: 'info',
  harvested: 'warning',
  cancelled: 'error', // Hem canceled hem cancelled için
};

// Etiket haritasını genişletiyoruz
const STATUS_LABELS: Record<string, string> = {
  // Sipariş Durumları
  preparing: 'Hazırlanıyor',
  shipped: 'Sevk Edildi',
  delivered: 'Teslim Edildi',
  // Fatura Durumları
  draft: 'Taslak',
  sent: 'Gönderildi',
  paid: 'Ödendi',
  // Genel Durumlar
  canceled: 'İptal Edildi',
  completed: 'Tamamlandı',
  // Üretim Partisi Durumları
  created: 'Oluşturuldu',
  growing: 'Büyümede',
  harvested: 'Hasat Edildi',
  cancelled: 'İptal Edildi',
};

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps): React.JSX.Element {
  const safeStatus = status?.toLowerCase() || 'default';
  const color = STATUS_MAP[safeStatus] || 'default';
  const label = STATUS_LABELS[safeStatus] || status;

  return <Chip label={label} color={color} size="small" />;
}