import { useState } from 'react';
import { chatAPI } from '../services/api';

/**
 * Custom hook for chat/symptom analysis
 * Manages loading, error, and success states
 * 
 * @returns {{
 *   analyzeSymptoms: (symptoms: string) => Promise<void>,
 *   data: Object | null,
 *   loading: boolean,
 *   error: string | null,
 *   reset: () => void
 * }}
 */
export const useChat = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Analyze symptoms via chat endpoint
   * @param {string} symptoms - Symptom description
   */
  const analyzeSymptoms = async (symptoms) => {
    // Validation
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      setError('Please enter your symptoms');
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await chatAPI(symptoms);
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to get analysis');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing symptoms');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset hook state
   */
  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    analyzeSymptoms,
    data,
    loading,
    error,
    reset,
  };
};
