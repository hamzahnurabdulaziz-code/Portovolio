/**
 * HAMZAH NUR ABDUL AZIZ - PORTFOLIO INTERACTION LOGIC
 * Features:
 * - 3D Card Tilt with Specular Glare & Anamorphic Depth
 * - Web Audio API Sci-Fi Synthesizer (Zero external dependencies)
 * - Interactive Terminal CLI (hamzah-cli) with Game & Promo commands
 * - Certificate & Project Lightbox Modals (featuring LMS TKIT & Web Projects)
 * - Copy to Clipboard with Toast Notification
 * - Bilingual Language Switcher (ID / EN)
 * - WhatsApp 08132172119 Quick Chat & Form Integration
 * - Cinematic 3D Intro Controller & Playable 3D Mini-Game Triggers
 * - Skills Filter & Stats Counter
 * - Smooth Cursor Follower
 */

(function () {
  'use strict';

  // ===================================================================
  // 1. WEB AUDIO API SYNTHESIZER
  // ===================================================================
  class AudioFX {
    constructor() {
      this.ctx = null;
      this.muted = false; // Enabled by default for rich gaming & 3D feel
      this.initOnFirstInteraction = this.initOnFirstInteraction.bind(this);
      window.addEventListener('click', this.initOnFirstInteraction, { once: true });
      window.addEventListener('keydown', this.initOnFirstInteraction, { once: true });
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    initOnFirstInteraction() {
      this.init();
    }

    playHover() {
      if (this.muted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      } catch (e) {}
    }

    playClick() {
      if (this.muted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      } catch (e) {}
    }

    playSuccess() {
      if (this.muted || !this.ctx) return;
      try {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          setTimeout(() => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.035, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
          }, idx * 60);
        });
      } catch (e) {}
    }

    playWarp() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        
        // 1. Rising Hyperspace Oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(1350, now + 0.65);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(5000, now + 0.55);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.7);

        // 2. Sub-Bass Hyperspace Rumble
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(90, now);
        sub.frequency.exponentialRampToValueAtTime(32, now + 0.7);

        subGain.gain.setValueAtTime(0.09, now);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

        sub.connect(subGain);
        subGain.connect(this.ctx.destination);

        sub.start(now);
        sub.stop(now + 0.7);
      } catch (e) {}
    }

    toggle() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.muted = !this.muted;
      if (!this.muted) {
        this.playSuccess();
      }
      return !this.muted;
    }
  }

  const audio = new AudioFX();
  window.AudioController = audio;

  // ===================================================================
  // 2. TOAST NOTIFICATION
  // ===================================================================
  function showToast(message, icon = 'check-circle') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => toast.classList.add('show'), 10);
    audio.playSuccess();

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3600);
  }
  window.showToast = showToast;

  // ===================================================================
  // 3. 3D CARD TILT WITH SPECULAR PERSPECTIVE & POP-OUT
  // ===================================================================
  function init3DTilt() {
    const tiltCards = document.querySelectorAll('.avatar-3d-card, .cert-card, .project-card, .timeline-card, .promo-pkg-card, .promo-pillar-card');
    
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });

      card.addEventListener('mouseenter', () => {
        audio.playHover();
      });
    });
  }

  // ===================================================================
  // 4. INTERACTIVE TERMINAL ("hamzah-cli")
  // ===================================================================
  function initTerminal() {
    const screen = document.getElementById('terminal-screen');
    const input = document.getElementById('terminal-input');
    const quickButtons = document.querySelectorAll('.btn-term-cmd');

    if (!screen || !input) return;

    const commands = {
      help: () => `
<div style="color: #00f2fe; font-weight: bold;">[DAFTAR PERINTAH HAMZAH-CLI]</div>
  <span style="color: #ff6b4a;">about</span>     : Menampilkan biografi singkat Hamzah
  <span style="color: #ff6b4a;">skills</span>    : Tech stack (Laravel, Rust, Vue, React, Next.js, MySQL)
  <span style="color: #ff6b4a;">promo</span>     : Paket Jasa Pembuatan Website & Aplikasi Kustom
  <span style="color: #ff6b4a;">play</span>      : 🎮 Mainkan Game 3D Cyber Runner IT Quest
  <span style="color: #ff6b4a;">lms</span>       : Informasi Projek Sistem LMS TKIT Terpadu
  <span style="color: #ff6b4a;">certs</span>     : Daftar sertifikat resmi dari Santrikoding
  <span style="color: #ff6b4a;">projects</span>  : Sorotan karya proyek rekayasa perangkat lunak
  <span style="color: #ff6b4a;">contact</span>   : Informasi kontak & WhatsApp (08132172119)
  <span style="color: #ff6b4a;">neofetch</span>  : Telemetry arsitektur sistem & benchmark
  <span style="color: #ff6b4a;">clear</span>     : Bersihkan layar terminal
      `,
      about: () => `
<span style="color: #42b883; font-weight: bold;">Hamzah Nur Abdul Aziz</span>
Full-Stack & Systems Engineer yang berfokus pada performa ekstrem, memory safety, dan pembuatan website modern berstandar enterprise.
Menguasai <span style="color: #ff2d20; font-weight: bold;">Laravel 13</span> & <span style="color: #fb7185; font-weight: bold;">Livewire 3</span>, <span style="color: #ff6b4a; font-weight: bold;">Rust</span>, <span style="color: #42b883; font-weight: bold;">Vue 3</span>, <span style="color: #61dafb; font-weight: bold;">React 19</span>, dan <span style="color: #ffffff; font-weight: bold;">Next.js 15</span>.
WhatsApp / Telepon: <a href="https://wa.me/628132172119" target="_blank" style="color: #25d366; font-weight: bold;">08132172119</a>.
      `,
      skills: () => `
<div style="color: #00f2fe;">=== CORE STACK & EXPERTISE ===</div>
⚡ <b style="color: #ff2d20;">PHP & Reactive Fullstack:</b> Laravel 13, Livewire 3 (Volt & Alpine.js), Filament v4, Eloquent ORM, Sanctum Auth
⚡ <b style="color: #ff6b4a;">Systems & Backend:</b> Rust (Actix-web, Axum, Tokio async), SQLx, RESTful API, WebSockets
⚡ <b style="color: #42b883;">Modern Frontend:</b> Vue 3 (Composition API), React 19, Next.js 15 App Router, Tailwind CSS
⚡ <b style="color: #38bdf8;">Database & Infra:</b> MySQL, PostgreSQL, Redis, Docker, Git, CI/CD, Nginx
⚡ <b style="color: #f59e0b;">Performance & 3D:</b> Three.js WebGL, sub-10ms latency, SEO 100/100, Core Web Vitals
      `,
      promo: () => `
<div style="color: #ff6b4a; font-weight: bold;">=== JASA PEMBUATAN WEBSITE & SISTEM KUSTOM ===</div>
🚀 <b>Paket 1: Company Profile & Landing Page High-Conversion</b> (Desain Mewah 4K, SEO Google, WhatsApp CTA)
🎓 <b>Paket 2: Sistem LMS Sekolah / TK / PAUD & PPDB Online</b> (Rapor Digital, Absensi Foto, Tagihan SPP WA)
💼 <b>Paket 3: Custom Web Application & Dashboard Enterprise</b> (Laravel 13 / Livewire 3 / Next.js / Vue + Payment Gateway)
👉 <b>Konsultasi Gratis Langsung via WhatsApp:</b> <a href="https://wa.me/628132172119?text=Halo%20Mas%20Hamzah,%20saya%20tertarik%20konsultasi%20pembuatan%20website" target="_blank" style="color: #25d366; font-weight: bold;">08132172119</a>
      `,
      lms: () => `
<div style="color: #42b883; font-weight: bold;">=== SISTEM INFORMASI & LMS TKIT / PAUD TERPADU ===</div>
Sistem terbukti yang telah dibangun dengan Laravel 13, Livewire 3, MySQL, Vue 3 & Tailwind CSS:
• <b>Presensi Harian Berbasis Foto Siswa</b> (Tingkat kehadiran 98% terverifikasi)
• <b>Rapor Perkembangan Naratif Digital</b> (Sesuai Kurikulum Merdeka PAUD)
• <b>Modul Capaian:</b> Hafalan Surat Pendek, Motorik Halus, Sentra Seni & Balok
• <b>Tagihan SPP & Keuangan:</b> Notifikasi otomatis langsung ke WhatsApp wali murid
• <b>Portal Wali Murid:</b> Pantau kegiatan harian & galeri kelas secara real-time
      `,
      laravel: () => `
<div style="color: #ff2d20; font-weight: bold;">=== LARAVEL 13 & LIVEWIRE 3 EXPERTISE ===</div>
• Arsitektur Reaktif Modern: Livewire 3, Volt Components, Alpine.js, Service-Repository Pattern
• Eloquent ORM: Eager loading, query indexing, migration, database seeder
• Fullstack Synergy: Laravel Blade, Livewire SPA, Inertia.js + Vue 3, RESTful API
• Security: CSRF protection, SQL injection prevention, XSS sanitize, JWT / Sanctum
      `,
      play: () => {
        if (window.start3DGame) window.start3DGame();
        return `<span style="color: #00f2fe; font-weight: bold;">[GAME 3D DIMULAI] Kendalikan Cyber Drone dengan W/A/S/D atau Panah! Kumpulkan token Laravel, Rust, Vue, Next.js!</span>`;
      },
      game: () => {
        if (window.start3DGame) window.start3DGame();
        return `<span style="color: #00f2fe; font-weight: bold;">[GAME 3D DIMULAI] Kendalikan Cyber Drone dengan W/A/S/D atau Panah! Kumpulkan token Laravel, Rust, Vue, Next.js!</span>`;
      },
      wa: () => `
<span style="color: #25d366; font-weight: bold;">WhatsApp Resmi: 08132172119</span>
Klik link: <a href="https://wa.me/628132172119" target="_blank" style="color: #25d366; text-decoration: underline;">wa.me/628132172119</a>
      `,
      phone: () => `
<span style="color: #25d366; font-weight: bold;">Nomor Telepon / WhatsApp: 08132172119</span>
      `,
      certs: () => `
<div style="color: #00f2fe;">=== SERTIFIKASI RESMI SANTRIKODING ===</div>
[1] <b>FullStack Developer Dengan Rust dan Vue</b> (ID: SK-6KDZFQ0UVVR1VN3)
[2] <b>FullStack Developer Dengan Rust dan React</b> (ID: SK-40QUSQEIH8P1SHE)
[3] <b>FullStack Next.js Developer</b> (ID: SK-16H6P9EJX2FMHQF)
<i>Verifikasi di: https://santrikoding.com/cek-sertifikat</i>
      `,
      projects: () => `
<div style="color: #00f2fe;">=== REPOSITORY HIGHLIGHTS ===</div>
1. <b style="color: #42b883;">LMS TKIT & Portal PAUD</b>: Sistem manajemen pembelajaran, presensi foto, rapor kurikulum merdeka & SPP WhatsApp (Laravel + Vue + MySQL).
2. <b style="color: #ff6b4a;">RustyCommerce</b>: Microservice e-commerce backend Rust Actix-web + Reactive Vue 3 dashboard (<12ms latency).
3. <b style="color: #61dafb;">RustPulse Monitor</b>: Distributed cloud topology telemetry visualizer (Rust + React WebGL).
4. <b style="color: #ffffff;">WorkflowIQ SaaS</b>: AI workflow automation Next.js 15 App Router & Server Actions.
      `,
      journey: () => `
<div style="color: #ff6b4a;">=== TIMELINE PERJALANAN 0 -> PRO ===</div>
• <b>Genesis:</b> Berawal dari rasa penasaran mendalam tentang rekayasa perangkat lunak.
• <b>Frontend Mastery:</b> Menguasai state reaktif di React & Vue 3 serta styling responsif modern.
• <b>Laravel Systems:</b> Membangun aplikasi web produksi nyata (LMS Sekolah TK, PPDB Online, Company Profile).
• <b>Systems Leap:</b> Menaklukkan Rust untuk backend tingkat tinggi tanpa garbage collection overhead.
• <b>Enterprise Synergy:</b> Menghubungkan ekosistem modern dengan Next.js 15 & PostgreSQL.
      `,
      contact: () => `
<div style="color: #00f2fe;">=== SALURAN KOMUNIKASI RESMI ===</div>
• WhatsApp / Telepon : <a href="https://wa.me/628132172119" target="_blank" style="color: #25d366; font-weight: bold;">08132172119</a>
• Email               : hamzahnurabdulaziz@gmail.com
• GitHub              : github.com/hamzahaziz
• LinkedIn            : linkedin.com/in/hamzahnurabdulaziz
• Domisili            : Indonesia (Tersedia Onsite / Remote)
      `,
      whoami: () => `guest@hamzah-workstation: FullStack Web & Systems Engineer (Hamzah Nur Abdul Aziz)`,
      neofetch: () => `
<pre style="color: #00f2fe; font-size: 0.8rem; line-height: 1.25;">
     _______      <b>User</b>: Hamzah Nur Abdul Aziz
    / _____ \\     <b>Role</b>: FullStack Web & Systems Engineer
   / /     \\ \\    <b>Core Stack</b>: Laravel 11, PHP 8+, Rust, Next.js 15
  | |   O   | |   <b>Frontend</b>: Vue 3, React 19, Tailwind CSS, Three.js
   \\ \\_____/ /    <b>WhatsApp</b>: 08132172119
    \\_______/     <b>Certifications</b>: 3 Verified (Santrikoding)
                  <b>Avg API Latency</b>: 12ms (Rust) / <1s Page Load
                  <b>Uptime Ready</b>: 99.98% High Availability
</pre>
      `,
      clear: () => {
        screen.innerHTML = '';
        return null;
      }
    };

    function executeCommand(raw) {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;

      audio.playClick();

      const entry = document.createElement('div');
      entry.className = 'terminal-entry';
      entry.innerHTML = `
        <div class="terminal-prompt-line">
          <span class="terminal-prompt-user">visitor@hamzah</span>:<span class="terminal-prompt-host">~</span>$ <span>${escapeHtml(raw)}</span>
        </div>
      `;

      let outputHtml = '';
      if (commands[cmd]) {
        outputHtml = commands[cmd]();
      } else {
        outputHtml = `<span style="color: #ef4444;">Perintah tidak ditemukan: '${escapeHtml(cmd)}'. Ketik 'help' untuk panduan.</span>`;
      }

      if (outputHtml !== null) {
        const outDiv = document.createElement('div');
        outDiv.className = 'terminal-output';
        outDiv.innerHTML = outputHtml;
        entry.appendChild(outDiv);
        screen.appendChild(entry);
      }

      screen.scrollTop = screen.scrollHeight;
      input.value = '';
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCommand(input.value);
      }
    });

    quickButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) executeCommand(cmd);
      });
    });

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  // ===================================================================
  // 5. CERTIFICATE & PROJECT MODAL LOGIC (FEATURING LMS TK & REAL PROJECTS)
  // ===================================================================
  const certData = {
    'rust-vue': {
      title: 'FullStack Developer Dengan Rust dan Vue',
      id: 'SK-6KDZFQ0UVVR1VN3',
      img: 'assets/cert-rust-vue.png',
      recipient: 'hamzah nur abdul aziz',
      issuer: 'Santrikoding.com',
      signer: 'Fika Ridaul Maulayya (CEO & Founder)',
      verifyUrl: 'https://santrikoding.com/cek-sertifikat',
      skills: ['Rust Language', 'Actix-web', 'SQLx', 'Vue 3 Composition API', 'Pinia', 'Vite', 'JWT Authentication', 'RESTful API']
    },
    'rust-react': {
      title: 'FullStack Developer Dengan Rust dan React',
      id: 'SK-40QUSQEIH8P1SHE',
      img: 'assets/cert-rust-react.png',
      recipient: 'hamzah nur abdul aziz',
      issuer: 'Santrikoding.com',
      signer: 'Fika Ridaul Maulayya (CEO & Founder)',
      verifyUrl: 'https://santrikoding.com/cek-sertifikat',
      skills: ['Rust Systems', 'Axum / Actix', 'React 19', 'State Management', 'Tailwind CSS', 'High-Throughput Streams', 'PostgreSQL']
    },
    'nextjs': {
      title: 'FullStack Next.js Developer',
      id: 'SK-16H6P9EJX2FMHQF',
      img: 'assets/cert-nextjs.png',
      recipient: 'hamzah nur abdul aziz',
      issuer: 'Santrikoding.com',
      signer: 'Fika Ridaul Maulayya (CEO & Founder)',
      verifyUrl: 'https://santrikoding.com/cek-sertifikat',
      skills: ['Next.js App Router', 'Server Actions', 'SSR & SSG', 'Edge Caching', 'Prisma / Drizzle ORM', 'FullStack Security', 'Vercel Deployment']
    }
  };

  const projectData = {
    'lms-tk': {
      title: 'Sistem LMS & Portal Sekolah TKIT / PAUD Terpadu',
      subtitle: 'Laravel 13, Livewire 3, MySQL, Vue 3, Tailwind CSS & WhatsApp Gateway',
      img: 'assets/project-lms-tk.jpg',
      metrics: { students: '350+ Siswa & Guru', attendance: '98% Presensi Foto', efficiency: '0 Kertas Rapor' },
      desc: 'Sistem Informasi dan Learning Management System (LMS) berbasis web komprehensif yang telah sukses digunakan di institusi pendidikan anak usia dini (TKIT & PAUD). Mengintegrasikan modul presensi harian foto biometrik, pemantauan kurikulum merdeka (Hafalan Surat Pendek, Motorik Halus, Sentra Seni & Balok), rapor perkembangan naratif digital otomatis, dan notifikasi tagihan SPP terintegrasi langsung ke WhatsApp wali murid.',
      tags: ['Laravel 13', 'Livewire 3', 'PHP 8.4', 'MySQL', 'Vue 3', 'Tailwind CSS', 'Kurikulum Merdeka', 'WhatsApp API Gateway', 'Chart.js', 'REST API']
    },
    'ppdb-online': {
      title: 'Sistem Informasi & PPDB Online Sekolah Terpadu',
      subtitle: 'Laravel 13, Livewire 3, MySQL & Multi-Step Verification',
      img: 'assets/promo-web-dev.jpg',
      metrics: { registration: '1,200+ Pendaftar', verification: 'Real-time Review', report: 'Automated PDF' },
      desc: 'Platform Penerimaan Peserta Didik Baru (PPDB) online dengan alur pendaftaran multi-step, upload berkas digital berkapasitas tinggi, verifikasi administrasi oleh panitia, cetak kartu ujian dan bukti kelulusan otomatis via PDF, serta notifikasi instan WhatsApp kepada calon wali murid.',
      tags: ['Laravel 13', 'Livewire 3', 'MySQL', 'PDF Automation', 'Tailwind CSS', 'WhatsApp Notification', 'Role-Based Access Control']
    },
    'rustycommerce': {
      title: 'RustyCommerce High-Performance Engine',
      subtitle: 'Rust (Actix-web + SQLx) & Vue 3 Composition API',
      img: 'assets/project-rustycommerce.jpg',
      metrics: { latency: '12ms avg', throughput: '48k req/sec', memory: '0 Data Races' },
      desc: 'Arsitektur e-commerce mikroservis bertenaga Rust dengan kompilasi native yang menghasilkan performa luar biasa. Dilengkapi panel analitik real-time menggunakan Vue 3, Pinia, dan WebSocket untuk sinkronisasi inventaris multi-cabang tanpa delay.',
      tags: ['Rust', 'Actix-web', 'SQLx', 'Vue 3', 'Pinia', 'WebSockets', 'PostgreSQL', 'Docker']
    },
    'workflowiq': {
      title: 'WorkflowIQ SaaS AI Platform',
      subtitle: 'Next.js 15 App Router & PostgreSQL Enterprise Cloud',
      img: 'assets/project-workflowiq.jpg',
      metrics: { success: '98.7% Automation', efficiency: '3.4x Faster', seo: '100% Lighthouse' },
      desc: 'Platform SaaS modern untuk otomatisasi alur kerja digital dan integrasi model AI cerdas. Menggunakan Next.js 15 App Router terbaru dengan Server Actions dan streaming UI, didukung basis data PostgreSQL dan caching di edge server.',
      tags: ['Next.js 15', 'React Server Components', 'TypeScript', 'PostgreSQL', 'AI Engine', 'Tailwind', 'Edge Middleware']
    },
    'rustpulse': {
      title: 'RustPulse Cloud Telemetry Monitor',
      subtitle: 'Rust (Axum + Tokio) & React 19 WebGL Topology',
      img: 'assets/project-rustpulse.jpg',
      metrics: { integrity: '100% Rust', concurrency: '9,840 Nodes', bandwidth: '9.8 GB/s' },
      desc: 'Platform pemantauan infrastruktur server cloud terdistribusi. Backend Rust menjamin keamanan memori tanpa overhead garbage collector, sementara frontend React 19 merender ribuan node koneksi secara interaktif menggunakan WebGL dan akselerasi GPU.',
      tags: ['Rust', 'Axum', 'Tokio Async', 'React 19', 'Three.js', 'Telemetry', 'Prometheus', 'Redis']
    }
  };

  function initModals() {
    const certModal = document.getElementById('cert-modal');
    const projectModal = document.getElementById('project-modal');
    const closeButtons = document.querySelectorAll('.modal-close-btn, .modal-overlay');

    // Open Cert Modal
    document.querySelectorAll('[data-cert-key]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-cert-key');
        const data = certData[key];
        if (!data) return;

        audio.playClick();

        document.getElementById('modal-cert-title').innerText = data.title;
        document.getElementById('modal-cert-id').innerText = data.id;
        document.getElementById('modal-cert-recipient').innerText = data.recipient;
        document.getElementById('modal-cert-signer').innerText = data.signer;
        document.getElementById('modal-cert-img').src = data.img;
        document.getElementById('modal-cert-img').alt = data.title;
        
        const verifyLink = document.getElementById('modal-cert-verify-link');
        if (verifyLink) verifyLink.href = data.verifyUrl;

        const skillsWrap = document.getElementById('modal-cert-skills');
        if (skillsWrap) {
          skillsWrap.innerHTML = data.skills.map(s => `<span class="project-tag">${s}</span>`).join('');
        }

        const copyBtn = document.getElementById('modal-cert-copy-btn');
        if (copyBtn) {
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(data.id);
            showToast(`ID Sertifikat ${data.id} berhasil disalin!`);
          };
        }

        certModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    // Open Project Modal
    document.querySelectorAll('[data-project-key]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-project-key');
        const data = projectData[key];
        if (!data) return;

        audio.playClick();

        document.getElementById('modal-proj-title').innerText = data.title;
        document.getElementById('modal-proj-subtitle').innerText = data.subtitle;
        document.getElementById('modal-proj-desc').innerText = data.desc;
        document.getElementById('modal-proj-img').src = data.img;

        const tagsWrap = document.getElementById('modal-proj-tags');
        if (tagsWrap) {
          tagsWrap.innerHTML = data.tags.map(t => `<span class="project-tag">${t}</span>`).join('');
        }

        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close Modals
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target === btn || btn.classList.contains('modal-close-btn')) {
          audio.playClick();
          document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
          document.body.style.overflow = '';
        }
      });
    });

    // Keyboard ESC close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
      }
    });

    // Copy Certificate ID Buttons in cards
    document.querySelectorAll('.btn-copy-id').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-copy');
        if (id) {
          navigator.clipboard.writeText(id);
          showToast(`ID Sertifikat ${id} berhasil disalin!`);
        }
      });
    });
  }

  // ===================================================================
  // 6. SKILLS FILTER & STATS COUNTER
  // ===================================================================
  function initSkillsFilter() {
    const filterBtns = document.querySelectorAll('.btn-skill-filter');
    const skillCards = document.querySelectorAll('.skill-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        audio.playClick();

        const cat = btn.getAttribute('data-category');
        skillCards.forEach(card => {
          if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = 'flex';
            setTimeout(() => card.style.opacity = '1', 50);
          } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 250);
          }
        });
      });
    });
  }

  // ===================================================================
  // 7. BILINGUAL LANGUAGE SWITCHER (ID / EN)
  // ===================================================================
  let currentLang = 'id';

  function initLanguageSwitcher() {
    const langBtn = document.getElementById('lang-toggle');
    if (!langBtn) return;

    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'id' ? 'en' : 'id';
      langBtn.innerText = currentLang === 'id' ? 'ID ⇄ EN' : 'EN ⇄ ID';
      audio.playClick();
      applyLanguage(currentLang);
      showToast(currentLang === 'id' ? 'Bahasa Indonesia diaktifkan' : 'Switched to English');
    });
  }

  function applyLanguage(lang) {
    document.querySelectorAll('[data-id][data-en]').forEach(el => {
      el.innerHTML = el.getAttribute(`data-${lang}`);
    });
  }

  // ===================================================================
  // 8. AUDIO TOGGLE BUTTON & NAVBAR SCROLL
  // ===================================================================
  function initNavAndAudio() {
    const audioBtn = document.getElementById('audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isSoundOn = audio.toggle();
        audioBtn.classList.toggle('active', isSoundOn);
        audioBtn.innerHTML = isSoundOn 
          ? '<i data-lucide="volume-2"></i>' 
          : '<i data-lucide="volume-x"></i>';
        if (window.lucide) window.lucide.createIcons();
        showToast(isSoundOn ? 'Efek Suara 3D Aktif' : 'Efek Suara Dimatikan');
      });
    }

    // Mobile nav hamburger
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
        audio.playClick();
      });
      navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('mobile-open');
        });
      });
    }

    // Scroll Navbar Styling
    const navbar = document.querySelector('.site-nav');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ===================================================================
  // 9. CUSTOM CURSOR FOLLOWER
  // ===================================================================
  function initCustomCursor() {
    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');
    if (!dot || !circle) return;

    if ('ontouchstart' in window) {
      dot.style.display = 'none';
      circle.style.display = 'none';
      return;
    }

    let mouseX = -100, mouseY = -100;
    let circleX = -100, circleY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    });

    function renderCircle() {
      circleX += (mouseX - circleX) * 0.18;
      circleY += (mouseY - circleY) * 0.18;
      circle.style.left = `${circleX}px`;
      circle.style.top = `${circleY}px`;
      requestAnimationFrame(renderCircle);
    }
    renderCircle();

    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .cert-card, .project-card, .scene-mode-btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ===================================================================
  // 10. CONTACT FORM HANDLER (WITH WHATSAPP 08132172119 AUTO-FORWARD)
  // ===================================================================
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const message = document.getElementById('contact-message').value;

      if (!name || !email || !message) {
        showToast('Mohon isi semua kolom pesan.', 'alert-circle');
        return;
      }

      // Auto format WhatsApp message to 08132172119
      const waText = encodeURIComponent(`Halo Mas Hamzah, saya ${name} (${email}). Ingin konsultasi / penawaran pembuatan website atau sistem:\n"${message}"`);
      const waUrl = `https://wa.me/628132172119?text=${waText}`;

      showToast(`Terima kasih ${name}! Menghubungkan langsung ke WhatsApp (08132172119)...`, 'check-circle');
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 700);

      form.reset();
    });
  }

  // ===================================================================
  // 11. CINEMATIC INTRO & 3D MINI-GAME CONTROLLERS
  // ===================================================================
  function initIntroAndGameControllers() {
    // 1. Intro sequence buttons
    const btnEnter = document.getElementById('intro-btn-enter');
    const btnSkip = document.getElementById('intro-btn-skip');

    // Safe cinematic intro trigger
    try {
      if (window.playCinematicIntro && typeof window.playCinematicIntro === 'function') {
        window.playCinematicIntro();
      }
    } catch (e) {
      console.warn('Cinematic intro warning:', e);
    }

    if (btnEnter) {
      btnEnter.addEventListener('click', () => {
        if (window.dismissIntroOverlay) {
          window.dismissIntroOverlay();
        } else if (window.dismissIntro) {
          window.dismissIntro();
        }
      });
    }
    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        if (window.dismissIntroOverlay) {
          window.dismissIntroOverlay();
        } else if (window.dismissIntro) {
          window.dismissIntro();
        }
      });
    }

    // 2. Game Mode launch buttons
    const heroGameBtn = document.getElementById('btn-launch-game-hero');
    const navGameLink = document.getElementById('nav-game-link');
    const gameExitBtn = document.getElementById('game-hud-exit-btn');
    const victoryClaimBtn = document.getElementById('game-claim-wa-btn');

    if (heroGameBtn) {
      heroGameBtn.addEventListener('click', () => {
        if (window.start3DGame) window.start3DGame();
      });
    }
    if (navGameLink) {
      navGameLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.start3DGame) window.start3DGame();
      });
    }
    if (gameExitBtn) {
      gameExitBtn.addEventListener('click', () => {
        if (window.exit3DGame) window.exit3DGame();
        audio.playClick();
      });
    }
    if (victoryClaimBtn) {
      victoryClaimBtn.addEventListener('click', () => {
        const text = encodeURIComponent('Halo Mas Hamzah! Saya telah menyelesaikan Game 3D Cyber Runner dan ingin klaim Diskon 15% Pembuatan Website dengan Kode: DEV-HAMZAH2026.');
        window.open(`https://wa.me/628132172119?text=${text}`, '_blank');
      });
    }

    // 3. Mobile touch D-pad
    const dpadLeft = document.getElementById('btn-dpad-left');
    const dpadRight = document.getElementById('btn-dpad-right');
    const dpadBoost = document.getElementById('btn-dpad-boost');

    if (dpadLeft) {
      dpadLeft.addEventListener('touchstart', (e) => { e.preventDefault(); if (window.triggerGameMove) window.triggerGameMove('left'); });
      dpadLeft.addEventListener('mousedown', () => { if (window.triggerGameMove) window.triggerGameMove('left'); });
    }
    if (dpadRight) {
      dpadRight.addEventListener('touchstart', (e) => { e.preventDefault(); if (window.triggerGameMove) window.triggerGameMove('right'); });
      dpadRight.addEventListener('mousedown', () => { if (window.triggerGameMove) window.triggerGameMove('right'); });
    }
    if (dpadBoost) {
      dpadBoost.addEventListener('touchstart', (e) => { e.preventDefault(); if (window.triggerGameMove) window.triggerGameMove('boost'); });
      dpadBoost.addEventListener('mousedown', () => { if (window.triggerGameMove) window.triggerGameMove('boost'); });
    }
  }

  // DOM Content Loaded Execution
  document.addEventListener('DOMContentLoaded', () => {
    initNavAndAudio();
    init3DTilt();
    initTerminal();
    initModals();
    initSkillsFilter();
    initLanguageSwitcher();
    initCustomCursor();
    initContactForm();
    initIntroAndGameControllers();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

})();
