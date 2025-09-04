import React, { useState, useEffect, useCallback } from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Award, BarChart3, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CampaignData {
  id: string;
  name: string;
  locationScore: number;
  nationalScore: number;
  goal: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface LocationCampaignData {
  locationName: string;
  campaigns: CampaignData[];
  overallScore: number;
}

interface CampaignMetricsData {
  locations: LocationCampaignData[];
  extractedAt: string;
}

// Backend API base URL
const API_BASE_URL = 'https://wki-service-management-app.onrender.com';

// Helper function to convert backend campaign data to frontend format
const convertBackendCampaignData = (campaignData: any, extractedAt: string): CampaignMetricsData | null => {
  try {
    console.log('Converting backend campaign data:', campaignData);
    
    if (!campaignData) {
      return null;
    }
    
    // Check if we have the new detailed campaign structure from pages 2-3
    if (campaignData.locations && Array.isArray(campaignData.locations)) {
      // New structure with detailed campaigns by location
      const locations: LocationCampaignData[] = campaignData.locations.map((location: any) => {
        const campaigns: CampaignData[] = location.campaigns.map((campaign: any) => ({
          id: campaign.code || campaign.id,
          name: campaign.name || campaign.description,
          locationScore: parseFloat(campaign.closeRate?.replace('%', '')) || 0,
          nationalScore: parseFloat(campaign.nationalRate?.replace('%', '')) || 0,
          goal: parseFloat(campaign.goal?.replace('%', '')) || 100,
          status: getStatusFromScores(
            parseFloat(campaign.closeRate?.replace('%', '')) || 0,
            parseFloat(campaign.nationalRate?.replace('%', '')) || 0,
            parseFloat(campaign.goal?.replace('%', '')) || 100
          )
        }));
        
        const overallScore = campaigns.reduce((sum, camp) => sum + camp.locationScore, 0) / campaigns.length;
        
        return {
          locationName: location.name,
          campaigns,
          overallScore
        };
      });
      
      return {
        locations,
        extractedAt
      };
    }
    
    // Fallback for old campaign completion rates structure
    const campaignCompletionRates = campaignData.campaignCompletionRates || campaignData;
    
    // Create campaigns based on the legacy backend data structure
    const campaigns: CampaignData[] = [
      {
        id: 'cases-closed-correctly',
        name: 'Cases Closed Correctly',
        locationScore: parseFloat(campaignCompletionRates.casesClosedCorrectly?.replace('%', '')) || 0,
        nationalScore: parseFloat(campaignCompletionRates.nationalAverage?.replace('%', '')) || 100,
        goal: parseFloat(campaignCompletionRates.goal?.replace('%', '')) || 100,
        status: getStatusFromScores(
          parseFloat(campaignCompletionRates.casesClosedCorrectly?.replace('%', '')) || 0,
          parseFloat(campaignCompletionRates.nationalAverage?.replace('%', '')) || 100,
          parseFloat(campaignCompletionRates.goal?.replace('%', '')) || 100
        )
      },
      {
        id: 'cases-meeting-requirements',
        name: 'Cases Meeting Requirements',
        locationScore: parseFloat(campaignCompletionRates.casesMeetingRequirements?.replace('%', '')) || 0,
        nationalScore: parseFloat(campaignCompletionRates.nationalAverage?.replace('%', '')) || 100,
        goal: parseFloat(campaignCompletionRates.goal?.replace('%', '')) || 100,
        status: getStatusFromScores(
          parseFloat(campaignCompletionRates.casesMeetingRequirements?.replace('%', '')) || 0,
          parseFloat(campaignCompletionRates.nationalAverage?.replace('%', '')) || 100,
          parseFloat(campaignCompletionRates.goal?.replace('%', '')) || 100
        )
      },
      {
        id: 'overall-completion',
        name: 'Overall Campaign Completion',
        locationScore: parseFloat(campaignCompletionRates.overallCompletionRate?.replace('%', '')) || 0,
        nationalScore: parseFloat(campaignCompletionRates.nationalAverage?.replace('%', '')) || 100,
        goal: parseFloat(campaignCompletionRates.goal?.replace('%', '')) || 100,
        status: getStatusFromScores(
          parseFloat(campaignCompletionRates.overallCompletionRate?.replace('%', '')) || 0,
          parseFloat(campaignCompletionRates.nationalAverage?.replace('%', '')) || 100,
          parseFloat(campaignCompletionRates.goal?.replace('%', '')) || 100
        )
      },
      {
        id: 'customer-satisfaction',
        name: 'Customer Satisfaction',
        locationScore: parseFloat(campaignCompletionRates.customerSatisfaction?.replace('%', '')) || 0,
        nationalScore: 85, // Typical benchmark for customer satisfaction
        goal: 95,
        status: getStatusFromScores(
          parseFloat(campaignCompletionRates.customerSatisfaction?.replace('%', '')) || 0,
          85,
          95
        )
      }
    ];
    
    // Calculate overall score
    const overallScore = campaigns.reduce((sum, camp) => sum + camp.locationScore, 0) / campaigns.length;
    
    return {
      locations: [{
        locationName: 'All Locations', // Backend data represents aggregate
        campaigns,
        overallScore
      }],
      extractedAt
    };
    
  } catch (error) {
    console.error('Error converting backend campaign data:', error);
    return null;
  }
};

// Helper function to determine status based on performance vs national and goal
const getStatusFromScores = (locationScore: number, nationalScore: number, goal: number = 100): 'excellent' | 'good' | 'warning' | 'critical' => {
  if (locationScore >= goal) return 'excellent';
  if (locationScore >= nationalScore * 0.9) return 'good';
  if (locationScore >= nationalScore * 0.7) return 'warning';
  return 'critical';
};

// Helper function to create campaign metrics from location data
const createCampaignMetricsFromLocations = (backendData: any): CampaignMetricsData | null => {
  try {
    let dealership: any, locations: any[] = [], extractedAt: string | undefined;
    
    // Handle different response structures
    if (backendData && typeof backendData === 'object') {
      if ('dealership' in backendData && 'locations' in backendData) {
        ({ dealership, locations, extractedAt } = backendData);
      } else if ('data' in backendData && backendData.data && typeof backendData.data === 'object') {
        if ('dealership' in backendData.data && 'locations' in backendData.data) {
          ({ dealership, locations, extractedAt } = backendData.data);
        }
      }
    }

    if (!locations || locations.length === 0) {
      return null;
    }

    // Use actual campaign data from PDF parsing if available
    const campaignLocations: LocationCampaignData[] = locations.map((location: any) => {
      // If the location has campaign data from PDF parsing, use it
      if (location.campaigns && location.campaigns.length > 0) {
        const overallScore = location.campaigns.reduce((sum: number, camp: CampaignData) => sum + camp.locationScore, 0) / location.campaigns.length;
        
        return {
          locationName: location.name,
          campaigns: location.campaigns.map((campaign: any) => ({
            id: campaign.campaignId,
            name: campaign.campaignName,
            locationScore: campaign.locationScore,
            nationalScore: campaign.nationalScore,
            goal: campaign.goal,
            status: campaign.status || getStatusFromScores(campaign.locationScore, campaign.nationalScore, campaign.goal)
          })),
          overallScore
        };
      }
      
      // Fallback: Create derived campaigns from service metrics (for backwards compatibility)
      const campaigns: CampaignData[] = [
        {
          id: 'vsc-compliance',
          name: 'VSC Compliance Campaign',
          locationScore: parseFloat(location.vscCaseRequirements?.toString().replace('%', '')) || 0,
          nationalScore: 85, // National average benchmark
          goal: 95,
          status: getStatusFromScores(
            parseFloat(location.vscCaseRequirements?.toString().replace('%', '')) || 0,
            85,
            95
          )
        },
        {
          id: 'triage-efficiency',
          name: 'Triage Efficiency Campaign',
          locationScore: parseFloat(location.triagePercentLess4Hours?.toString().replace('%', '')) || 0,
          nationalScore: 75, // National average benchmark
          goal: 80,
          status: getStatusFromScores(
            parseFloat(location.triagePercentLess4Hours?.toString().replace('%', '')) || 0,
            75,
            80
          )
        },
        {
          id: 'case-quality',
          name: 'Case Quality Campaign',
          locationScore: Math.max(0, 100 - (parseFloat(location.percentCasesWith3Notes?.toString().replace('%', '')) || 0)),
          nationalScore: 95, // Inverted metric - fewer notes is better
          goal: 98,
          status: getStatusFromScores(
            Math.max(0, 100 - (parseFloat(location.percentCasesWith3Notes?.toString().replace('%', '')) || 0)),
            95,
            98
          )
        },
        {
          id: 'tech-activation',
          name: 'TT+ Activation Campaign',
          locationScore: parseFloat(location.ttActivation?.toString().replace('%', '')) || 0,
          nationalScore: 85, // National average benchmark
          goal: 90,
          status: getStatusFromScores(
            parseFloat(location.ttActivation?.toString().replace('%', '')) || 0,
            85,
            90
          )
        }
      ];

      const overallScore = campaigns.reduce((sum, camp) => sum + camp.locationScore, 0) / campaigns.length;

      return {
        locationName: location.name,
        campaigns,
        overallScore
      };
    });

    return {
      locations: campaignLocations,
      extractedAt: extractedAt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating campaign data from locations:', error);
    return null;
  }
};

// Note: Campaign data should come from legitimate scorecard uploads
// Mock data removed - only show real data

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent':
      return 'from-green-600 to-green-700 border-green-500';
    case 'good':
      return 'from-blue-600 to-blue-700 border-blue-500';
    case 'warning':
      return 'from-yellow-600 to-yellow-700 border-yellow-500';
    case 'critical':
      return 'from-red-600 to-red-700 border-red-500';
    default:
      return 'from-gray-600 to-gray-700 border-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'excellent':
      return <Award className="w-5 h-5 text-green-300" />;
    case 'good':
      return <CheckCircle className="w-5 h-5 text-blue-300" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-300" />;
    case 'critical':
      return <TrendingDown className="w-5 h-5 text-red-300" />;
    default:
      return <BarChart3 className="w-5 h-5 text-gray-300" />;
  }
};

