import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  Wrench, 
  Package, 
  BarChart3,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Calculator,
  Award,
  Briefcase,
  AlertCircle,
  CheckCircle,
  TrendingDown
} from 'lucide-react';

interface MetricDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  calculation: string;
  target: string;
  impact: string;
  workflowConnection: string;
  improvementTips: string[];
  roleResponsible: string[];
  icon: React.ReactNode;
  unit: string;
}

const metricsDefinitions: MetricDefinition[] = [
  {
    id: 'dwell-time',
    name: 'Dwell Time',
    category: 'Operational Efficiency',
    description: 'Average time customers spend waiting for service completion. Measured in hours from service start to completion.',
    calculation: 'Extracted from monthly scorecard PDF data. Represents average hours per service case across all completed work.',
    target: 'Less than 2.5 hours for optimal efficiency',
    impact: 'Primary customer satisfaction metric. Longer dwell times lead to customer dissatisfaction and potential business loss.',
    workflowConnection: 'Spans entire service process: Check-in through Service Completion and Vehicle Release',
    improvementTips: [
      'Streamline diagnostic procedures to reduce initial assessment time',
      'Ensure parts availability before starting work',
      'Cross-train technicians to handle multiple service types',
      'Implement appointment scheduling to better distribute workload'
    ],
    roleResponsible: ['Service Advisor', 'Technician', 'Parts Staff'],
    icon: <Clock size={24} />,
    unit: 'hours'
  },
  {
    id: 'triage-time',
    name: 'Triage Time',
    category: 'Operational Efficiency',
    description: 'Time required to perform initial service assessment and diagnosis. Critical for setting customer expectations.',
    calculation: 'Average time from vehicle check-in to completed initial diagnosis. Measured in minutes.',
    target: 'Less than 15 minutes for quick assessment',
    impact: 'Sets the tone for entire service experience. Fast triage leads to accurate estimates and better customer confidence.',
    workflowConnection: 'First critical step: Vehicle Arrival through Initial Diagnosis and Estimate Creation',
    improvementTips: [
      'Pre-stage diagnostic tools and equipment',
      'Train technicians on systematic diagnostic approaches',
      'Use standardized checklists for common issues',
      'Maintain organized workspace for efficiency'
    ],
    roleResponsible: ['Technician', 'Service Advisor'],
    icon: <Target size={24} />,
    unit: 'minutes'
  },
  {
    id: 'case-volume',
    name: 'Case Volume',
    category: 'Capacity Management',
    description: 'Total number of service cases handled during the reporting period. Indicates service capacity utilization.',
    calculation: 'Count of all completed and in-progress service cases during the monthly reporting period.',
    target: 'Consistent workload management to optimize capacity',
    impact: 'Reflects service department capacity and demand. Too high may indicate understaffing, too low may indicate inefficiency.',
    workflowConnection: 'Encompasses all service activities from initial contact through case closure',
    improvementTips: [
      'Monitor case flow patterns to identify peak periods',
      'Balance workload across available technicians',
      'Track case complexity to better estimate resource needs',
      'Implement scheduling systems to smooth demand'
    ],
    roleResponsible: ['Service Manager', 'Service Advisor'],
    icon: <BarChart3 size={24} />,
    unit: 'cases'
  },
  {
    id: 'customer-satisfaction',
    name: 'Customer Satisfaction',
    category: 'Customer Experience',
    description: 'Customer satisfaction score based on service experience surveys and feedback. May be measured on different scales.',
    calculation: 'Average score from customer satisfaction surveys. Can be percentage-based or rating scale (e.g., 1-5).',
    target: 'Above 4.5/5.0 or 95% satisfaction rate',
    impact: 'Directly impacts customer retention, referrals, and business reputation. Critical for long-term business success.',
    workflowConnection: 'Influenced by all touchpoints: Initial Contact through Service Completion and Follow-up',
    improvementTips: [
      'Follow up with customers after service completion',
      'Address complaints quickly and professionally',
      'Train staff on customer service excellence',
      'Implement feedback systems to capture improvement opportunities'
    ],
    roleResponsible: ['Service Advisor', 'Service Manager', 'All Staff'],
    icon: <Users size={24} />,
    unit: 'rating'
  },
  {
    id: 'etr-compliance',
    name: 'ETR Compliance',
    category: 'Customer Experience',
    description: 'Estimated Time of Repair accuracy and compliance. Measures how well initial time estimates match actual completion times.',
    calculation: 'Percentage of cases where actual completion time matches initial estimate within acceptable variance.',
    target: 'Greater than 85% accuracy in time estimates',
    impact: 'Builds customer trust and enables better planning. Poor ETR accuracy leads to customer dissatisfaction.',
    workflowConnection: 'Set during initial diagnosis and tracked through service completion',
    improvementTips: [
      'Use historical data to improve estimate accuracy',
      'Account for parts availability in estimates',
      'Include buffer time for unexpected complications',
      'Update customers when estimates change'
    ],
    roleResponsible: ['Service Advisor', 'Technician'],
    icon: <CheckCircle size={24} />,
    unit: 'percentage'
  },
  {
    id: 'first-time-fix',
    name: 'First Time Fix Rate',
    category: 'Quality',
    description: 'Percentage of service issues resolved correctly on the first attempt without requiring return visits.',
    calculation: 'Number of cases resolved on first attempt divided by total cases, expressed as percentage.',
    target: 'Greater than 85% first-time resolution',
    impact: 'Reduces rework costs, improves customer satisfaction, and demonstrates technical competency.',
    workflowConnection: 'Measured from service completion through follow-up period to confirm resolution',
    improvementTips: [
      'Invest in technician training and certification',
      'Use proper diagnostic procedures before starting repairs',
      'Ensure quality parts and materials are used',
      'Implement quality control checks before vehicle release'
    ],
    roleResponsible: ['Technician', 'Service Manager'],
    icon: <Wrench size={24} />,
    unit: 'percentage'
  }
];

