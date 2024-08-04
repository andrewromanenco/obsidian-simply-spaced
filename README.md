# Obsidian simple spaced repetition

This Obsidian (https://obsidian.md) plugin implements a spaced repetition algorithm for all notes in an Obsidian vault. See [Releases](https://github.com/andrewromanenco/obsidian-simply-spaced/releases).

### Use Case

- Treats every note in the vault as a card.
- No need for tags or configurations.
- Progress tracked via [KV-Synced](https://github.com/andrewromanenco/kv-synced/); iCloud-friendly for syncing across multiple devices.

### Algorithm

Based on SM2 with modifications:
- Punt cards (reschedule ahead) for managing new cards.
- Adds randomness to intervals to avoid "waves" of cards.

### Buttons
- **Not right now**: Skip the card for this session.
- **Punt**: Reschedule the card for a given interval.
- **Ignore forever**: The card won't be shown again.
- **Other buttons**: Reschedule the card for the shown interval.

### Notes
- `npm run build`
- `npx jest`
