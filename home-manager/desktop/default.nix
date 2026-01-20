{
  config,
  lib,
  pkgs,
  ...
}:
{
  options.desktopEnvironment = with lib; {
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
    with config.desktopEnvironment;
    lib.mkMerge [
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
      {
        home.packages = with pkgs; [
          kdePackages.dolphin
          signal-desktop
          spotify
        ];

        # Set natural scroll system-wide.
        dconf.settings = {
          "org/gnome/desktop/peripherals/touchpad" = {
            natural-scroll = true;
          };
        };

        # Set dark-mode system-wide.
        dconf.settings = {
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
