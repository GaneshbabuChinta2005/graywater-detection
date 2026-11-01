import React, { useState } from 'react';
import {
  AlertOctagon,
  FileText,
  Download,
  Printer,
  X,
  ShieldAlert,
  Calendar,
  CheckCircle,
  Building,
  Scale,
  Hash,
  AlertTriangle,
  QrCode,
  Droplet
} from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * Educational sample report for the water-quality monitoring prototype.
 */
export const RegulatoryChallanModal = ({
  isOpen = false,
  onClose,
  telemetry = null,
  analysis = null,
  initialScenario = 'auto' // 'auto' | 'cod' | 'ecoli' | 'tss'
}) => {
  const [selectedScenario, setSelectedScenario] = useState(initialScenario);

  if (!isOpen) return null;

  // Determine parameter values based on telemetry or selected scenario
  const getDiscrepancies = () => {
    if (selectedScenario === 'cod') {
      return [
        { param: 'Chemical Oxygen Demand (COD)', monitored: '850.0 mg/L', limit: '250.0 mg/L', deviation: '+240.0%', status: 'VIOLATION - SEWER OVERRIDE', rule: 'CPCB Sch. VI, Cl. 1A' },
        { param: 'Biochemical Oxygen Demand (BOD)', monitored: '380.0 mg/L', limit: '30.0 mg/L', deviation: '+1,166.7%', status: 'VIOLATION - SEWER OVERRIDE', rule: 'CPCB Sch. VI, Cl. 1B' },
        { param: 'Total Suspended Solids (TSS)', monitored: '240.0 mg/L', limit: '100.0 mg/L', deviation: '+140.0%', status: 'VIOLATION - SEWER OVERRIDE', rule: 'CPCB Sch. VI, Cl. 2' },
        { param: 'Dissolved Oxygen (DO)', monitored: '0.50 mg/L', limit: '>= 2.00 mg/L', deviation: '-75.0%', status: 'DEFERRED - MONSOON', rule: 'EPA Non-Potable Std' }
      ];
    } else if (selectedScenario === 'ecoli') {
      return [
        { param: 'E. coli Pathogen Count', monitored: '180,000 CFU/100mL', limit: '10,000 CFU/100mL', deviation: '+1,700%', status: 'VIOLATION - SEWER OVERRIDE', rule: 'CPCB Microbial Cat. IV' },
        { param: 'Ammonium Fluoride (NH4F)', monitored: '18.5 mg/L', limit: '10.0 mg/L', deviation: '+85.0%', status: 'VIOLATION - SEWER OVERRIDE', rule: 'CPCB Heavy Inorganic' },
        { param: 'Turbidity', monitored: '145.0 NTU', limit: '50.0 NTU', deviation: '+190.0%', status: 'DEMO ALERT - SEWER BYPASS', rule: 'Demo turbidity threshold' }
      ];
    } else if (selectedScenario === 'tss') {
      return [
        { param: 'Total Suspended Solids (TSS)', monitored: '185.0 mg/L', limit: '100.0 mg/L', deviation: '+85.0%', status: 'VIOLATION - SEWER OVERRIDE', rule: 'CPCB Sch. VI, Cl. 2' },
        { param: 'Total Dissolved Solids (TDS)', monitored: '850.0 mg/L', limit: '600.0 mg/L', deviation: '+41.7%', status: 'DEFERRED - MONSOON', rule: 'CPCB Salinity Rule' },
        { param: 'Turbidity', monitored: '92.0 NTU', limit: '50.0 NTU', deviation: '+84.0%', status: 'DEFERRED - MONSOON', rule: 'EPA Runoff Prevention' }
      ];
    }

    // Auto from active telemetry
    const ph = telemetry?.pH ?? 7.4;
    const cod = telemetry?.COD_mg_L ?? (analysis?.routing?.final_action === 'SEWER_BYPASS' ? 420.0 : 82.0);
    const tss = telemetry?.TSS_mg_L ?? 34.0;
    const tur = telemetry?.TUR_NTU ?? 28.5;
    const ecoli = telemetry?.E_coli_CFU_100mL ?? 1500;

    const list = [];
    if (cod > 250) {
      list.push({
        param: 'Chemical Oxygen Demand (COD)',
        monitored: `${cod.toFixed(1)} mg/L`,
        limit: '250.0 mg/L',
        deviation: `+${(((cod - 250) / 250) * 100).toFixed(1)}%`,
        status: 'VIOLATION - SEWER OVERRIDE',
        rule: 'CPCB Sch. VI, Cl. 1A'
      });
    }
    if (tss > 100) {
      list.push({
        param: 'Total Suspended Solids (TSS)',
        monitored: `${tss.toFixed(1)} mg/L`,
        limit: '100.0 mg/L',
        deviation: `+${(((tss - 100) / 100) * 100).toFixed(1)}%`,
        status: 'VIOLATION - SEWER OVERRIDE',
        rule: 'CPCB Sch. VI, Cl. 2'
      });
    }
    if (ecoli > 10000) {
      list.push({
        param: 'E. coli Pathogen Density',
        monitored: `${ecoli.toLocaleString()} CFU/100mL`,
        limit: '10,000 CFU/100mL',
        deviation: `+${(((ecoli - 10000) / 10000) * 100).toFixed(1)}%`,
        status: 'VIOLATION - SEWER OVERRIDE',
        rule: 'CPCB Microbial Cat. IV'
      });
    }
    if (tur > 100) {
      list.push({
        param: 'Turbidity (Optical Density)',
        monitored: `${tur.toFixed(1)} NTU`,
        limit: '50.0 NTU',
        deviation: `+${(((tur - 50) / 50) * 100).toFixed(1)}%`,
        status: 'VIOLATION - SEWER OVERRIDE',
        rule: 'Demo turbidity threshold'
      });
    }

    // Fallback default test violation if nominal
    if (list.length === 0) {
      list.push(
        {
          param: 'Chemical Oxygen Demand (COD)',
          monitored: '380.0 mg/L (Simulated Peak)',
          limit: '250.0 mg/L',
          deviation: '+52.0%',
          status: 'VIOLATION - SEWER OVERRIDE',
          rule: 'CPCB Sch. VI, Cl. 1A'
        },
        {
          param: 'Total Suspended Solids (TSS)',
          monitored: '135.0 mg/L',
          limit: '100.0 mg/L',
          deviation: '+35.0%',
          status: 'VIOLATION - SEWER OVERRIDE',
          rule: 'CPCB Sch. VI, Cl. 2'
        }
      );
    }

    return list;
  };

  const discrepancies = getDiscrepancies();
  const noticeNumber = `DEMO-AQUATRACK-${Date.now()}`;
  const timestamp = telemetry?.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="challan-title"
    >
      <div
        className="card printable-challan"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '2px solid #0F2942',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
          padding: '0'
        }}
      >
        {/* Top Control Bar (Hidden during Print) */}
        <div
          className="no-print"
          style={{
            backgroundColor: '#0F2942',
            color: '#FFFFFF',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Scale size={18} style={{ color: '#D97706' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              AQUATRACK · STUDENT PROJECT DEMO
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Quick Test Scenario Selector */}
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              style={{
                backgroundColor: '#1E3A8A',
                color: '#FFFFFF',
                border: '1px solid #3B82F6',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Select violation test case"
            >
              <option value="auto">Live Telemetry State</option>
              <option value="cod">Breach: Severe COD & Organics (&gt;250 mg/L)</option>
              <option value="ecoli">Breach: Microbial E. coli Surge (&gt;10k CFU)</option>
              <option value="tss">Breach: Suspended Solids & TSS (&gt;100 mg/L)</option>
            </select>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Close Modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Demo report */}
        <div style={{ padding: '28px 32px' }}>
          {/* Project heading */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '3px double #0F2942',
              paddingBottom: '16px',
              marginBottom: '20px'
            }}
          >
            <Droplet size={48} style={{ color: '#0284C7' }} />

            <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                STUDENT PROJECT · EDUCATIONAL PROTOTYPE
              </div>
              <h2
                id="challan-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#0F2942',
                  letterSpacing: '0.02em',
                  margin: '3px 0',
                  lineHeight: 1.2
                }}
              >
                AQUATRACK WATER QUALITY REPORT
              </h2>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                Greywater monitoring and reuse-planning demonstration
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
                Not an official government service or certified laboratory result
              </div>
            </div>

            <Droplet size={40} style={{ color: '#0284C7' }} />
          </div>

          {/* Notice Title Banner */}
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderLeft: '5px solid #B91C1C',
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EDUCATIONAL DEMONSTRATION — NOT AN OFFICIAL NOTICE
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991B1B', margin: '2px 0' }}>
                Sample Water Quality Analysis
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#7F1D1D' }}>
                Demo readings are compared with reference values for learning only; verify applicable limits with qualified authorities.
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <StatusBadge label="DEMO ALERT" size="lg" />
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                REF: {noticeNumber}
              </div>
            </div>
          </div>

          {/* Sample metadata */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '0.8rem'
            }}
          >
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Monitored Basin Station:
              </span>
              <strong style={{ color: '#0F172A' }}>AP-WQM-004 (Visakhapatnam - Godavari Concourse)</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Effluent Stream Classification:
              </span>
              <strong style={{ color: '#0F172A' }}>{telemetry?.greywater_source || 'Kitchen / Mixed Commercial Inflow'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Sample timestamp:
              </span>
              <strong style={{ color: '#0F172A' }}>{timestamp} IST</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Demo system suggestion:
              </span>
              <strong style={{ color: '#B91C1C' }}>SEWER_BYPASS (Pumps Locked Out)</strong>
            </div>
          </div>

          {/* Sample readings and reference limits */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1. Parameter Discrepancy & Threshold Breach Matrix
              </h4>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Educational reference values · verify before use</span>
            </div>

            <div className="gov-table-container">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Physicochemical Parameter</th>
                    <th>Monitored Telemetry</th>
                    <th>Reference Limit</th>
                    <th>Difference</th>
                    <th>Demo Status</th>
                    <th>Reference Note</th>
                  </tr>
                </thead>
                <tbody>
                  {discrepancies.map((d, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: '#0F172A' }}>{d.param}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#B91C1C' }}>
                        {d.monitored}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{d.limit}</td>
                      <td style={{ fontWeight: 700, color: '#B91C1C' }}>{d.deviation}</td>
                      <td>
                        <StatusBadge label={d.status} />
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#475569' }}>{d.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suggested follow-up */}
          <div
            style={{
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              marginBottom: '20px'
            }}
          >
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              2. Suggested Follow-up
            </h4>

            <ul style={{ paddingLeft: '20px', fontSize: '0.8125rem', color: '#334155', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>
                <strong>Review the sample:</strong> Check the reported readings and confirm that the sensors and units are configured correctly.
              </li>
              <li>
                <strong>Retest if needed:</strong> A qualified laboratory should confirm any reading that may affect health or safety.
              </li>
              <li>
                <strong>Use local guidance:</strong> Do not use this student prototype to make compliance, treatment, or reuse decisions.
              </li>
            </ul>
          </div>

          {/* Demo report details */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #CBD5E1',
              fontSize: '0.78rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0F2942'
                }}
              >
                <QrCode size={44} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>AQUATRACK DEMO REPORT</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                  Reference: {noticeNumber}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 600 }}>
                  Generated for educational demonstration only
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontStyle: 'italic', color: '#1E3A8A', fontFamily: 'serif', fontSize: '0.95rem', fontWeight: 600 }}>
                AquaTrack Student Project
              </div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>Sample report · not a legal document</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Greywater Quality Monitoring Prototype
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer (Hidden during Print) */}
        <div
          className="no-print"
          style={{
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #CBD5E1',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
            This sample report is for educational use only and is not an official notice.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={onClose}>
              Dismiss
            </button>
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={15} /> Print Demo Report
            </button>
            <button className="btn-primary" onClick={handlePrint}>
              <Download size={15} /> Print / Save Demo Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulatoryChallanModal;
