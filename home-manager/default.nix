{
  config,
  lib,
  ...
}:
{
  options = with lib; {
    role-configuration = {
      user-name = mkOption {
        type = types.nonEmptyStr;
      };
    };
  };

  config = with config.role-configuration; {
    programs.home-manager.enable = true;

    home.username = user-name;
    home.homeDirectory = "/home/${user-name}";

    # The state version is required and should stay at the version you
    # originally installed.
    home.stateVersion = "25.11";
  };
}
