// src/components/common/StatusChip.tsx
import * as React from 'react';
import { Chip, ChipProps } from '@mui/material';

// Hangi durumların hangi renkte olacağını belirleyen bir harita
const STATUS_MAP: Record<string, ChipProps['color']> = {
  pending: 'warning',
  paid: 'success',
  delivered: 'success',
  canceled: 'error',
  refunded: 'secondary',
  draft: 'default',
};

// Hangi durumların hangi metinle gösterileceği
const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  paid: 'Ödendi',
  delivered: 'Teslim Edildi',
  canceled: 'İptal Edildi',
  refunded: 'İade Edildi',
  draft: 'Taslak',
};

interface StatusChipProps {
  status: string; // Dışarıdan 'pending', 'paid' gibi bir durum adı alacağız
}

export function StatusChip({ status }: StatusChipProps): React.JSX.Element {
  // Durum adına göre doğru rengi ve etiketi haritalardan buluyoruz.
  // Eğer haritada olmayan bir durum gelirse, varsayılan olarak 'default' kullanılır.
  const color = STATUS_MAP[status.toLowerCase()] || 'default';
  const label = STATUS_LABELS[status.toLowerCase()] || status;

  return <Chip label={label} color={color} size="small" />;
}