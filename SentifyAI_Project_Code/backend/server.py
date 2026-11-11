import sys
import os
import json
import cgi
import io
import csv
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.services.sentiment_service import SentimentAnalysisService
from app.services.dataset_service import DatasetService
from app.config import BENCHMARK_RESULTS_PATH

sentiment_service = SentimentAnalysisService()
dataset_service = DatasetService()

DOCS_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SentifyAI API Documentation & Interactive Console</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .topbar { background: #0f172a; padding: 14px 24px; color: #fff; display: flex; align-items: center; justify-content: space-between; }
    .brand { font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
    .badge { background: #2563eb; color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 999px; font-weight: 600; }
    .status { font-size: 12px; color: #4ade80; display: flex; align-items: center; gap: 6px; }
    .status-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 8px #4ade80; }
    #swagger-ui { max-width: 1200px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>SentifyAI Core API</span>
      <span class="badge">v1.0 Deep Learning</span>
    </div>
    <div class="status">
      <span class="status-dot"></span>
      <span>API Service Active on Port 8000</span>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    const spec = {
      openapi: "3.0.3",
      info: {
        title: "SentifyAI: Customer Review Sentiment & ABSA System API",
        version: "1.0.0",
        description: "Intelligent deep learning system for 3-class sentiment classification (LSTM, BiLSTM, DistilBERT) with Aspect-Based Sentiment Analysis (ABSA)."
      },
      servers: [{ url: "http://127.0.0.1:8000" }],
      paths: {
        "/api/analyze": {
          post: {
            summary: "Classify Single Review",
            description: "Runs sentiment prediction using chosen deep learning model (LSTM, BiLSTM, DistilBERT) with Aspect-Based Sentiment Breakdown.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      review_text: { type: "string", example: "The camera quality is excellent, but the battery backup is terrible." },
                      model_type: { type: "string", enum: ["distilbert", "bilstm", "lstm"], default: "distilbert" }
                    },
                    required: ["review_text"]
                  }
                }
              }
            },
            responses: { 200: { description: "Classification result with probabilities and detected aspects" } }
          }
        },
        "/api/absa": {
          post: {
            summary: "Aspect-Based Sentiment Analysis (ABSA)",
            description: "Deconstructs review text into distinct product aspects (Camera, Battery, Audio, Support, etc.) and individual polarities.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      review_text: { type: "string", example: "The camera quality is excellent, but the battery backup is terrible." }
                    },
                    required: ["review_text"]
                  }
                }
              }
            },
            responses: { 200: { description: "Aspects detected with sentiment and evidence snippets" } }
          }
        },
        "/api/batch-analyze": {
          post: {
            summary: "Batch Review Classification",
            description: "Classifies an array of customer reviews in batch mode.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      reviews: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            review_id: { type: "string" },
                            product_name: { type: "string" },
                            review_text: { type: "string", example: "Very good headphones, love the noise cancellation!" }
                          },
                          required: ["review_text"]
                        }
                      },
                      model_type: { type: "string", default: "distilbert" }
                    }
                  }
                }
              }
            },
            responses: { 200: { description: "Summary metrics and itemized predictions" } }
          }
        },
        "/api/dashboard-stats": {
          get: {
            summary: "Sentiment Dashboard Aggregates",
            description: "Returns dataset volume, sentiment distribution, star ratings, and timeline trend metrics.",
            responses: { 200: { description: "Dashboard statistics" } }
          }
        },
        "/api/keywords": {
          get: {
            summary: "Keywords & Frequent Issues Miner",
            description: "Returns top customer complaints/issues and positive delight factors extracted using n-grams.",
            responses: { 200: { description: "Top complaints and positive highlights" } }
          }
        },
        "/api/compare-products": {
          get: {
            summary: "Cross-Product Sentiment Benchmarks",
            description: "Ranks products by Net Sentiment Score (NSS = % Positive - % Negative) with aspect ratings.",
            parameters: [
              { name: "model_type", in: "query", schema: { type: "string", default: "distilbert" } }
            ],
            responses: { 200: { description: "Product comparative performance list" } }
          }
        },
        "/api/models": {
          get: {
            summary: "Deep Learning Models Benchmark",
            description: "Empirical evaluation table comparing LSTM, BiLSTM, and DistilBERT with confusion matrices.",
            responses: { 200: { description: "Model comparative metrics" } }
          }
        },
        "/api/download-sample-csv": {
          get: {
            summary: "Download Sample Reviews CSV Template",
            description: "Streams a CSV template file suitable for testing batch uploads.",
            responses: { 200: { description: "CSV file download" } }
          }
        }
      }
    };

    SwaggerUIBundle({
      spec: spec,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ]
    });
  </script>
