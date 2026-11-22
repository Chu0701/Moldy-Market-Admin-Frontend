---
name: moldy-task-start
description: Use at the start of every task in a Moldy Market frontend repo. Loads only the minimum context (state, doc section, endpoint status) to keep token use low.
---

# Task start (cheap context loading)

1. Read `AGENTS.md` (already loaded). Do not read all docs.
2. Run `git status -s` and `git log --oneline -5`. Check `package.json` scripts and `ls src` only if the task touches setup or structure.
3. Identify the single feature/page. Open ONLY:
   - its row in `docs/04-ROUTING-AND-PAGES.md` (grep the path),
   - its section in `docs/05-PAGE-BY-PAGE-GUIDE.md`,
   - the matching endpoint rows in `docs/14-BACKEND-INTEGRATION-MATRIX.md` (grep the path or module name).
     Use `grep -n "^#" file` to find the section, then read just that range.
4. Check each needed endpoint status in doc 14. If not IMPLEMENTED: do UI skeleton only (see AGENTS.md rule 1) and tell the owner.
5. If the task hits an undecided item (Q1, Q2, Q19, B10 flow), stop and ask the owner one short question in Vietnamese with options.
6. State a 3-5 line plan (files to create/change), then implement. Keep the diff small.
7. Finish with `moldy-feature` checklist. Report in Vietnamese: what changed, how to verify, one next step.
