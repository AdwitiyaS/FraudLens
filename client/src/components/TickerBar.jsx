import { useState, useEffect, useCallback } from 'react';
import { fetchRecentHistory } from '../api/apiClient';

const TickerBar = () => {
  const [items, setItems] = useState([]);

  const loadTicker = useCallback(async () => {
    try {
      const data = await fetchRecentHistory();
      setItems(Array.isArray(data) ? data.slice(0, 20) : []);
    } catch (err) {
      console.error('Ticker fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    loadTicker();
    const interval = setInterval(loadTicker, 8000);
    return () => clearInterval(interval);
  }, [loadTicker]);

  const renderItem = (item, i) => {
    const isFraud = item.isFraud || item.fraudProbability >= 0.5;
    const amt = parseFloat(item.amount || 0).toFixed(2);
    const prob = (item.fraudProbability || 0).toFixed(2);
    const txId = item.id ? `TX-${item.id.slice(-4)}` : `TX-${1000 + i}`;

    return (
      <span key={item._id || i} className={`tick-item ${isFraud ? 'tick-fraud' : 'tick-ok'}`}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.5px' }}>
          {isFraud ? '⚠ FRAUD' : '✓ LEGIT'}
        </span>
        <span>{txId}</span>
        <span style={{ fontWeight: 700 }}>${amt}</span>
        <span className="tick-amt">p={prob}</span>
      </span>
    );
  };

  if (items.length === 0) return null; // don't show an empty/fake-looking ticker

  return (
    <div className="ng-ticker">
      <div className="ng-ticker-label">Live Feed</div>
      <div className="ng-ticker-wrap">
        <div className="ng-ticker-inner">
          {items.map((item, i) => renderItem(item, i))}
          {items.map((item, i) => renderItem(item, i + 1000))}
        </div>
      </div>
    </div>
  );
};

export default TickerBar;