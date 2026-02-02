import { useState, useRef } from 'react';
import './App.css';

const CLASS_NAMES = {
  0: "Dark Roast",
  1: "Green Bean",
  2: "Light Roast",
  3: "Medium Roast"
};

const CLASS_COLORS = {
  0: "#212121", // Dark
  1: "#558B2F", // Green
  2: "#A1887F", // Light
  3: "#5D4037"  // Medium
};

const CLASS_DESCRIPTIONS = {
  0: "Bold, smoky flavor with low acidity. Oils are visible on the surface.",
  1: "Raw, unroasted coffee beans. Grassy and distinct aroma.",
  2: "Mild flavor, higher acidity, and no oil on the surface. Retains original bean character.",
  3: "Balanced flavor, aroma, and acidity. The most popular roast level."
};

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', image);

    try {
      // Assuming backend is running on localhost:8000
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setPrediction(data['class']);
    } catch (err) {
      console.error(err);
      setError("Could not connect to the analysis engine. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>☕ Coffee Roast AI</h1>
        <p>Premium Grade Roast Analysis</p>
      </header>

      <main className="main-content">
        <div className="glass-card">
          {!preview ? (
            <div
              className="upload-area"
              onClick={triggerFileInput}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  setImage(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
            >
              <div className="upload-icon">📷</div>
              <h3>Upload Coffee Image</h3>
              <p>Drag & drop or click to browse</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="preview-area">
              <div className="image-container">
                <img src={preview} alt="Coffee Roast Preview" />
                {loading && <div className="scanning-overlay"><div className="scanner-line"></div></div>}
              </div>

              {prediction === null && !loading && (
                <div className="action-buttons">
                  <button className="btn-primary" onClick={analyzeImage}>Analyze Roast</button>
                  <button className="btn-secondary" onClick={reset}>Clear</button>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="loading-status">
              <div className="spinner"></div>
              <p>Analyzing bean color and texture...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
              <button className="btn-text" onClick={reset}>Try Again</button>
            </div>
          )}

          {prediction !== null && (
            <div className="result-card" style={{ '--result-color': CLASS_COLORS[prediction] }}>
              <div className="result-header">
                <span className="scent-icon">✨</span>
                <h2>{CLASS_NAMES[prediction]}</h2>
              </div>
              <p className="result-description">{CLASS_DESCRIPTIONS[prediction]}</p>
              <button className="btn-primary" onClick={reset}>Analyze Another</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
