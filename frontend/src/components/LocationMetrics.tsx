import React, { useState } from 'react';
import { MapPin, TrendingUp, TrendingDown, BarChart3, Calendar, Filter } from 'lucide-react';

interface LocationMetrics {
  location: string;
  month: string;
  year: number;
  metrics: {
    daysOutOfService: number;
    etrCompliance: number;
    qabUsage: number;
    triageTime: number;
    dwellTime: number;
    customerSatisfaction: number;
    firstTimeFix: number;
    partsAvailability: number;
  };
  trend: 'up' | 'down' | 'stable';
}

const locations = [
  { id: 'wichita', name: 'Wichita', color: 'from-blue-500 to-blue-600' },
  { id: 'emporia', name: 'Emporia', color: 'from-green-500 to-green-600' },
  { id: 'dodge-city', name: 'Dodge City', color: 'from-purple-500 to-purple-600' },
  { id: 'liberal', name: 'Liberal', color: 'from-orange-500 to-orange-600' }
];

// Mock data - in real implementation, this would come from uploaded scorecards
const mockMetrics: LocationMetrics[] = [
  {
    location: 'Wichita',
    month: 'July',
    year: 2025,
    metrics: {
      daysOutOfService: 7.2,
      etrCompliance: 85.3,
      qabUsage: 78.9,
      triageTime: 45.2,
      dwellTime: 156.7,
      customerSatisfaction: 92.1,
      firstTimeFix: 81.4,
      partsAvailability: 91.8
    },
    trend: 'up'
  },
  {
    location: 'Emporia',
    month: 'July',
    year: 2025,
    metrics: {
      daysOutOfService: 8.1,
      etrCompliance: 79.6,
      qabUsage: 72.3,
      triageTime: 52.1,
      dwellTime: 178.3,
      customerSatisfaction: 88.7,
      firstTimeFix: 76.9,
      partsAvailability: 89.2
    },
    trend: 'stable'
  },
  {
    location: 'Dodge City',
    month: 'July',
    year: 2025,
    metrics: {
      daysOutOfService: 9.4,
      etrCompliance: 73.8,
      qabUsage: 68.1,
      triageTime: 58.7,
      dwellTime: 192.5,
      customerSatisfaction: 85.3,
      firstTimeFix: 72.6,
      partsAvailability: 86.4
    },
    trend: 'down'
  },
  {
    location: 'Liberal',
    month: 'July',
    year: 2025,
    metrics: {
      daysOutOfService: 6.8,
      etrCompliance: 88.1,
      qabUsage: 82.4,
      triageTime: 41.3,
      dwellTime: 142.9,
      customerSatisfaction: 94.2,
      firstTimeFix: 84.7,
      partsAvailability: 93.1
    },
    trend: 'up'
  }
];

