'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { useCallback, useEffect, useRef } from 'react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Highlighter,
    Palette,
    Undo2,
    Redo2,
    RemoveFormatting,
} from 'lucide-react';

export interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
}

function ToolbarButton({
    onClick,
    active = false,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`rounded p-1 transition-colors ${active
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            {children}
        </button>
    );
}

function ToolbarSeparator() {
    return <div className="mx-0.5 h-5 w-px bg-gray-300" />;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const isInternalUpdate = useRef(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false, // TextBlock doesn't need headings — HeadingBlock handles that
            }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({
                types: ['paragraph'],
            }),
        ],
        content: value || '',
        onUpdate: ({ editor: ed }) => {
            isInternalUpdate.current = true;
            onChange(ed.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-sm',
            },
        },
    });

    // Sync external value changes (e.g. undo/redo from Puck)
    useEffect(() => {
        if (!editor) return;
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        const currentHtml = editor.getHTML();
        if (value !== currentHtml) {
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
    }, [value, editor]);

    const setColor = useCallback(() => {
        if (!editor) return;
        const color = prompt('Enter color (hex, rgb, or name):', editor.getAttributes('textStyle').color || '#000000');
        if (color) {
            editor.chain().focus().setColor(color).run();
        }
    }, [editor]);

    const setHighlight = useCallback(() => {
        if (!editor) return;
        if (editor.isActive('highlight')) {
            editor.chain().focus().unsetHighlight().run();
            return;
        }
        const color = prompt('Enter highlight color:', '#fef08a');
        if (color) {
            editor.chain().focus().setHighlight({ color }).run();
        }
    }, [editor]);

    if (!editor) return null;

    const iconSize = 14;

    return (
        <div className="rounded-md border border-gray-300 bg-white" data-testid="rich-text-editor">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-1.5 py-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    title="Underline"
                >
                    <UnderlineIcon size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough size={iconSize} />
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    active={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    active={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    active={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    active={editor.isActive({ textAlign: 'justify' })}
                    title="Justify"
                >
                    <AlignJustify size={iconSize} />
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Ordered List"
                >
                    <ListOrdered size={iconSize} />
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton onClick={setColor} title="Text Color">
                    <Palette size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={setHighlight}
                    active={editor.isActive('highlight')}
                    title="Highlight"
                >
                    <Highlighter size={iconSize} />
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    title="Clear Formatting"
                >
                    <RemoveFormatting size={iconSize} />
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo"
                >
                    <Undo2 size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo"
                >
                    <Redo2 size={iconSize} />
                </ToolbarButton>
            </div>

            {/* Editor content */}
            <EditorContent editor={editor} />
        </div>
    );
}
