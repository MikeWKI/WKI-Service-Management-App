import React from 'react';
import { ArrowLeft, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetricCard {
  title: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
  impact: string;
  description: string;
  icon: React.ReactNode;
}

const serviceAdvisorMetrics: MetricCard[] = [
  {
    title: 'Days Out of Service (DoS)',
    value: '2.1 days',
    target: '< 3 days (avoid Extended WIP)',
    status: 'good',
    impact: 'Primary PACCAR dealer performance metric',
    description: 'Average asset downtime from Check-In to Asset Released',
    icon: <Clock size={24} />
  },
  {
    title: 'ETR Compliance',
    value: '94%',
    target: '100% ETR provided',
    status: 'warning',
    impact: 'PACCAR Vision monitoring & PremierCare standards',
    description: 'Cases with current ETR vs ETR Overdue flags',
    icon: <Users size={24} />
  },
  {
    title: 'Extended Update Rate',
    value: '8%',
    target: '0% Extended Updates',
    status: 'warning',
    impact: 'PACCAR Vision default favorite tracking',
    description: 'Cases without updates in 24+ hours',
    icon: <AlertTriangle size={24} />
  },
  {
    title: 'QAB Usage Rate',
    value: '76%',
    target: '> 90%',
    status: 'warning',
    impact: 'DoS calculation accuracy & PACCAR tracking',
    description: 'Percentage of cases using Quick Action Buttons',
    icon: <CheckCircle size={24} />
  }
];

const actionItems = [
  {
    metric: 'Days Out of Service',
    actions: [
      'Use Quick Action Buttons for accurate timestamp capture',
      'Monitor cases approaching 3-day Extended WIP threshold',
      'Aggressively manage Hold (auth) and parts delays',
      'Set Asset Released immediately when truck is ready'
    ]
  },
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

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {serviceAdvisorMetrics.map((metric, index) => (
          <div
            key={index}
            className={`rounded-lg border-2 p-6 shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="text-white">{metric.icon}</div>
                <span className="text-2xl">{getStatusIcon(metric.status)}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2 text-white">{metric.title}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-white">{metric.value}</span>
                <span className="text-sm text-slate-400">Target: {metric.target}</span>
              </div>
              <p className="text-sm text-slate-300">{metric.description}</p>
              <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
                <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">{metric.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Items */}
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
    </div>
  );
}
