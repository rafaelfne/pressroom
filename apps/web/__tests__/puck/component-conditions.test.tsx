import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { puckConfig } from '@/lib/puck/config';

// Mock PuckContext
const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(() => <div>Mock Content</div>),
  metadata: {},
};

describe('TextBlock visibilityCondition and margin', () => {
  afterEach(() => {
    cleanup();
  });

  it('accepts visibilityCondition prop', () => {
    const Component = puckConfig.components.TextBlock.render;
    const visibilityCondition = JSON.stringify({ expression: '{{data.show}}', operator: 'truthy' });

    // Should render without error
    const { container } = render(
      <Component
        text="Test"
        fontSize="1rem"
        customFontSize={16}
        lineHeight="1.5"
        customLineHeight={1.5}
        letterSpacing="0em"
        customLetterSpacing={0}
        fontFamily=""
        customFontFamily=""
        color="#000000"
        alignment="left"
        bold="false"
        italic="false"
        pageBreakBehavior="auto"
        visibilityCondition={visibilityCondition}
        marginTop="0"
        marginRight="0"
        marginBottom="0"
        marginLeft="0"
        styleConditions=""
        id="test"
        puck={mockPuckContext}
      />
    );

    expect(container.querySelector('div[style]')).toBeInTheDocument();
  });

  it('applies margin props', () => {
    const Component = puckConfig.components.TextBlock.render;
    const { container } = render(
      <Component
        text="Test"
        fontSize="1rem"
        customFontSize={16}
        lineHeight="1.5"
        customLineHeight={1.5}
        letterSpacing="0em"
        customLetterSpacing={0}
        fontFamily=""
        customFontFamily=""
        color="#000000"
        alignment="left"
        bold="false"
        italic="false"
        pageBreakBehavior="auto"
        visibilityCondition=""
        marginTop="10px"
        marginRight="20px"
        marginBottom="30px"
        marginLeft="40px"
        styleConditions=""
        id="test"
        puck={mockPuckContext}
      />
    );

    const styledDiv = container.querySelector('div[style]');
    expect(styledDiv).toHaveStyle({
      marginTop: '10px',
      marginRight: '20px',
      marginBottom: '30px',
      marginLeft: '40px',
    });
  });
});

describe('HeadingBlock visibilityCondition and margin', () => {
  afterEach(() => {
    cleanup();
  });

  it('accepts visibilityCondition prop', () => {
    const Component = puckConfig.components.HeadingBlock.render;
    const visibilityCondition = JSON.stringify({ expression: '{{data.show}}', operator: 'truthy' });

    // Should render without error
    const { container } = render(
      <Component
        text="Test Heading"
        level="h2"
        color="#000000"
        fontFamily=""
        pageBreakBehavior="auto"
        visibilityCondition={visibilityCondition}
        marginTop="0"
        marginRight="0"
        marginBottom="0"
        marginLeft="0"
        styleConditions=""
        id="test"
        puck={mockPuckContext}
      />
    );

    expect(container.querySelector('h2')).toBeInTheDocument();
  });

  it('applies margin props', () => {
    const Component = puckConfig.components.HeadingBlock.render;
    const { container } = render(
      <Component
        text="Test Heading"
        level="h2"
        color="#000000"
        fontFamily=""
        pageBreakBehavior="auto"
        visibilityCondition=""
        marginTop="5px"
        marginRight="10px"
        marginBottom="15px"
        marginLeft="20px"
        styleConditions=""
        id="test"
        puck={mockPuckContext}
      />
    );

    const heading = container.querySelector('h2');
    expect(heading).toHaveStyle({
      marginTop: '5px',
      marginRight: '10px',
      marginBottom: '15px',
      marginLeft: '20px',
    });
  });
});

describe('FlexBox visibilityCondition and padding', () => {
  afterEach(() => {
    cleanup();
  });

  it('accepts visibilityCondition prop', () => {
    const Component = puckConfig.components.FlexBox.render;
    const visibilityCondition = JSON.stringify({ expression: '{{data.show}}', operator: 'truthy' });

    // Should render without error
    const { container } = render(
      <Component
        direction="column"
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="0"
        padding="0"
        paddingTop=""
        paddingRight=""
        paddingBottom=""
        paddingLeft=""
        backgroundColor="transparent"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        minHeight="0"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        visibilityCondition={visibilityCondition}
        styleConditions=""
        id="test"
        puck={mockPuckContext}
      />
    );

    expect(container.querySelector('div[style]')).toBeInTheDocument();
  });

  it('applies individual padding props', () => {
    const Component = puckConfig.components.FlexBox.render;
    const { container } = render(
      <Component
        direction="column"
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="0"
        padding="0"
        paddingTop="5"
        paddingRight="10"
        paddingBottom="15"
        paddingLeft="20"
        backgroundColor="transparent"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        minHeight="0"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        visibilityCondition=""
        styleConditions=""
        id="test"
        puck={mockPuckContext}
      />
    );

    const flexDiv = container.querySelector('div[style]');
    expect(flexDiv).toHaveStyle({
      padding: '5px 10px 15px 20px',
    });
  });

  it('uses all-sides padding when individual not set', () => {
    const Component = puckConfig.components.FlexBox.render;
    const { container } = render(
      <Component
        direction="column"
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="0"
        padding="16"
        paddingTop=""
        paddingRight=""
        paddingBottom=""
        paddingLeft=""
        backgroundColor="transparent"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        minHeight="0"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        visibilityCondition=""
        styleConditions=""
        id="test"
        puck={mockPuckContext}
      />
    );

    const flexDiv = container.querySelector('div[style]');
    expect(flexDiv).toHaveStyle({
      padding: '16px',
    });
  });

  it('individual padding overrides all-sides padding', () => {
    const Component = puckConfig.components.FlexBox.render;
    const { container } = render(
      <Component
        direction="column"
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap="0"
        padding="16"
        paddingTop="8"
        paddingRight=""
        paddingBottom=""
        paddingLeft=""
        backgroundColor="transparent"
        borderWidth="0"
        borderColor="#e5e7eb"
        borderRadius="0"
        minHeight="0"
        color=""
        fontSize=""
        fontFamily=""
        pageBreakBehavior="auto"
        visibilityCondition=""
        styleConditions=""
        id="test"
        puck={mockPuckContext}
      />
    );

    const flexDiv = container.querySelector('div[style]');
    // When at least one individual padding is set, it uses CSS shorthand
    expect(flexDiv).toHaveStyle({
      padding: '8px 0px 0px 0px',
    });
  });
});

describe('Divider visibilityCondition', () => {
  afterEach(() => {
    cleanup();
  });

  it('accepts visibilityCondition prop', () => {
    const Component = puckConfig.components.Divider.render;
    const visibilityCondition = JSON.stringify({ expression: '{{data.show}}', operator: 'truthy' });

    // Should render without error
    const { container } = render(
      <Component
        orientation="horizontal"
        color="#e5e7eb"
        thickness="1"
        lineStyle="solid"
        pageBreakBehavior="auto"
        visibilityCondition={visibilityCondition}
        id="test"
        puck={mockPuckContext}
      />
    );

    expect(container.querySelector('hr')).toBeInTheDocument();
  });
});
