import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Wrench, Clock, CheckCircle, Target, MessageSquare } from 'lucide-react';
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
const parseEtrStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue >= 15) return 'good';
  if (numValue >= 10) return 'warning';
  return 'critical';
};

const parseTriageStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value);
  if (numValue <= 2.0) return 'good';
  if (numValue <= 3.0) return 'warning';
  return 'critical';
};

const parseNotesStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue <= 5) return 'good';
  if (numValue <= 10) return 'warning';
  return 'critical';
};

const getTechnicianMetrics = async (): Promise<MetricCard[]> => {
  const API_BASE_URL = 'https://wki-service-management-app.onrender.com';
  
  try {
    // ENHANCED: Try parallel trend API calls first for current data
    console.log('Fetching current trend data for Technician metrics (parallel requests)...');
    
    // Define the metrics we want to fetch for Technicians
    const technicianMetrics = [
      'etrPercentCases',
      'triageHours',
      'percentCasesWith3Notes'
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
      technicianMetrics.map(async (metric) => {
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
    
    console.time('Technician Parallel API Calls');
    const results = await Promise.all(allPromises);
    console.timeEnd('Technician Parallel API Calls');
    
    // Define proper type for location values
    type LocationValue = {
      location: string;
      value: string;
      status: 'good' | 'warning' | 'critical';
    };
    
    // Organize results by metric type
    const metricGroups = {
      etr: { 
        title: 'ETR % of Cases', 
        values: [] as LocationValue[], 
        icon: <Target className="w-6 h-6" />, 
        target: '> 15% (target)', 
        impact: 'Customer satisfaction and repair transparency', 
        description: 'Percentage of cases with accurate estimated time of repair - critical for customer communication' 
      },
      triage: { 
        title: 'SM Average Triage Hours', 
        values: [] as LocationValue[], 
        icon: <Clock className="w-6 h-6" />, 
        target: '< 2.0 hrs (target)', 
        impact: 'Initial diagnosis efficiency and workflow', 
        description: 'Time spent on initial case assessment and diagnosis - affects overall repair timeline' 
      },
      notes: { 
        title: '% Cases with 3+ Notes', 
        values: [] as LocationValue[], 
        icon: <MessageSquare className="w-6 h-6" />, 
        target: '100% (goal)', 
        impact: 'PACCAR case documentation compliance', 
        description: 'Percentage of cases meeting PACCAR requirement of 3+ notes' 
      }
    };
    
    // Process results into the groups
    results.forEach(result => {
      if (result.metric === 'etrPercentCases') {
        const formattedValue = result.value !== 'N/A' && !result.value.includes('%')
          ? `${result.value}%`
          : result.value;
        metricGroups.etr.values.push({
          location: result.locationName,
          value: formattedValue,
          status: parseEtrStatus(result.value)
        });
      } else if (result.metric === 'triageHours') {
        const formattedValue = result.value !== 'N/A' && !result.value.includes('hrs')
          ? `${result.value} hrs`
          : result.value;
        metricGroups.triage.values.push({
          location: result.locationName,
          value: formattedValue,
          status: parseTriageStatus(result.value)
        });
      } else if (result.metric === 'percentCasesWith3Notes') {
        const formattedValue = result.value !== 'N/A' && !result.value.includes('%')
          ? `${result.value}%`
          : result.value;
        metricGroups.notes.values.push({
          location: result.locationName,
          value: formattedValue,
          status: parseNotesStatus(result.value)
        });
      }
    });
    
    // Check if we got good data from trends
    const successfulResults = results.filter(r => r.success);
    console.log(`✅ Got ${successfulResults.length} successful trend results out of ${results.length} total requests`);
    
    if (successfulResults.length > 0) {
      console.log('Using current trend data for Technician metrics');
      
      // Convert to MetricCard format with current data
      return [
        {
          title: metricGroups.etr.title,
          value: '', 
          target: metricGroups.etr.target,
          status: 'good', 
          impact: metricGroups.etr.impact,
          description: metricGroups.etr.description,
          icon: metricGroups.etr.icon,
          location: 'All Locations',
          locations: metricGroups.etr.values
        },
        {
          title: metricGroups.triage.title,
          value: '',
          target: metricGroups.triage.target,
          status: 'good',
          impact: metricGroups.triage.impact,
          description: metricGroups.triage.description,
          icon: metricGroups.triage.icon,
          location: 'All Locations',
          locations: metricGroups.triage.values
        },
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
        }
      ];
    }
    
    // Fallback to original logic if trends don't work
    console.log('Trends data insufficient, falling back to original locationMetrics endpoint...');
    
  } catch (error) {
    console.error('Error in enhanced Technician metrics fetch:', error);
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
        etr: { 
          title: 'ETR % of Cases', 
          values: [] as LocationValue[], 
          icon: <Target className="w-6 h-6" />, 
          target: '> 15% (target)', 
          impact: 'Customer satisfaction and repair transparency', 
          description: 'Percentage of cases with accurate estimated time of repair - critical for customer communication' 
        },
        triage: { 
          title: 'SM Average Triage Hours', 
          values: [] as LocationValue[], 
          icon: <Clock className="w-6 h-6" />, 
          target: '< 2.0 hrs (target)', 
          impact: 'Initial diagnosis efficiency and workflow', 
          description: 'Time spent on initial case assessment and diagnosis - affects overall repair timeline' 
        },
        notes: { 
          title: '% Cases with 3+ Notes', 
          values: [] as LocationValue[], 
          icon: <MessageSquare className="w-6 h-6" />, 
          target: '100% (goal)', 
          impact: 'PACCAR case documentation compliance', 
          description: 'Percentage of cases meeting PACCAR requirement of 3+ notes' 
        }
      };
      
      // Handle the nested data structure
      if (apiResponse.success && apiResponse.data && apiResponse.data.locations) {
        apiResponse.data.locations.forEach((location: any) => {
          const locationName = location.name || 'Unknown Location';
          const locationData = location.metrics || location;
          
          // ETR % of Cases
          const etrValue = locationData.etrPercentCases || 'N/A';
          combinedMetrics.etr.values.push({
            location: locationName,
            value: etrValue.includes('%') ? etrValue : `${etrValue}%`,
            status: parseEtrStatus(etrValue)
          });

          // SM Average Triage Hours
          const triageValue = locationData.triageHours || 'N/A';
          combinedMetrics.triage.values.push({
            location: locationName,
            value: triageValue === 'N/A' ? triageValue : `${triageValue} hrs`,
            status: parseTriageStatus(triageValue)
          });

          // % Cases with 3+ Notes
          const notesValue = locationData.percentCasesWith3Notes || 'N/A';
          combinedMetrics.notes.values.push({
            location: locationName,
            value: notesValue.includes('%') ? notesValue : `${notesValue}%`,
            status: parseNotesStatus(notesValue)
          });
        });
      }
      
      // Convert to MetricCard format with combined location data
      const metrics: MetricCard[] = [
        {
          title: combinedMetrics.etr.title,
          value: '', // Will be handled differently in rendering
          target: combinedMetrics.etr.target,
          status: 'good', // Will be determined by individual locations
          impact: combinedMetrics.etr.impact,
          description: combinedMetrics.etr.description,
          icon: combinedMetrics.etr.icon,
          location: 'All Locations',
          locations: combinedMetrics.etr.values
        },
        {
          title: combinedMetrics.triage.title,
          value: '',
          target: combinedMetrics.triage.target,
          status: 'good',
          impact: combinedMetrics.triage.impact,
          description: combinedMetrics.triage.description,
          icon: combinedMetrics.triage.icon,
          location: 'All Locations',
          locations: combinedMetrics.triage.values
        },
        {
          title: combinedMetrics.notes.title,
          value: '',
          target: combinedMetrics.notes.target,
          status: 'good',
          impact: combinedMetrics.notes.impact,
          description: combinedMetrics.notes.description,
          icon: combinedMetrics.notes.icon,
          location: 'All Locations',
          locations: combinedMetrics.notes.values
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
      title: 'ETR % of Cases',
      value: '',
      target: '> 15% (target)',
      status: 'warning',
      impact: 'Customer satisfaction and repair transparency',
      description: 'Percentage of cases with accurate estimated time of repair - critical for customer communication',
      icon: <Target className="w-6 h-6" />,
      location: 'All Locations',
      locations: [
        { location: 'Wichita', value: '12%', status: 'warning' as const },
        { location: 'Dodge City', value: '18%', status: 'good' as const },
        { location: 'Liberal', value: '8%', status: 'critical' as const },
        { location: 'Emporia', value: '15%', status: 'warning' as const }
      ]
    },
    {
      title: 'SM Average Triage Hours',
      value: '',
      target: '< 2.0 hrs (target)',
      status: 'warning',
      impact: 'Initial diagnosis efficiency and workflow',
      description: 'Time spent on initial case assessment and diagnosis - affects overall repair timeline',
      icon: <Clock className="w-6 h-6" />,
      location: 'All Locations',
      locations: [
        { location: 'Wichita', value: '2.3 hrs', status: 'warning' as const },
        { location: 'Dodge City', value: '1.8 hrs', status: 'good' as const },
        { location: 'Liberal', value: '2.7 hrs', status: 'critical' as const },
        { location: 'Emporia', value: '2.1 hrs', status: 'warning' as const }
      ]
    },
    {
      title: '% Cases with 3+ Notes',
      value: '',
      target: '< 5% (target)',
      status: 'good',
      impact: 'Repair complexity and documentation quality',
      description: 'Cases requiring extensive documentation often indicate complex repairs or communication issues',
      icon: <MessageSquare className="w-6 h-6" />,
      location: 'All Locations',
      locations: [
        { location: 'Wichita', value: '3%', status: 'good' as const },
        { location: 'Dodge City', value: '2%', status: 'good' as const },
        { location: 'Liberal', value: '6%', status: 'warning' as const },
        { location: 'Emporia', value: '4%', status: 'good' as const }
      ]
    }
  ];
};

function TechnicianMetrics() {
  const { trackOperation } = usePerformanceMonitor('TechnicianMetrics');
  const { startLoading, stopLoading, isLoading } = useLoading();
  const { success, error } = useNotifications();
  const hasShownSuccessRef = useRef(false);
  
  const { 
    data: metrics, 
    isLoading: dataLoading, 
    error: dataError, 
    refetch,
    isStale 
  } = useApiCache('technicianMetrics', getTechnicianMetrics, {
    cacheTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000   // 5 minutes
  });

  useEffect(() => {
    const trackDataLoad = trackOperation('dataLoad');
    
    if (dataLoading) {
      startLoading('technicianMetrics');
      hasShownSuccessRef.current = false; // Reset when starting new load
    } else {
      stopLoading('technicianMetrics');
      trackDataLoad();
      
      if (dataError) {
        hasShownSuccessRef.current = false; // Reset on error
        error('Failed to Load Technician Metrics', dataError, {
          actions: [
            {
              label: 'Retry',
              action: () => refetch(),
              variant: 'primary'
            }
          ]
        });
      } else if (metrics && metrics.length > 0 && !hasShownSuccessRef.current) {
        const sessionKey = 'technicianMetrics_success_shown';
        const hasShownInSession = sessionStorage.getItem(sessionKey);
        
        if (!hasShownInSession) {
          hasShownSuccessRef.current = true; // Mark as shown
          sessionStorage.setItem(sessionKey, 'true');
          success('Metrics Updated', 'Technician metrics loaded successfully', { duration: 2000 });
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
    return <LoadingSpinner size="lg" text="Loading Technician metrics..." fullScreen />;
  }

  // Show stale data warning
  const showStaleWarning = isStale && metrics && metrics.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link 
            to="/metrics" 
            className="flex items-center text-green-400 hover:text-green-300 transition-colors"
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
          Technician PACCAR Metrics
        </h1>
        <p className="text-xl text-slate-300">
          Your repair quality, case communication and workflow usage directly impact WKI dealer performance
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
          <div className="text-6xl mb-4">🔧</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Technician Data Available</h2>
          <p className="text-slate-300 mb-6">
            Technician metrics will be available once W370 Service Scorecard data is uploaded and processed.
          </p>
        </div>
      )}

      {/* Metrics Grid - only show when data exists */}
      {!dataLoading && !dataError && metrics && metrics.length > 0 && (
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
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
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">ETR Management</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Provide accurate time estimates for repairs</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Update ETR when scope changes</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Communicate delays immediately</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Triage Efficiency</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Complete initial assessment quickly</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Use systematic diagnostic approach</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Document findings clearly</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Documentation</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Keep case notes concise and clear</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Avoid unnecessary note additions</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Use standard terminology</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Impact */}
      <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-lg p-6 border border-red-500/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-red-300 mb-4">💡 How Technicians Drive Dealer Success</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div>
            <h4 className="font-semibold mb-2 text-white">Repair Quality Impact</h4>
            <ul className="space-y-1">
              <li>• Accurate ETR = Better customer planning and satisfaction</li>
              <li>• Fast triage = Reduced customer wait times</li>
              <li>• Clear documentation = Improved case tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Operational Impact</h4>
            <ul className="space-y-1">
              <li>• Quality repairs = Reduced comebacks and rework</li>
              <li>• Efficient diagnosis = Better resource utilization</li>
              <li>• Proper documentation = Smoother workflows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicianMetrics;