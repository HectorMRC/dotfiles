{
  pkgs,
  osConfig,
  ...
}:
let
  whenTags = import ../../lib/whenAll.nix osConfig.deployment.tags;
in
{
  programs.vscodium.enable = true;

  home.packages =
    with pkgs;
    [
      signal-desktop
      spotify
    ]
    ++
      whenTags
        [ "home" ]
        [
          inkscape
          libreoffice
          obsidian
        ]
    ++
      whenTags
        [ "work" ]
        [
          postman
          slack
        ];

  dconf.settings = {
    "org/gnome/desktop/peripherals/touchpad" = {
      natural-scroll = true;
    };
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

    gtk4 = {
      theme = null;
      extraConfig = {
        gtk-application-prefer-dark-theme = 1;
      };
    };
  };

  xdg.portal = {
    enable = true;
    extraPortals = [
      pkgs.xdg-desktop-portal-gnome
      pkgs.xdg-desktop-portal-gtk
    ];
    config.common.default = [
      "gnome"
      "gtk"
    ];
  };

  qt = {
    enable = true;
    style.name = "adwaita-dark";
  };
}
