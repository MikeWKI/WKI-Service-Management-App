class ServiceCase {
  constructor({
    id,
    truckId,
    customerName,
    complaint,
    serviceAdvisor,
    assignedTechnician = null,
    currentStep = 'case-created',
    status = 'active',
    estimatedRepairTime = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id;
    this.truckId = truckId;
    this.customerName = customerName;
    this.complaint = complaint;
    this.serviceAdvisor = serviceAdvisor;
    this.assignedTechnician = assignedTechnician;
    this.currentStep = currentStep;
    this.status = status;
    this.estimatedRepairTime = estimatedRepairTime;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.stepHistory = [];
    this.notes = [];
  }

  updateStep(newStep, userId, notes = '') {
    this.stepHistory.push({
      fromStep: this.currentStep,
      toStep: newStep,
      timestamp: new Date().toISOString(),
      userId,
      notes
    });
    
    this.currentStep = newStep;
    this.updatedAt = new Date().toISOString();
    
    if (notes) {
      this.addNote(notes, userId);
    }
  }

  addNote(note, userId) {
    this.notes.push({
      id: Date.now().toString(),
      content: note,
      userId,
      timestamp: new Date().toISOString()
    });
    this.updatedAt = new Date().toISOString();
  }

  calculateTimeInStep() {
    if (this.stepHistory.length === 0) {
      return Date.now() - new Date(this.createdAt).getTime();
    }
    
    const lastStepChange = this.stepHistory[this.stepHistory.length - 1];
    return Date.now() - new Date(lastStepChange.timestamp).getTime();
  }

  getTriageTime() {
    // Time from case creation to first approval (step 4)
    const approvalStep = this.stepHistory.find(h => h.toStep === 'approve-estimate');
    if (!approvalStep) return null;
    
    return new Date(approvalStep.timestamp).getTime() - new Date(this.createdAt).getTime();
  }

  getDwellTime() {
    // Time from case creation to completion
    const completionStep = this.stepHistory.find(h => h.toStep === 'truck-departs');
    if (!completionStep) return null;
    
    return new Date(completionStep.timestamp).getTime() - new Date(this.createdAt).getTime();
  }

  toJSON() {
    return {
      id: this.id,
      truckId: this.truckId,
      customerName: this.customerName,
      complaint: this.complaint,
      serviceAdvisor: this.serviceAdvisor,
      assignedTechnician: this.assignedTechnician,
      currentStep: this.currentStep,
      status: this.status,
      estimatedRepairTime: this.estimatedRepairTime,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      stepHistory: this.stepHistory,
      notes: this.notes,
      timeInCurrentStep: this.calculateTimeInStep(),
      triageTime: this.getTriageTime(),
      dwellTime: this.getDwellTime()
    };
  }
}

module.exports = ServiceCase;
