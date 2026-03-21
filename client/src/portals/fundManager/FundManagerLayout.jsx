import AppLayout from '../../components/AppLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const navItems = [
  { label: 'Dashboard', path: '/fund-manager', icon: <DashboardIcon /> },
  { label: 'Product Catalog', path: '/fund-manager/product-catalog', icon: <StorefrontIcon /> },
  { label: 'NAV Management', path: '/fund-manager/nav', icon: <TrendingUpIcon /> },
  { label: 'Loan Products', path: '/fund-manager/loan-products', icon: <CreditCardIcon /> },
  { label: 'Savings Products', path: '/fund-manager/savings-products', icon: <SavingsIcon /> },
  { label: 'Charges', path: '/fund-manager/charges', icon: <ReceiptIcon /> },
  { label: 'Funds', path: '/fund-manager/funds', icon: <AccountBalanceWalletIcon /> },
];

export default function FundManagerLayout() {
  return <AppLayout navItems={navItems} portalName="Fund Manager Portal" portalColor="#00897b" />;
}
