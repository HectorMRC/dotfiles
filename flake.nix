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
      pkgs = import nixpkgs {
        system = "x86_64-linux";
      };

      devices = {
        dell-inspiron = {
          user-name = "hector";
          host-name = "dell-inspiron";
        };
      };
    in
    {
      devShells.x86_64-linux.default = pkgs.mkShell {
        buildInputs = [
          colmena.packages.x86_64-linux.colmena
        ];
        packages = [
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
            ./nixos/desktop.nix
            ./nixos/device.nix
            ./nixos/locale.nix
            ./nixos/network.nix
            ./nixos/pipewire.nix
            ./nixos/startup.nix
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
              ./home-manager/desktop.nix
              ./home-manager/alacritty.nix
              ./home-manager/direnv.nix
              ./home-manager/firefox.nix
              ./home-manager/latex.nix
              ./home-manager/neovim.nix
              ./home-manager/niri.nix
              ./home-manager/rofi.nix
              ./home-manager/tmux.nix
              ./home-manager/vcs.nix
              ./home-manager/zsh.nix
            ];

            role-configuration = {
              inherit user-name;
            };

            desktop-environment = {
              wallpaper = ./Pictures/Wallpapers/rocket.png;
              profile = [ "personal" ];
            };
          };
        };
      };
    };
}
