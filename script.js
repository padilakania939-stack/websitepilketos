// ----------------------
// ELEMENT SELECTORS
// ----------------------
const links = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const hasilMenu = document.querySelector(".admin-only[data-target='hasil']");
const daftarMenu = document.querySelector(".admin-only[data-target='daftar']");
const daftarPemilih = document.getElementById("daftarPemilih");
const logoutBtn = document.getElementById("logoutBtn");
const adminControls = document.getElementById("adminControls");
const resetVotesBtn = document.getElementById("resetVotesBtn");
const exportVotesBtn = document.getElementById("exportVotesBtn");
const darkToggle = document.getElementById("darkModeToggle");

// ----------------------
// UTIL: showPage with animation reset
// ----------------------
function showPage(pageId) {
    pages.forEach(p => p.classList.remove("active"));
    const pageBaru = document.getElementById(pageId);
    // restart animation
    pageBaru.classList.remove("active");
    void pageBaru.offsetWidth;
    pageBaru.classList.add("active");

    // if page requires admin, handle alerts in nav listener
}

// ----------------------
// NAVIGATION
// ----------------------
links.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.dataset.target;

        // check admin access for special pages
        if ((target === "hasil" || target === "daftar") && localStorage.getItem("isAdmin") !== "true") {
            alert("Hanya admin yang dapat melihat halaman ini!");
            showPage("home");
            return;
        }

        showPage(target);

        if (target === "hasil") tampilkanGrafik();
        if (target === "daftar") tampilkanDaftarPemilih();
    });
});

// ----------------------
// VOTING
// ----------------------
const voteForm = document.getElementById("voteForm");
voteForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.getElementById("namaPemilih").value.trim();
    const kelas = document.getElementById("kelasPemilih").value;
    const pilihan = document.getElementById("voteSelect").value;

    if (!nama || !kelas || !pilihan) return alert("Isi nama, kelas, dan pilih kandidat!");

    let daftar = JSON.parse(localStorage.getItem("daftarPemilih")) || [];
    const voterId = `${nama} (${kelas})`;

    if (daftar.includes(voterId)) return alert("Kamu sudah melakukan voting!");

    daftar.push(voterId);
    localStorage.setItem("daftarPemilih", JSON.stringify(daftar));

    let votes = JSON.parse(localStorage.getItem("votes")) || {"1":0,"2":0,"3":0};
    votes[pilihan] = (votes[pilihan] || 0) + 1;
    localStorage.setItem("votes", JSON.stringify(votes));

    alert("Terima kasih, suara kamu sudah tercatat!");
    voteForm.reset();

    // if admin viewing chart, refresh
    if (localStorage.getItem("isAdmin") === "true" && document.getElementById("hasil").classList.contains("active")) {
        tampilkanGrafik();
    }
});

// ----------------------
// LOGIN ADMIN
// ----------------------
const adminLoginForm = document.getElementById("loginAdminForm");
const siswaLoginForm = document.getElementById("loginSiswaForm");
const adminLoginSection = document.getElementById("adminLoginSection");
const siswaLoginSection = document.getElementById("siswaLoginSection");

adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("adminUsername").value.trim();
    const pass = document.getElementById("adminPassword").value.trim();

    if (user === "Kania" && pass === "07") {
        localStorage.setItem("isAdmin", "true");
        localStorage.removeItem("isSiswa");
        alert("Selamat datang, Admin Kania!");

        // show admin menus & controls
        document.querySelectorAll(".admin-only").forEach(el => el.style.display = "inline");
        logoutBtn.classList.remove("hidden");
        adminLoginSection.style.display = "none";
        siswaLoginSection.style.display = "none";
        adminControls.style.display = "block";

        showPage("home");
    } else {
        alert("Username atau password salah!");
    }
});

// ----------------------
// LOGIN SISWA
// ----------------------
siswaLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = document.getElementById("siswaNama").value.trim();
    const kelas = document.getElementById("siswaKelas").value;

    if (!nama || !kelas) return alert("Isi nama dan pilih kelas!");

    localStorage.setItem("isSiswa", "true");
    localStorage.setItem("namaSiswa", nama);
    localStorage.setItem("kelasSiswa", kelas);
    localStorage.removeItem("isAdmin");

    document.getElementById("namaPemilih").value = nama;
    document.getElementById("kelasPemilih").value = kelas;

    alert(`Selamat datang ${nama} dari kelas ${kelas}! Silakan menuju menu Voting.`);
    logoutBtn.classList.remove("hidden");
    adminLoginSection.style.display = "none";
    siswaLoginSection.style.display = "none";

    showPage("vote");
});

