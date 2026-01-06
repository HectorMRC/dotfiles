{ pkgs, ... }:
{
  home.packages = with pkgs; [
    pavucontrol
    pwvucontrol
  ];
}
