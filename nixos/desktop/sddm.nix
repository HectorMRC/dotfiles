{
  config,
  lib,
  ...
}:
{
  options.display-manager.sddm = with lib; {
    enable = mkEnableOption "sddm";
  };

  config =
    with config.display-manager;
    lib.mkIf sddm.enable {
      services.displayManager.sddm = {
        enable = true;
        wayland.enable = true;
      };
    };
}
