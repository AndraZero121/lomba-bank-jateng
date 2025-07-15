import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiDownload, FiPrinter, FiSearch, FiUser, FiTrash2 } from 'react-icons/fi';
import setBaseUrl from '../utils/service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import Header from '../components/Header';

export default function Laporan() {
  const [dataLaporan, setDataLaporan] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onFetch();
  }, []);

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  if (!isLoggedIn()) {
    return <Navigate to='/' />;
  }

  const onFetch = async () => {
    try {
      setIsLoading(true);
      const response = await setBaseUrl.get("/slip-gaji", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDataLaporan(response.data.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredLaporan = dataLaporan.filter(laporan =>
    laporan.karyawan.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data laporan akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await setBaseUrl.delete(`/slip-gaji/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Laporan berhasil dihapus',
          confirmButtonText: 'OK'
        });
        onFetch();
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: error.response?.data?.message || 'Gagal menghapus laporan',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handlePrint = (report) => {
    const doc = new jsPDF();
    const now = new Date();
    const tanggalCetak = now.toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SLIP GAJI KARYAWAN', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('PT Bank Jateng Syariah', 105, 30, { align: 'center' });
    // Tanggal cetak
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${tanggalCetak}`, 14, 38);
    // Periode from created_at as fallback
    const periode = new Date(report.created_at);
    const month = periode.toLocaleString('id-ID', { month: 'long' });
    const year = periode.getFullYear();
    doc.setFontSize(12);
    doc.text(`Periode: ${month} ${year}`, 14, 45);
    doc.line(14, 47, 196, 47);
    // Employee Details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Nama Karyawan', 14, 55);
    doc.text(`: ${report.karyawan.nama_lengkap}`, 60, 55);
    doc.text('NIK', 14, 61);
    doc.text(`: ${report.karyawan.nik_ktp}`, 60, 61);
    doc.text('Jabatan', 14, 67);
    doc.text(`: ${report.karyawan.jabatan?.nama_jabatan || '-'}`, 60, 67);
    // Earnings
    autoTable(doc, {
      startY: 75,
      head: [['Pendapatan', 'Jumlah']],
      body: [
        ['Gaji Pokok', formatCurrency(report.gaji_pokok)],
        ['Tunjangan', formatCurrency(report.total_tunjangan)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], textColor: 30 },
      columnStyles: { 1: { halign: 'right' } }
    });
    let finalY = doc.lastAutoTable.finalY;
    // Deductions
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Potongan', 'Jumlah']],
      body: [
        ['Pajak (PPH21)', formatCurrency(report.pph21_terpotong)],
        ['BPJS Kesehatan', formatCurrency(report.total_iuran_bpjs_kesehatan)],
        ['Potongan Lain', formatCurrency(report.total_potongan)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], textColor: 30 },
      columnStyles: { 1: { halign: 'right' } }
    });
    finalY = doc.lastAutoTable.finalY;
    // Totals
    const gaji_pokok = parseFloat(report.gaji_pokok) || 0;
    const total_tunjangan = parseFloat(report.total_tunjangan) || 0;
    const total_potongan = parseFloat(report.total_potongan) || 0;
    const pph21_terpotong = parseFloat(report.pph21_terpotong) || 0;
    const total_iuran_bpjs_kesehatan = parseFloat(report.total_iuran_bpjs_kesehatan) || 0;
    const totalPendapatan = gaji_pokok + total_tunjangan;
    const totalPotongan = total_potongan + pph21_terpotong + total_iuran_bpjs_kesehatan;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Pendapatan', 14, finalY + 8);
    doc.text(formatCurrency(totalPendapatan), 196, finalY + 8, { align: 'right' });
    doc.text('Total Potongan', 14, finalY + 14);
    doc.text(formatCurrency(totalPotongan), 196, finalY + 14, { align: 'right' });
    // Take Home Pay
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.rect(14, finalY + 18, 182, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('PENERIMAAN BERSIH (THP)', 18, finalY + 24);
    doc.text(formatCurrency(report.thp), 196, finalY + 24, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    // Footer/garis
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 32, 196, finalY + 32);
    doc.setFontSize(9);
    doc.text('Dicetak otomatis oleh sistem Bank Jateng Syariah', 14, finalY + 38);
    doc.save(`SlipGaji_${report.karyawan.nama_lengkap}_${month}${year}.pdf`);
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.roles;

  return (
    <div className="laporan-page">
      <Header />
      <main className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Laporan Gaji Karyawan</h1>
          <div>
            {role === 'Admin' && (
              <Link to="/laporan/tambah-laporan" className="btn btn-primary">
                Buat Laporan Baru
              </Link>
            )}
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="input-group">
                  <span className="input-group-text">
                    <FiSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari berdasarkan nama karyawan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>No</th>
                    <th>Nama Karyawan</th>
                    <th>Jabatan</th>
                    <th>Periode</th>
                    <th>Gaji Pokok</th>
                    <th>Tunjangan</th>
                    <th>Potongan</th>
                    <th>THP</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLaporan.length > 0 ? (
                    filteredLaporan.map((item, index) => {
                      const periode = new Date(item.created_at);
                      const month = periode.toLocaleString('id-ID', { month: 'long' });
                      const year = periode.getFullYear();
                      const totalPotongan = 
                        (parseFloat(item.total_potongan) || 0) + 
                        (parseFloat(item.pph21_terpotong) || 0) + 
                        (parseFloat(item.total_iuran_bpjs_kesehatan) || 0);

                      return (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-light rounded-circle me-2">
                                <FiUser className="avatar-icon" />
                              </div>
                              <div>
                                <h6 className="mb-0">{item.karyawan.nama_lengkap}</h6>
                                <small className="text-muted">{item.karyawan.nik_ktp}</small>
                              </div>
                            </div>
                          </td>
                          <td>{item.karyawan.jabatan?.nama_jabatan || '-'}</td>
                          <td>{`${month} ${year}`}</td>
                          <td>{formatCurrency(item.gaji_pokok)}</td>
                          <td>{formatCurrency(item.total_tunjangan)}</td>
                          <td>{formatCurrency(totalPotongan)}</td>
                          <td><strong>{formatCurrency(item.thp)}</strong></td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() => handlePrint(item)}
                              title="Cetak Slip Gaji"
                            >
                              <FiPrinter />
                            </button>
                            {role === 'Admin' && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => onDelete(item.id)}
                                title="Hapus Laporan"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-5">
                        <p className="mb-0">Tidak ada data laporan yang ditemukan.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
        .laporan-page {
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