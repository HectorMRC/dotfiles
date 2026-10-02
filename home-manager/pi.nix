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

  # Pi has no built-in permission system.
  home.file."${cfg.configDir}/extensions/permissions.ts".source = ../pi/extensions/permissions.ts;
}
