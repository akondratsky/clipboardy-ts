import execa from 'execa';
import { IClipboard } from './types';

class TermuxError extends Error {
	public code?: string;
}

export class TermuxClipboard implements IClipboard {
	private handleError(error: TermuxError): never {
		if (error.code === 'ENOENT') {
			throw new Error('Couldn\'t find the termux-api scripts. You can install them with: apt install termux-api');
		}
		throw error;
	}

	async write(input: string) {
		try {
			await execa('termux-clipboard-set', { input });
		} catch (error) {
			this.handleError(error as TermuxError);
		}
	}

	async read(): Promise<string> {
		try {
			const { stdout } = await execa('termux-clipboard-get', { stripFinalNewline: false });
			return stdout;
		} catch (error) {
			this.handleError(error as TermuxError);
		}
	}

	writeSync(input: string): void {
		try {
			execa.sync('termux-clipboard-set', { input });
		} catch (error) {
			this.handleError(error as TermuxError);
		}
	}

	readSync(): string {
		try {
			return execa.sync('termux-clipboard-get', { stripFinalNewline: false }).stdout;
		} catch (error) {
			this.handleError(error as TermuxError);
		}
	}
}
