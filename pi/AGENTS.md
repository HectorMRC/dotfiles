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

Use bash only for things no built-in tool covers: searching/listing (`rg`, `find`, `ls`), running builds/tests/scripts, and VCS commands.
