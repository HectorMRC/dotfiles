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
          user-name = "hector";
          host-name = "dell-inspiron";
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
            targetHost = host-name;
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

          desktop-environment = {
            display-manager = "greet";
            sessions = [
              "niri"
            ];
          };

          role-configuration = {
            inherit host-name user-name;
            shell = "zsh";
          };

          home-manager.users.${user-name} = {
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

            role-configuration = {
              inherit user-name;
            };

            theme.name = "gruvbox";
            desktop-environment = {
              wallpaper = ./assets/wallpapers/raining-osaka.jpg;
              profile = "personal";
            };

            version-control-systems = [ "jj" ];
          };
        };
      };
    };
}
