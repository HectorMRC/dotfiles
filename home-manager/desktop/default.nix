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
  options.desktop-environment = with lib; {
    profile = mkOption {
      type = types.enum (builtins.attrValues Profiles);
    };
  };

  imports = [
    ./alacritty.nix
    ./firefox.nix
    ./hyprlock.nix
    ./niri.nix
    ./rofi.nix
    ./spotify.nix
    ./vscode.nix
    ./waybar.nix
  ];

  config =
    with config.desktop-environment;
    lib.mkMerge [
      {
        home.packages = with pkgs; [
          signal-desktop
        ];

        # Set natural scroll system-wide.
        dconf.settings = {
          "org/gnome/desktop/peripherals/touchpad" = {
            natural-scroll = true;
          };
        };
      }
      (lib.mkIf (profile == Profiles.Personal) {
        programs.vscode.enable = true;
        home.packages = with pkgs; [
          inkscape
          mpv
          obsidian
        ];

      })
    ];
}
