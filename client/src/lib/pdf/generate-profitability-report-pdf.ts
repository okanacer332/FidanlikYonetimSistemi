import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import type { ProfitabilityReportDto } from '@/types/nursery';

export const generateProfitabilityReportPdf = (data: ProfitabilityReportDto[], tenantName: string) => {
  const doc = new jsPDF();
  const currencyFormatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

  // Başlık
  doc.setFontSize(18);
  doc.text('Ürün Karlılık Raporu', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Şirket: ${tenantName}`, 14, 29);
  doc.text(`Rapor Tarihi: ${dayjs().format('DD.MM.YYYY')}`, 14, 36);

  // Tablo
  const tableColumn = ["Fidan Adı", "Satılan Adet", "Toplam Hasılat", "Toplam Maliyet", "Toplam Kâr", "Kâr Marjı (%)"];
  const tableRows: any[] = [];

  data.forEach(item => {
    const profitMargin = item.totalRevenue > 0 ? ((item.totalProfit / item.totalRevenue) * 100).toFixed(2) : '0.00';
    const row = [
      item.plantName,
      item.totalQuantitySold,
      currencyFormatter.format(item.totalRevenue),
      currencyFormatter.format(item.totalCost),
      currencyFormatter.format(item.totalProfit),
      `%${profitMargin}`
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 50,
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 73] }, // Yeşil tonu
  });

  // İndirme
  doc.save(`karlilik-raporu-${dayjs().format('YYYY-MM-DD')}.pdf`);
};