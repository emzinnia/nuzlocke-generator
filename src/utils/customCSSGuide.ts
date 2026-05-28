export const customCSSGuide = `# Custom CSS Guide
Last updated \`v1.5.0\`

Curious about the different ways you can use CSS in the nuzlocke-generator to tweak your template? Well, look no further! This guide covers key gotchas and ways to write CSS, and some recipes to make your life easier.

## Getting Started

You'll need a [baseline understanding of CSS](https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/What_is_CSS) to fully grok the recipes and examples listed here.

## Modifying the Base

* Scope: Entire result

### Adding a gradient

You can use a CSS gradient as a background image for a result image. For example:

\`\`\`css
.result {
    background-image: linear-gradient(0deg, rgba(1,0,36,1) 0%, rgba(207,0,255,1) 100%) !important;
}
\`\`\`

Creates a purple to dark-blue gradient.

> [This site](https://cssgradient.io/) contains a useful gradient generator

## Team Pokemon Layout

* Scope: Each Pokemon in the team section

### Showing long notes above moves

Long notes can overlap the moves, item, or image in the default templates because each Pokemon card keeps a fixed height. If you use notes as battle summaries, give each card more vertical room and let the notes wrap before the moves.

\`\`\`css
.pokemon-info {
    min-height: 18rem;
    align-items: stretch;
}

.pokemon-info-inner {
    max-width: 65%;
}

.pokemon-notes {
    white-space: pre-line;
    line-height: 1.25;
    margin-top: 0.35rem;
    max-width: 100%;
}

.pokemon-moves {
    position: static;
    margin-top: 0.5rem;
}

.pokemon-image-wrapper {
    align-self: center;
}
\`\`\`

If your notes are still too tall, increase the \`min-height\` value. If your moves should stay beside the notes instead of below them, remove the \`.pokemon-moves\` rule and increase \`.pokemon-info-inner\` less aggressively.








`;
