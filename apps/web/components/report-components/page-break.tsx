import type { ComponentConfig } from '@puckeditor/core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PageBreakProps = {};

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
