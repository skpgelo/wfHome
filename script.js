// webapps: https://script.google.com/macros/s/AKfycbxgJdlYeDX001cPK3malvuUq__Cuc9oKstKBDn4eBcioUZPIZuV1LirN9jhZqgPBVgC/exec
// spreadsheet: https://docs.google.com/spreadsheets/d/1URH184f_9MYbuY_PJkF2dFdbfEUFUVpTFPj-4D_n6v4/edit?gid=0#gid=0
// Fungsi untuk menyediakan data pegawai ke HTML saat halaman dimuat
// GANTI DENGAN URL WEB APP DEPLOYMENT ANDA
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxgJdlYeDX001cPK3malvuUq__Cuc9oKstKBDn4eBcioUZPIZuV1LirN9jhZqgPBVgC/exec";

// DATA PEGAWAI (Salinan terstruktur dari Sheet2 'Pegawai')
// Anda dapat melakukan hardcode objek ini di file js agar tidak terbentur CORS GitHub-to-GoogleAppsScript
const dataPegawai = [
    { nama: "Budi Santoso", id: "PEG001", jabatan: "Staff IT" },
    { nama: "Siti Aminah", id: "PEG002", jabatan: "HR Manager" },
    { nama: "Andi Wijaya", id: "PEG003", jabatan: "Finance Executive" }
];

document.addEventListener('DOMContentLoaded', function () {
    const selectNama = document.getElementById('selectNama');
    const inputID = document.getElementById('inputID');
    const inputJabatan = document.getElementById('inputJabatan');
    const form = document.getElementById('wfhForm');
    const submitBtn = document.getElementById('submitBtn');

    // 1. Inisialisasi Dropdown Nama dari Data Pegawai
    dataPegawai.forEach(p => {
        let opt = document.createElement('option');
        opt.value = p.nama;
        opt.textContent = p.nama;
        selectNama.appendChild(opt);
    });

    // 2. Dropdown Chain Logic
    selectNama.addEventListener('change', function() {
        const terpilih = dataPegawai.find(p => p.nama === this.value);
        if (terpilih) {
            inputID.value = terpilih.id;
            inputJabatan.value = terpilih.jabatan;
        } else {
            inputID.value = "";
            inputJabatan.value = "";
        }
    });

    // 3. Geolocation & Reverse Geocoding (Tanpa API Key, menggunakan Nominatim OpenStreetMap)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                document.getElementById('lat').value = lat;
                document.getElementById('lon').value = lon;

                // Ambil alamat aslinya (Reverse Geocode)
                fetch(`https://openstreetmap.org{lat}&lon=${lon}`)
                    .then(res => res.json())
                    .then(geoData => {
                        document.getElementById('alamat').value = geoData.display_name || "Alamat ditemukan tanpa nama jalan.";
                    })
                    .catch(() => {
                        document.getElementById('alamat').value = `Berhasil mendapat koordinat (${lat}, ${lon}). Gagal memuat nama jalan.`;
                    });
            },
            (error) => {
                alert("Gagal memuat lokasi. Pastikan izin GPS aktif.");
                document.getElementById('alamat').value = "Izin lokasi ditolak/tidak ditemukan.";
            }
        );
    }

    // Helper untuk konversi file gambar ke Base64 beserta validasi ukuran & jumlah file
    async function prosesFileGambar(inputId, infoId) {
        const input = document.getElementById(inputId);
        const info = document.getElementById(infoId);
        const files = input.files;
        
        info.textContent = `${files.length} file terpilih`;
        if (files.length > 2) {
            alert(`Maksimal hanya boleh mengunggah 2 file pada ${inputId.toUpperCase()}`);
            input.value = "";
            info.textContent = "0 file terpilih (Error jumlah)";
            return null;
        }

        let arrayBase64 = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 2 * 1024 * 1024) { // Validasi Ukuran 2MB
                alert(`File "${file.name}" melebihi ukuran maksimal 2MB!`);
                input.value = "";
                info.textContent = "0 file terpilih (Error ukuran)";
                return null;
            }

            const base64String = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(file);
            });

            arrayBase64.push({
                base64: base64String,
                type: file.type
            });
        }
        return arrayBase64;
    }

    // Event saat formulir dikirim
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerText = "Memproses Gambar & Data...";

        // Jalankan pemrosesan file gambar
        const g1 = await prosesFileGambar('img1', 'info-img1');
        const g2 = await prosesFileGambar('img2', 'info-img2');
        const g3 = await prosesFileGambar('img3', 'info-img3');

        // Jika salah satu gagal/tidak lolos validasi, batalkan submit
        if (g1 === null || g2 === null || g3 === null) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Kirim Data WFH";
            return;
        }

        // Bungkus payload ke JSON object tunggal
        const payload = {
            Nama: selectNama.value,
            id: inputID.value,
            Jabatan: inputJabatan.value,
            Latitude: document.getElementById('lat').value,
            Longitude: document.getElementById('lon').value,
            Alamat: document.getElementById('alamat').value,
            Gambar_1: g1,
            Gambar_2: g2,
            Gambar_3: g3
        };

        submitBtn.innerText = "Mengirim ke Google Spreadsheet...";

        fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk melewati batasan kebijakan CORS redirect Apps Script
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(() => {
            alert("Data WFH dan Gambar berhasil disimpan ke Spreadsheet & Google Drive!");
            form.reset();
            document.getElementById('info-img1').textContent = "0 file terpilih";
            document.getElementById('info-img2').textContent = "0 file terpilih";
            document.getElementById('info-img3').textContent = "0 file terpilih";
        })
        .catch(err => {
            console.error(err);
            alert("Terjadi gangguan pengiriman data.");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerText = "Kirim Data WFH";
        });
    });
});


