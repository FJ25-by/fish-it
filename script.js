// ================== KONFIGURASI ==================
const STOCKS_RAW_URL = 'https://raw.githubusercontent.com/FJ25-by/fish-it/main/stock.json?t=' + Date.now();

// Data semua produk
const products = [
    { 
        name: 'SECRET TUMBAL', 
        icon: '🐟', 
        desc: 'Produk spesial dengan harga spesial. Dapatkan link Private Server setelah pembayaran.', 
        priceOptions: [{qty:1, price:400}, {qty:5, price:2000}, {qty:10, price:4000}],
        initialStock: 20
    },
    { 
        name: 'Evolved Enchant Stone', 
        icon: '🔮', 
        desc: 'Batu enchant untuk meningkatkan pancinganmu. Dapatkan link Private Server setelah pembayaran.', 
        priceOptions: [{qty:1, price:450}, {qty:5, price:2000}, {qty:10, price:4000}],
        initialStock: 20
    },
    { 
        name: 'ANCIENT MAGMA WHALE MAXTON', 
        icon: '🐋', 
        desc: 'Ancient Magma Whale Maxton.', 
        priceOptions: [{qty:1, price:3000}, {qty:2, price:5000}, {qty:3, price:7500}, {qty:4, price:10000}, {qty:5, price:13000}],
        initialStock: 10
    },
    { 
        name: 'Big Leviathan', 
        icon: '🐉', 
        desc: 'Big Leviathan.', 
        priceOptions: [{qty:1, price:4000}],
        initialStock: 10
    },
    { 
        name: 'Big Elpirate Gran Maja', 
        icon: '🏴‍☠️', 
        desc: 'Big Elpirate Gran Maja.', 
        priceOptions: [{qty:1, price:3000}, {qty:2, price:5000}],
        initialStock: 10
    },
    { 
        name: 'Maja Maxton mutasi pasir', 
        icon: '🐠', 
        desc: 'Maja Maxton mutasi pasir.', 
        priceOptions: [{qty:1, price:2000}],
        initialStock: 10
    },
    { 
        name: 'Maja', 
        icon: '🐠', 
        desc: 'Maja.', 
        priceOptions: [{qty:1, price:500}, {qty:2, price:800}, {qty:3, price:1000}, {qty:4, price:1200}, {qty:5, price:1500}],
        initialStock: 10
    },
    { 
        name: 'Mega Pirate Maxton', 
        icon: '🦈', 
        desc: 'Mega Pirate Maxton.', 
        priceOptions: [{qty:1, price:3000}],
        initialStock: 10
    },
    { 
        name: 'Mega Pirate', 
        icon: '🦈', 
        desc: 'Mega Pirate.', 
        priceOptions: [{qty:1, price:2000}],
        initialStock: 10
    },
    { 
        name: 'All Mega Pirate (MAXTON dan biasa)', 
        icon: '⚓', 
        desc: 'All Mega Pirate.', 
        priceOptions: [{qty:1, price:4000}],
        initialStock: 10
    },
    { 
        name: 'Kraken', 
        icon: '🐙', 
        desc: 'Kraken.', 
        priceOptions: [{qty:1, price:2000}, {qty:2, price:3000}, {qty:3, price:5000}, {qty:4, price:6000}, {qty:5, price:7000}],
        initialStock: 10
    },
    { 
        name: 'Big Ancient Lochness (Dino Ruin)', 
        icon: '🦕', 
        desc: 'Big Ancient Lochness.', 
        priceOptions: [{qty:1, price:4000}],
        initialStock: 10
    },
    { 
        name: 'Bone Whale Maxton', 
        icon: '🦴', 
        desc: 'Bone Whale Maxton.', 
        priceOptions: [{qty:1, price:2000}],
        initialStock: 10
    },
    { 
        name: '1x1x1x Comet Shark mutasi Frozen', 
        icon: '❄️', 
        desc: 'Comet Shark mutasi Frozen.', 
        priceOptions: [{qty:1, price:4000}],
        initialStock: 10
    },
    { 
        name: 'Big Emerald', 
        icon: '💚', 
        desc: 'Big Emerald.', 
        priceOptions: [{qty:1, price:3000}],
        initialStock: 10
    },
    { 
        name: 'Big Scare', 
        icon: '🐟', 
        desc: 'Big Scare.', 
        priceOptions: [{qty:1, price:2000}],
        initialStock: 10
    },
    { 
        name: 'Big King Jelly', 
        icon: 'ଳ', 
        desc: 'Big King Jelly.', 
        priceOptions: [{qty:1, price:3000}],
        initialStock: 10
    },
    { 
        name: 'Crystal Crab Maxton', 
        icon: '🦀', 
        desc: 'Crystal Crab Maxton.', 
        priceOptions: [{qty:1, price:2000}],
        initialStock: 10
    },
    { 
        name: 'Monster Shark', 
        icon: '🦈', 
        desc: 'Monster Shark.', 
        priceOptions: [{qty:1, price:2000}],
        initialStock: 10
    },
    { 
        name: 'Worm', 
        icon: '🪱', 
        desc: 'Worm.', 
        priceOptions: [{qty:1, price:1000}],
        initialStock: 10
    },
    { 
        name: 'Great Whale Maxton', 
        icon: '🐳', 
        desc: 'Great Whale Maxton.', 
        priceOptions: [{qty:1, price:5000}],
        initialStock: 10
    },
    { 
        name: 'Great Whale', 
        icon: '🐋', 
        desc: 'Great Whale.', 
        priceOptions: [{qty:1, price:2000}],
        initialStock: 10
    },
    { 
        name: 'All Great Whale (Maxton dan biasa)', 
        icon: '🐋', 
        desc: 'All Great Whale.', 
        priceOptions: [{qty:1, price:6000}],
        initialStock: 10
    }
];

