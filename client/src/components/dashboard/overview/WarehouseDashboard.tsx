'use client';

import * as React from 'react';
import { Grid } from '@mui/material';
import { Warning as WarningIcon, Package as PackageIcon, Truck as TruckIcon } from '@phosphor-icons/react';
import type { DashboardSummaryDTO } from '@/types/dashboard';

import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
// YENİ: Gerçek grafik bileşenini import ediyoruz
import { StockDistributionChart } from './StockDistributionChart';

interface WarehouseDashboardProps {
  data: DashboardSummaryDTO;
}

export function WarehouseDashboard({ data }: WarehouseDashboardProps): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Kritik Stok"
          value={data.criticalStockCount?.toString() || '0'}
          icon={WarningIcon}
          iconColor="var(--mui-palette-error-main)"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Bugün Sevk Edilecek"
          value={data.ordersToShipToday?.toString() || '0'}
          icon={TruckIcon}
          iconColor="var(--mui-palette-warning-main)"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Son Mal Girişleri (24s)"
          value={data.recentGoodsReceiptsCount?.toString() || '0'}
          icon={PackageIcon}
          iconColor="var(--mui-palette-success-main)"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ChartCard title="Depolara Göre Stok Dağılımı">
          {/* DEĞİŞİKLİK: Boş div'i kaldırıp yerine yeni grafik bileşenimizi koyuyoruz.
            'data' prop'u ile backend'den gelen stok dağılımı verisini grafiğe iletiyoruz.
          */}
          <StockDistributionChart data={data.stockDistribution} />
        </ChartCard>
      </Grid>
    </Grid>
  );
}