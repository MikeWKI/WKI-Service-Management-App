import React, { useState } from "react";
import { CheckCircle, Clock, FileText, AlertCircle } from "lucide-react";

interface Step {
  title: string;
  id: string;
  roles: string[];
  isQAB?: boolean;
  actionButton?: string;
  hasETR?: boolean;
  etrType?: 'required' | 'update';
}

interface RoleFilter {
  id: string;
  name: string;
}

const steps: Step[] = [
  { title: "Case Created\n& Truck Arrives Onsite", id: "case-created", roles: ["service-advisor"], isQAB: true, actionButton: "CHECK-IN" },
  { title: "Create RO\nfrom Decisiv Case", id: "create-ro", roles: ["service-advisor"] },
  { title: "Update Case\nwith Lines & Parts", id: "update-case", roles: ["service-advisor", "parts-staff", "technician"] },
  { title: "Send Initial\nEstimate to Customer", id: "send-estimate", roles: ["service-advisor"], hasETR: true, etrType: 'required' },
  { title: "Customer Approves\nEstimate", id: "approve-estimate", roles: ["service-advisor"], isQAB: true, actionButton: "REQUEST APPROVAL" },
  { title: "Parts Picked or\nOrdered for RO", id: "parts-picked", roles: ["parts-staff"] },
  { title: "Repair in\nProcess", id: "repair-process", roles: ["technician"], hasETR: true, etrType: 'update' },
  { title: "Technician Story\nWrite Up", id: "tech-writeup", roles: ["technician"] },
  { title: "Service Advisor\nAdmin Work", id: "admin-work", roles: ["service-advisor"] },
  { title: "Notify Customer\nRepair is Complete", id: "notify-customer", roles: ["service-advisor"], hasETR: true, etrType: 'update' },
  { title: "Invoice\nCustomer", id: "invoice-customer", roles: ["service-advisor", "service-clerk"] },
  { title: "Truck Departs\nService Location", id: "truck-departs", roles: ["service-advisor"], isQAB: true, actionButton: "ASSET READY" },
];

const roleFilters: RoleFilter[] = [
  { id: 'all', name: 'All Roles' },
  { id: 'service-advisor', name: 'Service Advisors' },
  { id: 'parts-staff', name: 'Parts Staff' },
  { id: 'technician', name: 'Foremen/Technicians' },
  { id: 'service-clerk', name: 'Service Clerk' }
];

