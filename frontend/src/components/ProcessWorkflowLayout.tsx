import React, { useState } from "react";

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
    <div className="w-full max-w-6xl bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-2xl border border-slate-200 p-2 sm:p-4 md:p-8 flex flex-col gap-6 sm:gap-8">
      {/* Header */}
  <div className="flex flex-col sm:flex-row justify-between items-center mb-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 sm:p-6 shadow-lg gap-2">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">WKI Service Management Process</h1>
          <p className="text-red-100 font-semibold text-lg">Start Every Repair Order in Decisiv</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg p-3 shadow-lg">
            <img 
              src="https://www.kenworth.com/media/w4jnzm4t/kenworth_logo-header-new-012023.png" 
              alt="Kenworth Logo" 
              className="h-12 w-auto" 
            />
          </div>
          <a 
            href="https://paccar.decisiv.net/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
          >
            <img 
              src="https://www.decisiv.com/wp-content/uploads/2020/01/Decisiv-Logo-096126.svg" 
              alt="Decisiv Logo" 
              className="h-12 w-auto" 
            />
          </a>
        </div>
      </div>

      {/* Filter by Role - moved below header */}
  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center bg-slate-800 rounded-xl p-2 sm:p-4 shadow-lg">
        <span className="text-slate-300 font-semibold mr-2 self-center">Filter by Role:</span>
        {roleFilters.map(role => (
          <button
            key={role.id}
            onClick={() => setActiveFilter(role.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg ${
              activeFilter === role.id
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-500/25'
                : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 hover:from-slate-300 hover:to-slate-400 border border-slate-400'
            }`}
          >
            {role.name}
          </button>
        ))}
      </div>

      {/* Workflow Truck Image */}
      <div className="flex justify-center -mb-2">
        <img 
          src="/workflowtruck.png" 
          alt="WKI Service Management Process Workflow" 
          className="max-w-full h-auto rounded-lg shadow-lg max-h-40 sm:max-h-72 md:max-h-96"
        />
      </div>

      {/* Timeline Workflow - boxes above the line */}
      <div className="relative flex flex-col items-center">
        {/* Step Boxes above the line - horizontally scrollable on mobile */}
        <div className="flex w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200 justify-between items-end z-10 mb-6 gap-2 sm:gap-0 px-1 sm:px-0"
             style={{ WebkitOverflowScrolling: 'touch' }}>
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              className={`flex flex-col items-center min-w-[7rem] sm:w-32 transition-all duration-300 relative ${getStepOpacity(step)}`}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Hover Card - appears above the step */}
              {hoveredStep === step.id && (
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white p-3 rounded-lg shadow-xl z-50 min-w-48 text-center animate-fade-in">
                  <div className="text-sm font-semibold mb-1">{step.title.replace('\n', ' ')}</div>
                  <div className="text-xs text-slate-300 mb-2">
                    Roles: {step.roles.map(role => capitalizeRole(role)).join(', ')}
                  </div>
                  {step.isQAB && (
                    <div className="text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold">
                      QAB Checkpoint
                    </div>
                  )}
                  {step.hasETR && (
                    <div className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold mt-1">
                      {step.etrType === 'required' ? 'ETR Required' : 'ETR Check/Update'}
                    </div>
                  )}
                  {step.actionButton && (
                    <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-1">
                      Action: {step.actionButton}
                    </div>
                  )}
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              )}

              {/* Step Box */}
              <button
                onClick={() => handleStepClick(step.id)}
                className={`bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-300 rounded-xl px-2 py-2 sm:px-4 sm:py-3 text-center text-[0.7rem] sm:text-xs font-bold whitespace-pre-line shadow-lg mb-2 transition-all duration-300 hover:shadow-xl hover:scale-110 transform hover:border-red-400 hover:from-red-50 hover:to-red-100 ${
                  hoveredStep === step.id ? 'bg-gradient-to-br from-red-100 to-red-200 border-red-500 shadow-xl scale-110 text-red-800' : 'text-slate-800'
                }`}
              >
                {step.title}
              </button>
              
              {/* QAB marker */}
              {step.isQAB && (
                <div className="mt-2 flex flex-col items-center">
                  <div className={`bg-gradient-to-br from-red-500 to-red-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-white text-lg border-2 border-red-700 shadow-lg transition-all duration-300 hover:shadow-red-500/50 ${
                    hoveredStep === step.id ? 'scale-125 shadow-red-500/50' : ''
                  }`}>
                    QAB
                  </div>
                  <div className="h-4" />
                </div>
              )}

              {/* ETR marker - placed below steps without QAB, or below QAB if both exist */}
              {step.hasETR && (
                <div className={`${step.isQAB ? '' : 'mt-2'} flex flex-col items-center`}>
                  <div className={`bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full w-12 h-12 flex items-center justify-center font-bold text-black text-lg border-2 border-yellow-600 shadow-lg transition-all duration-300 hover:shadow-yellow-500/50 ${
                    hoveredStep === step.id ? 'scale-125 shadow-yellow-500/50' : ''
                  }`}>
                    ETR
                  </div>
                  <div className="h-4" />
                </div>
              )}
              
              {/* Action Button */}
              {step.actionButton && (
                <button 
                  onClick={() => console.log(`Action: ${step.actionButton} for ${step.id}`)}
                  className={`bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg mt-2 transition-all duration-300 hover:from-slate-800 hover:to-slate-900 hover:scale-105 border border-slate-600 hover:shadow-xl ${
                    hoveredStep === step.id ? 'from-slate-800 to-slate-900 scale-105 shadow-xl' : ''
                  }`}
                >
                  {step.actionButton}
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Timeline Line */}
        <div className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full z-0 relative shadow-inner min-w-[600px] sm:min-w-0">
          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-transparent rounded-full transition-all duration-500 shadow-lg opacity-50" style={{width: '30%'}} />
        </div>
        
        {/* Timeline Labels - positioned 15% lower */}
        <div className="flex w-full justify-between text-slate-700 font-bold text-xs sm:text-sm" style={{ marginTop: '1%' }}>
          <span className="bg-slate-200 px-2 py-1 rounded-full shadow ml-4 sm:ml-20">Triage Time Begins</span>
          <span className="bg-slate-200 px-2 py-1 rounded-full shadow mr-4 sm:mr-0">Dwell Time Ends</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 sm:p-8 flex-1 flex flex-col justify-center items-center shadow-2xl border border-red-700">
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">Kenworth Goals</h3>
          <div className="text-red-100 font-bold text-base sm:text-xl mb-1 sm:mb-2">Triage: 2 Hours or less</div>
          <div className="text-red-100 font-bold text-base sm:text-xl">Dwell: 3 Days or less</div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-3 sm:p-6 shadow-xl border border-slate-300">
          <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 text-slate-800 border-b border-slate-400 pb-1 sm:pb-2">Remember Every Case Needs:</h3>
          <ul className="list-none text-slate-700 text-xs sm:text-sm grid grid-cols-1 md:grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2">
            <li className="flex items-center space-x-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span>Primary Email Contact</span></li>
            <li className="flex items-center space-x-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span>Follow Up Time</span></li>
            <li className="flex items-center space-x-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span>Case-Level Complaint</span></li>
            <li className="flex items-center space-x-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span>Accurate Estimate Approvals</span></li>
            <li className="flex items-center space-x-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span>Quick Action Button Usage</span></li>
            <li className="flex items-center space-x-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span>Every Case Updated Twice Daily</span></li>
            <li className="flex items-center space-x-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span>ETR- Estimated Time to Repair Populated and Maintained</span></li>
            <li className="flex items-center space-x-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span>Export and Repair Order # from DBS</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
