{ config, lib, ... }:
lib.mkIf (config.desktop.displayManager == "sddm") {
  services.displayManager.sddm = {
    enable = true;
    wayland.enable = true;
  };
}
