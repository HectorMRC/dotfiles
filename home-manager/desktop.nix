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

  # Force Spotify to run on Wayland.
  spotify-wayland =
    with pkgs;
    (symlinkJoin {
      name = "spotify";
      paths = [ spotify ];
      buildInputs = [ makeWrapper ];
      postBuild = ''
        wrapProgram $out/bin/spotify \
        --add-flags "--enable-features=UseOzonePlatform --ozone-platform=wayland"
      '';
    });
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
          signal-desktop
          spotify-wayland
        ];
      })

      {
        dconf.settings = {
          "org/gnome/desktop/interface" = {
            color-scheme = "prefer-dark";
          };
        };
      }
    ];
}
