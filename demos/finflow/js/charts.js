/**
 * FinFlow - Interactive Canvas Charts
 * Lightweight, high-DPI modern charts without heavy external dependencies.
 */

import { Storage } from './storage.js';

export const Charts = {
  activeTooltips: new Map(),

  // 1. Cash Flow Trend Chart (Pemasukan vs Pengeluaran)
  renderCashflowChart(canvas, transactions, timeRange = 'monthly') {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas dimensions based on CSS display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = (rect.width || 600) * dpr;
    canvas.height = (rect.height || 280) * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width || 600;
    const height = rect.height || 280;

    // Aggregate data into periods (last 6 months by default)
    const months = [
      { key: '2026-04', label: 'Apr' },
      { key: '2026-05', label: 'Mei' },
      { key: '2026-06', label: 'Jun' },
      { key: '2026-07', label: 'Jul' },
      { key: '2026-08', label: 'Agu' },
      { key: '2026-09', label: 'Sep' }
    ];

    const dataPoints = months.map(m => {
      const inc = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(m.key))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const exp = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(m.key))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return {
        label: m.label,
        key: m.key,
        income: inc,
        expense: exp
      };
    });

    // Determine max value for Y-axis scale
    let maxVal = 0;
    dataPoints.forEach(d => {
      if (d.income > maxVal) maxVal = d.income;
      if (d.expense > maxVal) maxVal = d.expense;
    });
    // Add 25% padding on top
    maxVal = maxVal > 0 ? maxVal * 1.25 : 50000000;

    // Chart margins
    const padding = { top: 25, right: 20, bottom: 40, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Detect theme for colors
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#64748b' : '#94a3b8';

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw horizontal grid lines & Y labels
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const yVal = (maxVal / ySteps) * i;
      const yPos = padding.top + chartH - (yVal / maxVal) * chartH;

      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      // Format in Millions (Jt)
      const labelText = yVal >= 1000000 ? (yVal / 1000000).toFixed(0) + ' jt' : '0';
      ctx.fillText('Rp ' + labelText, padding.left - 10, yPos);
    }

    // Draw grouped bars
    const groupCount = dataPoints.length;
    const groupWidth = chartW / groupCount;
    const barWidth = Math.min(22, groupWidth * 0.28);
    const barGap = 4;

    const interactiveBars = [];

    dataPoints.forEach((d, idx) => {
      const groupCenterX = padding.left + idx * groupWidth + groupWidth / 2;
      const xIncome = groupCenterX - barWidth - barGap / 2;
      const xExpense = groupCenterX + barGap / 2;

      const hIncome = Math.max(4, (d.income / maxVal) * chartH);
      const hExpense = Math.max(4, (d.expense / maxVal) * chartH);

      const yIncome = padding.top + chartH - hIncome;
      const yExpense = padding.top + chartH - hExpense;

      // Income bar (Emerald gradient)
      const gradInc = ctx.createLinearGradient(0, yIncome, 0, yIncome + hIncome);
      gradInc.addColorStop(0, '#10b981');
      gradInc.addColorStop(1, '#059669');
      this.drawRoundedRect(ctx, xIncome, yIncome, barWidth, hIncome, 4);
      ctx.fillStyle = gradInc;
      ctx.fill();

      // Expense bar (Rose gradient)
      const gradExp = ctx.createLinearGradient(0, yExpense, 0, yExpense + hExpense);
      gradExp.addColorStop(0, '#f43f5e');
      gradExp.addColorStop(1, '#e11d48');
      this.drawRoundedRect(ctx, xExpense, yExpense, barWidth, hExpense, 4);
      ctx.fillStyle = gradExp;
      ctx.fill();

      // X-axis month label
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.fillText(d.label, groupCenterX, height - padding.bottom + 20);

      // Save hit area for interactive hover
      interactiveBars.push({
        x: groupCenterX - groupWidth / 2,
        w: groupWidth,
        d
      });
    });

    // Tooltip handling
    this.setupChartTooltip(canvas, interactiveBars, padding, height);
  },

  // 2. Expense Donut Breakdown Chart
  renderExpenseDonut(canvas, legendContainer, breakdownData) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width || 220, rect.height || 220);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.44;
    const innerRadius = size * 0.28;

    ctx.clearRect(0, 0, size, size);

    const items = breakdownData.items || [];
    const totalExpense = breakdownData.totalExpense || 0;

    if (items.length === 0 || totalExpense === 0) {
      // Empty placeholder
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '12px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Belum ada data', centerX, centerY);

      if (legendContainer) {
        legendContainer.innerHTML = '<div class="text-muted" style="text-align:center; padding:1rem; font-size:0.8rem;">Tidak ada transaksi pengeluaran pada periode ini.</div>';
      }
      return;
    }

    let startAngle = -Math.PI / 2;
    const defaultColors = ['#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#a855f7', '#3b82f6'];

    items.forEach((item, index) => {
      const sliceAngle = (item.total / totalExpense) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;
      const color = item.color || defaultColors[index % defaultColors.length];

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center Text (Total Pengeluaran)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.fillText('TOTAL PENGELUARAN', centerX, centerY - 10);

    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'light' ? '#0f172a' : '#f8fafc';
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    // Shortened total
    const formattedShort = totalExpense >= 1000000 
      ? 'Rp ' + (totalExpense / 1000000).toFixed(1) + ' jt'
      : Storage.formatIDR(totalExpense);
    ctx.fillText(formattedShort, centerX, centerY + 8);

    // Render interactive legend items in HTML container
    if (legendContainer) {
      legendContainer.innerHTML = items.map(item => `
        <div class="donut-legend-item">
          <div style="display: flex; align-items: center; min-width: 0;">
            <span class="donut-legend-color" style="background-color: ${item.color};"></span>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; color: var(--text-primary);">${item.categoryName}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
            <span style="font-weight: 700; color: var(--text-secondary);">${item.percentage}%</span>
            <span style="font-size: 0.76rem; color: var(--text-muted);">${Storage.formatIDR(item.total)}</span>
          </div>
        </div>
      `).join('');
    }
  },

  // Rounded rectangle helper
  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height < radius) radius = height;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  // Chart tooltip overlay generator
  setupChartTooltip(canvas, interactiveBars, padding, height) {
    let tooltipEl = document.getElementById('chart-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'chart-tooltip';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.display = 'none';
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.background = 'rgba(15, 23, 42, 0.95)';
      tooltipEl.style.backdropFilter = 'blur(8px)';
      tooltipEl.style.border = '1px solid rgba(255, 255, 255, 0.15)';
      tooltipEl.style.borderRadius = '8px';
      tooltipEl.style.padding = '8px 12px';
      tooltipEl.style.color = '#ffffff';
      tooltipEl.style.fontSize = '12px';
      tooltipEl.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
      tooltipEl.style.zIndex = '50';
      tooltipEl.style.transition = 'opacity 0.15s ease';
      document.body.appendChild(tooltipEl);
    }

    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      const hit = interactiveBars.find(b => mouseX >= b.x && mouseX <= b.x + b.w);
      if (hit) {
        const net = hit.d.income - hit.d.expense;
        const netColor = net >= 0 ? '#10b981' : '#f43f5e';
        const netLabel = net >= 0 ? '+' : '';

        tooltipEl.innerHTML = `
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 3px;">
            Bulan ${hit.d.label} 2026
          </div>
          <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 2px;">
            <span style="color: #10b981; font-weight:600;">● Pemasukan:</span>
            <span style="font-weight:700;">${Storage.formatIDR(hit.d.income)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 2px;">
            <span style="color: #f43f5e; font-weight:600;">● Pengeluaran:</span>
            <span style="font-weight:700;">${Storage.formatIDR(hit.d.expense)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 12px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 3px; margin-top: 3px;">
            <span style="color: #94a3b8;">Net Cashflow:</span>
            <span style="color: ${netColor}; font-weight: 800;">${netLabel}${Storage.formatIDR(net)}</span>
          </div>
        `;
        tooltipEl.style.display = 'block';
        tooltipEl.style.left = (e.pageX + 15) + 'px';
        tooltipEl.style.top = (e.pageY - 30) + 'px';
      } else {
        tooltipEl.style.display = 'none';
      }
    };

    canvas.onmouseleave = () => {
      tooltipEl.style.display = 'none';
    };
  }
};
