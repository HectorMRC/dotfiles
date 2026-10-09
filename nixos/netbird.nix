{ config, pkgs, ... }:
let
  hostName = config.networking.hostName;

  netbird-notify = pkgs.writeShellApplication {
    name = "netbird-notify";
    runtimeInputs = [
      pkgs.systemd
      config.ntfy.send
    ];

    text = ''
      log=$(journalctl -u netbird-autoconnect.service -n 20 -o cat --no-pager || true)
      printf '%s' "''${log:0:1000}" | ntfy-send "${hostName}: netbird autoconnect failed" high x
    '';
  };
in
{
  imports = [ ./ntfy.nix ];

  services.resolved.enable = true;

  services.netbird.enable = true;

  age.secrets.netbird-setup-key.file = ../secrets/${hostName}-netbird-setup-key.age;

  systemd.services.netbird-autoconnect = {
    description = "Automatic login to NetBird network";
    after = [
      "network-online.target"
      "netbird.service"
    ];
    wants = [
      "network-online.target"
      "netbird.service"
    ];
    wantedBy = [ "multi-user.target" ];
    onFailure = [ "netbird-notify.service" ];

    path = [ pkgs.netbird ];
    script = ''
      if ! netbird status | grep -q "Connected"; then
        netbird up --setup-key="$(cat ${config.age.secrets.netbird-setup-key.path})"
      fi
    '';

    serviceConfig = {
      Type = "oneshot";
      RemainAfterExit = true;
    };
  };

  systemd.services.netbird-notify = {
    description = "Notify NetBird autoconnect failure";
    serviceConfig = {
      Type = "oneshot";
      ExecStart = pkgs.lib.getExe netbird-notify;
    };
  };
}
