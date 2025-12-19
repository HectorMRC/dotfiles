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
    { self, nixpkgs, colmena, home-manager, ... }:
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
    in {
      # Dev shell to make colmena available.
      # This is nicer than installing colmena on the machine because it avoids mismatches between the installed colmena version and a potential newer one.
      # devShells.x86_64-linux.default = pkgs.mkShell {
      #   buildInputs = [
      #     colmena.packages.x86_64-linux.colmena
      #   ];
      # };

      devShells.x86_64-linux = import ./shells { inherit pkgs; } // {
        local = pkgs.mkShell {
          buildInputs = [
            pkgs.colmena
          ];
        };
      };

      # Colmena v0.5 output
      colmenaHive = colmena.lib.makeHive self.outputs.colmena;

      colmena = {
        meta.nixpkgs = pkgs;

        defaults = {
          imports = [
            home-manager.nixosModules.home-manager
          ];

          home-manager = {
            useGlobalPkgs = true;
            useUserPackages = true;
            sharedModules = [];
          };
        };

        dell-inspiron = with devices.dell-inspiron; {
          deployment = {
            tags = ["home"];
            targetHost = host-name;
          };

          imports = [
            ./nixos/hardware-configuration/dell-inspiron.nix
            ./nixos/dell-inspiron.nix
          ];
        };
      };
    };
}
