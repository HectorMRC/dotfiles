{ pkgs, ... }:
{
  # List packages installed in system profile. To search, run:
  # $ nix search wget
  environment.systemPackages = with pkgs; [
    dmidecode
    git
    htop
    neovim
    ripgrep
    tmux
    unzip
    wget
    zip
  ];

  # Default fonts.
  fonts.packages = with pkgs; [
    nerd-fonts.jetbrains-mono
  ];
}
