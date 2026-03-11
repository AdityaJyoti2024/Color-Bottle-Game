import { Level, Color } from '../types';

export const COLORS = {
    red: '#FF4D4D',
    blue: '#4DA6FF',
    green: '#4DFF88',
    yellow: '#FFD84D',
    purple: '#B84DFF',
    orange: '#FF914D',
    pink: '#FF4DAB',
    cyan: '#4DFFFF',
    brown: '#8B4513',
    teal: '#008080',
    lime: '#C0FF4D',
    indigo: '#4B0082',
};

export const generateLevel = (levelId: number, overrideDifficulty?: 'easy' | 'medium' | 'hard'): Level => {
    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    const difficulty = overrideDifficulty || difficulties[Math.floor((levelId - 1) / 10) % 3];

    let baseColors = 3;

    // Determine the baseline number of colors (filled bottles) based on level tier
    if (levelId >= 1 && levelId <= 20) {
        baseColors = 3;
    } else if (levelId > 20 && levelId <= 80) {
        baseColors = 4;
    } else if (levelId > 80 && levelId <= 200) {
        baseColors = 5;
    } else if (levelId > 200 && levelId <= 500) {
        baseColors = 6;
    } else if (levelId > 500 && levelId <= 1000) {
        baseColors = 7;
    } else {
        // level 1000 - 2000
        baseColors = 10;
    }

    // Apply difficulty modifier (+0 for easy, +1 for medium, +2 for hard)
    // Capped at 12 colors maximum since we only have 12 unique hex codes
    let modifier = 0;
    if (difficulty === 'medium') modifier = 1;
    if (difficulty === 'hard') modifier = 2;

    let numColors = Math.min(baseColors + modifier, 12);
    let numEmpty = 1; // Default 1 empty bottle to increase default difficulty and incentive boosters

    // --- Tutorial Overrides ---
    if (levelId === 1) {
        numColors = 2;
        numEmpty = 1; // Level 1 is extremely simple: 3 bottles total
    } else if (levelId === 2 || levelId === 3) {
        numColors = 3;
        numEmpty = 1; // Levels 2 & 3 introduce 4 bottles total
    }

    const numBottles = numColors + numEmpty;

    const availableColors = Object.keys(COLORS).slice(0, numColors) as Color[];
    const bottles = [];

    // Create filled bottles
    for (let i = 0; i < numColors; i++) {
        bottles.push({
            id: i,
            colors: [availableColors[i], availableColors[i], availableColors[i], availableColors[i]],
            maxCapacity: 4,
        });
    }

    // Create empty bottles
    for (let i = numColors; i < numBottles; i++) {
        bottles.push({
            id: i,
            colors: [],
            maxCapacity: 4,
        });
    }

    // Shuffle colors to create puzzle
    const allColors = bottles.flatMap(b => b.colors);
    for (let i = allColors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
    }

    // Redistribute colors
    let colorIndex = 0;
    for (let i = 0; i < numBottles; i++) {
        if (i < numColors) {
            bottles[i].colors = allColors.slice(colorIndex, colorIndex + 4);
            colorIndex += 4;
        } else {
            bottles[i].colors = [];
        }
    }

    return {
        id: levelId,
        bottles,
        moves: 0,
        difficulty,
    };
};

export const generateDailyPuzzle = (difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Level => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Use seed for consistent daily puzzle
    return generateLevel(seed % 100 + 1, difficulty);
};
