/**
 * FinFlow - Main Application Controller & Orchestration
 */

import { Storage } from './storage.js';
import { State } from './state.js';
import { Navigation } from './navigation.js';
import { ExportService } from './export.js';

import { DashboardView } from './views/dashboardView.js';
import { TransactionView } from './views/transactionView.js';
import { BudgetView } from './views/budgetView.js';
import { ReportView } from './views/reportView.js';

class FinFlowApp {
  constructor() {
    this.uploadedReceiptBase64 = null;
    this.editingTxId = null;
    this.editingCatId = null;
  }

  init() {
    // 1. Initialize State & Data
    State.init();
    
    // 2. Initialize Navigation
    Navigation.init();

    // 3. Setup Theme
    this.applyTheme(State.getState().theme);

    // 4. Setup Global Event Listeners & Modals
    this.setupAuthentication();
    this.setupRoleSwitcher();
    this.setupThemeToggle();
    this.setupTransactionModal();
    this.setupCategoryModal();
    this.setupReceiptLightbox();
    this.setupGlobalExposures();

    // 5. Subscribe to State Changes to re-render views
    State.subscribe('view:change', (view) => this.renderCurrentView(view));
    State.subscribe('transactions:update', () => this.renderCurrentView(State.getState().currentView));
    State.subscribe('categories:update', () => this.renderCurrentView(State.getState().currentView));
    State.subscribe('filter:change', () => {
      if (State.getState().currentView === 'transactions') {
        TransactionView.render(document.getElementById('viewContainer'));
      }
    });
    State.subscribe('period:change', () => this.renderCurrentView(State.getState().currentView));
    State.subscribe('user:change', (user) => {
      this.updateUserUI(user);
      this.renderCurrentView(State.getState().currentView);
    });

    // 6. Initial render
    this.updateUserUI(State.getState().user);
    this.renderCurrentView('dashboard');

    console.log('FinFlow Financial Suite loaded successfully.');
  }

  // Render the active view
  renderCurrentView(viewName) {
    const container = document.getElementById('viewContainer');
    if (!container) return;

    switch (viewName) {
      case 'dashboard':
        DashboardView.render(container);
        break;
      case 'transactions':
        TransactionView.render(container);
        break;
      case 'budget':
        BudgetView.render(container);
        break;
      case 'reports':
        ReportView.render(container);
        break;
      default:
        DashboardView.render(container);
    }
  }

  // User UI & Role restrictions
  updateUserUI(user) {
    if (!user) return;

    const userNameEl = document.getElementById('sidebarUserName');
    const userRoleEl = document.getElementById('sidebarUserRole');
    const userAvatarEl = document.getElementById('sidebarUserAvatar');
    const btnQuickAdd = document.getElementById('btnQuickAdd');

    if (userNameEl) userNameEl.textContent = user.name;
    if (userAvatarEl) userAvatarEl.textContent = user.avatarLetter || 'U';
    
    if (userRoleEl) {
      userRoleEl.textContent = user.roleLabel;
      userRoleEl.className = 'user-role-badge ' + (user.role === 'ceo' ? 'role-ceo' : 'role-admin');
    }

    // Role switcher active state
    const staffBtn = document.getElementById('roleBtnStaff');
    const ceoBtn = document.getElementById('roleBtnCeo');
    if (staffBtn && ceoBtn) {
      if (user.role === 'ceo') {
        ceoBtn.classList.add('active', 'ceo-mode');
        staffBtn.classList.remove('active');
      } else {
        staffBtn.classList.add('active');
        ceoBtn.classList.remove('active', 'ceo-mode');
      }
    }

    // Disable or style CTA button for CEO
    if (btnQuickAdd) {
      if (user.role === 'ceo') {
        btnQuickAdd.classList.add('disabled-ceo');
        btnQuickAdd.title = 'Hanya Finance Staff yang dapat menambah transaksi';
      } else {
        btnQuickAdd.classList.remove('disabled-ceo');
        btnQuickAdd.title = 'Tambah Transaksi Baru';
      }
    }
  }

