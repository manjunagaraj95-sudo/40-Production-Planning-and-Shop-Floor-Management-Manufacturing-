
import React, { useState, useEffect } from 'react';

// --- Configuration Data ---
const ROLES = {
  ADMIN: 'Admin',
  PRODUCTION_MANAGER: 'Production Manager',
  SHOP_FLOOR_OPERATOR: 'Shop Floor Operator',
  QUALITY_INSPECTOR: 'Quality Inspector',
  MAINTENANCE_TEAM: 'Maintenance Team',
};

const STATUS_MAP = {
  // Production Order Status
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  ON_HOLD: 'On Hold',

  // Machine Status
  ACTIVE: 'Active',
  IDLE: 'Idle',
  MAINTENANCE: 'Maintenance',
  STOPPED: 'Stopped',
  BREAKDOWN: 'Breakdown',

  // Quality Check Status
  SCHEDULED: 'Scheduled',
  INSPECTING: 'Inspecting',
  PASSED: 'Passed',
  FAILED: 'Failed',
  REWORK_REQUIRED: 'Rework Required',
};

const PRODUCTION_ORDER_STATUS_COLORS = {
  DRAFT: 'var(--color-status-draft)',
  PENDING_APPROVAL: 'var(--color-status-pending)',
  APPROVED: 'var(--color-status-approved)',
  IN_PROGRESS: 'var(--color-status-in-progress)',
  PAUSED: 'var(--color-status-alert)',
  COMPLETED: 'var(--color-status-completed)',
  REJECTED: 'var(--color-status-rejected)',
  CANCELLED: 'var(--color-status-rejected)',
  ON_HOLD: 'var(--color-status-idle)',
};

const MACHINE_STATUS_COLORS = {
  ACTIVE: 'var(--color-status-active)',
  IDLE: 'var(--color-status-idle)',
  MAINTENANCE: 'var(--color-status-alert)',
  STOPPED: 'var(--color-status-stopped)',
  BREAKDOWN: 'var(--color-danger)',
};

const QUALITY_CHECK_STATUS_COLORS = {
  SCHEDULED: 'var(--color-status-idle)',
  INSPECTING: 'var(--color-status-in-progress)',
  PASSED: 'var(--color-status-approved)',
  FAILED: 'var(--color-status-rejected)',
  REWORK_REQUIRED: 'var(--color-status-alert)',
};

// Workflow stages
const PRODUCTION_ORDER_WORKFLOW = [
  { stage: 'DRAFT', label: 'Drafted' },
  { stage: 'PENDING_APPROVAL', label: 'Approval' },
  { stage: 'APPROVED', label: 'Approved' },
  { stage: 'IN_PROGRESS', label: 'Production' },
  { stage: 'COMPLETED', label: 'Completed' },
];

