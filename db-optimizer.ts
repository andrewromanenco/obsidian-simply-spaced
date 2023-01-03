export function optimizeDB(allLogRecords: string, existingFiles: string[]):string {
    const existing = new Map<string, number>();
    existingFiles.forEach(path => {
        existing.set(path, 1);
    });

    const records = new Map<string, string>();
    allLogRecords.split(/\n/).forEach(r => {
        if (r.length > 0) {
            const o = JSON.parse(r);
            if (existing.has(o.path)) {
                records.set(o.path, r);
            }
        }
    });
    const values: string[] = [];
    records.forEach((value, _) => {
        values.push(value);
    });
    return values.join("\n") + "\n";
}