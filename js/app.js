
// Membuat peta dan menentukan posisi awal
const map = L.map('map').setView([-7.70, 110.15], 11);

// Menambahkan OpenStreetMap
L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Memastikan data wisata tersedia
console.log('Data wisata:', window.WISATA);
// Mengubah angka menjadi format Rupiah
function formatRupiah(nilai) {
    if (nilai === null || nilai === undefined || nilai === "") {
        return "Tidak tersedia";
    }

    return "Rp" + Number(nilai).toLocaleString("id-ID");
}

// Mengambil daftar hari operasional
function getHariBuka(p) {
    const daftarHari = [
        ["senin", "Senin"],
        ["selasa", "Selasa"],
        ["rabu", "Rabu"],
        ["kamis", "Kamis"],
        ["jumat", "Jumat"],
        ["sabtu", "Sabtu"],
        ["minggu", "Minggu"]
    ];

    return daftarHari
        .filter(([key]) => Number(p[key]) === 1)
        .map(([, nama]) => nama)
        .join(", ") || "Tidak tersedia";
}

// Menampilkan informasi wisata pada marker
const wisataLayer = L.geoJSON(window.WISATA, {
    onEachFeature: function (feature, layer) {
        const p = feature.properties;

        const jamOperasional = Number(p.buka_24jam) === 1
            ? "Buka 24 jam"
            : `${p.jam_buka || "-"} – ${p.jam_tutup || "-"}`;

        const popup = `
            <div style="min-width:220px; line-height:1.6;">
                <h3 style="margin:0 0 8px;">
                    ${p.nama_wisata || "-"}
                </h3>

                <b>Kategori:</b> ${p.kategori || "-"}<br>
                <b>Kapanewon:</b> ${p.kapanewon || "-"}<br>
                <b>Kalurahan:</b> ${p.kalurahan || "-"}<br>
                <b>Rating:</b> ${p.rating ?? "-"}<br>
                <b>Jumlah ulasan:</b> ${p.jumlah_ulasan ?? "-"}<br>

                <hr>

                <b>Harga tiket:</b> ${formatRupiah(p.harga_masuk_asli_rp)}<br>
                <b>Jam operasional:</b> ${jamOperasional}<br>
                <b>Hari buka:</b> ${getHariBuka(p)}
            </div>
        `;

        layer.bindPopup(popup);
    }
}).addTo(map);

map.fitBounds(wisataLayer.getBounds());

// ===============================
// PANDUAN 5 PERTANYAAN
// ===============================

const jawabanPengguna = {
    lokasi: "",
    jenisWisata: "",
    waktu: "",
    anggaran: "",
    rating: ""
};

let nomorPertanyaan = 0;

const daftarPertanyaan = [
    {
        judul: "Di mana lokasi awal perjalananmu?",
        jenis: "input",
        key: "lokasi",
        placeholder: "Masukkan lokasi awal..."
    },
    {
        judul: "Jenis wisata apa yang kamu sukai?",
        jenis: "pilihan",
        key: "jenisWisata",
        pilihan: [
            "Wisata Alam",
            "Wisata Alam-Buatan",
            "Religi dan Budaya",
            "Agrowisata",
            "Akomodasi dan Rekreasi"
        ]
    },
    {
        judul: "Berapa lama waktu yang kamu sediakan?",
        jenis: "pilihan",
        key: "waktu",
        pilihan: ["Kurang dari 2 jam", "2–4 jam", "4–6 jam", "Lebih dari 6 jam"]
    },
    {
        judul: "Berapa anggaran wisata yang kamu siapkan?",
        jenis: "pilihan",
        key: "anggaran",
        pilihan: ["Di bawah Rp25.000", "Rp25.000–Rp50.000", "Rp50.000–Rp100.000", "Di atas Rp100.000"]
    },
    {
        judul: "Berapa rating minimum tempat wisata yang kamu inginkan?",
        jenis: "pilihan",
        key: "rating",
        pilihan: ["Minimal 3,0", "Minimal 3,5", "Minimal 4,0", "Minimal 4,5"]
    }
];

function tampilkanPertanyaan() {
    const pertanyaan = daftarPertanyaan[nomorPertanyaan];
    const wadah = document.getElementById("isiPertanyaan");

    document.getElementById("progress").textContent =
        `Pertanyaan ${nomorPertanyaan + 1} dari 5`;

    let isi = `<h3>${pertanyaan.judul}</h3>`;

    if (pertanyaan.jenis === "input") {
        isi += `
            <input
                type="text"
                id="jawabanInput"
                placeholder="${pertanyaan.placeholder}"
                value="${jawabanPengguna[pertanyaan.key]}"
                style="width:100%; padding:12px; margin-top:15px;"
            >
        `;
    } else {
    isi += `
        <select
            id="jawabanSelect"
            class="form-select"
        >
            <option value="">-- Pilih jawaban --</option>

            ${pertanyaan.pilihan.map(pilihan => `
                <option
                    value="${pilihan}"
                    ${jawabanPengguna[pertanyaan.key] === pilihan ? "selected" : ""}
                >
                    ${pilihan}
                </option>
            `).join("")}
        </select>
    `;
}
    wadah.innerHTML = isi;

const select = document.getElementById("jawabanSelect");

if (select) {
    select.addEventListener("change", function () {
        jawabanPengguna[pertanyaan.key] = this.value;
    });
}

    document.getElementById("btnKembali").disabled =
        nomorPertanyaan === 0;

    document.getElementById("btnLanjut").textContent =
        nomorPertanyaan === 4 ? "Tampilkan Rekomendasi" : "Lanjut";
}

function pilihJawaban(key, nilai) {
    jawabanPengguna[key] = nilai;
    tampilkanPertanyaan();
}

document.getElementById("btnLanjut").addEventListener("click", function () {
    const pertanyaan = daftarPertanyaan[nomorPertanyaan];

    if (pertanyaan.jenis === "input") {
        const nilai = document.getElementById("jawabanInput").value.trim();

        if (!nilai) {
            alert("Silakan masukkan lokasi awal terlebih dahulu.");
            return;
        }

        jawabanPengguna[pertanyaan.key] = nilai;
    } else if (!jawabanPengguna[pertanyaan.key]) {
        alert("Silakan pilih salah satu jawaban terlebih dahulu.");
        return;
    }

    if (nomorPertanyaan < 4) {
        nomorPertanyaan++;
        tampilkanPertanyaan();
    } else {
        console.log("Jawaban pengguna:", jawabanPengguna);
        alert("Semua pertanyaan telah dijawab!");
    }
});

document.getElementById("btnKembali").addEventListener("click", function () {
    if (nomorPertanyaan > 0) {
        nomorPertanyaan--;
        tampilkanPertanyaan();
    }
});

document.getElementById("btnUbahPreferensi").addEventListener("click", function () {
    document.getElementById("panduan").style.display = "flex";
});

document.getElementById("panduan").style.display = "none";
