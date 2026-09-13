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
  };
}
