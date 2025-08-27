import React from 'react';
import LocationSpecificMetrics from './LocationSpecificMetrics';

export default function DodgeCityMetrics() {
  return (
    <LocationSpecificMetrics 
      locationId="dodge-city"
      locationName="Dodge City"
      locationColor="from-purple-500 to-purple-600"
    />
  );
}
