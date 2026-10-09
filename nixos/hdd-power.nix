{ pkgs, ... }:
{
  environment.systemPackages = [ pkgs.hdparm ];

  services.udev.extraRules = ''
    ACTION=="add|change", KERNEL=="sd[a-z]", ATTR{queue/rotational}=="1", RUN+="${pkgs.hdparm}/bin/hdparm -S 241 /dev/%k"
  '';
}
