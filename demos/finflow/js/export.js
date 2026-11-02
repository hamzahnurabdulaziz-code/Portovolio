/**
 * FinFlow - Export Layer (Excel / CSV and Official PDF Print)
 */

import { Storage } from './storage.js';

export const ExportService = {
  // 1. Export to CSV (Excel compatible with UTF-8 BOM)
  exportToCSV(transactions, filename = 'Laporan_Keuangan_FinFlow.csv') {
    if (!transactions || transactions.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor.');
      return;
    }

    const headers = ['ID Transaksi', 'Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Nominal (IDR)', 'Bukti Dilampirkan', 'Dicatat Oleh'];
    
    const rows = transactions.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}"`,
      `"${t.categoryName || '-'}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${t.receipt ? 'Ada' : 'Tidak Ada'}"`,
      `"${t.createdBy || 'Finance Staff'}"`
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 2. Export to PDF / Printable Official Financial Statement
  exportToPDF(periodName, metrics, breakdown, transactions) {
    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      alert('Mohon izinkan pop-up browser untuk mencetak/mengunduh PDF laporan.');
      return;
    }

    const netClass = metrics.netIncome >= 0 ? '#10b981' : '#f43f5e';
    const netSign = metrics.netIncome >= 0 ? '+' : '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Keuangan Resmi - PT Nusantara Digital Kreasi</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    .kop-surat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px double #334155;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .company-info h1 {
      margin: 0;
      font-size: 24px;
      color: #1e1b4b;
      font-weight: 800;
    }
    .company-info p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #64748b;
    }
    .report-meta {
      text-align: right;
    }
    .report-meta h2 {
      margin: 0;
      font-size: 16px;
      color: #4f46e5;
    }
    .report-meta p {
      margin: 4px 0 0;
      font-size: 11px;
      color: #64748b;
    }
    .summary-box {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 30px;
      padding: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .summary-col h4 {
      margin: 0 0 6px;
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-col p {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      margin: 24px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #cbd5e1;
      text-transform: uppercase;
      color: #334155;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 24px;
    }
    th, td {
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
    }
    .text-right { text-align: right; }
    .amount-income { color: #059669; font-weight: 700; }
    .amount-expense { color: #e11d48; font-weight: 700; }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      padding: 0 40px;
    }
    .sig-col {
      text-align: center;
    }
    .sig-line {
      width: 180px;
      border-bottom: 1px solid #0f172a;
      margin: 70px auto 6px;
    }
    .sig-title {
      font-size: 11px;
      color: #64748b;
    }
    .print-actions {
      margin-bottom: 20px;
      text-align: right;
    }
    .btn-print {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }
    @media print {
      .print-actions { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan ke PDF</button>
  </div>

  <div class="kop-surat">
    <div class="company-info">
      <h1>PT NUSANTARA DIGITAL KREASI</h1>
      <p>Financial Statement & Executive Cashflow Audit Report</p>
      <p>Menara Palma Lt. 18, HR Rasuna Said, Jakarta Selatan | finance@nusantaradigital.id</p>
    </div>
    <div class="report-meta">
      <h2>REKAPITULASI ARUS KAS</h2>
      <p>Periode: <strong>${periodName}</strong></p>
      <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p>Status: <strong>VERIFIED & AUDITED</strong></p>
    </div>
  </div>

  <div class="summary-box">
    <div class="summary-col">
      <h4>Total Pemasukan</h4>
      <p style="color:#059669;">${Storage.formatIDR(metrics.totalIncome)}</p>
    </div>
    <div class="summary-col">
      <h4>Total Pengeluaran</h4>
      <p style="color:#e11d48;">${Storage.formatIDR(metrics.totalExpense)}</p>
    </div>
    <div class="summary-col">
      <h4>Laba / Rugi Bersih</h4>
      <p style="color:${netClass};">${netSign}${Storage.formatIDR(metrics.netIncome)}</p>
    </div>
    <div class="summary-col">
      <h4>Total Transaksi</h4>
      <p>${metrics.transactionCount} Catatan</p>
    </div>
  </div>

  <div class="section-title">1. Rincian Pengeluaran Berdasarkan Kategori</div>
  <table>
    <thead>
      <tr>
        <th>Kategori</th>
        <th class="text-right">Realisasi Pengeluaran</th>
        <th class="text-right">Batas Anggaran (Budget)</th>
        <th class="text-right">Persentase (%)</th>
        <th class="text-right">Status Kesehatan</th>
      </tr>
    </thead>
    <tbody>
      ${breakdown.items.map(item => `
        <tr>
          <td><strong>${item.icon} ${item.categoryName}</strong></td>
          <td class="text-right">${Storage.formatIDR(item.total)}</td>
          <td class="text-right">${item.limit > 0 ? Storage.formatIDR(item.limit) : 'Tidak dibatasi'}</td>
          <td class="text-right">${item.budgetUsedPercentage}%</td>
          <td class="text-right">
            ${item.budgetUsedPercentage >= 100 
              ? '<span style="color:#e11d48; font-weight:bold;">OVERBUDGET</span>' 
              : item.budgetUsedPercentage >= 75 
                ? '<span style="color:#d97706; font-weight:bold;">PERINGATAN</span>' 
                : '<span style="color:#059669; font-weight:bold;">AMAN</span>'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">2. Buku Kas Detail Transaksi (${transactions.length} Entri)</div>
  <table>
    <thead>
      <tr>
        <th>Tanggal</th>
        <th>Tipe</th>
        <th>Kategori</th>
        <th>Deskripsi Transaksi</th>
        <th class="text-right">Nominal</th>
        <th>Lampiran Bukti</th>
      </tr>
    </thead>
    <tbody>
      ${transactions.map(t => `
        <tr>
          <td>${t.date}</td>
          <td><strong>${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</strong></td>
          <td>${t.categoryName || '-'}</td>
          <td>${t.description}</td>
          <td class="text-right ${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
            ${t.type === 'income' ? '+' : '-'}${Storage.formatIDR(t.amount)}
          </td>
          <td>${t.receipt ? 'Ada (Terverifikasi)' : '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-col">
      <p>Disusun & Diverifikasi oleh:</p>
      <div class="sig-line"></div>
      <p><strong>Dimas Wicaksono</strong></p>
      <p class="sig-title">Finance & Accounting Lead</p>
    </div>
    <div class="sig-col">
      <p>Disetujui & Diketahui oleh:</p>
      <div class="sig-line"></div>
      <p><strong>Budi Hartono</strong></p>
      <p class="sig-title">Chief Executive Officer (CEO)</p>
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
