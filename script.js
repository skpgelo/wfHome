ocument.addEventListener('DOMContentLoaded', function () {
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
