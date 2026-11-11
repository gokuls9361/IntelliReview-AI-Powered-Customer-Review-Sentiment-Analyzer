const API_BASE = '/api';

export async function analyzeReview(reviewText, modelType = 'distilbert') {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_text: reviewText, model_type: modelType })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to analyze review');
  }
  return res.json();
}

export async function analyzeBatch(reviews, modelType = 'distilbert') {
  const res = await fetch(`${API_BASE}/batch-analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviews, model_type: modelType })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to process batch');
  }
  return res.json();
}

export async function uploadCSV(file, modelType = 'distilbert') {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload-csv?model_type=${modelType}`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload CSV');
  }
  return res.json();
}

export async function analyzeABSA(reviewText) {
  const res = await fetch(`${API_BASE}/absa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_text: reviewText })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to execute ABSA');
  }
  return res.json();
}

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard-stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function getKeywords() {
  const res = await fetch(`${API_BASE}/keywords`);
  if (!res.ok) throw new Error('Failed to fetch keywords');
  return res.json();
}

export async function getProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function compareProducts(modelType = 'distilbert') {
  const res = await fetch(`${API_BASE}/compare-products?model_type=${modelType}`);
  if (!res.ok) throw new Error('Failed to compare products');
  return res.json();
}

export async function getModelsBenchmark() {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Failed to fetch benchmark metrics');
  return res.json();
}
