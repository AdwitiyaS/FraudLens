import React, { useState, useEffect } from 'react';
import { fetchCases, submitCaseReview } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import CaseCard from '../components/CaseCard';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { Briefcase, Filter } from 'lucide-react';

const CaseReview = () => {
  const { data: initialCases, loading, error, refetch } = useFetch(fetchCases, []);
  const [localCases, setLocalCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  // Sync initial fetch to local state for optimistic updates
  useEffect(() => {
    if (initialCases) {
      setLocalCases(initialCases);
    }
  }, [initialCases]);

  const handleReviewTrigger = (caseId, action) => {
    setSelectedCase(caseId);
    setActiveAction(action);
    setIsModalOpen(true);
  };

  const handleConfirmResolution = async (notes) => {
    const caseId = selectedCase;
    const label = activeAction;

    // Optimistic Update
    setLocalCases(prev => prev.map(c => 
      c.id === caseId 
        ? { ...c, reviewed: true, reviewLabel: label, notes: notes } 
        : c
    ));
    
    setIsModalOpen(false);

    try {
      await submitCaseReview(caseId, { 
        label: label, 
        notes: notes 
      });
      // Verification sync via background refetch
      refetch();
    } catch (err) {
      console.error("Resolution failed:", err);
      // Rollback on absolute failure
      refetch();
    }
  };

  const pendingCount = localCases.filter(c => !c.reviewed).length;

  return (
    <div className="font-syne" style={{ margin: '-2rem', background: 'var(--ng-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--ng-border)',
        background: 'var(--ng-surface)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ng-text)' }}>Case review</div>
          <div className="font-mono2" style={{ fontSize: 10, color: 'var(--ng-muted)', marginTop: 1 }}>
            Label fraud detections — your labels improve the model
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ng-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Open Investigations</div>
            <div className="font-mono2" style={{ fontSize: 16, fontWeight: 800, color: 'var(--ng-text)' }}>
              {pendingCount} <span style={{ color: 'var(--ng-muted)', fontWeight: 500, fontSize: 12 }}>/ {localCases.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: '20px 24px', flex: 1 }}>
        {loading && localCases.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
             {[...Array(6)].map((_, i) => (
               <div key={i} className="ng-card" style={{ height: 200, opacity: 0.5, animation: 'ng-pulse 2s infinite' }} />
             ))}
          </div>
        ) : error ? (
          <EmptyState 
             title="Connection Error" 
             message="We couldn't reach the intelligence server. Please ensure the backend services are running." 
             icon="error" 
             onRetry={refetch}
          />
        ) : localCases.length === 0 ? (
          <EmptyState 
            title="Queue Empty" 
            message="No anomalous cases require manual review at this moment. Good job!" 
            icon="success" 
            onRetry={refetch}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {localCases.map((caseData) => (
              <CaseCard 
                key={caseData.id} 
                caseData={caseData} 
                onReview={handleReviewTrigger}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal Overlay */}
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmResolution}
        actionType={activeAction}
      />
    </div>
  );
};

export default CaseReview;
