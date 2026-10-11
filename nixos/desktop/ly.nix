{ config, lib, ... }:
lib.mkIf (config.desktop.displayManager == "ly") {
  services.displayManager.ly = {
    enable = true;
    x11Support = false;
    settings = {
      asterisk = "0x2022";
      clear_password = true;
      default_input = "password";
      auth_fails = 3;
    };
  };
}
