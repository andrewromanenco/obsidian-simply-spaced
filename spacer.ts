export enum Answer {
    PERFECT = 5,
    GOOD_SOME_THINKING = 4,
    CORRECT_LOTS_OF_THINKING = 3,
    WRONG_EASY_RECALL = 2,
    WRONG = 1,
    BLACK_OUT = 0
}

interface SpacerResult {
    easyFactor: number,
    intervalInDays: number,
    shceduledAt: Date,
    repetiotions: number
}

/*
Interval calculation is based on SM-2; with intervals being randomized
by up to 10%. This helps smoothen the repetition count curve when cards
are learned in larger quantities in the beginning.
*/
export function getNextInterval(
    answer: Answer,
    repetiotions: number,
    easyFactor: number,
    previousInterval: number): SpacerResult {
    
    const newEF = Math.max(1.3, easyFactor + 0.1 - (5.0 - answer) * (0.08 + (5.0 - answer) * 0.02));

    if (answer == 0) {
        return {
            easyFactor: 1.3,
            intervalInDays: 1,
            shceduledAt: createDateWithInterval(1),
            repetiotions: 0
        };    
    }  if (answer < 3) {
        return {
            easyFactor: newEF,
            intervalInDays: 1,
            shceduledAt: createDateWithInterval(1),
            repetiotions: 0
        };    
    }

    // at least something exists in the brain

    if (repetiotions == 0 && answer == Answer.PERFECT) {
        const interval = getRandomInt(5) + 5;
        return {
            easyFactor: newEF,
            intervalInDays: interval,
            shceduledAt: createDateWithInterval(interval),
            repetiotions: 1
        }; 
    }

    if (repetiotions == 0) {
        const interval = getRandomInt(2) + 1;
        return {
            easyFactor: newEF,
            // because of randomization, stronger answers may have shorter intervals
            intervalInDays: interval,
            shceduledAt: createDateWithInterval(interval),
            repetiotions: 1
        }; 
    } else if (repetiotions == 1) {
        const interval = getRandomInt(5) + 4;
        return {
            easyFactor: newEF,
            intervalInDays: interval,
            shceduledAt: createDateWithInterval(interval),
            repetiotions: 2
        };
    } else {
        const newInterval = Math.round(previousInterval * newEF);
        const jitter = Math.ceil(newInterval*0.2);
        const randomizedInterval = Math.max(1, Math.round(newInterval - jitter/2 + getRandomInt(jitter + 1)));
        return {
            easyFactor: newEF,
            intervalInDays: randomizedInterval,
            shceduledAt: createDateWithInterval(randomizedInterval),
            repetiotions: repetiotions + 1
        };
    }
}

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
}

function createDateWithInterval(intervalInDays: number): Date {
    const date = new Date();
	date.setDate(date.getDate() + intervalInDays);
    date.setHours(0, 0, 0, 0);
    return date;
}