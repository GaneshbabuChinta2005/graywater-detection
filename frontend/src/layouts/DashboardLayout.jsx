import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Home, ChevronRight, Droplet } from 'lucide-react';

const ROUTE_LABELS = {
  '/dashboard': { section: 'Operations', title: 'System Overview' },
  '/places': { section: 'Basin Surveillance', title: 'Andhra Pradesh Monitoring Stations' },
  '/monitoring': { section: 'Operations', title: 'Live Telemetry Stream' },
  '/analysis': { section: 'Laboratory', title: 'Sample Analysis' },
  '/water-quality': { section: 'Standards', title: 'Water Quality Norms' },
  '/routing': { section: 'Decision Engine', title: 'Smart Multi-Criteria Routing' },
  '/storage': { section: 'Decision Engine', title: 'Storage Tank Balance' },
  '/weather': { section: 'Decision Engine', title: 'Meteorological Context' },
  '/anomaly': { section: 'Decision Engine', title: 'Anomaly Screening' },
  '/explainability': { section: 'Decision Engine', title: 'AI Explainability (SHAP)' },
  '/reports': { section: 'Audit & Compliance', title: 'Audit Reports & Challans' },
  '/system': { section: 'Infrastructure', title: 'System Health Diagnostics' }
};

export const DashboardLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname.startsWith('/places/') ? '/places' : location.pathname;
  const breadcrumbInfo = ROUTE_LABELS[currentPath] || { section: 'Portal', title: 'Overview' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Project navigation */}
      <Navbar />

      {/* Page breadcrumbs */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #CBD5E1',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: '0.78rem',
          color: '#475569'
        }}
      >
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: '#0F2942',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Home size={13} style={{ color: '#0F2942' }} />
            <span>AquaTrack</span>
          </Link>

          <ChevronRight size={12} style={{ color: '#94A3B8' }} />

          <span style={{ color: '#64748B' }}>{breadcrumbInfo.section}</span>

          <ChevronRight size={12} style={{ color: '#94A3B8' }} />

          <strong style={{ color: '#0F172A', fontWeight: 700 }}>{breadcrumbInfo.title}</strong>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#0369A1', fontWeight: 600 }}>
          <Droplet size={13} />
          <span>Student prototype · For educational use</span>
        </div>
      </div>

      {/* Main Spacious Content Canvas */}
      <main
        style={{
          flex: 1,
          padding: '24px',
          maxWidth: '1560px',
          width: '100%',
          margin: '0 auto',
          backgroundColor: '#F8FAFC'
        }}
      >
        <Outlet />
      </main>

      {/* Project information */}
      <footer
        style={{
          backgroundColor: '#0F2942',
          color: '#E2E8F0',
          borderTop: '3px solid #D97706',
          marginTop: 'auto'
        }}
      >
        <div
          style={{
            maxWidth: '1560px',
            margin: '0 auto',
            padding: '28px 24px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            fontSize: '0.78rem'
          }}
        >
          {/* Col 1: Project identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Droplet size={30} style={{ color: '#38BDF8' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.88rem' }}>
                  AquaTrack
                </div>
                <div style={{ color: '#CBD5E1', fontSize: '0.74rem' }}>
                  Greywater Quality Monitoring · Student Project
                </div>
              </div>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.74rem', lineHeight: 1.45, margin: 0 }}>
              An educational prototype for exploring water-quality measurements, analysis, and greywater reuse planning.
            </p>
          </div>

          {/* Col 2: Demo features */}
          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.82rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Project Features
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5, color: '#CBD5E1' }}>
              <li>• Water-quality monitoring dashboard</li>
              <li>• Sample analysis and trend visualizations</li>
              <li>• Greywater routing and reuse planning</li>
              <li>• Demonstration data and model outputs</li>
            </ul>
          </div>

          {/* Col 3: Educational-use note */}
          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.82rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Prototype Notice
            </div>
            <div style={{ color: '#CBD5E1', lineHeight: 1.5 }}>
              <div>This project is for learning and demonstration only.</div>
              <div style={{ marginTop: 4 }}>It is not an official government service or a substitute for certified water testing.</div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 24px',
            backgroundColor: '#0A1C2E',
            fontSize: '0.72rem',
            color: '#94A3B8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            maxWidth: '1560px',
            margin: '0 auto'
          }}
        >
          <div>
            © 2026 AquaTrack Student Project · Educational prototype
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
