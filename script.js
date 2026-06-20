// webapps: https://script.google.com/macros/s/AKfycbxgJdlYeDX001cPK3malvuUq__Cuc9oKstKBDn4eBcioUZPIZuV1LirN9jhZqgPBVgC/exec
// spreadsheet: https://docs.google.com/spreadsheets/d/1URH184f_9MYbuY_PJkF2dFdbfEUFUVpTFPj-4D_n6v4/edit?gid=0#gid=0
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('myForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', function (e) {
        // Mencegah halaman reload otomatis saat submit
        e.preventDefault();

        // Mengubah teks tombol agar pengguna tahu data sedang diproses
        submitBtn.disabled = true;
        submitBtn.innerText = "Mengirim...";

        // Mengirim data form menggunakan Fetch API
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal terhubung ke server.');
            }
            return response.json();
        })
        .then(data => {
            alert("Data berhasil disimpan ke Spreadsheet!");
            form.reset(); // Mengosongkan form kembali
        })
        .catch(error => {
            console.error('Error!', error);
            alert("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
        })
        .finally(() => {
            // Mengembalikan tombol ke keadaan semula
            submitBtn.disabled = false;
            submitBtn.innerText = "Simpan Data";
        });
    });
});
