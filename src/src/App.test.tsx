import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { SunburstChart } from './SunburstChart';

test('renders SunburstChart', () => {
  render(<App />);
  const linkElement = screen.getByAltText(/SVGSVGElement/i);
  expect(SunburstChart).toBeInTheDocument();
  expect(linkElement).toBeInTheDocument();
});
