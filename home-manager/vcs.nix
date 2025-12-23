{ ... }:
let
  user = {
    name = "HectorMRC";
    email = "thehector1593@gmail.com";
  };
in
{
  programs.git = {
    enable = true;
    settings = {
      inherit user;
    };
  };

  programs.jujutsu = {
    enable = true;
    settings = {
      "$schema" = "https://jj-vcs.github.io/jj/latest/config-schema.json";

      inherit user;

      ui.editor = "nvim";
      ui.default-command = "log";
    };
  };
}
