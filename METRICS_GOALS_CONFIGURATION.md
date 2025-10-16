# Metrics Goals Configuration

## Overview
This document defines the goals and color-coding thresholds for all service metrics in the WKI Service Management App.

## Quick Reference Table

| Metric | Goal | Green | Orange | Red | Type |
|--------|------|-------|--------|-----|------|
| VSC Case Requirements | ≥ 95% | ≥ 95% | 80-94% | < 80% | % ↑ |
| VSC Closed Correctly | ≥ 95% | ≥ 95% | 80-94% | < 80% | % ↑ |
| TT+ Activation | ≥ 95% | ≥ 95% | 80-94% | < 80% | % ↑ |
| SM Monthly Dwell Avg | ≤ 3.0 days | ≤ 3.0 | 3.1-5.0 | > 5.0 | Days ↓ |
| SM YTD Dwell Avg | ≤ 3.0 days | ≤ 3.0 | 3.1-5.0 | > 5.0 | Days ↓ |
| Triage % < 4 Hours | ≥ 95% | ≥ 95% | 80-94% | < 80% | % ↑ |
| SM Avg Triage Hours | ≤ 2.0 hrs | ≤ 2.0 | 2.1-3.0 | > 3.0 | Hours ↓ |
| ETR % of Cases | 100% | ≥ 95% | 80-94% | < 80% | % ↑ |
| % Cases with 3+ Notes | 100% | ≥ 95% | 80-94% | < 80% | % ↑ |
| RDS Monthly Avg Days | ≤ 3.0 days | ≤ 3.0 | 3.1-5.0 | > 5.0 | Days ↓ |
| RDS YTD Dwell Avg | ≤ 3.0 days | ≤ 3.0 | 3.1-5.0 | > 5.0 | Days ↓ |

**Legend**: ↑ = Higher is Better | ↓ = Lower is Better

## Color-Coding Legend
- 🟢 **Green**: Meeting or exceeding goal (good performance)
- 🟠 **Orange**: Approaching goal threshold (needs attention)
- 🔴 **Red**: Not meeting goal (requires immediate action)

---

## Metrics Configuration

### 1. VSC Case Requirements
- **Goal**: ≥ 95%
- **Type**: Percentage
- **Color Coding**:
  - 🟢 Green: ≥ 95%
  - 🟠 Orange: 80% - 94%
  - 🔴 Red: < 80%
- **Description**: Percentage of VSC case requirements met
- **Impact**: Service case compliance metric

### 2. VSC Closed Correctly
- **Goal**: ≥ 95%
- **Type**: Percentage
- **Color Coding**:
  - 🟢 Green: ≥ 95%
  - 🟠 Orange: 80% - 94%
  - 🔴 Red: < 80%
- **Description**: Percentage of VSC cases closed correctly
- **Impact**: Case closure accuracy metric

### 3. TT+ Activation
- **Goal**: ≥ 95%
- **Type**: Percentage
- **Color Coding**:
  - 🟢 Green: ≥ 95%
  - 🟠 Orange: 80% - 94%
  - 🔴 Red: < 80%
- **Description**: TruckTech+ activation rate
- **Impact**: Technology activation compliance

### 4. SM Monthly Dwell Average
- **Goal**: ≤ 3.0 days
- **Type**: Days (Lower is better)
- **Color Coding**:
  - 🟢 Green: ≤ 3.0 days
  - 🟠 Orange: 3.1 - 5.0 days
  - 🔴 Red: > 5.0 days
- **Description**: Average dwell time managed by service manager
- **Impact**: Workflow efficiency and customer wait times

### 5. SM YTD Dwell Average Days
- **Goal**: ≤ 3.0 days
- **Type**: Days (Lower is better)
- **Color Coding**:
  - 🟢 Green: ≤ 3.0 days
  - 🟠 Orange: 3.1 - 5.0 days
  - 🔴 Red: > 5.0 days
- **Description**: Year-to-date average dwell time
- **Impact**: Service manager year-to-date performance

### 6. Triage % of Cases <4 Hours
- **Goal**: ≥ 95%
- **Type**: Percentage
- **Color Coding**:
  - 🟢 Green: ≥ 95%
  - 🟠 Orange: 80% - 94%
  - 🔴 Red: < 80%
- **Description**: Percentage of cases triaged within 4 hours
- **Impact**: Quick triage performance

### 7. SM Average Triage Hours
- **Goal**: ≤ 2.0 hours
- **Type**: Hours (Lower is better)
- **Color Coding**:
  - 🟢 Green: ≤ 2.0 hours
  - 🟠 Orange: 2.1 - 3.0 hours
  - 🔴 Red: > 3.0 hours
- **Description**: Time to complete initial triage assessment
- **Impact**: Initial assessment efficiency

### 8. ETR % of Cases
- **Goal**: 100%
- **Type**: Percentage
- **Color Coding**:
  - 🟢 Green: ≥ 95%
  - 🟠 Orange: 80% - 94%
  - 🔴 Red: < 80%
- **Description**: Estimated Time of Repair provided for cases
- **Impact**: ETR compliance - must provide estimated repair time for all cases

### 9. % Cases with 3+ Notes
- **Goal**: 100%
- **Type**: Percentage (Higher is better)
- **Color Coding**:
  - 🟢 Green: ≥ 95%
  - 🟠 Orange: 80% - 94%
  - 🔴 Red: < 80%
