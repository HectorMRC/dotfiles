{ config, pkgs, ... }:
let
  hostName = config.networking.hostName;

  rule = ''
    ACTION=="add|change", KERNEL=="sd[a-z]", ATTR{queue/rotational}=="1", RUN+="${pkgs.hdparm}/bin/hdparm -S 241 /dev/%k"
  '';

  hdd-spindown-notify = pkgs.writeShellApplication {
    name = "hdd-spindown-notify";
    runtimeInputs = [
      pkgs.systemd
      config.ntfy.send
    ];

    text = ''
      log=$(journalctl -u hdd-spindown.service -n 20 -o cat --no-pager || true)
      printf '%s' "''${log:0:1000}" | ntfy-send "${hostName}: hdd spindown failed" high x
    '';
  };
in
{
  imports = [ ./ntfy.nix ];

  environment.systemPackages = [ pkgs.hdparm ];

  services.udev.extraRules = rule;

  systemd.services.hdd-spindown = {
    description = "Apply HDD udev rules to connected disks";
    wantedBy = [ "multi-user.target" ];
    restartTriggers = [ rule ];
    onFailure = [ "hdd-spindown-notify.service" ];
    path = [ pkgs.systemd ];

    script = ''
      start=$(date +%s)
      udevadm control --reload
      udevadm trigger --settle --action=change --subsystem-match=block --sysname-match='sd[a-z]'

      if errors=$(journalctl -u systemd-udevd.service --since "@$start" -o cat --no-pager | grep 'hdparm.*failed'); then
        echo "$errors" >&2
        exit 1
      fi
    '';

    serviceConfig = {
      Type = "oneshot";
      RemainAfterExit = true;
    };
  };

  systemd.services.hdd-spindown-notify = {
    description = "Notify HDD spindown failure";
    serviceConfig = {
      Type = "oneshot";
      ExecStart = pkgs.lib.getExe hdd-spindown-notify;
    };
  };
}
