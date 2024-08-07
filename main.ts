import { App, Modal, Plugin, MarkdownRenderer, Component, Vault } from 'obsidian';

import { KV, LWWVersionHandler } from 'kv-synced';
import { getNextInterval, createDateWithInterval, Answer } from 'spacer';
import { LearningSession } from 'learning-session';

import { ObsidianFS } from 'obsidian-fs';

export default class SimplySpaced extends Plugin {

	async onload() {
		const ribbonIconEl = this.addRibbonIcon('align-vertical-space-between', 'Simply spaced', (evt: MouseEvent) => {
			new QnAModal(this.app, this).open();
		});
		ribbonIconEl.addClass('my-plugin-ribbon-class');
	}

	onunload() {

	}
}

class QnAModal extends Modal {
	private parentComponent: Component;
	private vault: Vault;
	private learningSession: LearningSession;
	private kvs: KV;

	private root: HTMLDivElement;

	private updatedCardsCount: number;

	constructor(app: App, parentComponent: Component) {
		super(app);
		this.parentComponent = parentComponent;
		this.vault = this.app.vault;
		this.updatedCardsCount = 0;
	}

	async onOpen() {
		const fs = new ObsidianFS(this.vault);
		await fs.init(this.app);
		this.kvs = new KV(fs, new LWWVersionHandler());
		await this.kvs.load();
		const allMDs = this.vault.getMarkdownFiles();
		this.learningSession = new LearningSession(this.kvs, allMDs);

		const {contentEl} = this;
		this.titleEl.innerHTML += "<h4>Simply spaced</h4>";
		this.root = this.contentEl.createDiv();

		this.doNext();
	}

	private doNext(): void {
		while (this.root.hasChildNodes()) {
			this.root.removeChild(this.root.firstChild!);
		}
		if (this.learningSession.hasMoreCards()) {
			this.doNextCard();
		} else {
			this.done();
		}
	}

	private async doNextCard(): Promise<void> {
		const cardsCountDiv = document.createElement("div");
		if (this.learningSession.getLateCount() == 0) {
			cardsCountDiv.setText(`Today: ${this.learningSession.getTodaysCount()}; New: ${this.learningSession.getNewCount()}`);
		} else {
			cardsCountDiv.setText(`Today: ${this.learningSession.getTodaysCount() + this.learningSession.getLateCount()} (Late: ${this.learningSession.getLateCount()}); New: ${this.learningSession.getNewCount()}`);
		}
		const questionDiv = document.createElement("div");
		const b = document.createElement("b");
		questionDiv.appendChild(b);
		b.setText(this.learningSession.currentCard().basename);
		const questionControlDiv = document.createElement("div");
		const answerDiv = document.createElement("div");
		const answerControlDiv = document.createElement("div");
		
		this.root.appendChild(cardsCountDiv);
		this.root.appendChild(document.createElement("hr"));
		this.root.append(questionDiv);
		this.root.append(answerDiv);
		this.root.appendChild(document.createElement("hr"));
		this.root.append(questionControlDiv);

		const showAnswerBtn = document.createElement("button");
		showAnswerBtn.setText("Show answer");
		showAnswerBtn.addEventListener("click", async () => {
			this.root.removeChild(questionControlDiv);
			this.root.append(answerDiv);
			this.root.append(answerControlDiv);
			MarkdownRenderer.renderMarkdown(
				await this.vault.read(this.learningSession.currentCard()),
				answerDiv,
				'',
				this.parentComponent);
		});
		questionControlDiv.appendChild(showAnswerBtn);

		const punt3Btn = document.createElement("button");
		punt3Btn.setText("Punt 3");
		punt3Btn.addEventListener("click", () => {
			this.learningSession.punt(createDateWithInterval(3));
			this.doNext();
		});
		answerControlDiv.appendChild(punt3Btn);
		const punt5Btn = document.createElement("button");
		punt5Btn.setText("Punt 5");
		punt5Btn.addEventListener("click", () => {
			this.learningSession.punt(createDateWithInterval(5));
			this.doNext();
		});
		answerControlDiv.appendChild(punt5Btn);


		const notThisSessionBtn = document.createElement("button");
		notThisSessionBtn.setText("Not right now");
		notThisSessionBtn.addEventListener("click", () => {
			this.learningSession.skipCard();
			this.doNext();
		});
		answerControlDiv.appendChild(notThisSessionBtn);
		const ignoreBtn = document.createElement("button");
		ignoreBtn.setText("Ignore forever");
		ignoreBtn.addEventListener("click", () => {
			this.learningSession.ignoreCard();
			this.doNext();
		});
		answerControlDiv.appendChild(ignoreBtn);
		const againBtn = document.createElement("button");
		againBtn.setText("Again");
		againBtn.addEventListener("click", () => {
			this.learningSession.again();
			this.doNext();
		});
		answerControlDiv.appendChild(againBtn);
		this.createAnswerButton(answerControlDiv, Answer.BLACK_OUT, 'No clue');
		this.createAnswerButton(answerControlDiv, Answer.WRONG, 'Wrong');
		this.createAnswerButton(answerControlDiv, Answer.WRONG_EASY_RECALL, 'Wrong, but easy recall');
		this.createAnswerButton(answerControlDiv, Answer.CORRECT_LOTS_OF_THINKING, 'Right, lots of thinking');
		this.createAnswerButton(answerControlDiv, Answer.GOOD_SOME_THINKING, 'Right, some hesitation');
		this.createAnswerButton(answerControlDiv, Answer.PERFECT, 'Perfect');
	}

	private createAnswerButton(container: HTMLDivElement, answer: Answer, text: string): void {
		const nextIter = getNextInterval(
			answer,
			this.learningSession.currentRepetitions(),
			this.learningSession.currentEasyFactor(),
			this.learningSession.currentInterval());
		const btn = document.createElement("button");
		btn.setText(`${text}(${nextIter.intervalInDays})`);
		btn.addEventListener("click", () => {
			this.learningSession.updateCard(
				nextIter.easyFactor,
				nextIter.intervalInDays,
				nextIter.repetiotions,
				nextIter.shceduledAt
			);
			this.updatedCardsCount++;
			if (this.updatedCardsCount > 10) {
				this.updatedCardsCount = 0;
				this.kvs.commit();
			}
			this.doNext();
		});
		container.appendChild(btn);
	}

	private done(): void {
		this.root.setText('All done');
	}
	async onClose() {
		const {contentEl} = this;
		contentEl.empty();

		await this.kvs.commit();
	}
}