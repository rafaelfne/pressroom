import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { puckConfig } from '@/lib/puck/config';
import { InheritedStylesProvider } from '@/contexts/inherited-styles-context';

// Mock PuckContext
const mockPuckContext = {
  isEditing: false,
  dragRef: null,
  renderDropZone: vi.fn(),
  metadata: {},
};

describe('TextBlock inheritance', () => {
  afterEach(() => {
    cleanup();
  });

  it('uses inherited color when own color is default', () => {
    const Component = puckConfig.components.TextBlock.render;
    const { container } = render(
      <InheritedStylesProvider styles={{ color: '#ff0000' }}>
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
          marginTop="0"
          marginRight="0"
          marginBottom="0"
          marginLeft="0"
          id="test" 
          puck={mockPuckContext} 
        />
      </InheritedStylesProvider>
    );
    
    const styledDiv = container.querySelector('div[style]');
    expect(styledDiv).toHaveStyle({ color: '#ff0000' });
  });

  it('overrides inherited color when own color is set', () => {
    const Component = puckConfig.components.TextBlock.render;
    const { container } = render(
      <InheritedStylesProvider styles={{ color: '#ff0000' }}>
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
          color="#0000ff" 
          alignment="left" 
          bold="false" 
          italic="false" 
          pageBreakBehavior="auto"
          visibilityCondition=""
          marginTop="0"
          marginRight="0"
          marginBottom="0"
          marginLeft="0"
          id="test" 
          puck={mockPuckContext} 
        />
      </InheritedStylesProvider>
    );
    
    const styledDiv = container.querySelector('div[style]');
    expect(styledDiv).toHaveStyle({ color: '#0000ff' });
  });

  it('uses inherited fontFamily when own fontFamily is empty', () => {
    const Component = puckConfig.components.TextBlock.render;
    const { container } = render(
      <InheritedStylesProvider styles={{ fontFamily: 'Roboto' }}>
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
          marginTop="0"
          marginRight="0"
          marginBottom="0"
          marginLeft="0"
          id="test" 
          puck={mockPuckContext} 
        />
      </InheritedStylesProvider>
    );
    
    const styledDiv = container.querySelector('div[style]');
    expect(styledDiv).toHaveStyle({ fontFamily: '"Roboto", sans-serif' });
  });

  it('uses inherited fontSize when own fontSize is default', () => {
    const Component = puckConfig.components.TextBlock.render;
    const { container } = render(
      <InheritedStylesProvider styles={{ fontSize: '2rem' }}>
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
          marginTop="0"
          marginRight="0"
          marginBottom="0"
          marginLeft="0"
          id="test" 
          puck={mockPuckContext} 
        />
      </InheritedStylesProvider>
    );
    
    const styledDiv = container.querySelector('div[style]');
    expect(styledDiv).toHaveStyle({ fontSize: '2rem' });
  });
});

describe('HeadingBlock inheritance', () => {
  afterEach(() => {
    cleanup();
  });

  it('uses inherited color when own color is default', () => {
    const Component = puckConfig.components.HeadingBlock.render;
    const { container } = render(
      <InheritedStylesProvider styles={{ color: '#ff0000' }}>
        <Component 
          text="Test Heading" 
          level="h2" 
          color="#000000" 
          fontFamily=""
          pageBreakBehavior="auto"
          visibilityCondition=""
          marginTop="0"
          marginRight="0"
          marginBottom="0"
          marginLeft="0"
          id="test" 
          puck={mockPuckContext} 
        />
      </InheritedStylesProvider>
    );
    
    const heading = container.querySelector('h2');
    expect(heading).toHaveStyle({ color: '#ff0000' });
  });

  it('overrides inherited color when own color is set', () => {
    const Component = puckConfig.components.HeadingBlock.render;
    const { container } = render(
      <InheritedStylesProvider styles={{ color: '#ff0000' }}>
        <Component 
          text="Test Heading" 
          level="h2" 
          color="#0000ff" 
          fontFamily=""
          pageBreakBehavior="auto"
          visibilityCondition=""
          marginTop="0"
          marginRight="0"
          marginBottom="0"
          marginLeft="0"
          id="test" 
          puck={mockPuckContext} 
        />
      </InheritedStylesProvider>
    );
    
    const heading = container.querySelector('h2');
    expect(heading).toHaveStyle({ color: '#0000ff' });
  });

  it('uses inherited fontFamily when own fontFamily is empty', () => {
    const Component = puckConfig.components.HeadingBlock.render;
    const { container } = render(
      <InheritedStylesProvider styles={{ fontFamily: 'Roboto' }}>
        <Component 
          text="Test Heading" 
          level="h2" 
          color="#000000" 
          fontFamily=""
          pageBreakBehavior="auto"
          visibilityCondition=""
          marginTop="0"
          marginRight="0"
          marginBottom="0"
          marginLeft="0"
          id="test" 
          puck={mockPuckContext} 
        />
      </InheritedStylesProvider>
    );
    
    const heading = container.querySelector('h2');
    expect(heading).toHaveStyle({ fontFamily: '"Roboto", sans-serif' });
  });
});

describe('Components without InheritedStylesProvider', () => {
  afterEach(() => {
    cleanup();
  });

  it('TextBlock works without provider (uses defaults)', () => {
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
        marginTop="0"
        marginRight="0"
        marginBottom="0"
        marginLeft="0"
        id="test" 
        puck={mockPuckContext} 
      />
    );
    
    const styledDiv = container.querySelector('div[style]');
    expect(styledDiv).toHaveStyle({ color: '#000000' });
  });

  it('HeadingBlock works without provider (uses defaults)', () => {
    const Component = puckConfig.components.HeadingBlock.render;
    const { container } = render(
      <Component 
        text="Test Heading" 
        level="h2" 
        color="#000000" 
        fontFamily=""
        pageBreakBehavior="auto"
        visibilityCondition=""
        marginTop="0"
        marginRight="0"
        marginBottom="0"
        marginLeft="0"
        id="test" 
        puck={mockPuckContext} 
      />
    );
    
    const heading = container.querySelector('h2');
    expect(heading).toHaveStyle({ color: '#000000' });
  });
});
