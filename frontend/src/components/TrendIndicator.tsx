import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { fetchTrendData, getTrendIcon, getTrendColorClass } from '../services/trendApi';
import TrendModal from './TrendModal';

interface TrendIndicatorProps {
  locationId: string;
  locationName: string;
  metric: string;
  metricDisplayName: string;
  currentValue: string;
  target?: string;
  className?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  locationId,
  locationName,
  metric,
  metricDisplayName,
  currentValue,
  target,
  className = ''
}) => {
  const [trend, setTrend] = useState<'improving' | 'declining' | 'stable'>('stable');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (locationId && metric) {
      fetchTrendStatus();
    }
  }, [locationId, metric]);

  const fetchTrendStatus = async () => {
    setLoading(true);
    try {
      const response = await fetchTrendData(locationId, metric, 6);
      
      if (response.success && response.data && response.data.monthsOfData >= 2) {
        setTrend(response.data.trend);
        setHasData(true);
      } else {
        setTrend('stable');
        setHasData(false);
      }
    } catch (error) {
      console.error('Error fetching trend status:', error);
      setTrend('stable');
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setShowModal(true);
  };

  const getTrendDisplayText = (): string => {
    if (!hasData) return 'New Data';
    return trend.charAt(0).toUpperCase() + trend.slice(1);
  };

  const getTrendButtonClass = (): string => {
    const baseClass = 'flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-md transition-all duration-200 cursor-pointer hover:opacity-80 hover:scale-105';
    
    if (!hasData) {
      return `${baseClass} bg-gray-500/20 text-gray-400 border border-gray-500/30`;
    }
    
    switch (trend) {
      case 'improving':
        return `${baseClass} bg-green-500/20 text-green-400 border border-green-500/30`;
      case 'declining':
        return `${baseClass} bg-red-500/20 text-red-400 border border-red-500/30`;
      case 'stable':
        return `${baseClass} bg-blue-500/20 text-blue-400 border border-blue-500/30`;
      default:
        return `${baseClass} bg-gray-500/20 text-gray-400 border border-gray-500/30`;
    }
  };

  const getTrendIconComponent = () => {
    if (loading) {
      return <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
    }
    
    if (!hasData) {
      return <Activity className="w-4 h-4" />;
    }
    
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4" />;
      case 'stable':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`${getTrendButtonClass()} ${className}`}
        title={hasData ? "Click to view detailed trend analysis" : "Not enough data for trend analysis"}
        disabled={loading}
      >
        {getTrendIconComponent()}
        <span className="text-xs">{getTrendDisplayText()}</span>
      </button>

      {showModal && (
        <TrendModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          locationId={locationId}
          locationName={locationName}
          metric={metric}
          metricDisplayName={metricDisplayName}
          target={target}
        />
      )}
    </>
  );
};

export default TrendIndicator;
