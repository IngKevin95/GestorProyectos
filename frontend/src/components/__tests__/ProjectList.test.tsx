// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectList } from '../ProjectList';
import * as apiService from '../../services/apiService';

vi.mock('../../services/apiService');

describe('ProjectList', () => {
  it('maps estado to status in getProjects', async () => {
    const getProjectsMock = vi.mocked(apiService.getProjects).mockResolvedValue({ data: [], pagination: { has_more: false, limit: 50 } });
    
    render(<ProjectList 
      projects={[]} 
      onViewDetail={vi.fn()} 
      onEdit={vi.fn()} 
      onDelete={vi.fn()}
      onFilterChange={(f) => {
        apiService.getProjects(50, undefined, f.estado);
      }} 
    />);
    
    // Trigger a filter change to "Activo"
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Activo' } });

    await waitFor(() => {
      expect(getProjectsMock).toHaveBeenCalledWith(50, undefined, 'Activo');
    });
  });
});
