// Variabel global
let homeLocation = null;
let radius = 50;
let activityLog = [];

// Fungsi Haversine untuk menghitung jarak
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// Fungsi untuk mendapatkan lokasi pengguna
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            document.getElementById('user-lat').textContent = lat.toFixed(6);
            document.getElementById('user-lng').textContent = lng.toFixed(6);
            updateDistance(lat, lng);
            updateSimulation();
        }, (error) => {
            console.error('Error getting location:', error);
            alert('Tidak dapat mengakses lokasi. Pastikan GPS diaktifkan.');
        });
    } else {
        alert('Geolocation tidak didukung oleh browser ini.');
    }
}

// Fungsi untuk set lokasi rumah
function setHomeLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            homeLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            document.getElementById('home-lat').textContent = homeLocation.lat.toFixed(6);
            document.getElementById('home-lng').textContent = homeLocation.lng.toFixed(6);
            localStorage.setItem('homeLocation', JSON.stringify(homeLocation));
            addToActivityLog('Lokasi rumah diset.');
            updateSimulation();
        });
    }
}

// Fungsi untuk update jarak
function updateDistance(userLat, userLng) {
    if (homeLocation) {
        const distance = haversineDistance(userLat, userLng, homeLocation.lat, homeLocation.lng);
        document.getElementById('distance').textContent = distance.toFixed(2);
    }
}

// Fungsi untuk simpan radius
function saveRadius() {
    radius = parseInt(document.getElementById('radius-input').value);
    localStorage.setItem('radius', radius);
    addToActivityLog(`Radius disimpan: ${radius} meter.`);
}

// Fungsi untuk cek mode malam
function isNightMode() {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 18 || hours <= 5;
}

// Fungsi untuk toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    if (isNightMode()) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

// Fungsi untuk update sensor status
function updateSensorStatus(id, isSafe) {
    const statusEl = document.getElementById(id + '-status');
    statusEl.textContent = isSafe ? 'Aman' : 'Tidak Aman';
    statusEl.className = 'sensor-status ' + (isSafe ? 'safe' : 'danger');
}

// Fungsi untuk evaluasi logika proposisi
function evaluateLogic() {
    const P = document.getElementById('P').checked; // Pintu terkunci
    const J = document.getElementById('J').checked; // Jendela tertutup
    const S = document.getElementById('S').checked; // Tidak ada asap
    const motion = document.getElementById('motion').checked; // Sensor gerak (opsional)
    const M = isNightMode(); // Mode malam
    const distanceEl = document.getElementById('distance');
    const L = homeLocation && distanceEl.textContent !== '-' && parseFloat(distanceEl.textContent) > radius; // User di luar radius

    // Update sensor status
    updateSensorStatus('P', P);
    updateSensorStatus('J', J);
    updateSensorStatus('S', S);
    updateSensorStatus('motion', motion);

    // A = P ∧ J ∧ S (Rumah aman)
    const A = P && J && S;

    // Update status ring
    const statusText = document.getElementById('status-text');
    const statusCircle = document.getElementById('status-circle');
    if (A) {
        statusText.textContent = 'Aman';
        statusCircle.style.stroke = '#4CAF50';
        statusCircle.style.strokeDashoffset = '0';
    } else {
        statusText.textContent = 'Tidak Aman';
        statusCircle.style.stroke = '#f44336';
        statusCircle.style.strokeDashoffset = '282.5'; // Half circle
    }

    // Notifikasi
    if (L && !A) {
        sendNotification('Rumah tidak aman! Anda meninggalkan area rumah.');
    }
    if (M && !P) {
        sendNotification('Pintu harus dikunci pada malam hari!');
    }
    if (M && L) {
        sendNotification('Risiko tinggi! Anda meninggalkan rumah pada malam hari.');
    }
}

// Fungsi untuk kirim notifikasi
function sendNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('Peringatan Keamanan', { body: message });
        addToNotificationLog(message);
    }
}

// Fungsi untuk request notifikasi
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                alert('Notifikasi diizinkan.');
            }
        });
    }
}

// Fungsi untuk add to notification log
function addToNotificationLog(message) {
    const logList = document.getElementById('log-list');
    const li = document.createElement('li');
    li.textContent = new Date().toLocaleString() + ': ' + message;
    logList.appendChild(li);
    logList.scrollTop = logList.scrollHeight;
}

// Fungsi untuk add to activity log
function addToActivityLog(message) {
    activityLog.push(new Date().toLocaleString() + ': ' + message);
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    updateActivityLogDisplay();
}

// Fungsi untuk update activity log display
function updateActivityLogDisplay() {
    const logEl = document.getElementById('activity-log');
    logEl.innerHTML = '';
    activityLog.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        logEl.appendChild(li);
    });
}

// Fungsi utama update simulasi
function updateSimulation() {
    toggleDarkMode();