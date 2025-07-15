import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiSave, FiFileText, FiActivity, FiTag } from 'react-icons/fi';
import setBaseUrl from '../utils/service';
import Swal from 'sweetalert2';
import Header from '../components/Header';

export default function TambahPayroll() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    periode_gaji: '',
    tanggal_eksekusi: new Date().toISOString().slice(0, 10),
    status: 'Draft',
    dieksekusi_oleh: 1, // Placeholder for user ID
  });

  const isLoggedIn = () => {
    return localStorage.getItem('token');
  };

  if (!isLoggedIn()) {
    return <Navigate to='/' />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setBaseUrl.post('/payroll-run', form);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Payroll run berhasil dibuat',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/payroll');
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Gagal membuat payroll run',
        confirmButtonText: 'OK'
      });
    }
  };

  const statusOptions = ['Draft', 'Final', 'Approve', 'Failed'];

  return (
    <div className="tambah-payroll-page">
      <Header />
      <main className="container py-4">
        <div className="d-flex align-items-center mb-4">
          <button 
            className="btn btn-outline-secondary me-3"
            onClick={() => navigate('/payroll')}
          >
            <FiArrowLeft />
          </button>
          <h1 className="h3 mb-0">Buat Payroll Run Baru</h1>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold"><FiTag className="me-2" />Periode Gaji</label>
                    <input 
                      type="text"
                      className="form-control"
                      name="periode_gaji"
                      value={form.periode_gaji}
                      onChange={handleChange}
                      placeholder="Contoh: Juni 2024"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold"><FiCalendar className="me-2" />Tanggal Eksekusi</label>
                    <input 
                      type="date"
                      className="form-control"
                      name="tanggal_eksekusi"
                      value={form.tanggal_eksekusi}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold"><FiActivity className="me-2" />Status</label>
                    <select className="form-select" name="status" value={form.status} onChange={handleChange} required>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary py-2">
                      <FiSave className="me-2" /> Simpan & Mulai Payroll
                    </button>
                  </div>
                </form>
              </div>
            </div>
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