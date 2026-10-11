{
  nixpkgs.config.allowUnfree = true;

  nix = {
    gc = {
      automatic = true;
      dates = "weekly";
      options = "--delete-older-than 10d";
    };

    optimise.automatic = false;

    settings.experimental-features = [
      "nix-command"
      "flakes"
    ];
  };

  # Release of the first install. Do not bump on upgrades.
  system.stateVersion = "25.11";
}
