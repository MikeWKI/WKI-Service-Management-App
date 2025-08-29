import React, { useState } from 'react';
import { ArrowLeft, Target, CheckCircle, AlertTriangle, XCircle, BarChart3, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CampaignData {
  id: string;
  description: string;
  locations: {
    [key: string]: {
      completionRate: number;
      status: 'excellent' | 'good' | 'warning' | 'critical';
    };
  };
  nationalAverage: number;
  goal: number;
}

// Sample campaign data based on the PDF structure
const campaignData: CampaignData[] = [
  {
    id: '24KWL',
    description: 'Bendix EC80 ABS ECU Incorrect Signal Processing',
    locations: {
      'wichita': { completionRate: 59, status: 'warning' },
      'dodge-city': { completionRate: 71, status: 'good' },
      'liberal': { completionRate: 39, status: 'critical' },
      'emporia': { completionRate: 0, status: 'critical' }
    },
    nationalAverage: 56,
    goal: 100
  },
  {
    id: '25KWB',
    description: 'T180/T280/T380/T480 Exterior Lighting Programming',
    locations: {
      'wichita': { completionRate: 100, status: 'excellent' },
      'dodge-city': { completionRate: 0, status: 'critical' },
      'liberal': { completionRate: 0, status: 'critical' },
      'emporia': { completionRate: 0, status: 'critical' }
    },
    nationalAverage: 57,
    goal: 100
  },
  {
    id: 'E311',
    description: 'PACCAR EPA17 MX-13 Prognostic Repair-Camshaft',
    locations: {
      'wichita': { completionRate: 25, status: 'critical' },
      'dodge-city': { completionRate: 100, status: 'excellent' },
      'liberal': { completionRate: 0, status: 'critical' },
      'emporia': { completionRate: 0, status: 'critical' }
    },
    nationalAverage: 46,
    goal: 100
  },
  {
    id: 'E316',
    description: 'PACCAR MX-13 EPA21 Main Bearing Cap Bolts',
    locations: {
      'wichita': { completionRate: 84, status: 'good' },
      'dodge-city': { completionRate: 93, status: 'excellent' },
      'liberal': { completionRate: 83, status: 'good' },
      'emporia': { completionRate: 0, status: 'critical' }
    },
    nationalAverage: 75,
    goal: 100
  },
  {
    id: 'E327',
    description: 'PACCAR MX-11 AND MX-13 OBD Software Update',
    locations: {
      'wichita': { completionRate: 52, status: 'critical' },
      'dodge-city': { completionRate: 40, status: 'critical' },
      'liberal': { completionRate: 50, status: 'critical' },
      'emporia': { completionRate: 0, status: 'critical' }
    },
    nationalAverage: 60,
    goal: 100
  }
];

const locationNames = {
  'wichita': 'Wichita Kenworth',
  'dodge-city': 'Dodge City Kenworth',
  'liberal': 'Liberal Kenworth',
  'emporia': 'Emporia Kenworth'
};

const locationColors = {
  'wichita': 'from-blue-500 to-blue-600',
  'dodge-city': 'from-purple-500 to-purple-600',
  'liberal': 'from-orange-500 to-orange-600',
  'emporia': 'from-green-500 to-green-600'
};

export default function CampaignMetrics() {
  const [selectedLocation, setSelectedLocation] = useState<string | 'all'>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'good':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'border-green-500/50 hover:shadow-green-500/25';
      case 'good':
        return 'border-blue-500/50 hover:shadow-blue-500/25';
      case 'warning':
        return 'border-yellow-500/50 hover:shadow-yellow-500/25';
      case 'critical':
        return 'border-red-500/50 hover:shadow-red-500/25';
      default:
        return 'border-slate-500/50';
    }
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 75) return 'text-blue-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Calculate location performance summary
  const getLocationSummary = () => {
    const summary: { [key: string]: { total: number; excellent: number; good: number; warning: number; critical: number } } = {};
    
    Object.keys(locationNames).forEach(locationId => {
      summary[locationId] = { total: 0, excellent: 0, good: 0, warning: 0, critical: 0 };
    });

    campaignData.forEach(campaign => {
      Object.keys(campaign.locations).forEach(locationId => {
        const status = campaign.locations[locationId].status;
        summary[locationId].total++;
        summary[locationId][status]++;
      });
    });

    return summary;
  };

  const locationSummary = getLocationSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link to="/metrics" className="flex items-center text-red-400 hover:text-red-300 mr-4 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Metrics
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
          Campaign Completion Metrics
        </h1>
        <p className="text-xl text-slate-300">
          Track service campaign completion rates across all WKI locations
        </p>
      </div>

      {/* Location Performance Summary */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(locationNames).map(([locationId, locationName]) => {
          const stats = locationSummary[locationId];
          const excellentRate = Math.round((stats.excellent / stats.total) * 100);
          
          return (
            <div key={locationId} className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${locationColors[locationId as keyof typeof locationColors]} rounded-full flex items-center justify-center shadow-lg`}>
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{excellentRate}%</div>
                  <div className="text-sm text-slate-400">Excellence Rate</div>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-3">{locationName}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                  <span className="text-slate-300">{stats.excellent} Excellent</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 text-blue-400 mr-1" />
                  <span className="text-slate-300">{stats.good} Good</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-slate-300">{stats.warning} Warning</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="w-3 h-3 text-red-400 mr-1" />
                  <span className="text-slate-300">{stats.critical} Critical</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Location Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center bg-slate-800 rounded-xl p-4 shadow-lg">
          <button
            onClick={() => setSelectedLocation('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedLocation === 'all'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                : 'bg-slate-600 text-slate-200 hover:bg-slate-500 border border-slate-500'
            }`}
          >
            All Locations
          </button>
          {Object.entries(locationNames).map(([locationId, locationName]) => (
            <button
              key={locationId}
              onClick={() => setSelectedLocation(locationId)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLocation === locationId
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                  : 'bg-slate-600 text-slate-200 hover:bg-slate-500 border border-slate-500'
              }`}
            >
              {locationName.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {campaignData.map((campaign) => (
          <div key={campaign.id} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl shadow-xl border border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">{campaign.id}</span>
                  <Target className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{campaign.description}</h3>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>National: {campaign.nationalAverage}%</span>
                  <span>Goal: {campaign.goal}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(campaign.locations)
                .filter(([locationId]) => selectedLocation === 'all' || selectedLocation === locationId)
                .map(([locationId, data]) => (
                <div key={locationId} className={`bg-slate-800/50 rounded-lg p-4 border-2 ${getStatusColor(data.status)} transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">
                      {locationNames[locationId as keyof typeof locationNames].split(' ')[0]}
                    </span>
                    {getStatusIcon(data.status)}
                  </div>
                  <div className={`text-2xl font-bold ${getCompletionRateColor(data.completionRate)}`}>
                    {data.completionRate}%
                  </div>
                  <div className="text-xs text-slate-400">
                    vs National {campaign.nationalAverage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Target className="w-6 h-6 mr-2 text-red-400" />
          Campaign Completion Action Items
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Identify Affected Vehicles</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Run VIN searches for campaign eligibility</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Contact customers proactively</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Schedule campaign appointments</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Execute Campaigns</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Follow PACCAR procedures exactly</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Document completion in system</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Verify parts availability first</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Track Progress</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Monitor completion rates weekly</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Escalate delays to management</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Report to PACCAR as required</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}