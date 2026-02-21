import { useState } from 'react';
import { analyzeImageAPI } from '../services/api';

/**
 * Custom hook for image analysis with symptoms
 * Manages loading, error, success states, and file validation
 * 
 * @returns {{
 *   analyzeImage: (symptoms: string, imageFile: File) => Promise<void>,
 *   data: Object | null,
 *   loading: boolean,
 *   error: string | null,
 *   reset: () => void
 * }}
 */
export const useImageAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Validate image file
   * @param {File} file - Image file to validate
   * @returns {string | null} Error message or null if valid
   */
  const validateImageFile = (file) => {
    if (!file) {
      return 'Please select an image file';
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP image';
    }

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return 'File size exceeds 2MB limit. Please upload a smaller image';
    }

    return null;
  };

  /**
   * Analyze image with optional symptoms
   * @param {string} symptoms - Optional symptom description
   * @param {File} imageFile - Image file to analyze
   */
  const analyzeImage = async (symptoms, imageFile) => {
    // Validate image file
    const validationError = validateImageFile(imageFile);
    if (validationError) {
      setError(validationError);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await analyzeImageAPI(symptoms || '', imageFile);
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to analyze image');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing image');
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
    analyzeImage,
    data,
    loading,
    error,
    reset,
  };
};