// --- Dummy Data ---
const DUMMY_DATA = {
  users: [
    { id: 'usr001', name: 'Alice Smith', role: ROLES.ADMIN },
    { id: 'usr002', name: 'Bob Johnson', role: ROLES.PRODUCTION_MANAGER },
    { id: 'usr003', name: 'Charlie Brown', role: ROLES.SHOP_FLOOR_OPERATOR },
    { id: 'usr004', name: 'Diana Prince', role: ROLES.QUALITY_INSPECTOR },
    { id: 'usr005', name: 'Eve Adams', role: ROLES.MAINTENANCE_TEAM },
  ],
  productionOrders: [
    {
      id: 'PO001', product: 'Widget A', quantity: 1000, startDate: '2023-10-26', endDate: '2023-11-05',
      status: 'IN_PROGRESS', assignedMachine: 'MC001', priority: 'High',
      notes: 'Initial batch, critical deadline. Requires daily quality checks.',
      auditLog: [
        { timestamp: '2023-10-20T10:00:00Z', user: 'Alice Smith', action: 'Created', details: 'Order initiated.' },
        { timestamp: '2023-10-21T11:30:00Z', user: 'Bob Johnson', action: 'Approved', details: 'Manager review completed.' },
        { timestamp: '2023-10-26T08:00:00Z', user: 'Charlie Brown', action: 'Started Production', details: 'Assigned to Machine MC001.' },
      ],
      slaStatus: 'ON_TRACK', // For SLA indication
      currentWorkflowStage: 'IN_PROGRESS',
    },
    {
      id: 'PO002', product: 'Gadget B', quantity: 500, startDate: '2023-10-28', endDate: '2023-11-10',
      status: 'APPROVED', assignedMachine: 'MC002', priority: 'Medium',
      notes: 'Standard order. Awaiting machine availability.',
      auditLog: [
        { timestamp: '2023-10-22T14:00:00Z', user: 'Alice Smith', action: 'Created', details: 'Order initiated.' },
        { timestamp: '2023-10-23T09:00:00Z', user: 'Bob Johnson', action: 'Approved', details: 'Manager review completed.' },
      ],
      slaStatus: 'ON_TRACK',
      currentWorkflowStage: 'APPROVED',
    },
    {
      id: 'PO003', product: 'Part C', quantity: 2000, startDate: '2023-10-25', endDate: '2023-11-01',
      status: 'COMPLETED', assignedMachine: 'MC003', priority: 'High',
      notes: 'Rush order. Completed ahead of schedule.',
      auditLog: [
        { timestamp: '2023-10-18T09:00:00Z', user: 'Alice Smith', action: 'Created', details: 'Order initiated.' },
        { timestamp: '2023-10-19T10:00:00Z', user: 'Bob Johnson', action: 'Approved', details: 'Manager review completed.' },
        { timestamp: '2023-10-20T08:00:00Z', user: 'Charlie Brown', action: 'Started Production', details: 'Assigned to Machine MC003.' },
        { timestamp: '2023-10-25T17:00:00Z', user: 'Charlie Brown', action: 'Completed Production', details: 'All units produced.' },
      ],
      slaStatus: 'MET',
      currentWorkflowStage: 'COMPLETED',
    },
    {
      id: 'PO004', product: 'Assembly X', quantity: 200, startDate: '2023-11-01', endDate: '2023-11-15',
      status: 'PENDING_APPROVAL', assignedMachine: 'N/A', priority: 'Medium',
      notes: 'New product line. Requires design team sign-off.',
      auditLog: [
        { timestamp: '2023-10-27T15:00:00Z', user: 'Alice Smith', action: 'Created', details: 'Order initiated.' },
      ],
      slaStatus: 'AT_RISK',
      currentWorkflowStage: 'PENDING_APPROVAL',
    },
    {
      id: 'PO005', product: 'Component Y', quantity: 5000, startDate: '2023-10-29', endDate: '2023-11-08',
      status: 'PAUSED', assignedMachine: 'MC004', priority: 'Low',
      notes: 'Material shortage. Waiting for new delivery.',
      auditLog: [
        { timestamp: '2023-10-24T09:00:00Z', user: 'Alice Smith', action: 'Created', details: 'Order initiated.' },
        { timestamp: '2023-10-25T10:00:00Z', user: 'Bob Johnson', action: 'Approved', details: 'Manager review completed.' },
        { timestamp: '2023-10-29T11:00:00Z', user: 'Charlie Brown', action: 'Paused Production', details: 'Material shortage detected.' },
      ],
      slaStatus: 'BREACHED',
      currentWorkflowStage: 'IN_PROGRESS', // Paused during in-progress stage
    },
    {
      id: 'PO006', product: 'Case Z', quantity: 300, startDate: '2023-11-03', endDate: '2023-11-12',
      status: 'DRAFT', assignedMachine: 'N/A', priority: 'Low',
      notes: 'New design iteration. Specs not finalized.',
      auditLog: [
        { timestamp: '2023-10-30T16:00:00Z', user: 'Alice Smith', action: 'Created', details: 'Order initiated as draft.' },
      ],
      slaStatus: 'N/A',
      currentWorkflowStage: 'DRAFT',
    },
  ],
  machines: [
    { id: 'MC001', name: 'CNC Mill 1', type: 'Milling Machine', status: 'ACTIVE', utilization: '85%', location: 'Bay 1', lastMaintenance: '2023-10-01', nextMaintenance: '2024-01-01' },
    { id: 'MC002', name: 'Assembly Line 3', type: 'Assembly Robot', status: 'IDLE', utilization: '30%', location: 'Bay 3', lastMaintenance: '2023-09-15', nextMaintenance: '2023-12-15' },
    { id: 'MC003', name: '3D Printer', type: 'Additive Manufacturing', status: 'ACTIVE', utilization: '95%', location: 'Lab', lastMaintenance: '2023-10-20', nextMaintenance: '2024-02-20' },
    { id: 'MC004', name: 'Laser Cutter 2', type: 'Cutting Machine', status: 'MAINTENANCE', utilization: '0%', location: 'Bay 2', lastMaintenance: '2023-10-30', nextMaintenance: '2023-11-05' },
    { id: 'MC005', name: 'Welding Robot 1', type: 'Welding', status: 'STOPPED', utilization: '50%', location: 'Bay 4', lastMaintenance: '2023-10-10', nextMaintenance: '2024-01-10' },
  ],
  qualityChecks: [
    { id: 'QC001', orderId: 'PO001', checkType: 'In-Process', result: 'Passed', inspector: 'Diana Prince', status: 'PASSED', date: '2023-10-28', notes: 'All dimensions within tolerance.' },
    { id: 'QC002', orderId: 'PO001', checkType: 'Final Inspection', result: 'N/A', inspector: 'Diana Prince', status: 'SCHEDULED', date: '2023-11-04', notes: 'Scheduled before shipping.' },
    { id: 'QC003', orderId: 'PO003', checkType: 'In-Process', result: 'Passed', inspector: 'Diana Prince', status: 'PASSED', date: '2023-10-22', notes: 'Surface finish good.' },
    { id: 'QC004', orderId: 'PO003', checkType: 'Final Inspection', result: 'Failed', inspector: 'Diana Prince', status: 'FAILED', date: '2023-10-25', notes: 'Minor cosmetic defects, rework required.' },
    { id: 'QC005', orderId: 'PO005', checkType: 'Incoming Material', result: 'N/A', inspector: 'Diana Prince', status: 'SCHEDULED', date: '2023-10-30', notes: 'Awaiting new material batch.' },
    { id: 'QC006', orderId: 'PO001', checkType: 'In-Process', result: 'Passed', inspector: 'Diana Prince', status: 'INSPECTING', date: '2023-10-30', notes: 'Currently inspecting batch 2.' },
  ],
  recentActivities: [
    { id: 'ACT001', type: 'Production Order', title: 'PO001: Widget A production started', timestamp: '2023-10-26T08:00:00Z', status: 'IN_PROGRESS', refId: 'PO001' },
    { id: 'ACT002', type: 'Quality Check', title: 'QC001: PO001 In-Process check PASSED', timestamp: '2023-10-28T14:30:00Z', status: 'PASSED', refId: 'QC001' },
    { id: 'ACT003', type: 'Machine Maintenance', title: 'MC004: Laser Cutter 2 scheduled for maintenance', timestamp: '2023-10-30T09:00:00Z', status: 'MAINTENANCE', refId: 'MC004' },
    { id: 'ACT004', type: 'Production Order', title: 'PO005: Component Y production PAUSED (Material shortage)', timestamp: '2023-10-29T11:00:00Z', status: 'PAUSED', refId: 'PO005' },
    { id: 'ACT005', type: 'Quality Check', title: 'QC004: PO003 Final Inspection FAILED', timestamp: '2023-10-25T17:00:00Z', status: 'FAILED', refId: 'QC004' },
    { id: 'ACT006', type: 'Production Order', title: 'PO003: Part C production COMPLETED', timestamp: '2023-10-25T17:00:00Z', status: 'COMPLETED', refId: 'PO003' },
  ]
};

