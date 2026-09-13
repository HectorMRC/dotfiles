# Builds a Colmena node from a per-device description.

let
  nixos = ../nixos;
  home = ../home-manager;
  hardware = ../hardware-configuration;

  desktopTags = [
    "home"
    "work"
  ];

  hasAny = wanted: tags: builtins.any (t: builtins.elem t tags) wanted;

  baseNixosImports = [
    (nixos + "/user.nix")
    (nixos + "/packages.nix")
    (nixos + "/services.nix")
    (nixos + "/nix.nix")
    (nixos + "/locale.nix")
    (nixos + "/network.nix")
    (nixos + "/startup.nix")
    (nixos + "/virtualisation.nix")
  ];

  desktopNixosImports = [
    (nixos + "/bluetooth.nix")
    (nixos + "/pam.nix")
    (nixos + "/pipewire.nix")
    (nixos + "/desktop")
  ];

  baseHomeImports = [
    home
    (home + "/direnv.nix")
    (home + "/keygen.nix")
    (home + "/neovim.nix")
    (home + "/ssh.nix")
    (home + "/theme.nix")
    (home + "/tmux.nix")
    (home + "/vcs.nix")
    (home + "/zsh.nix")
  ];

  desktopHomeImports = [
    (home + "/latex.nix")
    (home + "/opencode.nix")
    (home + "/desktop")
    (home + "/desktop/brave.nix")
  ];
in
{
  hostname,
  username ? "hector",
  tags,
  allowLocalDeployment ? true,
  knownHosts,
  vcsUser,
  wallpaper ? null,
  profile ? "personal",
  extraImports ? [ ],
  extraHomeImports ? [ ],
  extraConfig ? { },
  extraHomeConfig ? { },
}:
let
  isDesktop = hasAny desktopTags tags;

  nixosImports = [
    (hardware + "/${hostname}.nix")
  ]
  ++ baseNixosImports
  ++ (if isDesktop then desktopNixosImports else [ ])
  ++ extraImports;

  homeImports =
    baseHomeImports ++ (if isDesktop then desktopHomeImports else [ ]) ++ extraHomeImports;
in
{
  deployment = {
    inherit tags allowLocalDeployment;
    targetHost = hostname;
  };

  imports = nixosImports;

  profile = {
    inherit hostname username;
    shell = "zsh";
  };

  home-manager.users.${username} = {
    imports = homeImports;

    theme.name = "gruvbox";

    knownHosts = builtins.attrValues knownHosts;

    version-control-system = {
      user = vcsUser;
      extraTools = [ "jj" ];
    };
  }
  // (if isDesktop then { desktopEnvironment = { inherit wallpaper profile; }; } else { })
  // extraHomeConfig;
}
// extraConfig
