{
  config,
  lib,
  pkgs,
  ...
}:
{
  options.desktop-environment = with lib; {
    display-manager = mkOption {
      type = types.enum [
        "greet"
        "ly"
        "sddm"
        "none"
      ];
    };

    sessions = mkOption {
      type = types.nonEmptyListOf (
        types.enum [
          "niri"
          "plasma"
        ]
      );
    };
  };

  imports = [
    ./greetd.nix
    ./ly.nix
    ./sddm.nix
  ];

  config = with config.desktop-environment; {
    # Disable the X11 windowing system.
    services.xserver.enable = false;

    # Display manager.
    display-manager.sddm.enable = display-manager == "sddm";
    display-manager.ly.enable = display-manager == "ly";
    display-manager.greetd.enable = display-manager == "greet";

    # Desktop environment.
    services.desktopManager.plasma6.enable = builtins.elem "plasma" sessions;
    programs.niri.enable = builtins.elem "niri" sessions;

    # Enable Dconf for GTK apps.
    programs.dconf.enable = true;

    fonts.packages = with pkgs; [
      nerd-fonts.jetbrains-mono
    ];

    fonts.fontconfig.defaultFonts.monospace = [
      "JetBrains Mono Medium"
    ];

    environment.sessionVariables = {
      # Force Electron apps to use the Wayland backend natively.
      NIXOS_OZONE_WL = "1";
    };

    # Allow screensharing.
    security.rtkit.enable = true;
  };
}
