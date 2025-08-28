import React, { useState } from 'react';
import LocationMetricsUpload from './LocationMetricsUpload';
import LocationMetricsTable from './LocationMetricsTable';

const LocationMetricsManager: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // When upload succeeds, refresh the table
  const handleUploadSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-lg border border-slate-200 mt-6">
      <h2 className="text-xl font-bold mb-4 text-slate-800">Location Metrics Management</h2>
      <LocationMetricsUpload onUploadSuccess={handleUploadSuccess} />
      {/* Key forces re-mount to refresh data after upload */}
      <LocationMetricsTable key={refreshKey} />
    </div>
  );
};

export default LocationMetricsManager;
