import { TFile, Vault} from 'obsidian';

export interface CardsStorage {
    isIgnored(path: string): boolean;
    doesCardExist(path: string): boolean;
    getCard(path: string): Card;
    ignore(path: string): void;
    save(card: Card): void;
}

interface Card {
    path: string,
    repetiotions: number,
    easyFactor: number,
    scheduledAt?: Date,
    intervalInDays: number
}

const LOG_FILE_NAME = 'simply-spaced.log';

export class CardsDB {

	private vault: Vault;
	private logFile: TFile;
    private cards = new Map<string, Card>();
    private ignoredCards = new Map<string, number>();
    private dirtyRecordsCount: number = 0;

	public constructor(vault: Vault) {
		this.vault = vault;
	}

	public async load(): Promise<void> {
		const allFiles = this.vault.getFiles();
		let log: TFile|undefined = allFiles.find(f => f.path == LOG_FILE_NAME);
		if (log) {
			this.logFile = log;
		} else {
			this.logFile = await this.vault.create(LOG_FILE_NAME, "");
		}
		await this.parseDB();
        // TODO compact database if needed
        // consider adding first line of the db as a timestamp of file creation
	}

	private async parseDB(): Promise<void> {
		const log = await this.vault.read(this.logFile);
        log.split(/\n/).forEach(r => {
            if (r.length == 0) return;
            const card = CardsDB.parseCard(r);
            if (this.cards.has(card.path)) {
                this.dirtyRecordsCount++;
            }
            if (card.scheduledAt === undefined) {
                this.ignoredCards.set(card.path, 1);
            } else {
                this.cards.set(card.path, card);
            }
        });
	}

    static parseCard(r: string): Card {
        const o = JSON.parse(r);
        return {
            path: o.path,
            repetiotions: o.repetiotions,
            easyFactor: o.easyFactor,
            scheduledAt: o.scheduledAt === 'never'? undefined : CardsDB.parseDate(o.scheduledAt),
            intervalInDays: o.intervalInDays
        }
    }

	private static parseDate(dateAsString: string): Date {
		const y = dateAsString.substring(0,4);
		const m = dateAsString.substring(4,6);
		const d = dateAsString.substring(6,8);
		return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
	}

    private dateToY4M2D2(date: Date): string {
        const month = date.getMonth() + 1;
		const day = date.getDate();
		return [
			date.getFullYear(),
			(month < 10? "0" + month: month),
			(day < 10? "0" + day: day)
		].join('');
    }

    public doesCardExist(path: string): boolean {
        return this.cards.has(path);
    }

    public getCard(path: string): Card {
        return this.cards.get(path)!;
    }

    public async ignore(path: string): Promise<void> {
        this.saveForDateOrIgnore({
            path: path,
            repetiotions: 0,
            easyFactor: 0,
            scheduledAt: new Date(),
            intervalInDays: 0
            }, 'never');
    }

    public async save(card: Card): Promise<void> {
        this.saveForDateOrIgnore(card, this.dateToY4M2D2(card.scheduledAt!));
    }

    static jsonForCard(card: Card, scheduleAt: string): string {
        const record = {
            path: card.path,
            repetiotions: card.repetiotions,
            easyFactor: card.easyFactor,
            scheduledAt: scheduleAt,
            intervalInDays: card.intervalInDays
        };
        return JSON.stringify(record);
    }

    private async saveForDateOrIgnore(card: Card, scheduleAt: string): Promise<void> {
        this.cards.set(card.path, card);
        const json = CardsDB.jsonForCard(card, scheduleAt);
        await this.vault.append(this.logFile, json + "\n");
    }

    public getDirtyRecordsCount():number {
        return this.dirtyRecordsCount;
    }

    public isIgnored(path: string): boolean {
        return this.ignoredCards.has(path);
    }

}