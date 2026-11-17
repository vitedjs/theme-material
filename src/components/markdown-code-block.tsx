import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import type { MarkdownElementProps } from '../types';
import { CodeBlock } from './code-block';

export function MarkdownCodeBlock({ children }: MarkdownElementProps): ReactElement {
  const codeElement = Children.toArray(children).find(
    (child): child is ReactElement<{ className?: string; children?: ReactNode }> =>
      isValidElement(child) && child.type === 'code',
  );
  if (!codeElement) return <pre>{children}</pre>;

  const language = codeElement.props.className?.match(/(?:^|\s)language-([\w+#.-]+)/)?.[1];
  return <CodeBlock code={getReactText(codeElement.props.children)} language={language} />;
}

function getReactText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map((child) => getReactText(child)).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return getReactText(node.props.children);
  return '';
}
