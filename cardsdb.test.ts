import { CardsDB } from './cardsdb';

describe("CardsDB", () => {
    test("Parse json to a scheduled card", () => {
        const result = CardsDB.parseCard('{"path":"full/path.md","repetiotions":9,"easyFactor":2.5,"scheduledAt":"20230102","intervalInDays":1}');
        expect(result.easyFactor).toBe(2.5);
        expect(result.intervalInDays).toBe(1);
        expect(result.path).toBe('full/path.md');
        expect(result.repetiotions).toBe(9);

        expect(result.scheduledAt!.getFullYear()).toBe(2023);
        expect(result.scheduledAt!.getMonth()).toBe(0);
        expect(result.scheduledAt!.getDate()).toBe(2);
    });

    test("Parse json to an ignored card", () => {
        const result = CardsDB.parseCard('{"path":"full/path.md","repetiotions":9,"easyFactor":2.5,"scheduledAt":"never","intervalInDays":1}');
        expect(result.easyFactor).toBe(2.5);
        expect(result.intervalInDays).toBe(1);
        expect(result.path).toBe('full/path.md');
        expect(result.repetiotions).toBe(9);
        expect(result.scheduledAt).toBeUndefined();
    });

    test("Serialize card", () => {
        const result = CardsDB.jsonForCard({
            path: 'path',
            repetiotions: 1,
            easyFactor: 2,
            intervalInDays: 3
        }, '20230102');
        expect(result).toBe('{"path":"path","repetiotions":1,"easyFactor":2,"scheduledAt":"20230102","intervalInDays":3}');
    });
});

export {}
