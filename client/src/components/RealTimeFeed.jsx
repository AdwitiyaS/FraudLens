import { useState, useEffect, useRef, useCallback } from 'react';

const COMPANIES = ['Visa', 'Mastercard', 'Stripe', 'PayPal', 'Square', 'Revolut', 'Wise', 'Monzo'];

const genItem = () => {
  const isFraud = Math.random() < 0.18;
  const amt = (isFraud ? Math.random() * 4000 + 500 : Math.random() * 90 + 10).toFixed(2);
  const prob = (isFraud ? Math.random() * 0.3 + 0.65 : Math.random() * 0.25).toFixed(2);
  const card1 = (Math.random() * 8000 + 1000).toFixed(0);
  const co = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
  const id = 'TX-' + (Math.floor(Math.random() * 9000) + 1000);
  return { isFraud, amt, prob, card1, co, id, key: Date.now() + Math.random() };
};

const RealTimeFeed = () => {
  const [items, setItems] = useState(() => Array.from({ length: 6 }, genItem));
  const listRef = useRef(null);

  const addItem = useCallback(() => {
    setItems(prev => {
      const next = [genItem(), ...prev];
      return next.slice(0, 18);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(addItem, 2200);
    return () => clearInterval(interval);
  }, [addItem]);

  return (
    <div className="ng-feed-card">
      <div className="ng-card-header">
        <div className="ng-card-title">Real-Time Feed</div>
        <span className="ng-badge ng-badge-live">● STREAMING</span>
      </div>
      <div className="ng-feed-list" ref={listRef}>
        {items.map((item) => (
          <div key={item.key} className={`ng-feed-item ${item.isFraud ? 'fraud' : 'legit'}`}>
            <div className={`ng-feed-icon ${item.isFraud ? 'f' : 'l'}`}>
              {item.isFraud ? '!' : '✓'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ng-feed-id">{item.id} · {item.co} · Card={item.card1}</div>
              <div className="ng-feed-amt">
                ${parseFloat(item.amt).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <span className="ng-feed-prob">
              {(parseFloat(item.prob) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeFeed;
