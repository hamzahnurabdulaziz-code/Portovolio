/**
 * FinFlow - Centralized Reactive State Store
 */

import { Storage } from './storage.js';

class StateStore {
  constructor() {
    this.subscribers = new Map();
    this.state = {
      user: null,
      transactions: [],
      categories: [],
      currentView: 'dashboard',
      theme: 'dark',
      filters: {
        search: '',
        type: 'all',
        category: 'all',
        startDate: '',
        endDate: ''
      },
      selectedPeriod: '2026-09' // Default current month
    };
  }

  init() {
    Storage.init();
    this.state.user = Storage.getCurrentUser();
    this.state.transactions = Storage.getTransactions();
    this.state.categories = Storage.getCategories();
    this.state.theme = Storage.getTheme();
  }

  getState() {
    return this.state;
  }

  // Event Subscription
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.subscribers.get(event) || [];
      this.subscribers.set(event, listeners.filter(cb => cb !== callback));
    };
  }

  notify(event, payload) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => cb(payload, this.state));
    }
    // Also notify global listeners
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(cb => cb(event, payload, this.state));
    }
  }

  // Actions
  setUserRole(roleKey) {
    this.state.user = Storage.setCurrentUser(roleKey);
    this.notify('user:change', this.state.user);
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.state.theme = nextTheme;
    Storage.setTheme(nextTheme);
    this.notify('theme:change', nextTheme);
  }

  setView(viewName) {
    this.state.currentView = viewName;
    this.notify('view:change', viewName);
  }

  setFilters(newFilters) {
    this.state.filters = { ...this.state.filters, ...newFilters };
    this.notify('filter:change', this.state.filters);
  }

  setSelectedPeriod(period) {
    this.state.selectedPeriod = period;
    this.notify('period:change', period);
  }

  addOrUpdateTransaction(txData) {
    const updatedList = Storage.saveTransaction(txData);
    this.state.transactions = updatedList;
    this.notify('transactions:update', updatedList);
  }

  deleteTransaction(id) {
    const updatedList = Storage.deleteTransaction(id);
    this.state.transactions = updatedList;
    this.notify('transactions:update', updatedList);
  }

  addOrUpdateCategory(catData) {
    const updatedCats = Storage.saveCategory(catData);
    this.state.categories = updatedCats;
    this.notify('categories:update', updatedCats);
  }

  // Helper selectors
  isCeo() {
    return this.state.user && this.state.user.role === 'ceo';
  }

  isStaff() {
    return this.state.user && this.state.user.role === 'staff';
  }

  getFilteredTransactions() {
    const { search, type, category, startDate, endDate } = this.state.filters;
    return this.state.transactions.filter(t => {
      // Type match
      if (type !== 'all' && t.type !== type) return false;
      
      // Category match
      if (category !== 'all' && t.categoryId !== category) return false;

      // Date range match
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      // Search match
      if (search) {
        const query = search.toLowerCase();
        const descMatch = (t.description || '').toLowerCase().includes(query);
        const catMatch = (t.categoryName || '').toLowerCase().includes(query);
        const amountMatch = t.amount.toString().includes(query);
        if (!descMatch && !catMatch && !amountMatch) return false;
      }

      return true;
    });
  }

  // Monthly summary metrics
  getMonthlyMetrics(periodYearMonth = '2026-09') {
    const txsInPeriod = this.state.transactions.filter(t => t.date.startsWith(periodYearMonth));
    
    let totalIncome = 0;
    let totalExpense = 0;

    txsInPeriod.forEach(t => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      if (t.type === 'expense') totalExpense += Number(t.amount);
    });

    const netIncome = totalIncome - totalExpense;

    // Overall total saldo across all time
    let totalSaldo = 0;
    this.state.transactions.forEach(t => {
      if (t.type === 'income') totalSaldo += Number(t.amount);
      if (t.type === 'expense') totalSaldo -= Number(t.amount);
    });

    return {
      period: periodYearMonth,
      totalSaldo,
      totalIncome,
      totalExpense,
      netIncome,
      transactionCount: txsInPeriod.length
    };
  }

  // Category expense breakdown for a given period
  getExpenseBreakdown(periodYearMonth = '2026-09') {
    const expenses = this.state.transactions.filter(
      t => t.type === 'expense' && t.date.startsWith(periodYearMonth)
    );

    const categoryMap = new Map();
    let totalExpense = 0;

    expenses.forEach(t => {
      totalExpense += Number(t.amount);
      const catId = t.categoryId;
      const current = categoryMap.get(catId) || {
        categoryId: catId,
        categoryName: t.categoryName,
        total: 0
      };
      current.total += Number(t.amount);
      categoryMap.set(catId, current);
    });

    // Merge with full category metadata for colors and limits
    const breakdown = Array.from(categoryMap.values()).map(item => {
      const catMeta = this.state.categories.find(c => c.id === item.categoryId) || {};
      const percentage = totalExpense > 0 ? (item.total / totalExpense) * 100 : 0;
      const limit = catMeta.limit || 0;
      const budgetUsedPercentage = limit > 0 ? (item.total / limit) * 100 : 0;

      return {
        ...item,
        color: catMeta.color || '#6366f1',
        icon: catMeta.icon || '📁',
        percentage: Math.round(percentage * 10) / 10,
        limit,
        budgetUsedPercentage: Math.round(budgetUsedPercentage)
      };
    });

    // Sort descending by total amount
    breakdown.sort((a, b) => b.total - a.total);

    return {
      totalExpense,
      items: breakdown
    };
  }
}

export const State = new StateStore();
