import AppLayout from '../../components/AppLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const navItems = [
  { label: 'Dashboard', path: '/customer', icon: <DashboardIcon /> },
  { label: 'Wealth Products', path: '/customer/wealth-products', icon: <StorefrontIcon /> },
  { label: 'Loan Products', path: '/customer/loan-products', icon: <CreditCardIcon /> },
  { label: 'Savings Products', path: '/customer/savings-products', icon: <SavingsIcon /> },
  { label: 'Compare Products', path: '/customer/compare', icon: <CompareArrowsIcon /> },
  { label: 'My Applications', path: '/customer/my-applications', icon: <AssignmentIcon /> },
  { label: 'Transactions', path: '/customer/transactions', icon: <ReceiptLongIcon /> },
  { label: 'eKYC Verification', path: '/customer/kyc', icon: <VerifiedUserIcon /> },
  { label: 'My Account', path: '/customer/my-account', icon: <AccountCircleIcon /> },
];

export default function CustomerLayout() {
  return <AppLayout navItems={navItems} portalName="Customer Portal" portalColor="#E60000" />;
}
