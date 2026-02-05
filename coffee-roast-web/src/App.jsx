import { useState, useRef } from 'react';

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
      const response = await fetch('/predict', {
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

        {/* Left Col: Header & Upload */}
        <div className="space-y-8 flex flex-col justify-center h-full">
          <header className="space-y-4 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-800 to-coffee-900 text-white shadow-xl mb-2 rotate-3 hover:rotate-6 transition-transform duration-300">
              <span className="text-3xl">☕</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-coffee-900 leading-[1.1] tracking-tight">
              Artisan Roast <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-coffee-400 to-coffee-800">Analysis AI</span>
            </h1>
            <p className="text-coffee-700 text-lg lg:text-xl max-w-md mx-auto lg:mx-0 leading-relaxed">
              Experience the future of coffee grading. Upload a photo to instantly identify roast levels with AI precision.
            </p>
          </header>

          <div className="glass-card p-2 rounded-3xl transition-transform duration-500 hover:scale-[1.01]">
            {!preview ? (
              <div
                className="group relative h-72 md:h-80 border-2 border-dashed border-coffee-400/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-coffee-400 hover:bg-white/40 transition-all duration-300 gap-6"
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
                <div className="w-20 h-20 rounded-full bg-coffee-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                  📷
                </div>
                <div className="text-center px-4">
                  <h3 className="font-serif text-2xl text-coffee-900 mb-2">Upload Beans</h3>
                  <p className="text-coffee-700 font-medium">Drag & drop or click to browse</p>
                  <p className="text-coffee-400 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Supports JPG, PNG</p>
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
              <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden group shadow-inner">
                <img src={preview} alt="Coffee Roast Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                {loading && (
                  <div className="absolute inset-0 bg-coffee-900/40 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-coffee-400 rounded-full animate-spin mb-4 shadow-2xl"></div>
                    <p className="text-white text-lg font-medium tracking-wide animate-pulse">Brewing analysis...</p>
                  </div>
                )}

                {!loading && prediction === null && (
                  <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-center gap-4">
                    <button
                      className="glass-button px-8 py-3 rounded-xl font-bold flex-1 max-w-[200px]"
                      onClick={analyzeImage}
                    >
                      Analyze Roast
                    </button>
                    <button
                      className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors border border-white/20"
                      onClick={reset}
                    >
                      New Photo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50/90 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-xl shadow-lg flex justify-between items-center animate-pulse">
              <div className="text-red-800 font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
              <button className="text-red-500 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors" onClick={reset}>✕</button>
            </div>
          )}
        </div>

        {/* Right Col: Results */}
        <div className="flex items-center justify-center outline-none lg:h-full">
          {prediction !== null ? (
            <div className="w-full bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 transform transition-all duration-700 hover:shadow-coffee-400/20 animate-slide-up">
              <div className="h-48 relative overflow-hidden group">
                <div className="absolute inset-0 bg-coffee-800"></div>
                {/* Simulated texture overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-8 text-white z-10 w-full">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-coffee-200 text-sm font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Detected Roast</p>
                      <h2 className="text-5xl font-serif font-bold text-white shadow-sm">{CLASS_NAMES[prediction]}</h2>
                    </div>
                    <div className="text-4xl filter drop-shadow-lg animate-bounce-slow" title="Confidence">
                      ✨
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 lg:p-10 space-y-8">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-coffee-50 rounded-2xl text-3xl shadow-sm border border-coffee-100 text-coffee-800">
                    📝
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-coffee-900">Cupping Notes</h3>
                    <p className="text-coffee-700 text-lg leading-relaxed font-serif italic">
                      "{CLASS_DESCRIPTIONS[prediction]}"
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-coffee-50/50 rounded-2xl border border-coffee-100/50">
                  <h4 className="text-sm font-bold text-coffee-800 uppercase tracking-wider mb-4">Roast Characteristics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-coffee-100">
                      <span className="block text-xs text-coffee-500 uppercase">Acidity</span>
                      <div className="h-2 bg-coffee-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-coffee-400" style={{ width: prediction < 2 ? '30%' : '80%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-coffee-100">
                      <span className="block text-xs text-coffee-500 uppercase">Body</span>
                      <div className="h-2 bg-coffee-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-coffee-800" style={{ width: prediction === 0 ? '90%' : '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={reset}
                    className="w-full py-4 rounded-xl border-2 border-coffee-100 text-coffee-800 font-bold hover:border-coffee-800 hover:bg-coffee-50 transition-all duration-300 text-sm uppercase tracking-widest shadow-sm hover:shadow-md"
                  >
                    Analyze Another Batch
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Empty State / Placeholder
            <div className="hidden lg:flex flex-col items-center justify-center text-center opacity-60 select-none h-full min-h-[500px] relative">
              <div className="w-[30rem] h-[30rem] bg-gradient-to-tr from-coffee-200/30 to-purple-100/20 rounded-full flex items-center justify-center blur-3xl absolute animate-pulse-slow"></div>
              <div className="relative z-10 transform translate-y-[-2rem]">
                <div className="text-[12rem] leading-none opacity-20 filter blur-[2px] grayscale">☕</div>
                <p className="mt-8 text-coffee-900/60 font-serif text-3xl italic">
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