// --- Helper Functions ---
const getStatusColor = (entityType, status) => {
  switch (entityType) {
    case 'PRODUCTION_ORDER': return PRODUCTION_ORDER_STATUS_COLORS[status] || 'var(--color-status-idle)';
    case 'MACHINE': return MACHINE_STATUS_COLORS[status] || 'var(--color-status-idle)';
    case 'QUALITY_CHECK': return QUALITY_CHECK_STATUS_COLORS[status] || 'var(--color-status-idle)';
    default: return 'var(--color-status-idle)';
  }
};

const formatToLocaleDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// --- UI Components ---
const LoginScreen = ({ setCurrentUser, navigate }) => {
  const handleLogin = (role) => {
    const user = DUMMY_DATA.users.find(u => u.role === role);
    setCurrentUser(user || { id: 'guest', name: 'Guest', role: role });
    navigate('DASHBOARD');
  };

  return (
    <div className="login-card">
      <h1 className="login-title">Production Planner Login</h1>
      <p>Select your role to continue:</p>
      <div className="role-selection-grid">
        {Object.values(ROLES).map((role) => (
          <button
            key={role}
            className="role-button"
            onClick={() => handleLogin(role)}
          >
            Login as {role}
          </button>
        ))}
      </div>
    </div>
  );
};

