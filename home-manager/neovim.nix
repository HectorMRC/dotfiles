{ config, name, pkgs, ... }:
{
  programs.neovim = {
    enable = true;
    viAlias = true;
    vimAlias = true;
  };

  xdg.configFile."nvim/" = {
    source = ../neovim;
    recursive = true;
    # Clean up compiled lua files. This is a workaround for lazy.nvim not recompiling when symlinks change.
    onChange = "rm -f ${config.xdg.cacheHome}/nvim/luac/%2fhome%2f${name}%2f.config*.luac";
  };

  home.packages = with pkgs; [
    lua-language-server
    nixd
    nixfmt-rfc-style
    stylua
    tombi
  ];

  home.sessionVariables = {
    EDITOR = "nvim";
    VISUAL = "nvim";
  };
}
