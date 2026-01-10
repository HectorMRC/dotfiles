{ name, ... }:
{
  programs.home-manager.enable = true;

  home.username = name;
  home.homeDirectory = "/home/${name}";

  # The state version is required and should stay at the version you
  # originally installed.
  home.stateVersion = "25.11";
}
