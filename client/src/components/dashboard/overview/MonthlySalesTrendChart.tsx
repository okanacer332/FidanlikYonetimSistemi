'use client';

import * as React from 'react';
// HATA DÜZELTİLDİ: Sadece MUI X Charts'ın ana bileşenini import ediyoruz.
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from '@mui/material';
import type { DailyCashFlowDTO } from '@/types/dashboard';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

interface MonthlySalesTrendChartProps {
  data?: DailyCashFlowDTO[];
}

export function MonthlySalesTrendChart({ data = [] }: MonthlySalesTrendChartProps): React.JSX.Element {
  // dayjs'in yerelleştirme ayarını yapıyoruz
  dayjs.locale('tr');

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Satış trendi için yeterli veri bulunamadı.</Typography>
      </Box>
    );
  }

  // Gelen veriyi MUI X Charts'ın anlayacağı formata çeviriyoruz
  const xAxisData = data.map(item => dayjs(item.date).toDate()); // Tarih verileri
  const seriesData = data.map(item => item.income); // Sayısal gelir verileri

  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <LineChart
        // X ekseni (yatay) için tarih verilerini ve ayarlarını belirliyoruz
        xAxis={[{
          data: xAxisData,
          scaleType: 'time',
          valueFormatter: (date) => dayjs(date).format('MMM YYYY'), // Örn: Oca 2025
        }]}
        // Y ekseni (dikey) için gelir verilerini ve ayarlarını belirliyoruz
        series={[{
          data: seriesData,
          label: 'Aylık Gelir (TL)',
          // Grafikteki noktanın üzerine gelince görünecek format
          valueFormatter: (value) => value === null ? '' : `${value.toLocaleString('tr-TR')} TL`,
        }]}
        // ResponsiveContainer, Tooltip, Line gibi bileşenlere gerek yoktur.
        // MUI X Charts bunları kendi içinde, prop'lar aracılığıyla yönetir.
        // Varsayılan olarak responsive ve tooltip etkindir.
        grid={{ vertical: true, horizontal: true }} // Kılavuz çizgilerini etkinleştir
      />
    </Box>
  );
}