{
  config,
  lib,
  pkgs,
  ...
}:
let
  display-managers = {
    Greet = "greet";
    Ly = "ly";
    Sddm = "sddm";
  };

  # An intermediary user/group to execute tuigreet.
  greet = rec {
    user = "greeter";
    group = user;
  };
in
{
  options.desktop-environment = with lib; {
    enable-niri = mkEnableOption "Niri Wayland compositor";
    enable-plasma = mkEnableOption "KDE Plasma 6";
    display-manager = mkOption {
      type = types.enum (builtins.attrValues display-managers);
    };
  };

  config = with config.desktop-environment; {
    # Disable the X11 windowing system.
    services.xserver.enable = false;

    # Configure SDDM to use Wayland.
    services.displayManager.sddm = {
      enable = display-manager == display-managers.Sddm;
      wayland.enable = true;
    };

    # Configure Ly.
    services.displayManager.ly = {
      enable = display-manager == display-managers.Ly;
      x11Support = false;
      settings = {
        asterisk = "0x2022";
        clear_password = true;
        default_input = "password";
        auth_fails = 3;
        session_log = ".local/state/ly-session.log";
      };
    };

    # Configure Greetd with TUIgreet.
    services.greetd = {
      enable = display-manager == display-managers.Greet;
      settings = {
        default_session = {
          user = "${greet.user}";
          command = ''
            ${pkgs.tuigreet}/bin/tuigreet \
            --sessions ${config.system.path}/share/wayland-sessions \
            --remember \
            --xsessions \ # ${config.system.path}/share/xsessions \
            --remember-user-session \
            --time 
          '';
        };
      };
    };

    systemd = lib.mkIf (display-manager == display-managers.Greet) {
      services.greetd.serviceConfig = {
        Type = "idle";
        StandardInput = "tty";
        StandardOutput = "tty";
        StandardError = "journal";
        # Without this bootlogs will spam on screen
        TTYReset = true;
        TTYVHangup = true;
        TTYVTDisallocate = true;
      };

      tmpfiles.rules = [
        # Cache directory must be created for --remember* features to work.
        "d /var/cache/tuigreet 0755 ${greet.user} ${greet.group} -"
      ];
    };

    # Enable the KDE Plasma Desktop Environment.
    services.desktopManager.plasma6.enable = enable-plasma;

    # Enable Niri - A scrollable-tiling Wayland compositor.
    programs.niri.enable = enable-niri;

    fonts.packages = with pkgs; [
      nerd-fonts.jetbrains-mono
    ];

    fonts.fontconfig.defaultFonts.monospace = [
      "JetBrains Mono Medium"
    ];

    # Allow screensharing.
    security.rtkit.enable = true;
  };
}
