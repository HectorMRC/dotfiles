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
    programs.${shell}.enable = true;

    users.users.${username} = {
      isNormalUser = true;
      shell = pkgs.${shell};
      extraGroups = [
        "networkmanager"
        "video"
        "wheel"
      ];
    };
  };
}
