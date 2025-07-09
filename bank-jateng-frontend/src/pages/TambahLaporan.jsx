import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiDollarSign, FiSave, FiPlus, FiShield, FiHash, FiFileText } from 'react-icons/fi';
import setBaseUrl from '../utils/service';
import Swal from 'sweetalert2';

export default function TambahLaporan() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id_karyawan: '',
    id_payroll_run: '',
    gaji_pokok: '',
    total_tunjangan: '',
    total_potongan: '',
    pph21_terpotong: '',
    total_iuran_bpjs_kesehatan: '',
    detail_json: '',
  });
  const [karyawanList, setKaryawanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        setIsLoading(true);
        const response = await setBaseUrl.get('/karyawan');
        setKaryawanList(response.data.data || []);
      } catch (error) {
        console.error("Error fetching karyawan:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal memuat data karyawan',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchKaryawan();
  }, []);

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  if (!isLoggedIn()) {
    return <Navigate to='/' />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newGajiPokok = form.gaji_pokok;

    if (name === 'id_karyawan') {
        const selectedKaryawan = karyawanList.find(k => k.id.toString() === value);
        if(selectedKaryawan) {
            newGajiPokok = selectedKaryawan.gaji_pokok || '';
        }
    }
    setForm(prev => ({ 
        ...prev, 
        [name]: value,
        gaji_pokok: name === 'id_karyawan' ? newGajiPokok : prev.gaji_pokok
    }));
  };

  const calculateTotal = () => {
    const gaji = parseFloat(form.gaji_pokok) || 0;
    const tunjangan = parseFloat(form.total_tunjangan) || 0;
    const potongan = parseFloat(form.total_potongan) || 0;
    const pph21 = parseFloat(form.pph21_terpotong) || 0;
    const bpjs = parseFloat(form.total_iuran_bpjs_kesehatan) || 0;
    const thp = gaji + tunjangan - potongan - pph21 - bpjs;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(thp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.id_karyawan || !form.id_payroll_run) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Harap pilih karyawan dan isi ID Payroll Run.',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const payload = {
        ...form,
        gaji_pokok: parseFloat(form.gaji_pokok) || 0,
        total_tunjangan: parseFloat(form.total_tunjangan) || 0,
        total_potongan: parseFloat(form.total_potongan) || 0,
        pph21_terpotong: parseFloat(form.pph21_terpotong) || 0,
        total_iuran_bpjs_kesehatan: parseFloat(form.total_iuran_bpjs_kesehatan) || 0,
      };
      
      // Validasi JSON sebelum kirim
      if (payload.detail_json) {
        try {
          JSON.parse(payload.detail_json);
        } catch (jsonError) {
          Swal.fire({
            icon: 'error',
            title: 'JSON Tidak Valid',
            text: 'Format data pada field Detail JSON tidak valid.',
            confirmButtonText: 'OK'
          });
          return;
        }
      } else {
        delete payload.detail_json; // jangan kirim string kosong jika tidak diisi
      }

      await setBaseUrl.post('/slip-gaji', payload);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Laporan gaji berhasil dibuat',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/laporan');
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Gagal membuat laporan',
        confirmButtonText: 'OK'
      });
    }
  };


  return (
    <div className="buat-laporan-page bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        {/* ... same navbar ... */}
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/dashboard">
           <img
                  src="/bank_jateng.png"  // ✅ garis miring depan penting!
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
            onClick={() => navigate('/laporan')}
          >
            <FiArrowLeft />
          </button>
          <h1 className="h4 mb-0">Buat Laporan Gaji Baru</h1>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <form onSubmit={handleSubmit}>
              <div className="card shadow-sm">
                <div className="card-header p-3">
                    <h5 className="mb-0">Informasi Dasar</h5>
                </div>
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-md-8">
                      <label className="form-label fw-bold"><FiUser className="me-2" />Pilih Karyawan<span className="text-danger ms-1">*</span></label>
                      {isLoading ? (
                        <div className="text-center py-2"><div className="spinner-border spinner-border-sm" role="status"></div></div>
                      ) : (
                        <select className="form-select" name="id_karyawan" value={form.id_karyawan} onChange={handleChange} required>
                          <option value="">-- Pilih Karyawan --</option>
                          {karyawanList.map(k => <option key={k.id} value={k.id}>{k.nama_lengkap} ({k.jabatan?.nama_jabatan})</option>)}
                        </select>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold"><FiHash className="me-2" />ID Payroll Run<span className="text-danger ms-1">*</span></label>
                      <input type="text" className="form-control" name="id_payroll_run" value={form.id_payroll_run} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mt-4">
                {/* Earnings Column */}
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-header p-3"><h5 className="mb-0">Pendapatan</h5></div>
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold"><FiDollarSign className="me-2" />Gaji Pokok</label>
                                <input type="number" className="form-control" name="gaji_pokok" value={form.gaji_pokok} onChange={handleChange} placeholder="Otomatis terisi" readOnly/>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold"><FiPlus className="me-2" />Total Tunjangan</label>
                                <input type="number" className="form-control" name="total_tunjangan" value={form.total_tunjangan} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deductions Column */}
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-header p-3"><h5 className="mb-0">Potongan</h5></div>
                        <div className="card-body p-4">
                             <div className="mb-3">
                                <label className="form-label fw-bold"><FiShield className="me-2" />Potongan Lain-lain</label>
                                <input type="number" className="form-control" name="total_potongan" value={form.total_potongan} onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold"><FiShield className="me-2" />PPH21 Terpotong</label>
                                <input type="number" className="form-control" name="pph21_terpotong" value={form.pph21_terpotong} onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold"><FiShield className="me-2" />Iuran BPJS Kesehatan</label>
                                <input type="number" className="form-control" name="total_iuran_bpjs_kesehatan" value={form.total_iuran_bpjs_kesehatan} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Summary and Submit */}
              <div className="card shadow-sm mt-4">
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Take Home Pay (THP)</h5>
                    <h3 className="fw-bold text-primary mb-0">{calculateTotal()}</h3>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg">
                    <FiSave className="me-2" /> Simpan & Buat Slip Gaji
                  </button>
                </div>
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