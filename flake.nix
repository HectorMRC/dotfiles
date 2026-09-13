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

      vcsUsers = {
        personal = {
          name = "HectorMRC";
          email = "thehector1593@gmail.com";
        };
        work = {
          name = "HectorMRC";
          email = "hector.morales@veecle.io";
        };
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
          tags = [ "home" ];
          vcsUser = vcsUsers.personal;
          wallpaper = ./assets/wallpapers/raining-osaka.jpg;
          profile = "personal";
        };

        dell-xps = mkHost {
          knownHosts = devices;
          hostname = "dell-xps";
          tags = [ "home" ];
          vcsUser = vcsUsers.personal;
          wallpaper = ./assets/wallpapers/ancient-greece.jpeg;
          profile = "personal";
        };

        zimablade = mkHost {
          knownHosts = devices;
          hostname = "zimablade";
          tags = [ "server" ];
          vcsUser = vcsUsers.personal;
        };

        thinkpad = mkHost {
          knownHosts = devices;
          hostname = "thinkpad";
          tags = [ "work" ];
          vcsUser = vcsUsers.work;
          wallpaper = ./assets/wallpapers/ancient-greece.jpeg;
          profile = "work";
        };
      };
    };
}
