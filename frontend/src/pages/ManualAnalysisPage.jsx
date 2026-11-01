import React, { useState } from 'react';
import { analyzeWater, analyzeBatch } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import ShapWaterfallChart from '../components/ShapWaterfallChart';
<<<<<<< HEAD
import { FlaskConical, Upload, CheckCircle2, AlertTriangle, Download, ArrowRight, Layers, FileSpreadsheet, ShieldAlert, Cpu } from 'lucide-react';
=======
import {
  FlaskConical,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet
} from 'lucide-react';
>>>>>>> myrepo/main

const PRESETS = {
  bathroom: {
    name: 'Bathroom (Irrigation Safe)',
    source: 'Bathroom',
    pH: 7.4,
    TEMP_C: 24.5,
    SAL_ppt: 0.22,
    TUR_NTU: 28.5,
    DS_mg_L: 255.0,
    TDS_mg_L: 275.0,
    TSS_mg_L: 34.0,
    COND_uS_cm: 515.0,
    DO_mg_L: 4.8,
    BOD_mg_L: 28.0,
    COD_mg_L: 82.0,
    NH4F_mg_L: 4.2,
    NO3_mg_L: 4.5,
    K_mg_L: 15.8,
    E_coli_CFU_100mL: 1500
  },
  kitchen: {
    name: 'Kitchen (High Organics - Sewer)',
    source: 'Kitchen',
    pH: 6.3,
    TEMP_C: 28.0,
    SAL_ppt: 0.58,
    TUR_NTU: 145.0,
    DS_mg_L: 620.0,
    TDS_mg_L: 680.0,
    TSS_mg_L: 240.0,
    COND_uS_cm: 940.0,
    DO_mg_L: 0.5,
    BOD_mg_L: 380.0,
    COD_mg_L: 850.0,
    NH4F_mg_L: 18.5,
    NO3_mg_L: 3.2,
    K_mg_L: 32.0,
    E_coli_CFU_100mL: 180000
  },
  laundry: {
    name: 'Laundry (Surfactants - Bio-filtration)',
    source: 'Laundry',
    pH: 7.8,
    TEMP_C: 31.0,
    SAL_ppt: 0.38,
    TUR_NTU: 72.0,
    DS_mg_L: 340.0,
    TDS_mg_L: 380.0,
    TSS_mg_L: 78.0,
    COND_uS_cm: 640.0,
    DO_mg_L: 3.2,
    BOD_mg_L: 85.0,
    COD_mg_L: 240.0,
    NH4F_mg_L: 8.5,
    NO3_mg_L: 2.8,
    K_mg_L: 21.0,
    E_coli_CFU_100mL: 8500
  },
  mixed: {
    name: 'Mixed Composite Stream',
    source: 'Mixed',
    pH: 7.15,
    TEMP_C: 26.0,
    SAL_ppt: 0.28,
    TUR_NTU: 55.0,
    DS_mg_L: 290.0,
    TDS_mg_L: 315.0,
    TSS_mg_L: 65.0,
    COND_uS_cm: 560.0,
    DO_mg_L: 3.8,
    BOD_mg_L: 62.0,
    COD_mg_L: 180.0,
    NH4F_mg_L: 6.8,
    NO3_mg_L: 4.1,
    K_mg_L: 18.2,
    E_coli_CFU_100mL: 32000
  }
};

