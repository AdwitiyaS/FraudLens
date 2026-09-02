/**
 * Helper to safely extract and format a number
 */
const parseNum = (val, defaultVal = 0) => {
  const num = Number(val);
  return isNaN(num) ? defaultVal : num;
};

/**
 * Normalizes a single transaction object.
 */
export const normalizeTransaction = (data) => {
  if (!data) return null;
  return {
    id: data._id || data.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
    time: parseNum(data.Time || data.time),
    amount: parseNum(data.Amount || data.amount),
    card1: parseNum(data.card1 || data.Card1),
    isFraud: Boolean(data.is_fraud || data.isFraud),
    fraudProbability: parseNum(data.fraud_probability, null),
    userId: data.userId || null,
    reviewed: Boolean(data.reviewed),
    reviewLabel: data.review_label || data.reviewLabel || null,
    notes: data.notes || '',
    raw: data,
  };
};

/**
 * Normalizes a paginated transactions payload.
 */
export const normalizePaginatedTransactions = (payload) => {
  if (!payload) return { transactions: [], total: 0, page: 1, totalPages: 1 };
  return {
    transactions: (payload.transactions || []).map(normalizeTransaction),
    total: parseNum(payload.total),
    fraudTotal: parseNum(payload.fraudTotal),
    page: parseNum(payload.page, 1),
    totalPages: parseNum(payload.totalPages, 1),
  };
};

/**
 * Normalizes the summary stats payload from /api/stats
 */
export const normalizeStats = (payload) => {
  if (!payload) return null;
  const mm = payload.modelMetrics || {};
  return {
    totalTransactions: parseNum(payload.totalTransactions),
    fraudsDetected: parseNum(payload.fraudsDetected),
    globalRiskScore: parseNum(payload.globalRiskScore),
    legitimateCount: parseNum(payload.legitimateCount),
    totalLive: parseNum(payload.totalLive),
    fraudLive: parseNum(payload.fraudLive),
    modelMetrics: {
      accuracy: parseNum(mm.accuracy),
      precision: parseNum(mm.precision),
      recall: parseNum(mm.recall),
      f1: parseNum(mm.f1),
      rocAuc: parseNum(mm.roc_auc),
    },
  };
};

/**
 * Normalizes the analytics payload from /api/analytics
 */
export const normalizeAnalytics = (payload) => {
  if (!payload) return null;
  return {
    amountDistribution: (payload.amountDistribution || []).map((b) => ({
      range: b._id || 'Other',
      count: parseNum(b.count),
      fraudCount: parseNum(b.fraudCount),
    })),
    total: parseNum(payload.total),
    fraudCount: parseNum(payload.fraudCount),
    legitCount: parseNum(payload.legitCount),
    fraudRate: parseNum(payload.fraudRate),
    topFrauds: (payload.topFrauds || []).map(normalizeTransaction),
    avgByClass: (payload.avgByClass || []).map((a) => ({
      isFraud: Boolean(a._id),
      avgAmount: parseNum(a.avgAmt),
      maxAmount: parseNum(a.maxAmt),
      count: parseNum(a.count),
    })),
  };
};

/**
 * Normalizes the model stats payload from /api/model-stats
 */
export const normalizeModelStats = (payload) => {
  if (!payload) return null;
  const metrics = payload.metrics || {};
  return {
    metrics: {
      accuracy: parseNum(metrics.accuracy),
      precision: parseNum(metrics.precision),
      recall: parseNum(metrics.recall),
      f1: parseNum(metrics.f1),
      rocAuc: parseNum(metrics.roc_auc),
      threshold: parseNum(metrics.threshold),
    },
    allModels: (payload.allModels || []).map(m => ({
      name: m.name,
      accuracy: parseNum(m.accuracy),
      precision: parseNum(m.precision),
      recall: parseNum(m.recall),
      f1: parseNum(m.f1),
      rocAuc: parseNum(m.roc_auc),
      isActive: Boolean(m.active)
    })),
    modelName: payload.modelName || 'Unknown',
    trainedOn: payload.trainedOn || 'Unknown Dataset',
    activeStructure: payload.activeStructure || 'RF_IF',
  };
};

/**
 * Normalizes case review list payload
 */
export const normalizeCases = (casesList) => {
  if (!casesList || !Array.isArray(casesList)) return [];
  return casesList.map(normalizeTransaction);
};

/**
 * Normalizes a SHAP prediction response
 */
export const normalizePrediction = (payload) => {
  if (!payload) return null;
  return {
    prediction: payload.prediction === 'FRAUD',
    fraudProbability: parseNum(payload.fraudProbability),
    baseValue: parseNum(payload.baseValue),
    shapValues: (payload.shapValues || []).map((sv) => ({
      feature: sv.feature,
      shapValue: parseNum(sv.shap_value || sv.shapValue),
    })),
  };
};
