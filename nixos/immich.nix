{ config, lib, ... }:
let
  cfg = config.services.immich;
  inherit (config.profile) lanInterface;
in
{
  assertions = [
    {
      assertion = lanInterface != null;
      message = "immich: the device must set lanInterface";
    }
  ];

  services.immich = {
    enable = true;
    host = config.profile.ip;
    mediaLocation = "/srv/storage/immich";
  };

  networking.firewall.interfaces = lib.mkIf (lanInterface != null) {
    ${lanInterface}.allowedTCPPorts = [ cfg.port ];
  };

  systemd.tmpfiles.rules = [
    "d ${cfg.mediaLocation} 0700 ${cfg.user} ${cfg.group} -"
  ];

  systemd.services.immich-server = {
    after = [ "network-online.target" ];
    wants = [ "network-online.target" ];
    unitConfig.RequiresMountsFor = [ cfg.mediaLocation ];
  };
}
