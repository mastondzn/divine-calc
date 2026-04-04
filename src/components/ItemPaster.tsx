import { IconAlertTriangle, IconClipboard } from '@tabler/icons-react';
import { useState } from 'react';

import { parsePoeItemText, type PoeItem } from '../lib/poe-parser';

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
        <div
            className="
              rounded-xl p-5 poe-glow poe-glass transition-all duration-300 poe-border
              hover:border-(--poe-border-dim)
            "
        >
            <label
                className="
                  mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-(--accent-gold) uppercase
                "
            >
                <IconClipboard className="size-3.5 opacity-70" />
                Paste Item Data
            </label>
            <div className="relative">
                <textarea
                    className={`
                      h-44 w-full resize-none rounded-lg border bg-black/40 p-4 font-mono text-xs text-zinc-300
                      placeholder-zinc-700 transition-all duration-300
                      focus:ring-1 focus:outline-none
                      ${error ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/30' : 'border-zinc-800/80 focus:border-(--accent-gold)/40 focus:ring-(--accent-gold)/20'}
                    `}
                    placeholder="Hover over an item in Path of Exile, press Ctrl+Alt+C, then paste here..."
                    value={text}
                    onChange={handleChange}
                />
                {error && (
                    <div
                        className="
                          absolute -bottom-11 left-0 z-10 flex w-full animate-fade-in-up items-center gap-1.5 rounded-lg
                          border border-red-900/40 bg-red-950/60 px-3 py-2 text-xs font-medium text-red-400
                          backdrop-blur-sm
                        "
                    >
                        <IconAlertTriangle className="size-3.5 shrink-0 text-red-500" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
