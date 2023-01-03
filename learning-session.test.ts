import { LearningSession } from './learning-session';
import { CardsStorage, Card } from './cardsdb';
import { TFile } from 'obsidian';

describe("Learning session", () => {
    test("Test session", () => {
        const files = [
            {path: 'ignored'} as TFile,
            {path: 'future'} as TFile,
            {path: 'today'} as TFile,
            {path: 'yesterday'} as TFile,
            {path: 'new1'} as TFile,
            {path: 'new2'} as TFile,
        ];
        const ignored: string[] = [];
        const saved: Card[] = [];
        const cardsStorage: CardsStorage = {
            isIgnored: function (path: string): boolean {
                return path === 'ignored';
            },
            doesCardExist: function (path: string): boolean {
                return path !== 'new1' && path !== 'new2' ;
            },
            getCard: function (path: string): Card {
                const dates: { [key: string]: Date; } = {};
                dates['future'] = todayPlus(1);
                dates['today'] = todayPlus(0);
                dates['yesterday'] = todayPlus(-1);
                dates['new1'] = todayPlus(0);
                dates['new2'] = todayPlus(0);
                return {
                    path: path,
                    repetiotions: 1,
                    easyFactor: 2.5,
                    scheduledAt: dates[path],
                    intervalInDays: 10
                };
            },
            ignore: function (path: string): void {
                ignored.push(path);
            },
            save: function (card: Card): void {
                saved.push(card);
            }
        };
        const session = new LearningSession(cardsStorage, files);
        expect(session.getTodaysCount()).toBe(1);
        expect(session.getLateCount()).toBe(1);
        expect(session.getNewCount()).toBe(2);
        expect(session.hasMoreCards).toBeTruthy();

        const shownCards: string[] = [];


        shownCards.push(session.currentCard().path);
        session.again();
        shownCards.push(session.currentCard().path);
        session.ignoreCard();
        shownCards.push(session.currentCard().path);
        session.updateCard(1.7, 10, 11, todayPlus(10));

        shownCards.push(session.currentCard().path);
        session.again();

        shownCards.push(session.currentCard().path);
        session.ignoreCard();

        shownCards.push(session.currentCard().path);

        expect(ignored.length).toBe(2);
        expect(ignored[0]).toBe('today');
        expect(['new1', 'new2'].includes(ignored[1])).toBeTruthy();

        expect(saved.length).toBe(1);
        expect(saved[0].path).toBe('yesterday');

        expect(shownCards.length).toBe(6);
        expect(shownCards[0]).toBe('yesterday');
        expect(shownCards[1]).toBe('today');
        expect(shownCards[2]).toBe('yesterday');
        expect(shownCards[3] === shownCards[5]).toBeTruthy();
        expect(shownCards[3] !== shownCards[4]).toBeTruthy();
        expect(shownCards[4] === ignored[1]).toBeTruthy();
    });
});

function todayPlus(days: number): Date {
    const result = new Date();
    result.setDate(result.getDate() + days);
    result.setHours(0, 0, 0, 0);
    return result;
}

export {}
