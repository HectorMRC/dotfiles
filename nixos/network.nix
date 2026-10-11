{
  config,
  lib,
  ...
}:
{
  options.profile = with lib; {
    hostname = mkOption {
      type = types.nonEmptyStr;
    };
    ip = mkOption {
      type = types.nonEmptyStr;
      description = "Static LAN IPv4 address of the host.";
    };
    lanInterface = mkOption {
      type = types.nullOr types.nonEmptyStr;
      default = null;
      description = "Network interface connected to the home LAN.";
    };
  };

  config = with config.profile; {
    networking = {
      networkmanager.enable = true;
      hostName = hostname;
    };
  };
}
