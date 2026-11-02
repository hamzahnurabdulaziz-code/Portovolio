/**
 * FinFlow - Transactions Management View
 * Rich data table, multi-parameter filter toolbar, receipt previews, and role-based action buttons.
 */

import { State } from '../state.js';
import { Storage } from '../storage.js';

export const TransactionView = {
  render(container) {
    if (!container) return;

    const state = State.getState();
    const isCeo = State.isCeo();
    const categories = state.categories;
    const filteredTxs = State.getFilteredTransactions();
    const filters = state.filters;

    container.innerHTML = `
      <!-- View Header with Title and Action -->
      <div class="view-header">
        <div>
          <h2 style="font-size: 1.45rem; font-weight: 800;">Riwayat & Manajemen Transaksi</h2>
          <p style="font-size: 0.84rem; color: var(--text-secondary);">
            Catatan mutasi kas masuk dan keluar beserta bukti transaksi
          </p>
        </div>

        ${!isCeo ? `
          <button class="btn btn-primary" onclick="window.finflowOpenAddModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            + Tambah Transaksi Baru
          </button>
        ` : `
          <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-surface-elevated); padding: 0.4rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 0.78rem; color: var(--warning);">
            <span>🔒 Mode Read-Only (CEO / Management)</span>
          </div>
        `}
      </div>

      <!-- Multi-parameter Filter Toolbar -->
      <div class="filter-toolbar">
        <!-- Live Search Input -->
        <div class="input-with-icon filter-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            id="txSearchInput" 
            class="form-control" 
            placeholder="Cari deskripsi, kategori, atau nominal..."
            value="${filters.search || ''}"
          />
        </div>

        <!-- Filter Jenis Transaksi -->
        <select id="txTypeFilter" class="filter-select">
          <option value="all" ${filters.type === 'all' ? 'selected' : ''}>Semua Tipe (In/Out)</option>
          <option value="income" ${filters.type === 'income' ? 'selected' : ''}>🟢 Pemasukan Saja</option>
          <option value="expense" ${filters.type === 'expense' ? 'selected' : ''}>🔴 Pengeluaran Saja</option>
        </select>

        <!-- Filter Kategori -->
        <select id="txCategoryFilter" class="filter-select">
          <option value="all" ${filters.category === 'all' ? 'selected' : ''}>Semua Kategori</option>
          ${categories.map(c => `
            <option value="${c.id}" ${filters.category === c.id ? 'selected' : ''}>
              ${c.icon} ${c.name}
            </option>
          `).join('')}
        </select>

        <!-- Date Range Filter -->
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <input 
            type="date" 
            id="txStartDate" 
            class="filter-date-input" 
            title="Tanggal Awal"
            value="${filters.startDate || ''}"
          />
          <span style="color: var(--text-muted); font-size: 0.8rem;">s/d</span>
          <input 
            type="date" 
            id="txEndDate" 
            class="filter-date-input" 
            title="Tanggal Akhir"
            value="${filters.endDate || ''}"
          />
        </div>

        <!-- Reset Button -->
        <button id="txResetFilters" class="btn btn-sm btn-outline" title="Reset semua filter">
          Reset
        </button>
      </div>

      <!-- Transaction Data Table -->
      <div class="table-responsive">
        ${filteredTxs.length > 0 ? `
          <table class="custom-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th>Deskripsi Transaksi</th>
                <th style="text-align: right;">Nominal (IDR)</th>
                <th>Bukti Transaksi</th>
                ${!isCeo ? '<th style="text-align: center;">Aksi</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredTxs.map(t => `
                <tr>
                  <td style="white-space: nowrap; font-size: 0.84rem;">
                    <div style="font-weight: 700;">${t.date}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${t.id}</div>
                  </td>
                  <td>
                    <span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">
                      ${t.type === 'income' ? '🟢 Pemasukan' : '🔴 Pengeluaran'}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-category">${t.categoryName || '-'}</span>
                  </td>
                  <td style="max-width: 280px; font-size: 0.86rem; color: var(--text-primary);">
                    ${t.description || '-'}
                  </td>
                  <td style="text-align: right; font-weight: 800; font-size: 0.95rem;" class="${t.type === 'income' ? 'text-income' : 'text-expense'}">
                    ${t.type === 'income' ? '+' : '-'}${Storage.formatIDR(t.amount)}
                  </td>
                  <td>
                    ${t.receipt ? `
                      <button class="btn-receipt-view" onclick="window.finflowShowReceipt('${t.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        Lihat Foto
                      </button>
                    ` : `
                      <span style="color: var(--text-muted); font-size: 0.76rem;">Tidak ada</span>
                    `}
                  </td>
                  ${!isCeo ? `
                    <td style="text-align: center; white-space: nowrap;">
                      <div style="display: inline-flex; gap: 0.35rem;">
                        <button class="btn btn-sm btn-secondary btn-icon-only" title="Edit Transaksi" onclick="window.finflowOpenEditModal('${t.id}')">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button class="btn btn-sm btn-danger btn-icon-only" title="Hapus Transaksi" onclick="window.finflowDeleteTx('${t.id}')">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Table Footer Pagination/Count -->
          <div class="table-footer-pagination">
            <span>Menampilkan <strong>${filteredTxs.length}</strong> dari <strong>${state.transactions.length}</strong> total transaksi</span>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-sm btn-secondary" onclick="window.finflowExportCSV()">
                📥 Ekspor Hasil Filter ke CSV
              </button>
            </div>
          </div>
        ` : `
          <!-- Empty State -->
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3>Tidak Ada Transaksi yang Ditemukan</h3>
            <p>Cobalah untuk mengubah kata kunci pencarian, jenis transaksi, atau rentang tanggal filter.</p>
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('txResetFilters').click()">
              Reset Semua Filter
            </button>
          </div>
        `}
      </div>
    `;

    // Attach filter event listeners
    const searchInput = document.getElementById('txSearchInput');
    const typeFilter = document.getElementById('txTypeFilter');
    const catFilter = document.getElementById('txCategoryFilter');
    const startDate = document.getElementById('txStartDate');
    const endDate = document.getElementById('txEndDate');
    const resetBtn = document.getElementById('txResetFilters');

    if (searchInput) {
      searchInput.oninput = (e) => {
        State.setFilters({ search: e.target.value });
      };
    }

    if (typeFilter) {
      typeFilter.onchange = (e) => {
        State.setFilters({ type: e.target.value });
      };
    }

    if (catFilter) {
      catFilter.onchange = (e) => {
        State.setFilters({ category: e.target.value });
      };
    }

    if (startDate) {
      startDate.onchange = (e) => {
        State.setFilters({ startDate: e.target.value });
      };
    }

    if (endDate) {
      endDate.onchange = (e) => {
        State.setFilters({ endDate: e.target.value });
      };
    }

    if (resetBtn) {
      resetBtn.onclick = () => {
        State.setFilters({
          search: '',
          type: 'all',
          category: 'all',
          startDate: '',
          endDate: ''
        });
      };
    }
  }
};
