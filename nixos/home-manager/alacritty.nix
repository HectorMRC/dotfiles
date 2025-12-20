{ pkgs, ... }:
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
    };
  };

  home.packages = with pkgs; [
    tmux
  ];
}
