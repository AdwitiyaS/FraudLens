const DashboardFooter = () => (
  <div className="ng-footer">
    <div className="ng-footer-left">
      NeuralGuard v2.0 · MongoDB Atlas · Flask 5001 · Node 5000
    </div>
    <div style={{ display: 'flex', gap: 16 }}>
      <span className="ng-footer-stat">Model: <span>random_forest_model.pkl</span></span>
      <span className="ng-footer-stat">Features: <span>202</span></span>
      <span className="ng-footer-stat">Threshold: <span>0.35</span></span>
      <span className="ng-footer-stat">Status: <span>LIVE</span></span>
    </div>
  </div>
);

export default DashboardFooter;
