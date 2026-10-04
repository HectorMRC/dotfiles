{
  config,
  lib,
  pkgs,
  ...
}:
lib.mkIf config.programs.niri.enable {
  systemd.packages = [ pkgs.swayosd ];
  services.dbus.packages = [ pkgs.swayosd ];
  services.udev.packages = [ pkgs.swayosd ];
  environment.systemPackages = [ pkgs.swayosd ];

  systemd.services.swayosd-libinput-backend.wantedBy = [ "graphical.target" ];
}
