import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp, TrendingDown, Activity, Filter, RefreshCw } from 'lucide-react';
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

  const getChartData = () => {
    if (!comparisonData) return [];

    const selectedMetricData = comparisonData.metrics.find(m => m.metric === selectedMetric);
    if (!selectedMetricData) return [];

    // Transform data for chart
    const dataByMonth: Record<string, any> = {};

    selectedMetricData.locations.forEach(location => {
      if (selectedLocation !== 'all' && location.locationId !== selectedLocation) return;

      location.trendData.forEach(point => {
        const monthKey = `${point.month} ${point.year}`;
        if (!dataByMonth[monthKey]) {
          dataByMonth[monthKey] = { month: monthKey };
        }
        dataByMonth[monthKey][location.locationName] = point.value;
      });
    });

    return Object.values(dataByMonth).sort((a: any, b: any) => {
      const aDate = new Date(a.month);
      const bDate = new Date(b.month);
      return aDate.getTime() - bDate.getTime();
    });
  };

  const getLocationColors = () => ({
    'Wichita Kenworth': '#3B82F6',
    'Emporia Kenworth': '#10B981',
    'Dodge City Kenworth': '#8B5CF6',
    'Liberal Kenworth': '#F59E0B'
  });

  const getTotalUploads = (): number => {
    if (!historicalData) return 0;
    return historicalData.locations.reduce((total, location) => total + location.uploads.length, 0);
  };

  const getDateRange = (): string => {
    if (!historicalData) return 'No data';
    
    let earliest: Date | null = null;
    let latest: Date | null = null;

    historicalData.locations.forEach(location => {
      location.uploads.forEach(upload => {
        const date = new Date(upload.uploadDate);
        if (!earliest || date < earliest) earliest = date;
        if (!latest || date > latest) latest = date;
      });
    });

    if (!earliest || !latest) return 'No data';

    const earliestDate = earliest as Date;
    const latestDate = latest as Date;
    return `${earliestDate.toLocaleDateString()} - ${latestDate.toLocaleDateString()}`;
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Historical Trends Dashboard</h1>
              <p className="text-slate-300">Comprehensive analysis of performance trends across all locations</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Total Uploads</span>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-white">{getTotalUploads()}</div>
              <div className="text-xs text-slate-300">Monthly scorecards</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Locations</span>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {historicalData?.locations.length || 0}
              </div>
              <div className="text-xs text-slate-300">Active locations</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Date Range</span>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-sm font-bold text-white">{getDateRange()}</div>
              <div className="text-xs text-slate-300">Data period</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Status</span>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : 'text-green-400'}`} />
              </div>
              <div className="text-sm font-bold text-white">
                {loading ? 'Loading...' : 'Up to date'}
              </div>
              <div className="text-xs text-slate-300">Data status</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm font-medium">Filters:</span>
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>

            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              {metrics.map(metric => (
                <option key={metric.id} value={metric.id}>{metric.name}</option>
              ))}
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>

            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            {metrics.find(m => m.id === selectedMetric)?.name} - Trend Analysis
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-blue-500"></div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  {selectedLocation === 'all' ? (
                    Object.entries(getLocationColors()).map(([location, color]) => (
                      <Line
                        key={location}
                        type="monotone"
                        dataKey={location}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls={false}
                      />
                    ))
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={locations.find(l => l.id === selectedLocation)?.name}
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Upload History */}
        {historicalData && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Upload History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {historicalData.locations.map(location => (
                <div key={location.locationId} className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">{location.locationName}</h4>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {location.uploads.length}
                  </div>
                  <div className="text-xs text-slate-300">uploads</div>
                  {location.uploads.length > 0 && (
                    <div className="text-xs text-slate-400 mt-2">
                      Latest: {new Date(location.uploads[0].uploadDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalDashboard;