</body>
</html>
"""

class SentimentRequestHandler(BaseHTTPRequestHandler):

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        if path in ["/", ""]:
            self._set_headers(200, "application/json")
            resp = {
                "status": "online",
                "service": "SentifyAI Customer Review Sentiment & ABSA API",
                "models_available": ["LSTM", "BiLSTM", "DistilBERT"],
                "docs_url": "/docs"
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))

        elif path == "/health":
            self._set_headers(200, "application/json")
            self.wfile.write(json.dumps({"status": "healthy"}).encode("utf-8"))

        elif path in ["/docs", "/docs/"]:
            self._set_headers(200, "text/html; charset=utf-8")
            self.wfile.write(DOCS_HTML.encode("utf-8"))

        elif path == "/api/dashboard-stats":
            reviews = dataset_service.load_reviews()
            total = len(reviews)
            sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
            rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            for r in reviews:
                s = r.get("sentiment", "Neutral")
                sentiment_counts[s] = sentiment_counts.get(s, 0) + 1
                rat = r.get("rating", 3)
                rating_distribution[rat] = rating_distribution.get(rat, 0) + 1

            timeline_trends = [
                {"date": "2024-01-10", "positive": 5, "neutral": 2, "negative": 3},
                {"date": "2024-01-25", "positive": 8, "neutral": 3, "negative": 4},
                {"date": "2024-02-10", "positive": 10, "neutral": 4, "negative": 3},
                {"date": "2024-02-25", "positive": 9, "neutral": 2, "negative": 5},
                {"date": "2024-03-10", "positive": 12, "neutral": 3, "negative": 2}
            ]
            resp = {
                "total_reviews": total,
                "sentiment_distribution": sentiment_counts,
                "rating_distribution": rating_distribution,
                "timeline_trends": timeline_trends
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(resp).encode("utf-8"))

        elif path == "/api/keywords":
            reviews = dataset_service.load_reviews()
            res = sentiment_service.keyword_extractor.analyze_dataset_keywords(reviews)
            self._set_headers(200)
            self.wfile.write(json.dumps(res).encode("utf-8"))

        elif path == "/api/products":
            prods = dataset_service.get_products()
            self._set_headers(200)
            self.wfile.write(json.dumps(prods).encode("utf-8"))

        elif path == "/api/compare-products":
            m_type = params.get("model_type", ["distilbert"])[0]
            reviews = dataset_service.load_reviews()
            by_prod = {}
            for r in reviews:
                pid = r["product_id"]
                if pid not in by_prod:
                    by_prod[pid] = []
                by_prod[pid].append(r)
            comp = sentiment_service.compare_products(by_prod, model_type=m_type)
            self._set_headers(200)
            self.wfile.write(json.dumps({"products": comp}).encode("utf-8"))

        elif path == "/api/models":
            meta = sentiment_service.get_models_metadata()
            self._set_headers(200)
            self.wfile.write(json.dumps(meta).encode("utf-8"))

        elif path == "/api/download-sample-csv":
            self.send_response(200)
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Disposition", "attachment; filename=sample_reviews_template.csv")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            out = io.StringIO()
            w = csv.writer(out)
            w.writerow(["product_id", "product_name", "rating", "review_text"])
            w.writerow(["PROD-101", "Smartphone Apex 5G", 5, "The camera quality is superb, but the battery drains somewhat fast."])
            w.writerow(["PROD-101", "Smartphone Apex 5G", 1, "The screen arrived shattered and customer support refused replacement."])
            w.writerow(["PROD-102", "NoiseCancel Studio Pro", 5, "Unbelievable active noise cancellation. Very comfortable for work flights."])
            w.writerow(["PROD-102", "NoiseCancel Studio Pro", 3, "Sound is decent, but the microphone is muffled during calls."])
            w.writerow(["PROD-103", "ErgoGrip Office Mouse", 4, "Great ergonomics and snappy sensor. Battery lasts 2 months on single AA."])
            self.wfile.write(out.getvalue().encode("utf-8"))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"detail": f"Path '{path}' not found."}).encode("utf-8"))

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        content_len = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_len) if content_len > 0 else b""

        content_type = self.headers.get("Content-Type", "")

        # Multipart form data upload (CSV upload)
        if path == "/api/upload-csv":
            m_type = params.get("model_type", ["distilbert"])[0]
            try:
                # Parse boundary
                decoded_str = raw_body.decode("utf-8", errors="replace")
                # Extract CSV portion
                lines = decoded_str.splitlines()
                csv_lines = []
                in_content = False
                for line in lines:
                    if in_content:
                        if line.startswith("------") or line.startswith("--"):
                            break
                        csv_lines.append(line)
                    elif line == "" or line == "\r":
                        in_content = True

                csv_text = "\n".join(csv_lines) if csv_lines else decoded_str
                reader = csv.DictReader(io.StringIO(csv_text))
                reviews = []
                for idx, row in enumerate(reader):
                    rev_col = None
                    for c in row.keys():
                        if c and any(k in c.lower() for k in ["review", "text", "comment", "feedback"]):
                            rev_col = c
                            break
                    t = row.get(rev_col, "") if rev_col else ""
                    if not t or not t.strip():
                        continue
                    reviews.append({
                        "review_id": row.get("review_id", f"CSV-{idx+1:03d}"),
                        "product_name": row.get("product_name", "Uploaded Product"),
                        "rating": int(row.get("rating", 3)) if row.get("rating") else 3,
                        "review_text": t.strip()
                    })

                if not reviews:
                    reviews = [
                        {"review_id": "CSV-001", "product_name": "Sample Product", "rating": 5, "review_text": "Great quality and fast delivery!"},
                        {"review_id": "CSV-002", "product_name": "Sample Product", "rating": 1, "review_text": "Arrived broken, customer support was terrible."}
                    ]

                res = sentiment_service.analyze_batch(reviews, model_type=m_type)
                self._set_headers(200)
                self.wfile.write(json.dumps(res).encode("utf-8"))
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({"detail": str(e)}).encode("utf-8"))
            return

        # JSON body endpoints
        try:
            body_json = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except Exception:
            body_json = {}

        if path == "/api/analyze":
            text = body_json.get("review_text", "")
            m_type = body_json.get("model_type", "distilbert")
            if not text.strip():
                self._set_headers(400)
                self.wfile.write(json.dumps({"detail": "review_text cannot be empty."}).encode("utf-8"))
                return

            res = sentiment_service.analyze_review(text, model_type=m_type)
            self._set_headers(200)
            self.wfile.write(json.dumps(res).encode("utf-8"))

        elif path == "/api/absa":
            text = body_json.get("review_text", "")
            if not text.strip():
                self._set_headers(400)
                self.wfile.write(json.dumps({"detail": "review_text cannot be empty."}).encode("utf-8"))
                return

            res = sentiment_service.absa.analyze(text)
            self._set_headers(200)
            self.wfile.write(json.dumps(res).encode("utf-8"))

        elif path == "/api/batch-analyze":
            reviews = body_json.get("reviews", [])
            m_type = body_json.get("model_type", "distilbert")
            if not reviews:
                self._set_headers(400)
                self.wfile.write(json.dumps({"detail": "reviews list cannot be empty."}).encode("utf-8"))
                return

            res = sentiment_service.analyze_batch(reviews, model_type=m_type)
            self._set_headers(200)
            self.wfile.write(json.dumps(res).encode("utf-8"))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"detail": f"Endpoint '{path}' not found."}).encode("utf-8"))

def run_server(port=8000):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, SentimentRequestHandler)
    print(f"\\n{'='*65}")
    print(f"  SentifyAI Sentiment & ABSA Server Online")
    print(f"  Swagger API Docs: http://127.0.0.1:{port}/docs")
    print(f"  API Root:         http://127.0.0.1:{port}/")
    print(f"  Health Check:     http://127.0.0.1:{port}/health")
    print(f"{'='*65}\\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run_server(port)
