import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, CheckCircle, AlertTriangle, MessageSquare, Target, BarChart3 } from 'lucide-react';
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

interface LocationMetrics {
  location: string;
  etrPercentCases: string;
  percentCasesWith3Notes: string;
  vscCaseRequirements: string;
}

// Status parsing functions
const parseEtrStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue >= 15) return 'good';
  if (numValue >= 10) return 'warning';
  return 'critical';
};

const parseNotesStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue <= 5) return 'good';
  if (numValue <= 10) return 'warning';
  return 'critical';
};

const parseVscStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue >= 95) return 'good';
  if (numValue >= 80) return 'warning';
  return 'critical';
};

const getServiceAdvisorMetrics = async (): Promise<MetricCard[]> => {
  const API_BASE_URL = 'https://wki-service-management-app.onrender.com';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
    if (response.ok) {
      const apiResponse = await response.json();
      const metrics: MetricCard[] = [];
      
      // Handle the nested data structure
      if (apiResponse.success && apiResponse.data && apiResponse.data.locations) {
        apiResponse.data.locations.forEach((location: any) => {
          const locationName = location.name || 'Unknown Location';
          const locationData = location.metrics || location;
          
          // ETR % of Cases
          const etrValue = locationData.etrPercentCases || 'N/A';
          metrics.push({
            title: 'ETR % of Cases',
            value: etrValue.includes('%') ? etrValue : `${etrValue}%`,
            target: '> 15% (target)',
            status: parseEtrStatus(etrValue),
            impact: 'Customer satisfaction and service transparency',
            description: 'Percentage of cases with accurate estimated time of repair provided to customers',
            icon: <Target className="w-6 h-6" />,
            location: locationName
          });

          // QAB Usage (Customer Communication) - using VSC Case Requirements as proxy
          const qabValue = locationData.vscCaseRequirements || 'N/A';
          metrics.push({
            title: 'QAB Usage Metrics',
            value: qabValue,
            target: '> 95% (target)',
            status: parseVscStatus(qabValue),
            impact: 'Workflow efficiency and case tracking accuracy',
            description: 'Proper use of QAB system for case management and customer updates',
            icon: <BarChart3 className="w-6 h-6" />,
            location: locationName
          });

          // Customer Communication (% Cases with 3+ Notes)
          const commValue = locationData.percentCasesWith3Notes || 'N/A';
          metrics.push({
            title: 'Customer Communication',
            value: commValue.includes('%') ? commValue : `${commValue}%`,
            target: '< 5% (target)',
            status: parseNotesStatus(commValue),
            impact: 'Customer engagement and case documentation quality',
            description: 'Cases requiring extensive documentation indicating communication gaps',
            icon: <MessageSquare className="w-6 h-6" />,
            location: locationName
          });
        });
      }
      
      return metrics;
    }
  } catch (error) {
    console.log('Using fallback data due to API error:', error);
  }
  
  // Fallback data
  return [];
};

const serviceAdvisorMetrics: MetricCard[] = [];

const actionItems = [
  {
    metric: 'ETR Management',
    actions: [
      'Set ETR within PremierCare 2-hour window',
      'Include ETR on all posted estimates',
      'Update ETR proactively when scope changes',
      'Monitor Vision favorites for ETR Overdue cases'
    ]
  },
  {
    metric: 'Daily Updates',
    actions: [
      'Implement daily case review protocols',
      'Contact customers within 24-hour window minimum',
      'Use automated reminders for update schedules',
      'Monitor Vision Extended Update favorite'
    ]
  },
  {
    metric: 'QAB Usage',
    actions: [
      'Use CHECK-IN button immediately when truck arrives',
      'Click REQUEST APPROVAL for all estimates (auto-sets follow-up)',
      'Mark ASSET READY when repairs complete',
      'Use ASSET RELEASED to set ATR and complete case'
    ]
  }
];

export default function ServiceAdvisorMetrics() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getServiceAdvisorMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching service advisor metrics:', error);
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
          <div className="text-xl text-slate-300">Loading Service Advisor metrics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link 
          to="/metrics" 
          className="flex items-center text-red-400 hover:text-red-300 mr-4 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Role Selection
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
          Service Advisor Impact Dashboard
        </h1>
        <p className="text-xl text-slate-300">
          Your role drives customer satisfaction and operational efficiency
        </p>
      </div>

      {/* Show message when no legitimate scorecard data is available */}
      {metrics.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Service Advisor Data Available</h2>
          <p className="text-slate-300 mb-6">
            Service Advisor metrics will be available once W370 Service Scorecard data is uploaded and processed.
          </p>
        </div>
      )}

      {/* Metrics Grid - only show when data exists */}
      {metrics.length > 0 && (
        <>
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
        </>
      )}

      {/* Action Items and Performance Impact - only show when data exists */}
      {metrics.length > 0 && (
        <>
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-lg shadow-2xl border border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              🎯 Action Items to Improve Your Metrics
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {actionItems.map((item, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">
                    {item.metric}
                  </h3>
                  <ul className="space-y-2">
                    {item.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start space-x-2 text-sm">
                        <span className="text-red-500 mt-1">•</span>
                        <span className="text-slate-300">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Impact */}
          <div className="mt-8 bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-lg p-6 border border-red-500/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-red-300 mb-4">
              💡 How Service Advisors Drive Dealer Success
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
              <div>
                <h4 className="font-semibold mb-2 text-white">Customer Experience Impact</h4>
                <ul className="space-y-1">
                  <li>• Fast triage = Higher customer satisfaction scores</li>
                  <li>• Regular communication = Improved trust and retention</li>
                  <li>• Accurate estimates = Reduced complaints and rework</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Operational Impact</h4>
                <ul className="space-y-1">
                  <li>• QAB usage = Better workflow tracking and efficiency</li>
                  <li>• Quick approvals = Reduced dwell time and costs</li>
                  <li>• Proactive coordination = Higher first-time fix rates</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
