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
    filesets:
    lib.fileset.toSource {
      inherit root;
      fileset = lib.fileset.unions filesets;
    };

  withExt = exts: lib.fileset.fileFilter (f: lib.any f.hasExt exts) root;

  nixSrc = sourceWith [ (withExt [ "nix" ]) ];
in
mkChecks {
  nixfmt = {
    src = nixSrc;
    nativeBuildInputs = [ pkgs.nixfmt ];
    buildPhase = "find . -name '*.nix' -exec nixfmt --check {} +";
  };

  deadnix = {
    src = nixSrc;
    nativeBuildInputs = [ pkgs.deadnix ];
    buildPhase = "deadnix --fail .";
  };
}
