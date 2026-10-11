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
  };

  config = with config.profile; {
    networking = {
      networkmanager.enable = true;
      hostName = hostname;
    };
  };
}
