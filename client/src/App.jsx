import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ROLES, ROLE_PATHS } from './hooks/useAuth';

// Auth pages
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import KYCPage from './components/KYCPage';

// Customer Portal
import CustomerLayout from './portals/customer/CustomerLayout';
import CustomerDashboard from './portals/customer/CustomerDashboard';
import LoanProductsList from './portals/customer/LoanProductsList';
import SavingsProductsList from './portals/customer/SavingsProductsList';
import ProductDetail from './portals/customer/ProductDetail';
import CompareProducts from './portals/customer/CompareProducts';
import WealthProducts from './portals/customer/WealthProducts';
import CustomerOnboarding from './portals/customer/CustomerOnboarding';

// Fund Manager Portal
import FundManagerLayout from './portals/fundManager/FundManagerLayout';
import FMDashboard from './portals/fundManager/FMDashboard';
import ManageLoanProducts from './portals/fundManager/ManageLoanProducts';
import ManageSavingsProducts from './portals/fundManager/ManageSavingsProducts';
import ManageCharges from './portals/fundManager/ManageCharges';
import ManageFunds from './portals/fundManager/ManageFunds';
import ManageProductCatalog from './portals/fundManager/ManageProductCatalog';
import ManageNAV from './portals/fundManager/ManageNAV';

// Service Provider Portal
import SPLayout from './portals/serviceProvider/SPLayout';
import SPDashboard from './portals/serviceProvider/SPDashboard';
import ManageOffices from './portals/serviceProvider/ManageOffices';
import ManageStaff from './portals/serviceProvider/ManageStaff';
import ManageClients from './portals/serviceProvider/ManageClients';
import GLAccounts from './portals/serviceProvider/GLAccounts';
import JournalEntries from './portals/serviceProvider/JournalEntries';
import GLClosures from './portals/serviceProvider/GLClosures';
import AccountingRules from './portals/serviceProvider/AccountingRules';
import CurrencyConfig from './portals/serviceProvider/CurrencyConfig';
import PaymentTypes from './portals/serviceProvider/PaymentTypes';
import Reports from './portals/serviceProvider/Reports';
import ReportRunner from './portals/serviceProvider/ReportRunner';
import AuditTrail from './portals/serviceProvider/AuditTrail';
import ManageKYC from './portals/serviceProvider/ManageKYC';
import ManageScreening from './portals/serviceProvider/ManageScreening';
import ManageCRM from './portals/serviceProvider/ManageCRM';
import ManageCampaigns from './portals/serviceProvider/ManageCampaigns';
import ManageWorkflows from './portals/serviceProvider/ManageWorkflows';

function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user.kycComplete) return <Navigate to="/kyc" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={ROLE_PATHS[user.role]} />;
  return children;
}

function AuthRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user.kycComplete) return <Navigate to="/kyc" />;
  return <Navigate to={ROLE_PATHS[user.role]} />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* KYC - needs auth but not KYC completion */}
      <Route path="/kyc" element={<KYCPage />} />

      {/* Root redirect */}
      <Route path="/" element={<AuthRedirect />} />

      {/* Customer Portal - only for customer role */}
      <Route path="/customer" element={
        <ProtectedRoute allowedRole={ROLES.CUSTOMER}><CustomerLayout /></ProtectedRoute>
      }>
        <Route index element={<CustomerDashboard />} />
        <Route path="wealth-products" element={<WealthProducts />} />
        <Route path="onboarding" element={<CustomerOnboarding />} />
        <Route path="loan-products" element={<LoanProductsList />} />
        <Route path="savings-products" element={<SavingsProductsList />} />
        <Route path="product/:type/:id" element={<ProductDetail />} />
        <Route path="compare" element={<CompareProducts />} />
      </Route>

      {/* Fund Manager Portal - only for fund_manager role */}
      <Route path="/fund-manager" element={
        <ProtectedRoute allowedRole={ROLES.FUND_MANAGER}><FundManagerLayout /></ProtectedRoute>
      }>
        <Route index element={<FMDashboard />} />
        <Route path="product-catalog" element={<ManageProductCatalog />} />
        <Route path="nav" element={<ManageNAV />} />
        <Route path="loan-products" element={<ManageLoanProducts />} />
        <Route path="savings-products" element={<ManageSavingsProducts />} />
        <Route path="charges" element={<ManageCharges />} />
        <Route path="funds" element={<ManageFunds />} />
      </Route>

      {/* Service Provider Portal - only for service_provider role */}
      <Route path="/service-provider" element={
        <ProtectedRoute allowedRole={ROLES.SERVICE_PROVIDER}><SPLayout /></ProtectedRoute>
      }>
        <Route index element={<SPDashboard />} />
        <Route path="kyc" element={<ManageKYC />} />
        <Route path="screening" element={<ManageScreening />} />
        <Route path="crm" element={<ManageCRM />} />
        <Route path="campaigns" element={<ManageCampaigns />} />
        <Route path="workflows" element={<ManageWorkflows />} />
        <Route path="offices" element={<ManageOffices />} />
        <Route path="staff" element={<ManageStaff />} />
        <Route path="clients" element={<ManageClients />} />
        <Route path="gl-accounts" element={<GLAccounts />} />
        <Route path="journal-entries" element={<JournalEntries />} />
        <Route path="gl-closures" element={<GLClosures />} />
        <Route path="accounting-rules" element={<AccountingRules />} />
        <Route path="currencies" element={<CurrencyConfig />} />
        <Route path="payment-types" element={<PaymentTypes />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:name" element={<ReportRunner />} />
        <Route path="audits" element={<AuditTrail />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<AuthRedirect />} />
    </Routes>
  );
}
