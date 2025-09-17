import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, TrendingUp, TrendingDown, BarChart3, Calendar, Filter, RefreshCw, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

// Legitimate scorecard data interface - matches W370 Service Scorecard structure
interface LocationMetrics {
  location: string;
  month: string;
  year: number;
  metrics: {
    // Only include metrics that actually exist in the W370 Service Scorecard
    vscCaseRequirements: number;
    vscClosedCorrectly: number;
    ttActivation: number;
    smMonthlyDwellAvg: number;
    triageHours: number;
    triagePercentLess4Hours: number;
    etrPercentCases: number;
    percentCasesWith3Notes: number;
    rdsMonthlyAvgDays: number;
    smYtdDwellAvgDays: number;
    rdsYtdDwellAvgDays: number;
  };
  trend: 'up' | 'down' | 'stable';
}

// Dealership-level metrics interface
interface DealershipMetrics {
  triageHours: number;
  triagePercentLess4Hours: number;
  percentCasesWith3Notes: number;
}

const locations = [
  { id: 'wichita', name: 'Wichita', color: 'from-blue-500 to-blue-600' },
  { id: 'emporia', name: 'Emporia', color: 'from-green-500 to-green-600' },
  { id: 'dodge-city', name: 'Dodge City', color: 'from-purple-500 to-purple-600' },
  { id: 'liberal', name: 'Liberal', color: 'from-orange-500 to-orange-600' }
];

