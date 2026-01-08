{ config, ... }:
let
  accent = config.theme.colors.accent;
  success = config.theme.colors.success;
  info = config.theme.colors.info;
  warning = config.theme.colors.warning;
  error = config.theme.colors.error;
  background = config.theme.colors.background;
  surface = config.theme.colors.surface;
  foreground = config.theme.colors.foreground;
in
{
  programs.zsh = {
    enable = true;
    enableCompletion = true;
    autosuggestion.enable = true;

    syntaxHighlighting = {
      enable = true;
      styles = {
        alias = "fg=${success}";
        builtin = "fg=${success}";
        function = "fg=${success}";
        command = "fg=${success}";
        hashed-command = "fg=${success}";
        arg0 = "fg=${success}";
        precommand = "fg=${accent}";
        globbing = "fg=${info},bold";
        reserved-word = "fg=${warning}";
        redirection = "fg=${warning}";
        unknown-token = "fg=${error}";
        path = "fg=${info},underline";
        comment = "fg=${surface}";
        default = "fg=${foreground}";
      };
    };

    shellAliases = {
      update = "sudo nixos-rebuild switch";
      cheatsheet = ''
        echo "Bluetooth"
        echo "  systemctl [status|start|stop] bluetooth"
        echo "  bluetoothctl"
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
      PROMPT='╭─ %F{${success}}%n@%m%f %F{${info}}%~%f
      ╰─ '
    '';
  };

  programs.starship = {
    enable = true;
    enableZshIntegration = true;

    settings = {
      "$schema" = "https://starship.rs/config-schema.json";

      format = ''
        [](fg:${surface})$username[](fg:${surface} bg:${info})$directory[](fg:${info} bg:${warning})''${custom.vcs}[](fg:${warning})
        [  ](fg:${foreground})
      '';

      add_newline = true;

      username = {
        show_always = true;
        style_user = "fg:${foreground} bg:${surface}";
        style_root = "fg:${error} bg:${surface}";
        format = "[ $user ]($style)";
        disabled = false;
      };

      directory = {
        style = "fg:${background} bg:${info}";
        format = "[ $path ]($style)";
        truncation_length = 3;
        truncation_symbol = "…/";
      };

      custom.vcs = {
        when = "[[ -d .jj || -d .git ]]";
        detect_folders = [
          ".jj"
          ".git"
        ];

        command = "[ -d .jj ] && jj log -r @ -n 1 --no-graph --color never -T 'change_id.shortest()' || git branch --show-current";
        symbol = "";
        style = "fg:${background} bg:${warning}";
        format = "[ $symbol $output ]($style)";
      };
    };
  };
}
