{ ... }:
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
        width = 30;
        spacing = 8;
        margin-top = 8;
        margin-right = 8;
        margin-bottom = 8;
        margin-left = 8;

        include = [ "~/.config/waybar/modules.json" ];

        modules-left = [
          "clock"
        ];

        modules-center = [
          "niri/workspaces"
        ];

        modules-right = [
          "niri/language"
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
          # format = "{icon}";
          # format-icons = {
          #   default = "󰄰";
          #   active = "󰄯";
          # };
        };

        "niri/language" = {
          format = "{}";
          format-en = "us";
          format-es = "es";
          tooltip = true;
          on-click = "niri msg action switch-layout next";
        };
      };
    };

    style = ''
      @define-color cursor #CDD6F4;
      @define-color background #1E1E2E;
      @define-color foreground #CDD6F4;
      @define-color color0  #45475A;
      @define-color color1  #F38BA8;
      @define-color color2  #A6E3A1;
      @define-color color3  #F9E2AF;
      @define-color color4  #89B4FA;
      @define-color color5  #F5C2E7;
      @define-color color6  #94E2D5;
      @define-color color7  #BAC2DE;
      @define-color color8  #585B70;
      @define-color color9  #F38BA8;
      @define-color color10 #A6E3A1;
      @define-color color11 #F9E2AF;
      @define-color color12 #89B4FA;
      @define-color color13 #F5C2E7;
      @define-color color14 #94E2D5;
      @define-color color15 #A6ADC8;

      * {
        font-family: "JetBrainsMono Nerd Font Propo";
        font-size: 16px;
        border-radius: 0;
        box-shadow: none;
      }

      window#waybar {
        background: transparent;
      }

      #network:hover,
      #bluetooth:hover,
      #custom-powermenu:hover {
        opacity: 0.5;
      }

      #clock,
      #network,
      #bluetooth,
      #battery,
      #custom-powermenu {
        color: @foreground;
        padding: 6px 0;
      }

      #workspaces button {
        color: @foreground;
        padding: 0;
      }
      #workspaces button.active {
        color: @color2;
      }

      #language {
        padding-bottom: 15px;
      }

      #clock {
        color: @color4;
      }

      #network.disabled {
        color: @color1;
      }
      #network.wifi {
        color: @color2;
      }
      #network.ethernet {
        color: @color3;
      }

      #bluetooth.disabled {
        color: @color1;
      }
      #bluetooth.connected {
        color: @color4;
      }

      #battery.plugged {
        color: @color4;
      }
      #battery.charging {
        color: @color2;
      }
      #battery.critical {
        color: @color3;
      }

      tooltip {
        background: @background;
        border: 1px solid @foreground;
      }
      tooltip * {
        color: @foreground;
        margin: 2px;
        background: @background;
      }
    '';
  };
}
