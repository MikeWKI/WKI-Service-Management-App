import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, User, Wrench, FileText, DollarSign, Truck } from 'lucide-react';

interface Step {
  title: string;
  id: string;
  roles: string[];
  isQAB?: boolean;
  actionButton?: string;
  phase: string;
  description?: string;
}

interface RoleFilter {
  id: string;
  name: string;
}

const comprehensiveSteps: Step[] = [
  // CHECK-IN PHASE
  { title: "Case Created\n& Truck Arrives Onsite", id: "case-created", roles: ["service-advisor"], isQAB: true, actionButton: "CHECK-IN", phase: "check-in", description: "Initial case creation and truck arrival" },
  { title: "Create RO\nfrom Decisiv Case", id: "create-ro", roles: ["service-advisor"], phase: "check-in", description: "Generate repair order from Decisiv case details" },
  { title: "Initial Vehicle\nInspection", id: "initial-inspection", roles: ["service-advisor", "technician"], phase: "check-in", description: "Complete preliminary vehicle assessment" },
  { title: "Update Case\nwith Lines & Parts", id: "update-case", roles: ["service-advisor", "parts-staff", "technician"], phase: "check-in", description: "Add repair lines and parts to case - technicians request line additions, coordinate with foremen and parts staff" },
  
  // DIAGNOSE PHASE
  { title: "Detailed\nDiagnostic", id: "diagnostic", roles: ["technician"], phase: "diagnose", description: "Comprehensive system diagnostics" },
  { title: "Root Cause\nAnalysis", id: "root-cause", roles: ["technician"], phase: "diagnose", description: "Identify underlying issues" },
  { title: "Create Initial\nEstimate", id: "create-estimate", roles: ["service-advisor"], phase: "diagnose", description: "Generate cost estimate" },
  { title: "Send Initial\nEstimate to Customer", id: "send-estimate", roles: ["service-advisor"], phase: "diagnose", description: "Customer estimate approval request" },
  { title: "Customer Approves\nEstimate", id: "approve-estimate", roles: ["service-advisor"], isQAB: true, actionButton: "REQUEST APPROVAL", phase: "diagnose", description: "Customer authorization received" },
  
  // REPAIR PHASE
  { title: "Parts Availability\nCheck", id: "parts-check", roles: ["parts-staff"], phase: "repair", description: "Verify parts inventory" },
  { title: "Parts Picked or\nOrdered for RO", id: "parts-picked", roles: ["parts-staff"], phase: "repair", description: "Parts procurement process" },
  { title: "Work Assignment\n& Scheduling", id: "work-assignment", roles: ["service-advisor", "technician"], phase: "repair", description: "Assign technician and schedule work" },
  { title: "Repair Work\nIn Process", id: "repair-process", roles: ["technician"], phase: "repair", description: "Active repair operations" },
  { title: "Quality Control\nInspection", id: "qc-inspection", roles: ["technician"], phase: "repair", description: "Post-repair quality check" },
  { title: "Additional Work\nApproval (if needed)", id: "additional-work", roles: ["service-advisor"], phase: "repair", description: "Customer approval for extra work" },
  { title: "Final Repair\nVerification", id: "final-verification", roles: ["technician"], phase: "repair", description: "Confirm all repairs complete" },
  { title: "Technician Story\nWrite Up", id: "tech-writeup", roles: ["technician"], phase: "repair", description: "Document repair details" },
  
  // CLOSE OUT PHASE
  { title: "Service Advisor\nAdmin Work", id: "admin-work", roles: ["service-advisor"], phase: "closeout", description: "Administrative tasks and documentation" },
  { title: "Warranty Processing\n(if applicable)", id: "warranty-process", roles: ["service-clerk"], phase: "closeout", description: "Process warranty claims" },
  { title: "Final Invoice\nPreparation", id: "invoice-prep", roles: ["service-advisor"], phase: "closeout", description: "Prepare customer invoice" },
  { title: "Customer\nNotification", id: "notify-customer", roles: ["service-advisor"], phase: "closeout", description: "Notify customer repair complete" },
  { title: "Invoice\nCustomer", id: "invoice-customer", roles: ["service-advisor", "service-clerk"], phase: "closeout", description: "Send final invoice" },
  { title: "Payment\nProcessing", id: "payment", roles: ["service-advisor"], phase: "closeout", description: "Process customer payment" },
  { title: "Final Walk-Around\n& Documentation", id: "final-walkaround", roles: ["service-advisor"], phase: "closeout", description: "Complete final inspection" },
  { title: "Truck Departs\nService Location", id: "truck-departs", roles: ["service-advisor"], isQAB: true, actionButton: "ASSET READY", phase: "closeout", description: "Vehicle ready for departure" },
];

