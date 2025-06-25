import dayjs from 'dayjs';
import type { ProfitabilityReportDto } from '@/types/nursery';

// Veri içindeki virgül gibi karakterlerin CSV formatını bozmamasını sağlar
const escapeCsvCell = (cellData: string | number): string => {
  const cell = String(cellData);
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
};

export const generateProfitabilityReportCsv = (data: ProfitabilityReportDto[]) => {
  if (data.length === 0) {
    return;
  }

  // Başlıklar
  const headers = [
    'Fidan Adı',
    'Satılan Adet',
    'Toplam Hasılat (TRY)',
    'Toplam Maliyet (TRY)',
    'Toplam Kar (TRY)',
    'Kar Marjı (%)',
  ];

  // Satırlar
  const rows = data.map(item => {
    const profitMargin = item.totalRevenue > 0 ? ((item.totalProfit / item.totalRevenue) * 100).toFixed(2) : '0.00';
    return [
      escapeCsvCell(item.plantName),
      escapeCsvCell(item.totalQuantitySold),
      escapeCsvCell(item.totalRevenue),
      escapeCsvCell(item.totalCost),
      escapeCsvCell(item.totalProfit),
      escapeCsvCell(profitMargin),
    ].join(',');
  });

  // CSV içeriğini oluştur
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Dosyayı indirme işlemi
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // BOM ekleyerek Excel'in Türkçe karakterleri doğru açmasını sağlıyoruz
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `karlilik-raporu-${dayjs().format('YYYY-MM-DD')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};