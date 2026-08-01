// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../components/ProjectList', () => ({
  ProjectList: () => <div>Proyectos List</div>
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({ accessToken: 'mock-token' })
}));

vi.mock('../store/settingsStore', () => ({
  useSettingsStore: (selector: any) => selector({ fetchSettings: vi.fn() })
}));

describe('App Routing', () => {
  it('renders the ProjectList on /projects route', () => {
    window.history.pushState({}, 'Test', '/projects');
    render(<App />);
    expect(screen.getByText(/Proyectos List/i)).toBeInTheDocument();
  });
});