const roleFilters: RoleFilter[] = [
  { id: 'all', name: 'All Roles' },
  { id: 'service-advisor', name: 'Service Advisors' },
  { id: 'parts-staff', name: 'Parts Staff' },
  { id: 'technician', name: 'Foremen/Technicians' },
  { id: 'service-clerk', name: 'Service Clerk' }
];

const phaseColors: Record<string, string> = {
  'check-in': 'from-blue-500 to-blue-600',
  'diagnose': 'from-orange-500 to-orange-600',
  'repair': 'from-green-500 to-green-600',
  'closeout': 'from-purple-500 to-purple-600'
};

const phaseIcons: Record<string, React.ComponentType<any>> = {
  'check-in': CheckCircle,
  'diagnose': AlertCircle,
  'repair': Wrench,
  'closeout': Truck
};

export default function ComprehensiveWorkflow() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const capitalizeRole = (role: string) => {
    return role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStepOpacity = (step: Step) => {
    if (activeFilter === 'all') return 'opacity-100';
    return step.roles.includes(activeFilter) ? 'opacity-100' : 'opacity-30';
  };

  const getPhaseSteps = (phase: string) => {
    return comprehensiveSteps.filter(step => step.phase === phase);
  };

  const phases = ['check-in', 'diagnose', 'repair', 'closeout'];
  const phaseNames: Record<string, string> = {
    'check-in': 'Check-In',
    'diagnose': 'Diagnose',
    'repair': 'Repair',
    'closeout': 'Close Out'
  };

  return (
    <div className="w-full max-w-7xl bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-2xl border border-slate-200 p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Comprehensive Service Management Workflow</h1>
          <p className="text-red-100 font-semibold text-lg">Detailed Process Flow for Complete Service Operations</p>
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

      {/* Filter by Role */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center bg-slate-800 rounded-xl p-4 shadow-lg">
        <span className="text-slate-300 font-semibold mr-2 self-center">Filter by Role:</span>
        {roleFilters.map(role => (
          <button
            key={role.id}
            onClick={() => setActiveFilter(role.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
              activeFilter === role.id 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25' 
                : 'bg-slate-600 text-slate-200 hover:bg-slate-500 border border-slate-500'
            }`}
          >
            {role.name}
          </button>
        ))}
      </div>

      {/* Phase-based Workflow */}
      <div className="space-y-12">
        {phases.map((phase) => {
          const PhaseIcon = phaseIcons[phase];
          const phaseSteps = getPhaseSteps(phase);
          
          return (
            <div key={phase} className="relative">
              {/* Phase Header */}
              <div className={`bg-gradient-to-r ${phaseColors[phase]} rounded-xl p-4 mb-6 shadow-lg`}>
                <div className="flex items-center gap-3 text-white">
                  <PhaseIcon size={28} />
                  <h2 className="text-2xl font-bold">{phaseNames[phase]} Phase</h2>
                  <div className="ml-auto text-sm bg-white/20 px-3 py-1 rounded-full">
                    {phaseSteps.length} steps
                  </div>
                </div>
              </div>

              {/* Phase Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {phaseSteps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <div 
                      className={`bg-white rounded-xl p-4 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${getStepOpacity(step)} ${
                        hoveredStep === step.id ? 'border-red-400 transform scale-105' : 'border-slate-200'
                      }`}
                      onMouseEnter={() => setHoveredStep(step.id)}
                      onMouseLeave={() => setHoveredStep(null)}
                    >
                      {/* Step Content */}
                      <div className="text-center">
                        <div className="text-sm font-bold text-slate-800 mb-2 leading-tight">
                          {step.title}
                        </div>
                        {step.description && (
                          <div className="text-xs text-slate-600 mb-3 leading-relaxed">
                            {step.description}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 mb-3">
                          <div className="text-xs text-slate-600 font-semibold mb-1">Role Responsible:</div>
                          {step.roles.map(role => (
                            <span key={role} className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded mr-1 mb-1">
                              {capitalizeRole(role)}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* QAB marker */}
                      {step.isQAB && (
                        <div className="absolute -top-3 -right-3">
                          <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
                            QAB
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {step.actionButton && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg">
                            {step.actionButton}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Connection Line to Next Step */}
                    {index < phaseSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-300 transform -translate-y-1/2 z-10"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Connection to Next Phase */}
              {phase !== 'closeout' && (
                <div className="flex justify-center my-8">
                  <div className="bg-slate-400 w-1 h-12 rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">Workflow Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{comprehensiveSteps.length}</div>
            <div className="text-sm text-slate-300">Total Steps</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{comprehensiveSteps.filter(s => s.isQAB).length}</div>
            <div className="text-sm text-slate-300">QAB Checkpoints</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{phases.length}</div>
            <div className="text-sm text-slate-300">Process Phases</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{roleFilters.length - 1}</div>
            <div className="text-sm text-slate-300">Role Types</div>
          </div>
        </div>
      </div>
    </div>
  );
}
