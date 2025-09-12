import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Package, Clock, TrendingUp, AlertCircle, MessageSquare, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApiCache } from '../hooks/useApiCache';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useLoading } from '../contexts/LoadingContext';
import { useNotifications } from '../contexts/NotificationContext';
import LoadingSpinner from './LoadingSpinner';

interface MetricCard {
  title: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
  impact: string;
  description: string;
  icon: React.ReactNode;
  location: string;
  locations?: Array<{
    location: string;
    value: string;
    status: 'good' | 'warning' | 'critical';
  }>;
}

// Status parsing functions
const parseNotesStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue <= 5) return 'good';
  if (numValue <= 10) return 'warning';
  return 'critical';
};

const parseDwellStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value);
  if (numValue <= 3.0) return 'good';
  if (numValue <= 5.0) return 'warning';
  return 'critical';
};

const getPartsStaffMetrics = async (): Promise<MetricCard[]> => {
  const API_BASE_URL = 'https://wki-service-management-app.onrender.com';
  
  try {
    // ENHANCED: Try parallel trend API calls first for current data
    console.log('Fetching current trend data for Parts Staff metrics (parallel requests)...');
    
    // Define the metrics we want to fetch for Parts Staff
    const partsStaffMetrics = [
      'percentCasesWith3Notes',
      'smMonthlyDwellAvg'
    ];
    
    // Define location data structure (matching working LocationMetrics pattern)
    const locationData = [
      { id: 'wichita', name: 'Wichita Kenworth' },
      { id: 'emporia', name: 'Emporia Kenworth' },
      { id: 'dodge-city', name: 'Dodge City Kenworth' },
      { id: 'liberal', name: 'Liberal Kenworth' }
    ];
    
    // Create promises for all location/metric combinations
    const allPromises = locationData.flatMap(location => 
      partsStaffMetrics.map(async (metric) => {
        try {
          const trendResponse = await fetch(`${API_BASE_URL}/api/locationMetrics/trends/${location.id}/${metric}`);
          if (trendResponse.ok) {
            const trendData = await trendResponse.json();
            if (trendData?.success && trendData?.data) {
              const cv = trendData.data.currentValue;
              const value = (cv !== null && cv !== undefined) ? String(cv) : 'N/A';
              console.log(`✅ ${location.id} ${metric}: ${value}`);
              return { 
                locationId: location.id, 
                locationName: location.name, 
                metric, 
                value, 
                success: true 
              };
            }
          }
          console.log(`❌ ${location.id} ${metric}: No data`);
          return { 
            locationId: location.id, 
            locationName: location.name, 
            metric, 
            value: 'N/A', 
            success: false 
          };
        } catch (err) {
          console.error(`Error fetching ${location.id} ${metric}:`, err);
          return { 
            locationId: location.id, 
            locationName: location.name, 
            metric, 
            value: 'N/A', 
            success: false 
          };
        }
      })
    );
    
    console.time('Parts Staff Parallel API Calls');
    const results = await Promise.all(allPromises);
    console.timeEnd('Parts Staff Parallel API Calls');
    
    // Define proper type for location values
    type LocationValue = {
      location: string;
      value: string;
      status: 'good' | 'warning' | 'critical';
    };
    
    // Organize results by metric type
    const metricGroups = {
      notes: { 
        title: '% Cases with 3+ Notes', 
        values: [] as LocationValue[], 
        icon: <MessageSquare className="w-6 h-6" />, 
        target: '100% (target)', 
        impact: 'Parts availability and Procurement Efficiency', 
        description: 'Cases require notations to be entered by everyone interacting with the case, If it impacts the repair order or the information is potentially relevant to another department there should be notes added to the case' 
      },
      dwell: { 
        title: 'Monthly Dwell Average', 
        values: [] as LocationValue[], 
        icon: <Clock className="w-6 h-6" />, 
        target: '< 3.0 days (target)', 
        impact: 'Customer satisfaction and service efficiency', 
        description: 'Average time trucks spend at dealership - parts availability directly impacts dwell time' 
      }
    };
    
    // Process results into the groups
    results.forEach(result => {
      if (result.metric === 'percentCasesWith3Notes') {
        const formattedValue = result.value !== 'N/A' && !result.value.includes('%')
          ? `${result.value}%`
          : result.value;
        metricGroups.notes.values.push({
          location: result.locationName,
          value: formattedValue,
          status: parseNotesStatus(result.value)
        });
      } else if (result.metric === 'smMonthlyDwellAvg') {
        const formattedValue = result.value !== 'N/A' && !result.value.includes('days')
          ? `${result.value} days`
          : result.value;
        metricGroups.dwell.values.push({
          location: result.locationName,
          value: formattedValue,
          status: parseDwellStatus(result.value)
        });
      }
    });
    
    // Check if we got good data from trends
    const successfulResults = results.filter(r => r.success);
    console.log(`✅ Got ${successfulResults.length} successful trend results out of ${results.length} total requests`);
    
    if (successfulResults.length > 0) {
      console.log('Using current trend data for Parts Staff metrics');
      
      // Convert to MetricCard format with current data
      return [
        {
          title: metricGroups.notes.title,
          value: '', 
          target: metricGroups.notes.target,
          status: 'good', 
          impact: metricGroups.notes.impact,
          description: metricGroups.notes.description,
          icon: metricGroups.notes.icon,
          location: 'All Locations',
          locations: metricGroups.notes.values
        },
        {
          title: metricGroups.dwell.title,
          value: '',
          target: metricGroups.dwell.target,
          status: 'good',
          impact: metricGroups.dwell.impact,
          description: metricGroups.dwell.description,
          icon: metricGroups.dwell.icon,
          location: 'All Locations',
          locations: metricGroups.dwell.values
        }
      ];
    }
    
    // Fallback to original logic if trends don't work
    console.log('Trends data insufficient, falling back to original locationMetrics endpoint...');
    
  } catch (error) {
    console.error('Error in enhanced Parts Staff metrics fetch:', error);
  }

  // ORIGINAL FALLBACK LOGIC - Use the original API endpoint
  console.log('Using original API endpoint as fallback...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
    if (response.ok) {
      const apiResponse = await response.json();
      
      // Define proper type for location values
      type LocationValue = {
        location: string;
        value: string;
        status: 'good' | 'warning' | 'critical';
      };
      
      // Initialize combined metrics for all locations
      const combinedMetrics = {
        notes: { 
          title: '% Cases with 3+ Notes', 
          values: [] as LocationValue[], 
          icon: <MessageSquare className="w-6 h-6" />, 
          target: '< 5% (target)', 
          impact: 'Parts availability and procurement efficiency', 
          description: 'Cases requiring extensive documentation often indicate parts delays or complexity' 
        },
        dwell: { 
          title: 'Monthly Dwell Average', 
          values: [] as LocationValue[], 
          icon: <Clock className="w-6 h-6" />, 
          target: '< 3.0 days (target)', 
          impact: 'Customer satisfaction and service efficiency', 
          description: 'Average time trucks spend at dealership - parts availability directly impacts dwell time' 
        }
      };
      
      // Handle the nested data structure
      if (apiResponse.success && apiResponse.data && apiResponse.data.locations) {
        apiResponse.data.locations.forEach((location: any) => {
          const locationName = location.name || 'Unknown Location';
          const locationData = location.metrics || location;
          
          // % Cases with 3+ Notes
          const notesValue = locationData.percentCasesWith3Notes || 'N/A';
          combinedMetrics.notes.values.push({
            location: locationName,
            value: notesValue.includes('%') ? notesValue : `${notesValue}%`,
            status: parseNotesStatus(notesValue)
          });

          // Monthly Dwell Average
          const dwellValue = locationData.smMonthlyDwellAvg || 'N/A';
          combinedMetrics.dwell.values.push({
            location: locationName,
            value: dwellValue === 'N/A' ? dwellValue : `${dwellValue} days`,
            status: parseDwellStatus(dwellValue)
          });
        });
      }
      
      // Convert to MetricCard format with combined location data
      const metrics: MetricCard[] = [
        {
          title: combinedMetrics.notes.title,
          value: '', // Will be handled differently in rendering
          target: combinedMetrics.notes.target,
          status: 'good', // Will be determined by individual locations
          impact: combinedMetrics.notes.impact,
          description: combinedMetrics.notes.description,
          icon: combinedMetrics.notes.icon,
          location: 'All Locations',
          locations: combinedMetrics.notes.values
        },
        {
          title: combinedMetrics.dwell.title,
          value: '',
          target: combinedMetrics.dwell.target,
          status: 'good',
          impact: combinedMetrics.dwell.impact,
          description: combinedMetrics.dwell.description,
          icon: combinedMetrics.dwell.icon,
          location: 'All Locations',
          locations: combinedMetrics.dwell.values
        }
      ];
      
      return metrics;
    }
  } catch (error) {
    console.log('Using fallback data due to API error:', error);
  }
  
  // Final fallback data with combined location structure
  return [
    {
      title: '% Cases with 3+ Notes',
      value: '',
      target: '< 5% (target)',
      status: 'good',
      impact: 'Parts availability and procurement efficiency',
      description: 'Cases requiring extensive documentation often indicate parts delays or complexity',
      icon: <MessageSquare className="w-6 h-6" />,
      location: 'All Locations',
      locations: [
        { location: 'Wichita', value: '3%', status: 'good' as const },
        { location: 'Dodge City', value: '2%', status: 'good' as const },
        { location: 'Liberal', value: '6%', status: 'warning' as const },
        { location: 'Emporia', value: '4%', status: 'good' as const }
      ]
    },
    {
      title: 'Monthly Dwell Average',
      value: '',
      target: '< 3.0 days (target)',
      status: 'warning',
      impact: 'Customer satisfaction and service efficiency',
      description: 'Average time trucks spend at dealership - parts availability directly impacts dwell time',
      icon: <Clock className="w-6 h-6" />,
      location: 'All Locations',
      locations: [
        { location: 'Wichita', value: '2.8 days', status: 'good' as const },
        { location: 'Dodge City', value: '3.2 days', status: 'warning' as const },
        { location: 'Liberal', value: '4.1 days', status: 'critical' as const },
        { location: 'Emporia', value: '2.9 days', status: 'good' as const }
      ]
    }
  ];
};

