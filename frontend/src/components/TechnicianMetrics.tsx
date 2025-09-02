import React from 'react';
import { ArrowLeft, Wrench, Clock, CheckCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TechnicianMetrics() {
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

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-green-500/50 p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={24} className="text-white" />
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Repair Status Discipline</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">92%</span>
              <span className="text-sm text-slate-400">Target: &gt; 95%</span>
            </div>
            <p className="text-sm text-slate-300">Proper status progression and QAB usage</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">Accurate case tracking for PACCAR compliance</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-yellow-500/50 p-6 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <Clock size={24} className="text-white" />
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">PremierCare Compliance</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">89%</span>
              <span className="text-sm text-slate-400">Target: 100%</span>
            </div>
            <p className="text-sm text-slate-300">2-hour diagnosis + ETR completion rate</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">PACCAR Gold ExpressLane requirement</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-green-500/50 p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <Wrench size={24} className="text-white" />
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">ATR Accuracy</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">4.2 hrs</span>
              <span className="text-sm text-slate-400">Target: Match ETR</span>
            </div>
            <p className="text-sm text-slate-300">Actual Time to Repair vs estimated time</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">ETR accuracy and customer trust</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-green-500/50 p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <Target size={24} className="text-white" />
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Diagnostic Accuracy</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">96%</span>
              <span className="text-sm text-slate-400">Target: &gt; 95%</span>
            </div>
            <p className="text-sm text-slate-300">Percentage of accurate problem identification</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">Repair Efficiency &amp; Parts Costs</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-green-500/50 p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <Wrench size={24} className="text-white" />
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Safety Compliance</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-sm text-slate-400">Target: 100%</span>
            </div>
            <p className="text-sm text-slate-300">Adherence to safety protocols and procedures</p>
            <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs border border-slate-600">
              <strong className="text-red-400">Impact:</strong> <span className="text-slate-300">Workplace Safety &amp; Legal Compliance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-lg shadow-2xl border border-slate-700 p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">🎯 Action Items to Improve Your Metrics</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Diagnostic Skills</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Follow systematic diagnostic procedures</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Use proper diagnostic tools and software</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Document findings thoroughly in case notes</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Quality Control</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Perform thorough post-repair testing</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Double-check torque specifications</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Complete final inspection checklists</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/50 pb-2">Efficiency</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Organize tools and workspace efficiently</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Plan repair sequences to minimize downtime</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-slate-300">Coordinate with Service Advisors proactively</span>
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
            <h4 className="font-semibold mb-2 text-white">Quality Impact</h4>
            <ul className="space-y-1">
              <li>• High first-time fix rate = Improved customer confidence</li>
              <li>• Accurate diagnostics = Reduced unnecessary parts costs</li>
              <li>• Quality workmanship = Higher customer satisfaction scores</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-white">Efficiency Impact</h4>
            <ul className="space-y-1">
              <li>• Fast, accurate repairs = Lower dwell time</li>
              <li>• Proper procedures = Reduced liability and rework</li>
              <li>• Good communication = Smoother workflow coordination</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
