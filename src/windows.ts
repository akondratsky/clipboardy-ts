import path from 'node:path';
import execa from 'execa';
import arch from 'arch';
import { IClipboard } from './types';

const binarySuffix = arch() === 'x64' ? 'x86_64' : 'i686';

// Binaries from: https://github.com/sindresorhus/win-clipboard
const windowBinaryPath = path.join(__dirname, `../fallbacks/windows/clipboard_${binarySuffix}.exe`);


export class WindowsClipboard implements IClipboard {
	async write(input: string): Promise<void> {
		await execa(windowBinaryPath, ['--copy'], { input })
	}

	async read(): Promise<string> {
		const { stdout } = await execa(windowBinaryPath, ['--paste'], { stripFinalNewline: false });
		return stdout;
	}

	writeSync(input: string): void {
		execa.sync(windowBinaryPath, ['--copy'], { input })
	}

	readSync(): string {
		return execa.sync(windowBinaryPath, ['--paste'], { stripFinalNewline: false }).stdout;
	}	
}
