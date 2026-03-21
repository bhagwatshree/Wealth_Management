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

const navItems = [
  { label: 'Dashboard', path: '/service-provider', icon: <DashboardIcon /> },
  { label: 'KYC & Onboarding', path: '/service-provider/kyc', icon: <VerifiedUserIcon /> },
  { label: 'Screening', path: '/service-provider/screening', icon: <ShieldIcon /> },
  { label: 'CRM Customers', path: '/service-provider/crm', icon: <ContactsIcon /> },
  { label: 'CVM Campaigns', path: '/service-provider/campaigns', icon: <CampaignIcon /> },
  { label: 'Workflows', path: '/service-provider/workflows', icon: <AccountTreeIcon /> },
  { label: 'Offices', path: '/service-provider/offices', icon: <BusinessIcon /> },
  { label: 'Staff', path: '/service-provider/staff', icon: <PeopleIcon /> },
  { label: 'Clients', path: '/service-provider/clients', icon: <PersonIcon /> },
  { label: 'GL Accounts', path: '/service-provider/gl-accounts', icon: <AccountBalanceIcon /> },
  { label: 'Journal Entries', path: '/service-provider/journal-entries', icon: <ReceiptLongIcon /> },
  { label: 'GL Closures', path: '/service-provider/gl-closures', icon: <LockIcon /> },
  { label: 'Accounting Rules', path: '/service-provider/accounting-rules', icon: <GavelIcon /> },
  { label: 'Currencies', path: '/service-provider/currencies', icon: <CurrencyExchangeIcon /> },
  { label: 'Payment Types', path: '/service-provider/payment-types', icon: <PaymentIcon /> },
  { label: 'Reports', path: '/service-provider/reports', icon: <AssessmentIcon /> },
  { label: 'Audit Trail', path: '/service-provider/audits', icon: <HistoryIcon /> },
];

export default function SPLayout() {
  return <AppLayout navItems={navItems} portalName="Service Provider Portal" portalColor="#e65100" />;
}
