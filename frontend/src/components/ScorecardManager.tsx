import React, { useState, useRef } from 'react';
import { Upload, FileText, MapPin, Calendar, BarChart3, AlertCircle, CheckCircle, X, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LocationScorecard {
  id: string;
  location: string;
  locationId: string;
  month: string;
  year: number;
  fileName: string;
  uploadDate: Date;
  metrics: {
    daysOutOfService: number;
    etrCompliance: number;
    extendedUpdateRate: number;
    qabUsage: number;
    triageTime: number;
    dwellTime: number;
    customerSatisfaction: number;
    firstTimeFix: number;
    partsAvailability: number;
    repairStatusDiscipline: number;
    atrAccuracy: number;
  };
  trend: 'up' | 'down' | 'stable';
}

const locations = [
  { id: 'wichita', name: 'Wichita', code: 'WIC', color: 'from-blue-500 to-blue-600' },
  { id: 'emporia', name: 'Emporia', code: 'EMP', color: 'from-green-500 to-green-600' },
  { id: 'dodge-city', name: 'Dodge City', code: 'DOD', color: 'from-purple-500 to-purple-600' },
  { id: 'liberal', name: 'Liberal', code: 'LIB', color: 'from-orange-500 to-orange-600' }
];

// This would be replaced with actual localStorage or database storage
const getStoredScorecards = (): LocationScorecard[] => {
  const stored = localStorage.getItem('wki-scorecards');
  return stored ? JSON.parse(stored) : [];
};

const saveStoredScorecards = (scorecards: LocationScorecard[]) => {
  localStorage.setItem('wki-scorecards', JSON.stringify(scorecards));
};

export default function ScorecardManager() {
  const [scorecards, setScorecards] = useState<LocationScorecard[]>(getStoredScorecards());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate months for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (current year and 2 previous years)
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!selectedLocation || !selectedMonth) {
      alert('Please select a location and month before uploading');
      return;
    }

    const file = files[0];
    if (!file.name.toLowerCase().includes('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Simulate PDF processing and data extraction
    setTimeout(() => {
      const locationData = locations.find(loc => loc.id === selectedLocation);
      const newScorecard: LocationScorecard = {
        id: `${selectedLocation}-${selectedMonth}-${selectedYear}`,
        location: locationData?.name || selectedLocation,
        locationId: selectedLocation,
        month: selectedMonth,
        year: selectedYear,
        fileName: file.name,
        uploadDate: new Date(),
        metrics: {
          // These would be extracted from the actual PDF in a real implementation
          daysOutOfService: Math.random() * 5 + 3, // 3-8 days
          etrCompliance: Math.random() * 20 + 80, // 80-100%
          extendedUpdateRate: Math.random() * 15 + 5, // 5-20%
          qabUsage: Math.random() * 30 + 70, // 70-100%
          triageTime: Math.random() * 60 + 30, // 30-90 minutes
          dwellTime: Math.random() * 200 + 100, // 100-300 minutes
          customerSatisfaction: Math.random() * 15 + 85, // 85-100%
          firstTimeFix: Math.random() * 20 + 75, // 75-95%
          partsAvailability: Math.random() * 15 + 85, // 85-100%
          repairStatusDiscipline: Math.random() * 20 + 80, // 80-100%
          atrAccuracy: Math.random() * 15 + 85 // 85-100%
        },
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
      };

      setScorecards(prev => {
        const filtered = prev.filter(sc => sc.id !== newScorecard.id);
        const updated = [...filtered, newScorecard];
        saveStoredScorecards(updated); // Save to localStorage
        return updated;
      });

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }, 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const deleteScorecard = (id: string) => {
    setScorecards(prev => {
      const updated = prev.filter(sc => sc.id !== id);
      saveStoredScorecards(updated); // Save to localStorage
      return updated;
    });
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || locationId;
  };

  const getLocationColor = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.color || 'from-slate-500 to-slate-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
          Monthly Service Scorecard Manager
        </h1>
        <p className="text-xl text-slate-300 mb-4">
          Upload and manage monthly service scorecards for all WKI locations
        </p>
        <div className="flex justify-center">
          <Link 
            to="/location-metrics"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <Eye className="w-5 h-5 mr-2" />
            View Location Performance Dashboard
          </Link>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 mb-8 border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Upload className="w-6 h-6 mr-2 text-red-400" />
          Upload New Scorecard
        </h2>

        {/* Location and Date Selection */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select Location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select Month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-red-400 bg-red-400/10'
              : 'border-slate-600 hover:border-red-400 hover:bg-red-400/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-300">Processing scorecard...</p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileText className="w-16 h-16 text-slate-400 mx-auto" />
              <div>
                <p className="text-white font-medium mb-2">Drop your PDF scorecard here or click to browse</p>
                <p className="text-slate-400 text-sm">Supports PDF files up to 10MB</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedLocation || !selectedMonth}
                  className={`px-8 py-4 font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    !selectedLocation || !selectedMonth
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-red-500/25'
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2 inline" />
                  Choose PDF File
                </button>
                {(!selectedLocation || !selectedMonth) && (
                  <div className="text-yellow-400 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Please select location and month first
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Scorecards */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-red-400" />
          Uploaded Scorecards ({scorecards.length})
        </h2>

        {scorecards.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No scorecards uploaded yet</p>
            <p className="text-slate-500 text-sm">Upload your first monthly scorecard to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {scorecards.map((scorecard) => (
              <div key={scorecard.id} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getLocationColor(scorecard.locationId)} rounded-full flex items-center justify-center shadow-lg`}>
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {scorecard.location}
                      </h3>
                      <p className="text-slate-400 text-sm flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {scorecard.month} {scorecard.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Active Data
                    </span>
                    <Link
                      to={`/location-metrics?location=${scorecard.locationId}&month=${scorecard.month}&year=${scorecard.year}`}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      title="View in Dashboard"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteScorecard(scorecard.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Days Out of Service</p>
                    <p className={`font-semibold ${scorecard.metrics.daysOutOfService > 5 ? 'text-red-400' : 'text-green-400'}`}>
                      {scorecard.metrics.daysOutOfService.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">ETR Compliance</p>
                    <p className={`font-semibold ${scorecard.metrics.etrCompliance < 85 ? 'text-red-400' : 'text-green-400'}`}>
                      {scorecard.metrics.etrCompliance.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">QAB Usage</p>
                    <p className={`font-semibold ${scorecard.metrics.qabUsage < 80 ? 'text-red-400' : 'text-green-400'}`}>
                      {scorecard.metrics.qabUsage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">First Time Fix</p>
                    <p className={`font-semibold ${scorecard.metrics.firstTimeFix < 80 ? 'text-red-400' : 'text-green-400'}`}>
                      {scorecard.metrics.firstTimeFix.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