export default function ProcessWorkflowLayout() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const capitalizeRole = (role: string) => {
    return role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStepOpacity = (step: Step): string => {
    if (activeFilter === 'all') return 'opacity-100';
    return step.roles.includes(activeFilter) ? 'opacity-100' : 'opacity-30';
  };

  const handleStepClick = (stepId: string) => {
    console.log(`Clicked step: ${stepId}`);
    // Future: Navigate to step details or trigger action
  };

  return (
    <div className="w-full max-w-7xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-4 md:p-8 flex flex-col gap-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">WKI Service Management Process</h1>
          <p className="text-red-100 font-semibold text-lg">Start Every Repair Order in Decisiv</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <div className="bg-white rounded-lg p-3 shadow-lg">
            <img 
              src="/kenworth_logo-header.png" 
              alt="Kenworth Logo" 
              className="h-12 w-auto" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <a 
            href="https://paccar.decisiv.net/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
            aria-label="Open Decisiv Portal"
          >
            <img 
              src="/Decisiv-Logo.svg" 
              alt="Decisiv Logo" 
              className="h-12 w-auto" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </a>
        </div>
      </div>

      {/* Filter by Role */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center bg-slate-800 rounded-xl p-4 shadow-lg" role="tablist" aria-label="Role filters">
        <span className="text-slate-300 font-semibold mr-2 self-center">Filter by Role:</span>
        {roleFilters.map(role => (
          <button
            key={role.id}
            onClick={() => setActiveFilter(role.id)}
            role="tab"
            aria-selected={activeFilter === role.id}
            aria-controls="workflow-steps"
            className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              activeFilter === role.id
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-500/25'
                : 'bg-slate-600 text-slate-200 hover:bg-slate-500 border border-slate-500'
            }`}
          >
            {role.name}
          </button>
        ))}
      </div>

      {/* Workflow Truck Image */}
      <div className="flex justify-center mb-4">
        <img 
          src="/Workflowtruck.png" 
          alt="WKI Service Management Process Workflow" 
          className="max-w-full h-auto rounded-lg shadow-lg max-h-64 md:max-h-96"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Timeline Workflow */}
      <div className="relative flex flex-col items-center" id="workflow-steps" role="tabpanel">
        {/* Steps Container */}
        <div className="w-full overflow-x-auto pb-4">
          <div className="flex justify-between items-end min-w-max gap-4 px-4 mb-6">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex flex-col items-center min-w-[120px] transition-all duration-300 ${getStepOpacity(step)}`}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Hover Card */}
                {hoveredStep === step.id && (
                  <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white p-4 rounded-lg shadow-xl z-50 min-w-[200px] text-center border border-slate-600 transition-opacity duration-200">
                    <div className="text-sm font-semibold mb-2">{step.title.replace('\n', ' ')}</div>
                    <div className="text-xs text-slate-300 mb-2">
                      Roles: {step.roles.map(role => capitalizeRole(role)).join(', ')}
                    </div>
                    {step.isQAB && (
                      <div className="text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold mb-1">
                        QAB Checkpoint
                      </div>
                    )}
                    {step.hasETR && (
                      <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded font-bold mb-1">
                        {step.etrType === 'required' ? 'ETR Required' : 'ETR Check/Update'}
                      </div>
                    )}
                    {step.actionButton && (
                      <div className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                        Action: {step.actionButton}
                      </div>
                    )}
                    {/* Arrow pointing down */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
                  </div>
                )}

                {/* Step Box */}
                <button
                  onClick={() => handleStepClick(step.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStepClick(step.id);
                    }
                  }}
                  aria-label={`Step ${idx + 1}: ${step.title.replace('\n', ' ')}`}
                  className={`bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-500 rounded-xl px-4 py-3 text-center text-xs font-bold whitespace-pre-line shadow-lg mb-4 transition-all duration-300 hover:shadow-xl hover:scale-105 transform hover:border-red-400 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    hoveredStep === step.id ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-400 shadow-xl scale-105 text-white' : 'text-white'
                  }`}
                >
                  {step.title}
                </button>

                {/* QAB marker */}
                {step.isQAB && (
                  <div className="flex flex-col items-center mb-2">
                    <div className={`bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-black text-sm border-2 border-yellow-400 shadow-lg transition-all duration-300 ${
                      hoveredStep === step.id ? 'scale-125 shadow-yellow-500/50' : ''
                    }`} aria-label="Quick Action Button checkpoint">
                      QAB
                    </div>
                  </div>
                )}

                {/* ETR marker */}
                {step.hasETR && (
                  <div className="flex flex-col items-center mb-2">
                    <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-white text-sm border-2 border-blue-400 shadow-lg transition-all duration-300 ${
                      hoveredStep === step.id ? 'scale-125 shadow-blue-500/50' : ''
                    }`} aria-label="Estimated Time to Repair checkpoint">
                      ETR
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {step.actionButton && (
                  <button
                    onClick={() => console.log(`Action: ${step.actionButton} for ${step.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        console.log(`Action: ${step.actionButton} for ${step.id}`);
                      }
                    }}
                    aria-label={`Action: ${step.actionButton}`}
                    className={`bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:scale-105 border border-green-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                      hoveredStep === step.id ? 'from-green-700 to-green-800 scale-105 shadow-xl' : ''
                    }`}
                  >
                    {step.actionButton}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Line */}
        <div className="w-full flex justify-center mb-4">
          <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full shadow-inner w-full max-w-6xl mx-auto relative">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-transparent rounded-full transition-all duration-500 shadow-lg opacity-60" style={{width: '30%'}} />
          </div>
        </div>

        {/* Timeline Labels */}
        <div className="flex w-full max-w-6xl mx-auto justify-between text-slate-300 font-bold text-sm px-8">
          <span className="bg-slate-700 px-3 py-1 rounded-full shadow border border-slate-600">
            <Clock className="w-4 h-4 inline mr-1" />
            Triage Time Begins
          </span>
          <span className="bg-slate-700 px-3 py-1 rounded-full shadow border border-slate-600">
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Dwell Time Ends
          </span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-8 flex-1 flex flex-col justify-center items-center shadow-2xl border border-red-500">
          <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg flex items-center">
            <AlertCircle className="w-6 h-6 mr-2" />
            Kenworth Goals
          </h3>
          <div className="text-red-100 font-bold text-xl mb-2 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Triage: 2 Hours or less
          </div>
          <div className="text-red-100 font-bold text-xl flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Dwell: 3 Days or less
          </div>
        </div>
        
        <div className="flex-1 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 shadow-xl border border-slate-600">
          <h3 className="text-2xl font-bold mb-4 text-white border-b border-slate-500 pb-2">Remember Every Case Needs:</h3>
          <ul className="list-none text-slate-300 text-sm grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>Primary Email Contact</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>Follow Up Time</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>Case-Level Complaint</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>Accurate Estimate Approvals</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>Quick Action Button Usage</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>Every Case Updated Twice Daily</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>ETR Populated and Maintained</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>Export RO # from DBS</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}