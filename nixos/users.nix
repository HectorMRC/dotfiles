{ config, pkgs, ... }: {
  programs.zsh.enable = true;

  users.users = {
    hector = {
      isNormalUser = true;
      home = "/home/hector";
      extraGroups = [
        "networkmanager"
        "wheel" # Enable ‘sudo’ for the user.
      ];

      shell = pkgs.zsh;
    };
  };
}