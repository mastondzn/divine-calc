import { useState } from 'react';
import { parsePoeItemText, type PoeItem } from '../lib/poe-parser';
import { AlertTriangle } from 'lucide-react';

export function ItemPaster({ 
    initialText = '',
    onParsedItem 
}: { 
    initialText?: string;
    onParsedItem: (item: PoeItem | null) => void 
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
        <div className="w-full flex flex-col gap-2 relative">
            <label className="text-sm font-semibold text-amber-500/80 uppercase tracking-widest pl-1">
                Paste Item Data
            </label>
            <textarea
                className={`w-full h-48 p-4 bg-zinc-950/80 border ${error ? 'border-red-500/50 focus:border-red-500/80 focus:ring-red-500/50' : 'border-zinc-800 focus:border-amber-500/50 focus:ring-amber-500/50'} rounded-lg text-zinc-300 font-mono text-xs focus:outline-none focus:ring-1 transition-all placeholder-zinc-700 resize-none shadow-inner`}
                placeholder="Hover over an item in Path of Exile, press Ctrl+Alt+C, then paste here..."
                value={text}
                onChange={handleChange}
            />
            {error && (
                <div className="absolute -bottom-10 left-0 w-full text-red-400 text-xs flex items-center gap-1.5 pl-2 py-1.5 font-medium bg-red-950/40 rounded border border-red-900/50 shadow-sm backdrop-blur-sm z-10">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    {error}
                </div>
            )}
        </div>
    );
}
