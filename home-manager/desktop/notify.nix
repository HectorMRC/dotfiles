{ pkgs, config, ... }:
let
  info = config.theme.colors.info;
  warning = config.theme.colors.warning;
  background = config.theme.colors.background;
  surface = config.theme.colors.surface;
  foreground = config.theme.colors.foreground;
in
{
  home.packages = with pkgs; [
    libnotify
    mako
  ];

  services.mako = {
    enable = true;

    anchor = "top-right";
    defaultTimeout = 10000; # notifications stay for 10 seconds

    borderRadius = 4; # same as Niri
    textColor = background;
    borderColor = info;
    backgroundColor = info;

    extraConfig = ''
      [urgency=low]
      text-color=${foreground}
      border-color=${surface}
      background-color=${surface}

      [urgency=normal]
      text-color=${background}
      border-color=${info}
      background-color=${info}

      [urgency=critical]
      text-color=${background}
      border-color=${warning}
      background-color=${warning}
    '';
  };
}
