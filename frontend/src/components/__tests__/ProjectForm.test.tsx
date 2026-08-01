// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectForm } from '../ProjectForm';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('ProjectForm', () => {
  it('renders all 13 fields including total_effort, priority_strategy, priority_constant, business_value', () => {
    render(<ProjectForm open={true} onSubmit={vi.fn()} onClose={vi.fn()} />);
    
    expect(screen.getByText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/responsable/i)).toBeInTheDocument();
    expect(screen.getByText(/estado/i)).toBeInTheDocument();
    expect(screen.getByText(/prioridad/i)).toBeInTheDocument();
    expect(screen.getByText(/fecha límite/i)).toBeInTheDocument();
    expect(screen.getByText(/siguiente paso/i)).toBeInTheDocument();
    expect(screen.getByText(/bloqueos/i)).toBeInTheDocument();
    expect(screen.getByText(/notas/i)).toBeInTheDocument();
    expect(screen.getByText(/tipo de proyecto/i)).toBeInTheDocument();

    expect(screen.getByText(/total effort/i)).toBeInTheDocument();
    expect(screen.getByText(/priority strategy/i)).toBeInTheDocument();
    expect(screen.getByText(/priority constant/i)).toBeInTheDocument();
    expect(screen.getByText(/business value/i)).toBeInTheDocument();
  });
});
