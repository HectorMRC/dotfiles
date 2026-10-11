{
  config,
  lib,
  pkgs,
  ...
}:
lib.mkIf (config.desktop.displayManager == "greetd") {
  services.greetd = {
    enable = true;
    useTextGreeter = true;
    settings.default_session.command = lib.concatStringsSep " " [
      (lib.getExe pkgs.tuigreet)
      "--sessions ${config.services.displayManager.sessionData.desktops}/share/wayland-sessions"
      "--remember"
      "--remember-user-session"
      "--time"
    ];
  };
}
