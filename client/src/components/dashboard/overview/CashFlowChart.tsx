'use client';

import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from '@mui/material';
import type { DailyCashFlowDTO } from '@/types/dashboard';

interface CashFlowChartProps {
  data?: DailyCashFlowDTO[];
}

export function CashFlowChart({ data = [] }: CashFlowChartProps): React.JSX.Element {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Nakit akışı için yeterli veri bulunamadı.</Typography>
      </Box>
    );
  }

  // Gelen veriyi MUI X Charts'ın anlayacağı formata çeviriyoruz
  const xAxisData = data.map(item => item.date); // Tarih etiketleri (GG.AA)
  const incomeData = data.map(item => item.income); // Para Girişi verileri
  const outcomeData = data.map(item => item.outcome); // Para Çıkışı verileri

  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <LineChart
        // X ekseni (yatay) için tarih etiketlerini belirliyoruz
        xAxis={[{
          data: xAxisData,
          scaleType: 'band',
        }]}
        // Y ekseninde iki farklı veri serimiz (giriş ve çıkış) olacak
        series={[
          {
            data: incomeData,
            label: 'Para Girişi (TL)',
            color: 'var(--mui-palette-success-main)', // Yeşil renk
            curve: "monotoneX"
          },
          {
            data: outcomeData,
            label: 'Para Çıkışı (TL)',
            color: 'var(--mui-palette-error-main)', // Kırmızı renk
            curve: "monotoneX"
          },
        ]}
        grid={{ horizontal: true }} // Sadece yatay kılavuz çizgileri
      />
    </Box>
  );
}