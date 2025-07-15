import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiBriefcase, FiCreditCard, FiDollarSign, FiCalendar, FiHome, FiTrendingUp, FiCheckSquare, FiFileText, FiPhone, FiMail, FiChevronDown, FiLogOut, FiUsers } from 'react-icons/fi';
import setBaseUrl from '../utils/service';
import Swal from 'sweetalert2';
import Header from '../components/Header';

export default function TambahKaryawan() {
  const navigate = useNavigate();
  const [jabatans, setJabatans] = useState([]);
  const [departemens, setDepartemens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'Admin User', email: 'admin@bankjateng.com' });
  const [form, setForm] = useState({
    email: "", // Add required email field
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal mengambil data jabatan dan departemen',
        });
      }
    };
    fetchData();

    // Set current user from localStorage if available
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.name && userData.email) {
        setCurrentUser({ name: userData.name, email: userData.email });
      } else if (userData && userData.name) {
        setCurrentUser({ name: userData.name, email: '' });
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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

  const handleLogout = () => {
    Swal.fire({
      title: 'Konfirmasi Logout',
      text: "Apakah Anda yakin ingin keluar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('name');
        Swal.fire({
          title: 'Berhasil Logout',
          text: 'Anda telah berhasil keluar dari sistem.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/');
        });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await setBaseUrl.post("/karyawan", form);
      
      if (response.data.status) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data karyawan berhasil ditambahkan. Password akun telah dikirim ke email karyawan.',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/karyawan');
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Gagal menambahkan karyawan';
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tambah-karyawan-page bg-light min-vh-100 d-flex flex-column">
      <Header />

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
                  <small className="text-muted">
                    Email ini akan digunakan untuk login dan menerima password akun
                  </small>
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
                    value={form.npwp} onChange={handleChange}
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
                  ) : 'Simpan Karyawan'}
                </button>
              </div>
            </form>
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

      <style jsx>{`
        .tambah-karyawan-page {
          background-color: #f8f9fa;
        }
        .form-label {
          font-size: 0.9rem;
        }
        .text-danger {
          font-weight: bold;
          margin-left: 4px;
        }
        .avatar-profile {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          font-size: 0.9rem;
          font-weight: bold;
        }
        .transition-transform {
          transition: transform 0.2s ease;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
        .dropdown-menu {
          border-radius: 12px;
          padding: 0.5rem 0;
        }
        .dropdown-item {
          border-radius: 8px;
          margin: 0 0.5rem;
          padding: 0.5rem 1rem;
        }
        .dropdown-item:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}