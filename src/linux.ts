import path from 'node:path';
import execa, { Options, SyncOptions } from 'execa';
import { IClipboard } from './types';

const xsel = 'xsel';
const xselFallback = path.join(__dirname, '../fallbacks/linux/xsel');
const writeArguments = ['--clipboard', '--input'];
const readArguments = ['--clipboard', '--output'];

class LinuxClipboardError extends Error {
	constructor(message: string) {
		super(message);
	}
	public code?: string;
	public xselError?: LinuxClipboardError;
	public fallbackError?: LinuxClipboardError;
}

export class LinuxClipboard implements IClipboard {
	private createError(xselError: LinuxClipboardError, fallbackError: LinuxClipboardError) {
		let error;
		if (xselError.code === 'ENOENT') {
			error = new LinuxClipboardError('Couldn\'t find the `xsel` binary and fallback didn\'t work. On Debian/Ubuntu you can install xsel with: sudo apt install xsel');
		} else {
			error = new LinuxClipboardError('Both xsel and fallback failed');
			error.xselError = xselError;
		}
	
		error.fallbackError = fallbackError;
		return error;
	}

	private async xsel(argumentList: string[], options: Options) {
		try {
			const { stdout } = await execa(xsel, argumentList, options);
			return stdout;
		} catch (xselError) {
			try {
				const {stdout} = await execa(xselFallback, argumentList, options);
				return stdout;
			} catch (fallbackError) {
				throw this.createError(xselError as LinuxClipboardError, fallbackError as LinuxClipboardError);
			}
		}
	};

	private xselSync(argumentList: string[], options: SyncOptions): string {
		try {
			return execa.sync(xsel, argumentList, options).stdout;
		} catch (xselError) {
			try {
				return execa.sync(xselFallback, argumentList, options).stdout;
			} catch (fallbackError) {
				throw this.createError(xselError as LinuxClipboardError, fallbackError as LinuxClipboardError);
			}
		}
	};

	async write(input: string): Promise<void> {
		await this.xsel(writeArguments, { input });
	}

	async read(): Promise<string> {
		return this.xsel(readArguments, { stripFinalNewline: false })
	}

	writeSync(input: string): void {
		this.xselSync(writeArguments, { input });
	}

	readSync(): string {
		return this.xselSync(readArguments, { stripFinalNewline: false })
	}
}
