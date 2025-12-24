{
  config,
  lib,
  pkgs,
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
        home.packages = with pkgs; [
          # Force Spotify to run on Wayland.
          (symlinkJoin {
            name = "spotify";
            paths = [ spotify ];
            buildInputs = [ makeWrapper ];
            postBuild = ''
              wrapProgram $out/bin/spotify \
                --add-flags "--enable-features=UseOzonePlatform --ozone-platform=wayland"
            '';
          })
          signal-desktop
        ];
      })
    ];
}
