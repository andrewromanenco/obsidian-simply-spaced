import { CardsStorage } from 'cardsdb';
import { TFile } from 'obsidian';

export class LearningSession {

    private cardsDB: CardsStorage;

    private newCards: TFile[] = [];
    private todayAndLateCards: TFile[] = [];
    private todayCardsCount: number = 0;
    private lateCardsCount: number = 0;

    public constructor(cardsDB: CardsStorage, allMDFiles: TFile[]) {
        this.cardsDB = cardsDB;
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayCards: TFile[] = [];
        const lateCards: TFile[] = [];
        allMDFiles.forEach(f => {
            const path = f.path;
            if (this.cardsDB.isIgnored(path)) {
                return;
            }
            if (this.cardsDB.doesCardExist(path)) {
                const card = cardsDB.getCard(path);
                if (card.scheduledAt!.getTime() == today.getTime()) {
                    todayCards.push(f);
                    this.todayCardsCount++;
                } else if (card.scheduledAt!.getTime() < today.getTime()) {
                    lateCards.push(f);
                    this.lateCardsCount++;
                } else {
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
        if (this.cardsDB.doesCardExist(path)) {
            return this.cardsDB.getCard(path).repetiotions;
        } else {
            return 0;
        }
    }

    public currentEasyFactor(): number {
        const path = this.currentCard().path;
        if (this.cardsDB.doesCardExist(path)) {
            return this.cardsDB.getCard(path).easyFactor;
        } else {
            return 2.5;
        }
    }

    public currentInterval(): number {
        const path = this.currentCard().path;
        if (this.cardsDB.doesCardExist(path)) {
            return this.cardsDB.getCard(path).intervalInDays;
        } else {
            return 0;
        }
    }

    public updateCard(easyFactor: number, intervalInDays: number, repetiotions: number, shceduledAt: Date): void {
        this.cardsDB.save({
            path: this.currentCard().path,
            repetiotions: repetiotions,
            easyFactor: easyFactor,
            scheduledAt: shceduledAt,
            intervalInDays: intervalInDays
        });
        this.moveToNextCard();
    }

    public ignoreCard(): void {
        this.cardsDB.ignore(this.currentCard().path);
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