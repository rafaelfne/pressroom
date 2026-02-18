'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Render, type Data } from '@puckeditor/core';
import { puckConfig } from '@/lib/puck/config';
import { resolveBindings } from '@/lib/binding';
import {
  parseStoredHeaderFooterConfig,
  type HeaderFooterConfig,
  type ZoneContent,
} from '@/lib/types/header-footer-config';

interface ResolvedPage {
  id: string;
  name: string;
  content: Data;
}

/**
 * Parse template data into pages, supporting both single-page and multi-page formats.
 */
function parsePages(
  templateData: unknown,
  sampleData: Record<string, unknown>,
): ResolvedPage[] {
  if (!templateData || typeof templateData !== 'object') {
    return [];
  }

  const data = templateData as Record<string, unknown>;

  // Multi-page format: { pages: [{ id, name, content }] }
  if (Array.isArray(data.pages) && data.pages.length > 0) {
    return (data.pages as Array<Record<string, unknown>>).map((page, index) => ({
      id: (page.id as string) || `page-${index}`,
      name: (page.name as string) || `Page ${index + 1}`,
      content: resolveBindings(page.content as Data, sampleData) as Data,
    }));
  }

  // Single-page format: { content: [...], root: {...} }
  if (Array.isArray(data.content)) {
    return [
      {
        id: 'page-1',
        name: 'Page 1',
        content: resolveBindings(templateData as Data, sampleData) as Data,
      },
    ];
  }

  return [];
}

/**
 * Render a single zone content for the preview (plain HTML, not Puppeteer).
 */
function ZoneRenderer({ zone, data }: { zone: ZoneContent; data: Record<string, unknown> }) {
  if (zone.type === 'empty') return null;

  if (zone.type === 'text') {
    const resolved = resolveBindings(zone.value, data);
    return (
      <span
        style={{
          fontSize: zone.fontSize ? `${zone.fontSize}pt` : undefined,
          fontWeight: zone.fontWeight,
          color: zone.color,
        }}
      >
        {String(resolved)}
      </span>
    );
  }

  if (zone.type === 'pageNumber') {
    // Static placeholder in preview
    const label = zone.format
      .replace('{page}', '1')
      .replace('{total}', '1');
    return (
      <span
        style={{
          fontSize: zone.fontSize ? `${zone.fontSize}pt` : undefined,
          fontWeight: zone.fontWeight,
          color: zone.color,
        }}
      >
        {label}
      </span>
    );
  }

  if (zone.type === 'image') {
    const resolvedSrc = String(resolveBindings(zone.src, data));
    return (
      <img
        src={resolvedSrc}
        alt={zone.alt ?? ''}
        style={{ height: zone.height ? `${zone.height}mm` : undefined, verticalAlign: 'middle' }}
      />
    );
  }

  return null;
}

function HeaderBand({
  config,
  data,
}: {
  config: NonNullable<HeaderFooterConfig['header']>;
  data: Record<string, unknown>;
}) {
  const borderStyle = config.bottomBorder?.enabled
    ? `${config.bottomBorder.thickness ?? 1}px solid ${config.bottomBorder.color ?? '#e5e7eb'}`
    : 'none';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: `${config.height}px`,
        padding: '0 32px',
        backgroundColor: config.backgroundColor ?? 'transparent',
        borderBottom: borderStyle,
        fontSize: '10pt',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
        <ZoneRenderer zone={config.zones.left} data={data} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <ZoneRenderer zone={config.zones.center} data={data} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
        <ZoneRenderer zone={config.zones.right} data={data} />
      </div>
    </div>
  );
}

function FooterBand({
  config,
  data,
}: {
  config: NonNullable<HeaderFooterConfig['footer']>;
  data: Record<string, unknown>;
}) {
  const borderStyle = config.topBorder?.enabled
    ? `${config.topBorder.thickness ?? 1}px solid ${config.topBorder.color ?? '#e5e7eb'}`
    : 'none';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: `${config.height}px`,
        padding: '0 32px',
        backgroundColor: config.backgroundColor ?? 'transparent',
        borderTop: borderStyle,
        fontSize: '10pt',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
        <ZoneRenderer zone={config.zones.left} data={data} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <ZoneRenderer zone={config.zones.center} data={data} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
        <ZoneRenderer zone={config.zones.right} data={data} />
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const params = useParams<{ templateId: string }>();
  const templateId = params.templateId;
  const [pages, setPages] = useState<ResolvedPage[] | null>(null);
  const [sampleData, setSampleData] = useState<Record<string, unknown>>({});
  const [headerFooterConfig, setHeaderFooterConfig] = useState<HeaderFooterConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (response.ok) {
          const template = await response.json();
          const data =
            template.sampleData && typeof template.sampleData === 'object'
              ? (template.sampleData as Record<string, unknown>)
              : {};
          setSampleData(data);
          const resolvedPages = parsePages(template.templateData, data);
          setPages(resolvedPages);
          if (template.headerFooterConfig) {
            setHeaderFooterConfig(parseStoredHeaderFooterConfig(template.headerFooterConfig));
          }
        } else {
          setError('Template not found');
        }
      } catch (err) {
        console.error('[Preview] Failed to load template:', err);
        setError('Failed to load template');
      }
    }
    loadTemplate();
  }, [templateId]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!pages) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  const showHeader = headerFooterConfig?.header?.enabled === true;
  const showFooter = headerFooterConfig?.footer?.enabled === true;

  return (
    <div className="min-h-screen bg-white" data-testid="studio-preview">
      {pages.map((page, index) => (
        <div key={page.id}>
          {showHeader && headerFooterConfig?.header && (
            <HeaderBand config={headerFooterConfig.header} data={sampleData} />
          )}
          <div className="p-8">
            <Render config={puckConfig} data={page.content} />
          </div>
          {showFooter && headerFooterConfig?.footer && (
            <FooterBand config={headerFooterConfig.footer} data={sampleData} />
          )}
          {index < pages.length - 1 && (
            <hr className="my-0 border-t-2 border-dashed border-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}
