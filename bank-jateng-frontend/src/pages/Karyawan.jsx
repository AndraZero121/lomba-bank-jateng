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
      const response = await setBaseUrl.get("/karyawan");
      setDataKaryawan(response.data.data);
    } catch (error) {
      console.error("Error fetching karyawan:", error);
    }
  };

  const onDelete = (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await setBaseUrl.delete(`/karyawan/${id}`);
          Swal.fire(
            'Dihapus!',
            'Data karyawan telah dihapus.',
            'success'
          );
          onFetch();
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
    karyawan.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Karyawan');
      
      worksheet.columns = [
        { header: 'Nama', key: 'nama', width: 25 },
        { header: 'Jabatan', key: 'id_jabatan', width: 20 },
        { header: 'Departemen', key: 'id_departemen', width: 20 },
        { header: 'Tanggal Bergabung', key: 'tanggal_bergabung', width: 20 },
        { header: 'Status Kepegawaian', key: 'status_kepegawaian', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      
      filteredKaryawan.forEach(item => {
        worksheet.addRow({
          nama: item.nama_lengkap,
          jabatan: item.jabatan?.nama_jabatan || '-',
          departemen: item.departemen?.nama_departemen || '-',
          tanggal_bergabung: item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-',
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

  // Fungsi Export PDF yang sudah diperbarui dengan rentang tanggal dan total karyawan
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Judul
    doc.setFontSize(18);
    doc.text('Data Karyawan Bank Jateng Syariah', 14, 15);

    // Rentang tanggal bergabung
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
      } else {
        doc.text('Tanggal bergabung tidak tersedia', 14, 22);
      }
    } else {
      doc.text('Tidak ada data karyawan', 14, 22);
    }

    // Tabel data karyawan
    autoTable(doc, {
      head: [['Nama', 'Jabatan', 'Departemen', 'Tanggal Bergabung', 'Status Kepegawaian', 'Status']],
      body: filteredKaryawan.map(item => [
        item.nama_lengkap,
        item.jabatan?.nama_jabatan || '-',
        item.departemen?.nama_departemen || '-',
        item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-',
        item.status_kepegawaian || '-',
        item.is_active ? 'Aktif' : 'Tidak Aktif'
      ]),
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    });

    // Total karyawan di bawah tabel
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
              placeholder="Cari Karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>No</th>
                    <th>Nama Lengkap</th>
                    <th>Jabatan</th>
                    <th>Departemen</th>
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
                      <td>{karyawan.jabatan?.nama_jabatan || '-'}</td>
                      <td>{karyawan.departemen?.nama_departemen || '-'}</td>
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
            </div>
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
        .karyawan-page {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .navbar-brand .fw-bold,
        .navbar-brand .fw-bold.text-dark {
          color: #212529 !important;
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: unset !important;
          background-clip: unset !important;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #ddd;
          object-fit: cover;
        }
        .search-bar {
          max-width: 400px;
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
      `}</style>
    </div>
  );
}
