import AppLayout from '../../components/AppLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const navItems = [
  { label: 'Dashboard', path: '/customer', icon: <DashboardIcon /> },
  { label: 'Wealth Products', path: '/customer/wealth-products', icon: <StorefrontIcon /> },
  { label: 'My Onboarding', path: '/customer/onboarding', icon: <AssignmentTurnedInIcon /> },
  { label: 'Loan Products', path: '/customer/loan-products', icon: <CreditCardIcon /> },
  { label: 'Savings Products', path: '/customer/savings-products', icon: <SavingsIcon /> },
  { label: 'Compare Products', path: '/customer/compare', icon: <CompareArrowsIcon /> },
];

export default function CustomerLayout() {
  return <AppLayout navItems={navItems} portalName="Customer Portal" portalColor="#1565c0" />;
}
