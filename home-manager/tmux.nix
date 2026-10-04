{ ... }:
{
  programs.tmux = {
    enable = true;

    terminal = "tmux-256color";
    extraConfig = ''
      setw -g mouse on

      set -ga terminal-overrides ",alacritty:RGB"

      bind c new-window -c "#{pane_current_path}"
      bind '"' split-window -v -c "#{pane_current_path}"
      bind % split-window -h -c "#{pane_current_path}"

      set -g status-style "bg=#90a959,fg=#262626"

      set -g extended-keys on
      set -g extended-keys-format csi-u
    '';
  };
}
