{ pkgs, ... }:
{
  environment.systemPackages = with pkgs; [
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

  fonts.packages = with pkgs; [
    nerd-fonts.jetbrains-mono
  ];
}
