import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ScandalBoard from './pages/ScandalBoard';
import SubmitTip from './pages/SubmitTip';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminTipReview from './pages/AdminTipReview';
import AdminManage from './pages/AdminManage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/scandal/:id" element={<ScandalBoard />} />
        <Route path="/submit" element={<SubmitTip />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/tips/:id" element={<AdminTipReview />} />
        <Route path="/admin/manage" element={<AdminManage />} />
      </Route>
    </Routes>
  );
}
