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
  };

  config = with config.profile; {
    networking.networkmanager.enable = true;
    networking.hostName = hostname;
  };
}
