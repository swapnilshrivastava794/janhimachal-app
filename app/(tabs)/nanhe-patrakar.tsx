import React from 'react';
import NanhePatrakarContainer from '../nanhe-patrakar-container';

/**
 * This is a proxy component for the 'Nanhe Patrakar' tab.
 * It redirects users to the Nanhe Patrakar Hub or Home based on their status.
 * FOR NOW: It redirects to the Hub (Wall of Fame) as the primary entry point.
 */
export default function NanhePatrakarTab() {
  return <NanhePatrakarContainer />;
}
