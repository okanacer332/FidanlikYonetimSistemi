// src/components/common/InlineCreateForm.tsx
'use client';
import * as React from 'react';
import { Card, CardContent, Collapse, CardHeader, IconButton } from '@mui/material';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';

interface InlineCreateFormProps {
  title: string;
  isOpen: boolean; // Formun açık mı kapalı mı olduğunu dışarıdan kontrol edeceğiz
  onClose: () => void; // Formu kapatma fonksiyonu
  children: React.ReactNode; // Formun kendisi (örn: <CustomerCreateForm />)
}

export function InlineCreateForm({ title, isOpen, onClose, children }: InlineCreateFormProps) {
  return (
    // Collapse bileşeni, içeriğin yumuşak bir animasyonla açılıp kapanmasını sağlar.
    // unmountOnExit, kapalıyken formu DOM'dan kaldırarak performansı artırır.
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
      {/* Formu daha düzenli göstermek için bir Card içine alıyoruz */}
      <Card sx={{ mb: 3 }}> {/* Altındaki tablo ile arasına boşluk koyar */}
        <CardHeader
          title={title}
          action={
            <IconButton aria-label="Kapat" onClick={onClose}>
              <XIcon size={20} />
            </IconButton>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          {/* pt: 0 -> CardHeader ile içerik arasındaki dikey boşluğu kaldırır */}
          {children}
        </CardContent>
      </Card>
    </Collapse>
  );
}