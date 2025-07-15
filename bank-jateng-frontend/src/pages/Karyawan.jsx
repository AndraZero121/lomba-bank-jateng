import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiDownload } from 'react-icons/fi';
import setBaseUrl from '../utils/service';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from '../components/Header';

export default function Karyawan() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    try {
      const response = await setBaseUrl.get("/karyawan");
      if (response.data.status) {
        setDataKaryawan(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching karyawan:", error);
      Swal.fire('Error', 'Gagal mengambil data karyawan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data karyawan dan akun pengguna terkait akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await setBaseUrl.delete(`/karyawan/${id}`);
          if (response.data.status) {
            Swal.fire(
              'Dihapus!',
              'Data karyawan dan akun pengguna telah dihapus.',
              'success'
            );
            onFetch();
          } else {
            throw new Error(response.data.message);
          }
        } catch (error) {
          console.error("Error deleting karyawan:", error);
          Swal.fire(
            'Gagal!',
            'Terjadi kesalahan saat menghapus data.',
            'error'
          );
        }
      }
    });
  };

  const filteredKaryawan = dataKaryawan.filter(karyawan =>
    karyawan.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    karyawan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (karyawan.nik_ktp && karyawan.nik_ktp.includes(searchTerm)) ||
    (karyawan.npwp && karyawan.npwp.includes(searchTerm))
  );

  // Update Excel export columns to match backend data
  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Karyawan');
      
      worksheet.columns = [
        { header: 'Nama', key: 'nama', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'NIK', key: 'nik', width: 20 },
        { header: 'NPWP', key: 'npwp', width: 25 },
        { header: 'Jabatan', key: 'jabatan', width: 20 },
        { header: 'Departemen', key: 'departemen', width: 20 },
        { header: 'Status PTKP', key: 'status_ptkp', width: 15 },
        { header: 'Tanggal Bergabung', key: 'tanggal_bergabung', width: 20 },
        { header: 'Nomor Rekening', key: 'nomor_rekening', width: 20 },
        { header: 'Nama Bank', key: 'nama_bank', width: 20 },
        { header: 'Status Kepegawaian', key: 'status_kepegawaian', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      
      filteredKaryawan.forEach(item => {
        worksheet.addRow({
          nama: item.nama_lengkap,
          email: item.email,
          nik: item.nik_ktp || '-',
          npwp: item.npwp || '-',
          jabatan: item.jabatan?.nama_jabatan || '-',
          departemen: item.departemen?.nama_departemen || '-',
          status_ptkp: item.status_ptkp || '-',
          tanggal_bergabung: item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-',
          nomor_rekening: item.nomor_rekening || '-',
          nama_bank: item.nama_bank || '-',
          status_kepegawaian: item.status_kepegawaian || '-',
          status: item.is_active ? 'Aktif' : 'Tidak Aktif'
        });
      });
      
      worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2980B9' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Data_Karyawan.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Gagal mengekspor data ke Excel', 'error');
    }
  };

  // Update PDF export to include new fields
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Data Karyawan Bank Jateng Syariah', 14, 15);

    doc.setFontSize(10);
    if (filteredKaryawan.length > 0) {
      const tanggalList = filteredKaryawan
        .filter(k => k.tanggal_bergabung)
        .map(k => new Date(k.tanggal_bergabung))
        .sort((a, b) => a - b);

      if (tanggalList.length > 0) {
        const start = tanggalList[0].toLocaleDateString('id-ID');
        const end = tanggalList[tanggalList.length - 1].toLocaleDateString('id-ID');
        doc.text(`Rentang Tanggal Bergabung: ${start} - ${end}`, 14, 22);
      }
    }

    autoTable(doc, {
      head: [['Nama', 'Email', 'Jabatan', 'Departemen', 'Status PTKP', 'Status Kepegawaian', 'Status']],
      body: filteredKaryawan.map(item => [
        item.nama_lengkap,
        item.email,
        item.jabatan?.nama_jabatan || '-',
        item.departemen?.nama_departemen || '-',
        item.status_ptkp || '-',
        item.status_kepegawaian || '-',
        item.is_active ? 'Aktif' : 'Tidak Aktif'
      ]),
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    });

    doc.setFontSize(10);
    doc.text(`Total Karyawan: ${filteredKaryawan.length}`, 14, doc.lastAutoTable.finalY + 10);

    doc.save('Data_Karyawan.pdf');
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.roles;

  return (
    <div className="karyawan-page">
      <Header />
      <main className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Karyawan</h1>
          <div>
            <button 
              className="btn btn-outline-secondary me-2"
              onClick={exportToExcel}
            >
              <FiDownload className="me-1" /> Excel
            </button>
            <button 
              className="btn btn-outline-secondary me-2"
              onClick={exportToPDF}
            >
              <FiDownload className="me-1" /> PDF
            </button>
            {role === 'Admin' && (
              <Link to="/tambah-karyawan" className="btn btn-primary">
                <FiPlus className="me-1" /> Tambah Karyawan
              </Link>
            )}
          </div>
        </div>

        <div className="search-bar mb-4">
          <div className="input-group">
            <span className="input-group-text">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Cari berdasarkan nama, email, NIK, atau NPWP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-striped table-hover mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th>No</th>
                      <th>Nama Lengkap</th>
                      <th>Email</th>
                      <th>Jabatan</th>
                      <th>Departemen</th>
                      <th>Status PTKP</th>
                      <th>Tanggal Bergabung</th>
                      <th>Status Kepegawaian</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKaryawan.map((karyawan, index) => (
                      <tr key={karyawan.id}>
                        <td>{index + 1}</td>
                        <td>{karyawan.nama_lengkap}</td>
                        <td>{karyawan.email}</td>
                        <td>{karyawan.jabatan?.nama_jabatan || '-'}</td>
                        <td>{karyawan.departemen?.nama_departemen || '-'}</td>
                        <td>{karyawan.status_ptkp || '-'}</td>
                        <td>{karyawan.tanggal_bergabung ? new Date(karyawan.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}</td>
                        <td>{karyawan.status_kepegawaian || '-'}</td>
                        <td>
                          <span className={`badge ${karyawan.is_active ? 'bg-success' : 'bg-danger'}`}>
                            {karyawan.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td>
                          {role === 'Admin' && (
                            <>
                              <button
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => navigate(`/edit-karyawan/${karyawan.id}`)}
                              >
                                <FiEdit />
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => onDelete(karyawan.id)}
                              >
                                <FiTrash2 />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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

      <style jsx>{`
        .karyawan-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #f8f9fa;
        }
        .navbar-brand .fw-bold {
          color: #212529 !important;
        }
        .search-bar {
          max-width: 500px;
        }
        .table th {
          font-weight: 600;
          white-space: nowrap;
        }
        .table td {
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
}
