# Version control

Pick the VCS from the working directory:

- `.jj` exists: use the `jj-*` tools, even if `.git` also exists.
- Otherwise, `.git` exists: there are no Git tools; ask the user to run Git commands.
- Otherwise: it is not a repository.

# Tool usage

There is no shell. Use these tools:

- Reading files: `read`.
- Modifying files: `edit`.
- Moving code blocks: `cut-lines`/`copy-lines` and `paste-lines`.
- Creating/overwriting files: `write`.
- Listing directories: `ls`.
- Finding files: `fd`.
- Searching contents: `rg`.
- File operations: `cp`, `mv`, `rm`, `mkdir` and `tar`.
- Jujutsu: use the `jj-*` tools.
- Rust: use `cargo-clippy`, `cargo-test` and `cargo-dependency-path`.
- Nix flakes: use `nix-flake-check`, `nix-log` and `nix-flake-info`.
- Web: use `web-fetch`, `upload` and the exa search tool.
- PR reviews: use `gh-pr-comments`.

When no tool covers a task, ask the user to run the command.

Make independent tool calls in parallel.

Never inspect a known file or one already in context with anything but `read`.

Stay in the working directory and use paths relative to it.

# Plans

When executing a tracked plan, write `[DONE:n]` in visible response text, never only in reasoning, right after finishing step n.
This includes steps you find already done: verify them, then tag them.
Never end a turn with a finished step untagged.
Do not execute a plan until the execute message arrives.

# Writing

Applies to code, comments, docs and READMEs:

- Be as brief as possible while staying clear.
    Go straight to the point.
- No filler, repetition or padded sentences.
- No AI tells, such as em dashes.
- Write for humans first.
