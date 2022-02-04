import { render, screen } from '@testing-library/react';
import App from './App';

test(`should be able to display 'Log in to Spotify'`, () => {
  render(<App />);
  const linkElement = screen.getByText(/log in to/i);
  expect(linkElement).toBeInTheDocument();
});
