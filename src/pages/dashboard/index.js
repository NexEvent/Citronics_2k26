import DashboardView from 'src/views/dashboard'

/**
 * Dashboard Page
 * Main dashboard entry point
 */
const Dashboard = () => {
  return <DashboardView />
}

// Page configuration
Dashboard.acl = {
  action: 'read',
  subject: 'dashboard'
}

export default Dashboard
