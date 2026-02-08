{ pkgs, ... }:
{
  programs.vscode = {
    package = pkgs.vscodium;

    extensions = with pkgs.vscode-extensions; [
      james-yu.latex-workshop
      # jeanp413.open-remote-ssh
      jnoortheen.nix-ide
      rust-lang.rust-analyzer
      tamasfe.even-better-toml
      tauri-apps.tauri-vscode
      vadimcn.vscode-lldb
      valentjn.vscode-ltex
      vue.volar
    ];

    userSettings = {
      "workbench.colorTheme" = "Gruvbox Dark Medium";

      "terminal.integrated.fontFamily" = "'JetBrainsMono Nerd Font'";

      "editor.wordWrap" = "on";

      "telemetry.telemetryLevel" = "off";
      "telemetry.enableTelemetry" = false;
      "telemetry.enableCrashReporter" = false;

      "workbench.enableExperiments" = false;

      "update.mode" = "none";
    };
  };
}
