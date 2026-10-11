{
  config,
  lib,
  pkgs,
  ...
}:
{
  options.desktopEnvironment = with lib; {
    displayManager = mkOption {
      type = types.enum [
        "greet"
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

  config = with config.desktopEnvironment; {
    services.xserver.enable = false;

    displayManager.sddm.enable = displayManager == "sddm";
    displayManager.ly.enable = displayManager == "ly";
    displayManager.greetd.enable = displayManager == "greet";

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
