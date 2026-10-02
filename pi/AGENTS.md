# Version control

Pick the VCS from the working directory:

- `.jj` exists: use Jujutsu (`jj`), even if `.git` also exists.
- Otherwise, `.git` exists: use Git.
- Otherwise: it is not a repository; do not run VCS commands.
