import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, MapPin, Calendar, BarChart3, AlertCircle, CheckCircle, X, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DealershipMetrics {
  dwellTime?: string;
  triageTime?: string;
  customerSatisfaction?: string;
  serviceEfficiency?: string;
  totalCases?: string;
  completedCases?: string;
  etrCompliance?: number;
  firstTimeFix?: number;
  caseCount?: number;
}

interface LocationMetrics {
  dwellTime?: string;
  triageTime?: string;
  cases?: string;
  completedCases?: string;
  customerSatisfaction?: string;
  etrCompliance?: string;
  firstTimeFix?: string;
  partsAvailability?: string;
  workOrderAccuracy?: string;
}

interface DealershipScorecard {
  id: string;
  month: string;
  year: number;
  fileName: string;
  uploadDate: Date;
  metrics: DealershipMetrics;
  locations: LocationScorecard[];
}
interface LocationScorecard {
  id: string;
  location: string;
  locationId: string;
  month: string;
  year: number;
  fileName: string;
  uploadDate: Date;
  metrics: LocationMetrics;
  trend: 'up' | 'down' | 'stable';
}

const locations = [
  { id: 'wichita', name: 'Wichita Kenworth', code: 'WIC', color: 'from-blue-500 to-blue-600' },
  { id: 'emporia', name: 'Emporia Kenworth', code: 'EMP', color: 'from-green-500 to-green-600' },
  { id: 'dodge-city', name: 'Dodge City Kenworth', code: 'DOD', color: 'from-purple-500 to-purple-600' },
  { id: 'liberal', name: 'Liberal Kenworth', code: 'LIB', color: 'from-orange-500 to-orange-600' }
];

// Backend API base URL
const API_BASE_URL = 'https://wki-service-management-app.onrender.com';

// Test API connection
const testAPIConnection = async () => {
  const endpoints = [
    '/api/locationMetrics',
    '/api/upload',
    '/health',
    '/'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
      });
      console.log(`Endpoint ${endpoint}:`, response.status, response.statusText);
      if (response.ok) {
        const text = await response.text();
        console.log(`Response from ${endpoint}:`, text.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log(`Endpoint ${endpoint} error:`, error.message);
    }
  }
  
  return true; // We'll test connectivity regardless
};

// API functions
const uploadScorecardToAPI = async (file: File, month: string, year: number) => {
  const formData = new FormData();
  formData.append('pdf', file); // Match your backend's expected field name
  formData.append('month', month);
  formData.append('year', year.toString());

  // Try different possible endpoints
  const possibleEndpoints = [
    '/api/locationMetrics/upload',
    '/api/upload',
    '/api/locationMetrics',
    '/upload'
  ];

  let lastError;
  
  for (const endpoint of possibleEndpoints) {
    try {
      const apiUrl = `${API_BASE_URL}${endpoint}`;
      console.log('Trying endpoint:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Success with endpoint:', endpoint);
        return response.json();
      } else {
        const errorText = await response.text();
        console.log(`Endpoint ${endpoint} failed with:`, response.status, errorText);
        lastError = new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.log(`Endpoint ${endpoint} threw error:`, error);
      lastError = error;
    }
  }

  throw lastError || new Error('All upload endpoints failed');
};

const fetchLocationMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }
  return response.json();
};

// This would be replaced with actual localStorage or database storage
const getStoredScorecards = (): LocationScorecard[] => {
  const stored = localStorage.getItem('wki-scorecards');
  return stored ? JSON.parse(stored) : [];
};

const saveStoredScorecards = (scorecards: LocationScorecard[]) => {
  localStorage.setItem('wki-scorecards', JSON.stringify(scorecards));
};

const getStoredDealershipData = (): DealershipScorecard[] => {
  const stored = localStorage.getItem('wki-dealership-scorecards');
  return stored ? JSON.parse(stored) : [];
};

const saveStoredDealershipData = (dealershipData: DealershipScorecard[]) => {
  localStorage.setItem('wki-dealership-scorecards', JSON.stringify(dealershipData));
};

