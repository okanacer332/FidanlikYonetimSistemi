'use client';

import * as React from 'react';
import { Grid } from '@mui/material';
import { Receipt as ReceiptIcon, Handshake as HandshakeIcon } from '@phosphor-icons/react';
import type { DashboardSummaryDTO } from '@/types/dashboard';

import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
// YENİ: Gerçek grafik bileşenlerini import ediyoruz
import { CashFlowChart } from './CashFlowChart';
import { ExpenseDistributionChart } from './ExpenseDistributionChart';

const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return '0,00 TL';
  return `${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
};

interface AccountantDashboardProps {
  data: DashboardSummaryDTO;
}

export function AccountantDashboard({ data }: AccountantDashboardProps): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      {/* Üst Sıra: En Kritik Metrikler */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard
          title="Vadesi Geçmiş Alacaklar"
          value={formatCurrency(data.overdueInvoicesTotal)}
          icon={ReceiptIcon}
          iconColor="var(--mui-palette-error-main)"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard
          title="Ödenmemiş Tedarikçi Borçları"
          value={formatCurrency(data.unpaidSupplierDebt)}
          icon={HandshakeIcon}
          iconColor="var(--mui-palette-warning-main)"
        />
      </Grid>
      
      {/* Geniş Kartlar: Grafikler */}
      <Grid size={{ xs: 12, lg: 7 }}>
        <ChartCard title="Son 7 Günlük Nakit Akışı">
          {/* DEĞİŞİKLİK: Boş div'i kaldırıp Nakit Akışı grafiğini ekliyoruz */}
          <CashFlowChart data={data.last7DaysCashFlow} />
        </ChartCard>
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <ChartCard title="Giderlerin Dağılımı">
           {/* DEĞİŞİKLİK: Boş div'i kaldırıp Gider Dağılımı grafiğini ekliyoruz */}
           <ExpenseDistributionChart data={data.expenseDistribution} />
        </ChartCard>
      </Grid>
    </Grid>
  );
}