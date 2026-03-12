document.addEventListener('DOMContentLoaded', function() {
    emailjs.init('QKFRgvCcL8DVQSzbw'); // Inisialisasi EmailJS

    // Fungsi untuk memperbarui waktu dan tanggal
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

    // Ambil IP publik
    async function fetchIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            document.getElementById('ipAddress').textContent = data.ip;
        } catch (err) {
            console.error('Error fetching IP:', err);
            document.getElementById('ipAddress').textContent = '103.175.224.44'; // IP default
        }
    }
    fetchIP();

    // Inisialisasi status baterai
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
            console.error('Error getting battery status:', err);
            updateBatteryStatus({ level: 0.85, charging: false });
        }
    }

    function updateBatteryStatus(battery) {
        const level = Math.round(battery.level * 100);
        const batteryFill = document.getElementById('batteryFill');
        const batteryLevel = document.getElementById('batteryLevel');
        const chargingIcon = document.getElementById('chargingIcon');
        batteryFill.style.width = level + '%';
        batteryLevel.textContent = level + '%';
        chargingIcon.style.display = battery.charging ? 'inline' : 'none';
    }
    initBattery();

    // ================== FITUR STOK ==================
    // Stok awal
    let stocks = {
        'SECRET TUMBAL': 20,
        'Evolved Enchant Stone': 20
    };

    // Muat stok dari localStorage jika ada
    function loadStocks() {
        const saved = localStorage.getItem('productStocks');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                stocks = { ...stocks, ...parsed };
            } catch (e) {}
        }
        updateStockDisplay();
    }

    // Simpan stok ke localStorage
    function saveStocks() {
        localStorage.setItem('productStocks', JSON.stringify(stocks));
    }

    // Perbarui tampilan stok di tombol
    function updateStockDisplay() {
        document.getElementById('stock-secret').textContent = stocks['SECRET TUMBAL'];
        document.getElementById('stock-stone').textContent = stocks['Evolved Enchant Stone'];
        // Jika stok habis, disable tombol
        const stoneBtn = document.querySelector('#product-stone .btn');
        if (stocks['Evolved Enchant Stone'] <= 0) {
            stoneBtn.disabled = true;
            stoneBtn.textContent = 'Stok Habis';
        } else {
            stoneBtn.disabled = false;
            stoneBtn.innerHTML = `Pesan Sekarang (STOK: <span id="stock-stone">${stocks['Evolved Enchant Stone']}</span>)`;
        }
        // Untuk secret tumbal, bisa juga disable jika stok habis (tapi tidak diminta)
    }

    loadStocks();

    // ================== VARIABEL GLOBAL ==================
    let selectedPayment = '';
    let orderId = '';
    let countdownInterval;
    let orderData = {};

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

    // ================== MODAL ==================
    window.openModal = function(service, amount) {
        // Cek stok untuk Evolved Enchant Stone
        if (service === 'Evolved Enchant Stone' && stocks[service] <= 0) {
            showNotification('⛔ Maaf, stok Evolved Enchant Stone sedang habis!', true);
            return;
        }

        document.getElementById('service').value = service;
        const amountGroup = document.getElementById('amountGroup');
        const stoneOptions = document.getElementById('stoneOptions');
        const emailGroup = document.getElementById('emailGroup');
        const emailInput = document.getElementById('email');

        if (service === 'Evolved Enchant Stone') {
            // Sembunyikan input amount, tampilkan opsi batu
            amountGroup.style.display = 'none';
            stoneOptions.style.display = 'block';
            document.getElementById('stoneStockDisplay').textContent = stocks[service];
            // Untuk produk batu, email tetap diperlukan? Bisa optional, kita biarkan sesuai aturan (tetap tampil)
            emailGroup.style.display = 'block';
            emailInput.required = true;
            // Hapus required dari input amount
            document.getElementById('amount').required = false;
        } else {
            // Tampilkan input amount, sembunyikan opsi batu
            amountGroup.style.display = 'block';
            stoneOptions.style.display = 'none';
            document.getElementById('amount').value = amount;
            document.getElementById('amount').min = amount;
            document.getElementById('amount').required = true;
            // Untuk secret tumbal, email tidak diperlukan
            if (service === 'SECRET TUMBAL') {
                emailGroup.style.display = 'none';
                emailInput.required = false;
            } else {
                emailGroup.style.display = 'block';
                emailInput.required = true;
            }
        }

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

        const form = event.target;
        const service = document.getElementById('service').value;
        let totalHarga = 0;
        let jumlahBatu = 0;

        if (service === 'Evolved Enchant Stone') {
            // Ambil opsi batu yang dipilih
            const selectedRadio = document.querySelector('input[name="stoneQty"]:checked');
            if (!selectedRadio) {
                alert('Pilih jumlah batu terlebih dahulu!');
                return;
            }
            jumlahBatu = parseInt(selectedRadio.value);
            const hargaSatuan = parseInt(selectedRadio.dataset.price);
            totalHarga = hargaSatuan;

            // Cek stok cukup
            if (jumlahBatu > stocks[service]) {
                showNotification(`Stok tidak cukup! Tersisa ${stocks[service]} batu.`, true);
                return;
            }
        } else {
            // Produk biasa, ambil dari input amount
            totalHarga = parseInt(document.getElementById('amount').value);
            if (isNaN(totalHarga) || totalHarga < 1000) {
                alert('Masukkan jumlah pembelian yang valid (min Rp 1000)');
                return;
            }
        }

        const orderId = 'ORD' + Date.now();
        const customerEmail = document.getElementById('email').value || 'tidak@ada.email';
        const customerPhone = document.getElementById('phone').value;
        const details = document.getElementById('details').value;
        const paymentMethod = selectedPayment.toUpperCase();

        // Data untuk dikirim via email
        orderData = {
            orderId: orderId,
            service: service,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            amount: totalHarga.toLocaleString('id-ID'),
            paymentMethod: paymentMethod,
            details: details + (jumlahBatu ? ` (Jumlah batu: ${jumlahBatu})` : ''),
            timestamp: new Date().toLocaleString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
        };

        // Kurangi stok jika produk batu
        if (service === 'Evolved Enchant Stone') {
            stocks[service] -= jumlahBatu;
            saveStocks();
            updateStockDisplay();
        }
        // Untuk produk lain, kita tidak kurangi stok (karena tidak ada stok)

        // Tampilkan gateway pembayaran
        document.getElementById('paymentGateway').style.display = 'block';
        document.getElementById('totalAmount').textContent = totalHarga.toLocaleString('id-ID');
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
            document.getElementById('transferAmount').textContent = totalHarga.toLocaleString('id-ID');
        }

        startCountdown(15 * 60); // 15 menit
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

        // Kirim email konfirmasi ke admin
        sendEmail(orderData);

        setTimeout(() => {
            loading.style.display = 'none';
            confirmBtn.disabled = false;
            showNotification('Konfirmasi pembayaran terkirim ke admin!');
            closeModal();

            // Tampilkan modal link rahasia jika produk adalah SECRET TUMBAL
            if (orderData.service === 'SECRET TUMBAL') {
                document.getElementById('secretLinkModal').style.display = 'block';
            }
        }, 2000);
    };

    function sendEmail(order) {
        const params = {
            order_id: order.orderId,
            service: order.service,
            customer_email: order.customerEmail,
            customer_phone: order.customerPhone,
            amount: order.amount,
            payment_method: order.paymentMethod,
            details: order.details,
            timestamp: order.timestamp,
            to_email: 'rokitprek@gmail.com',
            from_name: 'Store Yuji System',
            subject: 'Pesanan Baru - ' + order.orderId
        };
        return emailjs.send('service_0f094up', 'template_9hm65pq', params)
            .then(response => console.log('Email sent:', response))
            .catch(error => console.error('Email error:', error));
    }

    function resetForm() {
        document.querySelector('.order-form').reset();
        selectedPayment = '';
        document.querySelectorAll('#orderModal .payment-method').forEach(el => el.classList.remove('selected'));
        document.getElementById('qrisSection').style.display = 'none';
        document.getElementById('ewalletSection').style.display = 'none';
        document.getElementById('paymentGateway').style.display = 'none';
        document.getElementById('amountGroup').style.display = 'block';
        document.getElementById('stoneOptions').style.display = 'none';
    }

    // ================== MODAL LINK RAHASIA ==================
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
