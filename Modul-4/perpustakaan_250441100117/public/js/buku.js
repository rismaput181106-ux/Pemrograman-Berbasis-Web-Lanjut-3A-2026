document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-buku');
    const alertArea = document.getElementById('alert-area');
    const tbody = document.getElementById('tbody-buku');
    const btnBatal = document.getElementById('btn-batal');
    const formTitle = document.getElementById('form-title');

    function showAlert(message, type = 'success') {
        alertArea.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    function clearErrors() {
        document.querySelectorAll('.text-danger').forEach(el => el.innerText = '');
    }
 
    function resetForm() {
        form.reset();
        document.getElementById('buku-id').value = '';
        formTitle.innerText = 'Tambah Buku Baru';
        btnBatal.classList.add('d-none');
        clearErrors();
    }

    async function fetchBuku() {
        try {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Memuat data...</td></tr>';
            const response = await fetch('/api/buku', {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error('Gagal mengambil data dari server.');

            const result = await response.json();
            tbody.innerHTML = '';

            result.data.forEach((item, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.kategori}</td>
                        <td>${item.judul}</td>
                        <td>${item.penulis}</td>
                        <td>${item.tahun}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editBuku(${item.id})">Ubah</button>
                            <button class="btn btn-sm btn-danger" onclick="hapusBuku(${item.id})">Hapus</button>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        } catch (error) {
            showAlert(error.message, 'danger');
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Data gagal dimuat.</td></tr>';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const id = document.getElementById('buku-id').value;
        const isEdit = id !== '';
        
        const payload = {
            kategori_id: document.getElementById('kategori_id').value,
            judul: document.getElementById('judul').value,
            penulis: document.getElementById('penulis').value,
            tahun_terbit: document.getElementById('tahun').value
        };

        const url = isEdit ? `/api/buku/${id}` : '/api/buku';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 422) {

                    for (const [field, messages] of Object.entries(result.errors)) {
                        const errEl = document.getElementById(`err-${field}`);
                        if (errEl) errEl.innerText = messages[0];
                    }
                    showAlert('Periksa kembali isian Anda.', 'warning');
                } else {
                    showAlert(result.message || 'Terjadi kesalahan server.', 'danger');
                }
                return;
            }

            showAlert(isEdit ? 'Buku berhasil diubah!' : 'Buku berhasil ditambahkan!', 'success');
            resetForm();
            fetchBuku(); 

        } catch (error) {
            showAlert('Gagal terhubung ke server. Cek koneksi Anda.', 'danger');
        }
    });

    window.editBuku = async (id) => {
        clearErrors();
        try {
            const response = await fetch(`/api/buku/${id}`, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) throw new Error('Gagal mengambil data buku.');
            
            const result = await response.json();
            const buku = result.data;

            document.getElementById('buku-id').value = buku.id;
            document.getElementById('judul').value = buku.judul;
            document.getElementById('penulis').value = buku.penulis;
            document.getElementById('tahun').value = buku.tahun;

            if (buku.kategori === 'Novel') document.getElementById('kategori_id').value = '1';
            else if (buku.kategori === 'Sejarah') document.getElementById('kategori_id').value = '2';
            else if (buku.kategori === 'Filsafat') document.getElementById('kategori_id').value = '3';

            formTitle.innerText = 'Ubah Data Buku';
            btnBatal.classList.remove('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    };

    window.hapusBuku = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) return;

        try {
            const response = await fetch(`/api/buku/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error('Gagal menghapus data.');

            showAlert('Buku berhasil dihapus!', 'success');
            fetchBuku();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    };

    btnBatal.addEventListener('click', resetForm);

    fetchBuku();
});