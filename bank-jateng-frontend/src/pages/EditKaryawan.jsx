import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiBriefcase, FiCreditCard, FiDollarSign, FiCalendar, FiHome, FiTrendingUp, FiCheckSquare, FiFileText, FiMail } from 'react-icons/fi';
import setBaseUrl from '../utils/service';
import Swal from 'sweetalert2';

export default function EditKaryawan() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [jabatans, setJabatans] = useState([]);
  const [departemens, setDepartemens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [form, setForm] = useState({
    email: "",
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
        const [karyawanRes, jabatanRes, departemenRes] = await Promise.all([
          setBaseUrl.get(`/karyawan/${id}`),
          setBaseUrl.get('/jabatan'),
          setBaseUrl.get('/departemen')
        ]);
        
        if (!karyawanRes.data.status) {
          throw new Error(karyawanRes.data.message);
        }
        
        const karyawanData = karyawanRes.data.data;
        setInitialData(karyawanData);
        
        // Membersihkan data dan hanya mengambil field yang diperlukan untuk form
        const cleanData = {
            email: karyawanData.email || "",
            nama_lengkap: karyawanData.nama_lengkap || "",
            id_jabatan: karyawanData.id_jabatan || "",
            id_departemen: karyawanData.id_departemen || "",
            nik_ktp: karyawanData.nik_ktp || "",
            npwp: karyawanData.npwp || "",
            status_ptkp: karyawanData.status_ptkp || "",
            tanggal_bergabung: karyawanData.tanggal_bergabung ? new Date(karyawanData.tanggal_bergabung).toISOString().split('T')[0] : "",
            gaji_pokok: karyawanData.gaji_pokok || "",
            nomor_rekening: karyawanData.nomor_rekening || "",
            nama_bank: karyawanData.nama_bank || "",
            status_kepegawaian: karyawanData.status_kepegawaian || "Tetap",
            is_active: karyawanData.is_active,
        };

        setForm(cleanData);
        setJabatans(jabatanRes.data.data);
        setDepartemens(departemenRes.data.data);

      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Gagal memuat data untuk diedit',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/karyawan');
        });
      }
    };

    fetchData();
  }, [id, navigate]);

  const isLoggedIn = () => {
    return localStorage.getItem('token');
  };

  if (!isLoggedIn()) {
    return <Navigate to='/' />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only send changed fields to match backend's 'sometimes' validation
      const changedData = {};
      Object.keys(form).forEach(key => {
        if (form[key] !== initialData[key]) {
          changedData[key] = form[key];
        }
      });

      const response = await setBaseUrl.put(`/karyawan/${id}`, changedData);
      
      if (response.data.status) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data karyawan berhasil diperbarui',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/karyawan');
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || error.response?.data?.error || 'Gagal memperbarui data karyawan',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-karyawan-page bg-light min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/dashboard">
            <img src="/bank_jateng.png" alt="Logo" width="60" height="40" className="d-inline-block align-text-top me-2" />
            <span className="fw-bold">Bank Jateng Syariah</span>
          </Link>
        </div>
      </nav>

      <main className="container py-5">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-light border me-3" onClick={() => navigate('/karyawan')}>
            <FiArrowLeft />
          </button>
          <h1 className="h4 mb-0">Edit Karyawan</h1>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit} className="row g-3">
              {/* Left Column */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiUser className="me-2" />Nama Lengkap
                    <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="nama_lengkap" 
                    value={form.nama_lengkap} 
                    onChange={handleChange} 
                    required 
                    maxLength={255}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiMail className="me-2" />Email
                    <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="email" 
                    className="form-control" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    maxLength={255}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiBriefcase className="me-2" />Jabatan
                    <span className="text-danger">*</span>
                  </label>
                  <select 
                    className="form-select" 
                    name="id_jabatan" 
                    value={form.id_jabatan} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Pilih Jabatan</option>
                    {jabatans.map(j => <option key={j.id} value={j.id}>{j.nama_jabatan}</option>)}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiHome className="me-2" />Departemen
                    <span className="text-danger">*</span>
                  </label>
                  <select 
                    className="form-select" 
                    name="id_departemen" 
                    value={form.id_departemen} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Pilih Departemen</option>
                    {departemens.map(d => <option key={d.id} value={d.id}>{d.nama_departemen}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiCreditCard className="me-2" />NIK KTP
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="nik_ktp" 
                    value={form.nik_ktp} 
                    onChange={handleChange}
                    maxLength={16}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiFileText className="me-2" />NPWP
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="npwp" 
                    value={form.npwp} 
                    onChange={handleChange}
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiTrendingUp className="me-2" />Status PTKP
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="status_ptkp" 
                    value={form.status_ptkp} 
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiCalendar className="me-2" />Tanggal Bergabung
                  </label>
                  <input 
                    type="date" 
                    className="form-control" 
                    name="tanggal_bergabung" 
                    value={form.tanggal_bergabung} 
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiDollarSign className="me-2" />Gaji Pokok
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="gaji_pokok" 
                    value={form.gaji_pokok} 
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiCreditCard className="me-2" />Nomor Rekening
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="nomor_rekening" 
                    value={form.nomor_rekening} 
                    onChange={handleChange}
                    maxLength={50}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiCreditCard className="me-2" />Nama Bank
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="nama_bank" 
                    value={form.nama_bank} 
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <FiBriefcase className="me-2" />Status Kepegawaian
                  </label>
                  <select 
                    className="form-select" 
                    name="status_kepegawaian" 
                    value={form.status_kepegawaian} 
                    onChange={handleChange}
                  >
                    <option value="Tetap">Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Harian">Harian</option>
                  </select>
                </div>
                
                <div className="form-check form-switch mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    name="is_active" 
                    id="isActiveSwitch" 
                    checked={form.is_active} 
                    onChange={handleChange} 
                  />
                  <label className="form-check-label fw-bold" htmlFor="isActiveSwitch">
                    <FiCheckSquare className="me-2" />Status Aktif
                  </label>
                </div>
              </div>

              <div className="col-12 d-grid mt-4">
                <button 
                  type="submit" 
                  className="btn btn-primary py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Menyimpan...
                    </>
                  ) : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-4 bg-light border-top">
        <div className="container">
          <p className="mb-1 text-center fw-semibold text-muted">
            &copy; 2025 <span className="text-primary">SMK Palapa Semarang</span>. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        .form-label {
          font-size: 0.9rem;
        }
        .text-danger {
          font-weight: bold;
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
}
