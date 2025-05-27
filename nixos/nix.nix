{ pkgs, ... }: {
  nix = {
    gc = {
      automatic = true;
      dates = "daily";
      options = "--delete-older-than 10d";
    };

    optimise.automatic = true;
    settings.experimental-features = [ "nix-command" "flakes" ];
  };
}