export default function LocationMetrics() {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('daysOutOfService');

  const filteredMetrics = selectedLocation === 'all' 
    ? mockMetrics 
    : mockMetrics.filter(m => m.location.toLowerCase().replace(/\s+/g, '-') === selectedLocation);

  const metricDefinitions = {
    daysOutOfService: {
      name: 'Days Out of Service',
      unit: 'days',
      description: 'Average days vehicles are out of service',
      target: '< 8 days',
      good: (value: number) => value < 8
    },
    etrCompliance: {
      name: 'ETR Compliance',
      unit: '%',
      description: 'Estimated Time of Repair compliance rate',
      target: '> 85%',
      good: (value: number) => value > 85
    },
    qabUsage: {
      name: 'QAB Usage',
      unit: '%',
      description: 'Quality Assurance Board usage rate',
      target: '> 80%',
      good: (value: number) => value > 80
    },
    triageTime: {
      name: 'Triage Time',
      unit: 'minutes',
      description: 'Average time to complete initial triage',
      target: '< 45 min',
      good: (value: number) => value < 45
    },
    dwellTime: {
      name: 'Dwell Time',
      unit: 'minutes',
      description: 'Average customer wait time',
      target: '< 150 min',
      good: (value: number) => value < 150
    },
    customerSatisfaction: {
      name: 'Customer Satisfaction',
      unit: '%',
      description: 'Customer satisfaction survey scores',
      target: '> 90%',
      good: (value: number) => value > 90
    },
    firstTimeFix: {
      name: 'First Time Fix Rate',
      unit: '%',
      description: 'Percentage of issues resolved on first visit',
      target: '> 80%',
      good: (value: number) => value > 80
    },
    partsAvailability: {
      name: 'Parts Availability',
      unit: '%',
      description: 'Percentage of parts available when needed',
      target: '> 90%',
      good: (value: number) => value > 90
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <BarChart3 className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getLocationColor = (locationName: string) => {
    const location = locations.find(loc => 
      loc.name.toLowerCase() === locationName.toLowerCase()
    );
    return location?.color || 'from-slate-500 to-slate-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
          Location Performance Metrics
        </h1>
        <p className="text-xl text-slate-300">
          Compare performance across all WKI service locations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-3 sm:p-6 mb-6 sm:mb-8 border border-slate-700 shadow-2xl">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Filter className="w-5 h-5 text-red-400" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Focus Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
              >
                {Object.entries(metricDefinitions).map(([key, def]) => (
                  <option key={key} value={key}>{def.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Latest Data</p>
            <p className="text-white font-semibold flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              July 2025
            </p>
          </div>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-cols-2 min-w-[400px] sm:min-w-0 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
  {Object.entries(metricDefinitions).map(([key, def]) => {
          const avgValue = filteredMetrics.reduce((sum, m) => 
            sum + (m.metrics as any)[key], 0
          ) / filteredMetrics.length;
          const isGood = def.good(avgValue);
          
          return (
            <div key={key} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-3 sm:p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-sm">{def.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isGood ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                  {def.target}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {avgValue.toFixed(1)}{def.unit}
              </div>
              <p className="text-slate-400 text-xs">{def.description}</p>
            </div>
          );
        })}
      </div>

      {/* Location Performance Cards */}
  <div className="grid gap-4 sm:gap-6">
        {filteredMetrics.map((locationData) => (
    <div key={`${locationData.location}-${locationData.month}`} 
      className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-4 sm:p-8 border border-slate-700 shadow-2xl">
            
            {/* Location Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-2">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${getLocationColor(locationData.location)} rounded-full flex items-center justify-center shadow-lg`}>
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{locationData.location}</h2>
                  <p className="text-slate-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {locationData.month} {locationData.year}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(locationData.trend)}
                <span className="text-slate-300 capitalize">{locationData.trend} trend</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-cols-2 min-w-[350px] sm:min-w-0 md:grid-cols-4 gap-2 sm:gap-6">
              {Object.entries(locationData.metrics).map(([key, value]) => {
                const def = metricDefinitions[key as keyof typeof metricDefinitions];
                const isGood = def.good(value);
                const isSelected = key === selectedMetric;
                
                return (
                  <div key={key} 
                       className={`p-2 sm:p-4 rounded-lg border transition-all ${
                         isSelected 
                           ? 'border-red-500 bg-red-500/10 shadow-lg' 
                           : 'border-slate-700 bg-slate-800/50'
                       }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-slate-300 text-sm font-medium">{def.name}</h4>
                      <span className={`w-3 h-3 rounded-full ${
                        isGood ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    </div>
                    <div className={`text-base sm:text-xl font-bold ${
                      isGood ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {value.toFixed(1)}{def.unit}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Target: {def.target}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

  {/* Performance Summary */}
  <div className="mt-6 sm:mt-8 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-4 sm:p-8 border border-slate-700 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">Performance Summary</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {filteredMetrics.filter(m => m.trend === 'up').length}
            </div>
            <p className="text-slate-300">Locations Improving</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {filteredMetrics.filter(m => m.trend === 'stable').length}
            </div>
            <p className="text-slate-300">Locations Stable</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {filteredMetrics.filter(m => m.trend === 'down').length}
            </div>
            <p className="text-slate-300">Locations Need Attention</p>
          </div>
        </div>
      </div>
    </div>
  );
}
