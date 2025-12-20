{ pkgs, ... }:
{
  programs.niri.enable = true;

  # Allow screensharing.
  security.rtkit.enable = true;

  fonts.packages = with pkgs; [
    nerd-fonts.jetbrains-mono
  ];

  fonts.fontconfig.defaultFonts.monospace = [
    "JetBrains Mono Medium"
  ];
}
