document.addEventListener('DOMContentLoaded', function() {
    emailjs.init('QKFRgvCcL8DVQSzbw'); // Inisialisasi EmailJS dengan public key

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

    // Perbarui tampilan baterai
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

    // Variabel global
    let selectedPayment = '';
    let orderId = '';
    let countdownInterval;
    let orderData = {};

    // Menampilkan notifikasi
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

    // Membuka modal pesanan
    window.openModal = function(service, amount) {
        if (service === 'Evolved Enchant Stone') {
            showNotification('⛔ Maaf, stok Evolved Enchant Stone sedang habis!', true);
            return;
        }
        document.getElementById('service').value = service;
        document.getElementById('amount').value = amount;
        document.getElementById('amount').min = amount;
        document.getElementById('orderModal').style.display = 'block';

        const emailGroup = document.getElementById('emailGroup');
        const emailInput = document.getElementById('email');
        if (service === 'SECRET TUMBAL') {
            emailGroup.style.display = 'none';
            emailInput.required = false;
        } else {
            emailGroup.style.display = 'block';
            emailInput.required = true;
        }
    };

    // Menutup modal
    window.closeModal = function() {
        document.getElementById('orderModal').style.display = 'none';
        document.getElementById('paymentGateway').style.display = 'none';
        clearInterval(countdownInterval);
        resetForm();
    };

    // Memilih metode pembayaran
    window.selectPayment = function(method) {
        // Hapus selected dari semua
        document.querySelectorAll('#orderModal .payment-method').forEach(el => el.classList.remove('selected'));
        // Tambahkan selected ke yang diklik
        event.target.closest('.payment-method').classList.add('selected');
        selectedPayment = method;
    };

    // Mengirim email konfirmasi
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
            .then(response => {
                console.log('Email sent successfully:', response);
                showNotification('✅ Pesanan berhasil dikirim ke admin!');
            })
            .catch(error => {
                console.error('Email error:', error);
                showNotification('⚠️ Pesanan tersimpan, tapi gagal kirim email.', true);
            });
    }

    // Memproses pesanan
    window.processOrder = function(event) {
        event.preventDefault();
        if (!selectedPayment) {
            alert('Pilih metode pembayaran terlebih dahulu!');
            return;
        }

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        orderId = 'ORD' + Date.now();
        if (!data.email) {
            data.email = 'tidak@ada.email';
        }

        orderData = {
            orderId: orderId,
            service: data.service,
            customerEmail: data.email,
            customerPhone: data.phone,
            amount: parseInt(data.amount).toLocaleString('id-ID'),
            paymentMethod: selectedPayment.toUpperCase(),
            details: data.details,
            timestamp: new Date().toLocaleString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };

        document.getElementById('paymentGateway').style.display = 'block';
        document.getElementById('totalAmount').textContent = parseInt(data.amount).toLocaleString('id-ID');
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
            document.getElementById('transferAmount').textContent = parseInt(data.amount).toLocaleString('id-ID');
        }

        startCountdown(15 * 60); // 15 menit
        document.getElementById('paymentGateway').scrollIntoView({ behavior: 'smooth' });
    };

    // Menampilkan QRIS
    function showQRIS() {
        const qrContainer = document.querySelector('#qrisSection .qr-code');
        qrContainer.innerHTML = '<img src="qris.jpeg" alt="QRIS" style="max-width: 200px; height: auto;">';
    }

    // Hitung mundur pembayaran
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

    // Menyalin teks ke clipboard (untuk nomor e-wallet)
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text)
            .then(() => showNotification('Nomor berhasil disalin!'))
            .catch(() => showNotification('Gagal menyalin nomor.', true));
    };

    // Konfirmasi pembayaran
    window.confirmPayment = function() {
        const confirmBtn = document.getElementById('confirmBtn');
        const loading = confirmBtn.querySelector('.loading');
        loading.style.display = 'inline-block';
        confirmBtn.disabled = true;
        setTimeout(() => {
            loading.style.display = 'none';
            confirmBtn.disabled = false;
            showNotification('Konfirmasi pembayaran terkirim ke admin!');
            sendEmail(orderData);
            closeModal();

            // Tampilkan modal link rahasia jika produk adalah SECRET TUMBAL
            if (orderData.service === 'SECRET TUMBAL') {
                document.getElementById('secretLinkModal').style.display = 'block';
            }
        }, 2000);
    };

    // Reset form
    function resetForm() {
        document.querySelector('.order-form').reset();
        selectedPayment = '';
        document.querySelectorAll('#orderModal .payment-method').forEach(el => el.classList.remove('selected'));
        document.getElementById('qrisSection').style.display = 'none';
        document.getElementById('ewalletSection').style.display = 'none';
        document.getElementById('paymentGateway').style.display = 'none';
        const emailGroup = document.getElementById('emailGroup');
        const emailInput = document.getElementById('email');
        if (emailGroup) {
            emailGroup.style.display = 'block';
            emailInput.required = true;
        }
    }

    // Fungsi untuk modal link rahasia
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

    // Tutup modal link rahasia saat klik di luar konten
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
