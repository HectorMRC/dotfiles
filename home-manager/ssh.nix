{ ... }:
{
  config = {
    services.ssh-agent.enable = true;

    programs.ssh = {
      enable = true;
      addKeysToAgent = "yes";
    };
  };
}
