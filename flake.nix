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

        overlays = [ ];
      };

      mkHost = import ./lib/host.nix;

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
        thinkpad = {
          username = "hector";
          hostname = "thinkpad";
          ip = "192.168.0.82";
        };
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          colmena.packages.${system}.colmena
        ];
        packages = with pkgs; [
          lua-language-server
          nixd
          nixfmt
          stylua
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

        dell-inspiron = mkHost {
          knownHosts = devices;
          hostname = "dell-inspiron";
          username = "hector";
          tags = [ "home" ];
          vcsUser = {
            name = "HectorMRC";
            email = "thehector1593@gmail.com";
          };
          wallpaper = ./assets/wallpapers/raining-osaka.jpg;
          profile = "personal";
        };

        dell-xps = mkHost {
          knownHosts = devices;
          hostname = "dell-xps";
          username = "hector";
          tags = [ "home" ];
          vcsUser = {
            name = "HectorMRC";
            email = "thehector1593@gmail.com";
          };
          wallpaper = ./assets/wallpapers/ancient-greece.jpeg;
          profile = "personal";
          extraHomeImports = [
            ./home-manager/ollama.nix
            ./home-manager/opencode.nix
            ./home-manager/proton-drive.nix
            ./home-manager/desktop/brave.nix
          ];
        };

        zimablade = mkHost {
          knownHosts = devices;
          hostname = "zimablade";
          username = "hector";
          tags = [ "server" ];
          vcsUser = {
            name = "HectorMRC";
            email = "thehector1593@gmail.com";
          };
        };

        thinkpad = mkHost {
          knownHosts = devices;
          hostname = "thinkpad";
          username = "hector";
          tags = [ "work" ];
          vcsUser = {
            name = "HectorMRC";
            email = "hector.morales@veecle.io";
          };
          wallpaper = ./assets/wallpapers/ancient-greece.jpeg;
          profile = "work";
          extraHomeImports = [
            ./home-manager/ollama.nix
            ./home-manager/opencode.nix
            ./home-manager/desktop/brave.nix
          ];
        };
      };
    };
}