const Header = ({ currentUser, navigate, goBack, screenTitle, showBreadcrumbs, breadcrumbs }) => {
  const handleLogout = () => {
    setCurrentUser(null);
    navigate('LOGIN'); // Redirect to login after logout
  };

  return (
    <header className="app-header">
      <div className="app-header-left">
        {showBreadcrumbs && (
          <button className="nav-button back-button" onClick={goBack}>
            &lt; Back
          </button>
        )}
        <h1 className="app-logo">
          {screenTitle}
        </h1>
        {showBreadcrumbs && (
          <nav className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.screen + index} className="breadcrumb-item">
                {index < breadcrumbs.length - 1 ? (
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate(crumb.screen, crumb.params); }}>{crumb.label}</a>
                ) : (
                  crumb.label
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
      <div className="app-header-right">
        {currentUser && (
          <div className="user-info">
            <span>{currentUser?.name}</span>
            <span className="user-role">{currentUser?.role}</span>
          </div>
        )}
        {currentUser && (
          <button className="nav-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

const GlobalSearch = () => (
  <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--spacing-lg)' }}>
    <input type="text" placeholder="Global Search (floating with suggestions)" style={{ width: '100%', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)' }} />
  </div>
);

const EmptyState = ({ message, ctaText, onCtaClick }) => (
  <div className="empty-state">
    <span className="empty-state-icon">🚫</span>
    <p className="empty-state-message">{message}</p>
    {onCtaClick && (
      <button className="button button--primary" onClick={onCtaClick}>
        {ctaText}
      </button>
    )}
  </div>
);

const ProductionOrderCard = ({ order, navigate, currentUser }) => {
  const canEdit = currentUser?.role === ROLES.PRODUCTION_MANAGER || currentUser?.role === ROLES.ADMIN;
  const canApprove = currentUser?.role === ROLES.PRODUCTION_MANAGER;

  const handleQuickAction = (action) => {
    alert(`Quick action "${action}" on order ${order.id}`);
    // In a real app, this would dispatch an API call or update local state
  };

  return (
    <div className="card" onClick={() => navigate('PRODUCTION_ORDER_DETAIL', { id: order.id })}>
      <div className="card-actions">
        {canApprove && order.status === 'PENDING_APPROVAL' && (
          <button className="card-action-button" onClick={(e) => { e.stopPropagation(); handleQuickAction('Approve'); }}>Approve</button>
        )}
        {canEdit && (
          <button className="card-action-button" onClick={(e) => { e.stopPropagation(); handleQuickAction('Edit'); }}>Edit</button>
        )}
      </div>
      <div className="card-header">
        <h3 className="card-title">{order.product} (ID: {order.id})</h3>
        <span className="card-status" style={{ backgroundColor: getStatusColor('PRODUCTION_ORDER', order.status) }}>
          {STATUS_MAP[order.status]}
        </span>
      </div>
      <div className="card-body">
        <p><strong>Quantity:</strong> {order.quantity}</p>
        <p><strong>Machine:</strong> {order.assignedMachine}</p>
        <p><strong>Due Date:</strong> {formatToLocaleDate(order.endDate)}</p>
      </div>
      <div className="card-footer">
        <span>Priority: {order.priority}</span>
      </div>
    </div>
  );
};

const ProductionOrderList = ({ orders, navigate, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredOrders = orders?.filter(order =>
    order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    STATUS_MAP[order.status]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-page">
      <h2 className="screen-title">Production Orders</h2>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1, padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)' }}
        />
        <button className="button button--secondary">Filter</button>
        <button className="button button--secondary">Sort</button>
        <button className="button button--secondary">Saved Views</button>
        {((currentUser?.role === ROLES.ADMIN) || (currentUser?.role === ROLES.PRODUCTION_MANAGER)) && (
          <button className="button button--primary" onClick={() => alert('New Order Form')}>+ New Order</button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
          <button className="button button--secondary">Bulk Actions</button>
          <button className="button button--secondary">Export to Excel</button>
      </div>
      {(filteredOrders?.length ?? 0) > 0 ? (
        <div className="card-grid">
          {filteredOrders.map(order => (
            <ProductionOrderCard key={order.id} order={order} navigate={navigate} currentUser={currentUser} />
          ))}
        </div>
      ) : (
        <EmptyState message="No production orders found." ctaText="Create New Order" onCtaClick={() => alert('New Order Form')} />
      )}
    </div>
  );
};

const MachineCard = ({ machine, navigate }) => (
  <div className="card" onClick={() => navigate('MACHINE_DETAIL', { id: machine.id })}>
    <div className="card-header">
      <h3 className="card-title">{machine.name} (ID: {machine.id})</h3>
      <span className="card-status" style={{ backgroundColor: getStatusColor('MACHINE', machine.status) }}>
        {STATUS_MAP[machine.status]}
      </span>
    </div>
    <div className="card-body">
      <p><strong>Type:</strong> {machine.type}</p>
      <p><strong>Location:</strong> {machine.location}</p>
      <p><strong>Utilization:</strong> {machine.utilization}</p>
    </div>
  </div>
);

const MachineList = ({ machines, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredMachines = machines?.filter(machine =>
    machine.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    STATUS_MAP[machine.status]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-page">
      <h2 className="screen-title">Machine Management</h2>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        <input
          type="text"
          placeholder="Search machines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1, padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)' }}
        />
        <button className="button button--secondary">Filter</button>
        <button className="button button--secondary">Sort</button>
      </div>
      {(filteredMachines?.length ?? 0) > 0 ? (
        <div className="card-grid">
          {filteredMachines.map(machine => (
            <MachineCard key={machine.id} machine={machine} navigate={navigate} />
          ))}
        </div>
      ) : (
        <EmptyState message="No machines found." ctaText="Add New Machine" onCtaClick={() => alert('New Machine Form')} />
      )}
    </div>
  );
};

const QualityCheckCard = ({ check, navigate }) => (
  <div className="card" onClick={() => navigate('QUALITY_CHECK_DETAIL', { id: check.id })}>
    <div className="card-header">
      <h3 className="card-title">QC {check.id} for PO {check.orderId}</h3>
      <span className="card-status" style={{ backgroundColor: getStatusColor('QUALITY_CHECK', check.status) }}>
        {STATUS_MAP[check.status]}
      </span>
    </div>
    <div className="card-body">
      <p><strong>Type:</strong> {check.checkType}</p>
      <p><strong>Inspector:</strong> {check.inspector}</p>
      <p><strong>Date:</strong> {formatToLocaleDate(check.date)}</p>
    </div>
  </div>
);

const QualityCheckList = ({ checks, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredChecks = checks?.filter(check =>
    check.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    check.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    STATUS_MAP[check.status]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-page">
      <h2 className="screen-title">Quality Checks</h2>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        <input
          type="text"
          placeholder="Search quality checks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1, padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)' }}
        />
        <button className="button button--secondary">Filter</button>
        <button className="button button--secondary">Sort</button>
      </div>
      {(filteredChecks?.length ?? 0) > 0 ? (
        <div className="card-grid">
          {filteredChecks.map(check => (
            <QualityCheckCard key={check.id} check={check} navigate={navigate} />
          ))}
        </div>
      ) : (
        <EmptyState message="No quality checks found." ctaText="Schedule New Check" onCtaClick={() => alert('New Quality Check Form')} />
      )}
    </div>
  );
};

const ProductionOrderDetail = ({ orderId, navigate, goBack, currentUser }) => {
  const order = DUMMY_DATA.productionOrders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="detail-page">
        <h2 className="screen-title">Production Order Not Found</h2>
        <button className="button button--secondary" onClick={goBack}>Go Back</button>
      </div>
    );
  }

  const relatedQualityChecks = DUMMY_DATA.qualityChecks.filter(qc => qc.orderId === orderId);
  const relatedMachine = DUMMY_DATA.machines.find(m => m.id === order.assignedMachine);

  // Determine current workflow stage for visual tracker
  const currentStageIndex = PRODUCTION_ORDER_WORKFLOW.findIndex(stage => stage.stage === order.currentWorkflowStage);

  const canEdit = currentUser?.role === ROLES.PRODUCTION_MANAGER || currentUser?.role === ROLES.ADMIN;
  const canApprove = currentUser?.role === ROLES.PRODUCTION_MANAGER && order.status === 'PENDING_APPROVAL';

  return (
    <div className="detail-page">
      <div className="detail-header">
        <h2 className="detail-title">Production Order: {order.product} ({order.id})</h2>
        <span className="detail-status" style={{ backgroundColor: getStatusColor('PRODUCTION_ORDER', order.status) }}>
          {STATUS_MAP[order.status]}
        </span>
      </div>

      <div className="form-actions" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {canEdit && <button className="button button--secondary" onClick={() => alert(`Opening edit form for ${order.id}`)}>Edit Order</button>}
        {canApprove && <button className="button button--primary" onClick={() => alert(`Approving order ${order.id}`)}>Approve Order</button>}
        {(currentUser?.role === ROLES.PRODUCTION_MANAGER) && (
            <button className="button button--danger" onClick={() => alert(`Cancelling order ${order.id}`)}>Cancel Order</button>
        )}
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Workflow Progress</h3>
        <div className="workflow-tracker">
          {PRODUCTION_ORDER_WORKFLOW.map((wfStage, index) => (
            <div
              key={wfStage.stage}
              className={`workflow-stage ${index <= currentStageIndex ? 'active' : ''} ${index < currentStageIndex ? 'completed' : ''} ${wfStage.stage === 'IN_PROGRESS' && order.slaStatus === 'BREACHED' ? 'sla-breach' : ''}`}
            >
              <span className="workflow-stage-label">{wfStage.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Order Details</h3>
        <div className="detail-grid">
          <div className="detail-item"><strong>Product</strong><span>{order.product}</span></div>
          <div className="detail-item"><strong>Quantity</strong><span>{order.quantity}</span></div>
          <div className="detail-item"><strong>Priority</strong><span>{order.priority}</span></div>
          <div className="detail-item"><strong>Start Date</strong><span>{formatToLocaleDate(order.startDate)}</span></div>
          <div className="detail-item"><strong>End Date</strong><span>{formatToLocaleDate(order.endDate)}</span></div>
          <div className="detail-item"><strong>Assigned Machine</strong><span>{order.assignedMachine}</span></div>
          <div className="detail-item"><strong>Notes</strong><span>{order.notes}</span></div>
          <div className="detail-item"><strong>SLA Status</strong><span>{order.slaStatus}</span></div>
        </div>
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Related Records</h3>
        <div className="related-records-list">
          {relatedMachine && (
            <div className="related-record-item" onClick={() => navigate('MACHINE_DETAIL', { id: relatedMachine.id })}>
              <div>
                <div className="related-record-item-title">Machine: {relatedMachine.name}</div>
                <div className="related-record-item-subtitle">{relatedMachine.type} - {STATUS_MAP[relatedMachine.status]}</div>
              </div>
              <span style={{ fontSize: 'var(--font-size-lg)' }}>&gt;</span>
            </div>
          )}
          {relatedQualityChecks?.length > 0 ? (
            relatedQualityChecks.map(qc => (
              <div key={qc.id} className="related-record-item" onClick={() => navigate('QUALITY_CHECK_DETAIL', { id: qc.id })}>
                <div>
                  <div className="related-record-item-title">Quality Check: {qc.checkType} ({qc.id})</div>
                  <div className="related-record-item-subtitle">{STATUS_MAP[qc.status]} on {formatToLocaleDate(qc.date)}</div>
                </div>
                <span style={{ fontSize: 'var(--font-size-lg)' }}>&gt;</span>
              </div>
            ))
          ) : (
            <p>No related quality checks.</p>
          )}
        </div>
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Audit Log (Role-based visibility)</h3>
        {currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.PRODUCTION_MANAGER ? (
          <div className="related-records-list">
            {(order.auditLog ?? []).map((log, index) => (
              <div key={index} className="related-record-item">
                <div>
                  <div className="related-record-item-title">{log.action} by {log.user}</div>
                  <div className="related-record-item-subtitle">{log.details} at {new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You do not have permission to view audit logs.</p>
        )}
      </div>

      <div className="form-actions">
        <button className="button button--secondary" onClick={goBack}>Go Back</button>
      </div>
    </div>
  );
};

const MachineDetail = ({ machineId, navigate, goBack, currentUser }) => {
  const machine = DUMMY_DATA.machines.find(m => m.id === machineId);

  if (!machine) {
    return (
      <div className="detail-page">
        <h2 className="screen-title">Machine Not Found</h2>
        <button className="button button--secondary" onClick={goBack}>Go Back</button>
      </div>
    );
  }

  const canEdit = currentUser?.role === ROLES.MAINTENANCE_TEAM || currentUser?.role === ROLES.ADMIN;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <h2 className="detail-title">Machine: {machine.name} ({machine.id})</h2>
        <span className="detail-status" style={{ backgroundColor: getStatusColor('MACHINE', machine.status) }}>
          {STATUS_MAP[machine.status]}
        </span>
      </div>

      <div className="form-actions" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {canEdit && <button className="button button--secondary" onClick={() => alert(`Opening maintenance log for ${machine.id}`)}>Log Maintenance</button>}
        {canEdit && <button className="button button--primary" onClick={() => alert(`Updating status for ${machine.id}`)}>Update Status</button>}
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Machine Details</h3>
        <div className="detail-grid">
          <div className="detail-item"><strong>Type</strong><span>{machine.type}</span></div>
          <div className="detail-item"><strong>Location</strong><span>{machine.location}</span></div>
          <div className="detail-item"><strong>Utilization</strong><span>{machine.utilization}</span></div>
          <div className="detail-item"><strong>Last Maintenance</strong><span>{formatToLocaleDate(machine.lastMaintenance)}</span></div>
          <div className="detail-item"><strong>Next Maintenance</strong><span>{formatToLocaleDate(machine.nextMaintenance)}</span></div>
        </div>
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Production Orders (Related)</h3>
        <div className="related-records-list">
          {DUMMY_DATA.productionOrders
            .filter(po => po.assignedMachine === machine.id)
            .map(po => (
              <div key={po.id} className="related-record-item" onClick={() => navigate('PRODUCTION_ORDER_DETAIL', { id: po.id })}>
                <div>
                  <div className="related-record-item-title">Order: {po.product} ({po.id})</div>
                  <div className="related-record-item-subtitle">{STATUS_MAP[po.status]} - Due {formatToLocaleDate(po.endDate)}</div>
                </div>
                <span style={{ fontSize: 'var(--font-size-lg)' }}>&gt;</span>
              </div>
            ))}
        </div>
      </div>

      <div className="form-actions">
        <button className="button button--secondary" onClick={goBack}>Go Back</button>
      </div>
    </div>
  );
};

const QualityCheckDetail = ({ checkId, navigate, goBack, currentUser }) => {
  const check = DUMMY_DATA.qualityChecks.find(qc => qc.id === checkId);

  if (!check) {
    return (
      <div className="detail-page">
        <h2 className="screen-title">Quality Check Not Found</h2>
        <button className="button button--secondary" onClick={goBack}>Go Back</button>
      </div>
    );
  }

  const relatedOrder = DUMMY_DATA.productionOrders.find(po => po.id === check.orderId);
  const canEdit = currentUser?.role === ROLES.QUALITY_INSPECTOR || currentUser?.role === ROLES.ADMIN;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <h2 className="detail-title">Quality Check: {check.checkType} ({check.id})</h2>
        <span className="detail-status" style={{ backgroundColor: getStatusColor('QUALITY_CHECK', check.status) }}>
          {STATUS_MAP[check.status]}
        </span>
      </div>

      <div className="form-actions" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {canEdit && <button className="button button--primary" onClick={() => alert(`Submit results for ${check.id}`)}>Submit Results</button>}
        {canEdit && <button className="button button--secondary" onClick={() => alert(`Edit check ${check.id}`)}>Edit Check</button>}
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Check Details</h3>
        <div className="detail-grid">
          <div className="detail-item"><strong>Check Type</strong><span>{check.checkType}</span></div>
          <div className="detail-item"><strong>Inspector</strong><span>{check.inspector}</span></div>
          <div className="detail-item"><strong>Date</strong><span>{formatToLocaleDate(check.date)}</span></div>
          <div className="detail-item"><strong>Result</strong><span>{check.result}</span></div>
          <div className="detail-item"><strong>Notes</strong><span>{check.notes}</span></div>
        </div>
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Related Production Order</h3>
        {relatedOrder ? (
          <div className="related-records-list">
            <div className="related-record-item" onClick={() => navigate('PRODUCTION_ORDER_DETAIL', { id: relatedOrder.id })}>
              <div>
                <div className="related-record-item-title">Order: {relatedOrder.product} ({relatedOrder.id})</div>
                <div className="related-record-item-subtitle">{STATUS_MAP[relatedOrder.status]} - Due {formatToLocaleDate(relatedOrder.endDate)}</div>
              </div>
              <span style={{ fontSize: 'var(--font-size-lg)' }}>&gt;</span>
            </div>
          </div>
        ) : (
          <p>No related production order found.</p>
        )}
      </div>

      <div className="form-actions">
        <button className="button button--secondary" onClick={goBack}>Go Back</button>
      </div>
    </div>
  );
};

const Dashboard = ({ navigate, currentUser }) => {
  const kpis = [
    { label: 'Active Orders', value: DUMMY_DATA.productionOrders.filter(po => po.status === 'IN_PROGRESS').length },
    { label: 'Idle Machines', value: DUMMY_DATA.machines.filter(m => m.status === 'IDLE').length },
    { label: 'QC Pending', value: DUMMY_DATA.qualityChecks.filter(qc => qc.status === 'SCHEDULED' || qc.status === 'INSPECTING').length },
    { label: 'SLA Breaches', value: DUMMY_DATA.productionOrders.filter(po => po.slaStatus === 'BREACHED').length },
  ];

  return (
    <div className="dashboard-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">
            Key Performance Indicators
            <button className="button button--primary" onClick={() => alert('Refreshing KPIs...')}>Refresh</button>
          </h2>
          <div className="kpi-grid">
            {kpis.map((kpi, index) => (
              <div key={index} className="kpi-card">
                <span className="kpi-value">{kpi.value}</span>
                <span className="kpi-label">{kpi.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-section-title">
            Production Order Overview
            <button className="button button--secondary" onClick={() => navigate('PRODUCTION_ORDERS')}>View All</button>
          </h2>
          <div className="chart-container">Bar Chart: Production Orders by Status</div>
          <div className="card-grid">
            {DUMMY_DATA.productionOrders.slice(0, 3).map(order => (
              <ProductionOrderCard key={order.id} order={order} navigate={navigate} currentUser={currentUser} />
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-section-title">
            Machine Utilization
            <button className="button button--secondary" onClick={() => navigate('MACHINE_MANAGEMENT')}>View All</button>
          </h2>
          <div className="chart-container">Line Chart: Machine Utilization Trends</div>
          <div className="card-grid">
            {DUMMY_DATA.machines.slice(0, 3).map(machine => (
              <MachineCard key={machine.id} machine={machine} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">
            Quality Control Insights
            <button className="button button--secondary" onClick={() => navigate('QUALITY_CHECKS')}>View All</button>
          </h2>
          <div className="chart-container">Donut Chart: Quality Check Results</div>
          <div className="chart-actions">
              <button className="button button--secondary">Export PDF</button>
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Recent Activities</h2>
          <div className="recent-activities-list">
            {DUMMY_DATA.recentActivities.slice(0, 5).map(activity => (
              <div key={activity.id} className="activity-item">
                <span className="activity-item-title">{activity.title}</span>
                <span className="activity-item-timestamp">{new Date(activity.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Alerts & Notifications</h2>
          <div className="recent-activities-list">
              <div className="activity-item" style={{ borderColor: 'var(--color-warning)' }}>
                  <span className="activity-item-title">Material Shortage: PO005 Component Y</span>
                  <span className="activity-item-timestamp">2023-10-29 11:00 AM</span>
              </div>
              <div className="activity-item" style={{ borderColor: 'var(--color-danger)' }}>
                  <span className="activity-item-title">SLA Breach: PO005 approval overdue</span>
                  <span className="activity-item-timestamp">2023-10-27 09:00 AM</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [view, setView] = useState({ screen: 'LOGIN', params: {} });
  const [currentUser, setCurrentUser] = useState(null);
  const [history, setHistory] = useState([]); // For breadcrumbs / back navigation

  // Define navigate within App scope
  const navigate = (screen, params = {}) => {
    // Prevent adding identical consecutive views to history
    if ((history.length === 0) || (history[history.length - 1].screen !== view.screen) || (JSON.stringify(history[history.length - 1].params) !== JSON.stringify(view.params))) {
      setHistory(prev => [...prev, view]); // Save current view to history
    }
    setView({ screen, params });
  };

  // Define goBack within App scope
  const goBack = () => {
    if (history.length > 0) {
      const previousView = history[history.length - 1];
      setHistory(prev => prev.slice(0, prev.length - 1));
      setView(previousView);
    } else {
      navigate('DASHBOARD'); // Default to dashboard if no history
    }
  };

  // Logout handler (already defined above within Header scope to keep it close to usage)
  // Re-defining for app-level control if needed, but not strictly required by problem statement here
  // const handleLogout = () => { /* ... */ };

  // Session timeout simulation
  useEffect(() => {
    let timeout;
    if (currentUser) {
      timeout = setTimeout(() => {
        alert('Session timed out. Please log in again.');
        setCurrentUser(null);
        setHistory([]); // Clear history on logout/timeout
        setView({ screen: 'LOGIN', params: {} });
      }, 10 * 60 * 1000); // 10 minutes session timeout for demo
    }
    return () => clearTimeout(timeout);
  }, [currentUser]);

  // Conditional rendering based on view.screen
  const renderScreen = () => {
    if (!currentUser && view.screen !== 'LOGIN') {
      // Ensure redirect to login if not authenticated
      return <LoginScreen setCurrentUser={setCurrentUser} navigate={navigate} />;
    }

    switch (view.screen) {
      case 'LOGIN': return <LoginScreen setCurrentUser={setCurrentUser} navigate={navigate} />;
      case 'DASHBOARD': return <Dashboard navigate={navigate} currentUser={currentUser} />;
      case 'PRODUCTION_ORDERS': return <ProductionOrderList orders={DUMMY_DATA.productionOrders} navigate={navigate} currentUser={currentUser} />;
      case 'MACHINE_MANAGEMENT': return <MachineList machines={DUMMY_DATA.machines} navigate={navigate} currentUser={currentUser} />;
      case 'QUALITY_CHECKS': return <QualityCheckList checks={DUMMY_DATA.qualityChecks} navigate={navigate} currentUser={currentUser} />;
      case 'PRODUCTION_ORDER_DETAIL': return <ProductionOrderDetail orderId={view.params.id} navigate={navigate} goBack={goBack} currentUser={currentUser} />;
      case 'MACHINE_DETAIL': return <MachineDetail machineId={view.params.id} navigate={navigate} goBack={goBack} currentUser={currentUser} />;
      case 'QUALITY_CHECK_DETAIL': return <QualityCheckDetail checkId={view.params.id} navigate={navigate} goBack={goBack} currentUser={currentUser} />;
      default: return (
        <div className="detail-page">
          <h2 className="screen-title">404 - Page Not Found</h2>
          <p>The screen "{view.screen}" does not exist.</p>
          <button className="button button--secondary" onClick={() => navigate('DASHBOARD')}>Go to Dashboard</button>
        </div>
      );
    }
  };

  // Breadcrumb logic for Header
  const getBreadcrumbs = () => {
    const currentBreadcrumbs = [];
    if (view.screen !== 'DASHBOARD' && view.screen !== 'LOGIN') {
      currentBreadcrumbs.push({ label: 'Dashboard', screen: 'DASHBOARD' });
    }

    // Explicit parentheses for operator precedence
    if (view.screen === 'PRODUCTION_ORDERS') {
      currentBreadcrumbs.push({ label: 'Production Orders', screen: 'PRODUCTION_ORDERS' });
    } else if (view.screen === 'PRODUCTION_ORDER_DETAIL') {
      currentBreadcrumbs.push({ label: 'Production Orders', screen: 'PRODUCTION_ORDERS' });
      currentBreadcrumbs.push({ label: `Order #${view.params.id}`, screen: 'PRODUCTION_ORDER_DETAIL', params: { id: view.params.id } });
    } else if (view.screen === 'MACHINE_MANAGEMENT') {
      currentBreadcrumbs.push({ label: 'Machine Management', screen: 'MACHINE_MANAGEMENT' });
    } else if (view.screen === 'MACHINE_DETAIL') {
      currentBreadcrumbs.push({ label: 'Machine Management', screen: 'MACHINE_MANAGEMENT' });
      currentBreadcrumbs.push({ label: `Machine ${view.params.id}`, screen: 'MACHINE_DETAIL', params: { id: view.params.id } });
    } else if (view.screen === 'QUALITY_CHECKS') {
      currentBreadcrumbs.push({ label: 'Quality Checks', screen: 'QUALITY_CHECKS' });
    } else if (view.screen === 'QUALITY_CHECK_DETAIL') {
      currentBreadcrumbs.push({ label: 'Quality Checks', screen: 'QUALITY_CHECKS' });
      currentBreadcrumbs.push({ label: `Check #${view.params.id}`, screen: 'QUALITY_CHECK_DETAIL', params: { id: view.params.id } });
    }
    return currentBreadcrumbs;
  };

  const getScreenTitle = () => {
    switch (view.screen) {
      case 'LOGIN': return 'Login';
      case 'DASHBOARD': return 'Dashboard';
      case 'PRODUCTION_ORDERS': return 'Production Orders';
      case 'MACHINE_MANAGEMENT': return 'Machine Management';
      case 'QUALITY_CHECKS': return 'Quality Checks';
      case 'PRODUCTION_ORDER_DETAIL': return `Order #${view.params.id}`;
      case 'MACHINE_DETAIL': return `Machine ${view.params.id}`;
      case 'QUALITY_CHECK_DETAIL': return `Quality Check #${view.params.id}`;
      default: return 'App'; // Fallback title
    }
  };

  return (
    <div className="app-container">
      {currentUser && view.screen !== 'LOGIN' && (
        <Header
          currentUser={currentUser}
          navigate={navigate}
          goBack={goBack}
          screenTitle={getScreenTitle()}
          showBreadcrumbs={view.screen !== 'DASHBOARD' && view.screen !== 'LOGIN'}
          breadcrumbs={getBreadcrumbs()}
          setCurrentUser={setCurrentUser} // Pass setCurrentUser to Header for logout
        />
      )}
      <main className={`main-content ${view.screen === 'LOGIN' ? 'main-content--login' : ''}`}>
        {currentUser && view.screen !== 'LOGIN' && <GlobalSearch />}
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;