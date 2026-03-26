import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Beranda', to: '/' },
  
  { label: 'Menu Sekolah', to: '/menu-sekolah' },
  // { label: 'Laporan', to: '/laporan' },
  { label: 'Monitoring Kasus', to: '/monitoring-kasus' },
  { label: 'Edukasi', to: '/edukasi' },
  { label: 'AI Scanner', to: '/ai-scanner' },
];

const PublicNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-card shadow-card-hover' : 'bg-card/80 backdrop-blur-md'}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍱</span>
          <span className="font-heading font-bold text-xl text-foreground">MbgTrack</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:block">
          <Link to="/login">
            <Button size="sm" className="rounded-lg">Masuk</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-card border-t px-4 pb-4 animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === link.to ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setIsOpen(false)}>
            <Button size="sm" className="w-full mt-2 rounded-lg">Masuk</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
