/**
 * FinFlow - Storage Layer
 * LocalStorage wrapper with comprehensive realistic seed data for PT Nusantara Digital Kreasi
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'finflow_transactions',
  CATEGORIES: 'finflow_categories',
  USER: 'finflow_user',
  THEME: 'finflow_theme',
  INITIALIZED: 'finflow_initialized_v1'
};

// Default Categories with budget limits and icons
const DEFAULT_CATEGORIES = [
  // Pemasukan (Income)
  { id: 'cat-inc-1', name: 'Penjualan Produk', type: 'income', icon: '🛍️', color: '#10b981', limit: 0 },
  { id: 'cat-inc-2', name: 'Jasa Konsultasi & Layanan', type: 'income', icon: '💼', color: '#06b6d4', limit: 0 },
  { id: 'cat-inc-3', name: 'Investasi & Bunga', type: 'income', icon: '📈', color: '#3b82f6', limit: 0 },
  { id: 'cat-inc-4', name: 'Pendapatan Lain-lain', type: 'income', icon: '✨', color: '#8b5cf6', limit: 0 },
  
  // Pengeluaran (Expense) with Monthly Budget Limits (in IDR)
  { id: 'cat-exp-1', name: 'Gaji & Tunjangan Karyawan', type: 'expense', icon: '👥', color: '#6366f1', limit: 45000000 },
  { id: 'cat-exp-2', name: 'Operasional & Sewa Kantor', type: 'expense', icon: '🏢', color: '#0ea5e9', limit: 15000000 },
  { id: 'cat-exp-3', name: 'Marketing & Digital Ads', type: 'expense', icon: '🎯', color: '#f59e0b', limit: 18000000 },
  { id: 'cat-exp-4', name: 'Server, Cloud & Software', type: 'expense', icon: '⚡', color: '#ec4899', limit: 10000000 },
  { id: 'cat-exp-5', name: 'Logistik & Perlengkapan', type: 'expense', icon: '📦', color: '#84cc16', limit: 7500000 },
  { id: 'cat-exp-6', name: 'Pajak & Biaya Legal', type: 'expense', icon: '⚖️', color: '#f43f5e', limit: 12000000 }
];

// High quality sample receipt svg (Base64) to show on initial transactions
const SAMPLE_RECEIPT_SVG = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="550" viewBox="0 0 400 550" fill="none">
  <rect width="400" height="550" rx="12" fill="#ffffff"/>
  <rect x="20" y="20" width="360" height="510" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="200" cy="70" r="28" fill="#4f46e5"/>
  <text x="200" y="77" fill="#ffffff" font-size="20" font-family="sans-serif" font-weight="bold" text-anchor="middle">FF</text>
  <text x="200" y="125" fill="#0f172a" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">BUKTI PEMBAYARAN RESMI</text>
  <text x="200" y="145" fill="#64748b" font-size="12" font-family="sans-serif" text-anchor="middle">PT NUSANTARA DIGITAL KREASI</text>
  <line x1="40" y1="165" x2="360" y2="165" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="1.5"/>
  
  <text x="45" y="195" fill="#64748b" font-size="12" font-family="sans-serif">Nomor Bukti</text>
  <text x="355" y="195" fill="#0f172a" font-size="12" font-family="sans-serif" font-weight="600" text-anchor="end">INV-2026-09012</text>
  
  <text x="45" y="225" fill="#64748b" font-size="12" font-family="sans-serif">Tanggal</text>
  <text x="355" y="225" fill="#0f172a" font-size="12" font-family="sans-serif" font-weight="600" text-anchor="end">12 September 2026</text>
  
  <text x="45" y="255" fill="#64748b" font-size="12" font-family="sans-serif">Metode Bayar</text>
  <text x="355" y="255" fill="#0f172a" font-size="12" font-family="sans-serif" font-weight="600" text-anchor="end">Transfer Bank BCA</text>
  
  <line x1="40" y1="280" x2="360" y2="280" stroke="#e2e8f0" stroke-width="1"/>
  
  <text x="45" y="310" fill="#0f172a" font-size="14" font-family="sans-serif" font-weight="bold">Rincian Transaksi</text>
  
  <text x="45" y="340" fill="#475569" font-size="13" font-family="sans-serif">Layanan Cloud Hosting & Domain</text>
  <text x="355" y="340" fill="#0f172a" font-size="13" font-family="sans-serif" font-weight="600" text-anchor="end">Rp 4.250.000</text>
  
  <text x="45" y="370" fill="#475569" font-size="13" font-family="sans-serif">PPN 11%</text>
  <text x="355" y="370" fill="#0f172a" font-size="13" font-family="sans-serif" font-weight="600" text-anchor="end">Rp 467.500</text>
  
  <rect x="40" y="405" width="320" height="55" rx="8" fill="#e0e7ff"/>
  <text x="55" y="437" fill="#3730a3" font-size="13" font-family="sans-serif" font-weight="bold">TOTAL PEMBAYARAN</text>
  <text x="345" y="438" fill="#3730a3" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="end">Rp 4.717.500</text>
  
  <rect x="135" y="480" width="130" height="30" rx="15" fill="#dcfce7" stroke="#86efac"/>
  <text x="200" y="500" fill="#166534" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">✓ LUNAS / VERIFIED</text>
</svg>
`);

// Generate realistic transactions across August & September 2026
const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx-001',
    date: '2026-09-14',
    type: 'income',
    categoryId: 'cat-inc-1',
    categoryName: 'Penjualan Produk',
    amount: 38500000,
    description: 'Pelunasan invoice batch pesanan software kustom PT Mega Sentosa',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-002',
    date: '2026-09-13',
    type: 'expense',
    categoryId: 'cat-exp-3',
    categoryName: 'Marketing & Digital Ads',
    amount: 16800000,
    description: 'Kampanye Google Ads & Meta Ads Q3 campaign scale-up',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-003',
    date: '2026-09-12',
    type: 'expense',
    categoryId: 'cat-exp-4',
    categoryName: 'Server, Cloud & Software',
    amount: 8900000,
    description: 'Tagihan bulanan AWS Cloud Infrastructure & Database Cluster',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-004',
    date: '2026-09-10',
    type: 'income',
    categoryId: 'cat-inc-2',
    categoryName: 'Jasa Konsultasi & Layanan',
    amount: 25000000,
    description: 'Retainer fee konsultasi integrasi ERP Bank Surya Mandiri',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-005',
    date: '2026-09-08',
    type: 'expense',
    categoryId: 'cat-exp-2',
    categoryName: 'Operasional & Sewa Kantor',
    amount: 11500000,
    description: 'Biaya utilitas listrik, internet fiber dedicated, dan maintenance AC',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-006',
    date: '2026-09-05',
    type: 'expense',
    categoryId: 'cat-exp-1',
    categoryName: 'Gaji & Tunjangan Karyawan',
    amount: 42000000,
    description: 'Payroll gaji pokok & tunjangan tim developer & finance September',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-007',
    date: '2026-09-03',
    type: 'income',
    categoryId: 'cat-inc-1',
    categoryName: 'Penjualan Produk',
    amount: 45000000,
    description: 'Penjualan lisensi tahunan FinTech Core Suite 5 klien baru',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-008',
    date: '2026-09-02',
    type: 'expense',
    categoryId: 'cat-exp-5',
    categoryName: 'Logistik & Perlengkapan',
    amount: 3200000,
    description: 'Pengadaan perlengkapan kantor & restock merchandise klien',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-009',
    date: '2026-08-28',
    type: 'income',
    categoryId: 'cat-inc-1',
    categoryName: 'Penjualan Produk',
    amount: 52000000,
    description: 'Pembayaran termin 2 implementasi SaaS di Surabaya Retail',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-010',
    date: '2026-08-25',
    type: 'expense',
    categoryId: 'cat-exp-1',
    categoryName: 'Gaji & Tunjangan Karyawan',
    amount: 42000000,
    description: 'Payroll gaji tim Agustus 2026',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-011',
    date: '2026-08-20',
    type: 'expense',
    categoryId: 'cat-exp-3',
    categoryName: 'Marketing & Digital Ads',
    amount: 14500000,
    description: 'Biaya sponsorship Tech Expo & Media Release',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  },
  {
    id: 'tx-012',
    date: '2026-08-15',
    type: 'income',
    categoryId: 'cat-inc-3',
    categoryName: 'Investasi & Bunga',
    amount: 4800000,
    description: 'Bunga deposito institusional & imbal hasil reksadana korporasi',
    receipt: SAMPLE_RECEIPT_SVG,
    createdBy: 'Finance Staff'
  }
];

// Initial user states
const DEFAULT_USERS = {
  STAFF: {
    id: 'usr-staff-1',
    name: 'Dimas Wicaksono',
    role: 'staff',
    roleLabel: 'Finance Staff',
    avatarLetter: 'DW'
  },
  CEO: {
    id: 'usr-ceo-1',
    name: 'Budi Hartono (CEO)',
    role: 'ceo',
    roleLabel: 'Management / CEO',
    avatarLetter: 'BH'
  }
};

export const Storage = {
  // Initialize mock data if empty
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      this.resetToDefaults();
    }
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USERS.STAFF));
    localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  // Transactions
  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed reading transactions from storage', e);
      return [];
    }
  },

  saveTransaction(tx) {
    const transactions = this.getTransactions();
    if (tx.id) {
      // Update existing
      const index = transactions.findIndex(t => t.id === tx.id);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...tx };
      } else {
        transactions.unshift(tx);
      }
    } else {
      // Insert new
      const newTx = {
        ...tx,
        id: 'tx-' + Date.now(),
        date: tx.date || new Date().toISOString().split('T')[0]
      };
      transactions.unshift(newTx);
    }
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return transactions;
  },

  deleteTransaction(id) {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return transactions;
  },

  // Categories
  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategory(cat) {
    const categories = this.getCategories();
    if (cat.id) {
      const idx = categories.findIndex(c => c.id === cat.id);
      if (idx !== -1) {
        categories[idx] = { ...categories[idx], ...cat };
      } else {
        categories.push(cat);
      }
    } else {
      const newCat = {
        ...cat,
        id: 'cat-' + (cat.type === 'income' ? 'inc-' : 'exp-') + Date.now()
      };
      categories.push(newCat);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return categories;
  },

  // User & Role Management
  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USERS.STAFF;
    } catch (e) {
      return DEFAULT_USERS.STAFF;
    }
  },

  setCurrentUser(userKeyOrObj) {
    let user;
    if (typeof userKeyOrObj === 'string') {
      user = DEFAULT_USERS[userKeyOrObj] || DEFAULT_USERS.STAFF;
    } else {
      user = userKeyOrObj;
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  // Theme
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Currency helper (IDR)
  formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  },

  // Number format without Rp
  formatNumber(amount) {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
  }
};
