import React, { useState, useCallback, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  BarChart3,
  Database,
  X,
} from 'lucide-react';
import { uploadDatasetFile } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

const UploadDataset = () => {
  const { user } = useAuth();
  const storageKey = `lastUploadResult_${user?._id || 'anonymous'}`;

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  /* ── Drag & Drop handlers ─────────────────────────────────────────────── */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please upload a valid .csv file.');
    }
  }, []);

  const handleBrowse = useCallback((e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setResults(null);
    }
  }, []);

  /* ── Upload logic ─────────────────────────────────────────────────────── */
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResults(null);
    try {
      const data = await uploadDatasetFile(file);
      setResults(data);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (err) {
      const msg =
        err.response?.data?.error || err.message || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    setError(null);
    localStorage.removeItem(storageKey);
    if (inputRef.current) inputRef.current.value = '';
  };

  /* ── Helper: format file size ─────────────────────────────────────────── */
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="font-syne" style={{ margin: '-2rem', background: 'var(--ng-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--ng-border)',
        background: 'var(--ng-surface)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>Dataset upload</div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 1 }}>
            Run batch inference on transaction CSVs
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '20px 24px', flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* ── Drop Zone ─────────────────────────────────────────────────────── */}
          {!results && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Drop CSV file here or click to browse"
              className="ng-card group"
              style={{
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
                padding: '60px 24px', borderStyle: 'dashed', textAlign: 'center', transition: 'all 0.3s ease',
                borderColor: dragOver ? 'var(--ng-accent)' : 'var(--ng-border)',
                background: dragOver ? 'rgba(0,229,255,0.05)' : 'var(--ng-surface)'
              }}
            >
              <div style={{ 
                width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease',
                background: dragOver ? 'rgba(0,229,255,0.1)' : 'var(--ng-dim)', 
                transform: dragOver ? 'scale(1.1)' : 'scale(1)' 
              }}>
                <UploadCloud size={24} color={dragOver ? 'var(--ng-accent)' : 'var(--ng-muted)'} />
              </div>

              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>
                  {dragOver ? 'Drop your file here' : 'Drag & drop your CSV file'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--ng-muted)', marginTop: 4 }}>
                  or <span style={{ color: 'var(--ng-accent)', textDecoration: 'underline' }}>browse files</span>
                </p>
              </div>
              <p style={{ fontSize: 10, color: 'var(--ng-muted)', fontStyle: 'italic' }}>
                Supports .csv files • Must include an "Amount" column
              </p>

              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleBrowse}
                className="hidden"
                aria-hidden="true"
              />
            </div>
          )}

          {/* ── Selected File Card ────────────────────────────────────────────── */}
          {file && !results && (
            <div className="ng-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, animation: 'ng-fadeIn 0.3s ease' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(0,200,122,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileSpreadsheet size={18} color="var(--ng-green)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ng-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                <p className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)' }}>{formatSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--ng-muted)', cursor: 'pointer', padding: 8 }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* ── Error Banner ──────────────────────────────────────────────────── */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 10, background: 'rgba(255,59,92,.1)', border: '1px solid rgba(255,59,92,.2)', animation: 'ng-fadeIn 0.3s ease' }}>
              <XCircle size={18} color="var(--ng-red)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ng-red)' }}>Upload Error</p>
                <p style={{ fontSize: 12, color: 'var(--ng-red)', opacity: 0.8, marginTop: 4 }}>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ng-red)', opacity: 0.6, cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── Upload Button ─────────────────────────────────────────────────── */}
          {file && !results && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                width: '100%', padding: '14px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.3s ease', cursor: uploading ? 'not-allowed' : 'pointer',
                background: uploading ? 'var(--ng-dim)' : 'var(--ng-accent)',
                color: uploading ? 'var(--ng-muted)' : '#000',
                border: 'none',
              }}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing transactions…
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Run Fraud Analysis
                </>
              )}
            </button>
          )}

          {/* ── Results Panel ─────────────────────────────────────────────────── */}
          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'ng-slideUp 0.4s ease' }}>
              {/* Success header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 10, background: 'rgba(0,200,122,.1)', border: '1px solid rgba(0,200,122,.2)' }}>
                <CheckCircle2 size={20} color="var(--ng-green)" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ng-green)' }}>Analysis Complete</p>
                  <p style={{ fontSize: 11, color: 'var(--ng-green)', opacity: 0.7, marginTop: 2 }}>
                    Your dataset has been evaluated by the fraud detection model.
                  </p>
                </div>
              </div>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {/* Total Rows */}
                <div className="ng-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,229,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Database size={20} color="var(--ng-accent)" />
                  </div>
                  <div className="font-mono2" style={{ fontSize: 24, fontWeight: 700, color: 'var(--ng-text)' }}>
                    {results.totalRows?.toLocaleString() ?? '—'}
                  </div>
                  <p style={{ fontSize: 9, color: 'var(--ng-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Total Rows</p>
                </div>

                {/* Frauds Detected */}
                <div className="ng-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,59,92,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <ShieldAlert size={20} color="var(--ng-red)" />
                  </div>
                  <div className="font-mono2" style={{ fontSize: 24, fontWeight: 700, color: 'var(--ng-text)' }}>
                    {results.fraudsDetected?.toLocaleString() ?? '—'}
                  </div>
                  <p style={{ fontSize: 9, color: 'var(--ng-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Frauds Detected</p>
                </div>

                {/* Fraud Rate */}
                <div className="ng-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,176,32,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <BarChart3 size={20} color="var(--ng-amber)" />
                  </div>
                  <div className="font-mono2" style={{ fontSize: 24, fontWeight: 700, color: 'var(--ng-text)' }}>
                    {results.fraudRate != null ? `${results.fraudRate}%` : '—'}
                  </div>
                  <p style={{ fontSize: 9, color: 'var(--ng-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Fraud Rate</p>
                </div>
              </div>

              {/* Fraud-rate severity bar */}
              <div className="ng-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ng-muted)' }}>Threat Level</span>
                  <span
                    style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: (results.fraudRate ?? 0) > 10 ? 'var(--ng-red)' : (results.fraudRate ?? 0) > 3 ? 'var(--ng-amber)' : 'var(--ng-green)' }}
                  >
                    {(results.fraudRate ?? 0) > 10 ? 'High Risk' : (results.fraudRate ?? 0) > 3 ? 'Moderate' : 'Low Risk'}
                  </span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--ng-dim)', overflow: 'hidden' }}>
                  <div
                    style={{ height: '100%', transition: 'width 1s ease-out', width: `${Math.min(results.fraudRate ?? 0, 100)}%`, background: (results.fraudRate ?? 0) > 10 ? 'var(--ng-red)' : (results.fraudRate ?? 0) > 3 ? 'var(--ng-amber)' : 'var(--ng-green)' }}
                  />
                </div>
              </div>

              {/* Upload another */}
              <button
                onClick={handleReset}
                style={{ width: '100%', padding: '14px', borderRadius: 10, background: 'transparent', border: '1px solid var(--ng-border)', color: 'var(--ng-text)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Upload Another Dataset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadDataset;
