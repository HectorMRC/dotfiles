{ config, lib, ... }:
{
  options.version-control-system = with lib; {
    user = mkOption {
      type = types.submodule {
        options = {
          name = mkOption {
            type = types.nonEmptyStr;
          };
          email = mkOption {
            type = types.nonEmptyStr;
          };
        };
      };
    };
    extraTools = mkOption {
      type = types.listOf (
        types.enum [
          "jj"
        ]
      );
    };
  };

  config = with config.version-control-system; {
    programs.git = {
      enable = true;
      settings = {
        inherit user;
      };
    };

    programs.jujutsu = {
      enable = builtins.elem "jj" extraTools;
      settings = {
        "$schema" = "https://jj-vcs.github.io/jj/latest/config-schema.json";

        inherit user;

        ui.editor = "nvim";
        ui.default-command = "log";

        aliases = {
          a = [ "abandon" ];
          d = [ "describe" ];
          dff = [
            "diff"
            "-r"
          ];
          e = [
            "edit"
            "--ignore-immutable"
          ];
          f = [
            "git"
            "fetch"
            "--all-remotes"
          ];
          gp = [
            "git"
            "push"
          ];
          mm = [
            "b"
            "m"
            "main"
          ];
          n = [ "new" ];
          sq = [
            "squash"
            "-u"
          ];
        };
      };
    };
  };
}
