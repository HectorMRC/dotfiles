{ config, pkgs, ... }:
let
  accent = config.palette.colors.accent;
  success = config.palette.colors.success;
  info = config.palette.colors.info;
  warning = config.palette.colors.warning;
  error = config.palette.colors.error;
  background = config.palette.colors.background;
  surface = config.palette.colors.surface;
  foreground = config.palette.colors.foreground;
  foreground-muted = config.palette.colors.foreground-muted;
in
{
  # Enable alacritty terminal.
  programs.alacritty = {
    enable = true;
    settings = {
      # Execute tmux on startup.
      terminal.shell.program = "tmux";

      font = {
        size = 12.0;
        normal = {
          family = "JetBrainsMonoNLNerdFont";
          style = "Regular";
        };
        italic = {
          style = "Italic";
        };
        bold = {
          style = "ExtraBold";
        };
        bold_italic = {
          style = "ExtraBoldItalic";
        };
      };
      window = {
        padding = {
          x = 4;
          y = 2;
        };
      };
      colors = {
        primary = {
          background = "${background}";
          foreground = "${foreground}";
          dim_foreground = "${foreground-muted}";
        };

        normal = {
          black = "${surface}";
          red = "${error}";
          green = "${success}";
          yellow = "${warning}";
          blue = "${info}";
          magenta = "${accent}";
          cyan = "${info}";
          white = "${foreground}";
        };
      };
    };
  };

  home.packages = with pkgs; [
    fastfetch
    tmux
  ];
}
