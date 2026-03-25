import { useState, useMemo, useEffect } from 'react';
import { ItemPaster } from './components/ItemPaster';
import { ItemViewer } from './components/ItemViewer';
import { DivineReport } from './components/DivineReport';
import type { PoeItem, PoeModifierRoll } from './lib/poe-parser';

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
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-amber-500/30 overflow-x-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-linear-to-b from-zinc-900 to-transparent opacity-50" />
                <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-amber-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-zinc-900/40 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 flex flex-col min-h-screen">
                {/* Header */}
                <header className="mb-12 text-center drop-shadow-lg">
                    <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-linear-to-r from-amber-100 via-amber-300 to-amber-600 mb-4 inline-flex items-center justify-center gap-4 font-black tracking-tight drop-shadow-sm">
                        Path of Exile Divine Calculator
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto tracking-wide">
                        Analyze your item's rolls and calculate the probability of hitting a better
                        outcome with a Divine Orb.
                    </p>
                </header>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Paster & Report */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        <ItemPaster initialText={item?.rawText || ''} onParsedItem={handleParsedItem} />
                        <DivineReport selectedRolls={selectedRollsData} />
                    </div>

                    {/* Right Column: Item Viewer */}
                    <div className="lg:col-span-7 flex justify-center">
                        <div className="w-full max-w-125">
                            <ItemViewer
                                item={item}
                                selectedRolls={selectedRollNames}
                                onToggleRoll={handleToggleRoll}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
