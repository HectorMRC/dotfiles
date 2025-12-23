{
  config,
  lib,
  ...
}:
{
  options.role-configuration = with lib; {
    host-name = mkOption {
      type = types.nonEmptyStr;
    };
  };

  config = with config.role-configuration; {
    networking.networkmanager.enable = true;
    networking.hostName = host-name; # Define your hostname.
    # networking.wireless.enable = true;  # Enables wireless support via wpa_supplicant.

    # For storing passwords securely without a full desktop environment.
    services.gnome.gnome-keyring.enable = true;
  };
}
