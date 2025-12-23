{
  lib,
  pkgs,
  config,
  ...
}:
{
  options.desktop-environment = with lib; {
    wallpaper = mkOption {
      type = types.nullOr types.path;
      description = "Path to the desktop background image.";
      default = null;
    };
  };

  config = {
    home.packages = with pkgs; [
      wbg
    ];

    # Niri configuration
    # See: https://github.com/YaLTeR/niri/blob/main/resources/default-config.kdl
    programs.niri = {
      enable = true;
      settings = {
        prefer-no-csd = true;
        input = {
          keyboard.xkb.layout = "us,es";
          touchpad = {
            tap = true;
            natural-scroll = true;
          };
        };
        spawn-at-startup = [
          {
            argv = [
              (lib.getExe pkgs.wbg)
              config.desktop-environment.wallpaper
            ];
          }
        ];
      };
    };
  };
}
