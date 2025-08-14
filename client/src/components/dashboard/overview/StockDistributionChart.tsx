'use client';

import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography } from '@mui/material';
import type { StockByWarehouseDTO } from '@/types/dashboard';

interface StockDistributionChartProps {
  data?: StockByWarehouseDTO[];
}

export function StockDistributionChart({ data = [] }: StockDistributionChartProps): React.JSX.Element {
  // Eğer veri yoksa veya boşsa, bir bilgilendirme mesajı göster
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Grafik için yeterli veri bulunamadı.</Typography>
      </Box>
    );
  }

  // Gelen veriyi grafiğin anlayacağı formata çeviriyoruz
  const chartData = {
    // Depo adları x-ekseni (yatay) etiketleri olacak
    xAxis: [{ 
      scaleType: 'band' as const, 
      data: data.map(item => item.warehouseName) 
    }],
    // Fidan sayıları y-eksenindeki (dikey) çubukları oluşturacak
    series: [{ 
      data: data.map(item => item.plantCount),
      label: 'Toplam Fidan Sayısı' // Grafiğin lejantında görünecek etiket
    }],
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      {/* `BarChart` bileşeni MUI X kütüphanesinden geliyor.
        Ona sadece x ve y ekseni verilerini vermemiz yeterli.
        Ayrıca `height` prop'u ile yüksekliğini ayarlıyoruz.
      */}
      <BarChart
        {...chartData}
        height={350}
        margin={{ top: 20, right: 20, bottom: 80, left: 60 }} // Kenar boşlukları (uzun depo isimleri için)
        sx={{
          // Eksen etiketlerinin stillerini buradan özelleştirebiliriz
          '.MuiChartsAxis-tickLabel': {
            fontSize: '0.8rem',
          },
        }}
      />
    </Box>
  );
}