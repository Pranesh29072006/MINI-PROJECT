import React from 'react';
import Modal from '../shared/Modal';

interface DashboardDetailsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export default function DashboardDetailsModal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  headerActions
}: DashboardDetailsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      headerActions={headerActions}
      labelId="dashboard-modal-title"
    >
      {children}
    </Modal>
  );
}
