/**
 * FinFlow - Budget & Category Management View
 * Custom category definitions, monthly budget limits, and dynamic warning threshold indicators.
 */

import { State } from '../state.js';
import { Storage } from '../storage.js';

export const BudgetView = {
  render(container) {
    if (!container) return;

    const state = State.getState();
    const isCeo = State.isCeo();
    const period = state.selectedPeriod || '2026-09';
    const breakdown = State.getExpenseBreakdown(period);
    const expenseCategories = state.categories.filter(c => c.type === 'expense');

    // Calculate total budget & total spent across all budgetable categories
    let totalBudget = 0;
    let totalSpent = 0;

    expenseCategories.forEach(cat => {
      totalBudget += Number(cat.limit || 0);
      const spentItem = breakdown.items.find(i => i.categoryId === cat.id);
      if (spentItem) {
        totalSpent += spentItem.total;
      }
    });

    const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const remainingBudget = Math.max(0, totalBudget - totalSpent);

    container.innerHTML = `
      <!-- View Header -->
      <div class="view-header">
        <div>
          <h2 style="font-size: 1.45rem; font-weight: 800;">Manajemen Kategori & Anggaran (Budgeting)</h2>
          <p style="font-size: 0.84rem; color: var(--text-secondary);">
            Kontrol batas pengeluaran operasional per departemen dan peringatan otomatis
          </p>
        </div>

        ${!isCeo ? `
          <button class="btn btn-primary" onclick="window.finflowOpenCategoryModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            + Buat Kategori / Set Budget Baru
          </button>
        ` : `
          <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-surface-elevated); padding: 0.4rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 0.78rem; color: var(--warning);">
            <span>🔒 Mode Read-Only (CEO / Management)</span>
          </div>
        `}
      </div>

      <!-- Budget Summary Banner Card -->
      <div class="glass-card budget-summary-banner">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Total Plafon Anggaran Bulanan
          </div>
          <div style="font-size: 1.85rem; font-weight: 800; color: var(--text-primary); margin-top: 0.25rem;">
            ${Storage.formatIDR(totalBudget)}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.25rem;">
            Gabungan seluruh alokasi departemen
          </div>
        </div>

        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Realisasi Pengeluaran Berjalan
          </div>
          <div style="font-size: 1.85rem; font-weight: 800; color: var(--expense); margin-top: 0.25rem;">
            ${Storage.formatIDR(totalSpent)}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.25rem;">
            Terpakai <strong>${overallPct}%</strong> dari total pagu
          </div>
        </div>

        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Sisa Saldo Anggaran Tersedia
          </div>
          <div style="font-size: 1.85rem; font-weight: 800; color: var(--income); margin-top: 0.25rem;">
            ${Storage.formatIDR(remainingBudget)}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.25rem;">
            Kondisi kas korporat terjaga aman
          </div>
        </div>

        <!-- Overall Budget Mini Gauge -->
        <div style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div class="flex-between" style="font-size: 0.82rem; font-weight: 700;">
            <span>Kesehatan Anggaran</span>
            <span style="color: ${overallPct >= 90 ? 'var(--expense)' : overallPct >= 70 ? 'var(--warning)' : 'var(--income)'};">
              ${overallPct >= 90 ? 'Kritis' : overallPct >= 70 ? 'Waspada' : 'Stabil'} (${overallPct}%)
            </span>
          </div>
          <div class="budget-progress-wrap">
            <div 
              class="budget-progress-bar ${overallPct >= 90 ? 'progress-danger' : overallPct >= 70 ? 'progress-warning' : 'progress-safe'}" 
              style="width: ${Math.min(overallPct, 100)}%;"
            ></div>
          </div>
        </div>
      </div>

      <!-- Categories & Budget Cards Grid -->
      <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1.15rem;">
        Daftar Kategori & Batas Anggaran Pengeluaran (${expenseCategories.length} Kategori)
      </h3>

      <div class="budget-cards-grid">
        ${expenseCategories.map(cat => {
          const spentItem = breakdown.items.find(i => i.categoryId === cat.id);
          const spent = spentItem ? spentItem.total : 0;
          const limit = cat.limit || 0;
          const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

          let progClass = 'progress-safe';
          let badgeStatus = { text: 'Aman (< 70%)', color: 'var(--income)', bg: 'var(--income-light)' };

          if (pct >= 100) {
            progClass = 'progress-danger';
            badgeStatus = { text: 'Overbudget (≥ 100%)', color: 'var(--expense)', bg: 'var(--expense-light)' };
          } else if (pct >= 75) {
            progClass = 'progress-warning';
            badgeStatus = { text: 'Mendekati Limit (75-99%)', color: 'var(--warning)', bg: 'var(--warning-light)' };
          }

          return `
            <div class="glass-card category-budget-card" style="border-left: 4px solid ${cat.color || 'var(--primary)'};">
              <div class="cat-header">
                <div class="cat-name-icon">
                  <div class="cat-icon-circle" style="background: ${cat.color}22; color: ${cat.color};">
                    ${cat.icon || '📁'}
                  </div>
                  <div>
                    <h4 style="font-size: 0.98rem; font-weight: 700; margin-bottom: 2px;">${cat.name}</h4>
                    <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">
                      Alokasi Bulanan
                    </span>
                  </div>
                </div>

                <span class="badge" style="background: ${badgeStatus.bg}; color: ${badgeStatus.color}; font-size: 0.72rem;">
                  ${badgeStatus.text}
                </span>
              </div>

              <div class="cat-figures">
                <div>
                  <div style="font-size: 0.74rem; color: var(--text-muted);">Realisasi Terpakai:</div>
                  <div class="cat-used ${pct >= 100 ? 'text-expense' : ''}">${Storage.formatIDR(spent)}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.74rem; color: var(--text-muted);">Batas Maksimal:</div>
                  <div class="cat-limit" style="font-weight: 700; font-size: 0.95rem;">${Storage.formatIDR(limit)}</div>
                </div>
              </div>

              <div class="budget-progress-wrap" style="height: 10px; margin-top: 0.85rem;">
                <div class="budget-progress-bar ${progClass}" style="width: ${Math.min(pct, 100)}%;"></div>
              </div>

              <div class="flex-between" style="font-size: 0.75rem; margin-top: 0.35rem; color: var(--text-muted);">
                <span>Terpakai <strong>${pct}%</strong></span>
                <span>Sisa: <strong>${Storage.formatIDR(Math.max(0, limit - spent))}</strong></span>
              </div>

              ${!isCeo ? `
                <div style="margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end;">
                  <button class="btn btn-sm btn-secondary" onclick="window.finflowEditCategoryBudget('${cat.id}')">
                    ✏️ Atur Batas Anggaran
                  </button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
