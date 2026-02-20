import type { ComponentConfig } from '@puckeditor/core';
import { getPageBreakStyle, pageBreakField, type PageBreakBehavior } from '@/lib/utils/page-break';

export type EditorialStackProps = {
  card1Title: string;
  card1Description: string;
  card2Title: string;
  card2Description: string;
  card3Title: string;
  card3Description: string;
  pageBreakBehavior: PageBreakBehavior;
};

export const EditorialStack: ComponentConfig<EditorialStackProps> = {
  label: 'Editorial Stack',
  fields: {
    card1Title: { type: 'text', label: 'Card 1 Title' },
    card1Description: { type: 'textarea', label: 'Card 1 Description' },
    card2Title: { type: 'text', label: 'Card 2 Title' },
    card2Description: { type: 'textarea', label: 'Card 2 Description' },
    card3Title: { type: 'text', label: 'Card 3 Title' },
    card3Description: { type: 'textarea', label: 'Card 3 Description' },
    pageBreakBehavior: pageBreakField,
  },
  defaultProps: {
    card1Title: 'Card 1 Title',
    card1Description: 'Description for card 1',
    card2Title: 'Card 2 Title',
    card2Description: 'Description for card 2',
    card3Title: 'Card 3 Title',
    card3Description: 'Description for card 3',
    pageBreakBehavior: 'auto',
  },
  render: ({
    card1Title,
    card1Description,
    card2Title,
    card2Description,
    card3Title,
    card3Description,
    pageBreakBehavior,
  }) => {
    const stackContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      ...getPageBreakStyle(pageBreakBehavior),
    };

    const cardStyle: React.CSSProperties = {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
    };

    const titleStyle: React.CSSProperties = {
      fontSize: '1.125rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.75rem',
    };

    const descriptionStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      color: '#6b7280',
      lineHeight: '1.6',
    };

    return (
      <div style={stackContainerStyle}>
        <div style={cardStyle}>
          <div style={titleStyle}>{card1Title}</div>
          <div style={descriptionStyle}>{card1Description}</div>
        </div>
        <div style={cardStyle}>
          <div style={titleStyle}>{card2Title}</div>
          <div style={descriptionStyle}>{card2Description}</div>
        </div>
        <div style={cardStyle}>
          <div style={titleStyle}>{card3Title}</div>
          <div style={descriptionStyle}>{card3Description}</div>
        </div>
      </div>
    );
  },
};
