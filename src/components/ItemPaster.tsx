import { useState } from 'react';
import { parsePoeItemText, type PoeItem } from '../lib/poe-parser';
import { IconAlertTriangle, IconClipboard } from '@tabler/icons-react';

export function ItemPaster({
    initialText = '',
    onParsedItem,
}: {
    initialText?: string;
    onParsedItem: (item: PoeItem | null) => void;
}) {
    const [text, setText] = useState(initialText);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setText(val);
        setError(null);

        if (val.trim() === '') {
            onParsedItem(null);
        } else {
            const parsed = parsePoeItemText(val);
            if (parsed) {
                if (!val.includes('{') && ['Rare', 'Magic', 'Unique'].includes(parsed.rarity)) {
                    setError(
                        'Missing Advanced Mod Descriptions. Please hover over the item in game and press Ctrl+Alt+C.',
                    );
                    onParsedItem(null);
                } else {
                    onParsedItem(parsed);
                }
            } else {
                onParsedItem(null);
            }
        }
    };

    return (
        <div className="poe-glass poe-border poe-glow rounded-xl p-5 transition-all duration-300 hover:border-(--poe-border-dim)">
            <label className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-(--accent-gold) uppercase">
                <IconClipboard className="h-3.5 w-3.5 opacity-70" />
                Paste Item Data
            </label>
            <div className="relative">
                <textarea
                    className={`h-44 w-full border bg-black/40 p-4 ${error ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/30' : 'border-zinc-800/80 focus:border-(--accent-gold)/40 focus:ring-(--accent-gold)/20'} resize-none rounded-lg font-mono text-xs text-zinc-300 placeholder-zinc-700 transition-all duration-300 focus:ring-1 focus:outline-none`}
                    placeholder="Hover over an item in Path of Exile, press Ctrl+Alt+C, then paste here..."
                    value={text}
                    onChange={handleChange}
                />
                {error && (
                    <div className="animate-fade-in-up absolute -bottom-11 left-0 z-10 flex w-full items-center gap-1.5 rounded-lg border border-red-900/40 bg-red-950/60 px-3 py-2 text-xs font-medium text-red-400 backdrop-blur-sm">
                        <IconAlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
