import { useState, useMemo, useEffect } from 'react';
import { ItemPaster } from './components/ItemPaster';
import { ItemViewer } from './components/ItemViewer';
import { DivineReport } from './components/DivineReport';
import type { PoeItem, PoeModifierRoll } from './lib/poe-parser';
import { IconBrandGithub } from '@tabler/icons-react';

function App() {
    const [item, setItem] = useState<PoeItem | null>(() => {
        try {
            const stored = localStorage.getItem('poe-divine-item');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const [selectedRollNames, setSelectedRollNames] = useState<Set<string>>(() => {
        try {
            const stored = localStorage.getItem('poe-divine-rolls');
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });

    useEffect(() => {
        if (item) {
            localStorage.setItem('poe-divine-item', JSON.stringify(item));
        } else {
            localStorage.removeItem('poe-divine-item');
        }
    }, [item]);

    useEffect(() => {
        localStorage.setItem('poe-divine-rolls', JSON.stringify(Array.from(selectedRollNames)));
    }, [selectedRollNames]);

    const handleParsedItem = (newItem: PoeItem | null) => {
        setItem(newItem);
        setSelectedRollNames(new Set());
    };

    const handleToggleRoll = (roll: PoeModifierRoll) => {
        const newSelected = new Set(selectedRollNames);
        if (newSelected.has(roll.id)) {
            newSelected.delete(roll.id);
        } else {
            newSelected.add(roll.id);
        }
        setSelectedRollNames(newSelected);
    };

    const selectedRollsData = useMemo(() => {
        if (!item) return [];
        const allRolls = item.modifiers.flatMap((m) => m.rolls);
        return allRolls.filter((r) => selectedRollNames.has(r.id));
    }, [item, selectedRollNames]);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[hsl(0,0%,3%)] text-zinc-300 selection:bg-amber-500/30">
            <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
                <header className="animate-fade-in-up mb-8 text-center">
                    <h1 className="font-cinzel mb-3 bg-[linear-gradient(135deg,#c9a84c,#f5deb3,#d4a843,#a07830)] bg-clip-text text-3xl font-bold tracking-wide text-transparent sm:text-4xl md:text-5xl">
                        Divine Calculator
                    </h1>

                    <div className="mb-4 flex items-center justify-center gap-3">
                        <span className="block h-px w-16 bg-linear-to-r from-transparent to-(--poe-border-dim) sm:w-24" />
                        <span className="block h-1.5 w-1.5 rotate-45 bg-(--accent-gold) opacity-50" />
                        <span className="block h-px w-16 bg-linear-to-l from-transparent to-(--poe-border-dim) sm:w-24" />
                    </div>

                    <p className="mx-auto max-w-lg text-sm leading-relaxed tracking-wide text-zinc-500 sm:text-base">
                        Analyze your item's modifier rolls and calculate the probability of hitting a better outcome
                        with a Divine Orb.
                    </p>
                </header>

                <div className="grid flex-1 grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-2">
                    <div
                        className="animate-fade-in-up flex flex-col gap-6 lg:col-span-1"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <ItemPaster initialText={item?.rawText || ''} onParsedItem={handleParsedItem} />
                        <DivineReport selectedRolls={selectedRollsData} />
                    </div>

                    <div className="animate-fade-in-up flex w-full lg:col-span-1" style={{ animationDelay: '0.2s' }}>
                        <ItemViewer item={item} selectedRolls={selectedRollNames} onToggleRoll={handleToggleRoll} />
                    </div>
                </div>

                <footer
                    className="animate-fade-in-up mt-16 border-t border-zinc-800/50 pt-8 text-center"
                    style={{ animationDelay: '0.3s' }}
                >
                    <div className="flex flex-col items-center justify-center gap-4">
                        <a
                            href="https://github.com/mastondzn/divine-calc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-zinc-400 transition-colors duration-200 hover:text-(--accent-gold)"
                        >
                            <IconBrandGithub className="h-4 w-4" />
                            <span>mastondzn/divine-calc</span>
                        </a>
                        <p className="mx-auto max-w-lg text-xs tracking-wide text-zinc-600">
                            Not affiliated with Grinding Gear Games. Path of Exile is a registered trademark of Grinding
                            Gear Games.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;
