import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchHistoricalData, fetchComparisonData, HistoricalDataResponse, ComparisonResponse } from '../services/trendApi';

interface HistoricalDashboardProps {
  className?: string;
}

const HistoricalDashboard: React.FC<HistoricalDashboardProps> = ({ className = '' }) => {
  const [historicalData, setHistoricalData] = useState<HistoricalDataResponse['data'] | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse['data'] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const [selectedMetric, setSelectedMetric] = useState('vscCaseRequirements');
  const [loading, setLoading] = useState(false);

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'wichita', name: 'Wichita Kenworth' },
    { id: 'emporia', name: 'Emporia Kenworth' },
    { id: 'dodge-city', name: 'Dodge City Kenworth' },
    { id: 'liberal', name: 'Liberal Kenworth' }
  ];

  const metrics = [
    { id: 'vscCaseRequirements', name: 'VSC Case Requirements' },
    { id: 'vscClosedCorrectly', name: 'VSC Closed Correctly' },
    { id: 'ttActivation', name: 'TT+ Activation' },
    { id: 'smMonthlyDwellAvg', name: 'SM Monthly Dwell Avg' },
    { id: 'triageHours', name: 'SM Average Triage Hours' },
    { id: 'etrPercentCases', name: 'ETR % of Cases' },
    { id: 'percentCasesWith3Notes', name: '% Cases with 3+ Notes' }
  ];

  const periods = [
    { value: 3, label: 'Last 3 months' },
    { value: 6, label: 'Last 6 months' },
    { value: 12, label: 'Last 12 months' },
    { value: 24, label: 'Last 24 months' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedPeriod, selectedLocation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyResponse, comparisonResponse] = await Promise.all([
        fetchHistoricalData(),
        fetchComparisonData(selectedPeriod, selectedLocation === 'all' ? undefined : selectedLocation)
      ]);

      if (historyResponse.success) {
        setHistoricalData(historyResponse.data);
      }

      if (comparisonResponse.success) {
        setComparisonData(comparisonResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalLocations = (): number => {
    if (!historicalData || !historicalData.locations || !Array.isArray(historicalData.locations)) return 0;
    return historicalData.locations.length;
  };

  const getTotalUploads = (): number => {
    if (!historicalData || !historicalData.locations || !Array.isArray(historicalData.locations)) return 0;
    return historicalData.locations.reduce((total, location) => total + (location.uploads?.length || 0), 0);
  };

  const getDateRange = (): string => {
    if (!historicalData || !historicalData.locations || !Array.isArray(historicalData.locations)) return 'No data';
    
    let earliest: Date | null = null;
    let latest: Date | null = null;

    historicalData.locations.forEach(location => {
      if (location.uploads && Array.isArray(location.uploads)) {
        location.uploads.forEach(upload => {
          const date = new Date(upload.uploadDate);
          if (!earliest || date < earliest) earliest = date;
          if (!latest || date > latest) latest = date;
        });
      }
    });

    if (!earliest || !latest) return 'No data';

    const earliestDate = earliest as Date;
    const latestDate = latest as Date;
    return earliestDate.toLocaleDateString() + ' - ' + latestDate.toLocaleDateString();
  };

  return (
    <div className={'bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen ' + className}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Historical Dashboard</h1>
              <p className="text-slate-300">Comprehensive trend analysis and historical data</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Locations</p>
                <p className="text-2xl font-bold text-white">{getTotalLocations()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Uploads</p>
                <p className="text-2xl font-bold text-white">{getTotalUploads()}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Date Range</p>
                <p className="text-lg font-semibold text-white">{getDateRange()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {historicalData && historicalData.locations && Array.isArray(historicalData.locations) && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Upload History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {historicalData.locations.map(location => (
                <div key={location.locationId} className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">{location.locationName}</h4>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {location.uploads?.length || 0}
                  </div>
                  <div className="text-xs text-slate-300">uploads</div>
                  {location.uploads && location.uploads.length > 0 && (
                    <div className="text-xs text-slate-400 mt-2">
                      Latest: {new Date(location.uploads[0].uploadDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 flex items-center space-x-4">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-white">Loading dashboard data...</span>
            </div>
          </div>
        )}

        {!loading && !historicalData && (
          <div className="bg-slate-800/50 rounded-lg p-12 border border-slate-700 text-center">
            <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Historical Data</h3>
            <p className="text-slate-300 mb-4">
              No historical data is available yet. Upload some scorecards to see trends and analysis.
            </p>
            <button
              onClick={fetchData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry Loading
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalDashboard;
