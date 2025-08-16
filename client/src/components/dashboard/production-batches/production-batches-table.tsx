'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { styled } from '@mui/material/styles';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { getAllProductionBatches } from '@/api/nursery';
import type { ProductionBatch, PlantType, PlantVariety } from '@/types/plant';
import { useApi } from '@/hooks/use-api';
import { paths } from '@/paths';

interface ProductionBatchesTableProps {
  productionBatches: ProductionBatch[];
  plantTypeMap: Map<string, string>;
  plantVarietyMap: Map<string, string>;
}

// Özel stil tanımlaması - Hücre dolguları ve metin yönetimi
const CompactTableCell = styled(TableCell)(({ theme }) => ({
  // Daha da az dolgu, hücrelerin birbirine girmesini engellemek için minimum
  padding: theme.spacing(0.5, 0.5), // Dikeyde 4px, yatayda 4px boşluk
  fontSize: '0.70rem', // Yazı boyutunu daha da küçült
  lineHeight: '1.2', // Satır yüksekliğini azalt
  wordBreak: 'break-word', // Uzun kelimelerin satır atlamasına izin ver
  verticalAlign: 'top', // İçeriği hücrenin üstüne hizala
  '&:last-child': {
    paddingRight: theme.spacing(0.5),
  },
  '&:first-child': {
    paddingLeft: theme.spacing(0.5),
  },
}));

const CompactTableHeadCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.3, 0.5), // Başlık hücreleri için daha da az boşluk
  fontWeight: theme.typography.fontWeightMedium,
  // whiteSpace: 'nowrap', // Başlık metinlerinin tek satırda kalmasını kaldırıyoruz, taşarsa kaydırılsın
  fontSize: '0.70rem', // Başlık yazı boyutunu küçült
  wordBreak: 'break-word', // Başlık metinlerinin de kaydırılmasına izin ver
  verticalAlign: 'top', // İçeriği hücrenin üstüne hizala
  '&:last-child': {
    paddingRight: theme.spacing(0.5),
  },
  '&:first-child': {
    paddingLeft: theme.spacing(0.5),
  },
}));

export function ProductionBatchesTable({ productionBatches: batches, plantTypeMap, plantVarietyMap }: ProductionBatchesTableProps): React.JSX.Element {
  return (
    <Card>
      {/* Min genişliği biraz daha artırarak tüm içeriğin daha iyi yayılmasını sağlayalım */}
      {/* overflowX: 'auto' ile mobil uyumluluğu koru */}
      <Box sx={{ minWidth: 1000, overflowX: 'auto' }}>
          {/* tableLayout: fixed kaldırıldı, MUI'nin otomatik genişlik belirlemesine bırakıldı */}
          {/* Bu, içeriğin yayılmasına izin verir, ancak çok uzun içerikler hala sorun olabilir */}
          <Table size="small">
            <TableHead>
              <TableRow>
                {/* Sütun genişlikleri kaldırıldı, içeriğe göre ayarlansın */}
                <CompactTableHeadCell>Parti Kodu</CompactTableHeadCell>
                <CompactTableHeadCell>Parti Adı</CompactTableHeadCell>
                <CompactTableHeadCell>Tür</CompactTableHeadCell>
                <CompactTableHeadCell>Çeşit</CompactTableHeadCell>
                <CompactTableHeadCell>Başlangıç Tarihi</CompactTableHeadCell>
                <CompactTableHeadCell>Başlangıç Adedi</CompactTableHeadCell>
                <CompactTableHeadCell>Mevcut Adet</CompactTableHeadCell>
                <CompactTableHeadCell>Hasat Adet</CompactTableHeadCell>
                <CompactTableHeadCell>Maliyet (Nom.)</CompactTableHeadCell>
                <CompactTableHeadCell>Maliyet (Enf.)</CompactTableHeadCell>
                <CompactTableHeadCell>Son Günc.</CompactTableHeadCell>
                <CompactTableHeadCell>Durum</CompactTableHeadCell>
                <CompactTableHeadCell>Açıklama</CompactTableHeadCell>
                <CompactTableHeadCell>Aksiyonlar</CompactTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.map((batch) => (
                <TableRow hover key={batch.id}>
                  <CompactTableCell>{batch.batchCode}</CompactTableCell>
                  <CompactTableCell>{batch.batchName}</CompactTableCell>
                  <CompactTableCell>{plantTypeMap.get(batch.plantTypeId) || 'Bilinmiyor'}</CompactTableCell>
                  <CompactTableCell>{plantVarietyMap.get(batch.plantVarietyId) || 'Bilinmiyor'}</CompactTableCell>
                  <CompactTableCell>{new Date(batch.startDate).toLocaleDateString('tr-TR')}</CompactTableCell>
                  <CompactTableCell>{batch.initialQuantity}</CompactTableCell>
                  <CompactTableCell>{batch.currentQuantity}</CompactTableCell>
                  <CompactTableCell>{batch.harvestedQuantity ?? '0'}</CompactTableCell>
                  <CompactTableCell>{batch.costPool?.toFixed(2) ?? '0.00'}</CompactTableCell>
                  <CompactTableCell>{batch.inflationAdjustedCostPool?.toFixed(2) ?? '0.00'}</CompactTableCell>
                  <CompactTableCell>{batch.lastCostUpdateDate ? new Date(batch.lastCostUpdateDate).toLocaleDateString('tr-TR') : 'N/A'}</CompactTableCell>
                  <CompactTableCell>{batch.status}</CompactTableCell>
                  <CompactTableCell>{batch.description || 'N/A'}</CompactTableCell>
                  <CompactTableCell sx={{ whiteSpace: 'nowrap' }}> {/* Aksiyon hücresi içindeki metnin kaymasını engelle */}
                    <Button
                      component={RouterLink}
                      //href={paths.dashboard.productionBatchesDetails(batch.id)}
                      // Butonun boyutunu daha küçük ve kontrol edilebilir yapalım
                      sx={{
                        minWidth: 'auto', // Butonun minimum genişliğini içeriğine bırak
                        padding: '2px 6px', // Daha küçük padding
                        fontSize: '0.65rem', // Daha küçük font boyutu
                        lineHeight: 1, // Satır yüksekliğini ayarla
                        height: 'auto', // Yüksekliği içeriğine bırak
                      }}
                      variant="outlined"
                    >
                      Detay
                    </Button>
                  </CompactTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
    </Card>
  );
}