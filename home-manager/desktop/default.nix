{
  config,
  lib,
  pkgs,
  ...
}:
{
  options.desktopEnvironment = with lib; {
    profile = mkOption {
      type = types.enum [
        "personal"
        "work"
      ];
    };
  };

  imports = [
    ./alacritty.nix
    ./battery.nix
    ./dolphin.nix
    ./firefox.nix
    ./hypridle.nix
    ./hyprlock.nix
    ./niri.nix
    ./notify.nix
    ./rofi.nix
    ./vscode.nix
    ./waybar.nix
  ];

  config =
    with config.desktopEnvironment;
    lib.mkMerge [
      (lib.mkIf (profile == "personal") {
        programs.vscode.enable = true;
        home.packages = with pkgs; [
          inkscape
          mpv
          obsidian
        ];
      })
      (lib.mkIf (profile == "work") {
        programs.vscode.enable = true;
        home.packages = with pkgs; [
          postman
          slack
        ];
      })
      {
        home.packages = with pkgs; [
          signal-desktop
          spotify
        ];

        dconf.settings = {
          "org/gnome/desktop/peripherals/touchpad" = {
            natural-scroll = true;
          };
          "org/gnome/desktop/interface" = {
            color-scheme = "prefer-dark";
          };
        };

        gtk = {
          enable = true;

          theme = {
            name = "Adwaita-dark";
            package = pkgs.gnome-themes-extra;
          };

          gtk3.extraConfig = {
            gtk-application-prefer-dark-theme = 1;
          };

          gtk4.extraConfig = {
            gtk-application-prefer-dark-theme = 1;
          };
        };

        xdg.portal = {
          enable = true;
          extraPortals = [ pkgs.xdg-desktop-portal-gtk ];
          config.common.default = "*";
        };

        qt = {
          enable = true;
          platformTheme.name = "gtk";
          style.name = "adwaita-dark";
        };
      }
    ];
}