export default function ScorecardManager() {
  const [scorecards, setScorecards] = useState<LocationScorecard[]>([]);
  const [dealershipData, setDealershipData] = useState<DealershipScorecard[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Test API connection
        const apiWorking = await testAPIConnection();
        console.log('API connection test result:', apiWorking);
        
        // Load any existing data from localStorage as backup
        setScorecards(getStoredScorecards());
        setDealershipData(getStoredDealershipData());
        
        // Try to fetch from API (optional - for when API has persistent storage)
        // await fetchLocationMetrics();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Generate months for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (current year and 2 previous years)
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!selectedMonth) {
      alert('Please select a month before uploading');
      return;
    }

    const file = files[0];
    if (!file.name.toLowerCase().includes('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setParseError(null);

    try {
      // Upload to backend API
      setUploadProgress(20);
      console.log('Starting upload process...');
      
      const result = await uploadScorecardToAPI(file, selectedMonth, selectedYear);
      console.log('Upload successful, result:', result);
      setUploadProgress(60);

      // Process the returned data from your backend
      console.log('Processing result structure:', result);
      
      // Your backend returns: { dealership: {...}, locations: [...], extractedAt: "..." }
      const { dealership, locations, extractedAt } = result;

      if (!dealership || !locations) {
        throw new Error('Invalid response structure from backend');
      }

      // Create dealership scorecard from backend response
      const dealershipScorecard: DealershipScorecard = {
        id: `dealership-${selectedMonth}-${selectedYear}`,
        month: selectedMonth,
        year: selectedYear,
        fileName: file.name,
        uploadDate: new Date(extractedAt),
        metrics: dealership,
        locations: []
      };

      // Create location scorecards from backend response
      const locationScorecards: LocationScorecard[] = locations.map((location: any, index: number) => {
        const locationInfo = getLocationInfo(location.name);
        return {
          id: `${locationInfo.id}-${selectedMonth}-${selectedYear}`,
          location: location.name,
          locationId: locationInfo.id,
          month: selectedMonth,
          year: selectedYear,
          fileName: file.name,
          uploadDate: new Date(extractedAt),
          metrics: location,
          trend: calculateTrend() // Random trend for now
        };
      });

      dealershipScorecard.locations = locationScorecards;
      setUploadProgress(90);

      // Update state and localStorage
      setDealershipData(prev => {
        const filtered = prev.filter(item => !(item.month === selectedMonth && item.year === selectedYear));
        const updated = [...filtered, dealershipScorecard];
        saveStoredDealershipData(updated);
        return updated;
      });

      setScorecards(prev => {
        const filtered = prev.filter(item => !(item.month === selectedMonth && item.year === selectedYear));
        const updated = [...filtered, ...locationScorecards];
        saveStoredScorecards(updated);
        return updated;
      });

      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        alert(`Successfully uploaded and processed ${file.name}!\n\nExtracted data for:\n- WKI Dealership\n- ${locations.length} locations`);
      }, 500);

    } catch (error) {
      console.error('Error uploading PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF. Please try again.';
      console.error('Detailed error:', errorMessage);
      setParseError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Helper function to get location info by name
  const getLocationInfo = (locationName: string) => {
    const normalized = locationName.toLowerCase();
    if (normalized.includes('wichita')) return locations[0];
    if (normalized.includes('emporia')) return locations[1];
    if (normalized.includes('dodge')) return locations[2];
    if (normalized.includes('liberal')) return locations[3];
    return { id: 'unknown', name: locationName, code: 'UNK', color: 'from-gray-500 to-gray-600' };
  };

  // Helper function to calculate trend
  const calculateTrend = (): 'up' | 'down' | 'stable' => {
    // Random trend for now - in real implementation, compare with previous month
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)];
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
          Upload and manage monthly W370 Service Scorecards for all WKI locations
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"></div>
          <p className="text-slate-300 ml-4">Loading scorecard data...</p>
        </div>
      ) : (
        <>
          {/* Upload Section */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 mb-8 border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Upload className="w-6 h-6 mr-2 text-red-400" />
          Upload New Scorecard
        </h2>

        {/* Date Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                <p className="text-white font-medium mb-2">Drop your WKI Service Scorecard PDF here or click to browse</p>
                <p className="text-slate-400 text-sm">Supports W370 Service Scorecard PDFs up to 10MB</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedMonth}
                  className={`px-8 py-4 font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    !selectedMonth
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-red-500/25'
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2 inline" />
                  Choose Scorecard PDF
                </button>
                {!selectedMonth && (
                  <div className="text-yellow-400 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Please select month first
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Parse Error Display */}
        {parseError && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-600 rounded-lg">
            <div className="flex items-center text-red-300 mb-2">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">PDF Processing Error</span>
            </div>
            <p className="text-red-200 text-sm">{parseError}</p>
          </div>
        )}
      </div>

      {/* Dealership Summary */}
      {dealershipData.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 mb-8 border border-slate-700 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-red-400" />
            Dealership Performance Summary
          </h2>
          <div className="grid gap-4">
            {dealershipData.map((dealership) => (
              <div key={dealership.id} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        WKI Dealership
                      </h3>
                      <p className="text-slate-400 text-sm flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {dealership.month} {dealership.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 text-sm">
                      {dealership.locations.length} locations
                    </span>
                  </div>
                </div>

                {/* Dealership Metrics Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dealership.metrics.dwellTime && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Dwell Time</p>
                      <p className="font-semibold text-blue-400">
                        {dealership.metrics.dwellTime}
                      </p>
                    </div>
                  )}
                  {dealership.metrics.triageTime && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Triage Time</p>
                      <p className="font-semibold text-blue-400">
                        {dealership.metrics.triageTime}
                      </p>
                    </div>
                  )}
                  {dealership.metrics.customerSatisfaction && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Customer Satisfaction</p>
                      <p className={`font-semibold ${
                        (typeof dealership.metrics.customerSatisfaction === 'string' && dealership.metrics.customerSatisfaction.includes('%') 
                          ? parseFloat(dealership.metrics.customerSatisfaction.replace('%', '')) < 90
                          : typeof dealership.metrics.customerSatisfaction === 'number' && dealership.metrics.customerSatisfaction < 90
                        ) ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {dealership.metrics.customerSatisfaction}
                      </p>
                    </div>
                  )}
                  {dealership.metrics.serviceEfficiency && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Service Efficiency</p>
                      <p className="font-semibold text-blue-400">
                        {dealership.metrics.serviceEfficiency}
                      </p>
                    </div>
                  )}
                  {dealership.metrics.totalCases && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Total Cases</p>
                      <p className="font-semibold text-blue-400">
                        {dealership.metrics.totalCases}
                      </p>
                    </div>
                  )}
                  {dealership.metrics.completedCases && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Completed Cases</p>
                      <p className="font-semibold text-green-400">
                        {dealership.metrics.completedCases}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Scorecards */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-red-400" />
          Location Performance Details ({scorecards.length})
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
                  {scorecard.metrics.dwellTime && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Dwell Time</p>
                      <p className="font-semibold text-blue-400">
                        {scorecard.metrics.dwellTime}
                      </p>
                    </div>
                  )}
                  {scorecard.metrics.triageTime && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Triage Time</p>
                      <p className="font-semibold text-blue-400">
                        {scorecard.metrics.triageTime}
                      </p>
                    </div>
                  )}
                  {scorecard.metrics.cases && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Cases</p>
                      <p className="font-semibold text-blue-400">
                        {scorecard.metrics.cases}
                      </p>
                    </div>
                  )}
                  {scorecard.metrics.customerSatisfaction && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Customer Satisfaction</p>
                      <p className={`font-semibold ${
                        typeof scorecard.metrics.customerSatisfaction === 'string' && scorecard.metrics.customerSatisfaction.includes('%') 
                          ? (parseFloat(scorecard.metrics.customerSatisfaction.replace('%', '')) < 90 ? 'text-red-400' : 'text-green-400')
                          : (typeof scorecard.metrics.customerSatisfaction === 'number' && scorecard.metrics.customerSatisfaction < 90 ? 'text-red-400' : 'text-green-400')
                      }`}>
                        {scorecard.metrics.customerSatisfaction}
                      </p>
                    </div>
                  )}
                  {scorecard.metrics.etrCompliance && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">ETR Compliance</p>
                      <p className={`font-semibold ${
                        (typeof scorecard.metrics.etrCompliance === 'string' && scorecard.metrics.etrCompliance.includes('%') 
                          ? parseFloat(scorecard.metrics.etrCompliance.replace('%', '')) < 85
                          : typeof scorecard.metrics.etrCompliance === 'number' && scorecard.metrics.etrCompliance < 85
                        ) ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {scorecard.metrics.etrCompliance}
                      </p>
                    </div>
                  )}
                  {scorecard.metrics.firstTimeFix && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">First Time Fix</p>
                      <p className={`font-semibold ${
                        (typeof scorecard.metrics.firstTimeFix === 'string' && scorecard.metrics.firstTimeFix.includes('%') 
                          ? parseFloat(scorecard.metrics.firstTimeFix.replace('%', '')) < 80
                          : typeof scorecard.metrics.firstTimeFix === 'number' && scorecard.metrics.firstTimeFix < 80
                        ) ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {scorecard.metrics.firstTimeFix}
                      </p>
                    </div>
                  )}
                  {scorecard.metrics.partsAvailability && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Parts Availability</p>
                      <p className={`font-semibold ${
                        (typeof scorecard.metrics.partsAvailability === 'string' && scorecard.metrics.partsAvailability.includes('%') 
                          ? parseFloat(scorecard.metrics.partsAvailability.replace('%', '')) < 85
                          : typeof scorecard.metrics.partsAvailability === 'number' && scorecard.metrics.partsAvailability < 85
                        ) ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {scorecard.metrics.partsAvailability}
                      </p>
                    </div>
                  )}
                  {scorecard.metrics.workOrderAccuracy && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Work Order Accuracy</p>
                      <p className={`font-semibold ${
                        (typeof scorecard.metrics.workOrderAccuracy === 'string' && scorecard.metrics.workOrderAccuracy.includes('%') 
                          ? parseFloat(scorecard.metrics.workOrderAccuracy.replace('%', '')) < 90
                          : typeof scorecard.metrics.workOrderAccuracy === 'number' && scorecard.metrics.workOrderAccuracy < 90
                        ) ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {scorecard.metrics.workOrderAccuracy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
