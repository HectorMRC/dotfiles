{
  services.comin = {
    enable = true;
    remotes = [
      {
        name = "origin";
        url = "https://github.com/HectorMRC/dotfiles.git";
        branches.main.name = "main";
        poller.period = 3600;
      }
    ];
  };
}
