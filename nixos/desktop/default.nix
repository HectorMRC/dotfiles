{
  config,
  lib,
  pkgs,
  ...
}:
{
  options.desktop = with lib; {
    wallpaper = mkOption {
      type = types.nullOr types.path;
      description = "Path to the desktop background image.";
      default = null;
    };

    displayManager = mkOption {
      type = types.enum [
        "greetd"
        "ly"
        "sddm"
        "none"
      ];
      default = "none";
    };

    sessions = mkOption {
      type = types.nonEmptyListOf (
        types.enum [
          "niri"
          "plasma"
        ]
      );
      default = [ "niri" ];
    };
  };

  imports = [
    ./greetd.nix
    ./ly.nix
    ./sddm.nix
    ./swayosd.nix
  ];

  config = with config.desktop; {
    services.xserver.enable = false;

    services.desktopManager.plasma6.enable = builtins.elem "plasma" sessions;
    programs.niri.enable = builtins.elem "niri" sessions;

    # Required by GTK apps.
    programs.dconf.enable = true;

    fonts.fontconfig.defaultFonts.monospace = [
      "JetBrains Mono Medium"
    ];

    environment.sessionVariables = {
      # Force Electron apps to use the Wayland backend natively.
      NIXOS_OZONE_WL = "1";
    };

    security.rtkit.enable = true;
  };
}
