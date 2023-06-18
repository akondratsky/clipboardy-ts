import process from 'node:process';
import isWSL from 'is-wsl';
import { TermuxClipboard } from './termux';
import { LinuxClipboard } from './linux';
import { MacosClipboard } from './macos';
import { WindowsClipboard } from './windows';
import { IClipboard } from './types';

class Clipboard implements IClipboard {
	private impl: IClipboard;

	constructor() {
		switch (process.platform) {
			case 'darwin':
				this.impl = new MacosClipboard();
				break;
			case 'win32':
				this.impl = new WindowsClipboard();
				break;
			case 'android':
				if (process.env.PREFIX !== '/data/data/com.termux/files/usr') {
					throw new Error('You need to install Termux for this module to work on Android: https://termux.com');
				}
				this.impl = new TermuxClipboard();
				break
			default:
				// `process.platform === 'linux'` for WSL.
				if (isWSL) {
					this.impl = new WindowsClipboard();
					break;
				}
	
				this.impl = new LinuxClipboard();
		}
	}

	write(input: string): Promise<void> {
		return this.impl.write(input);
	}

	read(): Promise<string> {
		return this.impl.read();
	}

	writeSync(input: string): void {
		return this.impl.writeSync(input);
	}

	readSync(): string {
		return this.impl.readSync();
	}
}

const clipboard = new Clipboard();

export default clipboard;
