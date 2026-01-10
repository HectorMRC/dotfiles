{
  config,
  lib,
  pkgs,
  ...
}:
let
  DisplayManagers = {
    Greet = "greet";
    Ly = "ly";
    Sddm = "sddm";
    None = "none";
  };

  DesktopEnvironments = {
    Niri = "niri";
    Plasma = "plasma";
  };
in
{
  options.desktop-environment = with lib; {
    display-manager = mkOption {
      type = types.enum (builtins.attrValues DisplayManagers);
    };

    sessions = mkOption {
      type = types.nonEmptyListOf (types.enum (builtins.attrValues DesktopEnvironments));
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
    display-manager.sddm.enable = display-manager == DisplayManagers.Sddm;
    display-manager.ly.enable = display-manager == DisplayManagers.Ly;
    display-manager.greetd.enable = display-manager == DisplayManagers.Greet;

    # Desktop environment.
    services.desktopManager.plasma6.enable = builtins.elem DesktopEnvironments.Plasma sessions;
    programs.niri.enable = builtins.elem DesktopEnvironments.Niri sessions;

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
