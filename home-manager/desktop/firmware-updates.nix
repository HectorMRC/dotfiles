{
  config,
  lib,
  osConfig,
  pkgs,
  ...
}:
let
  enabled = osConfig.services.fwupd.enable && osConfig.programs.niri.enable;
  colors = config.palette.colors;
  fwupdmgr = "${osConfig.services.fwupd.package}/bin/fwupdmgr";

  css = pkgs.writeText "firmware-updates.css" ''
    * {
      font-family: "JetBrainsMono Nerd Font Propo";
      font-size: 14px;
    }

    window {
      background-color: ${colors.surface};
      color: ${colors.foreground};
      border: 1px solid ${colors.border};
    }
  '';

  icon = pkgs.writeText "firmware-updates.svg" ''
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <text x="24" y="24" text-anchor="middle" dominant-baseline="central"
            font-family="JetBrainsMono Nerd Font Propo" font-size="40"
            fill="${colors.primary}">󰍛</text>
    </svg>
  '';

  heading = lib.concatStringsSep "\n" [
    "<b>Firmware updates are available</b>"
    "<small><span foreground='${colors.foreground-disabled}'>Run <tt><span foreground='${colors.accent}'>fwupdmgr update</span></tt> in a terminal to install them.</span></small>"
  ];

  script = pkgs.writeShellScript "firmware-updates.sh" ''
    set -eu

    STATE_DIR="''${XDG_STATE_HOME:-$HOME/.local/state}/firmware-updates"
    DISMISSED="$STATE_DIR/dismissed"
    mkdir -p "$STATE_DIR"

    exec 9>"$STATE_DIR/lock"
    flock -n 9 || exit 0

    STATUS=0
    JSON=$(${fwupdmgr} get-updates --json --no-unreported-check --no-metadata-check) || STATUS=$?

    # Exit code 2 means there is nothing to update.
    if test "$STATUS" -eq 2; then
        exit 0
    elif test "$STATUS" -ne 0; then
        exit "$STATUS"
    fi

    ROWS=$(jq -r '.Devices[]? | select((.Releases // []) | length > 0)
        | .Name, .Version, .Releases[0].Version' <<<"$JSON")
    if test -z "$ROWS"; then
        exit 0
    fi

    HASH=$(sha256sum <<<"$ROWS" | cut -d' ' -f1)
    if test -f "$DISMISSED" && test "$(cat "$DISMISSED")" = "$HASH"; then
        exit 0
    fi

    if yad --list --title="Firmware updates" \
        --image=${icon} \
        --text="${heading}" \
        --column=Device --column=Current --column=Available \
        --no-selection --no-click \
        --button=Dismiss:0 \
        --width=600 --height=250 --borders=12 \
        --css=${css} <<<"$ROWS" >/dev/null; then
        echo "$HASH" >"$DISMISSED"
    fi
  '';
in
lib.mkIf enabled {
  systemd.user.services.firmware-updates = {
    Unit = {
      Description = "Firmware updates check";
      After = [ "graphical-session.target" ];
      PartOf = [ "graphical-session.target" ];
    };
    Service = {
      Type = "oneshot";
      ExecStart = script;
      Environment = [
        "PATH=${
          lib.makeBinPath [
            pkgs.coreutils
            pkgs.jq
            pkgs.util-linux
            pkgs.yad
          ]
        }"
      ];
    };
  };

  systemd.user.timers.firmware-updates = {
    Unit = {
      Description = "Check for firmware updates every 6 hours";
      PartOf = [ "graphical-session.target" ];
    };
    Timer = {
      OnStartupSec = "5min";
      OnUnitInactiveSec = "6h";
    };
    Install = {
      WantedBy = [ "graphical-session.target" ];
    };
  };
}
