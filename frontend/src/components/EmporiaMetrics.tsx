import React from 'react';
import LocationSpecificMetrics from './LocationSpecificMetrics';

export default function EmporiaMetrics() {
  return (
    <LocationSpecificMetrics 
      locationId="emporia"
      locationName="Emporia"
      locationColor="from-green-500 to-green-600"
    />
  );
}
