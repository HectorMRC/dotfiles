---
name: nix-flake
description: Create, extend, debug and maintain the Nix flake of a project, including its dev shell, packages, flake checks and the CI running them. Use when touching a flake.nix, files under nix/, .envrc, or the Nix CI workflow.
---

# Nix flake

Templates live in [templates/](templates/), relative to this file.

## 1. Inspect first

Read `flake.nix`, `nix/`, `.envrc`, `.gitignore` and `.github/workflows/`.
Extend what exists and follow its conventions, even where they differ from this skill.
Never replace a working layout unless asked.

## 2. Layout

- `flake.nix` declares the inputs, builds `pkgs` once per system with every overlay, and wires the outputs.
    See [templates/flake.nix](templates/flake.nix).
- Move any logic longer than a few lines to `nix/<name>.nix`, a function taking `pkgs` and `root = ./.`.
    `nix/` files build sources from `root`, never with `../` paths.

## 3. Inputs

- Track `github:NixOS/nixpkgs/nixos-unstable`, or the channel the project already uses.
- Add `inputs.<dep>.follows = "nixpkgs"` to every input that has a `nixpkgs` input.
- Prefer packages from `nixpkgs` over new inputs.

## 4. Dev shell

- `devShells.default` holds the language toolchain, its language server and every formatter or linter the checks run, plus `nixd`, `nixfmt` and `deadnix`.
- `.envrc` contains `watch_file nix/**` followed by `use flake`, since `use flake` does not watch imported files.
- `.direnv/` must be in `.gitignore`.

## 5. Checks

Every rule enforced on the project is a flake check, so the same thing runs locally and in CI.

- [templates/nix/checks.nix](templates/nix/checks.nix) provides:
    - `mkChecks`, building each check as a `stdenvNoCC` derivation that only has to succeed.
    - `sourceWith` and `withExt`, building a check source from `lib.fileset`.
    - `nixfmt` and `deadnix` checks over every `.nix` file.
- Give each check the smallest source it needs, so unrelated edits do not rebuild it.
- Add one check per formatter or linter, e.g. `tombi` for TOML, `yamllint` for YAML, `actionlint` for workflows.
- Checks are offline: pre-fetch anything a tool would download, e.g. with `pkgs.fetchurl`.
- Run them all with `nix flake check`.

## 6. Formatter

`formatter = pkgs.nixfmt-tree`, so `nix fmt` formats the whole tree.

## 7. Packages

- Scripts use `pkgs.writeShellApplication` with `runtimeInputs`, so shellcheck runs at build time.
- Set `meta.mainProgram` and call binaries with `lib.getExe`.
- For a new fixed-output hash, such as `fetchFromGitHub` or `cargoHash`, set `lib.fakeHash`, build, and copy the hash from the error.

## 8. Rust

- Add `rust-overlay` with `inputs.nixpkgs.follows = "nixpkgs"`, and `(import rust-overlay)` to the overlays.
- Pin the toolchain in `rust-toolchain.toml` and add `(pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml)` to the dev shell.

## 9. CI

Copy [templates/nix-flake-checks.yaml](templates/nix-flake-checks.yaml) to `.github/workflows/nix-flake-checks.yaml`.

- It runs `nix flake check --option keep-going true`, building every check and evaluating every output.
- Pin actions by commit SHA with the version in a comment, and keep the concurrency group and read-only permissions.

## 10. Verify

1. Run `jj-status`, since flakes only see tracked files.
2. List the checks with `nix-flake-check`, then build those affected by the change.
3. On failure, read the full log with `nix-log` on the failing drv.
4. Inspect inputs with `nix-flake-info`.
5. Ask the user to run `nix flake lock` after adding inputs, or `nix flake update` to bump them.