export default function CampaignMetrics() {
  const [campaignData, setCampaignData] = useState<CampaignMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch campaign data from the new backend endpoint
  const fetchCampaignData = useCallback(async () => {
    setIsLoading(true);
    try {
      // First, try the dedicated campaign endpoint
      console.log('Fetching from dedicated campaign endpoint...');
      let campaignResponse = null;
      
      try {
        campaignResponse = await fetch(`${API_BASE_URL}/api/locationMetrics/campaigns`);
        if (campaignResponse.ok) {
          const campaignData = await campaignResponse.json();
          console.log('Campaign endpoint response:', campaignData);
          
          if (campaignData.success && campaignData.data && campaignData.data.campaignCompletionRates) {
            const { campaignCompletionRates, extractedAt, month, year, fileName } = campaignData.data;
            
            // Convert backend campaign data to frontend format
            const convertedData = convertBackendCampaignData(campaignCompletionRates, extractedAt);
            
            if (convertedData) {
              setCampaignData(convertedData);
              setLastUpdated(new Date(extractedAt).toLocaleString());
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (campaignError) {
        console.warn('Dedicated campaign endpoint failed, trying main endpoint:', campaignError);
      }

      // Fallback: Check main endpoint for campaign data in dealership metrics
      console.log('Fetching from main locationMetrics endpoint...');
      const response = await fetch(`${API_BASE_URL}/api/locationMetrics`);
      if (response.ok) {
        const data = await response.json();
        console.log('Main endpoint response:', data);
        
        // Check if campaign data is included in dealership metrics
        if (data.success && data.data && data.data.dealership && data.data.dealership.campaignCompletionRates) {
          const { campaignCompletionRates, extractedAt } = data.data;
          
          const convertedData = convertBackendCampaignData(campaignCompletionRates, extractedAt);
          
          if (convertedData) {
            setCampaignData(convertedData);
            setLastUpdated(new Date(extractedAt).toLocaleString());
            setIsLoading(false);
            return;
          }
        }
        
        // Final fallback: Use existing location-based approach
        const parsedData = createCampaignMetricsFromLocations(data);
        console.log('Fallback parsed campaign data:', parsedData);
        
        if (parsedData) {
          setCampaignData(parsedData);
          setLastUpdated(new Date(parsedData.extractedAt).toLocaleString());
        } else {
          setCampaignData(null);
          setLastUpdated(null);
        }
      } else {
        setCampaignData(null);
        setLastUpdated(null);
      }
    } catch (error) {
      console.error('Error fetching campaign data:', error);
      setCampaignData(null);
      setLastUpdated(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaignData();
    
    // Listen for scorecard upload events to refresh campaign data
    const handleScorecardUploaded = () => {
      console.log('Scorecard uploaded event received, refreshing campaign data...');
      fetchCampaignData();
    };
    
    window.addEventListener('scorecardUploaded', handleScorecardUploaded);
    
    return () => {
      window.removeEventListener('scorecardUploaded', handleScorecardUploaded);
    };
  }, [fetchCampaignData]);

  // Listen for scorecard upload events for immediate refresh
  useEffect(() => {
    const handleScorecardUpload = () => {
      console.log('CampaignMetrics: New scorecard uploaded, refreshing data...');
      fetchCampaignData();
    };

    window.addEventListener('scorecardUploaded', handleScorecardUpload);
    return () => {
      window.removeEventListener('scorecardUploaded', handleScorecardUpload);
    };
  }, [fetchCampaignData]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading campaign metrics...</p>
        </div>
      </div>
    );
  }

  // Show empty state when no legitimate campaign data is available
  if (!campaignData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link 
            to="/metrics" 
            className="flex items-center text-red-400 hover:text-red-300 mr-4 transition-colors"
          >
            <ArrowLeft size={24} className="mr-2" />
            Back to Metrics
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
            Campaign Completion Metrics
          </h1>
          <p className="text-xl text-slate-300">
            Track campaign completion rates across all locations
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Campaign Data Available</h2>
          <p className="text-slate-300 mb-6">
            Campaign completion metrics from pages 2-3 of the W370 Service Scorecard will appear once uploaded. 
            This includes specific campaign codes (24KWL, E311, E316, E327, etc.), close rates by location, national averages, and goal tracking for campaign performance across all Kenworth dealerships.
          </p>
        </div>
      </div>
    );
  }

  const filteredLocations = selectedLocation === 'all' 
    ? campaignData.locations 
    : campaignData.locations.filter(loc => 
        loc.locationName.toLowerCase().replace(/\s+/g, '-') === selectedLocation
      );

  // Calculate overall statistics
  const allCampaigns = campaignData.locations.flatMap(loc => loc.campaigns);
  const totalCampaigns = allCampaigns.length;
  const excellentCount = allCampaigns.filter(c => c.status === 'excellent').length;
  const criticalCount = allCampaigns.filter(c => c.status === 'critical').length;
  const avgScore = allCampaigns.reduce((sum, c) => sum + c.locationScore, 0) / totalCampaigns;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link 
            to="/metrics" 
            className="flex items-center text-red-400 hover:text-red-300 mr-6 transition-colors"
          >
            <ArrowLeft size={24} className="mr-2" />
            Back to Metrics
          </Link>
        </div>
        <button
          onClick={fetchCampaignData}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
          Campaign Completion Metrics
        </h1>
        <p className="text-xl text-slate-300 mb-2">
          Service Campaign Performance Tracking
        </p>
        {lastUpdated && (
          <p className="text-slate-400">
            Last Updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{totalCampaigns}</span>
          </div>
          <p className="text-slate-300 font-medium">Total Campaigns</p>
          <p className="text-slate-400 text-sm">Across all locations</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-green-400">{excellentCount}</span>
          </div>
          <p className="text-slate-300 font-medium">At Goal (100%)</p>
          <p className="text-slate-400 text-sm">{((excellentCount / totalCampaigns) * 100).toFixed(1)}% of campaigns</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-400" />
            <span className="text-2xl font-bold text-red-400">{criticalCount}</span>
          </div>
          <p className="text-slate-300 font-medium">Critical Performance</p>
          <p className="text-slate-400 text-sm">{((criticalCount / totalCampaigns) * 100).toFixed(1)}% need attention</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{avgScore.toFixed(1)}%</span>
          </div>
          <p className="text-slate-300 font-medium">Average Score</p>
          <p className="text-slate-400 text-sm">Overall completion rate</p>
        </div>
      </div>

      {/* Location Filter */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex flex-wrap gap-2">
            <span className="text-slate-300 font-medium mr-4">Filter by Location:</span>
            <button
              onClick={() => setSelectedLocation('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLocation === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All Locations
            </button>
            {campaignData.locations.map(location => (
              <button
                key={location.locationName}
                onClick={() => setSelectedLocation(location.locationName.toLowerCase().replace(/\s+/g, '-'))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedLocation === location.locationName.toLowerCase().replace(/\s+/g, '-')
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {location.locationName.replace(' Kenworth', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Data by Location */}
      <div className="space-y-8">
        {filteredLocations.map((location) => (
          <div key={location.locationName} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
            {/* Location Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{location.locationName}</h2>
                <p className="text-slate-400">
                  Overall Score: <span className={`font-bold ${
                    location.overallScore >= 80 ? 'text-green-400' : 
                    location.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {location.overallScore.toFixed(1)}%
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Campaigns</p>
                <p className="text-2xl font-bold text-white">{location.campaigns.length}</p>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid gap-4">
              {location.campaigns.map((campaign) => (
                <div key={campaign.id} className={`bg-gradient-to-r ${getStatusColor(campaign.status)} rounded-xl p-4 border-2`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getStatusIcon(campaign.status)}
                        <h3 className="text-white font-semibold ml-2 text-sm">{campaign.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-white/80">Location Score</p>
                          <p className="text-2xl font-bold text-white">{campaign.locationScore}%</p>
                        </div>
                        <div>
                          <p className="text-white/80">National Average</p>
                          <p className="text-lg font-semibold text-white/90">{campaign.nationalScore}%</p>
                        </div>
                        <div>
                          <p className="text-white/80">Goal</p>
                          <p className="text-lg font-semibold text-white/90">{campaign.goal}%</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${Math.min(campaign.locationScore, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-white/70 mt-1">
                          <span>0%</span>
                          <span>Goal: {campaign.goal}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
