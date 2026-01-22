{
  description = "Hector's infrastructure";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    colmena = {
      url = "github:zhaofengli/colmena";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      colmena,
      home-manager,
      ...
    }:
    let
      system = "x86_64-linux";

      pkgs = import nixpkgs {
        inherit system;
      };

      devices = {
        dell-inspiron = {
          username = "hector";
          hostname = "dell-inspiron";
          ip = "192.168.0.44";
        };
        dell-xps = {
          username = "hector";
          hostname = "dell-xps";
          ip = "192.168.0.22";
        };
        zimablade = {
          username = "hector";
          hostname = "zimablade";
          ip = "192.168.0.52";
        };
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          colmena.packages.${system}.colmena
        ];
        packages = [
          pkgs.nixd
          pkgs.nixfmt-rfc-style
        ];
      };

      colmenaHive = colmena.lib.makeHive {
        meta.nixpkgs = pkgs;

        defaults = {
          imports = [
            home-manager.nixosModules.home-manager
          ];

          home-manager = {
            useGlobalPkgs = true;
            useUserPackages = true;
            sharedModules = [ ];
          };
        };

        dell-inspiron = with devices.dell-inspiron; {
          deployment = {
            tags = [ "home" ];
            targetHost = hostname;
            allowLocalDeployment = true;
          };

          imports = [
            ./hardware-configuration/dell-inspiron.nix
            ./nixos/bluetooth.nix
            ./nixos/device.nix
            ./nixos/locale.nix
            ./nixos/network.nix
            ./nixos/pam.nix
            ./nixos/pipewire.nix
            ./nixos/startup.nix
            ./nixos/desktop
          ];

          profile = {
            inherit hostname username;
            shell = "zsh";
          };

          desktopEnvironment = {
            displayManager = "none";
            sessions = [
              "niri"
            ];
          };

          home-manager.users.${username} = {
            imports = [
              ./home-manager
              ./home-manager/direnv.nix
              ./home-manager/keygen.nix
              ./home-manager/latex.nix
              ./home-manager/neovim.nix
              ./home-manager/ssh.nix
              ./home-manager/theme.nix
              ./home-manager/tmux.nix
              ./home-manager/vcs.nix
              ./home-manager/zsh.nix
              ./home-manager/desktop
            ];

            theme.name = "gruvbox";

            knownHosts = builtins.attrValues devices;

            version-control-system = {
              user = {
                name = "HectorMRC";
                email = "thehector1593@gmail.com";
              };
              extraTools = [ "jj" ];
            };

            desktopEnvironment = {
              wallpaper = ./assets/wallpapers/raining-osaka.jpg;
              profile = "personal";
            };
          };
        };

        dell-xps = with devices.dell-xps; {
          deployment = {
            tags = [ "home" ];
            targetHost = hostname;
            allowLocalDeployment = true;
          };

          imports = [
            ./hardware-configuration/dell-xps.nix
            ./nixos/bluetooth.nix
            ./nixos/device.nix
            ./nixos/locale.nix
            ./nixos/network.nix
            ./nixos/pam.nix
            ./nixos/pipewire.nix
            ./nixos/startup.nix
            ./nixos/desktop
          ];

          desktopEnvironment = {
            displayManager = "none";
            sessions = [
              "niri"
            ];
          };

          profile = {
            inherit hostname username;
            shell = "zsh";
          };

          home-manager.users.${username} = {
            imports = [
              ./home-manager
              ./home-manager/direnv.nix
              ./home-manager/keygen.nix
              ./home-manager/latex.nix
              ./home-manager/neovim.nix
              ./home-manager/ssh.nix
              ./home-manager/theme.nix
              ./home-manager/tmux.nix
              ./home-manager/vcs.nix
              ./home-manager/zsh.nix
              ./home-manager/desktop
              ./home-manager/desktop/brave.nix
            ];

            theme.name = "gruvbox";

            knownHosts = builtins.attrValues devices;

            version-control-system = {
              user = {
                name = "HectorMRC";
                email = "thehector1593@gmail.com";
              };
              extraTools = [ "jj" ];
            };

            desktopEnvironment = {
              wallpaper = ./assets/wallpapers/raining-osaka.jpg;
              profile = "personal";
            };
          };
        };

        zimablade = with devices.zimablade; {
          deployment = {
            tags = [ "server" ];
            targetHost = hostname;
            allowLocalDeployment = true;
          };

          imports = [
            ./hardware-configuration/zimablade.nix
            ./nixos/device.nix
            ./nixos/locale.nix
            ./nixos/network.nix
            ./nixos/startup.nix
          ];

          profile = {
            inherit hostname username;
            shell = "zsh";
          };

          home-manager.users.${username} = {
            imports = [
              ./home-manager
              ./home-manager/direnv.nix
              ./home-manager/keygen.nix
              ./home-manager/neovim.nix
              ./home-manager/ssh.nix
              ./home-manager/theme.nix
              ./home-manager/tmux.nix
              ./home-manager/vcs.nix
              ./home-manager/zsh.nix
            ];

            theme.name = "gruvbox";

            knownHosts = builtins.attrValues devices;

            version-control-system = {
              user = {
                name = "HectorMRC";
                email = "thehector1593@gmail.com";
              };
              extraTools = [ "jj" ];
            };
          };
        };
      };
    };
}
