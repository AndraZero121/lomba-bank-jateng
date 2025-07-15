import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiTrash2, FiSearch } from 'react-icons/fi';
import setBaseUrl from '../utils/service';
import Swal from 'sweetalert2';
import Header from '../components/Header';

export default function Payroll() {
  const [dataPayroll, setDataPayroll] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayrollRuns();
  }, []);

  const isLoggedIn = () => {
    return localStorage.getItem('token');
  };

  if (!isLoggedIn()) {
    return <Navigate to='/' />;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.roles;

  const fetchPayrollRuns = async () => {
    try {
      setIsLoading(true);
      const response = await setBaseUrl.get('/payroll-run');
      setDataPayroll(response.data.data);
    } catch (error) {
      console.error("Error fetching payroll runs:", error);
      Swal.fire('Error', 'Gagal memuat data payroll', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data payroll yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await setBaseUrl.delete(`/payroll-run/${id}`);
          Swal.fire('Dihapus!', 'Data payroll telah dihapus.', 'success');
          fetchPayrollRuns();
        } catch (error) {
          console.error("Error deleting payroll run:", error);
          Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
        }
      }
    });
  };

  const filteredPayroll = dataPayroll.filter(item => {
    if (!item) return false;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (item.periode_gaji && item.periode_gaji.toLowerCase().includes(searchTermLower)) ||
      (item.status && item.status.toLowerCase().includes(searchTermLower))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-secondary';
      case 'Final':
        return 'bg-primary';
      case 'Approve':
        return 'bg-success';
      case 'Failed':
        return 'bg-danger';
      default:
        return 'bg-dark';
    }
  };

  return (
    <div className="payroll-page">
      <Header />
      <main className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Manajemen Payroll</h1>
          {role === 'Admin' && (
            <Link to="/tambah-payroll" className="btn btn-primary">
              <FiPlus className="me-1" /> Buat Payroll Run
            </Link>
          )}
        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <span className="input-group-text border-0 bg-light">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control border-0 bg-light"
                placeholder="Cari (periode, status)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body p-0">
            {isLoading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Periode Gaji</th>
                      <th>Tanggal Eksekusi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayroll.length > 0 ? (
                      filteredPayroll.map((item) => (
                        <tr key={item.id}>
                          <td>{item.periode_gaji}</td>
                          <td>{new Date(item.tanggal_eksekusi).toLocaleDateString('id-ID')}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-secondary me-2" 
                              title="Lihat Detail"
                              onClick={() => navigate(`/payroll/${item.id}`)}
                            >
                              <FiEye />
                            </button>
                            {role === 'Admin' && (
                              <button 
                                className="btn btn-sm btn-outline-danger" 
                                title="Hapus"
                                onClick={() => handleDelete(item.id)}
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          Tidak ada data payroll ditemukan.
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

        <footer className="bg-white border-top py-4 position-relative">
        <div className="container text-center">
          <p className="text-muted mb-1">
            &copy; 2025 <span className="text-primary fw-semibold">Bank Jateng Syariah</span>
          </p>
          <p className="small text-muted">
            Developed with <i className="bi bi-heart-fill text-danger mx-1"></i> by <span className="text-primary">Sipena Dev</span>
          </p>
        </div>
      </footer>

    </div>
  );
} 