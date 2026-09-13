# Builds a Colmena node from a per-device description.

{
  hostname,
  username,
  tags,
  knownHosts,
  vcsUser,
  wallpaper ? null,
}:
let
  nixos = ../nixos;
  home = ../home-manager;
  hardware = ../hardware-configuration;

  whenAll = import ./whenAll.nix tags;
in
{
  deployment = {
    inherit tags;
    targetHost = hostname;
    allowLocalDeployment = true;
  };

  imports = [
    (hardware + "/${hostname}.nix")
    (nixos + "/user.nix")
    (nixos + "/packages.nix")
    (nixos + "/services.nix")
    (nixos + "/nix.nix")
    (nixos + "/locale.nix")
    (nixos + "/network.nix")
    (nixos + "/startup.nix")
    (nixos + "/virtualisation.nix")
  ]
  ++
    whenAll
      [ "laptop" ]
      [
        (nixos + "/bluetooth.nix")
        (nixos + "/pam.nix")
        (nixos + "/pipewire.nix")
        (nixos + "/desktop")
      ];

  profile = {
    inherit hostname username;
    shell = "zsh";
  };

  home-manager.users.${username} = {
    imports = [
      home
      (home + "/direnv.nix")
      (home + "/keygen.nix")
      (home + "/neovim.nix")
      (home + "/ssh.nix")
      (home + "/theme.nix")
      (home + "/tmux.nix")
      (home + "/vcs.nix")
      (home + "/zsh.nix")
    ]
    ++
      whenAll
        [ "laptop" ]
        [
          (home + "/opencode.nix")
          (home + "/desktop")
          (home + "/desktop/alacritty.nix")
          (home + "/desktop/battery.nix")
          (home + "/desktop/brave.nix")
          (home + "/desktop/dolphin.nix")
          (home + "/desktop/firefox.nix")
          (home + "/desktop/hypridle.nix")
          (home + "/desktop/hyprlock.nix")
          (home + "/desktop/niri.nix")
          (home + "/desktop/notify.nix")
          (home + "/desktop/rofi.nix")
          (home + "/desktop/vscodium.nix")
          (home + "/desktop/waybar.nix")
        ]
    ++
      whenAll
        [ "home" "laptop" ]
        [
          (home + "/latex.nix")
          (home + "/proton-drive.nix")
        ];

    theme.name = "gruvbox";

    knownHosts = builtins.attrValues knownHosts;

    version-control-system = {
      user = vcsUser;
      extraTools = [ "jj" ];
    };
  }
  // whenAll [ "laptop" ] { desktopEnvironment = { inherit wallpaper; }; };
}
