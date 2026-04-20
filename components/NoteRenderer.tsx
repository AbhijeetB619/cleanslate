import { Fragment, ReactNode } from 'react';
import { type TipTapNode, type Mark } from '@/lib/tiptap-schema';
import { sanitizeHref } from '@/lib/utils';

function applyMarks(text: string, marks: Mark[]): ReactNode {
  return marks.reduce<ReactNode>((node, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong>{node}</strong>;
      case 'italic':
        return <em>{node}</em>;
      case 'strike':
        return <s>{node}</s>;
      case 'code':
        return (
          <code className='bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono'>
            {node}
          </code>
        );
      case 'link':
        return (
          <a
            href={sanitizeHref(mark.attrs?.href)}
            className='underline text-blue-600 hover:text-blue-800'
            target='_blank'
            rel='noopener noreferrer'
          >
            {node}
          </a>
        );
      default:
        return node;
    }
  }, text);
}

function renderNode(node: TipTapNode, key: number): ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case 'doc':
      return (
        <div key={key} className='text-slate-800 dark:text-slate-200'>
          {children}
        </div>
      );
    case 'paragraph':
      return (
        <p key={key} className='mb-4 leading-7'>
          {children}
        </p>
      );
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      const headingClasses: Record<number, string> = {
        1: 'text-3xl font-bold mb-4 mt-6',
        2: 'text-2xl font-semibold mb-3 mt-5',
        3: 'text-xl font-semibold mb-2 mt-4',
        4: 'text-lg font-semibold mb-2 mt-3',
        5: 'text-base font-semibold mb-1 mt-2',
        6: 'text-sm font-semibold mb-1 mt-2',
      };
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return (
        <Tag key={key} className={headingClasses[level]}>
          {children}
        </Tag>
      );
    }
    case 'bulletList':
      return (
        <ul key={key} className='list-disc pl-6 mb-4 space-y-1'>
          {children}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={key} className='list-decimal pl-6 mb-4 space-y-1'>
          {children}
        </ol>
      );
    case 'listItem':
      return (
        <li key={key} className='leading-7'>
          {children}
        </li>
      );
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className='border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic text-slate-500 dark:text-slate-400 mb-4'
        >
          {children}
        </blockquote>
      );
    case 'codeBlock':
      return (
        <pre
          key={key}
          className='bg-slate-900 text-slate-100 rounded-lg p-4 mb-4 overflow-x-auto text-sm font-mono'
        >
          <code>{children}</code>
        </pre>
      );
    case 'horizontalRule':
      return <hr key={key} className='border-slate-200 dark:border-slate-700 my-6' />;
    case 'hardBreak':
      return <br key={key} />;
    case 'text':
      if (!node.text) return null;
      return (
        <Fragment key={key}>
          {node.marks?.length ? applyMarks(node.text, node.marks) : node.text}
        </Fragment>
      );
    default:
      return null;
  }
}

import { type TipTapDoc } from '@/lib/tiptap-schema';

export default function NoteRenderer({ content }: { content: TipTapDoc }) {
  return <>{renderNode(content, 0)}</>;
}
