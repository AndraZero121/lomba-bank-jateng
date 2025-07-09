import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiBriefcase, FiCreditCard, FiDollarSign, FiCalendar, FiHome, FiTrendingUp, FiCheckSquare, FiFileText, FiPhone, FiMail } from 'react-icons/fi';
import setBaseUrl from '../utils/service';
import Swal from 'sweetalert2';

export default function TambahKaryawan() {
  const navigate = useNavigate();
  const [jabatans, setJabatans] = useState([]);
  const [departemens, setDepartemens] = useState([]);
  const [form, setForm] = useState({
    nama_lengkap: "",
    id_jabatan: "",
    id_departemen: "",
    nik_ktp: "",
    npwp: "",
    status_ptkp: "",
    tanggal_bergabung: "",
    gaji_pokok: "",
    nomor_rekening: "",
    nama_bank: "",
    status_kepegawaian: "Tetap",
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jabatanRes, departemenRes] = await Promise.all([
          setBaseUrl.get('/jabatan'),
          setBaseUrl.get('/departemen')
        ]);
        setJabatans(jabatanRes.data.data);
        setDepartemens(departemenRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  if (!isLoggedIn()) {
    return <Navigate to='/' />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setBaseUrl.post("/karyawan", form);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data karyawan berhasil ditambahkan',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/karyawan');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Gagal menambahkan karyawan',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="tambah-karyawan-page bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/dashboard">
            <img
              src="bank_jateng.png"
              alt="Logo"
              width="60"
              height="40"
              className="d-inline-block align-text-top me-2"
            />
            <span className="fw-bold">Bank Jateng Syariah</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container py-5">
        <div className="d-flex align-items-center mb-4">
          <button 
            className="btn btn-light border me-3"
            onClick={() => navigate('/karyawan')}
          >
            <FiArrowLeft />
          </button>
          <h1 className="h4 mb-0">Tambah Karyawan Baru</h1>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit} className="row g-3">
              
              {/* Left Column */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold"><FiUser className="me-2" />Nama Lengkap</label>
                  <input type="text" className="form-control" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} required />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold"><FiBriefcase className="me-2" />Jabatan</label>
                  <select className="form-select" name="id_jabatan" value={form.id_jabatan} onChange={handleChange} required>
                    <option value="">Pilih Jabatan</option>
                    {jabatans.map(j => <option key={j.id} value={j.id}>{j.nama_jabatan}</option>)}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold"><FiHome className="me-2" />Departemen</label>
                  <select className="form-select" name="id_departemen" value={form.id_departemen} onChange={handleChange} required>
                    <option value="">Pilih Departemen</option>
                    {departemens.map(d => <option key={d.id} value={d.id}>{d.nama_departemen}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold"><FiCreditCard className="me-2" />NIK KTP</label>
                  <input type="text" className="form-control" name="nik_ktp" value={form.nik_ktp} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold"><FiFileText className="me-2" />NPWP</label>
                  <input type="text" className="form-control" name="npwp" value={form.npwp} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold"><FiTrendingUp className="me-2" />Status PTKP</label>
                  <input type="text" className="form-control" name="status_ptkp" value={form.status_ptkp} onChange={handleChange} />
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold"><FiCalendar className="me-2" />Tanggal Bergabung</label>
                  <input type="date" className="form-control" name="tanggal_bergabung" value={form.tanggal_bergabung} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold"><FiDollarSign className="me-2" />Gaji Pokok</label>
                  <input type="number" className="form-control" name="gaji_pokok" value={form.gaji_pokok} onChange={handleChange} />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold"><FiCreditCard className="me-2" />Nomor Rekening</label>
                  <input type="text" className="form-control" name="nomor_rekening" value={form.nomor_rekening} onChange={handleChange} />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold"><FiCreditCard className="me-2" />Nama Bank</label>
                  <input type="text" className="form-control" name="nama_bank" value={form.nama_bank} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold"><FiBriefcase className="me-2" />Status Kepegawaian</label>
                  <select className="form-select" name="status_kepegawaian" value={form.status_kepegawaian} onChange={handleChange}>
                    <option value="Tetap">Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Harian">Harian</option>
                  </select>
                </div>
                
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" name="is_active" id="isActiveSwitch" checked={form.is_active} onChange={handleChange} />
                  <label className="form-check-label fw-bold" htmlFor="isActiveSwitch"><FiCheckSquare className="me-2" />Status Aktif</label>
                </div>
              </div>

              <div className="col-12 d-grid mt-4">
                <button type="submit" className="btn btn-primary py-2">
                  Simpan Karyawan
                </button>
              </div>
            </form>
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

    </div>
  );
}