- **Description**: Percentage of cases with required 3+ notes
- **Impact**: PACCAR requires at least 3 notes on every case for compliance

### 10. RDS Monthly Average Days
- **Goal**: ≤ 3.0 days
- **Type**: Days (Lower is better)
- **Color Coding**:
  - 🟢 Green: ≤ 3.0 days
  - 🟠 Orange: 3.1 - 5.0 days
  - 🔴 Red: > 5.0 days
- **Description**: RDS monthly average dwell time
- **Impact**: RDS operational efficiency

### 11. RDS YTD Dwell Average Days
- **Goal**: ≤ 3.0 days
- **Type**: Days (Lower is better)
- **Color Coding**:
  - 🟢 Green: ≤ 3.0 days
  - 🟠 Orange: 3.1 - 5.0 days
  - 🔴 Red: > 5.0 days
- **Description**: Year-to-date RDS dwell performance
- **Impact**: RDS year-to-date dwell performance

---

## Implementation Files

### Frontend Components
The following files use these goals for visual status indicators:

1. **LocationMetrics.tsx** (`frontend/src/components/LocationMetrics.tsx`)
   - Lines 261-330: Metric definitions with targets
   - Displays location-specific scorecard metrics

2. **LocationSpecificMetrics.tsx** (`frontend/src/components/LocationSpecificMetrics.tsx`)
   - Lines 97-110: Metric mapping
   - Lines 214-770: Card generation with status parsing
   - Handles individual location metric displays

3. **ServiceAdvisorMetrics.tsx** (`frontend/src/components/ServiceAdvisorMetrics.tsx`)
   - Lines 147+: Service advisor-specific metric groupings

4. **TechnicianMetrics.tsx**, **PartsStaffMetrics.tsx**
   - Role-specific metric views

### Backend Routes
**locationMetrics.js** (`backend/src/routes/locationMetrics.js`)
- Provides metric data to frontend
- Contains fallback/mock data for testing

### Status Parsing Functions
Located in `LocationSpecificMetrics.tsx`:

```typescript
// VSC metrics (percentage, higher is better) - Goal: ≥ 95%
parseVscStatus(value) {
  if (value >= 95) return 'good'      // Green
  if (value >= 80) return 'warning'   // Orange
  return 'critical'                    // Red
}

// ETR metric (percentage, higher is better) - Goal: 100%
parseEtrStatus(value) {
  if (value >= 95) return 'good'      // Green
  if (value >= 80) return 'warning'   // Orange
  return 'critical'                    // Red
}

// Triage hours (lower is better) - Goal: ≤ 2.0 hours
parseTriageStatus(value) {
  if (value <= 2.0) return 'good'     // Green
  if (value <= 3.0) return 'warning'  // Orange
  return 'critical'                    // Red
}

// Notes metric (percentage, higher is better) - Goal: 100%
parseNotesStatus(value) {
  if (value >= 95) return 'good'      // Green
  if (value >= 80) return 'warning'   // Orange
  return 'critical'                    // Red
}

// Dwell time metrics (days, lower is better) - Goal: ≤ 3.0 days
parseDwellStatus(value) {
  if (value <= 3.0) return 'good'     // Green
  if (value <= 5.0) return 'warning'  // Orange
  return 'critical'                    // Red
}

// RDS metrics (days, lower is better) - Goal: ≤ 3.0 days
parseRdsStatus(value) {
  if (value <= 3.0) return 'good'     // Green
  if (value <= 5.0) return 'warning'  // Orange
  return 'critical'                    // Red
}
```

---

## Metric Types Summary

### Percentage Metrics (Higher is Better)
- VSC Case Requirements (Goal: ≥ 95%)
- VSC Closed Correctly (Goal: ≥ 95%)
- TT+ Activation (Goal: ≥ 95%)
- Triage % < 4 Hours (Goal: ≥ 95%)
- **ETR % of Cases (Goal: 100%)** - Must provide ETR for all cases
- **% Cases with 3+ Notes (Goal: 100%)** - PACCAR compliance requirement

### Time Metrics (Lower is Better)
- SM Monthly Dwell Avg (Goal: ≤ 3.0 days)
- SM YTD Dwell Avg Days (Goal: ≤ 3.0 days)
- SM Average Triage Hours (Goal: ≤ 2.0 hours)
- RDS Monthly Avg Days (Goal: ≤ 3.0 days)
- RDS YTD Dwell Avg Days (Goal: ≤ 3.0 days)

---

## Notes

### Consistent Color Coding
All metrics use a three-tier color system:
- **Green (Success)**: Meeting or exceeding goals
- **Orange (Warning)**: Approaching threshold, needs attention
- **Red (Danger)**: Not meeting goals, requires immediate action

### Metric Calculations
- Percentage values are stored and displayed with '%' symbol
- Time values are stored as numbers and displayed with appropriate units (days/hours)
- Values of 'N/A' are displayed when data is unavailable

### Data Sources
- Primary: Monthly W370 Service Scorecard PDFs
- Backup: Database historical records
- Fallback: Location-specific hardcoded values for testing

---

## Recent Updates
- **Last Updated**: Current configuration
- **Status**: All goals verified and consistent across frontend components
- **Validation**: Color coding logic implemented consistently in all metric displays

## Verification Checklist
- ✅ All 11 metrics have defined goals
- ✅ Color coding thresholds are consistent
- ✅ Status parsing functions match target goals
- ✅ Frontend components use consistent target displays
- ✅ Backend pr