export default function LocationMetrics() {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('vscCaseRequirements');
  const [backendMetrics, setBackendMetrics] = useState<LocationMetrics[]>([]);
  const [dealershipMetrics, setDealershipMetrics] = useState<DealershipMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Backend API base URL
  const API_BASE_URL = 'https://wki-service-management-app.onrender.com';

  // Helper function to fetch location metrics from trends endpoint
  const fetchLocationMetricsFromTrends = async (locationId: string): Promise<Partial<LocationMetrics['metrics']> | null> => {
    const metricsList = [
      'vscCaseRequirements',
      'vscClosedCorrectly',
      'ttActivation',
      'smMonthlyDwellAvg',
      'smYtdDwellAvgDays',
      'triagePercentLess4Hours',
      'triageHours',
      'etrPercentCases',
      'percentCasesWith3Notes',
      'rdsMonthlyAvgDays',
      'rdsYtdDwellAvgDays'
    ];

    const currentValues: Record<string, number> = {};
    let hasAnyData = false;

    for (const metric of metricsList) {
      try {
        const trendResponse = await fetch(`${API_BASE_URL}/api/locationMetrics/trends/${locationId}/${metric}`);
        if (trendResponse.ok) {
          const trendData = await trendResponse.json();
          if (trendData && trendData.success && trendData.data) {
            const cv = trendData.data.currentValue;
            if (cv !== null && cv !== undefined) {
              currentValues[metric] = parseFloat(String(cv));
              hasAnyData = true;
              console.log(`✅ ${locationId}/${metric}: ${cv}`);
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching trend data for ${locationId}/${metric}:`, err);
      }
    }

    return hasAnyData ? currentValues as Partial<LocationMetrics['metrics']> : null;
  };

  // Helper function to get location name mapping
  const getLocationNameMapping = (locationId: string): string => {
    const locationMap: Record<string, string> = {
      'wichita': 'Wichita Kenworth',
      'emporia': 'Emporia Kenworth',
      'dodge-city': 'Dodge City Kenworth',
      'liberal': 'Liberal Kenworth'
    };
    return locationMap[locationId] || locationId;
  };

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('LocationMetrics: Starting data fetch...');
      
      // OPTION 1: Try to fetch from trends endpoint first for all locations
      const trendsPromises = locations.map(async (location) => {
        const metricsFromTrends = await fetchLocationMetricsFromTrends(location.id);
        if (metricsFromTrends && Object.keys(metricsFromTrends).length > 0) {
          return {
            location: location.name,
            month: 'Latest',
            year: new Date().getFullYear(),
            metrics: {
              vscCaseRequirements: metricsFromTrends.vscCaseRequirements || 0,
              vscClosedCorrectly: metricsFromTrends.vscClosedCorrectly || 0,
              ttActivation: metricsFromTrends.ttActivation || 0,
              smMonthlyDwellAvg: metricsFromTrends.smMonthlyDwellAvg || 0,
              triageHours: metricsFromTrends.triageHours || 0,
              triagePercentLess4Hours: metricsFromTrends.triagePercentLess4Hours || 0,
              etrPercentCases: metricsFromTrends.etrPercentCases || 0,
              percentCasesWith3Notes: metricsFromTrends.percentCasesWith3Notes || 0,
              rdsMonthlyAvgDays: metricsFromTrends.rdsMonthlyAvgDays || 0,
              smYtdDwellAvgDays: metricsFromTrends.smYtdDwellAvgDays || 0,
              rdsYtdDwellAvgDays: metricsFromTrends.rdsYtdDwellAvgDays || 0
            },
            trend: 'stable' as const
          };
        }
        return null;
      });

      const trendsResults = await Promise.all(trendsPromises);
      const validTrendsResults = trendsResults.filter(result => result !== null) as LocationMetrics[];

      if (validTrendsResults.length > 0) {
        console.log('LocationMetrics: Using trends data for', validTrendsResults.length, 'locations');
        setBackendMetrics(validTrendsResults);
        setLastUpdated(new Date().toLocaleString());
        setIsLoading(false);
        return;
      }

      // OPTION 2: Fall back to original backend endpoint
      console.log('LocationMetrics: Trends endpoint failed, falling back to original logic...');
      const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
      if (response.ok) {
        const data = await response.json();
        let dealership: any, locationsData: any[] = [], extractedAt: string | undefined;
        
        // Handle different response structures
        if (data && typeof data === 'object') {
          if ('dealership' in data && 'locations' in data) {
            ({ dealership, locations: locationsData, extractedAt } = data);
          } else if ('data' in data && data.data && typeof data.data === 'object') {
            if ('dealership' in data.data && 'locations' in data.data) {
              ({ dealership, locations: locationsData, extractedAt } = data.data);
            }
          }
        }

        if (locationsData && locationsData.length > 0) {
          // Convert backend data to frontend format - only legitimate W370 scorecard fields
          const convertedMetrics: LocationMetrics[] = locationsData.map((location: any) => ({
            location: location.name,
            month: 'Latest',
            year: new Date().getFullYear(),
            metrics: {
              vscCaseRequirements: parseFloat(location.vscCaseRequirements?.toString().replace('%', '')) || 0,
              vscClosedCorrectly: parseFloat(location.vscClosedCorrectly?.toString().replace('%', '')) || 0,
              ttActivation: parseFloat(location.ttActivation?.toString().replace('%', '')) || 0,
              smMonthlyDwellAvg: parseFloat(location.smMonthlyDwellAvg) || 0,
              triageHours: parseFloat(location.triageHours) || 0,
              triagePercentLess4Hours: parseFloat(location.triagePercentLess4Hours?.toString().replace('%', '')) || 0,
              etrPercentCases: parseFloat(location.etrPercentCases) || 0,
              percentCasesWith3Notes: parseFloat(location.percentCasesWith3Notes?.toString().replace('%', '')) || 0,
              rdsMonthlyAvgDays: parseFloat(location.rdsMonthlyAvgDays?.toString().replace('%', '')) || 0,
              smYtdDwellAvgDays: parseFloat(location.smYtdDwellAvgDays) || 0,
              rdsYtdDwellAvgDays: parseFloat(location.rdsYtdDwellAvgDays) || 0
            },
            trend: 'stable' as const
          }));
          setBackendMetrics(convertedMetrics);
        } else {
          // No legitimate scorecard data available - show empty state
          setBackendMetrics([]);
        }

        // Set dealership-level metrics if available
        if (dealership) {
          setDealershipMetrics({
            triageHours: parseFloat(dealership.triageHours) || 0,
            triagePercentLess4Hours: parseFloat(dealership.triagePercentLess4Hours?.toString().replace('%', '')) || 0,
            percentCasesWith3Notes: parseFloat(dealership.percentCasesWith3Notes?.toString().replace('%', '')) || 0
          });
        } else {
          setDealershipMetrics(null);
        }

        if (extractedAt) {
          setLastUpdated(new Date(extractedAt).toLocaleString());
        }
      } else {
        // No legitimate scorecard data available - show empty state
        setBackendMetrics([]);
        setDealershipMetrics(null);
      }
    } catch (error) {
      console.error('LocationMetrics: Error fetching metrics:', error);
      // No legitimate scorecard data available - show empty state
      setBackendMetrics([]);
      setDealershipMetrics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh data every 30 seconds to catch new uploads
  useEffect(() => {
    const interval = setInterval(fetchData, 3000000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Listen for scorecard upload events for immediate refresh
  useEffect(() => {
    const handleScorecardUpload = () => {
      console.log('LocationMetrics: New scorecard uploaded, refreshing data...');
      fetchData();
    };

    window.addEventListener('scorecardUploaded', handleScorecardUpload);
    return () => {
      window.removeEventListener('scorecardUploaded', handleScorecardUpload);
    };
  }, [fetchData]);
  
  const filteredMetrics = selectedLocation === 'all' 
    ? backendMetrics 
    : backendMetrics.filter(m => m.location.toLowerCase().replace(/\s+/g, '-') === selectedLocation);

  const metricDefinitions = {
    vscCaseRequirements: {
      name: 'VSC Case Requirements',
      unit: '%',
      description: 'PACCAR VSC case requirements compliance',
      target: '> 95%',
      good: (value: number) => value > 95
    },
    vscClosedCorrectly: {
      name: 'VSC Closed Correctly',
      unit: '%',
      description: 'PACCAR VSC cases closed with proper procedures',
      target: '> 90%',
      good: (value: number) => value > 90
    },
    ttActivation: {
      name: 'TT+ Activation',
      unit: '%',
      description: 'TruckTech+ activation rate',
      target: '> 90%',
      good: (value: number) => value > 90
    },
    smMonthlyDwellAvg: {
      name: 'SM Monthly Dwell Average',
      unit: 'days',
      description: 'Service management monthly dwell time average',
      target: '< 3 days',
      good: (value: number) => value < 3
    },
    triageHours: {
      name: 'Triage Hours',
      unit: 'hours',
      description: 'Average hours for case triage completion',
      target: '< 2 hours',
      good: (value: number) => value < 2
    },
    triagePercentLess4Hours: {
      name: 'Triage % < 4 Hours',
      unit: '%',
      description: 'Percentage of cases triaged within 4 hours',
      target: '> 80%',
      good: (value: number) => value > 80
    },
    etrPercentCases: {
      name: 'ETR % of Cases',
      unit: '%',
      description: 'Estimated Time of Repair provided for cases',
      target: '< 5%',
      good: (value: number) => value < 5
    },
    percentCasesWith3Notes: {
      name: '% Cases with 3+ Notes',
      unit: '%',
      description: 'Percentage of cases with 3 or more notes',
      target: '< 2%',
      good: (value: number) => value < 2
    },
    rdsMonthlyAvgDays: {
      name: 'RDS Monthly Avg Days',
      unit: 'days',
      description: 'RDS (Repair Duration Summary) monthly average',
      target: '< 7 days',
      good: (value: number) => value < 7
    },
    smYtdDwellAvgDays: {
      name: 'SM YTD Dwell Avg Days',
      unit: 'days',
      description: 'Service management year-to-date dwell average',
      target: '< 6 days',
      good: (value: number) => value < 6
    },
    rdsYtdDwellAvgDays: {
      name: 'RDS YTD Dwell Avg Days',
      unit: 'days',
      description: 'RDS year-to-date dwell time average',
      target: '< 6 days',
      good: (value: number) => value < 6
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <BarChart3 className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getLocationColor = (locationName: string) => {
    const location = locations.find(loc => 
      loc.name.toLowerCase() === locationName.toLowerCase()
    );
    return location?.color || 'from-slate-500 to-slate-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
          Location Performance Metrics
        </h1>
        <p className="text-xl text-slate-300">
          Compare performance across all WKI service locations
        </p>
      </div>

      {/* Show message when no legitimate scorecard data is available */}
      {!isLoading && backendMetrics.length === 0 && (
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Scorecard Data Available</h2>
          <p className="text-slate-300 mb-6">
            No W370 Service Scorecard data has been uploaded yet. Upload a legitimate scorecard PDF to view location metrics.
          </p>
          <Link 
            to="/upload-scorecard" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
          >
            Upload Scorecard
          </Link>
        </div>
      )}

      {/* Show loading state */}
      {isLoading && (
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-slate-300">Loading scorecard data...</p>
        </div>
      )}

      {/* Show content only when legitimate data exists */}
      {!isLoading && backendMetrics.length > 0 && (
        <>
          {/* Dealership Summary */}
          {dealershipMetrics && (
            <div className="bg-gradient-to-br from-blue-800 via-blue-900 to-blue-800 rounded-2xl p-6 mb-8 border border-blue-700 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Dealership Summary</h2>
                    <p className="text-blue-200">Overall WKI performance metrics</p>
                  </div>
                </div>
                <button
                  onClick={fetchData}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-400">Triage Hours</h3>
                    <div className={`w-3 h-3 rounded-full ${dealershipMetrics.triageHours < 2 ? 'bg-green-500' : dealershipMetrics.triageHours < 4 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{dealershipMetrics.triageHours} hrs</div>
                  <div className="text-xs text-slate-400">Target: &lt; 2 hrs</div>
                </div>
                
                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-400">Triage % &lt; 4 Hours</h3>
                    <div className={`w-3 h-3 rounded-full ${dealershipMetrics.triagePercentLess4Hours > 80 ? 'bg-green-500' : dealershipMetrics.triagePercentLess4Hours > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{dealershipMetrics.triagePercentLess4Hours}%</div>
                  <div className="text-xs text-slate-400">Target: &gt; 80%</div>
                </div>
                
                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-400">% Cases with 3+ Notes</h3>
                    <div className={`w-3 h-3 rounded-full ${dealershipMetrics.percentCasesWith3Notes < 2 ? 'bg-green-500' : dealershipMetrics.percentCasesWith3Notes < 5 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{dealershipMetrics.percentCasesWith3Notes}%</div>
                  <div className="text-xs text-slate-400">Target: &lt; 2%</div>
                </div>
              </div>
              
              {lastUpdated && (
                <div className="mt-4 text-xs text-blue-200 text-center">
                  Last updated: {lastUpdated}
                </div>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-3 sm:p-6 mb-6 sm:mb-8 border border-slate-700 shadow-2xl">
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-stretch sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Filter className="w-5 h-5 text-red-400" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Focus Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
              >
                {Object.entries(metricDefinitions).map(([key, def]) => (
                  <option key={key} value={key}>{def.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Latest Data</p>
            <p className="text-white font-semibold flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              August 2025
            </p>
          </div>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-cols-2 min-w-[400px] sm:min-w-0 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {Object.entries(metricDefinitions).map(([key, def]) => {
            const avgValue = filteredMetrics.reduce((sum, m) =>
              sum + (m.metrics as any)[key], 0
            ) / filteredMetrics.length;
            const isGood = def.good(avgValue);

            return (
              <div key={key} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-3 sm:p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-sm">{def.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isGood ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {def.target}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {avgValue.toFixed(1)}{def.unit}
                </div>
                <p className="text-slate-400 text-xs">{def.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Performance Cards */}
      <div className="grid gap-4 sm:gap-6">
        {filteredMetrics.map((locationData) => (
          <div key={`${locationData.location}-${locationData.month}`}
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-4 sm:p-8 border border-slate-700 shadow-2xl">

            {/* Location Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-2">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${getLocationColor(locationData.location)} rounded-full flex items-center justify-center shadow-lg`}>
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{locationData.location}</h2>
                  <p className="text-slate-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {locationData.month} {locationData.year}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(locationData.trend)}
                <span className="text-slate-300 capitalize">{locationData.trend} trend</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-cols-2 min-w-[350px] sm:min-w-0 md:grid-cols-4 gap-2 sm:gap-6">
                {Object.entries(locationData.metrics).map(([key, value]) => {
                  const def = metricDefinitions[key as keyof typeof metricDefinitions];
                  const isGood = def.good(value);
                  const isSelected = key === selectedMetric;

                  return (
                    <div key={key}
                      className={`p-2 sm:p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-500/10 shadow-lg'
                          : 'border-slate-700 bg-slate-800/50'
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-slate-300 text-sm font-medium">{def.name}</h4>
                        <span className={`w-3 h-3 rounded-full ${
                          isGood ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                      </div>
                      <div className={`text-base sm:text-xl font-bold ${
                        isGood ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {value.toFixed(1)}{def.unit}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Target: {def.target}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="mt-6 sm:mt-8 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-4 sm:p-8 border border-slate-700 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">Performance Summary</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {filteredMetrics.filter(m => m.trend === 'up').length}
            </div>
            <p className="text-slate-300">Locations Improving</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {filteredMetrics.filter(m => m.trend === 'stable').length}
            </div>
            <p className="text-slate-300">Locations Stable</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {filteredMetrics.filter(m => m.trend === 'down').length}
            </div>
            <p className="text-slate-300">Locations Need Attention</p>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}