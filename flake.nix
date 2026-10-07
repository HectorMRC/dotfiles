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

    comin = {
      url = "github:nlewo/comin";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    agenix = {
      url = "github:ryantm/agenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      colmena,
      home-manager,
      comin,
      agenix,
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

      colmenaHive = colmena.lib.makeHive (
        {
          meta.nixpkgs = pkgs;

          defaults = {
            imports = [
              home-manager.nixosModules.home-manager
              comin.nixosModules.comin
              agenix.nixosModules.default
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

      checks = import ./lib/checks.nix {
        inherit pkgs;
        root = ./.;
      };

      checkArgs = map (name: pkgs.lib.escapeShellArg ".#checks.${system}.${name}") (
        builtins.attrNames checks
      );

      flake-checks = pkgs.writeShellApplication {
        name = "flake-checks";
        runtimeInputs = [ pkgs.git ];
        text = ''
          root="$(git rev-parse --show-toplevel)"
          nix build ${toString checkArgs} --out-link "$root/.direnv/check-results/result" "$@"
        '';
      };
    in
    {
      inherit colmenaHive;

      checks.${system} = checks;

      nixosConfigurations = colmenaHive.nodes;

      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          colmena.packages.${system}.colmena
          agenix.packages.${system}.default
          flake-checks
        ];
        packages = with pkgs; [
          actionlint
          biome
          lua-language-server
          nixd
          nixfmt
          nodejs
          stylua
          tombi
          typescript-language-server
          yamllint
        ];
      };
    };
}
