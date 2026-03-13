// ================== KONFIGURASI ==================
const STOCKS_RAW_URL = 'https://raw.githubusercontent.com/FJ25-by/fish-it/main/stock.json?t=' + Date.now();
// Data link produk
const productLinks = {
    'SECRET TUMBAL': 'https://www.roblox.com/share?code=751cedb08a1fc342ac184753d7062d9d&type=Server',
    'Evolved Enchant Stone': 'https://www.roblox.com/share?code=751cedb08a1fc342ac184753d7062d9d&type=Server'
};

// State stok
let stocks = {
    'SECRET TUMBAL': 20,
    'Evolved Enchant Stone': 20
};

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
        const response = await fetch(STOCKS_RAW_URL, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        if (response.ok) {
            stocks = await response.json();
        } else {
            console.warn('Gagal memuat stok, gunakan default');
        }
    } catch (error) {
        console.error('Error fetching stocks:', error);
    }
    updateStockDisplay();
}

function updateStockDisplay() {
    document.getElementById('stock-secret').textContent = stocks['SECRET TUMBAL'];
    document.getElementById('stock-stone').textContent = stocks['Evolved Enchant Stone'];

    const secretBtn = document.querySelector('#product-secret .btn');
    const stoneBtn = document.querySelector('#product-stone .btn');

    if (stocks['SECRET TUMBAL'] <= 0) {
        secretBtn.disabled = true;
        secretBtn.innerHTML = 'Stok Habis';
    } else {
        secretBtn.disabled = false;
        secretBtn.innerHTML = `Pesan Sekarang (STOK: <span id="stock-secret">${stocks['SECRET TUMBAL']}</span>)`;
    }
    if (stocks['Evolved Enchant Stone'] <= 0) {
        stoneBtn.disabled = true;
        stoneBtn.innerHTML = 'Stok Habis';
    } else {
        stoneBtn.disabled = false;
        stoneBtn.innerHTML = `Pesan Sekarang (STOK: <span id="stock-stone">${stocks['Evolved Enchant Stone']}</span>)`;
    }
}

loadStocks();

// ================== VARIABEL MODAL ==================
let selectedPayment = '';
let selectedQty = null;
let selectedPrice = null;
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
    if (stocks[service] <= 0) {
        showNotification(`⛔ Maaf, stok ${service} sedang habis!`, true);
        return;
    }

    document.getElementById('service').value = service;
    document.getElementById('stockDisplay').textContent = stocks[service];

    const container = document.getElementById('stoneOptionsContainer');
    container.innerHTML = '';

    let options = [];
    if (service === 'SECRET TUMBAL') {
        options = [
            { qty: 1, price: 400 },
            { qty: 5, price: 2000 },
            { qty: 10, price: 4000 }
        ];
    } else {
        options = [
            { qty: 1, price: 450 },
            { qty: 5, price: 2000 },
            { qty: 10, price: 4000 }
        ];
    }

    options.forEach(opt => {
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

    // Stok tidak dikurangi otomatis (admin akan update manual)
    const orderId = 'ORD' + Date.now();
    const customerPhone = document.getElementById('phone').value;
    const details = document.getElementById('details').value;

    orderData = {
        orderId: orderId,
        service: service,
        customerPhone: customerPhone,
        amount: selectedPrice.toLocaleString('id-ID'),
        paymentMethod: selectedPayment.toUpperCase(),
        details: details ? details + ` (Jumlah: ${selectedQty} batu)` : `Jumlah: ${selectedQty} batu`,
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
    document.getElementById('secretLinkUrl').textContent = productLinks[service];
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