// ----------------------
// LOGOUT
// ----------------------
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isSiswa");
    localStorage.removeItem("namaSiswa");
    localStorage.removeItem("kelasSiswa");

    logoutBtn.classList.add("hidden");
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
    adminControls.style.display = "none";

    adminLoginSection.style.display = "block";
    siswaLoginSection.style.display = "block";

    showPage("login");
    alert("Logout berhasil!");
});

// ----------------------
// GRAFIK (Chart.js)
// ----------------------
function tampilkanGrafik() {
    const votes = JSON.parse(localStorage.getItem("votes")) || {"1":0,"2":0,"3":0};
    const ctx = document.getElementById("hasilChart").getContext("2d");

    if (window.voteChart) window.voteChart.destroy();

    window.voteChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Raka Putra", "Nadia Ayu", "Dimas Arya"],
            datasets: [{
                label: "Jumlah Suara",
                data: [votes["1"]||0, votes["2"]||0, votes["3"]||0],
                backgroundColor: ["#ff9a9e", "#fad0c4", "#fcb69f"],
                borderRadius: 10
            }]
        },
        options: {
            scales: {
                x: { ticks: { color: document.body.classList.contains("dark-mode") ? "#fff" : "#000" } },
                y: { beginAtZero: true, ticks: { color: document.body.classList.contains("dark-mode") ? "#fff" : "#000" } }
            },
            plugins: {
                legend: { labels: { color: document.body.classList.contains("dark-mode") ? "#fff" : "#000" } }
            }
        }
    });
}

// update chart colors when theme toggled
function updateChartTheme() {
    if (!window.voteChart) return;
    const isDark = document.body.classList.contains("dark-mode");
    if (window.voteChart.options.scales?.x) {
        window.voteChart.options.scales.x.ticks.color = isDark ? "#fff" : "#000";
        window.voteChart.options.scales.y.ticks.color = isDark ? "#fff" : "#000";
    }
    if (window.voteChart.options.plugins?.legend) {
        window.voteChart.options.plugins.legend.labels.color = isDark ? "#fff" : "#000";
    }
    window.voteChart.update();
}

// ----------------------
// DAFTAR PEMILIH
// ----------------------
function tampilkanDaftarPemilih() {
    const daftar = JSON.parse(localStorage.getItem("daftarPemilih")) || [];
    const note = document.getElementById("emptyListNote");
    daftarPemilih.innerHTML = daftar.length
        ? daftar.map(n => `<li>${n}</li>`).join("")
        : "<li>Belum ada siswa yang voting.</li>";
    note.textContent = daftar.length ? `Total: ${daftar.length} siswa` : "";
}

// ----------------------
// RESET & EXPORT (admin)
// ----------------------
resetVotesBtn?.addEventListener("click", () => {
    if (confirm("Yakin ingin mereset semua hasil voting? Semua data pemilih juga akan dihapus.")) {
        localStorage.removeItem("votes");
        localStorage.removeItem("daftarPemilih");
        tampilkanDaftarPemilih();
        if (window.voteChart) window.voteChart.destroy();
        alert("Semua hasil voting telah direset.");
    }
});

exportVotesBtn?.addEventListener("click", () => {
    const votes = JSON.parse(localStorage.getItem("votes")) || {"1":0,"2":0,"3":0};
    const daftar = JSON.parse(localStorage.getItem("daftarPemilih")) || [];
    const data = { votes, daftar };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hasil_voting_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// ----------------------
// DARK MODE
// ----------------------
darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("themeMode", mode);
    darkToggle.textContent = mode === "dark" ? "☀️" : "🌙";
    updateChartTheme();
});

// apply saved theme and initial UI state on load
window.addEventListener("load", () => {
    const saved = localStorage.getItem("themeMode");
    if (saved === "dark") {
        document.body.classList.add("dark-mode");
        darkToggle.textContent = "☀️";
    }

    // restore login state (admin or siswa)
    if (localStorage.getItem("isAdmin") === "true") {
        document.querySelectorAll(".admin-only").forEach(el => el.style.display = "inline");
        adminControls.style.display = "block";
        logoutBtn.classList.remove("hidden");
        adminLoginSection.style.display = "none";
        siswaLoginSection.style.display = "none";
    }

    if (localStorage.getItem("isSiswa") === "true") {
        const nama = localStorage.getItem("namaSiswa");
        const kelas = localStorage.getItem("kelasSiswa");
        if (nama) document.getElementById("namaPemilih").value = nama;
        if (kelas) document.getElementById("kelasPemilih").value = kelas;
        logoutBtn.classList.remove("hidden");
        adminLoginSection.style.display = "none";
        siswaLoginSection.style.display = "none";
    }

    // ensure initial page visible
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById("home").classList.add("active");
});