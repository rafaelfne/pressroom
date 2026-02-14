import type { Config } from '@puckeditor/core';
import { TextBlock, type TextBlockProps } from '@/components/report-components/text-block';
import { Spacer, type SpacerProps } from '@/components/report-components/spacer';

type PuckComponents = {
  TextBlock: TextBlockProps;
  Spacer: SpacerProps;
};

export const puckConfig: Config<PuckComponents> = {
  categories: {
    layout: {
      title: 'Layout',
      components: ['Spacer'],
    },
    content: {
      title: 'Content',
      components: ['TextBlock'],
    },
  },
  components: {
    TextBlock,
    Spacer,
  },
};
