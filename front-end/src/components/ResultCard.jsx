import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * ResultCard Component
 * Displays AI analysis results with color-coded severity badges
 * 
 * @param {Object} data - Analysis result data
 * @param {string} data.condition - Possible condition
 * @param {string} data.severity - Severity level (mild/moderate/high)
 * @param {string} data.advice - Home care advice
 * @param {string} data.doctor_visit - When to see a doctor
 * @param {string} data.disclaimer - Medical disclaimer
 */
const ResultCard = ({ data }) => {
  const { theme } = useTheme();
  
  if (!data) return null;

  /**
   * Get severity badge styling based on severity level
   * @param {string} severity - Severity level
   * @returns {string} Tailwind CSS classes
   */
  const getSeverityBadgeClass = (severity) => {
    const severityLower = severity?.toLowerCase() || 'mild';
    
    if (theme === 'dark') {
      switch (severityLower) {
        case 'mild':
          return 'bg-green-900/40 text-green-300 border-green-500/50';
        case 'moderate':
          return 'bg-yellow-900/40 text-yellow-300 border-yellow-500/50';
        case 'high':
          return 'bg-red-900/40 text-red-300 border-red-500/50';
        default:
          return 'bg-gray-700/40 text-gray-300 border-gray-500/50';
      }
    } else {
      switch (severityLower) {
        case 'mild':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'moderate':
          return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'high':
          return 'bg-red-100 text-red-800 border-red-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    }
  };

  /**
   * Get severity icon based on severity level
   * @param {string} severity - Severity level
   * @returns {string} Emoji icon
   */
  const getSeverityIcon = (severity) => {
    const severityLower = severity?.toLowerCase() || 'mild';
    
    switch (severityLower) {
      case 'mild':
        return '🟢';
      case 'moderate':
        return '🟡';
      case 'high':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="card mt-6 animate-fade-in">
      {/* Header with Condition and Severity Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 ${
            theme === 'dark'
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
          }`}>
            Analysis Result
          </h3>
          <p className={`text-lg font-medium ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {data.condition || 'Unable to assess'}
          </p>
        </div>
        <div className={`severity-badge border ${getSeverityBadgeClass(data.severity)}`}>
          <span className="mr-2">{getSeverityIcon(data.severity)}</span>
          <span className="capitalize">{data.severity || 'mild'}</span>
        </div>
      </div>

      {/* Advice Section */}
      {data.advice && (
        <div className="mb-4">
          <h4 className={`text-sm font-semibold mb-2 flex items-center ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <span className="mr-2">💡</span>
            Home Care Advice
          </h4>
          <p className={`leading-relaxed p-4 rounded-lg border-l-4 backdrop-blur-sm ${
            theme === 'dark'
              ? 'text-gray-200 bg-blue-900/20 border-blue-500'
              : 'text-gray-800 bg-blue-50 border-blue-400'
          }`}>
            {data.advice}
          </p>
        </div>
      )}

      {/* Doctor Visit Suggestion */}
      {data.doctor_visit && (
        <div className="mb-4">
          <h4 className={`text-sm font-semibold mb-2 flex items-center ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <span className="mr-2">🏥</span>
            When to See a Doctor
          </h4>
          <p className={`leading-relaxed p-4 rounded-lg border-l-4 backdrop-blur-sm ${
            theme === 'dark'
              ? 'text-gray-200 bg-purple-900/20 border-purple-500'
              : 'text-gray-800 bg-purple-50 border-purple-400'
          }`}>
            {data.doctor_visit}
          </p>
        </div>
      )}

      {/* Disclaimer Alert */}
      {data.disclaimer && (
        <div className={`mt-4 p-4 rounded-lg backdrop-blur-sm ${
          theme === 'dark'
            ? 'bg-amber-900/30 border border-amber-500/50'
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-start">
            <span className={`mr-2 text-xl ${
              theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
            }`}>⚠️</span>
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-amber-200' : 'text-amber-800'
            }`}>
              <strong className="font-semibold">Medical Disclaimer:</strong> {data.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
