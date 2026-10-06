{ pkgs, root }:
let
  inherit (pkgs) lib;

  common = {
    installPhase = "mkdir $out";
  };

  mkChecks = lib.mapAttrs (
    name: attrs: pkgs.stdenvNoCC.mkDerivation ({ name = "check-${name}"; } // common // attrs)
  );

  sourceWith =
    fileset:
    lib.fileset.toSource {
      inherit root;
      fileset = lib.fileset.unions fileset;
    };

  withExt = exts: lib.fileset.fileFilter (f: lib.any f.hasExt exts) root;

  tomlSrc = sourceWith [ (withExt [ "toml" ]) ];
in
mkChecks {
  nixfmt = {
    src = sourceWith [ (withExt [ "nix" ]) ];
    nativeBuildInputs = [ pkgs.nixfmt ];
    buildPhase = "find . -name '*.nix' -exec nixfmt --check {} +";
  };

  biome = {
    src = sourceWith [
      (withExt [
        "ts"
        "json"
      ])
      (root + /biome.json)
      (root + /.gitignore)
    ];
    nativeBuildInputs = [ pkgs.biome ];
    buildPhase = "biome format .";
  };

  stylua = {
    src = sourceWith [
      (withExt [ "lua" ])
      (root + /neovim/.stylua.toml)
    ];
    nativeBuildInputs = [ pkgs.stylua ];
    buildPhase = "stylua --check --config-path neovim/.stylua.toml neovim";
  };

  tombi-format = {
    src = tomlSrc;
    nativeBuildInputs = [ pkgs.tombi ];
    buildPhase = "tombi format --check --offline --verbose";
  };

  tombi-lint = {
    src = tomlSrc;
    nativeBuildInputs = [ pkgs.tombi ];
    buildPhase = "tombi lint --offline --verbose";
  };

  yamllint = {
    src = sourceWith [
      (withExt [
        "yaml"
        "yml"
      ])
      (root + /.yamllint)
    ];
    nativeBuildInputs = [ pkgs.yamllint ];
    buildPhase = ''
      yamllint --list-files .
      yamllint --config-file .yamllint .
    '';
  };
}
