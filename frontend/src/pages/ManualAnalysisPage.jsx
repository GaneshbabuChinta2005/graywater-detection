import React, { useState } from 'react';
import { analyzeWater, analyzeBatch } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import DecisionPipelineVisualizer from '../components/DecisionPipelineVisualizer';
import ShapWaterfallChart from '../components/ShapWaterfallChart';
import { FlaskConical, Upload, CheckCircle2, AlertTriangle, Download, ArrowRight } from 'lucide-react';

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
    name: 'Kitchen (High Organics - Sewer Bypass)',
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
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch'
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
    const headers = ['Sample_ID', 'Source', 'ML_Predicted_Class', 'Confidence', 'Final_Route', 'Final_Action', 'Override_Applied'];
    const rows = batchResults.results.map((r, i) => [
      i + 1,
      r.source,
      r.prediction.class_name,
      r.prediction.confidence,
      r.routing.final_route,
      r.routing.final_action,
      r.routing.override_applied
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greywater_batch_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Manual Water Sample Evaluation & Batch Testing
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Perform ad-hoc water quality testing or upload laboratory batch CSV files to execute full ML routing and SHAP attribution.
        </p>
      </div>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
        <button
          className={activeTab === 'single' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('single')}
        >
          <FlaskConical size={16} /> Single Sample Manual Entry
        </button>
        <button
          className={activeTab === 'batch' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('batch')}
        >
          <Upload size={16} /> Batch CSV Evaluation
        </button>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 10, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'single' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24 }}>
          {/* Left Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                15 Physicochemical Parameters Form
              </h3>
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Load Representative Baseline Preset:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.keys(PRESETS).map(key => (
                  <button
                    key={key}
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.76rem', padding: '6px 10px', justifyContent: 'center' }}
                    onClick={() => applyPreset(key)}
                  >
                    {PRESETS[key].name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAnalyze}>
              {/* Source Selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Greywater Source
                </label>
                <select
                  className="form-input"
                  value={formData.Greywater_Source}
                  onChange={(e) => handleInputChange('Greywater_Source', e.target.value)}
                  style={{ marginTop: 4 }}
                >
                  <option value="Bathroom">Bathroom</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              {/* 15 Parameters Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'pH', label: 'pH [0 - 14]', step: 0.1 },
                  { key: 'TEMP_C', label: 'Temperature (°C)', step: 0.5 },
                  { key: 'TUR_NTU', label: 'Turbidity (NTU)', step: 1 },
                  { key: 'COD_mg_L', label: 'COD (mg/L)', step: 5 },
                  { key: 'BOD_mg_L', label: 'BOD (mg/L)', step: 5 },
                  { key: 'DO_mg_L', label: 'Dissolved Oxygen (mg/L)', step: 0.2 },
                  { key: 'TDS_mg_L', label: 'TDS (mg/L)', step: 10 },
                  { key: 'DS_mg_L', label: 'DS (mg/L)', step: 10 },
                  { key: 'TSS_mg_L', label: 'TSS (mg/L)', step: 5 },
                  { key: 'COND_uS_cm', label: 'Conductivity (µS/cm)', step: 10 },
                  { key: 'SAL_ppt', label: 'Salinity (ppt)', step: 0.05 },
                  { key: 'NH4F_mg_L', label: 'Ammonium Fluoride (mg/L)', step: 0.5 },
                  { key: 'NO3_mg_L', label: 'Nitrate (mg/L)', step: 0.5 },
                  { key: 'K_mg_L', label: 'Potassium (mg/L)', step: 1 },
                  { key: 'E_coli_CFU_100mL', label: 'E. coli (CFU/100mL)', step: 100 }
                ].map(param => (
                  <div key={param.key}>
                    <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {param.label}
                    </label>
                    <input
                      type="number"
                      step={param.step}
                      className="form-input"
                      style={{ marginTop: 2, padding: '8px 10px', fontSize: '0.82rem' }}
                      value={formData[param.key]}
                      onChange={(e) => handleInputChange(param.key, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? 'Evaluating Model Inference...' : 'ANALYZE WATER SAMPLE'}
              </button>
            </form>
          </div>

          {/* Right Results Panel */}
          <div>
            {analysisResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Final Decision Output:</span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {analysisResult.routing.final_route}
                      </h3>
                    </div>
                    <StatusBadge label={analysisResult.routing.final_action} size="lg" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                    <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>XGBoost Prediction:</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#38bdf8' }}>
                        {analysisResult.prediction.class_name} ({((analysisResult.prediction.confidence) * 100).toFixed(1)}%)
                      </div>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Anomaly Screen:</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: analysisResult.anomaly.is_anomaly ? '#f87171' : '#34d399' }}>
                        {analysisResult.anomaly.status} (Score: {analysisResult.anomaly.anomaly_score.toFixed(4)})
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      padding: '12px 14px',
                      background: 'rgba(6, 182, 212, 0.05)',
                      border: '1px solid rgba(6, 182, 212, 0.2)',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      color: '#e0f2fe'
                    }}
                  >
                    <strong>Decision Trace:</strong> {analysisResult.explanation.summary}
                  </div>
                </div>

                <ShapWaterfallChart
                  shapData={analysisResult.shap}
                  predictedRoute={analysisResult.prediction.class_name}
                  confidence={analysisResult.prediction.confidence}
                />
              </div>
            ) : (
              <div
                className="glass-card"
                style={{
                  padding: '60px 30px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <FlaskConical size={48} color="var(--text-muted)" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Awaiting Telemetry Input
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: 340 }}>
                  Select a preset on the left or customize the 15 water quality parameters, then click <strong>Analyze Water Sample</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch CSV Upload Section */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            className="glass-card"
            style={{
              padding: '36px',
              textAlign: 'center',
              border: '2px dashed rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14
            }}
          >
            <Upload size={36} color="var(--cyan-400)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Upload Laboratory Batch CSV File
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: 460 }}>
              File must include the 15 parameter headers or Greywater_Source. Machine learning inference will process rows sequentially and save an audit summary.
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="csv-upload-input"
            />
            <label htmlFor="csv-upload-input" className="btn-primary" style={{ cursor: 'pointer' }}>
              Select CSV File
            </label>
          </div>

          {batchResults && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Batch Evaluation Results ({batchResults.totalSamples} Samples)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Anomaly Rate: <strong>{batchResults.anomalyRate}%</strong> | Safety Overrides: <strong>{batchResults.safetyOverridesCount}</strong>
                  </p>
                </div>
                <button className="btn-secondary" onClick={downloadBatchCSV}>
                  <Download size={15} /> Download Evaluated CSV
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Source</th>
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
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{r.source}</td>
                        <td>{r.prediction.class_name}</td>
                        <td>{(r.prediction.confidence * 100).toFixed(1)}%</td>
                        <td><StatusBadge label={r.anomaly.status} /></td>
                        <td style={{ fontWeight: 600, color: 'var(--cyan-400)' }}>{r.routing.final_route}</td>
                        <td><StatusBadge label={r.routing.final_action} /></td>
                        <td>{r.routing.override_applied ? 'YES' : 'NO'}</td>
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
