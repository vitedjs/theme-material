import { useEffect, useMemo, useState } from 'react';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
  children: TocHeading[];
  /** The rendered heading, used to track the reading position. */
  element: HTMLElement;
}

/** Class of the anchor link appended to headings by the core MDX pipeline. */
const headingAnchorSelector = '.vited-heading-anchor';

/** Headings below the page title form the outline tree. */
const headingSelector = 'h2[id], h3[id], h4[id]';

export function collectTocHeadings(container: HTMLElement): TocHeading[] {
  const roots: TocHeading[] = [];
  const stack: TocHeading[] = [];
  for (const element of container.querySelectorAll<HTMLElement>(headingSelector)) {
    const heading: TocHeading = {
      id: element.id,
      text: getHeadingText(element),
      level: Math.trunc(Number(element.tagName.slice(1))),
      children: [],
      element,
    };
    while (stack.length > 0 && stack.at(-1)!.level >= heading.level) {
      stack.pop();
    }
    const parent = stack.at(-1);
    if (parent) {
      parent.children.push(heading);
    } else {
      roots.push(heading);
    }
    stack.push(heading);
  }
  return roots;
}

function getHeadingText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  for (const anchor of clone.querySelectorAll(headingAnchorSelector)) {
    anchor.remove();
  }
  return clone.textContent?.trim() ?? '';
}

function collectHeadingElements(headings: TocHeading[]): HTMLElement[] {
  const elements: HTMLElement[] = [];
  const visit = (items: TocHeading[]) => {
    for (const item of items) {
      elements.push(item.element);
      visit(item.children);
    }
  };
  visit(headings);
  return elements;
}

/** Highlights the heading above the reader, leaving the last heading active at the bottom. */
export function useActiveHeading(headings: TocHeading[]): string | undefined {
  const [activeId, setActiveId] = useState<string>();
  const elements = useMemo(() => collectHeadingElements(headings), [headings]);

  useEffect(() => {
    if (elements.length === 0) return;

    function update() {
      const headerOffset = 96;
      let current = elements[0].id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top > headerOffset) break;
        current = element.id;
      }
      const root = globalThis.document.documentElement;
      const atBottom = globalThis.scrollY + globalThis.innerHeight >= root.scrollHeight - 2;
      const next = atBottom ? (elements.at(-1)?.id ?? current) : current;
      setActiveId((previous) => (previous === next ? previous : next));
    }

    const frame = globalThis.requestAnimationFrame(update);
    globalThis.addEventListener('scroll', update, { passive: true });
    globalThis.addEventListener('resize', update);
    return () => {
      globalThis.cancelAnimationFrame(frame);
      globalThis.removeEventListener('scroll', update);
      globalThis.removeEventListener('resize', update);
    };
  }, [elements]);

  return activeId;
}
