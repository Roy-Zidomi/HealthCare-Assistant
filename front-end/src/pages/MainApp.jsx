import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Chat from '../components/Chat';
import ImageAnalysis from '../components/ImageAnalysis';
import ThemeToggle from '../components/ThemeToggle';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Navigation */}
      <nav className={`border-b ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm sticky top-0 z-50`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HealthAI
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${
            theme === 'dark'
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'
          }`}>
            Healthcare Assistant
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Get AI-powered health guidance based on your symptoms and images
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex rounded-xl shadow-lg p-1 ${
            theme === 'dark'
              ? 'bg-gray-800/80 border border-gray-700/50'
              : 'bg-white border border-gray-200'
          } backdrop-blur-sm`}>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              💬 Symptom Checker
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'image'
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              📷 Image Analysis
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'chat' ? <Chat /> : <ImageAnalysis />}
        </div>
      </div>

      {/* Footer */}
      <footer className={`mt-16 py-8 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="container mx-auto px-6 text-center">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            ⚠️ This is not a substitute for professional medical advice. Always consult a qualified healthcare provider.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainApp;
