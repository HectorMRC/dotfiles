{
  config,
  lib,
  pkgs,
  ...
}:
{
  options.profile = with lib; {
    username = mkOption {
      type = types.nonEmptyStr;
    };
    shell = mkOption {
      type = types.enum [
        "bash"
        "zsh"
      ];
      default = "bash";
    };
  };

  config = with config.profile; {
    # Allow unfree packages.
    nixpkgs.config.allowUnfree = true;

    # Enable the selected shell.
    programs.${shell}.enable = true;

    # Define a user account. Don't forget to set a password with ‘passwd’.
    users.users.${username} = {
      isNormalUser = true;
      shell = pkgs.${shell};
      extraGroups = [
        "networkmanager"
        "wheel"
      ];
    };

    # List packages installed in system profile. To search, run:
    # $ nix search wget
    environment.systemPackages = with pkgs; [
      git
      neovim
      tmux
      unzip
      wget
      zip
    ];

    # Enable the OpenSSH daemon.
    services.openssh.enable = true;

    # Laptop.
    services.logind = {
      lidSwitch = "suspend";
      lidSwitchExternalPower = "ignore";
      lidSwitchDocked = "ignore";
    };

    # Nix configuration.
    nix = {
      gc = {
        automatic = true;
        dates = "weekly";
        options = "--delete-older-than 10d";
      };

      optimise.automatic = true;

      settings.experimental-features = [
        "nix-command"
        "flakes"
      ];
    };

    # This value determines the NixOS release from which the default
    # settings for stateful data, like file locations and database versions
    # on your system were taken. It‘s perfectly fine and recommended to leave
    # this value at the release version of the first install of this system.
    # Before changing this value read the documentation for this option
    # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
    system.stateVersion = "25.11"; # Did you read the comment?
  };
}