export const ManualAnalysisPage = () => {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch'
=======
  const [activeTab, setActiveTab] = useState('single');
>>>>>>> myrepo/main
  const [formData, setFormData] = useState({
    Greywater_Source: 'Bathroom',
    pH: 7.4,
    TEMP_C: 24.5,
    SAL_ppt: 0.22,
    TUR_NTU: 28.5,
    DS_mg_L: 255.0,
    TDS_mg_L: 275.0,
    TSS_mg_L: 34.0,
    COND_uS_cm: 515.0,
    DO_mg_L: 4.8,
    BOD_mg_L: 28.0,
    COD_mg_L: 82.0,
    NH4F_mg_L: 4.2,
    NO3_mg_L: 4.5,
    K_mg_L: 15.8,
    E_coli_CFU_100mL: 1500
  });

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [error, setError] = useState(null);

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setFormData({
      Greywater_Source: p.source,
      pH: p.pH,
      TEMP_C: p.TEMP_C,
      SAL_ppt: p.SAL_ppt,
      TUR_NTU: p.TUR_NTU,
      DS_mg_L: p.DS_mg_L,
      TDS_mg_L: p.TDS_mg_L,
      TSS_mg_L: p.TSS_mg_L,
      COND_uS_cm: p.COND_uS_cm,
      DO_mg_L: p.DO_mg_L,
      BOD_mg_L: p.BOD_mg_L,
      COD_mg_L: p.COD_mg_L,
      NH4F_mg_L: p.NH4F_mg_L,
      NO3_mg_L: p.NO3_mg_L,
      K_mg_L: p.K_mg_L,
      E_coli_CFU_100mL: p.E_coli_CFU_100mL
    });
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'Greywater_Source' ? val : parseFloat(val) || 0.0
    }));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeWater(formData);
      if (res.success) {
        setAnalysisResult(res.analysis);
      } else {
        setError(res.message || 'Analysis could not be computed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    setLoading(true);
    setError(null);
    try {
      const res = await analyzeBatch(fd);
      if (res.success) {
        setBatchResults(res);
      } else {
        setError(res.message || 'Batch evaluation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadBatchCSV = () => {
    if (!batchResults || !batchResults.results) return;
<<<<<<< HEAD
    const headers = ['Sample_ID', 'Source', 'ML_Predicted_Class', 'Confidence', 'Final_Route', 'Final_Action', 'Override_Applied'];
=======
    const headers = ['Sample_ID', 'Source', 'ML_Predicted_Class', 'Confidence', 'Final_Route', 'Regulatory_Status', 'Override'];
>>>>>>> myrepo/main
    const rows = batchResults.results.map((r, i) => [
      i + 1,
      r.source,
      r.prediction.class_name,
      r.prediction.confidence,
      r.routing.final_route,
<<<<<<< HEAD
      r.routing.final_action,
      r.routing.override_applied
=======
      r.routing.final_action === 'SEWER_BYPASS' ? 'VIOLATION - SEWER OVERRIDE' : 'COMPLIANT',
      r.routing.override_applied ? 'YES' : 'NO'
>>>>>>> myrepo/main
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
<<<<<<< HEAD
    link.setAttribute('download', `greywater_batch_results_${Date.now()}.csv`);
=======
    link.setAttribute('download', `aquatrack_batch_${Date.now()}.csv`);
>>>>>>> myrepo/main
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const physicalParams = [
    { key: 'pH', label: 'pH Level', unit: 'pH', step: 0.1 },
    { key: 'TEMP_C', label: 'Temperature', unit: '°C', step: 0.5 },
    { key: 'TUR_NTU', label: 'Turbidity', unit: 'NTU', step: 1 },
<<<<<<< HEAD
    { key: 'TDS_mg_L', label: 'Total Dissolved Solids (TDS)', unit: 'mg/L', step: 10 },
    { key: 'DS_mg_L', label: 'Dissolved Solids (DS)', unit: 'mg/L', step: 10 },
    { key: 'TSS_mg_L', label: 'Total Suspended Solids (TSS)', unit: 'mg/L', step: 5 },
    { key: 'COND_uS_cm', label: 'Electrical Conductivity', unit: 'µS/cm', step: 10 },
=======
    { key: 'TDS_mg_L', label: 'Total Dissolved Solids', unit: 'mg/L', step: 10 },
    { key: 'DS_mg_L', label: 'Dissolved Solids', unit: 'mg/L', step: 10 },
    { key: 'TSS_mg_L', label: 'Total Suspended Solids', unit: 'mg/L', step: 5 },
    { key: 'COND_uS_cm', label: 'Conductivity', unit: 'µS/cm', step: 10 },
>>>>>>> myrepo/main
    { key: 'SAL_ppt', label: 'Salinity', unit: 'ppt', step: 0.05 }
  ];

  const chemicalParams = [
<<<<<<< HEAD
    { key: 'COD_mg_L', label: 'Chemical Oxygen Demand (COD)', unit: 'mg/L', step: 5 },
    { key: 'BOD_mg_L', label: 'Biological Oxygen Demand (BOD)', unit: 'mg/L', step: 5 },
    { key: 'DO_mg_L', label: 'Dissolved Oxygen (DO)', unit: 'mg/L', step: 0.2 },
    { key: 'NH4F_mg_L', label: 'Ammonium Fluoride (NH4F)', unit: 'mg/L', step: 0.5 },
    { key: 'NO3_mg_L', label: 'Nitrate (NO3)', unit: 'mg/L', step: 0.5 },
    { key: 'K_mg_L', label: 'Potassium (K)', unit: 'mg/L', step: 1 }
  ];

  const biologicalParams = [
    { key: 'E_coli_CFU_100mL', label: 'Escherichia coli (E. coli)', unit: 'CFU/100mL', step: 100 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
=======
    { key: 'COD_mg_L', label: 'Chemical Oxygen Demand', unit: 'mg/L', step: 5 },
    { key: 'BOD_mg_L', label: 'Biological Oxygen Demand', unit: 'mg/L', step: 5 },
    { key: 'DO_mg_L', label: 'Dissolved Oxygen', unit: 'mg/L', step: 0.2 },
    { key: 'NH4F_mg_L', label: 'Ammonium Fluoride', unit: 'mg/L', step: 0.5 },
    { key: 'NO3_mg_L', label: 'Nitrate', unit: 'mg/L', step: 0.5 },
    { key: 'K_mg_L', label: 'Potassium', unit: 'mg/L', step: 1 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
>>>>>>> myrepo/main
        <div>
          <h1 className="page-title">
            Manual Sample Evaluation & Batch Testing
          </h1>
          <p className="page-subtitle">
<<<<<<< HEAD
            Input laboratory water quality parameters or upload multi-sample CSV files to evaluate supervised ML classifications, anomaly screening, and SHAP feature attributions.
=======
            Evaluate individual laboratory water quality samples or upload batch CSV files for CPCB compliance screening.
>>>>>>> myrepo/main
          </p>
        </div>
      </div>

<<<<<<< HEAD
      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
        <button
          className={activeTab === 'single' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('single')}
        >
          <FlaskConical size={15} /> Single Sample Manual Entry
=======
      {/* ─── Mode Tabs ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #CBD5E1', paddingBottom: 10 }}>
        <button
          className={activeTab === 'single' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('single')}
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
        >
          <FlaskConical size={14} /> Single Sample Entry
>>>>>>> myrepo/main
        </button>
        <button
          className={activeTab === 'batch' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('batch')}
<<<<<<< HEAD
        >
          <Upload size={15} /> Batch CSV Evaluation
=======
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
        >
          <Upload size={14} /> Batch CSV Upload
>>>>>>> myrepo/main
        </button>
      </div>

      {error && (
<<<<<<< HEAD
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{error}</span>
=======
        <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{error}</span>
>>>>>>> myrepo/main
        </div>
      )}

      {activeTab === 'single' ? (
<<<<<<< HEAD
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(320px, 1fr)', gap: 24, alignItems: 'start' }}>
          {/* Left: Structured Parameter Form */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                15 Physicochemical Parameters Form
              </h3>
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: 20, backgroundColor: 'var(--bg-surface-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
                Load Reference Baseline Preset:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 6 }}>
=======
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)', gap: 20, alignItems: 'start' }}>
          {/* Form */}
          <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F2942', marginBottom: 12 }}>
              15 Physicochemical Parameters
            </h3>

            {/* Presets */}
            <div style={{ marginBottom: 16, backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                Load Reference Preset:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 6 }}>
>>>>>>> myrepo/main
                {Object.keys(PRESETS).map(key => (
                  <button
                    key={key}
                    type="button"
                    className="btn-secondary"
<<<<<<< HEAD
                    style={{ fontSize: '0.75rem', padding: '6px 8px', textAlign: 'center', justifyContent: 'center' }}
=======
                    style={{ fontSize: '0.72rem', padding: '4px 6px', textAlign: 'center', justifyContent: 'center' }}
>>>>>>> myrepo/main
                    onClick={() => applyPreset(key)}
                  >
                    {PRESETS[key].name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAnalyze}>
<<<<<<< HEAD
              {/* Source Selector */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">
                  Greywater Source Origin
                </label>
=======
              {/* Source */}
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Water Source</label>
>>>>>>> myrepo/main
                <select
                  className="form-input"
                  value={formData.Greywater_Source}
                  onChange={(e) => handleInputChange('Greywater_Source', e.target.value)}
<<<<<<< HEAD
                >
                  <option value="Bathroom">Bathroom (Washbasin & Shower)</option>
                  <option value="Kitchen">Kitchen (Food Waste & Oils)</option>
                  <option value="Laundry">Laundry (Surfactants & Detergents)</option>
                  <option value="Mixed">Mixed Composite Stream</option>
                </select>
              </div>

              {/* Group 1: Physical Parameters */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border-color)' }}>
                  1. Physical Parameters (8)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {physicalParams.map(param => (
                    <div key={param.key}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                        {param.label} <span style={{ color: 'var(--text-muted)' }}>({param.unit})</span>
=======
                  style={{ height: 34, fontSize: '0.82rem' }}
                >
                  <option value="Bathroom">Bathroom (Washbasin & Shower)</option>
                  <option value="Kitchen">Kitchen (Food Waste & Oils)</option>
                  <option value="Laundry">Laundry (Detergents & Bleach)</option>
                  <option value="Mixed">Mixed Stream</option>
                </select>
              </div>

              {/* Physical */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F2942', display: 'block', marginBottom: 6 }}>
                  Physical Parameters
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                  {physicalParams.map(param => (
                    <div key={param.key}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 2 }}>
                        {param.label} ({param.unit})
>>>>>>> myrepo/main
                      </label>
                      <input
                        type="number"
                        step={param.step}
                        className="form-input"
                        value={formData[param.key]}
                        onChange={(e) => handleInputChange(param.key, e.target.value)}
                        required
<<<<<<< HEAD
=======
                        style={{ height: 32, fontSize: '0.8rem', padding: '4px 8px' }}
>>>>>>> myrepo/main
                      />
                    </div>
                  ))}
                </div>
              </div>

<<<<<<< HEAD
              {/* Group 2: Chemical Parameters */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border-color)' }}>
                  2. Chemical Parameters (6)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {chemicalParams.map(param => (
                    <div key={param.key}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                        {param.label} <span style={{ color: 'var(--text-muted)' }}>({param.unit})</span>
                      </label>
                      <input
                        type="number"
                        step={param.step}
                        className="form-input"
                        value={formData[param.key]}
                        onChange={(e) => handleInputChange(param.key, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 3: Biological Parameters */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border-color)' }}>
                  3. Microbial & Pathogen Parameters (1)
                </div>
                <div>
                  {biologicalParams.map(param => (
                    <div key={param.key}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                        {param.label} <span style={{ color: 'var(--text-muted)' }}>({param.unit})</span>
=======
              {/* Chemical */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1D4ED8', display: 'block', marginBottom: 6 }}>
                  Chemical & Pathogen Parameters
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                  {chemicalParams.map(param => (
                    <div key={param.key}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 2 }}>
                        {param.label} ({param.unit})
>>>>>>> myrepo/main
                      </label>
                      <input
                        type="number"
                        step={param.step}
                        className="form-input"
                        value={formData[param.key]}
                        onChange={(e) => handleInputChange(param.key, e.target.value)}
                        required
<<<<<<< HEAD
                      />
                    </div>
                  ))}
=======
                        style={{ height: 32, fontSize: '0.8rem', padding: '4px 8px' }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#B91C1C', display: 'block', marginBottom: 2 }}>
                      E. coli (CFU/100mL)
                    </label>
                    <input
                      type="number"
                      step={100}
                      className="form-input"
                      value={formData.E_coli_CFU_100mL}
                      onChange={(e) => handleInputChange('E_coli_CFU_100mL', e.target.value)}
                      required
                      style={{ height: 32, fontSize: '0.8rem', padding: '4px 8px' }}
                    />
                  </div>
>>>>>>> myrepo/main
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
<<<<<<< HEAD
                style={{ width: '100%', padding: '10px 16px', fontSize: '0.875rem' }}
                disabled={loading}
              >
                {loading ? 'Evaluating Model Inference...' : 'ANALYZE WATER SAMPLE'}
=======
                style={{ width: '100%', padding: '9px 14px', fontSize: '0.85rem', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Evaluating Model...' : 'Execute Laboratory Analysis'}
>>>>>>> myrepo/main
              </button>
            </form>
          </div>

<<<<<<< HEAD
          {/* Right: Results Display */}
          <div>
            {analysisResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        Final Synthesized Decision:
                      </span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
=======
          {/* Result Card */}
          <div>
            {analysisResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>
                        Arbitrated Decision:
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F2942', margin: '2px 0 0 0' }}>
>>>>>>> myrepo/main
                        {analysisResult.routing.final_route}
                      </h3>
                    </div>
                    <StatusBadge label={analysisResult.routing.final_action} size="lg" />
                  </div>

<<<<<<< HEAD
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>XGBoost Classifier:</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>
                        {analysisResult.prediction.class_name} ({((analysisResult.prediction.confidence) * 100).toFixed(1)}%)
                      </div>
                    </div>

                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Anomaly Screening:</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: analysisResult.anomaly.is_anomaly ? 'var(--danger)' : 'var(--success)', marginTop: 2 }}>
                        {analysisResult.anomaly.status} (Score: {analysisResult.anomaly.anomaly_score.toFixed(4)})
=======
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>ML Prediction:</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F2942' }}>
                        {analysisResult.prediction.class_name} ({((analysisResult.prediction.confidence) * 100).toFixed(0)}%)
                      </div>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Anomaly Screening:</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: analysisResult.anomaly.is_anomaly ? '#B91C1C' : '#15803D' }}>
                        {analysisResult.anomaly.status}
>>>>>>> myrepo/main
                      </div>
                    </div>
                  </div>

<<<<<<< HEAD
                  <div
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--primary-subtle)',
                      border: '1px solid var(--primary-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4
                    }}
                  >
                    <strong style={{ color: 'var(--primary)', marginRight: 4 }}>Decision Trace:</strong>
                    {analysisResult.explanation.summary}
=======
                  <div style={{ fontSize: '0.78rem', color: '#334155', backgroundColor: '#EFF6FF', padding: '10px 12px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                    <strong>Audit Trace:</strong> {analysisResult.explanation.summary}
>>>>>>> myrepo/main
                  </div>
                </div>

                <ShapWaterfallChart
                  shapData={analysisResult.shap}
                  predictedRoute={analysisResult.prediction.class_name}
                  confidence={analysisResult.prediction.confidence}
                />
              </div>
            ) : (
<<<<<<< HEAD
              <div
                className="card"
                style={{
                  padding: '60px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  <FlaskConical size={28} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Awaiting Telemetry Input
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 320 }}>
                  Select one of the reference baseline presets on the left or enter specific laboratory parameters, then click <strong>Analyze Water Sample</strong>.
=======
              <div className="card" style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
                <FlaskConical size={32} style={{ color: '#94A3B8', margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F2942' }}>Awaiting Sample Submission</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: 280, margin: '4px auto 0' }}>
                  Select a reference preset or input custom parameters and click <strong>Execute Laboratory Analysis</strong>.
>>>>>>> myrepo/main
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
<<<<<<< HEAD
        /* Batch CSV Upload Section */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            className="card"
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              border: '2px dashed var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Upload size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Upload Laboratory Batch CSV File
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 460, margin: '6px auto 0' }}>
                Batch file must contain the 15 parameter columns or Greywater_Source. Machine learning inference and safety rules will evaluate all rows sequentially.
              </p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="csv-upload-input"
            />
            <label htmlFor="csv-upload-input" className="btn-primary" style={{ cursor: 'pointer' }}>
=======
        /* Batch Upload */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '32px 20px', textAlign: 'center', border: '2px dashed #CBD5E1', backgroundColor: '#FFFFFF' }}>
            <Upload size={28} style={{ color: '#0F2942', margin: '0 auto 8px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F2942' }}>Upload Batch Laboratory CSV</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '4px auto 12px', maxWidth: 400 }}>
              File must contain parameter columns. ML model and CPCB safety rules will evaluate all rows.
            </p>
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} id="batch-file-input" />
            <label htmlFor="batch-file-input" className="btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
>>>>>>> myrepo/main
              Select CSV File
            </label>
          </div>

          {batchResults && (
<<<<<<< HEAD
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Batch Evaluation Results ({batchResults.totalSamples} Samples)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Anomaly Rate: <strong>{batchResults.anomalyRate}%</strong> | Safety Overrides: <strong>{batchResults.safetyOverridesCount}</strong>
                  </p>
                </div>
                <button className="btn-secondary" onClick={downloadBatchCSV}>
                  <Download size={14} /> Download Evaluated CSV
                </button>
              </div>

              <div className="data-table-container">
                <table className="data-table">
=======
            <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F2942' }}>
                  Batch Results ({batchResults.totalSamples} Samples)
                </h3>
                <button className="btn-secondary" onClick={downloadBatchCSV} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                  <Download size={12} /> Download Evaluated CSV
                </button>
              </div>

              <div className="gov-table-container">
                <table className="gov-table">
>>>>>>> myrepo/main
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Source</th>
<<<<<<< HEAD
                      <th>ML Class</th>
                      <th>Confidence</th>
                      <th>Anomaly</th>
                      <th>Final Route</th>
                      <th>Action</th>
                      <th>Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.results.slice(0, 30).map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.source}</td>
                        <td>{r.prediction.class_name}</td>
                        <td>{(r.prediction.confidence * 100).toFixed(1)}%</td>
                        <td><StatusBadge label={r.anomaly.status} /></td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.routing.final_route}</td>
                        <td><StatusBadge label={r.routing.final_action} /></td>
                        <td>{r.routing.override_applied ? 'YES' : 'NO'}</td>
=======
                      <th>Prediction</th>
                      <th>Confidence</th>
                      <th>Anomaly</th>
                      <th>Final Route</th>
                      <th>Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.results.slice(0, 20).map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: '#64748B' }}>#{i + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{r.source}</td>
                        <td>{r.prediction.class_name}</td>
                        <td>{(r.prediction.confidence * 100).toFixed(0)}%</td>
                        <td><StatusBadge label={r.anomaly.status} /></td>
                        <td style={{ fontWeight: 700, color: '#0F2942' }}>{r.routing.final_route}</td>
                        <td>
                          <StatusBadge label={r.routing.final_action === 'SEWER_BYPASS' ? 'VIOLATION - SEWER OVERRIDE' : 'COMPLIANT'} />
                        </td>
>>>>>>> myrepo/main
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManualAnalysisPage;
