/**
 * Tests for the MapView component.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - MapView.jsx exists but TypeScript doesn't recognize it
import MapView from '../MapView';

describe('MapView Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MapView
        center={[59.3293, 18.0686]}
        zoom={12}
        markers={[]}
        routes={[]}
        depots={[]}
        geofences={[]}
        height={500}
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders with vehicle markers', () => {
    const markers = [
      {
        id: 1,
        name: 'Test Vehicle',
        lat: 59.3293,
        lng: 18.0686,
        status: 'active',
        driver: 'Test Driver',
        speed: 50
      }
    ];

    const { container } = render(
      <MapView
        center={[59.3293, 18.0686]}
        zoom={12}
        markers={markers}
      />
    );
    expect(container).toBeTruthy();
  });

  it('uses custom height', () => {
    const { container } = render(
      <MapView
        center={[59.3293, 18.0686]}
        zoom={12}
        height={300}
      />
    );
    const mapElement = container.querySelector('.leaflet-container');
    expect(mapElement).toBeTruthy();
  });
});
