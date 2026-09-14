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

      mkHost = import ./lib/mkHost.nix;
      mkHosts = builtins.mapAttrs (hostname: device: mkHost (device // { inherit hostname; }));

      username = "hector";

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
          inherit username;
          ip = "192.168.0.44";
          knownHosts = devices;
          vcsUser = vcsUsers.personal;
          tags = [
            "home"
            "laptop"
          ];
        };
        dell-xps = {
          inherit username;
          ip = "192.168.0.22";
          knownHosts = devices;
          vcsUser = vcsUsers.personal;
          tags = [
            "home"
            "laptop"
          ];
        };
        zimablade = {
          inherit username;
          ip = "192.168.0.52";
          knownHosts = devices;
          vcsUser = vcsUsers.personal;
          tags = [
            "home"
            "server"
          ];
        };
        thinkpad = {
          inherit username;
          ip = "192.168.0.82";
          knownHosts = devices;
          vcsUser = vcsUsers.work;
          tags = [
            "work"
            "laptop"
          ];
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

      colmenaHive = colmena.lib.makeHive (
        {
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
        }
        // mkHosts devices
      );
    };
}
