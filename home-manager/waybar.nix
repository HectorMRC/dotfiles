{ config, pkgs, ... }:
{
  home.packages = with pkgs; [
    brightnessctl
    networkmanagerapplet
    pavucontrol
    # pwvucontrol
  ];

  programs.waybar = {
    enable = true;
    settings = {
      mainBar = {
        # See Waybar configuration for more options:
        # https://github.com/Alexays/Waybar/wiki/Configuration

        reload_style_on_change = true;
        layer = "top";
        position = "left";
        width = 20;
        spacing = 12;

        margin-left = 6;
        margin-top = 6;
        margin-bottom = 6;

        include = [ "~/.config/waybar/modules.json" ];

        modules-left = [
          "clock"
        ];

        modules-center = [
          "niri/workspaces"
        ];

        modules-right = [
          "niri/language"
          "pulseaudio#input"
          "pulseaudio#output"
          "backlight"
          "network"
          "bluetooth"
          "battery"
        ];

        backlight = {
          format = "{icon}";
          format-icons = [
            "<span size='14pt'></span>"
            "<span size='14pt'></span>"
            "<span size='14pt'></span>"
            "<span size='14pt'></span>"
            "<span size='14pt'></span>"
            "<span size='14pt'></span>"
            "<span size='14pt'></span>"
            "<span size='14pt'></span>"
            "<span size='14pt'></span>"
          ];

          tooltip = true;
          tooltip-format = "Brightness: {percent}%";

          on-click-right = "brightnessctl";
        };

        battery = {
          interval = 5;
          states = {
            full = 100;
            low = 30;
            critical = 15;
          };

          format = "{icon}";
          format-icons = [
            "<span size='14pt'>󰁺</span>"
            "<span size='14pt'>󰁻</span>"
            "<span size='14pt'>󰁼</span>"
            "<span size='14pt'>󰁽</span>"
            "<span size='14pt'>󰁾</span>"
            "<span size='14pt'>󰁿</span>"
            "<span size='14pt'>󰂀</span>"
            "<span size='14pt'>󰂁</span>"
            "<span size='14pt'>󰂂</span>"
            "<span size='14pt'>󰁹</span>"
          ];

          format-charging = "<span size='14pt'>󰂄</span>";
          format-plugged = "<span size='14pt'>󰚥</span>";
          format-critical = "<span size='14pt'>󰂃</span>";

          tooltip = true;
          tooltip-format = "Charge: {capacity}%";
          tooltip-format-charging = "Charging: {capacity}%";
        };

        bluetooth = {
          interval = 5;

          format-on = "<span size='14pt'>󰂯</span>";
          format-off = "<span size='14pt'>󰂲</span>";
          format-disabled = "<span size='14pt'>󰂲</span>";
          format-connected = "<span size='14pt'>󰂱</span>";
          format-no-controller = "span size='14pt'>󰂯</span>";

          tooltip = true;
          tooltip-format = "{device_enumerate}";
          tooltip-format-enumerate-connected = "{device_address}";
          tooltip-format-enumerate-connected-battery = "{device_address} | Battery: {device_battery_percentage}%";

          on-click = "rfkill toggle bluetooth";
          on-click-right = "blueman-manager";
        };

        clock = {
          interval = 1;
          format = "{:%y\n%m\n%d\n\n%H\n%M}";
          tooltip-format = "{calendar}";
        };

        network = {
          format-icons = {
            wifi = [
              "<span size='12pt'>󰤯</span>"
              "<span size='12pt'>󰤟</span>"
              "<span size='12pt'>󰤢</span>"
              "<span size='12pt'>󰤥</span>"
              "<span size='12pt'>󰤨</span>"
            ];
            ethernet = "<span size='12pt'>󰈀</span>";
            disabled = "<span size='12pt'>󰤭</span>";
            disconnected = "<span size='12pt'>󰤩</span>";
          };

          format-wifi = "{icon}";
          format-ethernet = "{icon}";
          format-disconnected = "{icon}";
          format-disabled = "{icon}";

          interval = 5;
          tooltip-format = "{essid}\t{gwaddr}";
          tooltip = true;
          max-length = 20;

          on-click = "rfkill toggle wifi";
          on-click-right = "nm-connection-editor";
        };

        "niri/workspaces" = {
          on-click = "activate";
          format = "{icon}";
          format-icons = {
            default = "󰄰";
            active = "󰄯";
          };
        };

        "niri/language" = {
          format = "{}";
          format-en = "us";
          format-es = "es";
          tooltip = true;
          on-click = "niri msg action switch-layout next";
        };

        "pulseaudio#input" = {
          format = "{format_source}";
          format-source = "<span size='14pt'>󰍬</span>";
          format-source-muted = "<span size='14pt'>󰍭</span>";

          tooltip = true;
          tooltip-format = "{desc}";

          on-click = "wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle";
          on-click-right = "pavucontrol";
        };

        "pulseaudio#output" = {
          interval = 1;
          format = "{icon}";
          format-icons = [
            "<span size='14pt'>󰕿</span>"
            "<span size='14pt'>󰖀</span>"
            "<span size='14pt'>󰕾</span>"
          ];
          format-muted = "<span size='14pt'>󰝟</span>";

          tooltip = true;
          tooltip-format = "Volume: {volume}%\n{desc}";

          on-click = "wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle";
          on-click-right = "pavucontrol";
        };
      };
    };

    style = ''
      * {
        font-family: "JetBrainsMono Nerd Font Propo";
        font-size: 16px;
        border-radius: 8;
        box-shadow: none;
        color: ${config.theme.colors.foreground};
      }

      *.disabled {
        color: ${config.theme.colors.foreground-disabled};
      }

      #battery.low {
        color: ${config.theme.colors.warning};
      }
      #battery.critical {
        color: ${config.theme.colors.error};
      }
      #battery.charging,
      #battery.plugged {
        color: ${config.theme.colors.accent};
      }

      #clock {
        color: ${config.theme.colors.info};
      }

      #language {
        padding-bottom: 12px;
      }

      .modules-left {
        background-color: ${config.theme.colors.surface};
        border-radius: 8px;
        padding: 12px 0;
      }

      .modules-center {
        background-color: ${config.theme.colors.surface};
        border-radius: 8px;
        padding: 12px 0;
      }

      .modules-right {
        background-color: ${config.theme.colors.surface};
        border-radius: 8px;
        padding: 12px 0;
      }

      #pulseaudio.output.muted {
        color: ${config.theme.colors.foreground-disabled};
      }

      #pulseaudio.input.source-muted {
        color: ${config.theme.colors.foreground-disabled};
      }

      tooltip {
        background: ${config.theme.colors.surface};
        border: 1px solid ${config.theme.colors.border};
        margin: 12px;
      }
      tooltip * {
        background: ${config.theme.colors.surface};
        color: ${config.theme.colors.foreground};
      }

      window#waybar {
        background: transparent;
      }

      #workspaces button {
        background: none;
        box-shadow: none;
        border: none;
      }
    '';
  };
}
