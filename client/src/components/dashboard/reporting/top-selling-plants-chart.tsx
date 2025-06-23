'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, Typography, useTheme } from '@mui/material';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';
import type { TopSellingPlantReport } from '@/types/nursery';

interface TopSellingPlantsChartProps {
  data: TopSellingPlantReport[];
}

export function TopSellingPlantsChart({ data }: TopSellingPlantsChartProps): React.JSX.Element {
  const theme = useTheme();

  if (data.length === 0) {
    return (
        <Card>
            <CardHeader title="En Çok Satan 10 Fidan" />
            <CardContent>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                    Raporu oluşturmak için yeterli satış verisi bulunmamaktadır.
                </Typography>
            </CardContent>
        </Card>
    )
  }

  const chartOptions: ApexOptions = {
    chart: { 
        background: 'transparent', 
        stacked: false, 
        toolbar: { show: false } 
    },
    colors: [theme.palette.primary.main],
    plotOptions: { 
        bar: { 
            horizontal: true,
            barHeight: '75%',
            borderRadius: 4,
         } 
    },
    xaxis: {
      categories: data.map(item => `${item.plantTypeName} - ${item.plantVarietyName}`),
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
      title: {
        text: 'Satış Adedi',
        style: { color: theme.palette.text.primary, fontSize: '12px' },
      },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
      },
    },
    tooltip: { 
        y: { formatter: (val) => `${val} adet` },
        theme: 'dark'
    },
    grid: {
      borderColor: theme.palette.divider,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } }, // Kategorilerin yanındaki çizgileri kaldır
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#fff']
      },
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
      },
      offsetX: 0,
    }
  };
  
  const chartSeries = [{
    name: 'Satış Adedi',
    data: data.map(item => item.totalQuantitySold),
  }];

  return (
    <Card>
      <CardHeader title="En Çok Satan 10 Fidan" />
      <CardContent>
        <Chart height={450} options={chartOptions} series={chartSeries} type="bar" />
      </CardContent>
    </Card>
  );
}
