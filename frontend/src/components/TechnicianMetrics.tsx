import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wrench, Clock, CheckCircle, Target, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetricCard {
  title: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
  impact: string;
  description: string;
  icon: React.ReactNode;
  location: string;
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
    const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
    if (response.ok) {
      const data = await response.json();
      const metrics: MetricCard[] = [];
      
      // Process each location's metrics
      Object.entries(data).forEach(([locationKey, locationData]: [string, any]) => {
        const locationName = locationKey.replace(/([A-Z])/g, ' $1').trim();
        
        // ETR % of Cases
        const etrValue = locationData.etrPercentCases || 'N/A';
        metrics.push({
          title: 'ETR % of Cases',
          value: etrValue.includes('%') ? etrValue : `${etrValue}%`,
          target: '> 15% (target)',
          status: parseEtrStatus(etrValue),
          impact: 'Customer satisfaction and repair transparency',
          description: 'Percentage of cases with accurate estimated time of repair - critical for customer communication',
          icon: <Target className="w-6 h-6" />,
          location: locationName
        });

        // SM Average Triage Hours (using triageHours field which maps to SM YTD Dwell Avg)
        const triageValue = locationData.triageHours || 'N/A';
        metrics.push({
          title: 'SM Average Triage Hours',
          value: triageValue === 'N/A' ? triageValue : `${triageValue} hrs`,
          target: '< 2.0 hrs (target)',
          status: parseTriageStatus(triageValue),
          impact: 'Initial diagnosis efficiency and workflow',
          description: 'Time spent on initial case assessment and diagnosis - affects overall repair timeline',
          icon: <Clock className="w-6 h-6" />,
          location: locationName
        });

        // % Cases with 3+ Notes
        const notesValue = locationData.percentCasesWith3Notes || 'N/A';
        metrics.push({
          title: '% Cases with 3+ Notes',
          value: notesValue.includes('%') ? notesValue : `${notesValue}%`,
          target: '< 5% (target)',
          status: parseNotesStatus(notesValue),
          impact: 'Repair complexity and documentation quality',
          description: 'Cases requiring extensive documentation often indicate complex repairs or communication issues',
          icon: <MessageSquare className="w-6 h-6" />,
          location: locationName
        });
      });
      
      return metrics;
    }
  } catch (error) {
    console.log('Using fallback data due to API error:', error);
  }
  
  // Fallback data
  return [];
};

export default function TechnicianMetrics() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getTechnicianMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching technician metrics:', error);
        setMetrics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-slate-300">Loading Technician metrics...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link to="/metrics" className="flex items-center text-red-400 hover:text-red-300 mr-4 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Role Selection
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
          Technician PACCAR Metrics
        </h1>
        <p className="text-xl text-slate-300">
          Your repair quality and QAB usage directly impact PACCAR dealer performance
        </p>
      </div>

      {/* Show message when no legitimate scorecard data is available */}
      {metrics.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center mb-8">
          <div className="text-6xl mb-4">🔧</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Technician Data Available</h2>
          <p className="text-slate-300 mb-6">
            Technician metrics will be available once W370 Service Scorecard data is uploaded and processed.
          </p>
        </div>
      )}

      {/* Metrics Grid - only show when data exists */}
      {metrics.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
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
