import { optimizeDB } from './db-optimizer';

describe("DB Optimizer", () => {
    test("Remove duplicates and non existing items", () => {
        const records: string[] = [
            '{"path":"a.md", "key": 1}',
            '{"path":"b.md", "key": 1}',
            '{"path":"x.md", "key": 1}',
            '{"path":"c.md", "key": 1}',
            '{"path":"a.md", "key": 2}',
            '{"path":"a.md", "key": 3}',
            '{"path":"b.md", "key": 2}',
            '{"path":"y.md", "key": 1}'
        ];
        const result = optimizeDB(records.join("\n") + "\n", ['a.md', 'b.md', 'c.md']);

        const expected = "{\"path\":\"a.md\", \"key\": 3}\n{\"path\":\"b.md\", \"key\": 2}\n{\"path\":\"c.md\", \"key\": 1}\n";
        expect(result).toBe(expected);
    });
});
