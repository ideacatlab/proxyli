import * as vscode from 'vscode';

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

const legend = (function () {
	const tokenTypesLegend = ['delimiter', 'port', 'value', 'username', 'password'];
	tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

	// Updated: Change from any[] to string[]
	const tokenModifiersLegend: string[] = [];
	tokenModifiersLegend.forEach((tokenModifier, index) =>
		tokenModifiers.set(tokenModifier, index)
	);

	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentSemanticTokensProvider(
			{ language: 'proxylist' },
			new DocumentSemanticTokensProvider(),
			legend
		)
	);
}

interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
	async provideDocumentSemanticTokens(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): Promise<vscode.SemanticTokens> {
		const allTokens = this._parseText(document.getText());
		const builder = new vscode.SemanticTokensBuilder();
		allTokens.forEach((token) => {
			builder.push(
				token.line,
				token.startCharacter,
				token.length,
				this._encodeTokenType(token.tokenType),
				this._encodeTokenModifiers(token.tokenModifiers)
			);
		});
		return builder.build();
	}

	private _encodeTokenType(tokenType: string): number {
		if (tokenTypes.has(tokenType)) {
			return tokenTypes.get(tokenType)!;
		}
		return 0;
	}

	private _encodeTokenModifiers(strTokenModifiers: string[]): number {
		return 0; // No modifiers in this example
	}

	private _parseText(text: string): IParsedToken[] {
		const r: IParsedToken[] = [];
		const lines = text.split(/\r\n|\r|\n/);
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			let currentOffset = 0;
			// Updated: Use const instead of let for 'parts'
			const parts = line.split(':');
			for (let j = 0; j < parts.length; j++) {
				const part = parts[j];
				r.push({
					line: i,
					startCharacter: currentOffset,
					length: part.length,
					tokenType: this._getTokenForPart(j),
					tokenModifiers: [],
				});
				currentOffset += part.length + 1; // +1 for the delimiter ':'
			}
		}
		return r;
	}

	private _getTokenForPart(partIndex: number): string {
		switch (partIndex) {
			case 0:
				return 'delimiter'; // Color for separators like ':'
			case 1:
				return 'port'; // Color for values like '5868'
			case 2:
				return 'value'; // Color for values like 'kmijebln'
			case 3:
				return 'username'; // Color for values like 'kmijebln'
			case 4:
				return 'password'; // Color for values like 'xsxzdw2h8agh'
			default:
				return 'delimiter';
		}
	}
}
