import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { puckConfig } from '@/lib/puck/config';

const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(),
  metadata: {},
};

describe('Data-bound Components', () => {
  afterEach(() => {
    cleanup();
  });

  describe('DataTable', () => {
    it('renders with default props', () => {
      const defaults = puckConfig.components.DataTable.defaultProps!;
      const Component = puckConfig.components.DataTable.render;
      const { container } = render(<Component {...defaults} id="test" puck={mockPuckContext} />);
      expect(container).toBeTruthy();
    });
  });
});
