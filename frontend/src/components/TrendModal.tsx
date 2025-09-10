import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Activity, Calendar, Target, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { fetchTrendData, TrendAnalysis, formatTrendAnalysis, getTrendIcon, getTrendColorClass } from '../services/trendApi';

interface TrendModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  locationName: string;
  metric: string;
  metricDisplayName: string;
  currentValue: string;
  target?: string;
}

interface ChartDataPoint {
  month: string;
  value: number;
  formattedDate: string;
  uploadDate: string;
}

const TrendModal: React.FC<TrendModalProps> = ({
  isOpen,
  onClose,
  locationId,
  locationName,
  metric,
  metricDisplayName,
  currentValue,
  target
}) => {
  const [trendData, setTrendData] = useState<TrendAnalysis | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(12);

  useEffect(() => {
    if (isOpen && locationId && metric) {
      fetchTrendDataForModal();
    }
  }, [isOpen, locationId, metric, selectedPeriod]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const fetchTrendDataForModal = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchTrendData(locationId, metric, selectedPeriod);
      
      if (response.success && response.data) {
        setTrendData(response.data);
        
        // Transform data for chart - ensure dataPoints is an array
        if (response.data.dataPoints && Array.isArray(response.data.dataPoints)) {
          const chartPoints: ChartDataPoint[] = response.data.dataPoints.map(point => ({
            month: `${point.month} ${point.year}`,
            value: point.value,
            formattedDate: new Date(point.year, getMonthNumber(point.month) - 1).toLocaleDateString('en-US', { 
              month: 'short', 
              year: '2-digit' 
            }),
            uploadDate: point.uploadDate
          }));
          
          setChartData(chartPoints);
        } else {
          console.warn('dataPoints is not an array:', response.data.dataPoints);
          setChartData([]);
        }
      } else {
        setError('Unable to load trend data. This may be the first upload for this metric.');
        setTrendData(null);
        setChartData([]);
      }
    } catch (err) {
      console.error('Error fetching trend data:', err);
      setError('Failed to load trend data. Please try again.');
      setTrendData(null);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const getMonthNumber = (monthName: string): number => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName) + 1;
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'improving': return '#10B981'; // green-500
      case 'declining': return '#EF4444'; // red-500
      case 'stable': return '#3B82F6'; // blue-500
      default: return '#6B7280'; // gray-500
    }
  };

  const formatValue = (value: number): string => {
    if (metric.includes('Percent') || metric.includes('%')) {
      return `${value.toFixed(1)}%`;
    }
    if (metric.includes('Days') || metric.includes('Dwell') || metric.includes('Hours')) {
      return `${value.toFixed(1)}`;
    }
    return value.toFixed(1);
  };

  const getTargetValue = (): number | null => {
    if (!target) return null;
    const match = target.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          width: '90vw',
          maxWidth: '1200px',
          height: '85vh',
          minHeight: '600px',
          maxHeight: '900px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          border: '1px solid #475569',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          transition: 'none',
          flexShrink: 0,
          flexGrow: 0,
          boxSizing: 'border-box',
          margin: 0,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        onMouseEnter={(e) => e.stopPropagation()}
        onMouseLeave={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: '1px solid #475569',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                {metricDisplayName}
              </h2>
              <p style={{ color: '#cbd5e1', margin: 0, marginTop: '4px' }}>
                {locationName} - Trend Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#475569',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#64748b';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#475569';
            }}
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            minHeight: 0,
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-blue-500"></div>
              <span className="ml-4 text-slate-300">Loading trend analysis...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Unable to Load Trend Data</span>
              </div>
              <p className="text-red-300 mt-2">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Period Selector */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-300 font-medium">Time Period:</span>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value={6}>Last 6 months</option>
                    <option value={12}>Last 12 months</option>
                    <option value={24}>Last 24 months</option>
                  </select>
                </div>
                
                {trendData && (
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg ${getTrendColorClass(trendData.trend)}`}>
                      {getTrendIcon(trendData.trend)}
                    </span>
                    <span className={`font-semibold capitalize ${getTrendColorClass(trendData.trend)}`}>
                      {trendData.trend}
                    </span>
                  </div>
                )}
              </div>

              {/* Current Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Current Value</span>
                    <Target className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{currentValue}</div>
                  {target && <div className="text-sm text-slate-300">Target: {target}</div>}
                </div>

                {trendData && (
                  <>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">Months of Data</span>
                        <Calendar className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{trendData.monthsOfData}</div>
                      <div className="text-sm text-slate-300">Data points available</div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">Change from Previous</span>
                        {trendData.analysis.currentVsPrevious > 0 ? 
                          <TrendingUp className="w-4 h-4 text-green-400" /> : 
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        }
                      </div>
                      <div className={`text-2xl font-bold ${
                        trendData.analysis.currentVsPrevious > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trendData.analysis.currentVsPrevious > 0 ? '+' : ''}
                        {(trendData.analysis.currentVsPrevious * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-300">vs last month</div>
                    </div>
                  </>
                )}
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div 
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '8px',
                    padding: '24px',
                    border: '1px solid #475569',
                    marginBottom: '24px',
                    boxSizing: 'border-box'
                  }}
                >
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    margin: 0,
                    marginBottom: '16px'
                  }}>
                    Trend Chart
                  </h3>
                  <div 
                    style={{ 
                      width: '100%',
                      height: '320px',
                      minHeight: '320px',
                      maxHeight: '320px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxSizing: 'border-box'
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="formattedDate" 
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickFormatter={formatValue}
                          width={60}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                          formatter={(value: number) => [formatValue(value), metricDisplayName]}
                          labelStyle={{ color: '#D1D5DB' }}
                        />
                        {getTargetValue() !== null && (
                          <ReferenceLine 
                            y={getTargetValue()!} 
                            stroke="#F59E0B" 
                            strokeDasharray="5 5"
                            label={{ value: "Target", position: "insideTopRight" as any, fill: "#F59E0B" }}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={trendData ? getTrendColor(trendData.trend) : '#3B82F6'}
                          strokeWidth={3}
                          dot={{ r: 6, fill: trendData ? getTrendColor(trendData.trend) : '#3B82F6' }}
                          activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Analysis */}
              {trendData && (
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Trend Analysis</h3>
                  <p className="text-slate-300 mb-4">
                    {formatTrendAnalysis(trendData)}
                  </p>
                  
                  {trendData.analysis.bestMonth && trendData.analysis.worstMonth && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <h4 className="text-green-400 font-medium mb-2">Best Performance</h4>
                        <p className="text-white">
                          {formatValue(trendData.analysis.bestMonth.value)} in {trendData.analysis.bestMonth.month} {trendData.analysis.bestMonth.year}
                        </p>
                      </div>
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-red-400 font-medium mb-2">Needs Improvement</h4>
                        <p className="text-white">
                          {formatValue(trendData.analysis.worstMonth.value)} in {trendData.analysis.worstMonth.month} {trendData.analysis.worstMonth.year}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {chartData.length === 0 && !loading && !error && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No Historical Data</h3>
                  <p className="text-slate-400">
                    Upload more monthly scorecards to see trend analysis for this metric.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendModal;
