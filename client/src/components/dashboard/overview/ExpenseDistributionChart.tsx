'use client';

import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { Box, Typography } from '@mui/material';

interface ExpenseDistributionChartProps {
  data?: Record<string, number>;
}

export function ExpenseDistributionChart({ data = {} }: ExpenseDistributionChartProps): React.JSX.Element {
  // Convert the data object to an array that the PieChart can use
  const chartData = Object.entries(data).map(([label, value], id) => ({
    id,
    value,
    label,
  }));

  // If there's no data, show a message
  if (chartData.length === 0) {
    return (
      <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Gider dağılımı için veri bulunamadı.</Typography>
      </Box>
    );
  }

  // Calculate the total of all expenses to show in the center
  const TOTAL = chartData.map((item) => item.value).reduce((a, b) => a + b, 0);

  return (
    <Box sx={{ width: '100%', height: 350, position: 'relative' }}>
      <PieChart
        series={[
          {
            data: chartData,
            // Make it a donut chart
            innerRadius: 80,
            outerRadius: 125,
            paddingAngle: 2,
            cornerRadius: 5,
            // Display the percentage on the arc itself
            arcLabel: (item) => `${((item.value / TOTAL) * 100).toFixed(0)}%`,
          },
        ]}
        // This is the correct, robust way to style the arc labels
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fill: 'white',
            fontWeight: 'bold',
            fontSize: '0.8rem',
          },
        }}
        // The legend is enabled by default and will appear correctly
        // We do not need to pass complex position props
      />
    </Box>
  );
}