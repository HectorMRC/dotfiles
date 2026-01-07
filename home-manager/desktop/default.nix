{ lib, ... }:
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
    ./signal.nix
    ./spotify.nix
    ./waybar.nix
  ];

  config = {
    # Set natural scroll system-wide.
    dconf.settings = {
      "org/gnome/desktop/peripherals/touchpad" = {
        natural-scroll = true;
      };
    };
  };
}
