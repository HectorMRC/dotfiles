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
      # Make colmena available with: nix develop
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
            ./nixos/hardware-configuration/dell-inspiron.nix
            ./nixos/locale.nix
            ./nixos/dell-inspiron.nix
          ];
        };
      };
    };
}
