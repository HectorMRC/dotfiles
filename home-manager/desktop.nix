{
  config,
  lib,
  ...
}:
let
  Profiles = {
    Personal = "personal";
  };
in
{
  options = with lib; {
    desktop-environment = {
      profiles = mkOption {
        type = types.listOf (types.enum (builtins.attrValues Profiles));
      };
    };
  };

  config =
    with config.desktop-environment;
    lib.mkMerge [
      (lib.mkIf (builtins.elem Profiles.Personal profiles) {
        home.packages = [
          pkgs.spotify
          pkgs.signal-desktop
        ];
      })
    ];
}
