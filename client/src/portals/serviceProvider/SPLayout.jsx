import AppLayout from '../../components/AppLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LockIcon from '@mui/icons-material/Lock';
import GavelIcon from '@mui/icons-material/Gavel';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import ContactsIcon from '@mui/icons-material/Contacts';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RepeatIcon from '@mui/icons-material/Repeat';
import SavingsIcon from '@mui/icons-material/Savings';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SecurityIcon from '@mui/icons-material/Security';
import PercentIcon from '@mui/icons-material/Percent';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import CodeIcon from '@mui/icons-material/Code';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TableChartIcon from '@mui/icons-material/TableChart';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingsIcon from '@mui/icons-material/Settings';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CloudIcon from '@mui/icons-material/Cloud';
import WebhookIcon from '@mui/icons-material/Webhook';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CalculateIcon from '@mui/icons-material/Calculate';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AssignmentIcon from '@mui/icons-material/Assignment';

const navItems = [
  { label: 'Dashboard', path: '/service-provider', icon: <DashboardIcon /> },

  // --- Orchestration & Compliance ---
  { divider: true, label: 'Orchestration' },
  { label: 'Applications', path: '/service-provider/applications', icon: <AssignmentIcon /> },
  { label: 'Ledger & Transactions', path: '/service-provider/ledger', icon: <ReceiptLongIcon /> },
  { label: 'KYC & Onboarding', path: '/service-provider/kyc', icon: <VerifiedUserIcon /> },
  { label: 'Screening', path: '/service-provider/screening', icon: <ShieldIcon /> },
  { label: 'CRM Customers', path: '/service-provider/crm', icon: <ContactsIcon /> },
  { label: 'CVM Campaigns', path: '/service-provider/campaigns', icon: <CampaignIcon /> },
  { label: 'Workflows', path: '/service-provider/workflows', icon: <AccountTreeIcon /> },

  // --- Organization ---
  { divider: true, label: 'Organization' },
  { label: 'Offices', path: '/service-provider/offices', icon: <BusinessIcon /> },
  { label: 'Staff', path: '/service-provider/staff', icon: <PeopleIcon /> },
  { label: 'Clients', path: '/service-provider/clients', icon: <PersonIcon /> },
  { label: 'Currencies', path: '/service-provider/currencies', icon: <CurrencyExchangeIcon /> },
  { label: 'Payment Types', path: '/service-provider/payment-types', icon: <PaymentIcon /> },
  { label: 'Holidays', path: '/service-provider/holidays', icon: <EventIcon /> },
  { label: 'Working Days', path: '/service-provider/working-days', icon: <CalendarTodayIcon /> },
  { label: 'Tellers & Cashiers', path: '/service-provider/tellers', icon: <PointOfSaleIcon /> },
  { label: 'Bulk Import', path: '/service-provider/bulk-import', icon: <UploadFileIcon /> },
  { label: 'Standing Instructions', path: '/service-provider/standing-instructions', icon: <RepeatIcon /> },

  // --- Products ---
  { divider: true, label: 'Products' },
  { label: 'Fixed Deposits', path: '/service-provider/fixed-deposit-products', icon: <SavingsIcon /> },
  { label: 'Recurring Deposits', path: '/service-provider/recurring-deposit-products', icon: <AutorenewIcon /> },
  { label: 'Share Products', path: '/service-provider/share-products', icon: <PieChartIcon /> },
  { label: 'Floating Rates', path: '/service-provider/floating-rates', icon: <TrendingUpIcon /> },
  { label: 'Products Mix', path: '/service-provider/products-mix', icon: <ShuffleIcon /> },
  { label: 'Collaterals', path: '/service-provider/collaterals', icon: <SecurityIcon /> },
  { label: 'Tax Components', path: '/service-provider/tax-components', icon: <PercentIcon /> },
  { label: 'Tax Groups', path: '/service-provider/tax-groups', icon: <CategoryIcon /> },
  { label: 'Delinquency Ranges', path: '/service-provider/delinquency-ranges', icon: <WarningIcon /> },
  { label: 'Delinquency Buckets', path: '/service-provider/delinquency-buckets', icon: <WarningIcon /> },

  // --- Accounting ---
  { divider: true, label: 'Accounting' },
  { label: 'GL Accounts', path: '/service-provider/gl-accounts', icon: <AccountBalanceIcon /> },
  { label: 'Journal Entries', path: '/service-provider/journal-entries', icon: <ReceiptLongIcon /> },
  { label: 'Frequent Postings', path: '/service-provider/frequent-postings', icon: <BookmarkIcon /> },
  { label: 'GL Closures', path: '/service-provider/gl-closures', icon: <LockIcon /> },
  { label: 'Accounting Rules', path: '/service-provider/accounting-rules', icon: <GavelIcon /> },
  { label: 'Activity Mappings', path: '/service-provider/financial-activity-mappings', icon: <SwapHorizIcon /> },
  { label: 'Periodic Accruals', path: '/service-provider/periodic-accruals', icon: <CalculateIcon /> },
  { label: 'Provisioning Entries', path: '/service-provider/provisioning-entries', icon: <PlaylistAddCheckIcon /> },
  { label: 'Provisioning Criteria', path: '/service-provider/provisioning-criteria', icon: <PlaylistAddCheckIcon /> },

  // --- System Admin ---
  { divider: true, label: 'System' },
  { label: 'Codes', path: '/service-provider/codes', icon: <CodeIcon /> },
  { label: 'Roles & Permissions', path: '/service-provider/roles', icon: <AdminPanelSettingsIcon /> },
  { label: 'Data Tables', path: '/service-provider/data-tables', icon: <TableChartIcon /> },
  { label: 'Maker Checker', path: '/service-provider/maker-checker', icon: <FactCheckIcon /> },
  { label: 'Scheduler Jobs', path: '/service-provider/scheduler-jobs', icon: <ScheduleIcon /> },
  { label: 'Global Config', path: '/service-provider/configurations', icon: <SettingsIcon /> },
  { label: 'Account No. Prefs', path: '/service-provider/account-number-preferences', icon: <FormatListNumberedIcon /> },
  { label: 'External Services', path: '/service-provider/external-services', icon: <CloudIcon /> },
  { label: 'Hooks', path: '/service-provider/hooks', icon: <WebhookIcon /> },

  // --- Reporting ---
  { divider: true, label: 'Reporting' },
  { label: 'Reports', path: '/service-provider/reports', icon: <AssessmentIcon /> },
  { label: 'Audit Trail', path: '/service-provider/audits', icon: <HistoryIcon /> },
];

export default function SPLayout() {
  return <AppLayout navItems={navItems} portalName="Service Provider Portal" portalColor="#333333" />;
}