// Link produk (gunakan default yang sama untuk semua)
const DEFAULT_LINK = 'https://www.roblox.com/share?code=751cedb08a1fc342ac184753d7062d9d&type=Server';
const productLinks = {};
products.forEach(p => productLinks[p.name] = DEFAULT_LINK);

// State stok (akan diisi dari GitHub)
let stocks = {};

// ================== FUNGSI STATUS BAR ==================
emailjs.init('QKFRgvCcL8DVQSzbw'); // Public key EmailJS Anda

function updateTime() {
    const now = new Date();
    document.getElementById('time').textContent = now.toLocaleTimeString('id-ID');
    document.getElementById('date').textContent = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}
setInterval(updateTime, 1000);
updateTime();

async function fetchIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        document.getElementById('ipAddress').textContent = data.ip;
    } catch {
        document.getElementById('ipAddress').textContent = '103.175.224.44';
    }
}
fetchIP();

async function initBattery() {
    try {
        if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            updateBatteryStatus(battery);
            battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));
            battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
        } else {
            updateBatteryStatus({ level: 0.85, charging: false });
        }
    } catch {
        updateBatteryStatus({ level: 0.85, charging: false });
    }
}
function updateBatteryStatus(battery) {
    const level = Math.round(battery.level * 100);
    document.getElementById('batteryFill').style.width = level + '%';
    document.getElementById('batteryLevel').textContent = level + '%';
    document.getElementById('chargingIcon').style.display = battery.charging ? 'inline' : 'none';
}
initBattery();

// ================== FUNGSI STOK DARI GITHUB ==================
async function loadStocks() {
    try {
        const response = await fetch(STOCKS_RAW_URL);
        if (response.ok) {
            const remoteStocks = await response.json();
            // Gabungkan dengan data produk (pastikan semua produk ada)
            products.forEach(p => {
                if (remoteStocks[p.name] !== undefined) {
                    stocks[p.name] = remoteStocks[p.name];
                } else {
                    stocks[p.name] = p.initialStock;
                }
            });
        } else {
            console.warn('Gagal memuat stok, gunakan default');
            products.forEach(p => stocks[p.name] = p.initialStock);
        }
    } catch (error) {
        console.error('Error fetching stocks:', error);
        products.forEach(p => stocks[p.name] = p.initialStock);
    }
    renderProducts();
}

