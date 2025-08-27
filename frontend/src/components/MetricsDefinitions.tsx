import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  Wrench, 
  Package, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3,
  ArrowLeft,
  ChevronDown,
  ChevronRight
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
}

const metricsDefinitions: MetricDefinition[] = [
  {
    id: 'days-out-of-service',
    name: 'Days Out of Service (DoS)',
    category: 'Operational Efficiency',
    description: 'Elapsed days an asset is unavailable due to service. Core PACCAR metric tracked via Decisiv timestamps and Quick Action Buttons.',
    calculation: 'Computed from case timestamps from Check-In to Asset Released. QAB usage improves accuracy.',
    target: 'Minimize DoS - avoid Extended WIP flag (>3 days provider downtime)',
    impact: 'Primary PACCAR dealer performance indicator. Affects dealer network comparisons and customer satisfaction.',
    workflowConnection: 'Spans: Check-In → Diagnosis → Repair → Asset Ready → Asset Released',
    improvementTips: [
      'Use Quick Action Buttons (QAB) for accurate timestamp capture',
      'Aggressively manage cases approaching 3-day Extended WIP threshold',
      'Set and maintain current ETR on all estimates',
      'Chase approvals promptly to avoid Hold (auth) delays'
    ],
    roleResponsible: ['Service Advisor', 'Technician', 'Parts Staff'],
    icon: <Clock size={24} />
  },
  {
    id: 'etr-management',
    name: 'ETR Provided & Overdue',
    category: 'Customer Experience',
    description: 'Whether Estimated Time of Repair is set and current. PACCAR flags ETR Overdue and "Promised Assets" (ETR within 5 days).',
    calculation: 'Percentage of cases with current ETR vs cases with overdue ETR',
    target: 'ETR on all posted estimates, minimize ETR Overdue flags',
    impact: 'Direct PACCAR tracking metric. Affects PremierCare Gold standards (diagnosis + ETR within 2 hours).',
    workflowConnection: 'Required at: Initial Diagnosis → Estimate Creation → Ongoing Updates',
    improvementTips: [
      'Set ETR early during PremierCare Gold 2-hour window',
      'Include ETR on all posted estimates by configuration',
      'Update ETR proactively when repair scope changes',
      'Monitor Vision favorites for ETR Overdue cases'
    ],
    roleResponsible: ['Service Advisor', 'Technician'],
    icon: <Target size={24} />
  },
  {
    id: 'extended-update',
    name: 'Extended Update Compliance',
    category: 'Customer Experience',
    description: 'Daily case update requirement. PACCAR flags cases not updated within 24 hours as "Extended Update".',
    calculation: 'Cases updated daily vs cases flagged for Extended Update',
    target: 'Daily updates minimum - avoid Extended Update flag',
    impact: 'Enforces fleet communication expectations and dealer operational discipline.',
    workflowConnection: 'Required throughout: All active cases must receive daily status updates',
    improvementTips: [
      'Implement daily case review protocols',
      'Use automated reminders for update schedules',
      'Train staff on minimum daily communication standards',
      'Monitor Vision default favorite for Extended Update cases'
    ],
    roleResponsible: ['Service Advisor'],
    icon: <AlertTriangle size={24} />
  },
  {
    id: 'qab-usage-rate',
    name: 'Quick Action Button (QAB) Usage',
    category: 'Operational Efficiency',
    description: 'Usage of Decisiv Quick Action Buttons for accurate timestamp capture. Critical for DoS/ATR calculations.',
    calculation: 'Cases using QABs (Check-In, Request Approval, Asset Ready, Asset Released) vs total cases',
    target: '>90% QAB usage for timestamp accuracy',
    impact: 'Improves DoS calculation accuracy. Dealers without QAB usage show worse time-based metrics.',
    workflowConnection: 'Key points: Check-In → Request Approval → Asset Ready → Asset Released',
    improvementTips: [
      'Train all staff on QAB workflows and benefits',
      'Use Check-In QAB immediately upon truck arrival',
      'Request Approval QAB auto-creates follow-ups',
      'Asset Released QAB sets ATR (Actual Time to Repair)'
    ],
    roleResponsible: ['Service Advisor', 'Technician'],
    icon: <CheckCircle size={24} />
  },
  {
    id: 'approval-workflow',
    name: 'Awaiting Customer Approval',
    category: 'Operational Efficiency',
    description: 'Cases in Hold (auth) status awaiting customer approval. PACCAR tracks follow-up discipline.',
    calculation: 'Cases in Hold (auth) with timely follow-ups vs overdue follow-ups',
    target: 'Minimize Hold (auth) duration, zero Follow-up Overdue',
    impact: 'Affects case flow velocity and customer satisfaction. Overdue follow-ups are flagged.',
    workflowConnection: 'Triggered by: Request Approval → Hold (auth) → Follow-up → Approved',
    improvementTips: [
      'Use Request Approval QAB to auto-set follow-up times',
      'Chase approvals proactively before follow-up due',
      'Monitor Vision favorite for Awaiting Customer Approval',
      'Track Follow-up Overdue and resolve immediately'
    ],
    roleResponsible: ['Service Advisor'],
    icon: <Users size={24} />
  },
  {
    id: 'parts-workflow',
    name: 'Parts Status Visibility',
    category: 'Supply Chain',
    description: 'Proper management of Hold (parts), Parts Ordered, and B.O. statuses to isolate parts-caused downtime.',
    calculation: 'Accurate parts status usage vs total parts-related delays',
    target: 'Clear parts status discipline, escalate B.O. situations',
    impact: 'Enables separation of parts-caused vs provider-caused downtime in PACCAR analysis.',
    workflowConnection: 'Applied during: Parts Ordered → Parts Received → Back to Repair',
    improvementTips: [
      'Use Hold (parts) status when waiting for parts delivery',
      'Escalate back-ordered parts through PACCAR channels',
      'Monitor Vision Parts favorites for parts-related delays',
      'Maintain accurate parts status for downtime attribution'
    ],
    roleResponsible: ['Parts Staff', 'Service Advisor'],
    icon: <Package size={24} />
  },
  {
    id: 'repair-status-discipline',
    name: 'Repair Status Discipline',
    category: 'Operational Efficiency',
    description: 'Correct, timely usage of repair statuses (Checked-In, Diagnosing/Triage, Parts Ordered, Asset Ready, etc.).',
    calculation: 'Proper status progression vs incomplete or incorrect status usage',
    target: 'Complete, accurate status progression on all cases',
    impact: 'Foundation for reliable DoS/ATR calculations and workflow analytics.',
    workflowConnection: 'Throughout: Proper status at each workflow transition',
    improvementTips: [
      'Train staff on complete status progression requirements',
      'Use QABs to automatically set correct statuses',
      'Monitor status transitions for gaps or errors',
      'Ensure Asset Ready status before customer pickup'
    ],
    roleResponsible: ['Service Advisor', 'Technician'],
    icon: <TrendingUp size={24} />
  },
  {
    id: 'premiercare-compliance',
    name: 'PremierCare Gold Compliance',
    category: 'Customer Experience',
    description: 'Meeting the 2-hour diagnosis and ETR requirement for PremierCare Gold ExpressLane service.',
    calculation: 'Cases meeting 2-hour diagnosis + ETR standard vs total PremierCare cases',
    target: '100% compliance with 2-hour diagnosis + ETR standard',
    impact: 'Published PACCAR/Kenworth dealer requirement. Affects dealer certification status.',
    workflowConnection: 'Check-In → Diagnosis Complete + ETR Set within 2 hours',
    improvementTips: [
      'Prioritize PremierCare cases in workflow',
      'Streamline diagnostic procedures for speed',
      'Pre-stage common diagnostic tools and parts',
      'Set ETR immediately upon diagnosis completion'
    ],
    roleResponsible: ['Service Advisor', 'Technician'],
    icon: <Wrench size={24} />
  }
];

const categories = ['All Categories', 'Operational Efficiency', 'Customer Experience', 'Supply Chain'];

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
      'Supply Chain': 'text-orange-400',
      'Financial Performance': 'text-yellow-400'
    };
    return colors[category as keyof typeof colors] || 'text-slate-400';
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
            PACCAR Dealer Performance Metrics
          </h1>
          <p className="text-red-100 text-lg">
            Core metrics PACCAR tracks for dealer performance in Decisiv Service Management
          </p>
        </div>

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
                      <h4 className="text-lg font-semibold text-red-400 mb-2">📊 How It's Calculated</h4>
                      <p className="text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-600">
                        {metric.calculation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2">🎯 Target Performance</h4>
                      <p className="text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-600">
                        {metric.target}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2">💼 Role Responsible</h4>
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
                      <h4 className="text-lg font-semibold text-red-400 mb-2">📈 Business Impact</h4>
                      <p className="text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-600">
                        {metric.impact}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2">🔄 Workflow Connection</h4>
                      <p className="text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-600">
                        {metric.workflowConnection}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-2">🚀 Improvement Tips</h4>
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
        <h2 className="text-2xl font-bold text-white mb-6 text-center">🎯 Key Takeaways</h2>
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