const categories = ['All Categories', 'Operational Efficiency', 'Customer Experience', 'Capacity Management', 'Quality'];

export default function MetricsDefinitions() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const filteredMetrics = selectedCategory === 'All Categories' 
    ? metricsDefinitions 
    : metricsDefinitions.filter(metric => metric.category === selectedCategory);

  const toggleMetricExpansion = (metricId: string) => {
    setExpandedMetric(expandedMetric === metricId ? null : metricId);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Operational Efficiency': 'text-blue-400',
      'Customer Experience': 'text-green-400',
      'Quality': 'text-purple-400',
      'Capacity Management': 'text-orange-400',
      'Financial Performance': 'text-yellow-400'
    };
    return colors[category as keyof typeof colors] || 'text-slate-400';
  };

  // Get current metrics from localStorage for comparison
  const getCurrentMetrics = () => {
    const storedScorecards = localStorage.getItem('wki-scorecards');
    if (!storedScorecards) return null;
    
    const scorecards = JSON.parse(storedScorecards);
    if (scorecards.length === 0) return null;
    
    // Get most recent scorecard
    const latest = scorecards.sort((a: any, b: any) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    )[0];
    
    return latest?.metrics;
  };

  const currentMetrics = getCurrentMetrics();

  const getPerformanceStatus = (metricId: string, currentValue: string | undefined) => {
    if (!currentValue) return null;
    
    const value = parseFloat(currentValue);
    if (isNaN(value)) return null;

    switch (metricId) {
      case 'dwell-time':
        return value < 2.5 ? 'good' : value < 4 ? 'warning' : 'critical';
      case 'triage-time':
        return value < 15 ? 'good' : value < 30 ? 'warning' : 'critical';
      case 'customer-satisfaction':
        if (value > 10) { // Percentage scale
          return value >= 95 ? 'good' : value >= 90 ? 'warning' : 'critical';
        } else { // 1-5 scale
          return value >= 4.5 ? 'good' : value >= 4 ? 'warning' : 'critical';
        }
      case 'etr-compliance':
      case 'first-time-fix':
        return value >= 85 ? 'good' : value >= 75 ? 'warning' : 'critical';
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'good':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'critical':
        return <TrendingDown size={16} className="text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/metrics" 
          className="inline-flex items-center text-red-400 hover:text-red-300 mb-4 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Metrics
        </Link>
        
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <BarChart3 size={32} className="mr-3" />
            Service Performance Metrics Guide
          </h1>
          <p className="text-red-100 text-lg">
            Understanding key performance metrics for service excellence
          </p>
        </div>

        {/* Current Performance Summary */}
        {currentMetrics && (
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-green-400" />
              Current Performance Overview
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Dwell Time</span>
                  {getStatusIcon(getPerformanceStatus('dwell-time', currentMetrics.dwellTime))}
                </div>
                <div className="text-2xl font-bold text-white">
                  {currentMetrics.dwellTime || 'N/A'} hrs
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Triage Time</span>
                  {getStatusIcon(getPerformanceStatus('triage-time', currentMetrics.triageTime))}
                </div>
                <div className="text-2xl font-bold text-white">
                  {currentMetrics.triageTime || 'N/A'} min
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Cases</span>
                  <BarChart3 size={16} className="text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {currentMetrics.cases || 'N/A'}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Satisfaction</span>
                  {getStatusIcon(getPerformanceStatus('customer-satisfaction', currentMetrics.satisfaction))}
                </div>
                <div className="text-2xl font-bold text-white">
                  {currentMetrics.satisfaction || 'N/A'}
                  {currentMetrics.satisfaction && (parseFloat(currentMetrics.satisfaction) > 10 ? '%' : '/5')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center bg-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-slate-300 font-semibold mr-2 self-center">Filter by Category:</span>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                selectedCategory === category 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25' 
                  : 'bg-slate-600 text-slate-200 hover:bg-slate-500 border border-slate-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-6">
        {filteredMetrics.map((metric) => (
          <div 
            key={metric.id} 
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden"
          >
            {/* Metric Header */}
            <button
              onClick={() => toggleMetricExpansion(metric.id)}
              className="w-full p-6 text-left hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-red-600 to-red-700 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg">
                    {metric.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{metric.name}</h3>
                    <span className={`text-sm font-medium ${getCategoryColor(metric.category)}`}>
                      {metric.category}
                    </span>
                  </div>
                </div>
                <div className="text-slate-400">
                  {expandedMetric === metric.id ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
              </div>
              <p className="text-slate-300 mt-3 text-lg">{metric.description}</p>
            </button>

            {/* Expanded Content */}
            {expandedMetric === metric.id && (
              <div className="px-6 pb-6 border-t border-slate-700">
                <div className="grid md:grid-cols-2 gap-6 pt-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
                        <Calculator size={16} className="mr-2" />
                        How It's Calculated
                      </h4>
                      <p className="text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-600">
                        {metric.calculation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
                        <Target size={16} className="mr-2" />
                        Target Performance
                      </h4>
                      <p className="text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-600">
                        {metric.target}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
                        <Briefcase size={16} className="mr-2" />
                        Role Responsible
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {metric.roleResponsible.map(role => (
                          <span key={role} className="bg-red-600/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-500/30">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
                        <TrendingUp size={16} className="mr-2" />
                        Business Impact
                      </h4>
                      <p className="text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-600">
                        {metric.impact}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
                        <Package size={16} className="mr-2" />
                        Workflow Connection
                      </h4>
                      <p className="text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-600">
                        {metric.workflowConnection}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
                        <Award size={16} className="mr-2" />
                        Improvement Tips
                      </h4>
                      <ul className="space-y-2">
                        {metric.improvementTips.map((tip, index) => (
                          <li key={index} className="text-slate-300 flex items-start">
                            <span className="text-red-400 mr-2 mt-1">•</span>
                            <span className="text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
          <Target size={24} className="mr-2 text-red-400" />
          Key Takeaways
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Interconnected Metrics</h3>
            <p className="text-slate-300 text-sm">All metrics work together - improving one positively impacts others</p>
          </div>
          
          <div className="text-center">
            <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
            <p className="text-slate-300 text-sm">Success requires coordination across all roles in the workflow</p>
          </div>
          
          <div className="text-center">
            <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Continuous Improvement</h3>
            <p className="text-slate-300 text-sm">Regular monitoring and optimization drives sustained performance gains</p>
          </div>
        </div>
      </div>
    </div>
  );
}