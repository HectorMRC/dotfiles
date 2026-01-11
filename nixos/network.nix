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
    networking.hostName = hostname; # Define your hostname.
    # networking.wireless.enable = true;  # Enables wireless support via wpa_supplicant.

    # For storing passwords securely without a full desktop environment.
    services.gnome.gnome-keyring.enable = true;
  };
}
