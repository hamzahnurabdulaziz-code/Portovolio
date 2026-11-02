/**
 * FinFlow - Single Page App (SPA) Navigation & Routing
 */

import { State } from './state.js';

const PAGE_METADATA = {
  dashboard: {
    title: 'Dashboard Keuangan',
    subtitle: 'Ringkasan eksekutif KPI kas, tren cash flow, dan peringatan batas anggaran'
  },
  transactions: {
    title: 'Manajemen Transaksi',
    subtitle: 'Pencatatan mutasi kas, arsip nota bukti pembayaran, dan riwayat terfilter'
  },
  budget: {
    title: 'Kategori & Anggaran (Budgeting)',
    subtitle: 'Pengaturan pagu maksimal operasional per divisi dan monitoring indikator'
  },
  reports: {
    title: 'Laporan Keuangan',
    subtitle: 'Rekapitulasi periodik, rasio biaya, dan pencetakan dokumen resmi PDF/Excel'
  }
};

export const Navigation = {
  init() {
    // Attach sidebar navigation click handlers
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.navigateTo(view);
        this.closeMobileSidebar();
      });
    });

    // Mobile sidebar toggle button
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const appSidebar = document.getElementById('appSidebar');

    if (mobileMenuBtn && appSidebar && sidebarOverlay) {
      mobileMenuBtn.addEventListener('click', () => {
        appSidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
      });

      sidebarOverlay.addEventListener('click', () => {
        this.closeMobileSidebar();
      });
    }

    // Expose global nav function for buttons across views
    window.finflowNav = (viewName) => {
      this.navigateTo(viewName);
    };

    // Listen to State view change
    State.subscribe('view:change', (view) => {
      this.updateActiveNavUI(view);
    });
  },

  navigateTo(viewName) {
    if (!PAGE_METADATA[viewName]) viewName = 'dashboard';
    State.setView(viewName);
  },

  updateActiveNavUI(viewName) {
    // Update active nav item
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Topbar Title and Subtitle
    const meta = PAGE_METADATA[viewName] || PAGE_METADATA.dashboard;
    const pageTitle = document.getElementById('topbarPageTitle');
    const pageSubtitle = document.getElementById('topbarPageSubtitle');

    if (pageTitle) pageTitle.textContent = meta.title;
    if (pageSubtitle) pageSubtitle.textContent = meta.subtitle;

    // Scroll main view container to top smoothly
    const viewContainer = document.getElementById('viewContainer');
    if (viewContainer) {
      viewContainer.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  closeMobileSidebar() {
    const appSidebar = document.getElementById('appSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (appSidebar) appSidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  }
};
