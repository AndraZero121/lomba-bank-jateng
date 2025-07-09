import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiSave, FiX, FiBriefcase } from 'react-icons/fi';
import setBaseUrl from '../utils/service';
import Swal from 'sweetalert2';
import Header from '../components/Header';

export default function Jabatan() {
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editNama, setEditNama] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.roles;

  // Fetch data jabatan
  useEffect(() => {
    const fetchJabatan = async () => {
      try {
        setIsLoading(true);
        const response = await setBaseUrl.get('/jabatan');
        setJabatan(response.data.data || []);
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal memuat data jabatan',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchJabatan();
  }, []);

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  if (!isLoggedIn()) {
    return <Navigate to='/' />;
  }

  const onSubmit = async () => {
    if (!nama.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Nama jabatan tidak boleh kosong',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const response = await setBaseUrl.post('/jabatan', {
        nama_jabatan: nama.trim()
      });

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Jabatan berhasil ditambahkan',
          confirmButtonText: 'OK'
        });
        setNama('');
        setShowForm(false);
        // Fetch data terbaru setelah tambah
        const res = await setBaseUrl.get('/jabatan');
        setJabatan(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Gagal menambahkan jabatan',
        confirmButtonText: 'OK'
      });
    }
  };

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data jabatan akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const response = await setBaseUrl.delete(`/jabatan/${id}`);
        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Jabatan berhasil dihapus',
            confirmButtonText: 'OK'
          });
          setJabatan(jabatan.filter(item => item.id !== id));
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: error.response?.data?.message || 'Gagal menghapus jabatan',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const onEdit = (item) => {
    setEditId(item.id);
    setEditNama(item.nama_jabatan);
  };

  const onUpdate = async () => {
    if (!editNama.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Nama jabatan tidak boleh kosong',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const response = await setBaseUrl.put(`/jabatan/${editId}`, {
        nama_jabatan: editNama.trim()
      });
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Jabatan berhasil diupdate',
          confirmButtonText: 'OK'
        });
        setEditId(null);
        setEditNama('');
        // Fetch data terbaru setelah update
        const res = await setBaseUrl.get('/jabatan');
        setJabatan(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Gagal mengupdate jabatan',
        confirmButtonText: 'OK'
      });
    }
  };

  const onCancelEdit = () => {
    setEditId(null);
    setEditNama('');
  };

  const filteredJabatan = jabatan.filter(jabatan =>
    jabatan.nama_jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="jabatan-page">
      <Header />
      <main className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Manajemen Jabatan</h1>
          {role === 'Admin' && (
            <button
              type='button'
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              <FiPlus className="me-1" /> {showForm ? 'Tutup Form' : 'Tambah Jabatan'}
            </button>
          )}
        </div>

        {/* Search and Add Form */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="input-group">
              <span className="input-group-text">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Cari jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {showForm && (
            <div className="col-md-6">
              <div className="card">
                <div className="card-body p-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nama Jabatan Baru"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={onSubmit}
                    >
                      <FiSave className="me-1" /> Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Positions Table */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Memuat data jabatan...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th width="5%">No</th>
                      <th>Nama Jabatan</th>
                      <th width="20%">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJabatan.length > 0 ? (
                      filteredJabatan.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            {editId === item.id ? (
                              <input
                                type="text"
                                className="form-control"
                                value={editNama}
                                onChange={(e) => setEditNama(e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-light rounded-circle me-2">
                                  <FiBriefcase className="avatar-icon" />
                                </div>
                                <div>
                                  <h6 className="mb-0">{item.nama_jabatan}</h6>
                                  <small className="text-muted">ID: {item.id}</small>
                                </div>
                              </div>
                            )}
                          </td>
                          <td>
                            {role === 'Admin' && (
                              <div className="d-flex">
                                {editId === item.id ? (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-success btn-sm me-2"
                                      onClick={onUpdate}
                                    >
                                      <FiSave className="me-1" /> Simpan
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      onClick={onCancelEdit}
                                    >
                                      <FiX /> Batal
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-warning btn-sm me-2"
                                      onClick={() => onEdit(item)}
                                    >
                                      <FiEdit2 className="me-1" /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => onDelete(item.id)}
                                    >
                                      <FiTrash2 className="me-1" /> Hapus
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          {searchTerm ? 'Tidak ditemukan jabatan dengan nama tersebut' : 'Belum ada data jabatan'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

         <footer className="text-center mt-auto py-4 bg-light border-top">
        <div className="container">
          <p className="mb-1 fw-semibold text-muted">
            &copy; 2025 <span className="text-primary">SMK Palapa Semarang</span>. All rights reserved.
          </p>
        </div>
      </footer>


      <style jsx>{`
        .jabatan-page {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #ddd;
          object-fit: cover;
        }
        .avatar-sm {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-icon {
          font-size: 1rem;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
        }
        .card {
          border: none;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}