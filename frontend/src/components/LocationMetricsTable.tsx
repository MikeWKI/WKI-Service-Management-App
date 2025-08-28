import React, { useEffect, useState } from 'react';

interface LocationMetric {
  location: string;
  [key: string]: string | number;
}

const LocationMetricsTable: React.FC = () => {
  const [metrics, setMetrics] = useState<LocationMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/location-metrics');
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const data = await res.json();
        setMetrics(data.metrics || []);
      } catch (err) {
        setError('Could not load metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className="text-blue-600">Loading metrics...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!metrics.length) return <div className="text-gray-500">No metrics available.</div>;

  // Get all unique columns
  const columns = Array.from(
    metrics.reduce((cols, row) => {
      Object.keys(row).forEach((k) => cols.add(k));
      return cols;
    }, new Set<string>(['location']))
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-300 rounded-lg">
        <thead>
          <tr className="bg-slate-200">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left text-xs font-bold text-slate-700 border-b">
                {col.charAt(0).toUpperCase() + col.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((row, i) => (
            <tr key={i} className="even:bg-slate-50">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 text-xs border-b">
                  {row[col] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LocationMetricsTable;