// Render semua kartu produk
function renderProducts() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = '';
    products.forEach(product => {
        const stock = stocks[product.name] || 0;
        const card = document.createElement('div');
        card.className = 'service-card';
        card.id = `product-${product.name.replace(/\s+/g, '-')}`;
        card.innerHTML = `
            <h3><span class="icon">${product.icon}</span>${product.name}</h3>
            <p>${product.desc}</p>
            <div class="price">Mulai Rp ${product.priceOptions[0].price.toLocaleString('id-ID')}</div>
            <button class="btn" onclick="openModal('${product.name.replace(/'/g, "\\'")}')" ${stock <= 0 ? 'disabled' : ''}>
                ${stock <= 0 ? 'Stok Habis' : `Pesan Sekarang (STOK: <span id="stock-${product.name.replace(/\s+/g, '-')}">${stock}</span>)`}
            </button>
        `;
        grid.appendChild(card);
    });
}

// ================== VARIABEL MODAL ==================
let selectedPayment = '';
let selectedQty = null;
let selectedPrice = null;
let selectedProduct = null;
let orderData = {};
let countdownInterval;

function showNotification(message, isError = false) {
    const notif = document.createElement('div');
    notif.className = 'notification ' + (isError ? 'error' : '');
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 100);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => document.body.removeChild(notif), 300);
    }, 3000);
}

window.openModal = function(service) {
    selectedProduct = service;
    if (stocks[service] <= 0) {
        showNotification(`⛔ Maaf, stok ${service} sedang habis!`, true);
        return;
    }

    document.getElementById('service').value = service;
    document.getElementById('stockDisplay').textContent = stocks[service];

    // Cari produk
    const product = products.find(p => p.name === service);
    if (!product) return;

    const container = document.getElementById('stoneOptionsContainer');
    container.innerHTML = '';

    product.priceOptions.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'stone-option';
        div.dataset.qty = opt.qty;
        div.dataset.price = opt.price;
        div.innerHTML = `<div class="stone-qty">${opt.qty}</div><div class="stone-price">Rp ${opt.price.toLocaleString('id-ID')}</div>`;
        div.addEventListener('click', function() {
            document.querySelectorAll('.stone-option').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            selectedQty = parseInt(this.dataset.qty);
            selectedPrice = parseInt(this.dataset.price);
        });
        container.appendChild(div);
    });

    selectedQty = null;
    selectedPrice = null;
    document.getElementById('orderModal').style.display = 'block';
};

window.closeModal = function() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('paymentGateway').style.display = 'none';
    clearInterval(countdownInterval);
    resetForm();
};

window.selectPayment = function(method) {
    document.querySelectorAll('#orderModal .payment-method').forEach(el => el.classList.remove('selected'));
    event.target.closest('.payment-method').classList.add('selected');
    selectedPayment = method;
};

