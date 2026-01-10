{
  config,
  lib,
  pkgs,
  ...
}:
{
  options.desktop-environment = with lib; {
    profile = mkOption {
      type = types.enum [ "personal" ];
    };
  };

  imports = [
    ./alacritty.nix
    ./firefox.nix
    ./hyprlock.nix
    ./niri.nix
    ./rofi.nix
    ./vscode.nix
    ./waybar.nix
  ];

  config =
    with config.desktop-environment;
    lib.mkMerge [
      {
        home.packages = with pkgs; [
          signal-desktop
          spotify
        ];

        # Set natural scroll system-wide.
        dconf.settings = {
          "org/gnome/desktop/peripherals/touchpad" = {
            natural-scroll = true;
          };
        };
      }
      (lib.mkIf (profile == "personal") {
        programs.vscode.enable = true;
        home.packages = with pkgs; [
          inkscape
          mpv
          novelwriter
          xwayland-satellite # needed by: novelwriter
          obsidian
        ];
      })
    ];
}
