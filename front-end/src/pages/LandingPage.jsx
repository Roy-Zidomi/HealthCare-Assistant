import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const { theme } = useTheme();
  const featuresRef = useRef(null);

  const handleLearnMore = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: 'SC',
      title: 'Symptom Analysis',
      description: 'Describe your symptoms and get AI-powered health insights and recommendations.',
    },
    {
      icon: 'IA',
      title: 'Image Analysis',
      description: 'Upload images for visual analysis with multimodal AI technology.',
    },
    {
      icon: 'FAST',
      title: 'Instant Results',
      description: 'Get quick, accurate health guidance powered by advanced AI models.',
    },
    {
      icon: 'SAFE',
      title: 'Privacy First',
      description: 'Your health data is processed securely and never stored.',
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          HealthAI
        </div>
        <ThemeToggle />
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-5xl md:text-7xl font-extrabold mb-6 ${
            theme === 'dark' 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' 
              : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
          }`}>
            Your AI-Powered Healthcare Assistant
          </h1>

          <p className={`text-xl md:text-2xl mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Get instant health insights and guidance based on your symptoms and images.
            Powered by advanced AI technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Link>

            <button
              onClick={handleLearnMore}
              className={`px-8 py-4 border-2 rounded-xl font-semibold transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className={`rounded-2xl p-8 shadow-2xl ${
            theme === 'dark' 
              ? 'bg-gray-800/50 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'
              }`}>
                <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">SC</div>
                <h3 className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Symptom Checker</h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Describe your symptoms...</p>
              </div>

              <div className={`p-6 rounded-xl ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-purple-50'
              }`}>
                <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">IA</div>
                <h3 className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>Image Analysis</h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Upload images for analysis...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className={`py-20 ${
          theme === 'dark' ? 'bg-gray-800/30' : 'bg-white/50'
        }`}
      >
        <div className="container mx-auto px-6">
          <h2 className={`text-4xl font-bold text-center mb-12 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl transition-all duration-200 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700 hover:border-purple-500'
                    : 'bg-white border border-gray-200 hover:border-purple-300 shadow-md'
                }`}
              >
                <div className="inline-flex items-center justify-center min-w-14 h-14 px-3 mb-4 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {feature.title}
                </h3>
                <p className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className={`max-w-3xl mx-auto p-12 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-gray-700'
              : 'bg-gradient-to-r from-blue-100 to-purple-100 border border-gray-200'
          }`}>
            <h2 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Ready to Get Started?
            </h2>

            <p className={`text-lg mb-8 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Experience AI-powered healthcare guidance today.
            </p>

            <Link
              to="/app"
              className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Using HealthAI
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="container mx-auto px-6 text-center">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            This is not a substitute for professional medical advice. Always consult a qualified healthcare provider.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
