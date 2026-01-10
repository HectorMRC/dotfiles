{ ... }:
{
  options = {

  };

  config = {
    services.ssh-agent.enable = true;

    programs.ssh = {
      enable = true;
      enableDefaultConfig = false; # default configs are deprecated.
      matchBlocks."*".addKeysToAgent = "yes";
    };
  };
}
