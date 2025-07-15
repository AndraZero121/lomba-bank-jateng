import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Col } from 'react-bootstrap';
import { FiUserPlus, FiDollarSign, FiFileText, FiSettings } from 'react-icons/fi';

const QuickAction = ({ icon: Icon, title, description, link, color }) => (
  <Card as={Link} to={link} className="action-card border-0 shadow-sm text-decoration-none h-100">
    <Card.Body className="p-4">
      <div className={`action-icon bg-${color} bg-opacity-10 text-${color} rounded-3 p-3 mb-3`}>
        <Icon size={24} />
      </div>
      <h6 className="mb-1 fw-semibold">{title}</h6>
      <p className="text-muted small mb-0">{description}</p>
    </Card.Body>
  </Card>
);

const QuickActions = () => {
  const actions = [
    {
      icon: FiUserPlus,
      title: 'Tambah Karyawan',
      description: 'Input data karyawan baru',
      link: '/tambah-karyawan',
      color: 'primary'
    },
    {
      icon: FiDollarSign,
      title: 'Proses Payroll',
      description: 'Proses penggajian bulanan',
      link: '/payroll',
      color: 'success'
    },
    {
      icon: FiFileText,
      title: 'Download Laporan',
      description: 'Unduh laporan keuangan',
      link: '/laporan',
      color: 'info'
    },
    {
      icon: FiSettings,
      title: 'Pengaturan',
      description: 'Konfigurasi sistem',
      link: '/settings',
      color: 'warning'
    }
  ];

  return (
    <div className="row g-3 mb-4">
      {actions.map((action, index) => (
        <Col key={index} lg={3} sm={6}>
          <QuickAction {...action} />
        </Col>
      ))}
    </div>
  );
};

export default QuickActions;
