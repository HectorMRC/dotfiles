{ config, ... }:
{
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

        include = [ "~/.config/waybar/modules.json" ];

        modules-left = [
          "clock"
        ];

        modules-center = [
          "niri/workspaces"
        ];

        modules-right = [
          "niri/language"
          "pulseaudio#microphone"
          "pulseaudio"
          "network"
          "bluetooth"
          "battery"
        ];

        battery = {
          interval = 5;
          states = {
            critical = 30;
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
          on-click = "rfkill toggle wifi";
          on-click-right = "nm-connection-editor";
          tooltip = true;
          max-length = 20;
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

        "pulseaudio#microphone" = {
          format = "{format_source}";
          format-source = "<span size='14pt'>󰍬</span>";
          format-source-muted = "<span size='14pt'>󰍭</span>";
          on-click = "wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle";
          on-click-right = "pavucontrol";
          tooltip = false;
        };

        pulseaudio = {
          interval = 1;
          format = "{icon}";
          format-icons = [
            "<span size='14pt'>󰕿</span>"
            "<span size='14pt'>󰖀</span>"
            "<span size='14pt'>󰕾</span>"
          ];
          format-muted = "<span size='14pt'>󰝟</span>";
          on-click = "wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle";
          on-click-right = "pavucontrol";
          reverse-scrolling = true;
          tooltip = true;
          tooltip-format = "Volume: {volume}%\n{desc}";
          ignored-sinks = [
            "Easy Effects Sink"
          ];
        };
      };
    };

    style = ''
      * {
        font-family: "JetBrainsMono Nerd Font Propo";
        font-size: 16px;
        border-radius: 0;
        box-shadow: none;
        color: ${config.theme.colors.foreground};
      }

      #clock,
      #battery {
        padding: 12px 0;
      }

      #clock {
        color: ${config.theme.colors.accent};
      }

      #language {
        padding-bottom: 12px;
      }

      tooltip {
        background: ${config.theme.colors.surface};
        border: 1px solid ${config.theme.colors.border};
      }
      tooltip * {
        background: ${config.theme.colors.surface};
        color: ${config.theme.colors.foreground};
      }

      window#waybar {
        background: ${config.theme.colors.background};
      }

      #workspaces button {
        background: none;
        box-shadow: none;
        border: none;
      }
    '';
  };
}
