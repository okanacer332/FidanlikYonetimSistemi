import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Fonksiyonu doğrudan import ediyoruz
import dayjs from 'dayjs';
import type { Invoice, Customer } from '@/types/nursery';

export const generateInvoicePdf = (invoice: Invoice, customer: Customer) => {
  // 1. Yeni bir jsPDF nesnesi oluştur
  const doc = new jsPDF();

  // --- Başlık ve Firma Bilgileri ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FATURA', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FidanYS A.Ş.', 14, 30);
  doc.text('Teknopark, Malatya', 14, 35);
  doc.text('iletisim@fidanys.xyz', 14, 40);

  // --- Fatura ve Müşteri Bilgileri ---
  doc.setFontSize(10);
  doc.text(`Fatura No: ${invoice.invoiceNumber}`, 14, 60);
  doc.text(`Fatura Tarihi: ${dayjs(invoice.issueDate).format('DD.MM.YYYY')}`, 14, 65);
  doc.text(`Vade Tarihi: ${dayjs(invoice.dueDate).format('DD.MM.YYYY')}`, 14, 70);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Müşteri:', 130, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${customer.firstName} ${customer.lastName}`, 130, 65);
  doc.text(customer.address, 130, 70);
  doc.text(customer.email, 130, 75);

  // --- Fatura Kalemleri Tablosu ---
  const tableColumn = ["Açıklama", "Miktar", "Birim Fiyat", "Toplam"];
  const tableRows: any[] = [];

  invoice.items.forEach(item => {
    const row = [
      item.description,
      item.quantity,
      item.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
      item.totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
    ];
    tableRows.push(row);
  });

  // DÜZELTME: doc.autoTable() yerine, import edilen autoTable fonksiyonu çağrılıyor.
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  // --- Toplamlar Bölümü ---
  // DÜZELTME: Tablonun son Y pozisyonunu almak için doc nesnesine eklenen özellik kullanılır.
  const finalY = (doc as any).lastAutoTable.finalY;
  const taxRate = 0.20; // %20 KDV
  const subtotal = invoice.items.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;
  
  doc.setFontSize(10);
  doc.text(`Ara Toplam: ${subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`, 140, finalY + 10);
  doc.text(`KDV (%${taxRate * 100}): ${taxAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`, 140, finalY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(`Genel Toplam: ${grandTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`, 140, finalY + 20);

  // --- Alt Bilgi ---
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Ödeme için teşekkür ederiz.', 105, 285, { align: 'center' });

  // 2. PDF'i kaydet
  doc.save(`fatura-${invoice.invoiceNumber}.pdf`);
};
