const KpiCard = ({ label, value, sub, accent = 'cyan' }) => (
  <div className={`kpi-card accent-${accent}`}>
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-sub">{sub}</div>
  </div>
);

export default KpiCard;
