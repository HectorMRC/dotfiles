# Secrets

Encrypted with [agenix](https://github.com/ryantm/agenix).
`secrets.nix` lists the public keys allowed to decrypt each file.

Run from this directory, inside `nix develop`:

- Edit or create a secret: `agenix -e <name>.age`
- Print a secret: `agenix -d <name>.age`
- Re-encrypt after changing keys: `agenix -r`
