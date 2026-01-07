{ pkgs, ... }:
let
  # Force Spotify to run on Wayland.
  spotify-wayland =
    with pkgs;
    (symlinkJoin {
      name = "spotify";
      paths = [ spotify ];
      buildInputs = [ makeWrapper ];
      postBuild = ''
        wrapProgram $out/bin/spotify \
        --add-flags "--enable-features=UseOzonePlatform --ozone-platform=wayland"
      '';
    });
in
{
  home.packages = [
    spotify-wayland
  ];
}
