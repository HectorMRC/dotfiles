{ config, pkgs, ... }:
let
  hostName = config.networking.hostName;
in
{
  services.resolved.enable = true;

  services.netbird = {
    enable = true;
  };

  age.secrets.netbird-setup-key.file = ../secrets/${hostName}-netbird-setup-key.age;

  systemd.services.netbird-autoconnect = {
    description = "Automatic login to NetBird network";
    after = [ "network-online.target" "netbird.service" ];
    wants = [ "network-online.target" "netbird.service" ];
    wantedBy = [ "multi-user.target" ];

    serviceConfig = {
      Type = "oneshot";
      RemainAfterExit = true;
      ExecStart = "${pkgs.bash}/bin/bash -c '\
        if ! ${pkgs.netbird}/bin/netbird status | grep -q \"Connected\" && [ ! -f /var/lib/netbird/config.json ]; then \
          ${pkgs.netbird}/bin/netbird up \
            --setup-key=$(cat ${config.age.secrets.netbird-setup-key.path}); \
        fi \
      '";
    };
  };
}