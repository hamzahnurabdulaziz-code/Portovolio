const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default state
const defaultState = {
    foodMenu: [
        {
            id: 1,
            name: 'Nasi Goreng Spesial Toko',
            category: 'utama',
            price: 26000,
            estMinutes: 8,
            icon: 'fa-bowl-rice',
            desc: 'Ayam suwir, telur mata sapi, acar segar, dan kerupuk udang renyah.',
            tag: 'Favorit',
            soldToday: 34
        },
        {
            id: 2,
            name: 'Ayam Bakar Madu Pedas',
            category: 'utama',
            price: 30000,
            estMinutes: 12,
            icon: 'fa-drumstick-bite',
            desc: 'Ayam bakar baluran bumbu madu gurih pedas khas rempah nusantara.',
            tag: 'Terlaris',
            soldToday: 28
        },
        {
            id: 3,
            name: 'Mie Goreng Jawa Nyemek',
            category: 'utama',
            price: 24000,
            estMinutes: 7,
            icon: 'fa-utensils',
            desc: 'Mie telur kenyal dengan suwiran ayam, sawi hijau, dan kuah kental gurih.',
            tag: '',
            soldToday: 19
        },
        {
            id: 4,
            name: 'Soto Daging Gurih Santan',
            category: 'utama',
            price: 32000,
            estMinutes: 10,
            icon: 'fa-bowl-food',
            desc: 'Daging sapi empuk bumbu rempah kelapa gurih disajikan dengan emping.',
            tag: 'Rekomendasi',
            soldToday: 22
        },
        {
            id: 5,
            name: 'Tahu & Tempe Mendoan Crispy',
            category: 'kudapan',
            price: 16000,
            estMinutes: 5,
            icon: 'fa-bread-slice',
            desc: 'Porsi 4 pcs tempe mendoan hangat dengan cocolan sambal kecap rawit pedas.',
            tag: '',
            soldToday: 41
        },
        {
            id: 6,
            name: 'Pisang Bakar Keju Cokelat',
            category: 'kudapan',
            price: 18000,
            estMinutes: 6,
            icon: 'fa-cheese',
            desc: 'Pisang raja bakar dengan parutan keju cheddar melimpah dan susu kental cokelat.',
            tag: '',
            soldToday: 15
        },
        {
            id: 7,
            name: 'Es Teh Manis Melati Jumbo',
            category: 'minuman',
            price: 6000,
            estMinutes: 2,
            icon: 'fa-glass-water',
            desc: 'Seduhan daun teh wangi melati dingin segar ukuran jumbo pemuas dahaga.',
            tag: 'Segar',
            soldToday: 65
        },
        {
            id: 8,
            name: 'Kopi Susu Gula Aren Toko',
            category: 'minuman',
            price: 19000,
            estMinutes: 3,
            icon: 'fa-mug-hot',
            desc: 'Espresso robusta lokal dipadu susu kental dan sirup gula aren murni.',
            tag: 'Khas',
            soldToday: 30
        }
    ],
    counters: [
        { id: 1, name: 'Meja Pengambilan 01', type: 'Dapur Utama', status: 'open', officerName: 'Chef Anton', currentTicketCode: 'M-001' },
        { id: 2, name: 'Meja Pengambilan 02', type: 'Dapur Cepat & Kudapan', status: 'open', officerName: 'Siti Rahma', currentTicketCode: 'M-002' },
        { id: 3, name: 'Bar Minuman & Kopi', type: 'Station Minuman', status: 'open', officerName: 'Doni Pratama', currentTicketCode: '-' },
        { id: 4, name: 'Kasir & Bungkus (Takeaway)', type: 'Station Kasir', status: 'open', officerName: 'Lina Marlina', currentTicketCode: 'T-001' },
    ],
    queues: [
        {
            id: 101,
            ticketCode: 'M-001',
            queueNumber: 1,
            status: 'serving',
            counterId: 1,
            userId: 99,
            userName: 'Bu Nita (Meja 03)',
            calledAt: '08:05:12',
            recallCount: 1,
            items: [
                { id: 2, name: 'Ayam Bakar Madu Pedas', qty: 2, price: 30000 },
                { id: 7, name: 'Es Teh Manis Melati Jumbo', qty: 2, price: 6000 }
            ],
            totalAmount: 72000
        },
        {
            id: 102,
            ticketCode: 'M-002',
            queueNumber: 2,
            status: 'waiting',
            counterId: null,
            userId: 1,
            userName: 'Rian Saputra (Meja 08)',
            calledAt: null,
            recallCount: 0,
            items: [
                { id: 1, name: 'Nasi Goreng Spesial Toko', qty: 1, price: 26000 },
                { id: 7, name: 'Es Teh Manis Melati Jumbo', qty: 2, price: 6000 }
            ],
            totalAmount: 38000
        },
        {
            id: 103,
            ticketCode: 'M-003',
            queueNumber: 3,
            status: 'waiting',
            counterId: null,
            userId: 98,
            userName: 'Pak Hendra (Meja 05)',
            calledAt: null,
            recallCount: 0,
            items: [
                { id: 4, name: 'Soto Daging Gurih Santan', qty: 1, price: 32000 },
                { id: 5, name: 'Tahu & Tempe Mendoan Crispy', qty: 1, price: 16000 }
            ],
            totalAmount: 48000
        }
    ],
    activeCall: {
        ticketCode: 'M-001',
        customerName: 'Bu Nita (Meja 03)',
        serviceName: 'Pesanan Selesai Dimasak',
        counterName: 'Meja Pengambilan 01',
        itemsPreview: '2x Ayam Bakar Madu Pedas, 2x Es Teh Manis Jumbo',
        calledAt: '08:05:12'
    }
};

