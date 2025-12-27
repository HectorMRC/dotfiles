{ ... }:
{
  programs.zsh = {
    enable = true;
    enableCompletion = true;
    autosuggestion.enable = true;
    syntaxHighlighting.enable = true;

    shellAliases = {
      update = "sudo nixos-rebuild switch";
      cheatsheet = ''
        echo "Bluetooth"
        echo "  systemctl [status|start|stop] bluetooth"
        echi "  bluetoothctl"
        echo "Network"
        echo "  nmcli connection show"
        echo "  nmcli device wifi connect \"<wifi name>\" [password \"<password>\"]"
      '';
    };

    history.size = 10000;
    history.ignoreAllDups = true;
    history.path = "$HOME/.zsh_history";

    initContent = ''
      autoload -U colors && colors
      PROMPT='╭ %F{green}%n@%m%f %F{blue}%~%f
      ╰─ '
    '';
  };
}
