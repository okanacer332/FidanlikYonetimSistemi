'use client';

import * as React from 'react';
import { Grid } from '@mui/material';
import { ChartLineUp as ChartLineUpIcon, ChartLineDown as ChartLineDownIcon, Package as PackageIcon, Coins as CoinsIcon } from '@phosphor-icons/react';
import type { DashboardSummaryDTO } from '@/types/dashboard';

import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
// YENİ İMPORTLAR
import { MonthlySalesTrendChart } from './MonthlySalesTrendChart';
import { TopSellingPlantsList } from './TopSellingPlantsList';

const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return '0 TL';
  return `${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
};

interface AdminDashboardProps {
  data: DashboardSummaryDTO;
}

export function AdminDashboard({ data }: AdminDashboardProps): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      {/* Üst Sıra: En Kritik 4 Metrik */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Son 30 Gün Gelir"
          value={formatCurrency(data.totalRevenueLast30Days)}
          icon={ChartLineUpIcon}
          iconColor="var(--mui-palette-success-main)"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Bu Ayki Gider"
          value={formatCurrency(data.totalExpensesThisMonth)}
          icon={ChartLineDownIcon}
          iconColor="var(--mui-palette-error-main)"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Bekleyen Siparişler"
          value={data.pendingOrdersCount?.toString() || '0'}
          icon={PackageIcon}
          iconColor="var(--mui-palette-warning-main)"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Toplam Stok Değeri"
          value={formatCurrency(data.totalStockValue)}
          icon={CoinsIcon}
          iconColor="var(--mui-palette-info-main)"
        />
      </Grid>

      {/* Alt Sıra: Grafikler ve Listeler */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <ChartCard title="Aylık Satış Trendi">
          <MonthlySalesTrendChart data={data.last7DaysCashFlow} /> {/* Backend'den gelen aylık satış verisini kullanıyoruz */}
        </ChartCard>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <ChartCard title="En Çok Satan 5 Fidan">
          <TopSellingPlantsList data={data.topSellingPlants} />
        </ChartCard>
      </Grid>
    </Grid>
  );
}