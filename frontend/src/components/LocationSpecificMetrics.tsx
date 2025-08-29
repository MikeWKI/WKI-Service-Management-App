import React from 'react';
import { ArrowLeft, Clock, Users, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetricCard {
  title: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
  impact: string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

// Helper function to safely parse metric values
const parseMetric = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to format metric display
const formatMetric = (value: string | number | undefined, suffix: string = ''): string => {
  const parsed = parseMetric(value);
  if (parsed === 0) return 'No data';
  return `${parsed.toFixed(1)}${suffix}`;
};

// This would be dynamically loaded from uploaded scorecard data
const getLocationMetrics = (locationId: string): MetricCard[] => {
  const storedScorecards = localStorage.getItem('wki-scorecards');
  const scorecards = storedScorecards ? JSON.parse(storedScorecards) : [];
  
  // Get the most recent scorecard for this location
  const locationScorecard = scorecards
    .filter((sc: any) => sc.locationId === locationId)
    .sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];

  if (!locationScorecard) {
    return getDefaultMetrics();
  }

  const metrics = locationScorecard.metrics;
  
  // Map backend data to expected metrics with safe parsing
  const dwellTime = parseMetric(metrics.dwellTime);
  const triageTime = parseMetric(metrics.triageTime);
  const cases = parseMetric(metrics.cases);
  const satisfaction = parseMetric(metrics.satisfaction || metrics.customerSatisfaction);
  const etrCompliance = parseMetric(metrics.etrCompliance) || 85; // Default fallback
  const firstTimeFix = parseMetric(metrics.firstTimeFix) || 80; // Default fallback
  
  return [
    {
      title: 'Dwell Time',
      value: formatMetric(dwellTime, ' hrs'),
      target: '< 2.5 hrs (optimal efficiency)',
      status: dwellTime < 2.5 ? 'good' : dwellTime < 4 ? 'warning' : 'critical',
      impact: 'Primary customer satisfaction metric',
      description: 'Average time customers wait for service',
      icon: <Clock size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'Triage Time', 
      value: formatMetric(triageTime, ' min'),
      target: '< 15 min (quick assessment)',
      status: triageTime < 15 ? 'good' : triageTime < 30 ? 'warning' : 'critical',
      impact: 'Service process efficiency indicator',
      description: 'Time to initial service assessment',
      icon: <Users size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'Case Volume',
      value: formatMetric(cases, ''),
      target: 'Consistent workload management',
      status: cases > 0 ? 'good' : 'warning',
      impact: 'Service capacity utilization',
      description: 'Total service cases handled',
      icon: <BarChart3 size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'Customer Satisfaction',
      value: formatMetric(satisfaction, satisfaction > 10 ? '%' : '/5'),
      target: satisfaction > 10 ? '> 95%' : '> 4.5/5',
      status: (satisfaction > 10 ? satisfaction >= 95 : satisfaction >= 4.5) ? 'good' : 
              (satisfaction > 10 ? satisfaction >= 90 : satisfaction >= 4) ? 'warning' : 'critical',
      impact: 'Customer retention and brand reputation',
      description: 'Customer satisfaction survey scores',
      icon: <Users size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'ETR Compliance',
      value: formatMetric(etrCompliance, '%'),
      target: '> 95%',
      status: etrCompliance >= 95 ? 'good' : etrCompliance >= 85 ? 'warning' : 'critical',
      impact: 'Service promise reliability',
      description: 'Estimated time to repair accuracy',
      icon: <CheckCircle size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'First Time Fix Rate',
      value: formatMetric(firstTimeFix, '%'),
      target: '> 85%',
      status: firstTimeFix >= 85 ? 'good' : firstTimeFix >= 75 ? 'warning' : 'critical',
      impact: 'Operational efficiency and customer satisfaction',
      description: 'Percentage of issues resolved on first visit',
      icon: <CheckCircle size={24} />,
      trend: locationScorecard.trend
    }
  ];
};

const getDefaultMetrics = (): MetricCard[] => [
  {
    title: 'Dwell Time',
    value: 'No data',
    target: '< 2.5 hrs (optimal efficiency)',
    status: 'warning',
    impact: 'Primary customer satisfaction metric',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <Clock size={24} />
  },
  {
    title: 'Triage Time',
    value: 'No data',
    target: '< 15 min (quick assessment)',
    status: 'warning',
    impact: 'Service process efficiency indicator', 
    description: 'Upload monthly scorecard to view current metrics',
    icon: <Users size={24} />
  },
  {
    title: 'Case Volume',
    value: 'No data',
    target: 'Consistent workload management',
    status: 'warning',
    impact: 'Service capacity utilization',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <BarChart3 size={24} />
  },
  {
    title: 'Customer Satisfaction',
    value: 'No data',
    target: '> 95%',
    status: 'warning',
    impact: 'Customer retention and brand reputation',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <Users size={24} />
  }
];

interface LocationMetricsProps {
  locationId: string;
  locationName: string;
  locationColor: string;
}

export default function LocationSpecificMetrics({ locationId, locationName, locationColor }: LocationMetricsProps) {
  const locationMetrics = getLocationMetrics(locationId);
  
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <BarChart3 className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'from-green-600 to-green-700 border-green-500';
      case 'warning':
        return 'from-yellow-600 to-yellow-700 border-yellow-500';
      case 'critical':
        return 'from-red-600 to-red-700 border-red-500';
      default:
        return 'from-gray-600 to-gray-700 border-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-300';
      case 'warning':
        return 'text-yellow-300';
      case 'critical':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  const lastUpdated = () => {
    const storedScorecards = localStorage.getItem('wki-scorecards');
    const scorecards = storedScorecards ? JSON.parse(storedScorecards) : [];
    
    const locationScorecard = scorecards
      .filter((sc: any) => sc.locationId === locationId)
      .sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];

    if (locationScorecard) {
      return `${locationScorecard.month} ${locationScorecard.year}`;
    }
    return 'No data available';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link 
            to="/metrics"
            className="flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Metrics
          </Link>
        </div>
        <Link 
          to="/metrics/scorecard-manager"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-sm"
        >
          Upload New Scorecard
        </Link>
      </div>

      {/* Location Header */}
      <div className="text-center mb-12">
        <div className={`w-20 h-20 bg-gradient-to-br ${locationColor} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
          <BarChart3 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
          {locationName} Performance Metrics
        </h1>
        <p className="text-xl text-slate-300 mb-2">
          Service Performance Dashboard & KPI Tracking
        </p>
        <p className="text-slate-400">
          Last Updated: {lastUpdated()}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {locationMetrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${getStatusColor(metric.status)} p-8 rounded-2xl shadow-2xl border-2 hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="bg-white/20 p-3 rounded-full">
                {metric.icon}
              </div>
              {metric.trend && (
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm text-white/80 capitalize">{metric.trend}</span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{metric.title}</h3>
            <div className="text-3xl font-bold text-white mb-4">{metric.value}</div>
            
            <div className="space-y-3">
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-white/80 text-sm font-medium mb-1">Target:</p>
                <p className="text-white font-semibold">{metric.target}</p>
              </div>
              
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-white/80 text-sm font-medium mb-1">Impact:</p>
                <p className="text-white text-sm">{metric.impact}</p>
              </div>
              
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-white text-sm">{metric.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-red-400" />
          Performance Summary - {locationName}
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {locationMetrics.filter(m => m.status === 'good').length}
            </div>
            <p className="text-slate-300">Metrics Meeting Targets</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {locationMetrics.filter(m => m.status === 'warning').length}
            </div>
            <p className="text-slate-300">Metrics Need Attention</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {locationMetrics.filter(m => m.status === 'critical').length}
            </div>
            <p className="text-slate-300">Critical Metrics</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/metrics/scorecard-manager"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
            >
              Upload New Monthly Report
            </Link>
            <Link 
              to="/metrics/locations"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
            >
              Compare All Locations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}