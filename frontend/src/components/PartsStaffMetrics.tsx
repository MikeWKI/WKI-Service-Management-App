import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, TrendingUp, AlertCircle, MessageSquare, BarChart3 } from 'lucide-react';
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
const parseNotesStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue <= 5) return 'good';
  if (numValue <= 10) return 'warning';
  return 'critical';
};

const parseDwellStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value);
  if (numValue <= 3.0) return 'good';
  if (numValue <= 5.0) return 'warning';
  return 'critical';
};

const getPartsStaffMetrics = async (): Promise<MetricCard[]> => {
  const API_BASE_URL = 'https://wki-service-management-app.onrender.com';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
    if (response.ok) {
      const data = await response.json();
      const metrics: MetricCard[] = [];
      
      // Process each location's metrics
      Object.entries(data).forEach(([locationKey, locationData]: [string, any]) => {
        const locationName = locationKey.replace(/([A-Z])/g, ' $1').trim();
        
        // % Cases with 3+ Notes
        const notesValue = locationData.percentCasesWith3Notes || 'N/A';
        metrics.push({
          title: '% Cases with 3+ Notes',
          value: notesValue.includes('%') ? notesValue : `${notesValue}%`,
          target: '< 5% (target)',
          status: parseNotesStatus(notesValue),
          impact: 'Parts availability and procurement efficiency',
          description: 'Cases requiring extensive documentation often indicate parts delays or complexity',
          icon: <MessageSquare className="w-6 h-6" />,
          location: locationName
        });

        // Monthly Dwell Average
        const dwellValue = locationData.smMonthlyDwellAvg || 'N/A';
        metrics.push({
          title: 'Monthly Dwell Average',
          value: dwellValue === 'N/A' ? dwellValue : `${dwellValue} days`,
          target: '< 3.0 days (target)',
          status: parseDwellStatus(dwellValue),
          impact: 'Customer satisfaction and service efficiency',
          description: 'Average time trucks spend at dealership - parts availability directly impacts dwell time',
          icon: <Clock className="w-6 h-6" />,
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

export default function PartsStaffMetrics() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getPartsStaffMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching parts staff metrics:', error);
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
          <div className="text-xl text-slate-300">Loading Parts Staff metrics...</div>
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
          Parts Staff PACCAR Metrics
        </h1>
        <p className="text-xl text-slate-300">
          Your parts status discipline directly impacts PACCAR dealer performance tracking
        </p>
      </div>

      {/* Show message when no legitimate scorecard data is available */}
      {metrics.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center mb-8">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Parts Staff Data Available</h2>
          <p className="text-slate-300 mb-6">
            Parts Staff metrics will be available once W370 Service Scorecard data is uploaded and processed.
          </p>
        </div>
      )}

      {/* Metrics Grid - only show when data exists */}
      {metrics.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
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
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-yellow-500/50 p-6 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={24} className="text-white" />
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Order Accuracy</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">88%</span>
              <span className="text-sm text-slate-400">Target: &gt; 95%</span>
            </div>
            <p className="text-sm text-slate-300">Percentage of parts orders without errors</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">Rework Prevention &amp; Customer Trust</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-green-500/50 p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle size={24} className="text-white" />
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Proactive Ordering</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">87%</span>
              <span className="text-sm text-slate-400">Target: &gt; 85%</span>
            </div>
            <p className="text-sm text-slate-300">Percentage of critical parts ordered proactively</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">Downtime Prevention &amp; Planning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-lg shadow-2xl border border-slate-700 p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">🎯 Action Items to Improve Your Metrics</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Parts Availability</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Monitor inventory levels daily</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Set automatic reorder points</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Review historical usage patterns</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Order Accuracy</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Double-check part numbers before ordering</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Use barcode scanning when possible</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Verify compatibility with technicians</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Picking Efficiency</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Organize parts by frequency of use</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Batch similar orders together</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Maintain clear labeling system</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Impact */}
      <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-lg p-6 border border-red-500/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-red-300 mb-4">💡 How Parts Staff Drive Dealer Success</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div>
            <h4 className="font-semibold mb-2 text-white">Operational Impact</h4>
            <ul className="space-y-1">
              <li>• High availability = Reduced truck dwell time</li>
              <li>• Fast picking = Better technician productivity</li>
              <li>• Accurate orders = Fewer delays and customer complaints</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Financial Impact</h4>
            <ul className="space-y-1">
              <li>• Proactive ordering = Better inventory turnover</li>
              <li>• Reduced errors = Lower return/exchange costs</li>
              <li>• Efficient processes = Lower labor costs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}