window.processOrder = function(event) {
    event.preventDefault();
    if (!selectedPayment) {
        alert('Pilih metode pembayaran terlebih dahulu!');
        return;
    }

    const service = document.getElementById('service').value;
    if (selectedQty === null || selectedPrice === null) {
        alert('Pilih jumlah terlebih dahulu!');
        return;
    }

    if (selectedQty > stocks[service]) {
        showNotification(`Stok tidak cukup! Tersisa ${stocks[service]} item.`, true);
        return;
    }

    // Buat ID pesanan
    const orderId = 'ORD' + Date.now();
    const customerPhone = document.getElementById('phone').value;
    const details = document.getElementById('details').value;

    orderData = {
        orderId: orderId,
        service: service,
        customerPhone: customerPhone,
        amount: selectedPrice.toLocaleString('id-ID'),
        paymentMethod: selectedPayment.toUpperCase(),
        details: details ? details + ` (Jumlah: ${selectedQty})` : `Jumlah: ${selectedQty}`,
        timestamp: new Date().toLocaleString('id-ID')
    };

    document.getElementById('paymentGateway').style.display = 'block';
    document.getElementById('totalAmount').textContent = selectedPrice.toLocaleString('id-ID');
    document.getElementById('orderId').textContent = orderId;

    if (selectedPayment === 'qris') {
        document.getElementById('qrisSection').style.display = 'block';
        document.getElementById('ewalletSection').style.display = 'none';
    } else {
        document.getElementById('qrisSection').style.display = 'none';
        document.getElementById('ewalletSection').style.display = 'block';
        const walletMap = { dana: 'DANA', gopay: 'GoPay' };
        document.getElementById('walletName').textContent = walletMap[selectedPayment] || 'E-Wallet';
        document.getElementById('transferAmount').textContent = selectedPrice.toLocaleString('id-ID');
    }

    startCountdown(15 * 60);
    document.getElementById('paymentGateway').scrollIntoView({ behavior: 'smooth' });
};

function startCountdown(seconds) {
    let remaining = seconds;
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        document.getElementById('countdown').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        remaining--;
        if (remaining < 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').textContent = '00:00';
            showNotification('⏰ Waktu pembayaran habis.', true);
            document.getElementById('paymentGateway').style.display = 'none';
        }
    }, 1000);
}

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => showNotification('Nomor disalin!'));
};

window.confirmPayment = function() {
    const btn = document.getElementById('confirmBtn');
    btn.querySelector('.loading').style.display = 'inline-block';
    btn.disabled = true;

    sendEmail(orderData);

    setTimeout(() => {
        btn.querySelector('.loading').style.display = 'none';
        btn.disabled = false;
        showNotification('Konfirmasi terkirim!');
        closeModal();
        showProductLink(orderData.service);
    }, 2000);
};

function sendEmail(order) {
    emailjs.send('service_0f094up', 'template_9hm65pq', {
        order_id: order.orderId,
        service: order.service,
        customer_phone: order.customerPhone,
        amount: order.amount,
        payment_method: order.paymentMethod,
        details: order.details,
        timestamp: order.timestamp,
        to_email: 'rokitprek@gmail.com',
        from_name: 'Store Yuji System',
        subject: 'Pesanan Baru - ' + order.orderId
    }).catch(console.error);
}

function showProductLink(service) {
    document.getElementById('secretLinkUrl').textContent = productLinks[service] || DEFAULT_LINK;
    document.getElementById('modalLinkTitle').innerHTML = '🔗 Link Private Server';
    document.getElementById('secretLinkModal').style.display = 'block';
}

window.closeSecretLinkModal = function() {
    document.getElementById('secretLinkModal').style.display = 'none';
};

window.openSecretLink = function() {
    window.open(document.getElementById('secretLinkUrl').textContent, '_blank');
};

window.copySecretLink = function() {
    navigator.clipboard.writeText(document.getElementById('secretLinkUrl').textContent)
        .then(() => showNotification('✅ Link disalin!'));
};

function resetForm() {
    document.querySelector('.order-form').reset();
    selectedPayment = '';
    selectedQty = null;
    selectedPrice = null;
    selectedProduct = null;
    document.querySelectorAll('.stone-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('qrisSection').style.display = 'none';
    document.getElementById('ewalletSection').style.display = 'none';
    document.getElementById('paymentGateway').style.display = 'none';
}

window.onclick = function(event) {
    const secretModal = document.getElementById('secretLinkModal');
    const orderModal = document.getElementById('orderModal');
    if (event.target === secretModal) secretModal.style.display = 'none';
    if (event.target === orderModal) closeModal();
};

// Muat stok dan render produk saat halaman dimuat
loadStocks();
