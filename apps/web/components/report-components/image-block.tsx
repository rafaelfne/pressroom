import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type ImageBlockProps = {
  src: string;
  alt: string;
  width: string;
  height: string;
  pageBreakBehavior: PageBreakBehavior;
};

export const ImageBlock: ComponentConfig<ImageBlockProps> = {
  label: 'Image Block',
  fields: {
    src: { type: 'text', label: 'Image URL' },
    alt: { type: 'text', label: 'Alt Text' },
    width: { type: 'text', label: 'Width (e.g. 200px)' },
    height: { type: 'text', label: 'Height (e.g. auto)' },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    src: '',
    alt: 'Image',
    width: '100%',
    height: 'auto',
    pageBreakBehavior: 'auto',
  },
  render: ({ src, alt, width, height, pageBreakBehavior }) => (
    <div className="p-2" style={getPageBreakStyle(pageBreakBehavior)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} style={{ width, height, display: 'block' }} />
      ) : (
        <div
          style={{ width: '100%', height: '150px' }}
          className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50 text-gray-400"
        >
          No image source
        </div>
      )}
    </div>
  ),
};
