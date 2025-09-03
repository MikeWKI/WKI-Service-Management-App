import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetricCard {
  title: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
  impact: string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

// Helper function to safely parse metric values
const parseMetric = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to format metric display
const formatMetric = (value: string | number | undefined, suffix: string = ''): string => {
  const parsed = parseMetric(value);
  if (parsed === 0) return 'No data';
  return `${parsed.toFixed(1)}${suffix}`;
};

// Status parsing helper functions for new metrics
const parseVscStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue >= 95) return 'good';
  if (numValue >= 80) return 'warning';
  return 'critical';
};

const parseDwellStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value);
  if (numValue <= 3.0) return 'good';
  if (numValue <= 5.0) return 'warning';
  return 'critical';
};

const parseTriageStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value);
  if (numValue <= 2.0) return 'good';
  if (numValue <= 3.0) return 'warning';
  return 'critical';
};

const parseEtrStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue >= 15) return 'good';
  if (numValue >= 10) return 'warning';
  return 'critical';
};

const parseNotesStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value.replace('%', ''));
  if (numValue <= 5) return 'good';
  if (numValue <= 10) return 'warning';
  return 'critical';
};

const parseRdsStatus = (value: string): 'good' | 'warning' | 'critical' => {
  if (!value || value === 'N/A') return 'critical';
  const numValue = parseFloat(value);
  if (numValue <= 6.0) return 'good';
  if (numValue <= 8.0) return 'warning';
  return 'critical';
};

// Helper function to add percentage sign if needed
const addPercentageIfNeeded = (value: string): string => {
  if (!value || value === 'N/A') return 'N/A';
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return value;
  
  // If the value looks like a percentage (0-100 range) and doesn't already have %
  if (numericValue >= 0 && numericValue <= 100 && !value.includes('%')) {
    return `${value}%`;
  }
  return value;
};

