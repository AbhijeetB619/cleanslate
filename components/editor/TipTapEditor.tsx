'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface TipTapEditorProps {
  onChange: (json: object) => void;
  onEmptyChange?: (isEmpty: boolean) => void;
  onFocus?: () => void;
  initialContent?: object;
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='relative group/tip'>
      <button
        type='button'
        onMouseDown={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`p-1.5 rounded transition-colors ${
          active
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
      >
        {children}
      </button>
      <span className='pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-slate-900 dark:bg-slate-100 px-2 py-0.5 text-xs text-white dark:text-slate-900 opacity-0 group-hover/tip:opacity-100 transition-opacity z-50'>
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className='w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 self-center' />;
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className='flex flex-wrap items-center gap-0.5 p-2 border-b border-slate-200 dark:border-slate-700'>
      {/* Inline */}
      <ToolbarButton
        label='Bold'
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <svg width='15' height='15' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 0 1 0 8H6z' />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        label='Italic'
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <svg
          width='15'
          height='15'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2.5'
          strokeLinecap='round'
        >
          <line x1='19' y1='4' x2='10' y2='4' />
          <line x1='14' y1='20' x2='5' y2='20' />
          <line x1='15' y1='4' x2='9' y2='20' />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Block type */}
      <ToolbarButton
        label='Paragraph'
        active={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <span className='text-xs font-bold leading-none w-4 text-center block'>P</span>
      </ToolbarButton>

      <ToolbarButton
        label='Heading 1'
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <span className='text-xs font-bold leading-none w-5 text-center block'>H1</span>
      </ToolbarButton>

      <ToolbarButton
        label='Heading 2'
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className='text-xs font-bold leading-none w-5 text-center block'>H2</span>
      </ToolbarButton>

      <ToolbarButton
        label='Heading 3'
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <span className='text-xs font-bold leading-none w-5 text-center block'>H3</span>
      </ToolbarButton>

      <Divider />

      {/* Blocks */}
      <ToolbarButton
        label='Bullet list'
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <svg
          width='15'
          height='15'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
        >
          <line x1='9' y1='6' x2='20' y2='6' />
          <line x1='9' y1='12' x2='20' y2='12' />
          <line x1='9' y1='18' x2='20' y2='18' />
          <circle cx='4' cy='6' r='1.5' fill='currentColor' stroke='none' />
          <circle cx='4' cy='12' r='1.5' fill='currentColor' stroke='none' />
          <circle cx='4' cy='18' r='1.5' fill='currentColor' stroke='none' />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        label='Code block'
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <svg
          width='15'
          height='15'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <polyline points='16 18 22 12 16 6' />
          <polyline points='8 6 2 12 8 18' />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        label='Blockquote'
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <svg width='15' height='15' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z' />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        label='Horizontal rule'
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <svg
          width='15'
          height='15'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
        >
          <line x1='2' y1='12' x2='22' y2='12' />
        </svg>
      </ToolbarButton>
    </div>
  );
}

export default function TipTapEditor({
  onChange,
  onEmptyChange,
  onFocus,
  initialContent,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: initialContent,
    onCreate({ editor }) {
      onEmptyChange?.(editor.isEmpty);
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
      onEmptyChange?.(editor.isEmpty);
    },
    onFocus() {
      onFocus?.();
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className='rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-slate-100 transition-colors'>
      {editor && <Toolbar editor={editor} />}
      <div className='p-3'>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