// Database in-memory cache
let state = null;

function loadDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            state = JSON.parse(raw);
            console.log('[Database] Loaded persisted state from', DB_FILE);
        } else {
            state = JSON.parse(JSON.stringify(defaultState));
            saveDatabase();
            console.log('[Database] Initialized default database');
        }
    } catch (e) {
        console.error('[Database] Failed to read database, using defaults:', e);
        state = JSON.parse(JSON.stringify(defaultState));
    }
}

let saveTimeout = null;
function saveDatabase() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
            console.log('[Database] State persisted to disk.');
        } catch (e) {
            console.error('[Database] Failed to save state:', e);
        }
    }, 150);
}

loadDatabase();

// Connected SSE clients for real-time broadcasts
const sseClients = new Set();

function broadcastEvent(eventType, payload) {
    const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of sseClients) {
        try {
            client.write(message);
        } catch (e) {
            sseClients.delete(client);
        }
    }
}

// Keep-alive heartbeat every 20 seconds
setInterval(() => {
    for (const client of sseClients) {
        try {
            client.write(': ping\n\n');
        } catch (e) {
            sseClients.delete(client);
        }
    }
}, 20000);

// Helper to get local IPv4 address
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// MIME types dictionary
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

// Request Parser
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 5 * 1024 * 1024) { // 5MB limit
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    // CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // 1. SSE Real-Time Endpoint
    if (pathname === '/api/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        res.write(`event: connected\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`);
        sseClients.add(res);

        req.on('close', () => {
            sseClients.delete(res);
        });
        return;
    }

    // 2. REST API Endpoints
    if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');

        // GET /api/info
        if (pathname === '/api/info' && req.method === 'GET') {
            const ip = getLocalIp();
            res.writeHead(200);
            res.end(JSON.stringify({
                status: 'online',
                port: PORT,
                localUrl: `http://localhost:${PORT}`,
                networkUrl: `http://${ip}:${PORT}`,
                ip: ip,
                connectedClients: sseClients.size,
                uptime: process.uptime()
            }));
            return;
        }

        // GET /api/state
        if (pathname === '/api/state' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify(state));
            return;
        }

        // POST /api/order (Create new food queue order)
        if (pathname === '/api/order' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const items = body.items || [];
                const totalAmount = body.totalAmount || 0;
                const userId = body.userId || Date.now();
                const userName = body.userName || 'Pelanggan Meja';

                if (items.length === 0) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Minimal pilih 1 menu makanan' }));
                    return;
                }

                const nextNumber = state.queues.length + 1;
                const ticketCode = `M-${String(nextNumber).padStart(3, '0')}`;

                const newQueue = {
                    id: Date.now(),
                    ticketCode: ticketCode,
                    queueNumber: nextNumber,
                    status: 'waiting',
                    counterId: null,
                    userId: userId,
                    userName: userName,
                    calledAt: null,
                    recallCount: 0,
                    items: items,
                    totalAmount: totalAmount,
                    createdAt: new Date().toLocaleTimeString('id-ID', { hour12: false })
                };

                // Update sold today count in menu
                items.forEach(it => {
                    const found = state.foodMenu.find(f => f.id === it.id);
                    if (found) found.soldToday = (found.soldToday || 0) + it.qty;
                });

                state.queues.push(newQueue);
                saveDatabase();

                broadcastEvent('order_created', {
                    queue: newQueue,
                    foodMenu: state.foodMenu
                });

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, queue: newQueue }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // POST /api/queue/call (Officer calls order)
        if (pathname === '/api/queue/call' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const queueId = body.queueId;
                const counterId = body.counterId;

                const counter = state.counters.find(c => c.id === counterId);
                const queue = queueId 
                    ? state.queues.find(q => q.id === queueId) 
                    : state.queues.find(q => q.status === 'waiting');

                if (!queue || !counter) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Antrean atau meja tidak ditemukan' }));
                    return;
                }

                // Complete any previously serving queue at this counter
                state.queues.forEach(q => {
                    if (q.counterId === counter.id && (q.status === 'calling' || q.status === 'serving')) {
                        q.status = 'completed';
                    }
                });

                queue.status = 'calling';
                queue.counterId = counter.id;
                queue.calledAt = new Date().toLocaleTimeString('id-ID', { hour12: false });
                queue.recallCount = (queue.recallCount || 0) + 1;
                counter.currentTicketCode = queue.ticketCode;

                const itemsStr = queue.items.map(it => `${it.qty}x ${it.name}`).join(', ');
                state.activeCall = {
                    ticketCode: queue.ticketCode,
                    customerName: queue.userName,
                    serviceName: 'Pesanan Selesai Dimasak',
                    counterName: counter.name,
                    itemsPreview: itemsStr,
                    calledAt: queue.calledAt
                };

                saveDatabase();

                broadcastEvent('ticket_called', {
                    queue,
                    counter,
                    activeCall: state.activeCall,
                    speechText: `Nomor antrean pesanan makanan, ${queue.ticketCode.replace('-', ' ')}, atas nama ${queue.userName.split('(')[0]}, pesanan sudah siap diambil di ${counter.name}`
                });

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, queue, activeCall: state.activeCall }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // POST /api/queue/recall (Officer recalls order)
        if (pathname === '/api/queue/recall' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const counterId = body.counterId;
                const counter = state.counters.find(c => c.id === counterId);
                const queue = state.queues.find(q => q.counterId === counterId && (q.status === 'calling' || q.status === 'serving'));

                if (!queue || !counter) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Tidak ada antrean aktif di meja ini' }));
                    return;
                }

                queue.recallCount = (queue.recallCount || 0) + 1;
                queue.calledAt = new Date().toLocaleTimeString('id-ID', { hour12: false });

                const itemsStr = queue.items.map(it => `${it.qty}x ${it.name}`).join(', ');
                state.activeCall = {
                    ticketCode: queue.ticketCode,
                    customerName: queue.userName,
                    serviceName: 'Panggilan Ulang Pesanan',
                    counterName: counter.name,
                    itemsPreview: itemsStr,
                    calledAt: queue.calledAt
                };

                saveDatabase();

                broadcastEvent('ticket_recalled', {
                    queue,
                    counter,
                    activeCall: state.activeCall,
                    speechText: `Panggilan ulang, nomor antrean, ${queue.ticketCode.replace('-', ' ')}, silakan mengambil pesanan Anda di ${counter.name}`
                });

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, queue, activeCall: state.activeCall }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // POST /api/queue/finish (Order picked up / completed)
        if (pathname === '/api/queue/finish' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const counterId = body.counterId;
                const counter = state.counters.find(c => c.id === counterId);
                const queue = state.queues.find(q => q.counterId === counterId && (q.status === 'calling' || q.status === 'serving'));

                if (queue) {
                    queue.status = 'completed';
                }
                if (counter) {
                    counter.currentTicketCode = '-';
                }

                saveDatabase();

                broadcastEvent('ticket_finished', {
                    queueId: queue ? queue.id : null,
                    counterId: counterId
                });

                res.writeHead(200);
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // POST /api/queue/skip (Officer skips order)
        if (pathname === '/api/queue/skip' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const counterId = body.counterId;
                const counter = state.counters.find(c => c.id === counterId);
                const queue = state.queues.find(q => q.counterId === counterId && (q.status === 'calling' || q.status === 'serving'));

                if (queue) {
                    queue.status = 'skipped';
                }
                if (counter) {
                    counter.currentTicketCode = '-';
                }

                saveDatabase();

                broadcastEvent('ticket_skipped', {
                    queueId: queue ? queue.id : null,
                    counterId: counterId
                });

                res.writeHead(200);
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // POST /api/queue/cancel (Customer cancels order)
        if (pathname === '/api/queue/cancel' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const ticketId = body.ticketId;
                const queue = state.queues.find(q => q.id === ticketId);
                if (queue) {
                    queue.status = 'cancelled';
                    saveDatabase();
                    broadcastEvent('ticket_cancelled', { ticketId });
                }
                res.writeHead(200);
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // POST /api/counter/status (Change counter status)
        if (pathname === '/api/counter/status' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const counter = state.counters.find(c => c.id === body.counterId);
                if (counter) {
                    counter.status = body.status;
                    saveDatabase();
                    broadcastEvent('counter_updated', { counterId: body.counterId, status: body.status });
                }
                res.writeHead(200);
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
            return;
        }

        // POST /api/reset (Reset to demo data)
        if (pathname === '/api/reset' && req.method === 'POST') {
            state = JSON.parse(JSON.stringify(defaultState));
            saveDatabase();
            broadcastEvent('state_reset', state);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Unknown API route
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
        return;
    }

    // 3. Static File Serving
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    // Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Akses Ditolak');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Default to index.html for SPA fallback
            filePath = path.join(__dirname, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500);
                res.end('Gagal memuat berkas');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
});

// Start listening
server.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIp();
    console.log('=====================================================');
    console.log('🚀 SIANTRI RESTO & TOKO - SERVER BERJALAN AKTIF');
    console.log('=====================================================');
    console.log(`📡 Akses Lokal (Komputer ini): http://localhost:${PORT}`);
    console.log(`📱 Akses Jaringan (HP/Tablet/TV): http://${localIp}:${PORT}`);
    console.log('💾 Penyimpanan Data: Persisten otomatis di data/database.json');
    console.log('⚡ Sinkronisasi Real-Time: Aktif via Server-Sent Events (SSE)');
    console.log('=====================================================');
});

// Catch errors gracefully
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} sedang digunakan. Mencoba port ${PORT + 1}...`);
        server.listen(PORT + 1, '0.0.0.0');
    } else {
        console.error('Server error:', e);
    }
});

// Prevent crash on unhandled errors
process.on('uncaughtException', (err) => {
    console.error('[SiAntri Server Exception]:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('[SiAntri Server Rejection]:', reason);
});
