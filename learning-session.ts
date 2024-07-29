import {KV} from 'kv-synced';
import { TFile } from 'obsidian';

export class LearningSession {

    private kvs: KV;

    private newCards: TFile[] = [];
    private todayAndLateCards: TFile[] = [];
    private todayCardsCount: number = 0;
    private lateCardsCount: number = 0;

    public constructor(kvs: KV, allMDFiles: TFile[]) {
        this.kvs = kvs;
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayCards: TFile[] = [];
        const lateCards: TFile[] = [];
        allMDFiles.forEach(f => {
            const path = f.path;
            if (this.kvs.get(path)) {
                const values = this.kvs.get(path)!;
                if (values['ignore']) {
                    return;
                }
                const scheduledDate = new Date(values['scheduledAt']);
                if (this.isToday(scheduledDate)) {
                    todayCards.push(f);
                    this.todayCardsCount++;
                } else if (this.isInThePast(scheduledDate)) {
                    lateCards.push(f);
                    this.lateCardsCount++;
                }
            } else {
                this.newCards.push(f);
            }
        });
        this.newCards.sort(() => Math.random() - 0.5);
        lateCards.sort(() => Math.random() - 0.5);
        todayCards.sort(() => Math.random() - 0.5);
        this.todayAndLateCards.push(...lateCards);
        this.todayAndLateCards.push(...todayCards);
    }

    private isToday(date: Date): boolean {
        const today = new Date();
        
        return date.getFullYear() === today.getFullYear() &&
               date.getMonth() === today.getMonth() &&
               date.getDate() === today.getDate();
    }

    private isInThePast(date: Date): boolean {
        const now = new Date();
        return date < now;
    }

    public hasMoreCards(): boolean {
        return (this.newCards.length > 0) || (this.todayAndLateCards.length > 0);
    }

    public currentCard(): TFile {
        if (this.todayAndLateCards.length > 0) {
            return this.todayAndLateCards[0];
        }
        return this.newCards[0];
    }

    public currentRepetitions(): number {
        const path = this.currentCard().path;
        if (this.kvs.get(path) && this.kvs.get(path)!['repetiotions']) {
            return +this.kvs.get(path)!['repetiotions'];
        }
        return 0;
    }

    public currentEasyFactor(): number {
        const path = this.currentCard().path;
        if (this.kvs.get(path) && this.kvs.get(path)!['easyFactor']) {
            return +this.kvs.get(path)!['easyFactor'];
        }
        return 2.5;
    }

    public currentInterval(): number {
        const path = this.currentCard().path;
        if (this.kvs.get(path) && this.kvs.get(path)!['intervalInDays']) {
            return +this.kvs.get(path)!['intervalInDays'];
        }
        return 0;
    }

    public updateCard(easyFactor: number, intervalInDays: number, repetiotions: number, scheduledAt: Date): void {
        this.kvs.put(this.currentCard().path, {
            "repetiotions": "" + repetiotions,
            "easyFactor": "" + easyFactor,
            "scheduledAt": "" + scheduledAt.toISOString(),
            "intervalInDays": ""+ intervalInDays

        });
        this.moveToNextCard();
    }

    public ignoreCard(): void {
        this.kvs.put(this.currentCard().path, {
            "ignore": "true"
        });
        this.moveToNextCard();
    }

    public skipCard(): void {
        this.moveToNextCard();
    }

    private moveToNextCard(): void {
        if (this.todayAndLateCards.length > 0) {
            this.todayAndLateCards.shift();
            if (this.lateCardsCount > 0) {
                this.lateCardsCount--;
            } else {
                this.todayCardsCount--;
            }
        } else {
            this.newCards.shift();
        }
    }


    public getTodaysCount(): number {
        return this.todayCardsCount;
    }

    public getLateCount(): number {
        return this.lateCardsCount;
    }

    public getNewCount(): number {
        return this.newCards.length;
    }

    public again(): void {
        if (this.todayAndLateCards.length == 0) {
            // new card, postpone by 10
            const card = this.newCards.shift();
            this.newCards.splice(Math.min(10, this.newCards.length), 0, card!);
        } else {
            if (this.lateCardsCount > 0) {
                const card = this.todayAndLateCards.shift();
                this.todayAndLateCards.splice(Math.min(10, this.lateCardsCount), 0, card!);
            } else {
                const card = this.todayAndLateCards.shift();
                this.todayAndLateCards.splice(Math.min(10, this.todayAndLateCards.length), 0, card!);
            }
        }
    }

}