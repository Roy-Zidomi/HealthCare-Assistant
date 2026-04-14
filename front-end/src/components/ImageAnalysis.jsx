import React, { useState, useRef } from 'react';
import { useImageAnalysis } from '../hooks/useImageAnalysis';
import { useTheme } from '../contexts/ThemeContext';
import ResultCard from './ResultCard';

/**
 * ImageAnalysis Component
 * Handles image upload with optional symptoms and displays AI analysis results
 */
const ImageAnalysis = () => {
  const [symptoms, setSymptoms] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { analyzeImage, data, loading, error, reset } = useImageAnalysis();
  const { theme } = useTheme();

  /**
   * Handle file selection
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPEG, PNG, GIF, or WebP image');
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 2MB limit. Please upload a smaller image');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear error and result when new file is selected
    if (error || data) {
      reset();
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }

    await analyzeImage(symptoms, selectedFile);
  };

  /**
   * Handle input change
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    setSymptoms(e.target.value);
    if (error || data) {
      reset();
    }
  };

  /**
   * Handle file removal
   */
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    reset();
  };

  /**
   * Handle reset/clear
   */
  const handleReset = () => {
    setSymptoms('');
    handleRemoveFile();
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
          Image Analysis
        </h2>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
          Upload an image with optional symptoms for multimodal AI analysis
        </p>
      </div>

      {/* Image Analysis Form */}
      <form onSubmit={handleSubmit} className="card">
        {/* Image Upload */}
        <div className="mb-4">
          <label htmlFor="image" className={`block text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Upload Image <span className="text-red-500">*</span>
          </label>
          
          {!preview ? (
            <div className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700/30'
                : 'border-gray-300 bg-gray-50'
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                id="image"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
                required
              />
              <label
                htmlFor="image"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className={`w-12 h-12 mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Click to upload image</span>
                <span className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>JPEG, PNG, GIF, WebP (Max 2MB)</span>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className={`w-full h-64 object-contain rounded-lg border ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-900/50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Symptoms Input (Optional) */}
        <div className="mb-4">
          <label htmlFor="symptoms-image" className={`block text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Additional Symptoms (Optional)
          </label>
          <textarea
            id="symptoms-image"
            value={symptoms}
            onChange={handleInputChange}
            placeholder="e.g., This rash appeared 2 days ago and is itchy..."
            className="input-field min-h-[100px] resize-none"
            disabled={loading}
          />
          <p className={`text-xs mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Provide additional context about the image for better analysis
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
              <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 10-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 101.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !selectedFile}
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
              'Analyze Image'
            )}
          </button>
          
          {(data || error || selectedFile) && (
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
            Analyzing your image...
          </p>
        </div>
      )}

      {/* Result Card */}
      {data && !loading && <ResultCard data={data} />}
    </div>
  );
};

export default ImageAnalysis;
