import { App, Editor, MarkdownView, Modal, Notice,
	Plugin, PluginSettingTab, Setting, MarkdownRenderer, TextComponent, Component,
DataWriteOptions,
TFile,
Vault} from 'obsidian';

import {CardsDB, Card} from 'cardsdb';
import {getNextInterval, Answer} from 'spacer';
import {LearningSession} from 'learning-session';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		const ribbonIconEl = this.addRibbonIcon('dice', 'Simply spaced', (evt: MouseEvent) => {
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

	private root: HTMLDivElement;

	constructor(app: App, parentComponent: Component) {
		super(app);
		this.parentComponent = parentComponent;
		this.vault = this.app.vault;
	}

	async onOpen() {
		const cardsDB = new CardsDB(this.vault);
		await cardsDB.load();
		const allMDs = this.vault.getMarkdownFiles();
		this.learningSession = new LearningSession(cardsDB, allMDs);

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


		const ignoreBtn = document.createElement("button");
		ignoreBtn.setText("Ignore");
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
	}
}