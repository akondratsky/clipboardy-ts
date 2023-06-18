import execa from 'execa';
import { IClipboard } from './types';

const env = {
	LC_CTYPE: 'UTF-8',
};

export class MacosClipboard implements IClipboard {
	async write(input: string): Promise<void> {
		execa('pbcopy', { env, input });
	}

	async read(): Promise<string> {
		const { stdout } = await execa('pbpaste', { env, stripFinalNewline: false });
		return stdout;
	}

	writeSync(input: string): void {
		execa.sync('pbcopy', { env, input });
	}

	readSync(): string {
		return execa.sync('pbpaste', { env, stripFinalNewline: false }).stdout;
	}	
}
