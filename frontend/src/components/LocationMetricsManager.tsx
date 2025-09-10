import React from 'react';
import { 
  BarChart3, 
  Upload, 
  MapPin, 
  TrendingUp, 
  FileText, 
  Calendar,
  Eye,
  Settings,
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LocationMetricsManager: React.FC = () => {
  // Quick stats from localStorage (you could make this dynamic)
  const getQuickStats = () => {
    const scorecards = localStorage.getItem('wki-scorecards');
    const dealershipData = localStorage.getItem('wki-dealership-scorecards');
    
    const locationCount = scorecards ? JSON.parse(scorecards).length : 0;
    const dealershipCount = dealershipData ? JSON.parse(dealershipData).length : 0;
    
    return { locationCount, dealershipCount };
  };

  const { locationCount, dealershipCount } = getQuickStats();

  const navigationCards = [
    {
      title: 'Upload Scorecards',
      description: 'Upload new monthly W370 Service Scorecards',
      icon: <Upload className="w-8 h-8" />,
      link: '/scorecard-manager',
      color: 'from-green-600 to-green-700',
      hoverColor: 'hover:from-green-700 hover:to-green-800'
    },
    {
      title: 'Performance Dashboard',
      description: 'View detailed location performance metrics',
      icon: <BarChart3 className="w-8 h-8" />,
      link: '/location-metrics',
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-700 hover:to-purple-800'
    },
    {
      title: 'Location Comparison',
      description: 'Compare metrics across all WKI locations',
      icon: <TrendingUp className="w-8 h-8" />,
      link: '/location-metrics',
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800'
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate detailed performance reports',
      icon: <FileText className="w-8 h-8" />,
      link: '/metrics/reports',
      color: 'from-orange-600 to-orange-700',
      hoverColor: 'hover:from-orange-700 hover:to-orange-800'
    }
  ];

  const locationCards = [
    {
      name: 'Wichita Kenworth',
      id: 'wichita',
      color: 'from-blue-500 to-blue-600',
      code: 'WIC'
    },
    {
      name: 'Emporia Kenworth',
      id: 'emporia',
      color: 'from-green-500 to-green-600',
      code: 'EMP'
    },
    {
      name: 'Dodge City Kenworth',
      id: 'dodge-city',
      color: 'from-purple-500 to-purple-600',
      code: 'DOD'
    },
    {
      name: 'Liberal Kenworth',
      id: 'liberal',
      color: 'from-orange-500 to-orange-600',
      code: 'LIB'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
          Location Metrics Dashboard
        </h1>
        <p className="text-xl text-slate-300 mb-6">
          Manage and analyze service performance across all WKI locations
        </p>
        
        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-green-400">{locationCount}</div>
            <div className="text-slate-300 text-sm">Location Scorecards</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-blue-400">{dealershipCount}</div>
            <div className="text-slate-300 text-sm">Dealership Reports</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-purple-400">4</div>
            <div className="text-slate-300 text-sm">Active Locations</div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {navigationCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className={`bg-gradient-to-br ${card.color} ${card.hoverColor} rounded-2xl p-8 text-white transition-all duration-300 transform hover:scale-105 shadow-xl group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
                {card.icon}
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-bold mb-2">{card.title}</h3>
            <p className="text-white/80 text-sm">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* Quick Location Access */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-red-400" />
          Quick Location Access
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {locationCards.map((location, index) => (
            <Link
              key={index}
              to={`/metrics/location/${location.id}`}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${location.color} rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-sm">{location.code}</span>
                </div>
                <Eye className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-white mb-1">{location.name}</h3>
              <p className="text-slate-400 text-sm">View performance metrics</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-red-400" />
          Quick Actions
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/scorecard-manager"
            className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-green-500 transition-colors group"
          >
            <div className="bg-green-600 p-2 rounded-lg mr-4 group-hover:bg-green-500 transition-colors">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">Upload New Data</div>
              <div className="text-slate-400 text-sm">Add monthly scorecard</div>
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
              <div className="font-medium text-white">View Analytics</div>
              <div className="text-slate-400 text-sm">Performance dashboard</div>
            </div>
          </Link>
          
          <Link
            to="/metrics/settings"
            className="flex items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors group"
          >
            <div className="bg-purple-600 p-2 rounded-lg mr-4 group-hover:bg-purple-500 transition-colors">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">Settings</div>
              <div className="text-slate-400 text-sm">Configure preferences</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LocationMetricsManager;