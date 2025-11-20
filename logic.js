// Fungsi untuk mendapatkan waktu real-time dan menentukan mode malam
function getCurrentTimeAndMode() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Night = 18:00 - 05:59, Siang = 06:00 - 17:59
    const isNight = (hours >= 18 || hours < 6);
    
    return { timeString, isNight };
}

// Fungsi untuk evaluasi logika proposisi
function evaluateLogic(P, Q, W, A, isNight) {
    // R = (P ∧ Q) ∨ (P ∧ W) ∨ A
    const R = (P && Q) || (P && W) || A;
    
    // S = Night ∧ P
    const S = isNight && P;
    
    // T = R
    const T = R;
    
    return { R, S, T };
}

// Fungsi untuk membuat penjelasan
function generateExplanation(P, Q, W, A, R, S, T, isNight) {
    let explanation = "";
    
    if (R) {
        explanation += "Alarm aktif karena: ";
        const reasons = [];
        if (P && Q) reasons.push("sensor gerak aktif dan pintu terbuka");
        if (P && W) reasons.push("sensor gerak aktif dan jendela terbuka");
        if (A) reasons.push("asap/kebakaran terdeteksi");
        explanation += reasons.join(", ") + ". ";
    } else {
        explanation += "Alarm tidak aktif. ";
    }
    
    if (S) {
        explanation += "Lampu luar menyala karena mode malam dan sensor gerak aktif. ";
    } else {
        explanation += "Lampu luar tidak menyala. ";
    }
    
    if (T) {
        explanation += "Notifikasi terkirim karena alarm aktif.";
    } else {
        explanation += "Notifikasi tidak terkirim.";
    }
    
    return explanation;
}

// Fungsi utama untuk update simulasi
function updateSimulation() {
    // Ambil nilai sensor
    const P = document.getElementById('P').checked;
    const Q = document.getElementById('Q').checked;
    const W = document.getElementById('W').checked;
    const A = document.getElementById('A').checked;
    
    // Ambil waktu dan mode
    const { timeString, isNight } = getCurrentTimeAndMode();
    
    // Update tampilan waktu dan mode
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('mode-text').textContent = isNight ? 'Malam' : 'Siang';
    
    // Evaluasi logika
    const { R, S, T } = evaluateLogic(P, Q, W, A, isNight);
    
    // Update badge output
    updateBadge('R-badge', R);
    updateBadge('S-badge', S);
    updateBadge('T-badge', T);
    
    // Update penjelasan
    const explanation = generateExplanation(P, Q, W, A, R, S, T, isNight);
    document.getElementById('explanation-text').textContent = explanation;
}

// Fungsi untuk update badge dengan animasi
function updateBadge(id, isActive) {
    const badge = document.getElementById(id);
    badge.textContent = isActive ? 'Aktif' : 'Tidak Aktif';
    badge.className = 'badge ' + (isActive ? 'active' : 'inactive');
}

// Inisialisasi dan update setiap detik untuk waktu real-time
function init() {
    updateSimulation();
    setInterval(updateSimulation, 1000); // Update setiap detik untuk waktu
}

// Jalankan saat halaman load
window.onload = init;