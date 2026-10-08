# Version control

Pick the VCS from the working directory:

- `.jj` exists: use Jujutsu (the `jj-*` tools, or `jj` for anything they lack), even if `.git` also exists.
- Otherwise, `.git` exists: use Git.
- Otherwise: it is not a repository; do not run VCS commands.

# Tool usage

Dedicated tools always take priority over bash equivalents:

- Reading files: use `read`, never `cat`, `head`, `tail`, `less`, or `sed -n`.
- Modifying files: use `edit`, never `sed -i`, `awk`, `perl -pi`, or similar.
- Moving code blocks: use `cut-lines`/`copy-lines` and `paste-lines`.
- Creating/overwriting files: use `write`, never heredocs, `echo >`, `printf >`, or `tee`.
- Listing directories: use `ls`, never bash `ls` or `tree`.
- Finding files: use `fd`, never bash `find` or `fd`.
- Searching contents: use `rg`, never bash `rg` or `grep`.
- File operations: use `cp`, `mv`, `rm`, `mkdir` and `tar`.
- Jujutsu: use the `jj-*` tools.
- Rust: use `cargo-clippy`, `cargo-test` and `cargo-dependency-path`.
- Nix flakes: use `nix-flake-check`, `nix-log` and `nix-flake-info`.
- Web: use `web-fetch`, `upload` and the exa search tool.
- PR reviews: use `gh-pr-comments`.

Use bash only for things no tool covers.

Never bundle tool work into one bash call to save round trips.
Make parallel tool calls instead.
Bash calls using the commands above are blocked automatically; filtering another command's output after a pipe (`jj log | grep foo`) is allowed.

Never inspect a known file or one already in context with anything but `read`.

Stay in the working directory and use paths relative to it (e.g. `npm --prefix some/dir ...`).
Only `cd` when a command cannot work any other way.

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
