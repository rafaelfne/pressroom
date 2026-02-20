'use client';

import { useMemo } from 'react';
import type { ComponentConfig } from '@puckeditor/core';
import { useSampleData } from '@/contexts/sample-data-context';
import { resolveBindings } from '@/lib/binding';

/**
 * HOC that wraps a Puck component's render function with binding resolution.
 *
 * In the Studio editor, component props contain raw binding expressions
 * (e.g. "{{content.title}}", "{{data.items}}"). This HOC resolves those
 * expressions against the sample data from SampleDataContext before passing
 * the resolved props to the original render function.
 *
 * This keeps the actual component render functions server-safe (no hooks),
 * so they work in both:
 *   - Studio: wrapped by this HOC → bindings resolved via sample data
 *   - PDF renderer: bindings already resolved by render-report.ts pipeline
 */
export function withBindingResolution<P extends Record<string, unknown>>(
    componentConfig: ComponentConfig<P>,
): ComponentConfig<P> {
    const OriginalRender = componentConfig.render;

    const WrappedRender: ComponentConfig<P>['render'] = (props) => {
        const sampleData = useSampleData();

        const resolvedProps = useMemo(() => {
            if (!sampleData) return props;

            // resolveBindings recursively walks the entire props tree,
            // resolving {{...}} expressions in strings at any depth
            // (including arrays like columns/footerColumns).
            return resolveBindings(props, sampleData) as typeof props;
        }, [props, sampleData]);

        return OriginalRender(resolvedProps);
    };

    return {
        ...componentConfig,
        render: WrappedRender,
    };
}
