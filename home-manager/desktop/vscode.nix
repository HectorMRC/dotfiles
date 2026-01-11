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
      vadimcn.vscode-lldb
      valentjn.vscode-ltex
    ];

    userSettings = {
      "workbench.colorTheme" = "Gruvbox Dark Medium";

      "editor.wordWrap" = "on";

      "telemetry.telemetryLevel" = "off";
      "telemetry.enableTelemetry" = false;
      "telemetry.enableCrashReporter" = false;

      "workbench.enableExperiments" = false;

      "update.mode" = "none";
    };
  };
}
