// Trend Data API Service
const API_BASE_URL = 'https://wki-service-management-app.onrender.com';

export interface TrendDataPoint {
  month: string;
  year: number;
  value: number;
  uploadDate: string;
}

export interface TrendAnalysis {
  metric: string;
  locationId: string;
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
    const response = await fetch(
      `${API_BASE_URL}/api/locationMetrics/trends/${locationId}/${metric}?months=${months}`
    );
    
    if (!response.ok) {
      // For now, return mock data since the backend endpoint might not be implemented
      console.warn(`Backend trend endpoint not available (${response.status}), using mock data`);
      return generateMockTrendData(locationId, metric, months);
    }
    
    const result = await response.json();
    
    // Validate the response structure
    if (!result.data || !Array.isArray(result.data.dataPoints)) {
      console.warn('Invalid trend data structure from backend, using mock data');
      return generateMockTrendData(locationId, metric, months);
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching trend data:', error);
    // Return mock data for development
    return generateMockTrendData(locationId, metric, months);
  }
};

// Generate mock trend data for development
const generateMockTrendData = (locationId: string, metric: string, months: number): TrendResponse => {
  const dataPoints: TrendDataPoint[] = [];
  const currentDate = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const baseValue = Math.random() * 100;
    const trend = Math.sin(i * 0.5) * 10; // Create some trend
    
    dataPoints.push({
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      year: date.getFullYear(),
      value: Math.max(0, Math.min(100, baseValue + trend)),
      uploadDate: date.toISOString()
    });
  }
  
  // Calculate trend direction
  const firstValue = dataPoints[0]?.value || 0;
  const lastValue = dataPoints[dataPoints.length - 1]?.value || 0;
  const trendDirection = lastValue - firstValue;
  
  return {
    success: true,
    data: {
      metric,
      locationId,
      trend: trendDirection > 5 ? 'improving' : trendDirection < -5 ? 'declining' : 'stable',
      trendDirection,
      dataPoints,
      monthsOfData: dataPoints.length,
      analysis: {
        averageChange: trendDirection / dataPoints.length,
        volatility: Math.random() * 10,
        bestMonth: dataPoints.reduce((best, current) => current.value > best.value ? current : best, dataPoints[0]),
        worstMonth: dataPoints.reduce((worst, current) => current.value < worst.value ? current : worst, dataPoints[0]),
        currentVsPrevious: dataPoints.length > 1 ? lastValue - dataPoints[dataPoints.length - 2].value : 0
      }
    }
  };
};

// Fetch all historical data across all locations
export const fetchHistoricalData = async (): Promise<HistoricalDataResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/locationMetrics/history`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.status}`);
    }
    
    return await response.json();
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
    const params = new URLSearchParams({ months: months.toString() });
    if (locationId) {
      params.append('locationId', locationId);
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/locationMetrics/compare?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comparison data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return {
      success: false,
      data: { metrics: [] }
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
