# Version control

Pick the VCS from the working directory:

- `.jj` exists: use Jujutsu (`jj`), even if `.git` also exists.
- Otherwise, `.git` exists: use Git.
- Otherwise: it is not a repository; do not run VCS commands.

# Tool usage

Built-in tools always take priority over bash equivalents:

- Reading files: use `read`, never `cat`, `head`, `tail`, `less`, or `sed -n`.
- Modifying files: use `edit`, never `sed -i`, `awk`, `perl -pi`, or similar.
- Creating/overwriting files: use `write`, never heredocs, `echo >`, `printf >`, or `tee`.
- Listing directories: use `ls`, never bash `ls` or `tree`.
- Finding files: use `find`, never bash `find` or `fd`.
- Searching contents: use `grep`, never bash `rg` or `grep`.

Use bash only for things no built-in tool covers: running builds/tests/scripts and VCS commands.

Never bundle built-in tool work into one bash call to save round trips. Make parallel built-in tool calls instead. Bash calls using the commands above are blocked automatically; filtering another command's output after a pipe (`jj log | grep foo`) is allowed.

Never inspect a known file or one already in context with anything but `read`.

Stay in the working directory and use paths relative to it (e.g. `npm --prefix some/dir ...`). Only `cd` when a command cannot work any other way.

# Writing

Applies to code, comments, docs and READMEs:

- Be as brief as possible while staying clear. Go straight to the point.
- No filler, repetition or padded sentences.
- No AI tells, such as em dashes.
- Write for humans first.