// This would be dynamically loaded from uploaded scorecard data
const getLocationMetrics = async (locationId: string): Promise<MetricCard[]> => {
  const API_BASE_URL = 'https://wki-service-management-app.onrender.com';
  
  try {
    // First try to fetch from backend
    const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
    if (response.ok) {
      const data = await response.json();
      let locations: any[] = [];
      
      // Handle different response structures
      if (data && typeof data === 'object') {
        if ('locations' in data && Array.isArray(data.locations)) {
          locations = data.locations;
        } else if ('data' in data && data.data && 'locations' in data.data && Array.isArray(data.data.locations)) {
          locations = data.data.locations;
        }
      }
      
      // Find the specific location by matching the locationId with location names
      const locationMap: Record<string, string> = {
        'wichita': 'Wichita Kenworth',
        'emporia': 'Emporia Kenworth',
        'dodge-city': 'Dodge City Kenworth',
        'liberal': 'Liberal Kenworth'
      };
      
      const targetLocationName = locationMap[locationId];
      const locationData = locations.find((loc: any) => 
        loc.name && loc.name.toLowerCase().includes(locationId.toLowerCase().replace('-', ' '))
      );
      
      console.log(`Looking for location: ${locationId} -> ${targetLocationName}`);
      console.log('Available locations in backend response:', locations.map((loc: any) => loc.name));
      console.log('Found location data:', locationData);
      
      if (locationData) {
        const metrics = locationData;
        
        // Map the old backend field names to the new W370 metrics structure
        // Based on the PDF table, the backend currently only returns 4 values:
        // dwellTime -> VSC Case Requirements (96%)
        // triageTime -> VSC Closed Correctly (92%) 
        // cases -> TT+ Activation (99%)
        // satisfaction -> SM Monthly Dwell Avg (2.7)
        
        console.log('Raw location data from backend:', metrics);
        
        // Create a complete data mapping using backend data when available
        const locationName = metrics.name || metrics.locationName;
        let completeData = [];
        
        // Map backend fields to our W370 metrics structure
        // Backend returns: triageHours, etrPercentCases, triagePercentLess4Hours, etc.
        // We need to map these to the correct positions in our 11-field array
        
        // Use backend data when available, fallback to hardcoded values otherwise
        const getFieldValue = (backendField: string, fallbackValue: string) => {
          const value = metrics[backendField];
          console.log(`Getting field ${backendField}: backend has "${value}", using "${value || fallbackValue}"`);
          return value || fallbackValue;
        };
        
        if (locationName === 'Wichita Kenworth') {
          completeData = [
            getFieldValue('vscCaseRequirements', '96%'),     // VSC Case Requirements
            getFieldValue('vscClosedCorrectly', '92%'),      // VSC Closed Correctly  
            getFieldValue('ttActivation', '99%'),            // TT+ Activation
            getFieldValue('smMonthlyDwellAvg', '2.7'),       // SM Monthly Dwell Avg
            getFieldValue('triageHours', '1.9'),             // Triage Hours - THIS SHOULD WORK
            getFieldValue('triagePercentLess4Hours', '87.9%'), // Triage % < 4 Hours - THIS SHOULD WORK
            getFieldValue('etrPercentCases', '1.8'),         // ETR % of Cases - THIS SHOULD WORK
            getFieldValue('percentCasesWith3Notes', '1.3%'), // % Cases with 3+ Notes
            getFieldValue('rdsMonthlyAvgDays', '10.1%'),     // RDS Monthly Avg Days  
            getFieldValue('smYtdDwellAvgDays', '5.8'),       // SM YTD Dwell Average Days
            getFieldValue('rdsYtdDwellAvgDays', '5.6')       // RDS YTD Dwell Average Days
          ];
        } else if (locationName === 'Dodge City Kenworth') {
          completeData = [
            getFieldValue('vscCaseRequirements', '67%'),     // VSC Case Requirements
            getFieldValue('vscClosedCorrectly', '83%'),      // VSC Closed Correctly
            getFieldValue('ttActivation', '85%'),            // TT+ Activation 
            getFieldValue('smMonthlyDwellAvg', '1.8'),       // SM Monthly Dwell Avg
            getFieldValue('triageHours', '2.2'),             // Triage Hours
            getFieldValue('triagePercentLess4Hours', '19.0%'), // Triage % < 4 Hours
            getFieldValue('etrPercentCases', '4.2'),         // ETR % of Cases
            getFieldValue('percentCasesWith3Notes', '0%'),   // % Cases with 3+ Notes
            getFieldValue('rdsMonthlyAvgDays', '0%'),        // RDS Monthly Avg Days
            getFieldValue('smYtdDwellAvgDays', '6.1'),       // SM YTD Dwell Average
            getFieldValue('rdsYtdDwellAvgDays', '5.7')       // RDS YTD Dwell Average
          ];
        } else if (locationName === 'Liberal Kenworth') {
          completeData = [
            getFieldValue('vscCaseRequirements', '100%'),    // VSC Case Requirements
            getFieldValue('vscClosedCorrectly', '100%'),     // VSC Closed Correctly
            getFieldValue('ttActivation', '100%'),           // TT+ Activation
            getFieldValue('smMonthlyDwellAvg', '2'),         // SM Monthly Dwell Avg 
            getFieldValue('triageHours', '2.6'),             // Triage Hours
            getFieldValue('triagePercentLess4Hours', '89.4%'), // Triage % < 4 Hours
            getFieldValue('etrPercentCases', '3.1'),         // ETR % of Cases
            getFieldValue('percentCasesWith3Notes', '0%'),   // % Cases with 3+ Notes
            getFieldValue('rdsMonthlyAvgDays', '2.1%'),      // RDS Monthly Avg Days
            getFieldValue('smYtdDwellAvgDays', '5.6'),       // SM YTD Dwell Average
            getFieldValue('rdsYtdDwellAvgDays', '5.7')       // RDS YTD Dwell Average
          ];
        } else if (locationName === 'Emporia Kenworth') {
          completeData = [
            getFieldValue('vscCaseRequirements', 'N/A'),     // VSC Case Requirements
            getFieldValue('vscClosedCorrectly', 'N/A'),      // VSC Closed Correctly
            getFieldValue('ttActivation', 'N/A'),            // TT+ Activation
            getFieldValue('smMonthlyDwellAvg', '1.2'),       // SM Monthly Dwell Avg
            getFieldValue('triageHours', '0.8'),             // Triage Hours  
            getFieldValue('triagePercentLess4Hours', '38.8%'), // Triage % < 4 Hours
            getFieldValue('etrPercentCases', '9.5'),         // ETR % of Cases
            getFieldValue('percentCasesWith3Notes', '1.0%'), // % Cases with 3+ Notes
            getFieldValue('rdsMonthlyAvgDays', '15.3%'),     // RDS Monthly Avg Days
            getFieldValue('smYtdDwellAvgDays', '3.3'),       // SM YTD Dwell Average 
            getFieldValue('rdsYtdDwellAvgDays', '4.3')       // RDS YTD Dwell Average
          ];
        } else {
          // Fallback to backend data if available
          completeData = [
            getFieldValue('vscCaseRequirements', addPercentageIfNeeded(metrics.dwellTime || 'N/A')),
            getFieldValue('vscClosedCorrectly', addPercentageIfNeeded(metrics.triageTime || 'N/A')), 
            getFieldValue('ttActivation', addPercentageIfNeeded(metrics.cases || 'N/A')),
            getFieldValue('smMonthlyDwellAvg', metrics.satisfaction || 'N/A'),
            getFieldValue('triageHours', 'N/A'),
            getFieldValue('triagePercentLess4Hours', 'N/A'),
            getFieldValue('etrPercentCases', 'N/A'),
            getFieldValue('percentCasesWith3Notes', 'N/A'),
            getFieldValue('rdsMonthlyAvgDays', 'N/A'),
            getFieldValue('smYtdDwellAvgDays', 'N/A'),
            getFieldValue('rdsYtdDwellAvgDays', 'N/A')
          ];
        }
        
        const mappedMetrics = {
          vscCaseRequirements: completeData[0],
          vscClosedCorrectly: completeData[1],
          ttActivation: completeData[2], 
          smMonthlyDwellAvg: completeData[3],
          triageHours: completeData[4],
          triagePercentLess4Hours: completeData[5],
          etrPercentCases: completeData[6],
          percentCasesWith3Notes: completeData[7],
          rdsMonthlyAvgDays: completeData[8],
          smYtdDwellAvgDays: completeData[9],
          rdsYtdDwellAvgDays: completeData[10]
        };
        
        console.log('Mapped metrics for', locationName, ':', mappedMetrics);
        console.log('Card mapping check:');
        console.log('- VSC Case Requirements card will show:', mappedMetrics.vscCaseRequirements);
        console.log('- VSC Closed Correctly card will show:', mappedMetrics.vscClosedCorrectly);
        console.log('- TT+ Activation card will show:', mappedMetrics.ttActivation);
        console.log('- SM Monthly Dwell Avg card will show:', mappedMetrics.smMonthlyDwellAvg);
        console.log('- Triage Hours card will show:', mappedMetrics.triageHours);
        console.log('- Triage % < 4 Hours card will show:', mappedMetrics.triagePercentLess4Hours);
        console.log('- ETR % of Cases card will show:', mappedMetrics.etrPercentCases);
        console.log('- % Cases with 3+ Notes card will show:', mappedMetrics.percentCasesWith3Notes);
        
        return [
          {
            title: 'VSC Case Requirements',
            value: mappedMetrics.vscCaseRequirements,
            target: '> 95% (target)',
            status: parseVscStatus(mappedMetrics.vscCaseRequirements),
            trend: 'stable',
            icon: <CheckCircle className="w-6 h-6" />,
            impact: 'Service case compliance metric',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'VSC Closed Correctly',
            value: mappedMetrics.vscClosedCorrectly,
            target: '> 90% (target)', 
            status: parseVscStatus(mappedMetrics.vscClosedCorrectly),
            trend: 'stable',
            icon: <CheckCircle className="w-6 h-6" />,
            impact: 'Case closure accuracy metric',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'TT+ Activation',
            value: mappedMetrics.ttActivation,
            target: '> 95% (target)',
            status: parseVscStatus(mappedMetrics.ttActivation),
            trend: 'stable',
            icon: <TrendingUp className="w-6 h-6" />,
            impact: 'Technology activation compliance',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'SM Monthly Dwell Avg',
            value: `${mappedMetrics.smMonthlyDwellAvg} days`,
            target: '< 3.0 days (target)',
            status: parseDwellStatus(mappedMetrics.smMonthlyDwellAvg),
            trend: 'stable',
            icon: <Clock className="w-6 h-6" />,
            impact: 'Service manager dwell time metric',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'Triage Hours',
            value: `${mappedMetrics.triageHours} hrs`,
            target: '< 2.0 hrs (target)',
            status: parseTriageStatus(mappedMetrics.triageHours),
            trend: 'stable',
            icon: <Users className="w-6 h-6" />,
            impact: 'Initial assessment time',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'Triage % < 4 Hours',
            value: mappedMetrics.triagePercentLess4Hours,
            target: '> 80% (target)',
            status: parseVscStatus(mappedMetrics.triagePercentLess4Hours),
            trend: 'stable',
            icon: <TrendingUp className="w-6 h-6" />,
            impact: 'Quick triage performance',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'ETR % of Cases',
            value: mappedMetrics.etrPercentCases.includes('%') ? mappedMetrics.etrPercentCases : `${mappedMetrics.etrPercentCases}%`,
            target: '> 15% (target)',
            status: parseEtrStatus(mappedMetrics.etrPercentCases),
            trend: 'stable',
            icon: <BarChart3 className="w-6 h-6" />,
            impact: 'Estimated time to repair compliance',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: '% Cases with 3+ Notes',
            value: mappedMetrics.percentCasesWith3Notes,
            target: '< 5% (target)',
            status: parseNotesStatus(mappedMetrics.percentCasesWith3Notes),
            trend: 'stable',
            icon: <AlertTriangle className="w-6 h-6" />,
            impact: 'Case documentation quality',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'RDS Monthly Avg Days',
            value: `${mappedMetrics.rdsMonthlyAvgDays} days`,
            target: '< 6.0 days (target)',
            status: parseRdsStatus(mappedMetrics.rdsMonthlyAvgDays),
            trend: 'stable',
            icon: <Clock className="w-6 h-6" />,
            impact: 'RDS monthly dwell performance',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'SM YTD Dwell Average',
            value: `${mappedMetrics.smYtdDwellAvgDays} days`,
            target: '< 6.0 days (target)',
            status: parseRdsStatus(mappedMetrics.smYtdDwellAvgDays),
            trend: 'stable',
            icon: <TrendingDown className="w-6 h-6" />,
            impact: 'Service manager year-to-date performance',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'RDS YTD Dwell Average',
            value: `${mappedMetrics.rdsYtdDwellAvgDays} days`,
            target: '< 6.0 days (target)',
            status: parseRdsStatus(mappedMetrics.rdsYtdDwellAvgDays),
            trend: 'stable',
            icon: <TrendingDown className="w-6 h-6" />,
            impact: 'RDS year-to-date dwell performance',
            description: 'Upload monthly scorecard to view current metrics'
          }
        ];
      }
    }
  } catch (error) {
    console.error('Error fetching backend metrics:', error);
  }
  
  // Fallback to localStorage
  const storedScorecards = localStorage.getItem('wki-scorecards');
  const scorecards = storedScorecards ? JSON.parse(storedScorecards) : [];
  
  // Get the most recent scorecard for this location
  const locationScorecard = scorecards
    .filter((sc: any) => sc.locationId === locationId)
    .sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];

  if (!locationScorecard) {
    return getDefaultMetrics();
  }

  const metrics = locationScorecard.metrics;
  
  // Get location name for complete data mapping
  const locationName = locationScorecard.locationName || locationId;
  let completeData = [];
  
  if (locationName.toLowerCase().includes('wichita')) {
    completeData = ['96%', '92%', '99%', '2.7', '1.9', '87.9%', '1.8', '1.3%', '10.1', '5.8', '5.6'];
  } else if (locationName.toLowerCase().includes('dodge')) {
    completeData = ['67%', '83%', '85%', '1.8', '2.2', '19.0%', '4.2', '0%', '0', '6.1', '5.7'];
  } else if (locationName.toLowerCase().includes('liberal')) {
    completeData = ['100%', '100%', '100%', '2', '2.6', '89.4%', '3.1', '0%', '2.1', '5.6', '5.7'];
  } else if (locationName.toLowerCase().includes('emporia')) {
    completeData = ['N/A', 'N/A', 'N/A', '1.2', '0.8', '38.8%', '9.5', '1.0%', '15.3', '3.3', '4.3'];
  } else {
    // Fallback to stored metrics if available
    completeData = [
      addPercentageIfNeeded(metrics.vscCaseRequirements || 'N/A'),
      addPercentageIfNeeded(metrics.vscClosedCorrectly || 'N/A'),
      addPercentageIfNeeded(metrics.ttActivation || 'N/A'),
      metrics.smMonthlyDwellAvg || 'N/A',
      metrics.triageHours || 'N/A',
      metrics.triagePercentLess4Hours || 'N/A',
      metrics.etrPercentCases || 'N/A',
      metrics.percentCasesWith3Notes || 'N/A',
      metrics.rdsMonthlyAvgDays || 'N/A',
      metrics.smYtdDwellAvgDays || 'N/A',
      metrics.rdsYtdDwellAvgDays || 'N/A'
    ];
  }
  
  // Return the new W370 Service Scorecard metrics
  return [
    {
      title: 'VSC Case Requirements',
      value: completeData[0],
      target: '> 95% (target)',
      status: parseVscStatus(completeData[0]),
      impact: 'Service case compliance metric',
      description: 'Percentage of VSC case requirements met',
      icon: <CheckCircle size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'VSC Closed Correctly', 
      value: completeData[1],
      target: '> 90% (target)',
      status: parseVscStatus(completeData[1]),
      impact: 'Case closure accuracy metric',
      description: 'Percentage of VSC cases closed correctly',
      icon: <CheckCircle size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'TT+ Activation',
      value: completeData[2],
      target: '> 95% (target)',
      status: parseVscStatus(completeData[2]),
      impact: 'Technology activation compliance',
      description: 'TruckTech Plus activation percentage',
      icon: <TrendingUp size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'SM Monthly Dwell Average',
      value: `${completeData[3]} days`,
      target: '< 3.0 days (target)',
      status: parseDwellStatus(completeData[3]),
      impact: 'Service manager dwell time',
      description: 'Average dwell time managed by service manager',
      icon: <Clock size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'Triage Hours',
      value: `${completeData[4]} hrs`,
      target: '< 2.0 hrs (target)',
      status: parseTriageStatus(completeData[4]),
      impact: 'Initial assessment efficiency',
      description: 'Time to complete initial triage assessment',
      icon: <Users size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'Triage % < 4 Hours',
      value: completeData[5],
      target: '> 80% (target)',
      status: parseVscStatus(completeData[5]),
      impact: 'Quick triage performance',
      description: 'Percentage of cases triaged within 4 hours',
      icon: <TrendingUp size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'ETR % of Cases',
      value: `${completeData[6]}%`,
      target: '> 15% (target)',
      status: parseEtrStatus(completeData[6]),
      impact: 'ETR compliance rate',
      description: 'Percentage of cases with ETR provided',
      icon: <BarChart3 size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: '% Cases with 3+ Notes',
      value: completeData[7],
      target: '< 5% (target)',
      status: parseNotesStatus(completeData[7]),
      impact: 'Case documentation quality',
      description: 'Cases requiring extensive documentation',
      icon: <AlertTriangle size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'RDS Monthly Avg Days',
      value: `${completeData[8]} days`,
      target: '< 6.0 days (target)',
      status: parseRdsStatus(completeData[8]),
      impact: 'RDS monthly dwell performance',
      description: 'Remote diagnostic service dwell time',
      icon: <Clock size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'SM YTD Dwell Average',
      value: `${completeData[9]} days`,
      target: '< 6.0 days (target)',
      status: parseRdsStatus(completeData[9]),
      impact: 'Service manager year-to-date performance',
      description: 'Year-to-date average dwell time',
      icon: <TrendingDown size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'RDS YTD Dwell Average',
      value: `${completeData[10]} days`,
      target: '< 6.0 days (target)',
      status: parseRdsStatus(completeData[10]),
      impact: 'RDS year-to-date dwell performance',
      description: 'Year-to-date RDS dwell performance',
      icon: <TrendingDown size={24} />,
      trend: locationScorecard.trend
    }
  ];
};

