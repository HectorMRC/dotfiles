{ pkgs, ... }:
{
  programs.swaylock = {
    enable = true;
    # Using swaylock-effects for blur and better aesthetics
    package = pkgs.swaylock-effects;
    settings = {
      screenshots = true;
      clock = true;
      indicator = true;
      indicator-radius = 100;
      indicator-thickness = 7;
      effect-blur = "7x5";
      effect-vignette = "0.5:0.5";
      ring-color = "bb00cc";
      key-hl-color = "880033";
      # image = "/home/user/wallpapers/lockscreen.png";
    };
  };
}
