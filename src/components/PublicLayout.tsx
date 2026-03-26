import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from './Footer';
import MBGChatbot from '@/pages/public/MBGChatbot';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen">
    <PublicNavbar />
    <main className="pt-16">
      <Outlet />
      <MBGChatbot/>
    </main>
    <Footer/>
  </div>
);

export default PublicLayout;
