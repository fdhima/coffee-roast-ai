import { useState, useRef } from 'react';

const CLASS_NAMES = {
  0: "Dark Roast",
  1: "Green Bean",
  2: "Light Roast",
  3: "Medium Roast"
};

// Keeping hex codes for dynamic border/shadow effects that are harder with just utility classes
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
    <div className="min-h-screen bg-coffee-50 bg-coffee-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">

        {/* Left Col: Header & Upload */}
        <div className="space-y-8">
          <header className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-coffee-800 text-white shadow-lg mb-4">
              <span className="text-2xl">☕</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-coffee-900 leading-tight">
              Artisan Roast <br /> <span className="text-coffee-400">Analysis AI</span>
            </h1>
            <p className="text-coffee-700 text-lg max-w-md">
              Upload a photo of your coffee beans to instantly identify their roast level with premium precision.
            </p>
          </header>

          <div className="glass-panel p-1 rounded-2xl bg-white/40 backdrop-blur-sm shadow-xl border border-white/50">
            {!preview ? (
              <div
                className="group relative h-64 border-2 border-dashed border-coffee-400/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-coffee-400 hover:bg-white/50 transition-all duration-300 gap-4"
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
                <div className="w-16 h-16 rounded-full bg-coffee-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                  📷
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-xl text-coffee-900">Upload Beans</h3>
                  <p className="text-coffee-700 text-sm">Drag & drop or click to browse</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative h-64 rounded-xl overflow-hidden group">
                <img src={preview} alt="Coffee Roast Preview" className="w-full h-full object-cover" />

                {loading && (
                  <div className="absolute inset-0 bg-coffee-900/20 backdrop-blur-[2px] flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3"></div>
                    <p className="text-white font-medium tracking-wide animate-pulse">Analyzing...</p>
                  </div>
                )}

                {!loading && prediction === null && (
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex justify-between items-end">
                    <button
                      className="bg-coffee-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:bg-coffee-900 transition-colors active:transform active:scale-95"
                      onClick={analyzeImage}
                    >
                      Analyze Roast
                    </button>
                    <button
                      className="bg-white/90 text-coffee-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-white transition-colors"
                      onClick={reset}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex justify-between items-center">
              <div className="text-red-800 text-sm font-medium">⚠️ {error}</div>
              <button className="text-red-500 hover:text-red-800 font-bold" onClick={reset}>✕</button>
            </div>
          )}
        </div>

        {/* Right Col: Results */}
        <div className="flex items-center justify-center outline-none">
          {prediction !== null ? (
            <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-coffee-100 transform transition-all duration-500 hover:scale-[1.02]">
              <div className="h-32 bg-coffee-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/coffee.png')]"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <p className="text-coffee-200 text-sm font-medium uppercase tracking-wider mb-1">Detected Roast</p>
                  <h2 className="text-4xl font-serif font-bold">{CLASS_NAMES[prediction]}</h2>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-coffee-50 rounded-lg text-2xl">✨</div>
                  <div>
                    <h3 className="text-lg font-bold text-coffee-900 mb-1">Tasting Notes</h3>
                    <p className="text-coffee-700 leading-relaxed">
                      {CLASS_DESCRIPTIONS[prediction]}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-coffee-100">
                  <button
                    onClick={reset}
                    className="w-full py-4 rounded-xl border-2 border-coffee-100 text-coffee-800 font-bold hover:border-coffee-800 hover:bg-coffee-50 transition-all duration-300 text-sm uppercase tracking-widest"
                  >
                    Analyze Another Batch
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Empty State / Placeholder
            <div className="hidden md:flex flex-col items-center justify-center text-center opacity-40 select-none">
              <div className="w-64 h-64 bg-coffee-200/20 rounded-full flex items-center justify-center mb-6 blur-3xl absolute"></div>
              <div className="relative z-10">
                <span className="text-9xl grayscale opacity-20">☕</span>
                <p className="mt-4 text-coffee-800 font-serif text-xl italic">
                  "Life matches the grind."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
