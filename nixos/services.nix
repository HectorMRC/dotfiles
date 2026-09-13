{
  # Enable the OpenSSH daemon.
  services.openssh.enable = true;

  # Enable programs intercommunication bus.
  services.dbus.enable = true;

  # For storing passwords securely without a full desktop environment.
  services.gnome.gnome-keyring.enable = true;

  # Laptop.
  services.logind.settings.Login = {
    HandleLidSwitch = "suspend";
    HandleLidSwitchExternalPower = "ignore";
    HandleLidSwitchDocked = "ignore";
    KillUserProcesses = false;
  };

  # Enable policy management for rootless programs.
  security.polkit.enable = true;
}
