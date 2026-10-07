{ config, pkgs, ... }:
let
  stateDir = "/var/lib/comin-notify";

  comin-notify = pkgs.writeShellApplication {
    name = "comin-notify";
    runtimeInputs = with pkgs; [
      coreutils
      curl
    ];
    
    text = ''
      url_file=${config.age.secrets.ntfy-url.path}
      state_file=${stateDir}/last-system

      host=''${COMIN_HOSTNAME:-unknown}
      sha=''${COMIN_GIT_SHA:-}
      msg=''${COMIN_GIT_MSG:-}
      err=''${COMIN_ERROR_MSG:-}

      case "''${COMIN_PHASE:-}:''${COMIN_STATUS:-}" in
        build:*)
          [ -n "$err" ] || exit 0
          title="$host: build failed"
          priority=high
          tags=x
          ;;
        deploy:failed)
          title="$host: deploy failed"
          priority=high
          tags=x
          ;;
        deploy:done)
          current=$(readlink -f /run/current-system)
          [ "$current" != "$(cat "$state_file" 2>/dev/null || true)" ] || exit 0
          echo "$current" >"$state_file"
          title="$host: updated"
          priority=default
          tags=white_check_mark
          ;;
        *)
          exit 0
          ;;
      esac

      body="''${sha:0:8} ''${msg%%$'\n'*}"
      if [ -n "$err" ]; then
        body+=$'\n\n'"''${err:0:1000}"
      fi

      curl -fsS --max-time 10 \
        -H "Title: $title" \
        -H "Priority: $priority" \
        -H "Tags: $tags" \
        --data-binary "$body" \
        "$(<"$url_file")"
    '';
  };
in
{
  services.comin = {
    enable = true;
    remotes = [
      {
        name = "origin";
        url = "https://github.com/HectorMRC/dotfiles.git";
        branches.main.name = "main";
        poller.period = 3600;
      }
    ];
    buildAttemptsLimit = 3;
    postBuildCommand = pkgs.lib.getExe comin-notify;
    postDeploymentCommand = pkgs.lib.getExe comin-notify;
  };

  age.secrets.ntfy-url.file = ../secrets/ntfy-url.age;

  systemd.tmpfiles.rules = [ "d ${stateDir} 0700 root root -" ];
}
