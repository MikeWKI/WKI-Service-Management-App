import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Target, Calendar, Award, Zap, Activity, FileText, Timer, Shield, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import TrendIndicator from './TrendIndicator';

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
  if (numericValue >= 0 && numericValue <= 100 && !value.includes('%')) {
    return `${value}%`;
  }
  return value;
};

// FIXED: Helper function to map metric titles to backend field names
const getMetricFieldName = (title: string): string => {
  console.log(`🔍 getMetricFieldName called with title: "${title}"`);
  
  // EXACT mapping - titles must match exactly
  const metricMapping: Record<string, string> = {
    'VSC Case Requirements': 'vscCaseRequirements',
    'VSC Closed Correctly': 'vscClosedCorrectly',
    'TT+ Activation': 'ttActivation',
    'SM Monthly Dwell Avg': 'smMonthlyDwellAvg',  // Fixed: consistent naming
    'SM YTD Dwell Avg Days': 'smYtdDwellAvgDays',
    'Triage % < 4 Hours': 'triagePercentLess4Hours',
    'SM Average Triage Hours': 'triageHours',
    'ETR % of Cases': 'etrPercentCases',
    '% Cases with 3+ Notes': 'percentCasesWith3Notes',
    'RDS Dwell Monthly Avg Days': 'rdsMonthlyAvgDays',
    'RDS YTD Dwell Avg Days': 'rdsYtdDwellAvgDays'
  };
  
  const result = metricMapping[title];
  if (result) {
    console.log(`✅ Found exact mapping: "${title}" → "${result}"`);
    return result;
  } else {
    console.warn(`❌ No exact mapping found for: "${title}"`);
    console.warn(`Available mappings:`, Object.keys(metricMapping));
    // IMPROVED: Better fallback that preserves some structure
    // Convert to camelCase instead of stripping everything
    const fallback = title
      .split(' ')
      .map((word, index) => {
        const clean = word.replace(/[^a-zA-Z0-9]/g, '');
        return index === 0 ? clean.toLowerCase() : clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
      })
      .join('');
    console.warn(`Using fallback: "${title}" → "${fallback}"`);
    return fallback;
  }
};

/** ----------------------------------------------------------------
 *  UPDATED: getLocationMetrics with parallel API calls for better performance
 *  ---------------------------------------------------------------- */