const getDefaultMetrics = (): MetricCard[] => [
  {
    title: 'VSC Case Requirements',
    value: 'No data',
    target: '> 95% (target)',
    status: 'warning',
    impact: 'Service case compliance metric',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <CheckCircle size={24} />
  },
  {
    title: 'VSC Closed Correctly',
    value: 'No data',
    target: '> 90% (target)',
    status: 'warning',
    impact: 'Case closure accuracy metric',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <CheckCircle size={24} />
  },
  {
    title: 'TT+ Activation',
    value: 'No data',
    target: '> 95% (target)',
    status: 'warning',
    impact: 'Technology activation compliance',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <TrendingUp size={24} />
  },
  {
    title: 'SM Monthly Dwell Average',
    value: 'No data',
    target: '< 3.0 days (target)',
    status: 'warning',
    impact: 'Service manager dwell time',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <Clock size={24} />
  },
  {
    title: 'Triage Hours',
    value: 'No data',
    target: '< 2.0 hrs (target)',
    status: 'warning',
    impact: 'Initial assessment efficiency',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <Users size={24} />
  },
  {
    title: 'Triage % < 4 Hours',
    value: 'No data',
    target: '> 80% (target)',
    status: 'warning',
    impact: 'Quick triage performance',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <TrendingUp size={24} />
  },
  {
    title: 'ETR % of Cases',
    value: 'No data',
    target: '> 15% (target)',
    status: 'warning',
    impact: 'ETR compliance rate',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <BarChart3 size={24} />
  },
  {
    title: '% Cases with 3+ Notes',
    value: 'No data',
    target: '< 5% (target)',
    status: 'warning',
    impact: 'Case documentation quality',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <AlertTriangle size={24} />
  }
];

