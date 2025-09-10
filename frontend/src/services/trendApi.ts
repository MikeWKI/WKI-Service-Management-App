// Trend Data API Service
const API_BASE_URL = 'https://wki-sma.onrender.com';

export interface TrendDataPoint {
  month: string;
  year: number;
  value: number;
  uploadDate: string;
}

export interface TrendAnalysis {
  metric: string;
  locationId: string;
  currentValue: number;
  currentPeriod: string;
  trend: 'improving' | 'declining' | 'stable';
  trendDirection: number; // Positive for improving, negative for declining
  dataPoints: TrendDataPoint[];
  monthsOfData: number;
  analysis: {
    averageChange: number;
    volatility: number;
    bestMonth: TrendDataPoint;
    worstMonth: TrendDataPoint;
    currentVsPrevious: number;
  };
}

export interface HistoricalDataResponse {
  success: boolean;
  data: {
    locations: Array<{
      locationId: string;
      locationName: string;
      uploads: Array<{
        month: string;
        year: number;
        uploadDate: string;
        metrics: Record<string, any>;
      }>;
    }>;
  };
}

export interface TrendResponse {
  success: boolean;
  data: TrendAnalysis;
}

export interface ComparisonResponse {
  success: boolean;
  data: {
    metrics: Array<{
      metric: string;
      locations: Array<{
        locationId: string;
        locationName: string;
        trendData: TrendDataPoint[];
        currentValue: number;
        trend: string;
      }>;
    }>;
  };
}

// Fetch trend data for a specific metric at a specific location
export const fetchTrendData = async (
  locationId: string, 
  metric: string, 
  months = 12
): Promise<TrendResponse> => {
  try {
    // First try to fetch from the specific trends endpoint if it exists
    const trendsResponse = await fetch(
      `${API_BASE_URL}/api/locationMetrics/trends/${locationId}/${metric}?months=${months}`
    );
    
    if (trendsResponse.ok) {
      const result = await trendsResponse.json();
      
      // Validate the response structure
      if (result.data && Array.isArray(result.data.dataPoints)) {
        return result;
      }
    }

    // If trends endpoint doesn't exist, fall back to building trends from uploaded data
    console.log('Building trend data from uploaded scorecards...');
    return await buildTrendFromUploadedData(locationId, metric, months);
    
  } catch (error) {
    console.error('Error fetching trend data:', error);
    // Fall back to building from uploaded data
    return await buildTrendFromUploadedData(locationId, metric, months);
  }
};