const getLocationMetrics = async (locationId: string): Promise<MetricCard[]> => {
  const API_BASE_URL = 'https://wki-service-management-app.onrender.com';

  try {
    // OPTION 1: Use trends endpoint with PARALLEL requests for better performance
    console.log('Fetching latest trend data for cards (parallel requests)...');

    const metricsList = [
      'vscCaseRequirements',
      'vscClosedCorrectly',
      'ttActivation',
      'smMonthlyDwellAvg',
      'smYtdDwellAvgDays',
      'triagePercentLess4Hours',
      'triageHours',
      'etrPercentCases',
      'percentCasesWith3Notes',
      'rdsMonthlyAvgDays',
      'rdsYtdDwellAvgDays'
    ];

    // Create parallel requests for all metrics
    const metricPromises = metricsList.map(async (metric) => {
      try {
        const trendResponse = await fetch(`${API_BASE_URL}/api/locationMetrics/trends/${locationId}/${metric}`);
        if (trendResponse.ok) {
          const trendData = await trendResponse.json();
          // FIXED: Use currentValue directly from the API response object
          if (trendData && trendData.success && trendData.data) {
            const cv = trendData.data.currentValue;
            const value = (cv !== null && cv !== undefined) ? String(cv) : 'N/A';
            console.log(`✅ ${metric}: ${value} (${trendData.data.currentPeriod})`);
            return { metric, value, success: true };
          } else {
            console.log(`❌ ${metric}: No data in response`);
            return { metric, value: 'N/A', success: false };
          }
        } else {
          console.log(`❌ ${metric}: HTTP ${trendResponse.status}`);
          return { metric, value: 'N/A', success: false };
        }
      } catch (err) {
        console.error(`Error fetching trend data for ${metric}:`, err);
        return { metric, value: 'N/A', success: false };
      }
    });

    // Wait for all parallel requests to complete
    console.time('Parallel API Calls');
    const results = await Promise.all(metricPromises);
    console.timeEnd('Parallel API Calls');

    // Build the currentValues object from results
    const currentValues: Record<string, string> = {};
    let successCount = 0;
    
    results.forEach(({ metric, value, success }) => {
      currentValues[metric] = value;
      if (success) successCount++;
    });

    console.log(`✅ Completed ${results.length} parallel requests, ${successCount} successful`);

    // Format helper for card display
    const formatValue = (value: string, metric: string): string => {
      if (!value || value === 'N/A') return 'N/A';

      const percentageMetrics = [
        'vscCaseRequirements',
        'vscClosedCorrectly',
        'ttActivation',
        'triagePercentLess4Hours',
        'etrPercentCases',
        'percentCasesWith3Notes'
      ];
      if (percentageMetrics.includes(metric) && !value.includes('%')) {
        return `${value}%`;
      }

      const timeMetrics = ['smMonthlyDwellAvg', 'smYtdDwellAvgDays', 'rdsMonthlyAvgDays', 'rdsYtdDwellAvgDays'];
      if (timeMetrics.includes(metric) && !value.includes('days')) {
        return `${value} days`;
      }

      if (metric === 'triageHours' && !value.includes('hrs')) {
        return `${value} hrs`;
      }

      return value;
    };

    // If we have some successful trend values, build the cards from trends
    if (successCount > 0) {
      console.log('Using parallel trend data for card values:', currentValues);

      return [
        {
          title: 'VSC Case Requirements',
          value: formatValue(currentValues.vscCaseRequirements, 'vscCaseRequirements'),
          target: '> 95% (target)',
          status: parseVscStatus(currentValues.vscCaseRequirements),
          impact: 'Service case compliance metric',
          description: 'Percentage of VSC case requirements met',
          icon: <CheckCircle size={24} />,
          trend: 'stable'
        },
        {
          title: 'VSC Closed Correctly',
          value: formatValue(currentValues.vscClosedCorrectly, 'vscClosedCorrectly'),
          target: '> 90% (target)',
          status: parseVscStatus(currentValues.vscClosedCorrectly),
          impact: 'Case closure accuracy metric',
          description: 'Percentage of VSC cases closed correctly',
          icon: <CheckCircle size={24} />,
          trend: 'stable'
        },
        {
          title: 'TT+ Activation',
          value: formatValue(currentValues.ttActivation, 'ttActivation'),
          target: '> 95% (target)',
          status: parseVscStatus(currentValues.ttActivation),
          impact: 'Technology activation compliance',
          description: 'TruckTech Plus activation percentage',
          icon: <TrendingUp size={24} />,
          trend: 'stable'
        },
        {
          title: 'SM Monthly Dwell Avg',
          value: formatValue(currentValues.smMonthlyDwellAvg, 'smMonthlyDwellAvg'),
          target: '< 3.0 days (target)',
          status: parseDwellStatus(currentValues.smMonthlyDwellAvg),
          impact: 'Service manager dwell time',
          description: 'Average dwell time managed by service manager',
          icon: <Clock size={24} />,
          trend: 'stable'
        },
        {
          title: 'SM YTD Dwell Avg Days',
          value: formatValue(currentValues.smYtdDwellAvgDays, 'smYtdDwellAvgDays'),
          target: '< 6.0 days (target)',
          status: parseRdsStatus(currentValues.smYtdDwellAvgDays),
          impact: 'Service manager year-to-date performance',
          description: 'Year-to-date average dwell time',
          icon: <TrendingDown size={24} />,
          trend: 'stable'
        },
        {
          title: 'Triage % < 4 Hours',
          value: formatValue(currentValues.triagePercentLess4Hours, 'triagePercentLess4Hours'),
          target: '> 80% (target)',
          status: parseVscStatus(currentValues.triagePercentLess4Hours),
          impact: 'Quick triage performance',
          description: 'Percentage of cases triaged within 4 hours',
          icon: <TrendingUp size={24} />,
          trend: 'stable'
        },
        {
          title: 'SM Average Triage Hours',
          value: formatValue(currentValues.triageHours, 'triageHours'),
          target: '< 2.0 hrs (target)',
          status: parseTriageStatus(currentValues.triageHours),
          impact: 'Initial assessment efficiency',
          description: 'Time to complete initial triage assessment',
          icon: <Users size={24} />,
          trend: 'stable'
        },
        {
          title: 'ETR % of Cases',
          value: formatValue(currentValues.etrPercentCases, 'etrPercentCases'),
          target: '> 15% (target)',
          status: parseEtrStatus(currentValues.etrPercentCases),
          impact: 'ETR compliance rate',
          description: 'Percentage of cases with ETR provided',
          icon: <BarChart3 size={24} />,
          trend: 'stable'
        },
        {
          title: '% Cases with 3+ Notes',
          value: formatValue(currentValues.percentCasesWith3Notes, 'percentCasesWith3Notes'),
          target: '< 5% (target)',
          status: parseNotesStatus(currentValues.percentCasesWith3Notes),
          impact: 'Case documentation quality',
          description: 'Cases requiring extensive documentation',
          icon: <AlertTriangle size={24} />,
          trend: 'stable'
        },
        {
          title: 'RDS Dwell Monthly Avg Days',
          value: formatValue(currentValues.rdsMonthlyAvgDays, 'rdsMonthlyAvgDays'),
          target: '< 6.0 days (target)',
          status: parseRdsStatus(currentValues.rdsMonthlyAvgDays),
          impact: 'RDS monthly dwell performance',
          description: 'Remote diagnostic service dwell time',
          icon: <Clock size={24} />,
          trend: 'stable'
        },
        {
          title: 'RDS YTD Dwell Avg Days',
          value: formatValue(currentValues.rdsYtdDwellAvgDays, 'rdsYtdDwellAvgDays'),
          target: '< 6.0 days (target)',
          status: parseRdsStatus(currentValues.rdsYtdDwellAvgDays),
          impact: 'RDS year-to-date dwell performance',
          description: 'Year-to-date RDS dwell performance',
          icon: <TrendingDown size={24} />,
          trend: 'stable'
        }
      ];
    }

    // OPTION 2: Fall back to original backend logic when trends not available
    console.log('Parallel trends requests failed or returned insufficient data, falling back to original logic...');
    const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
    if (response.ok) {
      const data = await response.json();
      let locations: any[] = [];

      if (data && typeof data === 'object') {
        if ('locations' in data && Array.isArray(data.locations)) {
          locations = data.locations;
        } else if ('data' in data && data.data && 'locations' in data.data && Array.isArray(data.data.locations)) {
          locations = data.data.locations;
        }
      }

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
        console.log('Raw location data from backend:', metrics);

        const locationName = metrics.name || metrics.locationName;
        let completeData: string[] = [];

        const cleanValue = (value: string, shouldHavePercent: boolean = false): string => {
          if (!value || value === 'N/A') return 'N/A';
          if (!shouldHavePercent && value.includes('%')) {
            return value.replace('%', '');
          }
          if (shouldHavePercent && !value.includes('%') && value !== 'N/A') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
              return `${value}%`;
            }
          }
          return value;
        };

        const getFieldValue = (backendField: string, fallbackValue: string) => {
          const value = metrics[backendField];
          console.log(`Getting field ${backendField}: backend has "${value}", using "${value || fallbackValue}"`);
          return value || fallbackValue;
        };

        console.log('All available backend fields:', Object.keys(metrics));

        if (locationName === 'Wichita Kenworth') {
          completeData = [
            getFieldValue('vscCaseRequirements', '96%'),
            getFieldValue('vscClosedCorrectly', '92%'),
            getFieldValue('ttActivation', '99%'),
            getFieldValue('smMonthlyDwellAvg', '2.7'),
            getFieldValue('smYtdDwellAvgDays', '1.9'),
            getFieldValue('triagePercentLess4Hours', '87.9%'),
            getFieldValue('triageHours', '1.8'),
            getFieldValue('etrPercentCases', '1.3'),
            getFieldValue('percentCasesWith3Notes', '10.1%'),
            getFieldValue('rdsMonthlyAvgDays', '5.8'),
            getFieldValue('rdsYtdDwellAvgDays', '5.6')
          ];
        } else if (locationName === 'Dodge City Kenworth') {
          completeData = [
            getFieldValue('vscCaseRequirements', '67%'),
            getFieldValue('vscClosedCorrectly', '83%'),
            getFieldValue('ttActivation', '85%'),
            getFieldValue('smMonthlyDwellAvg', '1.8'),
            getFieldValue('smYtdDwellAvgDays', '2.2'),
            getFieldValue('triagePercentLess4Hours', '19.0%'),
            getFieldValue('triageHours', '4.2'),
            getFieldValue('etrPercentCases', '0'),
            getFieldValue('percentCasesWith3Notes', '0%'),
            getFieldValue('rdsMonthlyAvgDays', '6.1'),
            getFieldValue('rdsYtdDwellAvgDays', '5.7')
          ];
        } else if (locationName === 'Liberal Kenworth') {
          completeData = [
            getFieldValue('vscCaseRequirements', '100%'),
            getFieldValue('vscClosedCorrectly', '100%'),
            getFieldValue('ttActivation', '100%'),
            getFieldValue('smMonthlyDwellAvg', '2.0'),
            getFieldValue('smYtdDwellAvgDays', '2.6'),
            getFieldValue('triagePercentLess4Hours', '89.4%'),
            getFieldValue('triageHours', '3.1'),
            getFieldValue('etrPercentCases', '0'),
            getFieldValue('percentCasesWith3Notes', '2.1%'),
            getFieldValue('rdsMonthlyAvgDays', '5.6'),
            getFieldValue('rdsYtdDwellAvgDays', '5.7')
          ];
        } else if (locationName === 'Emporia Kenworth') {
          completeData = [
            getFieldValue('vscCaseRequirements', 'N/A'),
            getFieldValue('vscClosedCorrectly', 'N/A'),
            getFieldValue('ttActivation', 'N/A'),
            getFieldValue('smMonthlyDwellAvg', '1.2'),
            getFieldValue('smYtdDwellAvgDays', '0.8'),
            getFieldValue('triagePercentLess4Hours', '38.8%'),
            getFieldValue('triageHours', '9.5'),
            getFieldValue('etrPercentCases', '1.0'),
            getFieldValue('percentCasesWith3Notes', '15.3%'),
            getFieldValue('rdsMonthlyAvgDays', '3.3'),
            getFieldValue('rdsYtdDwellAvgDays', '4.3')
          ];
        } else {
          // Generic fallback to backend-looking fields
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

        const cleanedData = [
          cleanValue(completeData[0], true),
          cleanValue(completeData[1], true),
          cleanValue(completeData[2], true),
          cleanValue(completeData[3], false),
          cleanValue(completeData[4], false),
          cleanValue(completeData[5], true),
          cleanValue(completeData[6], false),
          cleanValue(completeData[7], false), // ETR % of Cases stays numeric; add % later when rendering if desired
          cleanValue(completeData[8], true),
          cleanValue(completeData[9], false),
          cleanValue(completeData[10], false)
        ];

        const mappedMetrics = {
          vscCaseRequirements: cleanedData[0],
          vscClosedCorrectly: cleanedData[1],
          ttActivation: cleanedData[2],
          smMonthlyDwellAvg: cleanedData[3],
          smYtdDwellAvgDays: cleanedData[4],
          triagePercentLess4Hours: cleanedData[5],
          triageHours: cleanedData[6],
          etrPercentCases: cleanedData[7],
          percentCasesWith3Notes: cleanedData[8],
          rdsMonthlyAvgDays: cleanedData[9],
          rdsYtdDwellAvgDays: cleanedData[10]
        };

        console.log('Mapped metrics for', locationName, ':', mappedMetrics);

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
            title: 'SM Monthly Dwell Avg', // FIXED: Consistent title
            value: `${mappedMetrics.smMonthlyDwellAvg} days`,
            target: '< 3.0 days (target)',
            status: parseDwellStatus(mappedMetrics.smMonthlyDwellAvg),
            trend: 'stable',
            icon: <Clock className="w-6 h-6" />,
            impact: 'Service manager dwell time metric',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'SM YTD Dwell Avg Days',
            value: `${mappedMetrics.smYtdDwellAvgDays} days`,
            target: '< 6.0 days (target)',
            status: parseRdsStatus(mappedMetrics.smYtdDwellAvgDays),
            trend: 'stable',
            icon: <TrendingDown className="w-6 h-6" />,
            impact: 'Service manager year-to-date performance',
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
            title: 'SM Average Triage Hours',
            value: `${mappedMetrics.triageHours} hrs`,
            target: '< 2.0 hrs (target)',
            status: parseTriageStatus(mappedMetrics.triageHours),
            trend: 'stable',
            icon: <Users className="w-6 h-6" />,
            impact: 'Initial assessment time',
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
            title: 'RDS Dwell Monthly Avg Days',
            value: `${mappedMetrics.rdsMonthlyAvgDays} days`,
            target: '< 6.0 days (target)',
            status: parseRdsStatus(mappedMetrics.rdsMonthlyAvgDays),
            trend: 'stable',
            icon: <TrendingDown className="w-6 h-6" />,
            impact: 'RDS monthly performance',
            description: 'Upload monthly scorecard to view current metrics'
          },
          {
            title: 'RDS YTD Dwell Avg Days',
            value: `${mappedMetrics.rdsYtdDwellAvgDays} days`,
            target: '< 6.0 days (target)',
            status: parseRdsStatus(mappedMetrics.rdsYtdDwellAvgDays),
            trend: 'stable',
            icon: <TrendingDown className="w-6 h-6" />,
            impact: 'RDS year-to-date performance',
            description: 'Upload monthly scorecard to view current metrics'
          }
        ];
      }
    }
  } catch (error) {
    console.error('Error fetching backend metrics:', error);
  }

  // OPTION 3: Fallback to localStorage (unchanged from original)
  const storedScorecards = localStorage.getItem('wki-scorecards');
  const scorecards = storedScorecards ? JSON.parse(storedScorecards) : [];

  const locationScorecard = scorecards
    .filter((sc: any) => sc.locationId === locationId)
    .sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];

  if (!locationScorecard) {
    return getDefaultMetrics();
  }

  const metrics = locationScorecard.metrics;

  const locationName = locationScorecard.locationName || locationId;
  let completeData: string[] = [];

  if (locationName.toLowerCase().includes('wichita')) {
    completeData = ['96%', '92%', '99%', '2.7', '1.9', '87.9%', '1.8%', '1.3%', '10.1%', '5.8', '5.6'];
  } else if (locationName.toLowerCase().includes('dodge')) {
    completeData = ['67%', '83%', '85%', '1.8', '2.2', '19.0%', '4.2%', '0%', '0%', '6.1', '5.7'];
  } else if (locationName.toLowerCase().includes('liberal')) {
    completeData = ['100%', '100%', '100%', '2', '2.6', '89.4%', '3.1%', '0%', '2.1%', '5.6', '5.7'];
  } else if (locationName.toLowerCase().includes('emporia')) {
    completeData = ['N/A', 'N/A', 'N/A', '1.2', '0.8', '38.8%', '9.5%', '1.0%', '15.3%', '3.3', '4.3'];
  } else {
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
      title: 'SM Monthly Dwell Avg', // FIXED: Consistent title
      value: `${completeData[3]} days`,
      target: '< 3.0 days (target)',
      status: parseDwellStatus(completeData[3]),
      impact: 'Service manager dwell time',
      description: 'Average dwell time managed by service manager',
      icon: <Clock size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'SM Average Triage Hours',
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
      title: 'RDS Dwell Monthly Avg Days', // FIXED: Consistent title
      value: `${completeData[8]} days`,
      target: '< 6.0 days (target)',
      status: parseRdsStatus(completeData[8]),
      impact: 'RDS monthly dwell performance',
      description: 'Remote diagnostic service dwell time',
      icon: <Clock size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'SM YTD Dwell Avg Days', // FIXED: Consistent title
      value: `${completeData[9]} days`,
      target: '< 6.0 days (target)',
      status: parseRdsStatus(completeData[9]),
      impact: 'Service manager year-to-date performance',
      description: 'Year-to-date average dwell time',
      icon: <TrendingDown size={24} />,
      trend: locationScorecard.trend
    },
    {
      title: 'RDS YTD Dwell Avg Days',
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
    title: 'SM Monthly Dwell Avg', // FIXED: Consistent title
    value: 'No data',
    target: '< 3.0 days (target)',
    status: 'warning',
    impact: 'Service manager dwell time',
    description: 'Upload monthly scorecard to view current metrics',
    icon: <Clock size={24} />
  },
  {
    title: 'SM Average Triage Hours',
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
  const [showTips, setShowTips] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Tips Bubble */}
      {showTips && (
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 animate-pulse">
          <div className="bg-gradient-to-br from-blue-600/90 to-blue-700/90 backdrop-blur-sm border border-blue-500/50 rounded-xl p-4 max-w-xs shadow-xl">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">Tips</span>
              </div>
              <button
                onClick={() => setShowTips(false)}
                className="text-blue-200 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Click on the trend indicators <span className="inline-flex items-center px-2 py-1 bg-blue-500/30 rounded text-xs mx-1">Stable</span> to view detailed trend analysis and historical data.
            </p>
            <div className="mt-3 pt-3 border-t border-blue-400/20">
              <div className="flex items-center space-x-2 text-blue-200 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>Interactive trend data available</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link
                to="/metrics"
                className="flex items-center text-slate-300 hover:text-white transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Metrics
              </Link>
              <div className="h-8 w-px bg-slate-600"></div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{locationName}</h1>
                  <p className="text-slate-300 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Latest Report: {lastUpdated()}
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/scorecard-manager"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
            >
              <Shield className="w-4 h-4" />
              <span>Upload New Scorecard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-red-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-slate-700 opacity-20 mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Performance Metrics</h3>
          <p className="text-slate-400">Fetching latest data for {locationName}...</p>
        </div>
      )}

      {/* Main Content - only show when not loading */}
      {!isLoading && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-400 text-sm font-medium">Excellent</span>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {locationMetrics.filter(m => m.status === 'good').length}
              </div>
              <p className="text-slate-300 text-sm">Metrics Meeting Targets</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="text-yellow-400 text-sm font-medium">Attention</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {locationMetrics.filter(m => m.status === 'warning').length}
              </div>
              <p className="text-slate-300 text-sm">Metrics Need Attention</p>
            </div>

            <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <span className="text-red-400 text-sm font-medium">Critical</span>
              </div>
              <div className="text-3xl font-bold text-red-400 mb-1">
                {locationMetrics.filter(m => m.status === 'critical').length}
              </div>
              <p className="text-slate-300 text-sm">Critical Metrics</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-400 text-sm font-medium">Overall</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {Math.round((locationMetrics.filter(m => m.status === 'good').length / locationMetrics.length) * 100)}%
              </div>
              <p className="text-slate-300 text-sm">Success Rate</p>
            </div>
          </div>

          {/* Service Quality Metrics */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-8 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Service Quality Metrics</h2>
                <p className="text-slate-300">Customer satisfaction and service compliance indicators</p>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <Award className="w-5 h-5" />
                <span className="font-medium">Quality Focus</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {locationMetrics.slice(0, 3).map((metric, index) => (
                <div key={index} className="group relative">
                  <div className={`bg-gradient-to-br ${getStatusColor(metric.status)} rounded-xl p-6 border shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        {metric.icon}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`${getStatusTextColor(metric.status)} text-sm font-medium capitalize`}>
                          {metric.status}
                        </span>
                        <TrendIndicator
                          locationId={locationId}
                          locationName={locationName}
                          metric={getMetricFieldName(metric.title)}
                          metricDisplayName={metric.title}
                          currentValue={metric.value}
                          target={metric.target}
                          className="scale-90"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{metric.title}</h3>
                    <div className="text-4xl font-bold text-white mb-4">{metric.value}</div>

                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-white/80 text-xs font-medium mb-1">Target:</p>
                      <p className="text-white font-semibold text-sm">{metric.target}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Efficiency */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-8 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Operational Efficiency</h2>
                <p className="text-slate-300">Time management and process optimization metrics</p>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <Zap className="w-5 h-5" />
                <span className="font-medium">Efficiency Focus</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {locationMetrics.slice(3, 7).map((metric, index) => (
                <div key={index} className="group relative">
                  <div className={`bg-gradient-to-br ${getStatusColor(metric.status)} rounded-xl p-6 border shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        {React.cloneElement(metric.icon as React.ReactElement, { className: "w-5 h-5 text-white" })}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`${getStatusTextColor(metric.status)} text-xs font-medium capitalize`}>
                          {metric.status}
                        </span>
                        <TrendIndicator
                          locationId={locationId}
                          locationName={locationName}
                          metric={getMetricFieldName(metric.title)}
                          metricDisplayName={metric.title}
                          currentValue={metric.value}
                          target={metric.target}
                          className="scale-75"
                        />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2">{metric.title}</h3>
                    <div className="text-2xl font-bold text-white mb-3">{metric.value}</div>

                    <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                      <p className="text-white/80 text-xs font-medium mb-1">Target:</p>
                      <p className="text-white font-semibold text-xs">{metric.target}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Management & Documentation */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-8 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Case Management & Documentation</h2>
                <p className="text-slate-300">Case handling, documentation quality, and processing metrics</p>
              </div>
              <div className="flex items-center space-x-2 text-purple-400">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Documentation Focus</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {locationMetrics.slice(7, 11).map((metric, index) => (
                <div key={index} className="group relative">
                  <div className={`bg-gradient-to-br ${getStatusColor(metric.status)} rounded-xl p-6 border shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        {React.cloneElement(metric.icon as React.ReactElement, { className: "w-5 h-5 text-white" })}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`${getStatusTextColor(metric.status)} text-xs font-medium capitalize`}>
                          {metric.status}
                        </span>
                        <TrendIndicator
                          locationId={locationId}
                          locationName={locationName}
                          metric={getMetricFieldName(metric.title)}
                          metricDisplayName={metric.title}
                          currentValue={metric.value}
                          target={metric.target}
                          className="scale-75"
                        />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2">{metric.title}</h3>
                    <div className="text-2xl font-bold text-white mb-3">{metric.value}</div>

                    <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                      <p className="text-white/80 text-xs font-medium mb-1">Target:</p>
                      <p className="text-white font-semibold text-xs">{metric.target}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-white/70 text-xs">{metric.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Metrics Table */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-8 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Detailed Performance Analysis</h2>
                <p className="text-slate-300">Comprehensive overview of all performance metrics</p>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Full Analysis</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Metric</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Current Value</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Target</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {locationMetrics.map((metric, index) => (
                    <tr key={index} className="border-b border-slate-800 hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${getStatusColor(metric.status)}`}>
                            {React.cloneElement(metric.icon as React.ReactElement, { className: "w-4 h-4 text-white" })}
                          </div>
                          <span className="text-white font-medium">{metric.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white font-bold text-lg">{metric.value}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-300">{metric.target}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            metric.status === 'good'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : metric.status === 'warning'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {metric.status === 'good' ? '✓ Good' : metric.status === 'warning' ? '⚠ Warning' : '✗ Critical'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-300 text-sm">{metric.impact}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Center */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Action Center</h2>
              <p className="text-slate-300">Manage reports and compare performance across locations</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/scorecard-manager"
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Shield className="w-5 h-5" />
                <span>Upload New Monthly Report</span>
              </Link>
              <Link
                to="/location-metrics"
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Compare All Locations</span>
              </Link>
              <Link
                to="/metrics"
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Timer className="w-5 h-5" />
                <span>View All Metrics</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}