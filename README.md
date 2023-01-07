# Obsidian simple spaced repetition (BETA)
This Obsidian (https://obsidian.md) plugin implements a spaced repetition algorithm on top of all notes in an Obsidian vault.

This is an plugin written to address a very specific use case:
- every note in the vault is considered to be a card
- no need to add tags or any other configurations
- all progress is tracked in a single file
- the approach is iCloud and git friendly (works across my laptops and ipad)
- this plugin has zero configs and is intended to be as simple as possible, and fit my, pretty standard, needs

I tend to have a single Obsidian vault per one large topic (like engineering, writing, etc). Hence, every card in the vault is relevant to that topic. Some cards are too big to be presented for spaced repetition. Examples of these cards are various summaries and maps of content. But the majority of cards in my vaults are small.

With the majority of cards being useful for spaced repetition, it is not convenient for me to tag the majority of them. I simply prefer to click on the “Ignore” button during a spaced repetition session, when I run into an irrelevant card.

This plugin is Git friendly. My typical workflow combines activities on my laptops and iPad. While I am using iCloud to keep iPad’s vaults updated, I still use git in other environments. I commit a set of vault changes after each writing session, for instance, after I am done with all notes for a chapter for a book. This plugin tracks all learning data via a single text file, which is easy for me to git-commit as well.

The algorithm used in the plugin is based on SM2 with few modifications to fit my learning. When I have a new set of cars, I tend to go over many of them - I do not limit myself to 20 new cards per day. When these cards get scheduled, the interval is calculated based on SM2. Then the interval adds +/- 10% of days to avoid all new cards to be shown in waves.

Buttons:
- Not right now: skip the card for this learning session; basically cards state won't be updated
- Ignore forever: the card won't be shown again
- Other buttons: reschedule the card for a shown interval