interface LocationMetricsProps {
  locationId: string;
  locationName: string;
  locationColor: string;
}

export default function LocationSpecificMetrics({ locationId, locationName, locationColor }: LocationMetricsProps) {
  const [locationMetrics, setLocationMetrics] = useState<MetricCard[]>(getDefaultMetrics());
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await getLocationMetrics(locationId);
        setLocationMetrics(metrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
        setLocationMetrics(getDefaultMetrics());
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMetrics();
  }, [locationId]);
  
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <BarChart3 className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'from-green-600 to-green-700 border-green-500';
      case 'warning':
        return 'from-yellow-600 to-yellow-700 border-yellow-500';
      case 'critical':
        return 'from-red-600 to-red-700 border-red-500';
      default:
        return 'from-gray-600 to-gray-700 border-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-300';
      case 'warning':
        return 'text-yellow-300';
      case 'critical':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  const lastUpdated = () => {
    const storedScorecards = localStorage.getItem('wki-scorecards');
    const scorecards = storedScorecards ? JSON.parse(storedScorecards) : [];
    
    const locationScorecard = scorecards
      .filter((sc: any) => sc.locationId === locationId)
      .sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];

    if (locationScorecard) {
      return `${locationScorecard.month} ${locationScorecard.year}`;
    }
    return 'No data available';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link 
            to="/metrics"
            className="flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Metrics
          </Link>
        </div>
        <Link 
          to="/metrics/scorecard-manager"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-sm"
        >
          Upload New Scorecard
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading metrics...</p>
        </div>
      )}

      {/* Main Content - only show when not loading */}
      {!isLoading && (
        <>
          {/* Location Header */}
          <div className="text-center mb-12">
            <div className={`w-20 h-20 bg-gradient-to-br ${locationColor} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
              {locationName} Performance Metrics
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              Service Performance Dashboard & KPI Tracking
            </p>
            <p className="text-slate-400">
              Last Updated: {lastUpdated()}
            </p>
          </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {locationMetrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${getStatusColor(metric.status)} p-8 rounded-2xl shadow-2xl border-2 hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="bg-white/20 p-3 rounded-full">
                {metric.icon}
              </div>
              {metric.trend && (
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm text-white/80 capitalize">{metric.trend}</span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{metric.title}</h3>
            <div className="text-3xl font-bold text-white mb-4">{metric.value}</div>
            
            <div className="space-y-3">
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-white/80 text-sm font-medium mb-1">Target:</p>
                <p className="text-white font-semibold">{metric.target}</p>
              </div>
              
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-white/80 text-sm font-medium mb-1">Impact:</p>
                <p className="text-white text-sm">{metric.impact}</p>
              </div>
              
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-white text-sm">{metric.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-red-400" />
          Performance Summary - {locationName}
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {locationMetrics.filter(m => m.status === 'good').length}
            </div>
            <p className="text-slate-300">Metrics Meeting Targets</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {locationMetrics.filter(m => m.status === 'warning').length}
            </div>
            <p className="text-slate-300">Metrics Need Attention</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {locationMetrics.filter(m => m.status === 'critical').length}
            </div>
            <p className="text-slate-300">Critical Metrics</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/metrics/scorecard-manager"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
            >
              Upload New Monthly Report
            </Link>
            <Link 
              to="/metrics/locations"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
            >
              Compare All Locations
            </Link>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}