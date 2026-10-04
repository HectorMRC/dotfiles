{ config, pkgs, ... }:
let
  colors = config.palette.colors;
in
{
  services.swayosd = {
    enable = true;

    package = pkgs.swayosd.overrideAttrs (old: {
      patches = (old.patches or [ ]) ++ [ ./swayosd-nerd-icons.patch ];
      postPatch = (old.postPatch or "") + ''
        substituteInPlace src/server/osd_window.rs \
          --replace-fail "window.set_width_request(250);" ""
      '';
    });

    stylePath = pkgs.writeText "swayosd.css" ''
      window#osd {
        border-radius: 8px;
        border: 1px solid ${colors.border};
        background: ${colors.surface};
      }

      window#osd #container {
        margin: 12px 32px 12px 32px;
      }

      window#osd label {
        color: ${colors.foreground};
        font-family: "JetBrainsMono Nerd Font Propo";
        font-size: 16px;
      }

      window#osd label.icon {
        font-size: 32px;
      }

      window#osd label:disabled {
        color: ${colors.foreground-disabled};
      }

      window#osd progressbar,
      window#osd segmentedprogress,
      window#osd trough,
      window#osd progress,
      window#osd segment {
        min-width: 0;
        min-height: 0;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        opacity: 0;
      }

      window#osd label:not(.icon) {
        margin-left: -8px;
      }
    '';
  };

  xdg.configFile."swayosd/config.toml".text = ''
    [server]
    show_percentage = true
  '';
}
