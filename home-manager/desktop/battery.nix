{
  config,
  lib,
  pkgs,
  ...
}:
let
  colors = config.palette.colors;
  systemctl = "${pkgs.systemd}/bin/systemctl";

  css = pkgs.writeText "battery-critical.css" ''
    * {
      font-family: "JetBrainsMono Nerd Font Propo";
      font-size: 14px;
    }

    window {
      background-color: ${colors.surface};
      color: ${colors.foreground};
    }
  '';

  icon = pkgs.writeText "battery-critical.svg" ''
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <text x="24" y="24" text-anchor="middle" dominant-baseline="central"
            font-family="JetBrainsMono Nerd Font Propo" font-size="40"
            fill="${colors.error}">󰂃</text>
    </svg>
  '';

  heading = lib.concatStringsSep "\n" [
    "<b>Battery critically low</b>"
    "<small><span foreground='${colors.foreground-disabled}'>$CAPACITY% remaining. Plug in the charger.</span></small>"
  ];

  dialog = pkgs.writeShellScript "battery-critical.sh" ''
    BATTERY_DIR=$(ls -d /sys/class/power_supply/BAT* | head -n 1)
    CAPACITY=$(cat "$BATTERY_DIR/capacity")

    exec yad --title="Battery critically low" --name=battery-critical \
        --image=${icon} \
        --text="${heading}" \
        --button=Dismiss:0 \
        --width=400 --borders=12 \
        --css=${css}
  '';
in
{
  systemd.user.services.battery-monitor = {
    Unit = {
      Description = "Battery monitoring";
    };
    Service = {
      Type = "oneshot";
      ExecStart = pkgs.writeScript "battery-monitor.sh" ''
        #!${pkgs.bash}/bin/bash
        BATTERY_DIR=$(ls -d /sys/class/power_supply/BAT* | head -n 1)
        if test -z "$BATTERY_DIR"; then
            exit 0
        fi

        FLAG_FILE_PREFIX="/tmp/battery-monitor"

        STATUS=$(cat "$BATTERY_DIR/status")
        if test "$STATUS" != "Discharging"; then
            rm $FLAG_FILE_PREFIX*
            ${systemctl} --user stop --no-block battery-critical.service
            exit 0
        fi

        CAPACITY=$(cat "$BATTERY_DIR/capacity")
        if test "$CAPACITY" -le 5; then
            ${pkgs.libnotify}/bin/notify-send -a battery-monitor -u critical "󱐋 Battery critically low" "$CAPACITY% remaining"
            FLAG_FILE=$FLAG_FILE_PREFIX.battery-critical.flagfile
            if test ! -f "$FLAG_FILE"; then
                ${systemctl} --user start --no-block battery-critical.service
                touch "$FLAG_FILE"
            fi
        elif test "$CAPACITY" -le 15; then
            FLAG_FILE=$FLAG_FILE_PREFIX.battery-very-low.flagfile
            if test ! -f "$FLAG_FILE"; then
                ${pkgs.libnotify}/bin/notify-send -a battery-monitor -u critical "󱐋 Battery very low" "$CAPACITY% remaining"
                touch "$FLAG_FILE"
            fi
        elif test "$CAPACITY" -le 30; then
            FLAG_FILE=$FLAG_FILE_PREFIX.battery-low.flagfile
            if test ! -f "$FLAG_FILE"; then
                ${pkgs.libnotify}/bin/notify-send -a battery-monitor -u critical "󱐋 Battery low" "$CAPACITY% remaining"
                touch "$FLAG_FILE"
            fi
        else
            rm $FLAG_FILE_PREFIX*
        fi
      '';
    };
  };

  systemd.user.services.battery-critical = {
    Unit = {
      Description = "Battery critically low dialog";
      After = [ "graphical-session.target" ];
      PartOf = [ "graphical-session.target" ];
    };
    Service = {
      ExecStart = dialog;
      Environment = [
        "PATH=${
          lib.makeBinPath [
            pkgs.coreutils
            pkgs.yad
          ]
        }"
      ];
    };
  };

  systemd.user.timers.battery-monitor = {
    Unit = {
      Description = "Run battery check once per minute";
    };
    Timer = {
      OnBootSec = "0s";
      OnUnitActiveSec = "1m";
    };
    Install = {
      WantedBy = [ "timers.target" ];
    };
  };
}
