---
name: create-patch-notes
description: Create patch notes for this project from current branch changes compared to main. Use when the user says patch notes, create patch notes, update changelog, add date log, or runs the patch-notes command.
---

# Create Patch Notes

Create project patch notes for user-facing changes introduced by the current checkout branch compared to `main`.

## Workflow

1. Inspect current branch changes against `main`.
2. Identify only user-facing changes.
3. Group related changes into concise entries.
4. Categorize entries as `new`, `improved`, or `fixed`.
5. Add a dated update module under `src/lib/features/patchNotes/updates/`.
6. Import and insert it in `src/lib/features/patchNotes/index.ts` in newest-first order.
7. Format changed files and run `pnpm check`.

## Diff Inspection

Prefer `main` as the comparison base. If local `main` is unavailable, use `origin/main`.

Useful commands:

```bash
git merge-base HEAD main
git diff --name-status <merge-base>..HEAD
git diff <merge-base>..HEAD
```

If the branch contains uncommitted work, include it only when it is relevant to the requested patch note task. Use `git status` and inspect unstaged diffs before deciding.

## What To Include

Include changes that players or site users can notice:

- New visible features, settings, game modes, pages, UI controls, notifications, or content.
- Improvements to existing user flows, layout, copy, accessibility, performance, or presentation.
- Fixes for incorrect behavior, broken UI, stale data, crashes, bad links, or confusing feedback.

Exclude purely technical work:

- Refactors with no behavior change.
- Dependency, build, CI, lint, formatting, or config changes with no user-visible effect.
- Test-only changes.
- Internal API/database/code organization changes that do not alter user-facing behavior.

When unsure whether a change is user-facing, inspect surrounding code and prefer excluding it unless there is a clear user impact.

## Writing Style

Use existing updates in `src/lib/features/patchNotes/updates/` as examples for structure and tone.

Entries should be short, concrete, and user-oriented:

- Title: sentence case, past tense, ending with a period.
- Description: optional, one sentence, explaining the user-visible effect.
- Avoid implementation details unless users need to understand the behavior.

Categories:

- `new`: new user-facing capability or content.
- `improved`: better behavior, layout, copy, accessibility, or usability.
- `fixed`: bug or regression correction.

If multiple user-facing changes exist, split them into separate entries. If a single feature includes small supporting tweaks, keep them together.

## File Pattern

Use today's date from the environment or `date +%Y-%m-%d`.

If no update file exists for the date, create:

```ts
import type { UpdateDate } from '../types';

export default {
	date: 'YYYY-MM-DD',
	revisions: [
		{
			id: 'YYYY-MM-DD.1',
			new: [],
			improved: [],
			fixed: []
		}
	]
} satisfies UpdateDate;
```

Omit empty category arrays.

If a file already exists for the date, append a new revision using the next suffix, e.g. `YYYY-MM-DD.2`. Do not rewrite unrelated existing entries.

After creating a new dated file, add its import to `src/lib/features/patchNotes/index.ts` and place it in the `updates` array in descending date order.

## Verification

Run:

```bash
pnpm exec prettier --write <changed patch note files>
pnpm check
```

Report any existing unrelated warnings separately from new issues.
