import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import PublicLayout from "@/components/PublicLayout";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "./pages/NotFound";
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  UtensilsCrossed,
  Trash2,
  Settings,
  Home,
  PlusCircle,
  BarChart2,
  CalendarDays,
} from 'lucide-react';

// Public pages
import LandingPage from "@/pages/public/LandingPage";

import MenuSekolahPage from "@/pages/public/MenuSekolahPage";
import LaporanPage from "@/pages/public/MBGChatbot";
import MonitoringKasusPage from "@/pages/public/MonitoringKasusPage";
import EdukasiPage from "@/pages/public/EdukasiPage";
import AIScannerPage from "@/pages/public/AIScannerPage";
import LoginPage from "@/pages/LoginPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManajemenLaporan from "@/pages/admin/ManajemenLaporan";
import DataSPPGPage from "@/pages/admin/DataSPPGPage";
import DataMakananPage from "@/pages/admin/DataMakananPage";
import DataSampahPage from "@/pages/admin/DataSampahPage";
import PengaturanPage from "@/pages/admin/PengaturanPage";

// SPPG pages
import SPPGBeranda from "@/pages/sppg/SPPGBeranda";
import InputMenuPage from "@/pages/sppg/InputMenuPage";
import SPPGMonitoringSampah from "@/pages/sppg/SPPGMonitoringSampah";
import RiwayatMenuPage from "@/pages/sppg/RiwayatMenuPage";

// Sekolah pages
import SekolahBeranda from "@/pages/sekolah/SekolahBeranda";
import InputSampahPage from "@/pages/sekolah/InputSampahPage";
import RiwayatSampahPage from "@/pages/sekolah/RiwayatSampahPage";
import MenuHariIniPage from "@/pages/sekolah/MenuHariIniPage";

const queryClient = new QueryClient();


const adminLinks = [
  { icon: LayoutDashboard,   label: 'Dashboard Utama',    to: '/admin' },
  { icon: ClipboardList,     label: 'Manajemen Laporan',  to: '/admin/laporan' },
  { icon: Store,             label: 'Data SPPG',          to: '/admin/sppg' },
  { icon: UtensilsCrossed,   label: 'Data Makanan',       to: '/admin/makanan' },
  { icon: Trash2,            label: 'Data Sampah',        to: '/admin/sampah' },
  { icon: Settings,          label: 'Pengaturan',         to: '/admin/pengaturan' },
];

const sppgLinks = [
  { icon: Home,         label: 'Beranda',             to: '/sppg' },
  { icon: PlusCircle,   label: 'Input Menu Hari Ini', to: '/sppg/input-menu' },
  { icon: BarChart2,    label: 'Monitoring Sampah',   to: '/sppg/monitoring-sampah' },
  { icon: CalendarDays, label: 'Riwayat Menu',        to: '/sppg/riwayat-menu' },
];

const sekolahLinks = [
  { icon: Home,          label: 'Beranda',           to: '/sekolah' },
  { icon: Trash2,        label: 'Input Sisa Makanan',to: '/sekolah/input-sampah' },
  { icon: ClipboardList, label: 'Riwayat Laporan',   to: '/sekolah/riwayat-sampah' },
  { icon: UtensilsCrossed, label: 'Menu Hari Ini',   to: '/sekolah/menu-hari-ini' },
];
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<LandingPage />} />
              <Route path="/menu-sekolah" element={<MenuSekolahPage />} />
              <Route path="/monitoring-kasus" element={<MonitoringKasusPage />} />
              <Route path="/edukasi" element={<EdukasiPage />} />
              <Route path="/ai-scanner" element={<AIScannerPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={
              <PrivateRoute allowedRoles={['admin']}>
                <DashboardLayout links={adminLinks} title="Admin MBG" accentClass="bg-secondary" />
              </PrivateRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="laporan" element={<ManajemenLaporan />} />
              <Route path="sppg" element={<DataSPPGPage />} />
              <Route path="makanan" element={<DataMakananPage />} />
              <Route path="sampah" element={<DataSampahPage />} />
              <Route path="pengaturan" element={<PengaturanPage />} />
            </Route>

            {/* SPPG routes */}
            <Route path="/sppg" element={
              <PrivateRoute allowedRoles={['sppg']}>
                <DashboardLayout links={sppgLinks} title="SPPG Dashboard" accentClass="bg-accent" />
              </PrivateRoute>
            }>
              <Route index element={<SPPGBeranda />} />
              <Route path="input-menu" element={<InputMenuPage />} />
              <Route path="monitoring-sampah" element={<SPPGMonitoringSampah />} />
              <Route path="riwayat-menu" element={<RiwayatMenuPage />} />
            </Route>

            {/* Sekolah routes */}
            <Route path="/sekolah" element={
              <PrivateRoute allowedRoles={['sekolah']}>
                <DashboardLayout links={sekolahLinks} title="Dashboard Sekolah" accentClass="bg-primary" />
              </PrivateRoute>
            }>
              <Route index element={<SekolahBeranda />} />
              <Route path="input-sampah" element={<InputSampahPage />} />
              <Route path="riwayat-sampah" element={<RiwayatSampahPage />} />
              <Route path="menu-hari-ini" element={<MenuHariIniPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
