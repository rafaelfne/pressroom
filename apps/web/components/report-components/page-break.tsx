import type { ComponentConfig } from '@puckeditor/core';

export type PageBreakProps = Record<string, never>;

export const PageBreak: ComponentConfig<PageBreakProps> = {
  label: 'Page Break',
  fields: {},
  defaultProps: {},
  render: () => (
    <div
      style={{ pageBreakBefore: 'always' }}
      className="border-t-2 border-dashed border-gray-300 my-4 text-center text-xs text-gray-400"
      aria-hidden="true"
    >
      — Page Break —
    </div>
  ),
};
