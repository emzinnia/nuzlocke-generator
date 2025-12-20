/**
 * Parser for search queries
 *
 * Converts tokens into an Abstract Syntax Tree (AST).
 *
 * Grammar (simplified):
 *   Expr     := OrExpr
 *   OrExpr   := AndExpr ( ( '|' | 'OR' ) AndExpr )*
 *   AndExpr  := UnaryExpr ( 'AND'? UnaryExpr )*  // implicit AND via adjacency
 *   UnaryExpr:= ( '!' | '-' )? Primary
 *   Primary  := Group | FieldFilter | BareTerm
 *   Group    := '(' Expr ')'
 *   FieldFilter := FIELD ( ':' Value | Comparator Value | ':' Range )
 *   Range    := NUMBER '..' NUMBER
 */

import type {
    ASTNode,
    AndNode,
    BareTermNode,
    Comparator,
    FieldFilterNode,
    NotNode,
    OrNode,
    ParseError,
    ParseResult,
    ParseWarning,
    Token,
} from "./types";
import { FIELD_ALIASES, VALID_FIELDS } from "./types";
import { tokenize } from "./tokenize";

export function parseQuery(input: string): ParseResult {
    const { tokens, errors: tokenErrors } = tokenize(input);
    const errors: ParseError[] = [...tokenErrors];
    const warnings: ParseWarning[] = [];

    let pos = 0;

    const peek = (): Token => tokens[pos] ?? tokens[tokens.length - 1];
    const isAtEnd = (): boolean => peek().type === "EOF";
    const advance = (): Token => {
        const token = peek();
        if (!isAtEnd()) pos++;
        return token;
    };
    const check = (...types: Token["type"][]): boolean =>
        types.includes(peek().type);
    const match = (...types: Token["type"][]): boolean => {
        if (check(...types)) {
            advance();
            return true;
        }
        return false;
    };

    // Detect wildcards in a value string
    const hasWildcard = (value: string): boolean =>
        value.includes("*") || value.includes("?");

    // Resolve field alias to canonical name
    const resolveField = (field: string, token: Token): string => {
        const lower = field.toLowerCase();
        const canonical = FIELD_ALIASES[lower];

        if (!canonical) {
            // Unknown field - add warning with suggestion
            const suggestion = findClosestField(lower);
            warnings.push({
                message: `Unknown field "${field}"`,
                start: token.start,
                end: token.end,
                suggestion,
            });
            return lower; // return as-is, compiler will handle gracefully
        }

        return canonical;
    };

    // Find closest matching field name for typo suggestions
    const findClosestField = (input: string): string | undefined => {
        const fields = Object.keys(FIELD_ALIASES);
        let bestMatch: string | undefined;
        let bestDistance = Infinity;

        for (const field of fields) {
            const dist = levenshteinDistance(input, field);
            if (dist < bestDistance && dist <= 2) {
                bestDistance = dist;
                bestMatch = field;
            }
        }

        return bestMatch;
    };

    // Parse the full expression
    const parseExpr = (): ASTNode | null => {
        return parseOrExpr();
    };

    // OrExpr := AndExpr ( ( '|' | 'OR' ) AndExpr )*
    const parseOrExpr = (): ASTNode | null => {
        const left = parseAndExpr();
        if (!left) return null;

        const children: ASTNode[] = [left];

        while (match("PIPE", "OR")) {
            const right = parseAndExpr();
            if (!right) {
                errors.push({
                    message: "Expected expression after OR",
                    start: peek().start,
                    end: peek().end,
                });
                break;
            }
            children.push(right);
        }

        if (children.length === 1) return children[0];
        return { type: "OR", children } as OrNode;
    };

    // AndExpr := UnaryExpr ( 'AND'? UnaryExpr )*
    const parseAndExpr = (): ASTNode | null => {
        const left = parseUnaryExpr();
        if (!left) return null;

        const children: ASTNode[] = [left];

        // Keep parsing while we see AND or implicit adjacent terms
        while (true) {
            match("AND"); // consume optional AND

            // Check if next token could start a new term
            if (
                isAtEnd() ||
                check("PIPE", "OR", "RPAREN", "EOF")
            ) {
                break;
            }

            const right = parseUnaryExpr();
            if (!right) break;
            children.push(right);
        }

        if (children.length === 1) return children[0];
        return { type: "AND", children } as AndNode;
    };

    // UnaryExpr := ( '!' | '-' )? Primary
    const parseUnaryExpr = (): ASTNode | null => {
        if (match("BANG", "MINUS")) {
            const child = parsePrimary();
            if (!child) {
                errors.push({
                    message: "Expected expression after negation",
                    start: peek().start,
                    end: peek().end,
                });
                return null;
            }
            return { type: "NOT", child } as NotNode;
        }

        return parsePrimary();
    };

    // Primary := Group | FieldFilter | BareTerm
    const parsePrimary = (): ASTNode | null => {
        // Group: ( Expr )
        if (match("LPAREN")) {
            const expr = parseExpr();
            if (!match("RPAREN")) {
                errors.push({
                    message: "Expected closing parenthesis",
                    start: peek().start,
                    end: peek().end,
                });
            }
            return expr;
        }

        // FieldFilter: FIELD followed by : or comparator
        if (check("FIELD")) {
            return parseFieldFilter();
        }

        // BareTerm: BARE_STRING, QUOTED_STRING, or NUMBER used as search term
        if (check("BARE_STRING", "QUOTED_STRING", "NUMBER")) {
            const token = advance();
            return {
                type: "BARE_TERM",
                value: token.value,
                hasWildcard: hasWildcard(token.value),
            } as BareTermNode;
        }

        // Nothing valid found
        return null;
    };

    // FieldFilter := FIELD ( ':' Value | Comparator Value | ':' Range )
    const parseFieldFilter = (): FieldFilterNode | null => {
        const fieldToken = advance(); // FIELD token
        const field = resolveField(fieldToken.value, fieldToken);

        let comparator: Comparator = ":";

        // Determine comparator
        if (match("COLON")) {
            comparator = ":";
        } else if (match("EQ")) {
            comparator = "=";
        } else if (match("NEQ")) {
            comparator = "!=";
        } else if (match("GT")) {
            comparator = ">";
        } else if (match("GTE")) {
            comparator = ">=";
        } else if (match("LT")) {
            comparator = "<";
        } else if (match("LTE")) {
            comparator = "<=";
        } else {
            errors.push({
                message: `Expected ':' or comparator after field "${field}"`,
                start: peek().start,
                end: peek().end,
            });
            return null;
        }

        // Parse value
        if (!check("BARE_STRING", "QUOTED_STRING", "NUMBER")) {
            errors.push({
                message: `Expected value after "${field}${comparator}"`,
                start: peek().start,
                end: peek().end,
            });
            return null;
        }

        const valueToken = advance();
        const value = valueToken.value;
        let rangeEnd: string | undefined;

        // Check for range: NUMBER .. NUMBER
        if (valueToken.type === "NUMBER" && match("RANGE")) {
            if (!check("NUMBER")) {
                errors.push({
                    message: "Expected number after '..' in range",
                    start: peek().start,
                    end: peek().end,
                });
            } else {
                rangeEnd = advance().value;
            }
        }

        return {
            type: "FIELD_FILTER",
            field,
            comparator,
            value,
            rangeEnd,
            hasWildcard: hasWildcard(value),
        };
    };

    // Parse!
    const ast = parseExpr();

    // Check for leftover tokens
    if (!isAtEnd()) {
        const leftover = peek();
        errors.push({
            message: `Unexpected token "${leftover.value}" at position ${leftover.start}`,
            start: leftover.start,
            end: leftover.end,
        });
    }

    return { ast, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Simple Levenshtein distance for typo detection */
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= a.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost,
            );
        }
    }

    return matrix[a.length][b.length];
}

