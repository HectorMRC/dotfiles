{ config, lib, ... }:
let
  VersionControlSystems = {
    Git = "git";
    Jujutsu = "jj";
  };

  user = {
    name = "HectorMRC";
    email = "thehector1593@gmail.com";
  };
in
{
  options.version-control-systems =
    with lib;
    mkOption {
      type = types.nonEmptyListOf (types.enum (builtins.attrValues VersionControlSystems));
    };

  config = with config; {
    programs.git = {
      enable =
        builtins.elem VersionControlSystems.Git version-control-systems
        || builtins.elem VersionControlSystems.Jujutsu version-control-systems;
      settings = {
        inherit user;
      };
    };

    programs.jujutsu = {
      enable = builtins.elem VersionControlSystems.Jujutsu version-control-systems;
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
