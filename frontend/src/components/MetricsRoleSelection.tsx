import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Wrench, Package, BarChart3, Upload, MapPin, Eye } from 'lucide-react';

interface ViewOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const managementOptions: ViewOption[] = [
  {
    id: 'upload-scorecards',
    title: 'Upload Scorecards',
    description: 'Upload and manage monthly service performance scorecards for all locations',
    icon: <Upload size={32} />,
    color: 'bg-gradient-to-br from-green-600 to-green-700',
    path: '/metrics/scorecard-manager'
  },
  {
    id: 'view-analytics',
    title: 'Performance Analytics',
    description: 'View detailed performance metrics and analytics dashboard',
    icon: <BarChart3 size={32} />,
    color: 'bg-gradient-to-br from-purple-600 to-purple-700',
    path: '/location-metrics'
  },
  {
    id: 'metrics-guide',
    title: 'Metrics Guide',
    description: 'Learn about key performance metrics and improvement strategies',
    icon: <Users size={32} />,
    color: 'bg-gradient-to-br from-blue-600 to-blue-700',
    path: '/metrics/definitions'
  }
];

const locationOptions: ViewOption[] = [
  {
    id: 'wichita',
    title: 'Wichita Kenworth',
    description: 'View performance metrics and scorecard data for Wichita location',
    icon: <MapPin size={32} />,
    color: 'bg-gradient-to-br from-blue-600 to-blue-700',
    path: '/metrics/location/wichita'
  },
  {
    id: 'emporia',
    title: 'Emporia Kenworth',
    description: 'View performance metrics and scorecard data for Emporia location',
    icon: <MapPin size={32} />,
    color: 'bg-gradient-to-br from-green-600 to-green-700',
    path: '/metrics/location/emporia'
  },
  {
    id: 'dodge-city',
    title: 'Dodge City Kenworth',
    description: 'View performance metrics and scorecard data for Dodge City location',
    icon: <MapPin size={32} />,
    color: 'bg-gradient-to-br from-purple-600 to-purple-700',
    path: '/metrics/location/dodge-city'
  },
  {
    id: 'liberal',
    title: 'Liberal Kenworth',
    description: 'View performance metrics and scorecard data for Liberal location',
    icon: <MapPin size={32} />,
    color: 'bg-gradient-to-br from-orange-600 to-orange-700',
    path: '/metrics/location/liberal'
  }
];

export default function MetricsRoleSelection() {
  const [viewMode, setViewMode] = useState<'management' | 'location'>('management');
  const navigate = useNavigate();

  const handleOptionSelect = (path: string) => {
    navigate(path);
  };

  const currentOptions = viewMode === 'management' ? managementOptions : locationOptions;

  // Get quick stats from localStorage
  const getQuickStats = () => {
    const scorecards = localStorage.getItem('wki-scorecards');
    const dealershipData = localStorage.getItem('wki-dealership-scorecards');
    
    const locationCount = scorecards ? JSON.parse(scorecards).length : 0;
    const dealershipCount = dealershipData ? JSON.parse(dealershipData).length : 0;
    
    return { locationCount, dealershipCount };
  };

  const { locationCount, dealershipCount } = getQuickStats();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
          Service Performance Dashboard
        </h1>
        <p className="text-xl text-slate-300 mb-6">
          {viewMode === 'management' ? 
            'Manage service performance data and analytics across all WKI locations' :
            'Select a location to view current performance metrics and scorecard data'
          }
        </p>
        
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-green-400">{locationCount}</div>
            <div className="text-slate-300 text-sm">Active Scorecards</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-blue-400">{dealershipCount}</div>
            <div className="text-slate-300 text-sm">Monthly Reports</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-purple-400">4</div>
            <div className="text-slate-300 text-sm">WKI Locations</div>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('management')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                viewMode === 'management'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Management
            </button>
            <button
              onClick={() => setViewMode('location')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                viewMode === 'location'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Locations
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-lg p-4 inline-block backdrop-blur-sm">
          <p className="text-red-300 font-semibold">
            {viewMode === 'management' ? 
              'Manage scorecards, view analytics, and track performance across all locations' :
              'Location-specific performance data from uploaded monthly scorecards'
            }
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {currentOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.path)}
            className="group bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl p-8 hover:shadow-red-500/25 hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-slate-700 hover:border-red-500/50 flex flex-col items-center text-center"
          >
            <div className={`${option.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-red-500/50`}>
              {option.icon}
            </div>
            
            <div className="w-full flex justify-center mb-4">
              <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors text-center px-2 leading-tight">
                {option.title}
              </h3>
            </div>
            
            <p className="text-slate-300 leading-relaxed mb-6">
              {option.description}
            </p>
            
            <div className="text-red-400 font-semibold group-hover:text-red-300 flex items-center justify-center">
              {viewMode === 'management' ? 'Access Tool →' : 'View Metrics →'}
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/metrics/scorecard-manager"
            className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-green-500 transition-colors group"
          >
            <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:bg-green-500 transition-colors">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">Upload Data</div>
              <div className="text-slate-400 text-sm">Add scorecard</div>
            </div>
          </Link>
          
          <Link
            to="/location-metrics"
            className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors group"
          >
            <div className="bg-blue-600 p-2 rounded-lg mr-4 group-hover:bg-blue-500 transition-colors">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">View Dashboard</div>
              <div className="text-slate-400 text-sm">Performance data</div>
            </div>
          </Link>
          
          <Link
            to="/metrics/definitions"
            className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors group"
          >
            <div className="bg-purple-600 p-2 rounded-lg mr-4 group-hover:bg-purple-500 transition-colors">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">Metrics Guide</div>
              <div className="text-slate-400 text-sm">Learn metrics</div>
            </div>
          </Link>
          
          <Link
            to="/metrics"
            className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-orange-500 transition-colors group"
          >
            <div className="bg-orange-600 p-2 rounded-lg mr-4 group-hover:bg-orange-500 transition-colors">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">All Locations</div>
              <div className="text-slate-400 text-sm">Compare sites</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Key Performance Areas - Using only actual backend metrics */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-lg p-6 text-center border border-slate-700 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Tracked Performance Metrics
        </h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">Dwell Time</span>
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">Triage Time</span>
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">Case Volume</span>
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">Customer Satisfaction</span>
        </div>
        <p className="text-slate-400 text-sm mt-4">
          Metrics extracted from uploaded monthly scorecard PDFs
        </p>
      </div>
    </div>
  );
}