{ config, pkgs, lib, ... }:
let
  home-manager = builtins.fetchTarball https://github.com/nix-community/home-manager/archive/master.tar.gz;
in
{
  imports = [
    (import "${home-manager}/nixos")
  ];

  home-manager = {
    useGlobalPkgs = true;
    useUserPackages = true;
    
    users.hector = { pkgs, ...}: {
      home.packages = [ pkgs.atool pkgs.httpie ];
      programs.zsh.enable = true;

      # This value determines the Home Manager release that your configuration is 
      # compatible with. This helps avoid breakage when a new Home Manager release 
      # introduces backwards incompatible changes. 
      #
      # You should not change this value, even if you update Home Manager. If you do 
      # want to update the value, then make sure to first check the Home Manager 
      # release notes. 
      home.stateVersion = "25.05"; # Did you read the comment?
    };
  };
}