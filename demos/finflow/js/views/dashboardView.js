/**
 * FinFlow - Dashboard View
 * Renders KPI cards, Cash Flow trends, Donut breakdown, Budget Alerts, and Recent Activity.
 */

import { State } from '../state.js';
import { Storage } from '../storage.js';
import { Charts } from '../charts.js';

export const DashboardView = {
  render(container) {
    if (!container) return;

    const state = State.getState();
    const period = state.selectedPeriod || '2026-09';
    const metrics = State.getMonthlyMetrics(period);
    const breakdown = State.getExpenseBreakdown(period);
    const transactions = state.transactions.slice(0, 5); // 5 most recent

    // Check for budget alerts
    const overbudgetCats = breakdown.items.filter(i => i.limit > 0 && i.budgetUsedPercentage >= 85);

    const netSign = metrics.netIncome >= 0 ? '+' : '';
    const netClass = metrics.netIncome >= 0 ? 'text-income' : 'text-expense';
    const netBadgeClass = metrics.netIncome >= 0 ? 'up' : 'down';
    const netBadgeIcon = metrics.netIncome >= 0 ? '↗' : '↘';

    container.innerHTML = `
      <!-- Budget Alert Banner if any near or over limit -->
      ${overbudgetCats.length > 0 ? `
        <div class="alert-banner-wrap">
          ${overbudgetCats.map(cat => `
            <div class="alert-card ${cat.budgetUsedPercentage >= 100 ? '' : 'warning'} glass-card">
              <div class="alert-card-left">
                <div class="alert-badge-icon">
                  ${cat.budgetUsedPercentage >= 100 ? '⚠️' : '⚡'}
                </div>
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem;">
                    ${cat.budgetUsedPercentage >= 100 ? 'Peringatan Overbudget!' : 'Mendekati Batas Anggaran!'}
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">
                    Kategori <strong>${cat.icon} ${cat.categoryName}</strong> telah terpakai 
                    <strong>${Storage.formatIDR(cat.total)}</strong> (${cat.budgetUsedPercentage}%) 
                    dari limit <strong>${Storage.formatIDR(cat.limit)}</strong>.
                  </div>
                </div>
              </div>
              <button class="btn btn-sm btn-secondary" onclick="window.finflowNav('budget')">
                Kelola Anggaran →
              </button>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- 4 KPI Cards Grid -->
      <div class="kpi-grid">
        <!-- 1. Total Saldo Kas -->
        <div class="kpi-card saldo glass-card">
          <div class="kpi-header">
            <span class="kpi-title">Total Saldo Kas Riil</span>
            <div class="kpi-icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
          </div>
          <div class="kpi-value tabular-nums">${Storage.formatIDR(metrics.totalSaldo)}</div>
          <div class="kpi-footer">
            <span class="trend-badge up">● Kas Likuid</span>
            <span>Total akumulasi semua akun kas</span>
          </div>
        </div>

        <!-- 2. Total Pemasukan -->
        <div class="kpi-card income glass-card">
          <div class="kpi-header">
            <span class="kpi-title">Pemasukan (Bulan Ini)</span>
            <div class="kpi-icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value tabular-nums text-income">${Storage.formatIDR(metrics.totalIncome)}</div>
          <div class="kpi-footer">
            <span class="trend-badge up">↗ +14.2%</span>
            <span>Dibandingkan bulan lalu</span>
          </div>
        </div>

        <!-- 3. Total Pengeluaran -->
        <div class="kpi-card expense glass-card">
          <div class="kpi-header">
            <span class="kpi-title">Pengeluaran (Bulan Ini)</span>
            <div class="kpi-icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value tabular-nums text-expense">${Storage.formatIDR(metrics.totalExpense)}</div>
          <div class="kpi-footer">
            <span class="trend-badge down">↘ -4.8%</span>
            <span>Efisiensi anggaran optimal</span>
          </div>
        </div>

        <!-- 4. Net Income (Laba/Rugi Bersih) -->
        <div class="kpi-card net glass-card">
          <div class="kpi-header">
            <span class="kpi-title">Net Income (Laba Bersih)</span>
            <div class="kpi-icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-value tabular-nums ${netClass}">
            ${netSign}${Storage.formatIDR(metrics.netIncome)}
          </div>
          <div class="kpi-footer">
            <span class="trend-badge ${netBadgeClass}">${netBadgeIcon} Surplus Kas</span>
            <span>Margin Operasional Sehat</span>
          </div>
        </div>
      </div>

      <!-- Charts Row: Cash Flow Trends & Donut Breakdown -->
      <div class="charts-grid">
        <!-- Cash Flow Bar/Area Chart -->
        <div class="chart-card glass-card">
          <div class="chart-card-header">
            <div class="chart-title-wrap">
              <h3>Tren Arus Kas (Cash Flow)</h3>
              <p>Perbandingan Pemasukan (Hijau) vs Pengeluaran (Merah) per bulan</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="badge badge-category" style="cursor: pointer;" id="chart-filter-lbl">
                6 Bulan Terakhir
              </span>
            </div>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="cashflowCanvas"></canvas>
          </div>
        </div>

        <!-- Expense Category Donut Breakdown -->
        <div class="chart-card glass-card">
          <div class="chart-card-header">
            <div class="chart-title-wrap">
              <h3>Distribusi Pengeluaran</h3>
              <p>Persentase pengeluaran berdasarkan kategori</p>
            </div>
            <span class="badge badge-category">Bulan Ini</span>
          </div>
          <div class="chart-canvas-wrap" style="height: 180px;">
            <canvas id="donutCanvas"></canvas>
          </div>
          <div id="donutLegend" class="donut-legend"></div>
        </div>
      </div>

      <!-- Bottom Row: Recent Transactions & Budget Quick Health -->
      <div class="dashboard-bottom-grid">
        <!-- Recent Transactions -->
        <div class="glass-card" style="padding: 1.5rem;">
          <div class="flex-between" style="margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700;">Transaksi Terbaru</h3>
              <p style="font-size: 0.78rem; color: var(--text-secondary);">Aktivitas mutasi pencatatan kas terkini</p>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="window.finflowNav('transactions')">
              Lihat Semua →
            </button>
          </div>

          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Kategori</th>
                  <th>Deskripsi</th>
                  <th style="text-align: right;">Nominal</th>
                  <th>Bukti</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(t => `
                  <tr>
                    <td style="white-space: nowrap; font-size: 0.8rem;">${t.date}</td>
                    <td>
                      <span class="badge badge-category">${t.categoryName || '-'}</span>
                    </td>
                    <td style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.84rem;">
                      ${t.description}
                    </td>
                    <td style="text-align: right; font-weight: 700;" class="${t.type === 'income' ? 'text-income' : 'text-expense'}">
                      ${t.type === 'income' ? '+' : '-'}${Storage.formatIDR(t.amount)}
                    </td>
                    <td>
                      ${t.receipt ? `
                        <button class="btn-receipt-view" onclick="window.finflowShowReceipt('${t.id}')">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                          </svg>
                          Lihat
                        </button>
                      ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">-</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Budget Quick Health Monitor -->
        <div class="glass-card" style="padding: 1.5rem;">
          <div class="flex-between" style="margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700;">Status Batas Anggaran</h3>
              <p style="font-size: 0.78rem; color: var(--text-secondary);">Monitoring real-time penggunaan budget</p>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="window.finflowNav('budget')">
              Detail →
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${breakdown.items.slice(0, 4).map(item => {
              const pct = item.budgetUsedPercentage || 0;
              let progClass = 'progress-safe';
              let badgeColor = 'var(--income)';
              let badgeText = 'Aman';

              if (pct >= 100) {
                progClass = 'progress-danger';
                badgeColor = 'var(--expense)';
                badgeText = 'Overbudget';
              } else if (pct >= 75) {
                progClass = 'progress-warning';
                badgeColor = 'var(--warning)';
                badgeText = 'Peringatan';
              }

              return `
                <div style="background: var(--bg-surface-elevated); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div class="flex-between" style="font-size: 0.85rem; font-weight: 700;">
                    <span>${item.icon} ${item.categoryName}</span>
                    <span style="color: ${badgeColor}; font-size: 0.78rem;">${badgeText} (${pct}%)</span>
                  </div>
                  <div class="budget-progress-wrap">
                    <div class="budget-progress-bar ${progClass}" style="width: ${Math.min(pct, 100)}%;"></div>
                  </div>
                  <div class="flex-between" style="font-size: 0.75rem; color: var(--text-muted);">
                    <span>Terpakai: ${Storage.formatIDR(item.total)}</span>
                    <span>Limit: ${item.limit > 0 ? Storage.formatIDR(item.limit) : 'Bebas'}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Render Canvas Charts
    setTimeout(() => {
      const cashflowCanvas = document.getElementById('cashflowCanvas');
      if (cashflowCanvas) {
        Charts.renderCashflowChart(cashflowCanvas, state.transactions);
      }

      const donutCanvas = document.getElementById('donutCanvas');
      const donutLegend = document.getElementById('donutLegend');
      if (donutCanvas && donutLegend) {
        Charts.renderExpenseDonut(donutCanvas, donutLegend, breakdown);
      }
    }, 50);
  }
};
