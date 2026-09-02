import { useMemo } from 'react';

const COMPANIES = ['Visa', 'Mastercard', 'Stripe', 'PayPal', 'Square', 'Revolut', 'Wise', 'Monzo'];
const IDS = ['TX', 'XF', 'QR', 'NP', 'BK'];

const genTick = (isFraud) => {
  const co = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
  const id = IDS[Math.floor(Math.random() * IDS.length)] + '-' + (Math.floor(Math.random() * 9000) + 1000);
  const amt = isFraud
    ? '$' + (Math.random() * 4000 + 500).toFixed(2)
    : '$' + (Math.random() * 90 + 10).toFixed(2);
  const prob = isFraud
    ? (Math.random() * 0.3 + 0.65).toFixed(2)
    : (Math.random() * 0.2).toFixed(2);
  return { isFraud, co, id, amt, prob };
};

const TickerBar = () => {
  const items = useMemo(() => {
    return Array.from({ length: 20 }, () => genTick(Math.random() < 0.18));
  }, []);

  const renderItem = (item, i) => (
    <span key={i} className={`tick-item ${item.isFraud ? 'tick-fraud' : 'tick-ok'}`}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.5px' }}>
        {item.isFraud ? '⚠ FRAUD' : '✓ LEGIT'}
      </span>
      <span>{item.id}</span>
      <span className="tick-amt">{item.co}</span>
      <span style={{ fontWeight: 700 }}>{item.amt}</span>
      <span className="tick-amt">p={item.prob}</span>
    </span>
  );

  return (
    <div className="ng-ticker">
      <div className="ng-ticker-label">Live Feed</div>
      <div className="ng-ticker-wrap">
        <div className="ng-ticker-inner">
          {items.map((item, i) => renderItem(item, i))}
          {/* Duplicate for seamless loop */}
          {items.map((item, i) => renderItem(item, i + 100))}
        </div>
      </div>
    </div>
  );
};

export default TickerBar;
