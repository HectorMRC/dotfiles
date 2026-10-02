{ config, ... }:
let
  cfg = config.programs.pi-coding-agent;
in
{
  programs.pi-coding-agent = {
    enable = true;
    context = ../pi/AGENTS.md;

    settings = {
      defaultProvider = "anthropic";
      enabledModels = [ "anthropic/*" ];
    };
  };

  home.file."${cfg.configDir}/extensions" = {
    source = ../pi/extensions;
    recursive = true;
  };
}
