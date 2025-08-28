import React, { useState, useRef } from 'react';

interface UploadResponse {
  success: boolean;
  message: string;
}

const LocationMetricsUpload: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/location-metrics/upload', {
        method: 'POST',
        body: formData,
      });
      const data: UploadResponse = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Upload failed');
      } else {
        onUploadSuccess();
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Upload Location Metrics PDF</label>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
      />
      {uploading && <div className="text-blue-600 mt-2">Uploading...</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default LocationMetricsUpload;
