import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useTheme } from '../contexts/ThemeContext';
import ResultCard from './ResultCard';

/**
 * Chat Component
 * Handles symptom input and displays AI analysis results
 */
const Chat = () => {
  const [symptoms, setSymptoms] = useState('');
  const { analyzeSymptoms, data, loading, error, reset } = useChat();
  const { theme } = useTheme();

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      return;
    }

    await analyzeSymptoms(symptoms);
  };

  /**
   * Handle input change
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    setSymptoms(e.target.value);
    // Clear error and result when user starts typing
    if (error || data) {
      reset();
    }
  };

  /**
   * Handle reset/clear
   */
  const handleReset = () => {
    setSymptoms('');
    reset();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${
          theme === 'dark'
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'
            : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
        }`}>
          Symptom Checker
        </h2>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
          Describe your symptoms and get AI-powered health guidance
        </p>
      </div>

      {/* Chat Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="mb-4">
          <label htmlFor="symptoms" className={`block text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Describe Your Symptoms
          </label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={handleInputChange}
            placeholder="e.g., I have been experiencing headaches and fever for the past 2 days..."
            className="input-field min-h-[120px] resize-none"
            disabled={loading}
            required
          />
          <p className={`text-xs mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Be as detailed as possible for better analysis
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 p-4 rounded-lg backdrop-blur-sm ${
            theme === 'dark'
              ? 'bg-red-900/30 border border-red-500/50'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm flex items-center ${
              theme === 'dark' ? 'text-red-300' : 'text-red-800'
            }`}>
              <span className="mr-2">❌</span>
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze Symptoms'
            )}
          </button>
          
          {(data || error) && (
            <button
              type="button"
              onClick={handleReset}
              className={`px-6 py-3 border-2 font-semibold rounded-lg transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="card mt-6 text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            Analyzing your symptoms...
          </p>
        </div>
      )}

      {/* Result Card */}
      {data && !loading && <ResultCard data={data} />}
    </div>
  );
};

export default Chat;
