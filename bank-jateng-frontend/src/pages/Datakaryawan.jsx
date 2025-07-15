import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiSearch, FiDownload, FiUser, FiLogOut, FiChevronDown, FiCalendar, FiDollarSign, FiCreditCard, FiUsers, FiBriefcase } from 'react-icons/fi';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import setBaseUrl from '../utils/service';

const Datakaryawan = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [karyawans, setKaryawans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [currentUser, setCurrentUser] = useState({ name: 'Admin User', email: 'admin@bankjateng.com' });
    const userData = JSON.parse(localStorage.getItem('user'));
    const idKaryawan = userData?.id_karyawan;
    const namaUser = userData?.name;
    const role = userData?.roles;
    const [myData, setMyData] = useState(null);
    const [allKaryawan, setAllKaryawan] = useState([]);

    const onFetch = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await setBaseUrl.get("/karyawan", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setKaryawans(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching karyawan:", error);
            setLoading(false);
            if (error.response && error.response.status === 401) {
                Swal.fire('Session Habis', 'Silakan login ulang.', 'warning').then(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('name');
                    navigate('/');
                });
            }
        }
    }, [navigate]);

    useEffect(() => {
        onFetch();
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
    }, [onFetch]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (role === 'Admin' || role === 'HR') {
                    // Fetch semua data karyawan
                    const response = await setBaseUrl.get('/karyawan', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setAllKaryawan(response.data.data || []);
                } else {
                    // Karyawan: fetch by id_karyawan atau nama
                    let data = null;
                    if (idKaryawan) {
                        const response = await setBaseUrl.get(`/karyawan/${idKaryawan}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        data = response.data.data;
                    }
                    if ((!data || !data.nama_lengkap) && namaUser) {
                        const all = await setBaseUrl.get('/karyawan', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        data = all.data.data.find(k => k.nama_lengkap && k.nama_lengkap.trim().toLowerCase() === namaUser.trim().toLowerCase());
                    }
                    setMyData(data || null);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setMyData(null);
                setAllKaryawan([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [idKaryawan, namaUser, role]);

    const isLoggedIn = () => {
        const token = localStorage.getItem('token');
        return token;
    };

    if (!isLoggedIn()) {
        return <Navigate to='/' />;
    }

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

    // onDelete function is not needed anymore, but kept for possible future use

    const filteredKaryawan = karyawans.filter(karyawan =>
        karyawan.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (karyawan.jabatan?.nama_jabatan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (karyawan.departemen?.nama_departemen || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToExcel = async () => {
        if (role === 'Karyawan') return; // Hanya Admin/HR
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data Karyawan');
            
            worksheet.columns = [
                { header: 'Nama', key: 'nama', width: 25 },
                { header: 'Jabatan', key: 'jabatan', width: 20 },
                { header: 'Departemen', key: 'departemen', width: 20 },
                { header: 'NIK KTP', key: 'nik_ktp', width: 20 },
                { header: 'NPWP', key: 'npwp', width: 20 },
                { header: 'Status PTKP', key: 'status_ptkp', width: 15 },
                { header: 'Tanggal Bergabung', key: 'tanggal_bergabung', width: 20 },
                { header: 'Gaji Pokok', key: 'gaji_pokok', width: 15 },
                { header: 'Nomor Rekening', key: 'nomor_rekening', width: 20 },
                { header: 'Nama Bank', key: 'nama_bank', width: 15 },
                { header: 'Status Kepegawaian', key: 'status_kepegawaian', width: 20 },
                { header: 'Status', key: 'status', width: 15 }
            ];
            
            filteredKaryawan.forEach(item => {
                worksheet.addRow({
                    nama: item.nama_lengkap,
                    jabatan: item.jabatan?.nama_jabatan || '-',
                    departemen: item.departemen?.nama_departemen || '-',
                    nik_ktp: item.nik_ktp || '-',
                    npwp: item.npwp || '-',
                    status_ptkp: item.status_ptkp || '-',
                    tanggal_bergabung: item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-',
                    gaji_pokok: item.gaji_pokok ? `Rp ${item.gaji_pokok.toLocaleString('id-ID')}` : '-',
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
            a.download = 'Data_Karyawan_Lengkap.xlsx';
            a.click();
            URL.revokeObjectURL(url);
            
            Swal.fire({
                title: 'Berhasil!',
                text: 'Data berhasil diekspor ke Excel.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            Swal.fire('Error', 'Gagal mengekspor data ke Excel', 'error');
        }
    };

    const exportToPDF = () => {
        if (role === 'Karyawan') return; // Hanya Admin/HR
        if (!myData) return;
        try {
            const doc = new jsPDF('landscape');
            const now = new Date();
            const tanggalCetak = now.toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            // Judul
            doc.setFontSize(18);
            doc.text('Data Karyawan - Bank Jateng Syariah', 14, 15);

            // Tanggal cetak
            doc.setFontSize(10);
            doc.text(`Tanggal Cetak: ${tanggalCetak}`, 14, 22);

            // Data karyawan
            doc.text(`Nama: ${myData.nama_lengkap || '-'}`, 14, 32);
            doc.text(`Jabatan: ${myData.jabatan?.nama_jabatan || '-'}`, 14, 39);
            doc.text(`Departemen: ${myData.departemen?.nama_departemen || '-'}`, 14, 46);
            doc.text(`NIK KTP: ${myData.nik_ktp || '-'}`, 14, 53);
            doc.text(`NPWP: ${myData.npwp || '-'}`, 14, 60);
            doc.text(`Status PTKP: ${myData.status_ptkp || '-'}`, 14, 67);
            doc.text(`Tanggal Bergabung: ${myData.tanggal_bergabung ? new Date(myData.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}`, 14, 74);
            doc.text(`Gaji Pokok: ${myData.gaji_pokok ? `Rp ${myData.gaji_pokok.toLocaleString('id-ID')}` : '-'}`, 14, 81);
            doc.text(`No. Rekening: ${myData.nomor_rekening || '-'}`, 14, 88);
            doc.text(`Bank: ${myData.nama_bank || '-'}`, 14, 95);
            doc.text(`Status Kepegawaian: ${myData.status_kepegawaian || '-'}`, 14, 102);
            doc.text(`Status: ${myData.is_active ? 'Aktif' : 'Tidak Aktif'}`, 14, 109);

            // Footer/garis
            doc.setLineWidth(0.5);
            doc.line(14, 115, 280, 115);
            doc.setFontSize(9);
            doc.text('Dicetak otomatis oleh sistem Bank Jateng Syariah', 14, 120);

            doc.save(`DataKaryawan_${myData.nama_lengkap}.pdf`);
            Swal.fire({
                title: 'Berhasil!',
                text: 'Data berhasil diekspor ke PDF.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch {
            Swal.fire('Error', 'Gagal mengekspor data ke PDF', 'error');
        }
    };

    const exportAllToPDF = () => {
        if (role === 'Karyawan') return; // Hanya Admin/HR

        try {
            const doc = new jsPDF('landscape');
            const now = new Date();
            const tanggalCetak = now.toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            // Add logo
            doc.addImage('/bank_jateng.png', 'PNG', 14, 10, 30, 20);

            // Header dengan garis
            doc.setFillColor(41, 128, 185);
            doc.rect(0, 35, doc.internal.pageSize.width, 1, 'F');

            // Judul
            doc.setFontSize(20);
            doc.setTextColor(41, 128, 185);
            doc.text('DAFTAR KARYAWAN BANK JATENG SYARIAH', doc.internal.pageSize.width/2, 20, { align: 'center' });

            // Tanggal cetak dengan style
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Dicetak pada: ${tanggalCetak}`, doc.internal.pageSize.width - 14, 25, { align: 'right' });

            // Informasi summary
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text(`Total Karyawan: ${filteredKaryawan.length} orang`, 14, 45);
            doc.text(`Karyawan Aktif: ${filteredKaryawan.filter(k => k.is_active).length} orang`, 14, 50);

            // Tabel data karyawan dengan styling yang lebih baik
            autoTable(doc, {
                head: [[
                    'Nama', 'Jabatan', 'Departemen', 'NIK KTP', 'NPWP', 'Status PTKP',
                    'Tanggal Bergabung', 'Gaji Pokok', 'Nomor Rekening', 'Nama Bank',
                    'Status Kepegawaian', 'Status'
                ]],
                body: filteredKaryawan.map(item => [
                    item.nama_lengkap,
                    item.jabatan?.nama_jabatan || '-',
                    item.departemen?.nama_departemen || '-',
                    item.nik_ktp || '-',
                    item.npwp || '-',
                    item.status_ptkp || '-',
                    item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-',
                    item.gaji_pokok ? `Rp ${item.gaji_pokok.toLocaleString('id-ID')}` : '-',
                    item.nomor_rekening || '-',
                    item.nama_bank || '-',
                    item.status_kepegawaian || '-',
                    item.is_active ? 'Aktif' : 'Tidak Aktif'
                ]),
                startY: 60,
                styles: { 
                    fontSize: 8,
                    cellPadding: 3,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                columnStyles: {
                    0: { fontStyle: 'bold' },
                    7: { halign: 'right' },
                    11: { 
                        halign: 'center',
                        fontStyle: 'bold'
                    }
                },
                didDrawPage: function(data) {
                    // Header on each page
                    doc.setFillColor(41, 128, 185);
                    doc.rect(0, 0, doc.internal.pageSize.width, 2, 'F');
                    
                    // Footer on each page
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(
                        'Bank Jateng Syariah © ' + new Date().getFullYear(),
                        doc.internal.pageSize.width/2,
                        doc.internal.pageSize.height - 10,
                        { align: 'center' }
                    );
                    doc.text(
                        `Halaman ${data.pageNumber} dari ${doc.getNumberOfPages()}`,
                        doc.internal.pageSize.width - 20,
                        doc.internal.pageSize.height - 10
                    );
                }
            });

            // Tanda tangan dan validasi
            const finalY = doc.lastAutoTable.finalY + 20;
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text('Validasi HR Manager:', doc.internal.pageSize.width - 60, finalY);
            doc.line(doc.internal.pageSize.width - 50, finalY + 25, doc.internal.pageSize.width - 20, finalY + 25);

            doc.save('Data_Karyawan_Lengkap.pdf');
            Swal.fire({
                title: 'Berhasil!',
                text: 'Data berhasil diekspor ke PDF.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch {
            Swal.fire('Error', 'Gagal mengekspor data ke PDF', 'error');
        }
    };

    const exportMyDataToPDF = () => {
        if (role !== 'Karyawan' || !myData) return; // Only for Karyawan role

        try {
            const doc = new jsPDF();
            const now = new Date();
            const tanggalCetak = now.toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            // Add Logo (assuming logo is at 0,0 with width 30 and height 20)
            doc.addImage('/bank_jateng.png', 'PNG', 15, 10, 30, 20);

            // Header dengan garis
            doc.setFillColor(41, 128, 185); // Warna biru
            doc.rect(0, 35, doc.internal.pageSize.width, 1, 'F');

            // Judul
            doc.setFontSize(18);
            doc.setTextColor(41, 128, 185);
            doc.text('DATA KARYAWAN', doc.internal.pageSize.width/2, 20, { align: 'center' });
            doc.setFontSize(14);
            doc.text('Bank Jateng Syariah', doc.internal.pageSize.width/2, 28, { align: 'center' });

            // Tanggal cetak dengan style
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Dicetak pada: ${tanggalCetak}`, doc.internal.pageSize.width - 15, 40, { align: 'right' });

            // Informasi Pribadi Section
            doc.setFontSize(12);
            doc.setTextColor(41, 128, 185);
            doc.text('INFORMASI PRIBADI', 15, 50);
            doc.setDrawColor(41, 128, 185);
            doc.line(15, 52, 85, 52);

            // Data karyawan dengan format yang lebih rapi
            doc.setFontSize(10);
            doc.setTextColor(0);
            const col1X = 15;
            const col2X = 60;
            let yPos = 60;
            
            // Helper function untuk menambah baris data
            const addDataRow = (label, value, y) => {
                doc.setFont(undefined, 'bold');
                doc.text(label, col1X, y);
                doc.setFont(undefined, 'normal');
                doc.text(': ' + (value || '-'), col2X, y);
                return y + 7;
            };

            // Kolom 1: Informasi Pribadi
            yPos = addDataRow('Nama Lengkap', myData.nama_lengkap, yPos);
            yPos = addDataRow('Email', myData.email, yPos);
            yPos = addDataRow('NIK KTP', myData.nik_ktp, yPos);
            yPos = addDataRow('NPWP', myData.npwp, yPos);

            // Informasi Pekerjaan Section
            yPos += 5;
            doc.setFontSize(12);
            doc.setTextColor(41, 128, 185);
            doc.text('INFORMASI PEKERJAAN', 15, yPos);
            doc.line(15, yPos + 2, 100, yPos + 2);
            yPos += 10;

            // Reset text color for data
            doc.setFontSize(10);
            doc.setTextColor(0);
            yPos = addDataRow('Jabatan', myData.jabatan?.nama_jabatan, yPos);
            yPos = addDataRow('Departemen', myData.departemen?.nama_departemen, yPos);
            yPos = addDataRow('Status', myData.is_active ? 'Aktif' : 'Tidak Aktif', yPos);
            yPos = addDataRow('Status Kepegawaian', myData.status_kepegawaian, yPos);
            yPos = addDataRow('Tanggal Bergabung', myData.tanggal_bergabung ? 
                new Date(myData.tanggal_bergabung).toLocaleDateString('id-ID') : '-', yPos);

            // Informasi Finansial Section
            yPos += 5;
            doc.setFontSize(12);
            doc.setTextColor(41, 128, 185);
            doc.text('INFORMASI FINANSIAL', 15, yPos);
            doc.line(15, yPos + 2, 95, yPos + 2);
            yPos += 10;

            // Reset text color for data
            doc.setFontSize(10);
            doc.setTextColor(0);
            yPos = addDataRow('Gaji Pokok', myData.gaji_pokok ? 
                `Rp ${myData.gaji_pokok.toLocaleString('id-ID')}` : '-', yPos);
            yPos = addDataRow('Status PTKP', myData.status_ptkp, yPos);
            yPos = addDataRow('Nomor Rekening', myData.nomor_rekening, yPos);
            yPos = addDataRow('Nama Bank', myData.nama_bank, yPos);

            // Footer dengan garis dan watermark
            doc.setDrawColor(200);
            doc.line(0, doc.internal.pageSize.height - 20, doc.internal.pageSize.width, doc.internal.pageSize.height - 20);
            
            // Watermark
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Dokumen ini dicetak otomatis oleh sistem Bank Jateng Syariah', 
                doc.internal.pageSize.width/2, doc.internal.pageSize.height - 15, 
                { align: 'center' });
            
            // QR Code position (if needed)
            // doc.addImage(qrCode, 'PNG', 170, yPos - 40, 25, 25);

            doc.save(`DataKaryawan_${myData.nama_lengkap}.pdf`);
            Swal.fire({
                title: 'Berhasil!',
                text: 'Data Anda berhasil diekspor ke PDF.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch {
            Swal.fire('Error', 'Gagal mengekspor data ke PDF', 'error');
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Memuat data karyawan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="karyawan-page">
            <header className="sticky-top shadow-sm bg-white">
                <nav className="navbar navbar-expand-lg bg-white border-bottom">
                    <div className="container">
                        {/* Brand Logo */}
                        <Link className="navbar-brand d-flex align-items-center" to="/dashboard">
                            <img
                                src="/bank_jateng.png"
                                alt="Bank Jateng Syariah Logo"
                                width="60"
                                height="40"
                                className="me-2"
                            />
                            <span className="fw-bold text-dark">Bank Jateng Syariah</span>
                        </Link>
                        {/* User Profile Dropdown */}
                        <div className="user-dropdown position-relative">
                            <button 
                                className="btn btn-light d-flex align-items-center gap-2 border-0 shadow-sm"
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                            >
                                <div className="avatar-profile bg-primary text-white d-flex align-items-center justify-content-center">
                                    <FiUser size={18} />
                                </div>
                                <div className="text-start d-none d-md-block">
                                    <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{currentUser.name}</div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{currentUser.email}</div>
                                </div>
                                <FiChevronDown className={`text-muted transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showUserDropdown && (
                                <div className="dropdown-menu dropdown-menu-end show position-absolute shadow-lg border-0 mt-2" style={{ minWidth: '220px', zIndex: 1050 }}>
                                    <div className="dropdown-header bg-light">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-profile bg-primary text-white me-3">
                                                <FiUser size={18} />
                                            </div>
                                            <div>
                                                <div className="fw-semibold">{currentUser.name}</div>
                                                <div className="text-muted small">{currentUser.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    {/* Tambahkan akses ke dashboard di dropdown juga, hanya untuk HR/Admin */}
                                    {(role === 'Admin' || role === 'HR') && (
                                        <Link 
                                            to="/dashboard"
                                            className="dropdown-item d-flex align-items-center gap-2 py-2"
                                        >
                                            <FiUsers size={16} />
                                            Dashboard
                                        </Link>
                                    )}
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={handleLogout}>
                                        <FiLogOut size={16} />
                                        Keluar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            <main className="container py-4">
                {/* Header Section */}
                <div className="row align-items-center mb-4">
                    <div className="col-md-6">
                        <h1 className="mb-2 text-dark fw-bold">Data Karyawan Lengkap</h1>
                        <p className="text-muted mb-0">Kelola informasi karyawan Bank Jateng Syariah</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        {(role === 'Admin' || role === 'HR') && (
                            <div className="btn-group me-2" role="group">
                                <button 
                                    className="btn btn-outline-success d-flex align-items-center gap-2"
                                    onClick={exportToExcel}
                                >
                                    <FiDownload size={16} />
                                    <span className="d-none d-sm-inline">Excel</span>
                                </button>
                                <button 
                                    className="btn btn-outline-danger d-flex align-items-center gap-2"
                                    onClick={exportAllToPDF}
                                >
                                    <FiDownload size={16} />
                                    <span className="d-none d-sm-inline">PDF</span>
                                </button>
                            </div>
                        )}
                        {/* Tombol tambah karyawan dihilangkan */}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4">
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm bg-primary text-white">
                            <div className="card-body text-center py-3">
                                <FiUsers size={24} className="mb-2" />
                                <h4 className="mb-1">{filteredKaryawan.length}</h4>
                                <small>Total Karyawan</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm bg-success text-white">
                            <div className="card-body text-center py-3">
                                <FiUsers size={24} className="mb-2" />
                                <h4 className="mb-1">{filteredKaryawan.filter(k => k.is_active).length}</h4>
                                <small>Karyawan Aktif</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm bg-warning text-white">
                            <div className="card-body text-center py-3">
                                <FiBriefcase size={24} className="mb-2" />
                                <h4 className="mb-1">{[...new Set(filteredKaryawan.map(k => k.jabatan?.nama_jabatan).filter(Boolean))].length}</h4>
                                <small>Total Jabatan</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm bg-info text-white">
                            <div className="card-body text-center py-3">
                                <FiUsers size={24} className="mb-2" />
                                <h4 className="mb-1">{[...new Set(filteredKaryawan.map(k => k.departemen?.nama_departemen).filter(Boolean))].length}</h4>
                                <small>Total Departemen</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                {role !== "Karyawan"&&<div className="card border-0 shadow-sm mb-4">
                    <div className="card-body py-3">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <FiSearch className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Cari berdasarkan nama, jabatan, atau departemen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>}

                {/* Employee Cards */}
                {role === 'Admin' || role === 'HR' ? (
                    <div className="row g-4">
                        {allKaryawan.length === 0 ? (
                            <div className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body text-center py-5">
                                        <FiUsers size={48} className="text-muted mb-3" />
                                        <h5 className="text-muted mb-2">Tidak ada data karyawan</h5>
                                        <p className="text-muted">Belum ada karyawan yang terdaftar.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            allKaryawan.map((karyawan) => (
                                <div className="col-lg-6 col-xl-4" key={karyawan.id}>
                                    <div className="card border-0 shadow-sm h-100 employee-card">
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className={`avatar-lg me-3 ${karyawan.is_active ? 'bg-primary' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center`}>
                                                    {karyawan.nama_lengkap.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h5 className="mb-1 fw-bold text-dark">{karyawan.nama_lengkap}</h5>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        <span className="badge bg-primary">{karyawan.jabatan?.nama_jabatan || '-'}</span>
                                                        <span className={`badge ${karyawan.is_active ? 'bg-success' : 'bg-danger'}`}>{karyawan.is_active ? 'Aktif' : 'Tidak Aktif'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="employee-details mb-4">
                                                <div className="row g-2">
                                                    <div className="col-12">
                                                        <div className="d-flex align-items-center text-muted mb-2">
                                                            <FiBriefcase size={14} className="me-2 text-primary" />
                                                            <span className="small fw-medium">Departemen:</span>
                                                            <span className="ms-auto small">{karyawan.departemen?.nama_departemen || '-'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="d-flex align-items-center text-muted mb-2">
                                                            <FiCalendar size={14} className="me-2 text-success" />
                                                            <span className="small fw-medium">Bergabung:</span>
                                                            <span className="ms-auto small">{karyawan.tanggal_bergabung ? new Date(karyawan.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="d-flex align-items-center text-muted mb-2">
                                                            <FiDollarSign size={14} className="me-2 text-warning" />
                                                            <span className="small fw-medium">Gaji Pokok:</span>
                                                            <span className="ms-auto small fw-semibold text-dark">{karyawan.gaji_pokok ? `Rp ${karyawan.gaji_pokok.toLocaleString('id-ID')}` : '-'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="d-flex align-items-center text-muted mb-2">
                                                            <FiCreditCard size={14} className="me-2 text-info" />
                                                            <span className="small fw-medium">Rekening:</span>
                                                            <span className="ms-auto small">{karyawan.nomor_rekening || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="additional-info mb-3">
                                                <details className="small">
                                                    <summary className="text-primary fw-medium cursor-pointer mb-2">Detail Lainnya</summary>
                                                    <div className="ps-3 border-start border-light">
                                                        <div className="mb-1"><strong>NIK KTP:</strong> {karyawan.nik_ktp || '-'}</div>
                                                        <div className="mb-1"><strong>NPWP:</strong> {karyawan.npwp || '-'}</div>
                                                        <div className="mb-1"><strong>Status PTKP:</strong> {karyawan.status_ptkp || '-'}</div>
                                                        <div className="mb-1"><strong>Bank:</strong> {karyawan.nama_bank || '-'}</div>
                                                        <div className="mb-1"><strong>Status Kepegawaian:</strong> {karyawan.status_kepegawaian || '-'}</div>
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="row g-4">
                        {myData ? (
                            <div className="col-lg-6 col-xl-4 mx-auto">
                                <div className="card border-0 shadow-sm h-100 employee-card">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className={`avatar-lg me-3 ${myData.is_active ? 'bg-primary' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center`}>
                                                {myData.nama_lengkap.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-grow-1">
                                                <h5 className="mb-1 fw-bold text-dark">{myData.nama_lengkap}</h5>
                                                <div className="d-flex flex-wrap gap-1">
                                                    <span className="badge bg-primary">{myData.jabatan?.nama_jabatan || '-'}</span>
                                                    <span className={`badge ${myData.is_active ? 'bg-success' : 'bg-danger'}`}>{myData.is_active ? 'Aktif' : 'Tidak Aktif'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="employee-details mb-4">
                                            <div className="row g-2">
                                                <div className="col-12">
                                                    <div className="d-flex align-items-center text-muted mb-2">
                                                        <FiBriefcase size={14} className="me-2 text-primary" />
                                                        <span className="small fw-medium">Departemen:</span>
                                                        <span className="ms-auto small">{myData.departemen?.nama_departemen || '-'}</span>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="d-flex align-items-center text-muted mb-2">
                                                        <FiCalendar size={14} className="me-2 text-success" />
                                                        <span className="small fw-medium">Bergabung:</span>
                                                        <span className="ms-auto small">{myData.tanggal_bergabung ? new Date(myData.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}</span>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="d-flex align-items-center text-muted mb-2">
                                                        <FiDollarSign size={14} className="me-2 text-warning" />
                                                        <span className="small fw-medium">Gaji Pokok:</span>
                                                        <span className="ms-auto small fw-semibold text-dark">{myData.gaji_pokok ? `Rp ${myData.gaji_pokok.toLocaleString('id-ID')}` : '-'}</span>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="d-flex align-items-center text-muted mb-2">
                                                        <FiCreditCard size={14} className="me-2 text-info" />
                                                        <span className="small fw-medium">Rekening:</span>
                                                        <span className="ms-auto small">{myData.nomor_rekening || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="additional-info mb-3">
                                            <details className="small">
                                                <summary className="text-primary fw-medium cursor-pointer mb-2">Detail Lainnya</summary>
                                                <div className="ps-3 border-start border-light">
                                                    <div className="mb-1"><strong>NIK KTP:</strong> {myData.nik_ktp || '-'}</div>
                                                    <div className="mb-1"><strong>NPWP:</strong> {myData.npwp || '-'}</div>
                                                    <div className="mb-1"><strong>Status PTKP:</strong> {myData.status_ptkp || '-'}</div>
                                                    <div className="mb-1"><strong>Bank:</strong> {myData.nama_bank || '-'}</div>
                                                    <div className="mb-1"><strong>Status Kepegawaian:</strong> {myData.status_kepegawaian || '-'}</div>
                                                </div>
                                            </details>
                                        </div>
                                        {role === 'Karyawan' && myData && (
                                            <button 
                                                className="btn btn-outline-danger w-100 mt-3"
                                                onClick={exportMyDataToPDF}
                                            >
                                                <FiDownload className="me-2" /> Cetak Data Saya (PDF)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body text-center py-5">
                                        <FiUsers size={48} className="text-muted mb-3" />
                                        <h5 className="text-muted mb-2">Data karyawan tidak ditemukan</h5>
                                        <p className="text-muted">Silakan hubungi admin jika data Anda belum terdaftar.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
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
                    background-color: #f8f9fa;
                }
                
                .avatar-profile {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    font-size: 0.9rem;
                    font-weight: bold;
                }
                
                .avatar-lg {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                
                .employee-card {
                    transition: all 0.3s ease;
                    border-radius: 12px;
                }
                
                .employee-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
                }
                
                .transition-transform {
                    transition: transform 0.2s ease;
                }
                
                .rotate-180 {
                    transform: rotate(180deg);
                }
                
                .cursor-pointer {
                    cursor: pointer;
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
                
                .employee-details .d-flex {
                    padding: 0.25rem 0;
                }
                
                .additional-info details[open] summary {
                    margin-bottom: 0.75rem;
                }
                
                .btn-group .btn {
                    border-radius: 8px;
                }
                
                .btn-group .btn:not(:last-child) {
                    border-top-right-radius: 0;
                    border-bottom-right-radius: 0;
                    margin-right: -1px;
                }
                
                .btn-group .btn:not(:first-child) {
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                }
                
                .card {
                    border-radius: 12px;
                }
                
                .btn {
                    border-radius: 8px;
                    font-weight: 500;
                }
                
                .badge {
                    font-size: 0.75rem;
                    padding: 0.35em 0.65em;
                }
                
                @media (max-width: 768px) {
                    .avatar-profile .d-none {
                        display: none !important;
                    }
                    
                    .btn-group {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        margin-bottom: 0.5rem;
                    }
                    
                    .btn-group .btn {
                        border-radius: 8px !important;
                        margin-right: 0 !important;
                        margin-bottom: 0.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Datakaryawan;