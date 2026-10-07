{ pkgs, ... }:
{
  # List packages installed in system profile. To search, run:
  # $ nix search wget
  environment.systemPackages = with pkgs; [
    cowsay
    dmidecode
    git
    htop
    neovim
    nmap
    openssl
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