  // Authentication & Demo Login
  setupAuthentication() {
    const loginOverlay = document.getElementById('loginOverlay');
    const loginForm = document.getElementById('loginForm');
    const btnDemoStaff = document.getElementById('btnDemoStaff');
    const btnDemoCeo = document.getElementById('btnDemoCeo');
    const btnLogout = document.getElementById('btnLogout');

    if (btnDemoStaff) {
      btnDemoStaff.onclick = () => {
        State.setUserRole('STAFF');
        loginOverlay.classList.add('hidden');
        this.showToast('Selamat datang, Dimas Wicaksono (Finance Staff)', 'success');
      };
    }

    if (btnDemoCeo) {
      btnDemoCeo.onclick = () => {
        State.setUserRole('CEO');
        loginOverlay.classList.add('hidden');
        this.showToast('Selamat datang, Budi Hartono (CEO / Management)', 'info');
      };
    }

    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();
        const roleSelect = document.getElementById('loginRoleSelect');
        const roleKey = roleSelect ? roleSelect.value : 'STAFF';
        State.setUserRole(roleKey);
        loginOverlay.classList.add('hidden');
        this.showToast('Berhasil masuk ke sistem FinFlow.', 'success');
      };
    }

    if (btnLogout) {
      btnLogout.onclick = () => {
        loginOverlay.classList.remove('hidden');
        this.showToast('Anda telah keluar dari akun.', 'info');
      };
    }
  }

  // Topbar Role Switcher
  setupRoleSwitcher() {
    const staffBtn = document.getElementById('roleBtnStaff');
    const ceoBtn = document.getElementById('roleBtnCeo');

    if (staffBtn) {
      staffBtn.onclick = () => {
        State.setUserRole('STAFF');
        this.showToast('Beralih ke mode Finance Staff (Full Access)', 'success');
      };
    }

    if (ceoBtn) {
      ceoBtn.onclick = () => {
        State.setUserRole('CEO');
        this.showToast('Beralih ke mode CEO (Read-only Dashboard & Reports)', 'warning');
      };
    }
  }

  // Theme Toggle (Dark / Light)
  setupThemeToggle() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.onclick = () => {
        State.toggleTheme();
      };
    }

    State.subscribe('theme:change', (theme) => {
      this.applyTheme(theme);
    });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    // Re-render chart if active on dashboard
    if (State.getState().currentView === 'dashboard') {
      this.renderCurrentView('dashboard');
    }
  }

  // Quick Add / Edit Transaction Modal
  setupTransactionModal() {
    const modal = document.getElementById('txModal');
    const form = document.getElementById('txForm');
    const closeBtn = document.getElementById('closeTxModal');
    const cancelBtn = document.getElementById('cancelTxModal');
    const btnQuickAdd = document.getElementById('btnQuickAdd');
    const typeIncomeBtn = document.getElementById('btnTypeIncome');
    const typeExpenseBtn = document.getElementById('btnTypeExpense');
    const amountInput = document.getElementById('txAmountInput');
    const dropzone = document.getElementById('receiptDropzone');
    const fileInput = document.getElementById('receiptFileInput');
    const previewWrap = document.getElementById('receiptPreviewWrap');
    const previewImg = document.getElementById('receiptPreviewImg');
    const removeImgBtn = document.getElementById('removeReceiptBtn');

    // Open Add Modal
    if (btnQuickAdd) {
      btnQuickAdd.onclick = () => {
        if (State.isCeo()) {
          this.showToast('Akses dibatasi: Hanya Finance Staff yang dapat menambah transaksi.', 'warning');
          return;
        }
        this.openTransactionModal();
      };
    }

    // Close Modal
    const closeModal = () => {
      modal.classList.remove('open');
      this.resetTxForm();
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    // Segmented Type Selector (Income vs Expense)
    if (typeIncomeBtn && typeExpenseBtn) {
      typeIncomeBtn.onclick = () => {
        typeIncomeBtn.className = 'segment-btn active-income';
        typeExpenseBtn.className = 'segment-btn';
        document.getElementById('txTypeInput').value = 'income';
        this.populateCategoryOptions('income');
      };

      typeExpenseBtn.onclick = () => {
        typeExpenseBtn.className = 'segment-btn active-expense';
        typeIncomeBtn.className = 'segment-btn';
        document.getElementById('txTypeInput').value = 'expense';
        this.populateCategoryOptions('expense');
      };
    }

    // Currency Live Formatting
    if (amountInput) {
      amountInput.oninput = (e) => {
        // Strip non-digit characters
        const raw = e.target.value.replace(/\D/g, '');
        if (raw) {
          e.target.value = Storage.formatNumber(raw);
        } else {
          e.target.value = '';
        }
      };
    }

    // Receipt Drag and Drop & File Upload
    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();

      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      };

      dropzone.ondragleave = () => {
        dropzone.classList.remove('dragover');
      };

      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleReceiptFile(e.dataTransfer.files[0]);
        }
      };

      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleReceiptFile(e.target.files[0]);
        }
      };
    }

    if (removeImgBtn) {
      removeImgBtn.onclick = (e) => {
        e.stopPropagation();
        this.uploadedReceiptBase64 = null;
        fileInput.value = '';
        previewWrap.classList.add('hidden');
        dropzone.classList.remove('hidden');
      };
    }

    // Form Submit
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const rawAmount = amountInput.value.replace(/\D/g, '');
        const amount = Number(rawAmount);

        if (!amount || amount <= 0) {
          this.showToast('Nominal transaksi harus lebih besar dari 0.', 'error');
          return;
        }

        const type = document.getElementById('txTypeInput').value;
        const categoryId = document.getElementById('txCategoryInput').value;
        const catObj = State.getState().categories.find(c => c.id === categoryId);
        const date = document.getElementById('txDateInput').value;
        const description = document.getElementById('txDescInput').value.trim();

        const txPayload = {
          id: this.editingTxId || undefined,
          date,
          type,
          categoryId,
          categoryName: catObj ? catObj.name : 'Lainnya',
          amount,
          description: description || 'Tidak ada deskripsi',
          receipt: this.uploadedReceiptBase64,
          createdBy: State.getState().user.name
        };

        State.addOrUpdateTransaction(txPayload);
        closeModal();

        // Check if this expense pushed a category overbudget
        if (type === 'expense') {
          const breakdown = State.getExpenseBreakdown(date.substring(0, 7));
          const catStat = breakdown.items.find(i => i.categoryId === categoryId);
          if (catStat && catStat.limit > 0 && catStat.budgetUsedPercentage >= 100) {
            this.showToast(`Peringatan: Kategori ${catStat.categoryName} kini OVERBUDGET (${catStat.budgetUsedPercentage}%)!`, 'warning', 6000);
          } else {
            this.showToast('Transaksi berhasil disimpan.', 'success');
          }
        } else {
          this.showToast('Transaksi pemasukan berhasil dicatat.', 'success');
        }
      };
    }
  }

  handleReceiptFile(file) {
    if (!file.type.startsWith('image/')) {
      this.showToast('Mohon unggah file berupa foto/gambar (JPG, PNG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedReceiptBase64 = e.target.result;
      const previewWrap = document.getElementById('receiptPreviewWrap');
      const previewImg = document.getElementById('receiptPreviewImg');
      const previewName = document.getElementById('receiptFileName');
      const dropzone = document.getElementById('receiptDropzone');

      previewImg.src = this.uploadedReceiptBase64;
      previewName.textContent = file.name;
      previewWrap.classList.remove('hidden');
      dropzone.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  openTransactionModal(txToEdit = null) {
    const modal = document.getElementById('txModal');
    const modalTitle = document.getElementById('txModalTitle');
    const dateInput = document.getElementById('txDateInput');
    const amountInput = document.getElementById('txAmountInput');
    const descInput = document.getElementById('txDescInput');
    const typeIncomeBtn = document.getElementById('btnTypeIncome');
    const typeExpenseBtn = document.getElementById('btnTypeExpense');

    this.editingTxId = txToEdit ? txToEdit.id : null;

    if (txToEdit) {
      modalTitle.textContent = 'Edit Transaksi Kas';
      dateInput.value = txToEdit.date;
      amountInput.value = Storage.formatNumber(txToEdit.amount);
      descInput.value = txToEdit.description;
      document.getElementById('txTypeInput').value = txToEdit.type;

      if (txToEdit.type === 'income') {
        typeIncomeBtn.className = 'segment-btn active-income';
        typeExpenseBtn.className = 'segment-btn';
      } else {
        typeExpenseBtn.className = 'segment-btn active-expense';
        typeIncomeBtn.className = 'segment-btn';
      }
      this.populateCategoryOptions(txToEdit.type, txToEdit.categoryId);

      if (txToEdit.receipt) {
        this.uploadedReceiptBase64 = txToEdit.receipt;
        document.getElementById('receiptPreviewImg').src = txToEdit.receipt;
        document.getElementById('receiptFileName').textContent = 'Nota Bukti Transaksi';
        document.getElementById('receiptPreviewWrap').classList.remove('hidden');
        document.getElementById('receiptDropzone').classList.add('hidden');
      } else {
        this.resetReceiptPreview();
      }
    } else {
      modalTitle.textContent = 'Catat Transaksi Baru';
      dateInput.value = new Date().toISOString().split('T')[0];
      amountInput.value = '';
      descInput.value = '';
      document.getElementById('txTypeInput').value = 'expense';
      typeExpenseBtn.className = 'segment-btn active-expense';
      typeIncomeBtn.className = 'segment-btn';
      this.populateCategoryOptions('expense');
      this.resetReceiptPreview();
    }

    modal.classList.add('open');
  }

  resetReceiptPreview() {
    this.uploadedReceiptBase64 = null;
    document.getElementById('receiptPreviewWrap').classList.add('hidden');
    document.getElementById('receiptDropzone').classList.remove('hidden');
    document.getElementById('receiptFileInput').value = '';
  }

  resetTxForm() {
    this.editingTxId = null;
    this.resetReceiptPreview();
    document.getElementById('txForm').reset();
  }

  populateCategoryOptions(type = 'expense', selectedId = null) {
    const catSelect = document.getElementById('txCategoryInput');
    if (!catSelect) return;

    const filtered = State.getState().categories.filter(c => c.type === type);
    catSelect.innerHTML = filtered.map(c => `
      <option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>
        ${c.icon} ${c.name} ${c.limit > 0 ? `(Limit: ${Storage.formatIDR(c.limit)})` : ''}
      </option>
    `).join('');
  }

  // Category & Budget Limit Modal
  setupCategoryModal() {
    const modal = document.getElementById('catModal');
    const form = document.getElementById('catForm');
    const closeBtn = document.getElementById('closeCatModal');
    const cancelBtn = document.getElementById('cancelCatModal');
    const limitInput = document.getElementById('catLimitInput');

    const closeModal = () => {
      modal.classList.remove('open');
      this.editingCatId = null;
      form.reset();
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    if (limitInput) {
      limitInput.oninput = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        e.target.value = raw ? Storage.formatNumber(raw) : '';
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('catNameInput').value.trim();
        const icon = document.getElementById('catIconInput').value.trim() || '📁';
        const color = document.getElementById('catColorInput').value;
        const rawLimit = limitInput.value.replace(/\D/g, '');
        const limit = Number(rawLimit) || 0;

        const payload = {
          id: this.editingCatId || undefined,
          name,
          type: 'expense',
          icon,
          color,
          limit
        };

        State.addOrUpdateCategory(payload);
        closeModal();
        this.showToast(`Kategori & pagu anggaran "${name}" berhasil disimpan.`, 'success');
      };
    }
  }

  openCategoryModal(catToEdit = null) {
    const modal = document.getElementById('catModal');
    const title = document.getElementById('catModalTitle');
    const nameInput = document.getElementById('catNameInput');
    const iconInput = document.getElementById('catIconInput');
    const colorInput = document.getElementById('catColorInput');
    const limitInput = document.getElementById('catLimitInput');

    this.editingCatId = catToEdit ? catToEdit.id : null;

    if (catToEdit) {
      title.textContent = 'Atur Batas Anggaran Kategori';
      nameInput.value = catToEdit.name;
      iconInput.value = catToEdit.icon || '📁';
      colorInput.value = catToEdit.color || '#4f46e5';
      limitInput.value = catToEdit.limit ? Storage.formatNumber(catToEdit.limit) : '';
    } else {
      title.textContent = 'Tambah Kategori & Pagu Anggaran';
      nameInput.value = '';
      iconInput.value = '💡';
      colorInput.value = '#06b6d4';
      limitInput.value = '';
    }

    modal.classList.add('open');
  }

  // Receipt Lightbox
  setupReceiptLightbox() {
    const modal = document.getElementById('lightboxModal');
    const closeBtn = document.getElementById('closeLightboxBtn');
    const imgEl = document.getElementById('lightboxImg');

    const closeModal = () => modal.classList.remove('open');
    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    window.finflowShowReceipt = (txId) => {
      const tx = State.getState().transactions.find(t => t.id === txId);
      if (tx && tx.receipt) {
        imgEl.src = tx.receipt;
        document.getElementById('lightboxTitle').textContent = `Bukti Transaksi - ${tx.description} (${Storage.formatIDR(tx.amount)})`;
        modal.classList.add('open');
      } else {
        this.showToast('Transaksi ini tidak memiliki lampiran bukti.', 'info');
      }
    };
  }

  // Toast Notification System
  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${icons[type] || 'ℹ️'}</span>
      <div style="flex: 1;">${message}</div>
      <button style="background:none; border:none; color:inherit; cursor:pointer; font-size:1rem;" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  // Global functions exposed to inline HTML onclick handlers
  setupGlobalExposures() {
    window.finflowOpenAddModal = () => this.openTransactionModal();
    window.finflowOpenCategoryModal = () => this.openCategoryModal();

    window.finflowOpenEditModal = (id) => {
      const tx = State.getState().transactions.find(t => t.id === id);
      if (tx) this.openTransactionModal(tx);
    };

    window.finflowEditCategoryBudget = (catId) => {
      const cat = State.getState().categories.find(c => c.id === catId);
      if (cat) this.openCategoryModal(cat);
    };

    window.finflowDeleteTx = (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?')) {
        State.deleteTransaction(id);
        this.showToast('Transaksi berhasil dihapus.', 'info');
      }
    };

    window.finflowExportCSV = (period = null) => {
      let txs = State.getState().transactions;
      if (period) {
        txs = txs.filter(t => t.date.startsWith(period));
      }
      ExportService.exportToCSV(txs, `Laporan_Transaksi_${period || 'Semua'}.csv`);
      this.showToast('File Excel/CSV berhasil diunduh.', 'success');
    };

    window.finflowExportPDF = (periodLabel) => {
      const period = State.getState().selectedPeriod || '2026-09';
      const metrics = State.getMonthlyMetrics(period);
      const breakdown = State.getExpenseBreakdown(period);
      const periodTransactions = State.getState().transactions.filter(t => t.date.startsWith(period));

      ExportService.exportToPDF(periodLabel, metrics, breakdown, periodTransactions);
      this.showToast('Membuka pratinjau dokumen cetak PDF.', 'info');
    };
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new FinFlowApp();
  app.init();
});