function PartsStaffMetrics() {
  const { trackOperation } = usePerformanceMonitor('PartsStaffMetrics');
  const { startLoading, stopLoading, isLoading } = useLoading();
  const { success, error } = useNotifications();
  const hasShownSuccessRef = useRef(false);
  
  const { 
    data: metrics, 
    isLoading: dataLoading, 
    error: dataError, 
    refetch,
    isStale 
  } = useApiCache('partsStaffMetrics', getPartsStaffMetrics, {
    cacheTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000   // 5 minutes
  });

  useEffect(() => {
    const trackDataLoad = trackOperation('dataLoad');
    
    if (dataLoading) {
      startLoading('partsStaffMetrics');
      hasShownSuccessRef.current = false; // Reset when starting new load
    } else {
      stopLoading('partsStaffMetrics');
      trackDataLoad();
      
      if (dataError) {
        hasShownSuccessRef.current = false; // Reset on error
        error('Failed to Load Parts Staff Metrics', dataError, {
          actions: [
            {
              label: 'Retry',
              action: () => refetch(),
              variant: 'primary'
            }
          ]
        });
      } else if (metrics && metrics.length > 0 && !hasShownSuccessRef.current) {
        const sessionKey = 'partsStaffMetrics_success_shown';
        const hasShownInSession = sessionStorage.getItem(sessionKey);
        
        if (!hasShownInSession) {
          hasShownSuccessRef.current = true; // Mark as shown
          sessionStorage.setItem(sessionKey, 'true');
          success('Metrics Updated', 'Parts staff metrics loaded successfully', { duration: 2000 });
        }
      }
    }
  }, [dataLoading, dataError, metrics, startLoading, stopLoading, trackOperation, error, success, refetch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 bg-gradient-to-br from-slate-800 to-slate-900 border-green-500/50';
      case 'warning': return 'text-yellow-400 bg-gradient-to-br from-slate-800 to-slate-900 border-yellow-500/50';
      case 'critical': return 'text-red-400 bg-gradient-to-br from-slate-800 to-slate-900 border-red-500/50';
      default: return 'text-slate-300 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🔴';
      default: return '📊';
    }
  };

  // Show loading spinner while data is loading
  if (dataLoading) {
    return <LoadingSpinner size="lg" text="Loading Parts Staff metrics..." fullScreen />;
  }

  // Show stale data warning
  const showStaleWarning = isStale && metrics && metrics.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link 
            to="/metrics" 
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Role Selection
          </Link>
          <div className="text-slate-600">|</div>
          <Link 
            to="/" 
            className="flex items-center text-slate-400 hover:text-white transition-colors"
          >
            Back to Workflow
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
          Parts Staff PACCAR Metrics
        </h1>
        <p className="text-xl text-slate-300">
          Parts availability and efficiency directly impact repair timelines
        </p>
        
        {/* Stale data warning */}
        {showStaleWarning && (
          <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Data may be outdated. 
              <button 
                onClick={() => refetch()} 
                className="ml-2 underline hover:no-underline"
              >
                Refresh now
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Error state */}
      {dataError && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-6 mb-8">
          <h3 className="text-red-400 text-xl mb-2">Error Loading Metrics</h3>
          <p className="text-slate-300 mb-4">{dataError}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Show message when no legitimate scorecard data is available */}
      {!dataLoading && !dataError && (!metrics || metrics.length === 0) && (
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center mb-8">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Parts Staff Data Available</h2>
          <p className="text-slate-300 mb-6">
            Parts Staff metrics will be available once W370 Service Scorecard data is uploaded and processed.
          </p>
        </div>
      )}

      {/* Metrics Grid - only show when data exists */}
      {!dataLoading && !dataError && metrics && metrics.length > 0 && (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`${getStatusColor(metric.status)} rounded-lg border-2 p-6 shadow-2xl hover:shadow-lg transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                {metric.icon}
                <span className="text-2xl">{getStatusIcon(metric.status)}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{metric.title}</h3>
              <div className="text-sm text-slate-400 mb-2">{metric.location}</div>
              
              {/* Show combined location data if locations array exists */}
              {metric.locations && metric.locations.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {metric.locations.map((location, locIndex) => (
                    <div key={locIndex} className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-sm text-slate-300">{location.location}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{location.value}</span>
                        <span className="text-xs">{getStatusIcon(location.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">{metric.value}</span>
                    <span className="text-sm text-slate-400">{metric.target}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{metric.target}</span>
                </div>
                <p className="text-sm text-slate-300">{metric.description}</p>
                <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
                  <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">{metric.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Items */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-lg shadow-2xl border border-slate-700 p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">🎯 Action Items to Improve Your Metrics</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Parts Documentation</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Update case notes when parts are delayed</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Communicate ETA changes promptly</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Use consistent status updates</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Dwell Time Management</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Expedite critical parts orders</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Monitor high-dwell cases daily</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Coordinate with service advisors</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Impact */}
      <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-lg p-6 border border-red-500/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-red-300 mb-4">💡 How Parts Staff Drive Dealer Success</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div>
            <h4 className="font-semibold mb-2 text-white">Operational Impact</h4>
            <ul className="space-y-1">
              <li>• Parts availability directly affects customer dwell time</li>
              <li>• Proper documentation reduces case complexity</li>
              <li>• Quick turnaround improves technician productivity</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Customer Impact</h4>
            <ul className="space-y-1">
              <li>• Faster parts = Shorter repair times</li>
              <li>• Clear communication = Better customer experience</li>
              <li>• Accurate ETAs = Improved trust and satisfaction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartsStaffMetrics;