# Version control

There are no Git tools.
In a Git repository without `.jj`, ask the user to run Git commands.

## Commit messages

A [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) title only.
Never add a body unless the user explicitly asks for one.

- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore` or `revert`.
    Pick the one describing the main user-facing effect.
- Scope: only when one area clearly dominates.
    Reuse scopes from the repo history.
- Summary: lowercase, imperative, no trailing period.
    The whole title fits in 72 characters.
