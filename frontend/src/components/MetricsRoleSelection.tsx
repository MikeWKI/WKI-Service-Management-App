import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Wrench, Package, BarChart3, Upload, MapPin, TrendingUp } from 'lucide-react';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'service-advisor',
    title: 'Service Advisor',
    description: 'ETR compliance, QAB usage, and PACCAR communication standards',
    icon: <Users size={32} />,
    color: 'bg-gradient-to-br from-red-600 to-red-700',
    path: '/metrics/service-advisor'
  },
  {
    id: 'parts-staff',
    title: 'Parts Staff',
    description: 'Parts status discipline, downtime attribution, and PACCAR Vision compliance',
    icon: <Package size={32} />,
    color: 'bg-gradient-to-br from-red-600 to-red-700',
    path: '/metrics/parts-staff'
  },
  {
    id: 'technician',
    title: 'Foremen/Technicians',
    description: 'Repair status discipline, PremierCare compliance, and ATR accuracy',
    icon: <Wrench size={32} />,
    color: 'bg-gradient-to-br from-red-600 to-red-700',
    path: '/metrics/technician'
  }
];

const locationOptions: RoleOption[] = [
  {
    id: 'wichita',
    title: 'Wichita',
    description: 'View performance metrics and scorecard data for Wichita location',
    icon: <BarChart3 size={32} />,
    color: 'bg-gradient-to-br from-blue-600 to-blue-700',
    path: '/metrics/wichita'
  },
  {
    id: 'emporia',
    title: 'Emporia',
    description: 'View performance metrics and scorecard data for Emporia location',
    icon: <BarChart3 size={32} />,
    color: 'bg-gradient-to-br from-green-600 to-green-700',
    path: '/metrics/emporia'
  },
  {
    id: 'dodge-city',
    title: 'Dodge City',
    description: 'View performance metrics and scorecard data for Dodge City location',
    icon: <BarChart3 size={32} />,
    color: 'bg-gradient-to-br from-purple-600 to-purple-700',
    path: '/metrics/dodge-city'
  },
  {
    id: 'liberal',
    title: 'Liberal',
    description: 'View performance metrics and scorecard data for Liberal location',
    icon: <BarChart3 size={32} />,
    color: 'bg-gradient-to-br from-orange-600 to-orange-700',
    path: '/metrics/liberal'
  }
];

export default function MetricsRoleSelection() {
  const [viewMode, setViewMode] = useState<'role' | 'location'>('role');
  const navigate = useNavigate();

  const handleRoleSelect = (path: string) => {
    navigate(path);
  };

  const currentOptions = viewMode === 'role' ? roleOptions : locationOptions;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
          PACCAR Dealer Performance Metrics
        </h1>
        <p className="text-xl text-slate-300 mb-6">
          {viewMode === 'role' ? 
            'Choose your role to see how your actions impact PACCAR dealer performance standards' :
            'Select a location to view current performance metrics and scorecard data'
          }
        </p>
        
        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('role')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                viewMode === 'role'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Role
            </button>
            <button
              onClick={() => setViewMode('location')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                viewMode === 'location'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Location
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-lg p-4 inline-block backdrop-blur-sm">
          <p className="text-red-300 font-semibold">
            {viewMode === 'role' ? 
              'Core metrics PACCAR tracks in Decisiv for WKI dealer performance' :
              'Location-specific performance data from uploaded monthly scorecards'
            }
          </p>
        </div>
        
        {/* Metrics Definitions Link */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link 
            to="/metrics/definitions"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View Metrics Definitions & Guide
          </Link>
          
          <Link 
            to="/scorecard-manager"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Monthly Scorecards
          </Link>

          <Link 
            to="/metrics/trends"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Historical Trends Dashboard
          </Link>

          <Link 
            to="/metrics/campaigns"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Campaign Completion Metrics
          </Link>
          
          <Link 
            to="/location-metrics"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <MapPin className="w-5 h-5 mr-2" />
            View Location Performance
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {currentOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleRoleSelect(option.path)}
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
              {viewMode === 'role' ? 'View My Impact →' : 'View Location Metrics →'}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-lg p-6 text-center border border-slate-700 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Key Performance Areas
        </h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">Triage Time</span>
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">Dwell Time</span>
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">Customer Satisfaction</span>
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">First-Time Fix Rate</span>
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">Parts Availability</span>
          <span className="bg-slate-700 px-3 py-1 rounded-full border border-slate-600 hover:border-red-500/50 transition-colors">Communication Quality</span>
        </div>
      </div>
    </div>
  );
}
