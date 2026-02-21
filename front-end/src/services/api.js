import axios from 'axios';

/**
 * API Base Configuration
 * Base URL for the Express backend API
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with default config
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for AI responses
});

/**
 * Chat API Service
 * Sends symptoms text to backend for AI analysis
 * 
 * @param {string} symptoms - User's symptom description
 * @returns {Promise<{success: boolean, data: {condition, severity, advice, doctor_visit, disclaimer}}>}
 */
export const chatAPI = async (symptoms) => {
  try {
    const response = await apiClient.post('/chat', {
      symptoms: symptoms.trim(),
    });
    return response.data;
  } catch (error) {
    // Extract error message from response
    const errorMessage = error.response?.data?.error || error.message || 'Failed to analyze symptoms';
    throw new Error(errorMessage);
  }
};

/**
 * Image Analysis API Service
 * Sends symptoms text and image file for multimodal AI analysis
 * 
 * @param {string} symptoms - User's symptom description (optional)
 * @param {File} imageFile - Image file to analyze
 * @returns {Promise<{success: boolean, data: {condition, severity, advice, doctor_visit, disclaimer}}>}
 */
export const analyzeImageAPI = async (symptoms, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('symptoms', symptoms?.trim() || '');
    formData.append('image', imageFile);

    const response = await apiClient.post('/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    // Extract error message from response
    const errorMessage = error.response?.data?.error || error.message || 'Failed to analyze image';
    throw new Error(errorMessage);
  }
};

export default apiClient;
