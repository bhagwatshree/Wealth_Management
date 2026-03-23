import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ROLES, ROLE_PATHS } from './hooks/useAuth';
import LoadingSpinner from './components/LoadingSpinner';

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
import MyAccount from './portals/customer/MyAccount';
import MyApplications from './portals/customer/MyApplications';
import TransactionHistory from './portals/customer/TransactionHistory';
import EKYCPage from './portals/customer/EKYCPage';

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

// Organization modules
import ManageHolidays from './portals/serviceProvider/ManageHolidays';
import ManageWorkingDays from './portals/serviceProvider/ManageWorkingDays';
import ManageTellers from './portals/serviceProvider/ManageTellers';
import BulkImport from './portals/serviceProvider/BulkImport';
import StandingInstructions from './portals/serviceProvider/StandingInstructions';

// Product modules
import FixedDepositProducts from './portals/serviceProvider/FixedDepositProducts';
import RecurringDepositProducts from './portals/serviceProvider/RecurringDepositProducts';
import ShareProducts from './portals/serviceProvider/ShareProducts';
import FloatingRates from './portals/serviceProvider/FloatingRates';
import ProductsMix from './portals/serviceProvider/ProductsMix';
import ManageCollaterals from './portals/serviceProvider/ManageCollaterals';
import TaxComponents from './portals/serviceProvider/TaxComponents';
import TaxGroups from './portals/serviceProvider/TaxGroups';
import DelinquencyRanges from './portals/serviceProvider/DelinquencyRanges';
import DelinquencyBuckets from './portals/serviceProvider/DelinquencyBuckets';

// Accounting modules
import FinancialActivityMappings from './portals/serviceProvider/FinancialActivityMappings';
import FrequentPostings from './portals/serviceProvider/FrequentPostings';
import PeriodicAccruals from './portals/serviceProvider/PeriodicAccruals';
import ProvisioningEntries from './portals/serviceProvider/ProvisioningEntries';
import ProvisioningCriteria from './portals/serviceProvider/ProvisioningCriteria';

// System Admin modules
import ManageCodes from './portals/serviceProvider/ManageCodes';
import ManageRoles from './portals/serviceProvider/ManageRoles';
import ManageDataTables from './portals/serviceProvider/ManageDataTables';
import MakerCheckerTasks from './portals/serviceProvider/MakerCheckerTasks';
import SchedulerJobs from './portals/serviceProvider/SchedulerJobs';
import GlobalConfigurations from './portals/serviceProvider/GlobalConfigurations';
import AccountNumberPreferences from './portals/serviceProvider/AccountNumberPreferences';
import ExternalServices from './portals/serviceProvider/ExternalServices';
import ManageHooks from './portals/serviceProvider/ManageHooks';
import ApplicationManagement from './portals/serviceProvider/ApplicationManagement';
import LedgerTransactions from './portals/serviceProvider/LedgerTransactions';

function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={ROLE_PATHS[user.role]} />;
  return children;
}

function AuthRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
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
        <Route path="my-account" element={<MyAccount />} />
        <Route path="kyc" element={<EKYCPage />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="transactions" element={<TransactionHistory />} />
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

        {/* Orchestration & Compliance */}
        <Route path="applications" element={<ApplicationManagement />} />
        <Route path="ledger" element={<LedgerTransactions />} />
        <Route path="kyc" element={<ManageKYC />} />
        <Route path="screening" element={<ManageScreening />} />
        <Route path="crm" element={<ManageCRM />} />
        <Route path="campaigns" element={<ManageCampaigns />} />
        <Route path="workflows" element={<ManageWorkflows />} />

        {/* Organization */}
        <Route path="offices" element={<ManageOffices />} />
        <Route path="staff" element={<ManageStaff />} />
        <Route path="clients" element={<ManageClients />} />
        <Route path="currencies" element={<CurrencyConfig />} />
        <Route path="payment-types" element={<PaymentTypes />} />
        <Route path="holidays" element={<ManageHolidays />} />
        <Route path="working-days" element={<ManageWorkingDays />} />
        <Route path="tellers" element={<ManageTellers />} />
        <Route path="bulk-import" element={<BulkImport />} />
        <Route path="standing-instructions" element={<StandingInstructions />} />

        {/* Products */}
        <Route path="fixed-deposit-products" element={<FixedDepositProducts />} />
        <Route path="recurring-deposit-products" element={<RecurringDepositProducts />} />
        <Route path="share-products" element={<ShareProducts />} />
        <Route path="floating-rates" element={<FloatingRates />} />
        <Route path="products-mix" element={<ProductsMix />} />
        <Route path="collaterals" element={<ManageCollaterals />} />
        <Route path="tax-components" element={<TaxComponents />} />
        <Route path="tax-groups" element={<TaxGroups />} />
        <Route path="delinquency-ranges" element={<DelinquencyRanges />} />
        <Route path="delinquency-buckets" element={<DelinquencyBuckets />} />

        {/* Accounting */}
        <Route path="gl-accounts" element={<GLAccounts />} />
        <Route path="journal-entries" element={<JournalEntries />} />
        <Route path="frequent-postings" element={<FrequentPostings />} />
        <Route path="gl-closures" element={<GLClosures />} />
        <Route path="accounting-rules" element={<AccountingRules />} />
        <Route path="financial-activity-mappings" element={<FinancialActivityMappings />} />
        <Route path="periodic-accruals" element={<PeriodicAccruals />} />
        <Route path="provisioning-entries" element={<ProvisioningEntries />} />
        <Route path="provisioning-criteria" element={<ProvisioningCriteria />} />

        {/* System Admin */}
        <Route path="codes" element={<ManageCodes />} />
        <Route path="roles" element={<ManageRoles />} />
        <Route path="data-tables" element={<ManageDataTables />} />
        <Route path="maker-checker" element={<MakerCheckerTasks />} />
        <Route path="scheduler-jobs" element={<SchedulerJobs />} />
        <Route path="configurations" element={<GlobalConfigurations />} />
        <Route path="account-number-preferences" element={<AccountNumberPreferences />} />
        <Route path="external-services" element={<ExternalServices />} />
        <Route path="hooks" element={<ManageHooks />} />

        {/* Reports */}
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:name" element={<ReportRunner />} />
        <Route path="audits" element={<AuditTrail />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<AuthRedirect />} />
    </Routes>
  );
}
