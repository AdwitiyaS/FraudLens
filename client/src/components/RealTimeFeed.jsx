import { useState, useEffect, useCallback } from 'react';
import { fetchRecentHistory } from '../api/apiClient';

const RealTimeFeed = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    try {
      const data = await fetchRecentHistory();
      setItems(Array.isArray(data) ? data.slice(0, 18) : []);
    } catch (err) {
      console.error('Feed fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
    const interval = setInterval(loadFeed, 5000); // poll real data every 5s
    return () => clearInterval(interval);
  }, [loadFeed]);

  return (
    <div className="ng-feed-card">
      <div className="ng-card-header">
        <div className="ng-card-title">Real-Time Feed</div>
        <span className="ng-badge ng-badge-live">● STREAMING</span>
      </div>
      <div className="ng-feed-list">
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--ng-muted)' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--ng-muted)' }}>No transactions yet</div>
        ) : (
          items.map((item, i) => {
            const isFraud = item.isFraud || item.fraudProbability >= 0.5;
            const amt = parseFloat(item.amount || 0).toFixed(2);
            const prob = Math.round((item.fraudProbability || 0) * 100);
            const txId = item.id ? `TX-${item.id.slice(-4)}` : `TX-${1000 + i}`;
            return (
              <div key={item._id || i} className={`ng-feed-item ${isFraud ? 'fraud' : 'legit'}`}>
                <div className={`ng-feed-icon ${isFraud ? 'f' : 'l'}`}>{isFraud ? '!' : '✓'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ng-feed-id">{txId}</div>
                  <div className="ng-feed-amt">
                    ${parseFloat(amt).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <span className="ng-feed-prob">{prob}%</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RealTimeFeed;