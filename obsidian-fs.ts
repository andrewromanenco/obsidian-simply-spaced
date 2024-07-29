import { createHash } from 'crypto';
import { CloudDrive } from 'kv-synced';
import { App, Vault, TFolder, TFile } from 'obsidian';

export class ObsidianFS implements CloudDrive {

    private static readonly FOLDER: string = "ZSpacedRepetition";

    private fsFolder: TFolder;
    private vault: Vault;

    constructor(vault: Vault) {
        this.vault = vault;
    }

    async init(app:App): Promise<void> {
        const vault = app.vault;
        try {
            await vault.createFolder(ObsidianFS.FOLDER);
        } catch (error) {
            // do nothing
        }
      }

    async list(): Promise<any[]> {
        const result: any[] = [];
        const folder = this.vault.getAbstractFileByPath(ObsidianFS.FOLDER) as TFolder;
        Vault.recurseChildren(folder, (file) => {
            if (file instanceof TFile) {
              result.push(file);
            }
          });
        return new Promise<any[]>((resolve) => {
            resolve(result);
        });
    }
    async read(fileHandle: any): Promise<string> {
        const readValue = await this.vault.read(fileHandle as TFile);
        return new Promise<string>((resolve) => {
            resolve(readValue);
        });
    }

    async write(content: string): Promise<void> {
        const hash = createHash('sha256');
        hash.update(content);
        const hex  = hash.digest('hex');
        const fileName = `${ObsidianFS.FOLDER}/${hex}.json`;
        await this.vault.create(fileName, content);
    }
}
