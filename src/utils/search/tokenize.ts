/**
 * Tokenizer for search queries
 *
 * Converts a raw query string into a stream of tokens for the parser.
 */

import type { Token, TokenType } from "./types";
import { FIELD_ALIASES } from "./types";

const WHITESPACE = /\s/;
const IDENTIFIER_CHAR = /[a-zA-Z0-9_\-*?]/;

export interface TokenizeResult {
    tokens: Token[];
    errors: Array<{ message: string; start: number; end: number }>;
}

export function tokenize(input: string): TokenizeResult {
    const tokens: Token[] = [];
    const errors: Array<{ message: string; start: number; end: number }> = [];
    let pos = 0;

    const peek = (offset = 0): string => input[pos + offset] ?? "";
    const advance = (): string => input[pos++] ?? "";
    const isAtEnd = (): boolean => pos >= input.length;

    const addToken = (type: TokenType, value: string, start: number): void => {
        tokens.push({ type, value, start, end: pos });
    };

    const skipWhitespace = (): void => {
        while (!isAtEnd() && WHITESPACE.test(peek())) {
            advance();
        }
    };

    const readQuotedString = (): string => {
        const quote = advance(); // consume opening quote
        const start = pos;
        let value = "";

        while (!isAtEnd() && peek() !== quote) {
            // Handle escape sequences
            if (peek() === "\\" && (peek(1) === quote || peek(1) === "\\")) {
                advance(); // skip backslash
            }
            value += advance();
        }

        if (isAtEnd()) {
            errors.push({
                message: `Unterminated string starting at position ${start - 1}`,
                start: start - 1,
                end: pos,
            });
        } else {
            advance(); // consume closing quote
        }

        return value;
    };

    const readBareString = (): string => {
        let value = "";
        while (!isAtEnd() && IDENTIFIER_CHAR.test(peek())) {
            value += advance();
        }
        return value;
    };

    const readNumber = (): string => {
        let value = "";
        while (!isAtEnd() && /[0-9]/.test(peek())) {
            value += advance();
        }
        return value;
    };

    while (!isAtEnd()) {
        skipWhitespace();
        if (isAtEnd()) break;

        const start = pos;
        const char = peek();

        // Single-character tokens
        switch (char) {
            case ":":
                advance();
                addToken("COLON", ":", start);
                continue;
            case "!":
                advance();
                if (peek() === "=") {
                    advance();
                    addToken("NEQ", "!=", start);
                } else {
                    addToken("BANG", "!", start);
                }
                continue;
            case "-":
                // Could be negation or part of a bare string
                // If followed by a field name or (, treat as negation
                if (
                    WHITESPACE.test(peek(1)) ||
                    peek(1) === "(" ||
                    isFieldStart(input, pos + 1)
                ) {
                    advance();
                    addToken("MINUS", "-", start);
                    continue;
                }
                // Otherwise fall through to bare string
                break;
            case "(":
                advance();
                addToken("LPAREN", "(", start);
                continue;
            case ")":
                advance();
                addToken("RPAREN", ")", start);
                continue;
            case "|":
                advance();
                addToken("PIPE", "|", start);
                continue;
            case ">":
                advance();
                if (peek() === "=") {
                    advance();
                    addToken("GTE", ">=", start);
                } else {
                    addToken("GT", ">", start);
                }
                continue;
            case "<":
                advance();
                if (peek() === "=") {
                    advance();
                    addToken("LTE", "<=", start);
                } else {
                    addToken("LT", "<", start);
                }
                continue;
            case "=":
                advance();
                addToken("EQ", "=", start);
                continue;
            case ".":
                if (peek(1) === ".") {
                    advance();
                    advance();
                    addToken("RANGE", "..", start);
                    continue;
                }
                break;
            case '"':
            case "'": {
                const value = readQuotedString();
                addToken("QUOTED_STRING", value, start);
                continue;
            }
        }

        // Numbers (for range queries)
        if (/[0-9]/.test(char)) {
            const value = readNumber();
            addToken("NUMBER", value, start);
            continue;
        }

        // Identifiers (field names or bare strings)
        if (IDENTIFIER_CHAR.test(char)) {
            const value = readBareString();
            const upperValue = value.toUpperCase();

            // Check for keywords
            if (upperValue === "OR") {
                addToken("OR", value, start);
            } else if (upperValue === "AND") {
                addToken("AND", value, start);
            } else if (isFieldName(value.toLowerCase()) && peek() === ":") {
                // This is a field name followed by colon
                addToken("FIELD", value.toLowerCase(), start);
            } else {
                // Regular bare string (search term)
                addToken("BARE_STRING", value, start);
            }
            continue;
        }

        // Unknown character - skip and report
        errors.push({
            message: `Unexpected character '${char}' at position ${pos}`,
            start: pos,
            end: pos + 1,
        });
        advance();
    }

    addToken("EOF", "", pos);
    return { tokens, errors };
}

/** Check if a string is a known field name or alias */
function isFieldName(name: string): boolean {
    return name.toLowerCase() in FIELD_ALIASES;
}

/** Check if position starts a field name (for negation disambiguation) */
function isFieldStart(input: string, startPos: number): boolean {
    let pos = startPos;
    let word = "";

    while (pos < input.length && IDENTIFIER_CHAR.test(input[pos])) {
        word += input[pos];
        pos++;
    }

    return isFieldName(word.toLowerCase()) && input[pos] === ":";
}

