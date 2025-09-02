import React from 'react';
import { ArrowLeft, Package, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PartsStaffMetrics() {
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

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-green-500/50 p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <Package size={24} className="text-white" />
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Parts Status Discipline</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">88%</span>
              <span className="text-sm text-slate-400">Target: &gt; 95%</span>
            </div>
            <p className="text-sm text-slate-300">Proper use of Hold (parts), Parts Ordered, B.O. statuses</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">PACCAR downtime attribution accuracy</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-yellow-500/50 p-6 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <Clock size={24} className="text-white" />
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Parts Impact Tracking</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">24 hrs</span>
              <span className="text-sm text-slate-400">Target: &lt; 12 hrs</span>
            </div>
            <p className="text-sm text-slate-300">Average parts acquisition time for repairs</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">Parts delays tracked separately in PACCAR analysis</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-green-500/50 p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <Clock size={24} className="text-white" />
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Parts Picking Time</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">12 min</span>
              <span className="text-sm text-slate-400">Target: &lt; 15 min</span>
            </div>
            <p className="text-sm text-slate-300">Average time to locate and pull parts</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">Technician Efficiency &amp; Workflow</span>
            </div>
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