document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi EmailJS (ganti dengan public key Anda)
    emailjs.init('QKFRgvCcL8DVQSzbw');

    // ================== FUNGSI STATUS BAR ==================
    function updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID');
        const dateStr = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        document.getElementById('time').textContent = timeStr;
        document.getElementById('date').textContent = dateStr;
    }
    setInterval(updateTime, 1000);
    updateTime();

    async function fetchIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            document.getElementById('ipAddress').textContent = data.ip;
        } catch (err) {
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
        } catch (err) {
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

    // ================== DATA LINK PRODUK (SAMA UNTUK KEDUANYA) ==================
    const productLinks = {
        'SECRET TUMBAL': 'https://www.roblox.com/share?code=751cedb08a1fc342ac184753d7062d9d&type=Server',
        'Evolved Enchant Stone': 'https://www.roblox.com/share?code=751cedb08a1fc342ac184753d7062d9d&type=Server' // link yang sama
    };

    // ================== FITUR STOK ==================
    let stocks = {
        'SECRET TUMBAL': 20,
        'Evolved Enchant Stone': 20
    };

    function loadStocks() {
        const saved = localStorage.getItem('productStocks');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                stocks = { ...stocks, ...parsed };
            } catch (e) {}
        }
        updateStockDisplay();
        document.getElementById('admin-stock-secret').value = stocks['SECRET TUMBAL'];
        document.getElementById('admin-stock-stone').value = stocks['Evolved Enchant Stone'];
    }

    function saveStocks() {
        localStorage.setItem('productStocks', JSON.stringify(stocks));
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

    // ================== VARIABEL GLOBAL ==================
    let selectedPayment = '';
    let orderId = '';
    let countdownInterval;
    let orderData = {};
    let selectedQty = null;
    let selectedPrice = null;

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

    // ================== MODAL PEMESANAN ==================
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
        } else if (service === 'Evolved Enchant Stone') {
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
            div.innerHTML = `
                <div class="stone-qty">${opt.qty}</div>
                <div class="stone-price">Rp ${opt.price.toLocaleString('id-ID')}</div>
            `;
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

    // ================== PROSES PESANAN ==================
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

        const jumlah = selectedQty;
        const harga = selectedPrice;

        if (jumlah > stocks[service]) {
            showNotification(`Stok tidak cukup! Tersisa ${stocks[service]} item.`, true);
            return;
        }

        stocks[service] -= jumlah;
        saveStocks();
        updateStockDisplay();
        document.getElementById('admin-stock-secret').value = stocks['SECRET TUMBAL'];
        document.getElementById('admin-stock-stone').value = stocks['Evolved Enchant Stone'];

        const orderId = 'ORD' + Date.now();
        const customerPhone = document.getElementById('phone').value;
        const details = document.getElementById('details').value;
        const paymentMethod = selectedPayment.toUpperCase();

        orderData = {
            orderId: orderId,
            service: service,
            customerPhone: customerPhone,
            amount: harga.toLocaleString('id-ID'),
            paymentMethod: paymentMethod,
            details: details ? details + ` (Jumlah: ${jumlah} batu)` : `Jumlah: ${jumlah} batu`,
            timestamp: new Date().toLocaleString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
        };

        document.getElementById('paymentGateway').style.display = 'block';
        document.getElementById('totalAmount').textContent = harga.toLocaleString('id-ID');
        document.getElementById('orderId').textContent = orderId;

        if (selectedPayment === 'qris') {
            document.getElementById('qrisSection').style.display = 'block';
            document.getElementById('ewalletSection').style.display = 'none';
            showQRIS();
        } else {
            document.getElementById('qrisSection').style.display = 'none';
            document.getElementById('ewalletSection').style.display = 'block';
            const walletMap = { dana: 'DANA', gopay: 'GoPay' };
            document.getElementById('walletName').textContent = walletMap[selectedPayment] || 'E-Wallet';
            document.getElementById('transferAmount').textContent = harga.toLocaleString('id-ID');
        }

        startCountdown(15 * 60);
        document.getElementById('paymentGateway').scrollIntoView({ behavior: 'smooth' });
    };

    function showQRIS() {
        const qrContainer = document.querySelector('#qrisSection .qr-code');
        qrContainer.innerHTML = '<img src="qris.jpeg" alt="QRIS" style="max-width: 200px; height: auto;">';
    }

    function startCountdown(seconds) {
        let remaining = seconds;
        clearInterval(countdownInterval);
        countdownInterval = setInterval(function() {
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            document.getElementById('countdown').textContent =
                mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
            remaining--;
            if (remaining < 0) {
                clearInterval(countdownInterval);
                document.getElementById('countdown').textContent = '00:00';
                showNotification('⏰ Waktu pembayaran habis. Silakan buat pesanan ulang.', true);
                document.getElementById('paymentGateway').style.display = 'none';
            }
        }, 1000);
    }

    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text)
            .then(() => showNotification('Nomor berhasil disalin!'))
            .catch(() => showNotification('Gagal menyalin nomor.', true));
    };

    // ================== KONFIRMASI PEMBAYARAN ==================
    window.confirmPayment = function() {
        const confirmBtn = document.getElementById('confirmBtn');
        const loading = confirmBtn.querySelector('.loading');
        loading.style.display = 'inline-block';
        confirmBtn.disabled = true;

        // Kirim email ke admin
        sendEmail(orderData);

        setTimeout(() => {
            loading.style.display = 'none';
            confirmBtn.disabled = false;
            showNotification('Konfirmasi pembayaran terkirim ke admin!');
            closeModal();

            // Tampilkan link (untuk semua produk)
            showProductLink(orderData.service);
        }, 2000);
    };

    function sendEmail(order) {
        const params = {
            order_id: order.orderId,
            service: order.service,
            customer_phone: order.customerPhone,
            amount: order.amount,
            payment_method: order.paymentMethod,
            details: order.details,
            timestamp: order.timestamp,
            to_email: 'rokitprek@gmail.com', // Ganti dengan email admin
            from_name: 'Store Yuji System',
            subject: 'Pesanan Baru - ' + order.orderId
        };
        return emailjs.send('service_0f094up', 'template_9hm65pq', params)
            .then(response => console.log('Email sent:', response))
            .catch(error => console.error('Email error:', error));
    }

    // ================== FUNGSI MENAMPILKAN LINK PRODUK ==================
    function showProductLink(service) {
        const url = productLinks[service] || 'https://example.com';
        const modal = document.getElementById('secretLinkModal');
        const linkElement = document.getElementById('secretLinkUrl');
        const modalTitle = document.getElementById('modalLinkTitle');
        
        // Ubah judul sesuai produk (opsional)
        if (service === 'SECRET TUMBAL') {
            modalTitle.innerHTML = '🔗 Link Private Server';
        } else {
            modalTitle.innerHTML = '🔗 Link Evolved Enchant Stone';
        }
        linkElement.textContent = url;
        
        modal.style.display = 'block';
    }

    // ================== FUNGSI UNTUK MODAL LINK ==================
    window.closeSecretLinkModal = function() {
        document.getElementById('secretLinkModal').style.display = 'none';
    };

    window.openSecretLink = function() {
        const url = document.getElementById('secretLinkUrl').textContent;
        window.open(url, '_blank');
    };

    window.copySecretLink = function() {
        const url = document.getElementById('secretLinkUrl').textContent;
        navigator.clipboard.writeText(url)
            .then(() => showNotification('✅ Link berhasil disalin!'))
            .catch(() => showNotification('❌ Gagal menyalin link', true));
    };

    // ================== ADMIN UPDATE STOK ==================
    window.updateStock = function(productName, inputId) {
        const newStock = parseInt(document.getElementById(inputId).value);
        if (isNaN(newStock) || newStock < 0) {
            alert('Masukkan angka valid');
            return;
        }
        stocks[productName] = newStock;
        saveStocks();
        updateStockDisplay();
        showNotification(`Stok ${productName} diubah menjadi ${newStock}`);
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

    // Tutup modal jika klik di luar
    window.onclick = function(event) {
        const secretModal = document.getElementById('secretLinkModal');
        const orderModal = document.getElementById('orderModal');
        if (event.target === secretModal) {
            secretModal.style.display = 'none';
        }
        if (event.target === orderModal) {
            closeModal();
        }
    };
});