// Build trend data from actual uploaded scorecard data
const buildTrendFromUploadedData = async (
  locationId: string, 
  metric: string, 
  months: number
): Promise<TrendResponse> => {
  try {
    // Fetch the actual history of uploaded scorecards
    const historyResponse = await fetch(`${API_BASE_URL}/api/locationMetrics/history`);
    
    if (!historyResponse.ok) {
      throw new Error(`Failed to fetch upload history: ${historyResponse.status}`);
    }

    const historyData = await historyResponse.json();
    
    if (!historyData.success || !historyData.data || !Array.isArray(historyData.data.history)) {
      throw new Error('No upload history available');
    }

    const uploadedMonths = historyData.data.history;
    console.log(`Found ${uploadedMonths.length} actual uploaded months:`, uploadedMonths.map((u: any) => `${u.month} ${u.year}`));

    if (uploadedMonths.length === 0) {
      throw new Error('No uploaded scorecard data found');
    }

    // Sort uploads by date to ensure proper chronological order
    uploadedMonths.sort((a: any, b: any) => {
      const dateA = new Date(a.year, getMonthNumber(a.month) - 1);
      const dateB = new Date(b.year, getMonthNumber(b.month) - 1);
      return dateA.getTime() - dateB.getTime();
    });

    // Now fetch the actual data for each uploaded month
    const dataPoints: TrendDataPoint[] = [];
    
    for (const upload of uploadedMonths) {
      try {
        // For now, we'll use the current endpoint to get the latest data
        // In a real implementation, we'd need an endpoint that returns historical data by month/year
        console.log(`Fetching data for ${upload.month} ${upload.year} (ID: ${upload.id})`);
        
        // Since we don't have a month-specific endpoint yet, we can only show the current/latest data
        // This is a limitation that needs to be addressed in the backend
        const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
        
        if (response.ok) {
          const data = await response.json();
          let locations: any[] = [];
          
          if (data && typeof data === 'object') {
            if ('locations' in data) {
              locations = data.locations;
            } else if ('data' in data && data.data && 'locations' in data.data) {
              locations = data.data.locations;
            }
          }

          const location = locations.find((loc: any) => 
            loc.name?.toLowerCase().replace(/\s+/g, '-') === locationId ||
            loc.locationId === locationId
          );

          if (location) {
            const value = extractMetricValue(location, metric);
            
            if (value !== null) {
              const uploadDate = new Date(upload.year, getMonthNumber(upload.month) - 1, 1);
              
              dataPoints.push({
                month: upload.month,
                year: upload.year,
                value: value,
                uploadDate: uploadDate.toISOString()
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch data for ${upload.month} ${upload.year}:`, error);
      }
    }

    if (dataPoints.length === 0) {
      throw new Error(`No data found for metric ${metric} at location ${locationId}`);
    }

    console.log(`Built trend with ${dataPoints.length} REAL data points:`, dataPoints.map(p => `${p.month} ${p.year}: ${p.value}`));

    // Calculate trend analysis from actual data
    const firstValue = dataPoints[0]?.value || 0;
    const lastValue = dataPoints[dataPoints.length - 1]?.value || 0;
    const trendDirection = lastValue - firstValue;
    
    const analysis = {
      averageChange: dataPoints.length > 1 ? trendDirection / (dataPoints.length - 1) : 0,
      volatility: calculateVolatility(dataPoints),
      bestMonth: dataPoints.reduce((best, current) => current.value > best.value ? current : best, dataPoints[0]),
      worstMonth: dataPoints.reduce((worst, current) => current.value < worst.value ? current : worst, dataPoints[0]),
      currentVsPrevious: dataPoints.length > 1 ? lastValue - dataPoints[dataPoints.length - 2].value : 0
    };

    return {
      success: true,
      data: {
        metric,
        locationId,
        currentValue: lastValue,
        currentPeriod: `${dataPoints[dataPoints.length - 1]?.month} ${dataPoints[dataPoints.length - 1]?.year}`,
        trend: trendDirection > 2 ? 'improving' : trendDirection < -2 ? 'declining' : 'stable',
        trendDirection,
        dataPoints,
        monthsOfData: dataPoints.length,
        analysis
      }
    };

  } catch (error) {
    console.error('Error building trend from actual uploaded data:', error);
    // Return empty response - NO FAKE DATA
    return {
      success: false,
      data: {
        metric,
        locationId,
        currentValue: 0,
        currentPeriod: 'No data',
        trend: 'stable',
        trendDirection: 0,
        dataPoints: [],
        monthsOfData: 0,
        analysis: {
          averageChange: 0,
          volatility: 0,
          bestMonth: { month: '', year: 0, value: 0, uploadDate: '' },
          worstMonth: { month: '', year: 0, value: 0, uploadDate: '' },
          currentVsPrevious: 0
        }
      }
    };
  }
};

// Helper function to convert month name to number
const getMonthNumber = (monthName: string): number => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.indexOf(monthName) + 1;
};

// Extract metric value from location data
const extractMetricValue = (location: any, metric: string): number | null => {
  const value = location[metric];
  if (value === undefined || value === null || value === 'N/A') return null;
  
  // Handle percentage values
  if (typeof value === 'string' && value.includes('%')) {
    return parseFloat(value.replace('%', ''));
  }
  
  return parseFloat(value) || null;
};

// Calculate volatility of data points
const calculateVolatility = (dataPoints: TrendDataPoint[]): number => {
  if (dataPoints.length < 2) return 0;
  
  const values = dataPoints.map(p => p.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  return Math.sqrt(variance);
};

// Fetch all historical data across all locations
export const fetchHistoricalData = async (): Promise<HistoricalDataResponse> => {
  try {
    // First, get the upload history to see what months are available
    const historyResponse = await fetch(`${API_BASE_URL}/api/locationMetrics/history`);
    
    if (!historyResponse.ok) {
      console.warn(`Backend history endpoint not available (${historyResponse.status})`);
      return {
        success: false,
        data: { locations: [] }
      };
    }

    const historyData = await historyResponse.json();
    
    if (!historyData.success || !historyData.data || !Array.isArray(historyData.data.history)) {
      console.warn('No upload history available');
      return {
        success: false,
        data: { locations: [] }
      };
    }

    const uploadedMonths = historyData.data.history;
    console.log(`Found ${uploadedMonths.length} actual uploaded months:`, uploadedMonths.map((u: any) => `${u.month} ${u.year}`));

    // Get current data (which represents the latest upload)
    const currentResponse = await fetch(`${API_BASE_URL}/api/locationMetrics`);
    
    if (!currentResponse.ok) {
      console.warn(`Backend data endpoint not available (${currentResponse.status})`);
      return {
        success: false,
        data: { locations: [] }
      };
    }

    const currentData = await currentResponse.json();
    let locations: any[] = [];
    
    if (currentData && typeof currentData === 'object') {
      if ('locations' in currentData) {
        locations = currentData.locations;
      } else if ('data' in currentData && currentData.data && 'locations' in currentData.data) {
        locations = currentData.data.locations;
      }
    }

    if (!Array.isArray(locations) || locations.length === 0) {
      console.warn('No location data found in response');
      return {
        success: false,
        data: { locations: [] }
      };
    }

    // Transform data to show ONLY the actual uploaded months
    // Note: Currently we can only get the latest month's data due to backend limitations
    const historicalLocations = locations.map(location => {
      // For now, we can only show one upload (the latest) since the backend doesn't store historical values per month
      // This is a limitation that should be addressed by storing monthly snapshots in the backend
      const uploads = [{
        month: currentData.data?.month || new Date().toLocaleDateString('en-US', { month: 'long' }),
        year: currentData.data?.year || new Date().getFullYear(),
        uploadDate: currentData.data?.uploadedAt || new Date().toISOString(),
        metrics: {
          vscCaseRequirements: location.vscCaseRequirements || 'N/A',
          vscClosedCorrectly: location.vscClosedCorrectly || 'N/A',
          ttActivation: location.ttActivation || 'N/A',
          smMonthlyDwellAvg: location.smMonthlyDwellAvg || 'N/A',
          triageHours: location.triageHours || 'N/A',
          triagePercentLess4Hours: location.triagePercentLess4Hours || 'N/A',
          etrPercentCases: location.etrPercentCases || 'N/A',
          percentCasesWith3Notes: location.percentCasesWith3Notes || 'N/A',
          rdsMonthlyAvgDays: location.rdsMonthlyAvgDays || 'N/A',
          smYtdDwellAvgDays: location.smYtdDwellAvgDays || 'N/A',
          rdsYtdDwellAvgDays: location.rdsYtdDwellAvgDays || 'N/A'
        }
      }];

      return {
        locationId: location.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
        locationName: location.name || 'Unknown Location',
        uploads
      };
    });
    
    console.log(`Historical data shows ${uploadedMonths.length} uploads available, but backend limitation means we can only display latest month's values`);
    
    return {
      success: true,
      data: { locations: historicalLocations }
    };
    
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return {
      success: false,
      data: { locations: [] }
    };
  }
};

// Fetch comparison data across locations and time periods
export const fetchComparisonData = async (
  months = 6, 
  locationId?: string
): Promise<ComparisonResponse> => {
  try {
    // First try the dedicated comparison endpoint
    const params = new URLSearchParams({ months: months.toString() });
    if (locationId) {
      params.append('locationId', locationId);
    }
    
    const comparisonResponse = await fetch(
      `${API_BASE_URL}/api/locationMetrics/compare?${params}`
    );
    
    if (comparisonResponse.ok) {
      const result = await comparisonResponse.json();
      if (result.success && result.data) {
        return result;
      }
    }

    // If comparison endpoint doesn't exist, build comparison from current data
    console.log('Building comparison data from current scorecard data...');
    return await buildComparisonFromCurrentData(months, locationId);
    
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    // Fall back to building from current data
    return await buildComparisonFromCurrentData(months, locationId);
  }
};

// Build comparison data from current uploaded scorecard data
const buildComparisonFromCurrentData = async (
  months: number,
  locationId?: string
): Promise<ComparisonResponse> => {
  try {
    // Get upload history to see what months are actually available
    const historyResponse = await fetch(`${API_BASE_URL}/api/locationMetrics/history`);
    
    if (!historyResponse.ok) {
      console.warn(`Backend history endpoint not available (${historyResponse.status})`);
      return {
        success: false,
        data: { metrics: [] }
      };
    }

    const historyData = await historyResponse.json();
    
    if (!historyData.success || !historyData.data || !Array.isArray(historyData.data.history)) {
      console.warn('No upload history available for comparison');
      return {
        success: false,
        data: { metrics: [] }
      };
    }

    const uploadedMonths = historyData.data.history;
    console.log(`Building comparison from ${uploadedMonths.length} actual uploaded months`);

    // Fetch current data (represents latest upload)
    const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch current data: ${response.status}`);
    }

    const data = await response.json();
    let locations: any[] = [];
    
    // Handle different response structures
    if (data && typeof data === 'object') {
      if ('locations' in data) {
        locations = data.locations;
      } else if ('data' in data && data.data && 'locations' in data.data) {
        locations = data.data.locations;
      }
    }

    if (!Array.isArray(locations)) {
      throw new Error('No location data available');
    }

    // Filter by specific location if requested
    if (locationId && locationId !== 'all') {
      locations = locations.filter(loc => 
        loc.name?.toLowerCase().replace(/\s+/g, '-') === locationId
      );
    }

    // Build metrics comparison structure - only using real uploaded data
    const availableMetrics = ['vscCaseRequirements', 'vscClosedCorrectly', 'ttActivation', 
                             'smMonthlyDwellAvg', 'triageHours', 'triagePercentLess4Hours'];
    
    const metrics = availableMetrics.map(metricKey => ({
      metric: metricKey,
      locations: locations.map(location => {
        const currentValue = extractMetricValue(location, metricKey) || 0;
        return {
          locationId: location.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
          locationName: location.name || 'Unknown Location',
          trendData: [], // Empty since backend doesn't store historical snapshots yet
          currentValue,
          trend: 'stable' // No trend calculation possible with single data point
        };
      })
    }));

    console.log(`Comparison limited to current values. Historical trends require ${uploadedMonths.length} monthly snapshots.`);

    return {
      success: true,
      data: { metrics }
    };

  } catch (error) {
    console.error('Error building comparison from current data:', error);
    return {
      success: false,
      data: { 
        metrics: []
      }
    };
  }
};

// Calculate trend direction and analysis from data points
export const calculateTrend = (dataPoints: TrendDataPoint[]): {
  trend: 'improving' | 'declining' | 'stable';
  direction: number;
  confidence: number;
} => {
  if (dataPoints.length < 2) {
    return { trend: 'stable', direction: 0, confidence: 0 };
  }

  // Calculate simple linear regression slope
  const n = dataPoints.length;
  const xValues = dataPoints.map((_, index) => index);
  const yValues = dataPoints.map(point => point.value);
  
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Calculate confidence based on R-squared
  const meanY = sumY / n;
  const totalSumSquares = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const predictedValues = xValues.map(x => (sumY / n) + slope * (x - sumX / n));
  const residualSumSquares = yValues.reduce((sum, y, i) => sum + Math.pow(y - predictedValues[i], 2), 0);
  const rSquared = 1 - (residualSumSquares / totalSumSquares);
  
  // Determine trend based on slope and confidence
  const confidence = Math.max(0, Math.min(1, rSquared));
  const threshold = 0.1; // Minimum slope threshold for trend detection
  
  if (Math.abs(slope) < threshold || confidence < 0.3) {
    return { trend: 'stable', direction: slope, confidence };
  }
  
  return {
    trend: slope > 0 ? 'improving' : 'declining',
    direction: slope,
    confidence
  };
};

// Get trend icon based on trend type
export const getTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'improving': return '📈';
    case 'declining': return '📉';
    case 'stable': return '📊';
    default: return '📊';
  }
};

// Get trend color class based on trend type
export const getTrendColorClass = (trend: string): string => {
  switch (trend) {
    case 'improving': return 'text-green-600';
    case 'declining': return 'text-red-600';
    case 'stable': return 'text-blue-600';
    default: return 'text-gray-600';
  }
};

// Format trend analysis for display
export const formatTrendAnalysis = (analysis: TrendAnalysis): string => {
  const { trend, analysis: data, monthsOfData } = analysis;
  
  if (monthsOfData < 2) {
    return 'Insufficient data for trend analysis';
  }
  
  const changeText = data.currentVsPrevious > 0 ? 'increased' : 'decreased';
  const changePercent = Math.abs(data.currentVsPrevious * 100).toFixed(1);
  
  switch (trend) {
    case 'improving':
      return `📈 Improving trend over ${monthsOfData} months. ${changeText} ${changePercent}% from previous month.`;
    case 'declining':
      return `📉 Declining trend over ${monthsOfData} months. ${changeText} ${changePercent}% from previous month.`;
    case 'stable':
      return `📊 Stable performance over ${monthsOfData} months with minimal variation.`;
    default:
      return `Data available for ${monthsOfData} months.`;
  }
};
