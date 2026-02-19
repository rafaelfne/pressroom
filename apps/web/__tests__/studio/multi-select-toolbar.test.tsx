import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelectToolbar } from '@/components/studio/multi-select-toolbar';
import { MultiSelectProvider, useMultiSelect } from '@/lib/puck/multi-select-context';
import type { ComponentData, Data } from '@puckeditor/core';
import type React from 'react';
import { act } from '@testing-library/react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeItem(type: string, id: string): ComponentData {
  return { type, props: { id } };
}

function makeData(content: ComponentData[]): Data {
  return { content, root: {} };
}

const mockData = makeData([
  makeItem('TextBlock', 'a'),
  makeItem('HeadingBlock', 'b'),
]);

/**
 * Helper component that sets up selections before rendering the toolbar.
 */
function ToolbarWithSelection({
  selectIds,
  doCopy = false,
}: {
  selectIds: string[];
  doCopy?: boolean;
}) {
  const multiSelect = useMultiSelect();

  React.useEffect(() => {
    for (const id of selectIds) {
      multiSelect.toggleSelect(id);
    }
    if (doCopy) {
      multiSelect.copy(mockData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MultiSelectToolbar
      getData={() => mockData}
      getDispatch={() => vi.fn()}
    />
  );
}

function renderToolbar(selectIds: string[], doCopy = false) {
  return render(
    <MultiSelectProvider>
      <ToolbarWithSelection selectIds={selectIds} doCopy={doCopy} />
    </MultiSelectProvider>,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('MultiSelectToolbar', () => {
  it('does not render when nothing is selected and no clipboard', () => {
    renderToolbar([]);
    expect(screen.queryByTestId('multi-select-toolbar')).not.toBeInTheDocument();
  });

  it('renders when items are selected', () => {
    renderToolbar(['a', 'b']);
    expect(screen.getByTestId('multi-select-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('selection-count')).toHaveTextContent('2 selected');
  });

  it('shows copy button when items are selected', () => {
    renderToolbar(['a']);
    expect(screen.getByTestId('multi-select-copy')).toBeInTheDocument();
  });

  it('shows cut button when items are selected', () => {
    renderToolbar(['a']);
    expect(screen.getByTestId('multi-select-cut')).toBeInTheDocument();
  });

  it('shows delete button when items are selected', () => {
    renderToolbar(['a']);
    expect(screen.getByTestId('multi-select-delete')).toBeInTheDocument();
  });

  it('shows paste button when clipboard has content', () => {
    renderToolbar(['a'], true);
    expect(screen.getByTestId('multi-select-paste')).toBeInTheDocument();
  });
});
