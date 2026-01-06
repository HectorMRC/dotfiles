{
  config,
  lib,
  pkgs,
  ...
}:
let
  themes = {
    gruvbox = {
      primary = "#fe8019";
      secondary = "#ebdbb2";
      background = "#282828";
      surface = "#3c3836";
      foreground = "#fbf1c7";
      foreground-muted = "#d5c4a1";
      foreground-disabled = "#a89984";
      hover = "";
      active = "";
      focus = "";
      disabled = "";
      border = "#665c54";
      success = "#b8bb26";
      warning = "#fabd2f";
      error = "#fb4934";
      info = "#83a598";
      accent = "#d3869b";
    };
  };
in
{
  options.theme = {
    name = lib.mkOption {
      type = lib.types.enum (builtins.attrNames themes);
      default = "gruvbox";
      description = "Active system theme.";
    };

    colors = lib.mkOption {
      type = lib.types.attrs;
      readOnly = true;
      description = "Resolved color palette for the active theme.";
    };
  };

  config = {
    theme.colors = themes.${config.theme.name};

    # Set dark-mode system-wide.
    dconf.settings = {
      "org/gnome/desktop/interface" = {
        color-scheme = "prefer-dark";
      };
    };

    gtk = {
      enable = true;

      theme = {
        name = "Adwaita-dark";
        package = pkgs.gnome-themes-extra;
      };

      gtk3.extraConfig = {
        gtk-application-prefer-dark-theme = 1;
      };

      gtk4.extraConfig = {
        gtk-application-prefer-dark-theme = 1;
      };
    };

    xdg.portal = {
      enable = true;
      extraPortals = [ pkgs.xdg-desktop-portal-gtk ];
      config.common.default = "*";
    };

    qt = {
      enable = true;
      platformTheme.name = "gtk";
      style.name = "adwaita-dark";
    };
  };
}
