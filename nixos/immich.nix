{ config, lib, ... }:
let
  cfg = config.profile.services.immich;
  immich = config.services.immich;
  inherit (config.profile) lanInterface;
in
{
  options.profile.services.immich.enable = lib.mkEnableOption "Immich";

  config = lib.mkIf cfg.enable {
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
      ${lanInterface}.allowedTCPPorts = [ immich.port ];
    };

    systemd.tmpfiles.rules = [
      "d ${immich.mediaLocation} 0700 ${immich.user} ${immich.group} -"
    ];

    systemd.services.immich-server = {
      after = [ "network-online.target" ];
      wants = [ "network-online.target" ];
      unitConfig.RequiresMountsFor = [ immich.mediaLocation ];
    };
  };
}
