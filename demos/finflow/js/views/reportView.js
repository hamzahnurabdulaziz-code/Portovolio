/**
 * FinFlow - Financial Report View
 * Period-based accounting recap, formal financial statement preview, PDF printing & Excel export.
 */

import { State } from '../state.js';
import { Storage } from '../storage.js';
import { ExportService } from '../export.js';

export const ReportView = {
  render(container) {
    if (!container) return;

    const state = State.getState();
    const period = state.selectedPeriod || '2026-09';
    const metrics = State.getMonthlyMetrics(period);
    const breakdown = State.getExpenseBreakdown(period);
    const periodTransactions = state.transactions.filter(t => t.date.startsWith(period));

    const periodLabels = {
      '2026-09': 'September 2026',
      '2026-08': 'Agustus 2026',
      '2026-07': 'Juli 2026',
      '2026-06': 'Juni 2026'
    };

    const currentPeriodLabel = periodLabels[period] || period;

    const netClass = metrics.netIncome >= 0 ? 'text-income' : 'text-expense';
    const netSign = metrics.netIncome >= 0 ? '+' : '';
    const expenseRatio = metrics.totalIncome > 0 
      ? Math.round((metrics.totalExpense / metrics.totalIncome) * 100) 
      : 0;

    container.innerHTML = `
      <!-- View Header with Period Filter and Action Buttons -->
      <div class="view-header">
        <div>
          <h2 style="font-size: 1.45rem; font-weight: 800;">Laporan Keuangan & Rekapitulasi Kas</h2>
          <p style="font-size: 0.84rem; color: var(--text-secondary);">
            Rekap resmi transaksi per periode, audit anggaran, dan ekspor dokumen siap cetak
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <!-- Period Selector -->
          <select id="reportPeriodSelect" class="filter-select">
            <option value="2026-09" ${period === '2026-09' ? 'selected' : ''}>📅 September 2026 (Berjalan)</option>
            <option value="2026-08" ${period === '2026-08' ? 'selected' : ''}>📅 Agustus 2026</option>
            <option value="2026-07" ${period === '2026-07' ? 'selected' : ''}>📅 Juli 2026</option>
            <option value="2026-06" ${period === '2026-06' ? 'selected' : ''}>📅 Juni 2026</option>
          </select>

          <!-- Export Buttons -->
          <button class="btn btn-secondary" onclick="window.finflowExportCSV('${period}')">
            📊 Unduh Excel (CSV)
          </button>

          <button class="btn btn-primary" onclick="window.finflowExportPDF('${currentPeriodLabel}')">
            🖨️ Ekspor / Cetak PDF
          </button>
        </div>
      </div>

      <!-- Formal Financial Paper Preview -->
      <div class="report-paper">
        <!-- Kop Surat Dokumen Formal -->
        <div class="report-header-kop">
          <div>
            <div class="company-title">PT NUSANTARA DIGITAL KREASI</div>
            <div class="company-subtitle">Laporan Realisasi Arus Kas & Pertanggungjawaban Anggaran</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px;">
              Menara Palma Lt. 18, HR Rasuna Said, Jakarta Selatan | finance@nusantaradigital.id
            </div>
          </div>
          <div class="report-period-badge">
            <span class="badge badge-primary" style="font-size: 0.85rem; padding: 0.35rem 0.85rem;">
              PERIODE: ${currentPeriodLabel.toUpperCase()}
            </span>
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 6px;">
              Status: <strong>RESMI & TERVERIFIKASI</strong>
            </div>
          </div>
        </div>

        <!-- 4 Summary KPI Strip -->
        <div class="report-summary-strip">
          <div class="strip-item">
            <h4>Total Penerimaan (Inflow)</h4>
            <div class="value text-income">${Storage.formatIDR(metrics.totalIncome)}</div>
          </div>

          <div class="strip-item">
            <h4>Total Pengeluaran (Outflow)</h4>
            <div class="value text-expense">${Storage.formatIDR(metrics.totalExpense)}</div>
          </div>

          <div class="strip-item">
            <h4>Laba Bersih Operasional</h4>
            <div class="value ${netClass}">${netSign}${Storage.formatIDR(metrics.netIncome)}</div>
          </div>

          <div class="strip-item">
            <h4>Rasio Biaya vs Pemasukan</h4>
            <div class="value" style="color: ${expenseRatio > 80 ? 'var(--expense)' : 'var(--income)'};">
              ${expenseRatio}% <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">(Efisiensi)</span>
            </div>
          </div>
        </div>

        <!-- Table 1: Realisasi Pengeluaran per Departemen -->
        <h4 style="font-size: 1rem; font-weight: 800; margin: 1.75rem 0 0.85rem;">
          1. Rekapitulasi Realisasi Biaya & Utilisasi Pagu Anggaran
        </h4>
        <div class="table-responsive" style="margin-bottom: 2rem;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Departemen / Kategori Biaya</th>
                <th style="text-align: right;">Realisasi Pengeluaran</th>
                <th style="text-align: right;">Plafon Anggaran</th>
                <th style="text-align: right;">Persentase (%)</th>
                <th style="text-align: center;">Status Kepatuhan</th>
              </tr>
            </thead>
            <tbody>
              ${breakdown.items.length > 0 ? breakdown.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.icon} ${item.categoryName}</strong>
                  </td>
                  <td style="text-align: right; font-weight: 700;">
                    ${Storage.formatIDR(item.total)}
                  </td>
                  <td style="text-align: right; color: var(--text-secondary);">
                    ${item.limit > 0 ? Storage.formatIDR(item.limit) : 'Bebas'}
                  </td>
                  <td style="text-align: right; font-weight: 700;">
                    ${item.budgetUsedPercentage}%
                  </td>
                  <td style="text-align: center;">
                    ${item.budgetUsedPercentage >= 100 ? `
                      <span class="badge" style="background: var(--expense-light); color: var(--expense);">⚠️ Overbudget</span>
                    ` : item.budgetUsedPercentage >= 75 ? `
                      <span class="badge" style="background: var(--warning-light); color: var(--warning);">⚡ Peringatan</span>
                    ` : `
                      <span class="badge" style="background: var(--income-light); color: var(--income);">✓ Sesuai Pagu</span>
                    `}
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    Tidak ada catatan pengeluaran pada periode ini.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Table 2: Rincian Seluruh Transaksi Periode Ini -->
        <h4 style="font-size: 1rem; font-weight: 800; margin: 1.75rem 0 0.85rem;">
          2. Buku Besar Rincian Mutasi Kas (${periodTransactions.length} Catatan)
        </h4>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th style="text-align: right;">Nominal</th>
                <th>Bukti</th>
              </tr>
            </thead>
            <tbody>
              ${periodTransactions.map(t => `
                <tr>
                  <td style="white-space: nowrap; font-size: 0.84rem;">${t.date}</td>
                  <td>
                    <span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">
                      ${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td>${t.categoryName || '-'}</td>
                  <td style="max-width: 320px; font-size: 0.85rem;">${t.description}</td>
                  <td style="text-align: right; font-weight: 700;" class="${t.type === 'income' ? 'text-income' : 'text-expense'}">
                    ${t.type === 'income' ? '+' : '-'}${Storage.formatIDR(t.amount)}
                  </td>
                  <td>
                    ${t.receipt ? `
                      <button class="btn-receipt-view" onclick="window.finflowShowReceipt('${t.id}')">
                        Lihat Bukti
                      </button>
                    ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">-</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Event listener for period change
    const periodSelect = document.getElementById('reportPeriodSelect');
    if (periodSelect) {
      periodSelect.onchange = (e) => {
        State.setSelectedPeriod(e.target.value);
      };
    }
  }
};
