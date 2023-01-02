import { getNextInterval, Answer } from './spacer';

describe("SM-2 based spacer", () => {
    test("Blackout rests intervals", () => {
        const result = getNextInterval(Answer.BLACK_OUT, 10, 2.5, 10);
        expect(result.easyFactor).toBe(1.3);
        expect(result.intervalInDays).toBe(1);
        expect(result.repetiotions).toBe(0);
        expect(dateDiffInDays(result.shceduledAt, new Date())).toBe(result.intervalInDays);
    });

    test("Bad answer recalculates EF", () => {
        const result = getNextInterval(Answer.WRONG_EASY_RECALL, 10, 2.5, 10);
        expect(result.easyFactor).toBe(2.18);
        expect(result.intervalInDays).toBe(1);
        expect(result.repetiotions).toBe(0);
        expect(dateDiffInDays(result.shceduledAt, new Date())).toBe(result.intervalInDays);
    });

    test("Try perfect answer from get go", () => {
        const result = getNextInterval(Answer.PERFECT, 0, 2.5, 0);
        expect(result.easyFactor).toBe(2.6);
        expect(result.intervalInDays).toBeGreaterThanOrEqual(5);
        expect(result.intervalInDays).toBeLessThan(10);
        expect(result.repetiotions).toBe(1);
        expect(dateDiffInDays(result.shceduledAt, new Date())).toBe(result.intervalInDays);
    });

    test("First attempt good, but not perfect", () => {
        const result = getNextInterval(Answer.GOOD_SOME_THINKING, 0, 2.5, 0);
        expect(result.easyFactor).toBe(2.5);
        expect(result.intervalInDays).toBeGreaterThanOrEqual(1);
        expect(result.intervalInDays).toBeLessThan(3);
        expect(result.repetiotions).toBe(1);
        expect(dateDiffInDays(result.shceduledAt, new Date())).toBe(result.intervalInDays);
    });

    test("Second attempt good, but not perfect", () => {
        const result = getNextInterval(Answer.GOOD_SOME_THINKING, 1, 2.5, 2);
        expect(result.easyFactor).toBe(2.5);
        expect(result.intervalInDays).toBeGreaterThanOrEqual(4);
        expect(result.intervalInDays).toBeLessThan(10);
        expect(result.repetiotions).toBe(2);
        expect(dateDiffInDays(result.shceduledAt, new Date())).toBe(result.intervalInDays);
    });

    test("11th ok'ish attempt", () => {
        const result = getNextInterval(Answer.CORRECT_LOTS_OF_THINKING, 10, 2.0, 100);
        expect(result.easyFactor).toBe(1.86);
        expect(result.intervalInDays).toBeGreaterThanOrEqual(167);
        expect(result.intervalInDays).toBeLessThan(206);
        expect(result.repetiotions).toBe(11);
    });
});

function dateDiffInDays(a: Date, b: Date): number {
    const diff = Math.abs(a.getTime() - b.getTime());
    return  Math.ceil(diff / (1000 * 3600 * 24)); 
}

export {}
