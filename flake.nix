{
    description = "Hector's infrastructure";

    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

        colmena = {
            url = "github:zhaofengli/colmena";
            inputs.nixpkgs.follows = "nixpkgs";
            inputs.flake-utils.follows = "flake-utils";
        };

        home-manager = {
            url = "github:nix-community/home-manager";
            inputs.nixpkgs.follows = "nixpkgs";
        };

        # transitive dependencies to allow following
        systems.url = "github:nix-systems/default-linux";
        
        flake-utils = {
            url = "github:numtide/flake-utils";
            inputs.systems.follows = "systems";
        };
    };

    outputs = { 
        self,
        nixpkgs, 
        colmena, 
        home-manager,
        ... 
    }: 

    {
        devShells.x86_64-linux.default = pkgs.mkShell {
            buildInputs = [
                colmena.packages.x86_64-linux.colmena
            ];
        };

        colmenaHive = colmena.lib.makeHive {
            meta = {
                nixpkgs = import nixpkgs {
                    system = "x86_64-linux";
                    overlays = [];
                };
            };

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

            dell-inspiron = {
                deployment = {
                    allowLocalDeployment = true;
                }
                
                imports = [
                    ./nixos/hardware-configuration/dell-inspiron.nix
                    ./nixos/dell-inspiron.nix
                ];
            };
        };
    };
}
