{ pkgs, ... }:
let
  protonDriveCli = pkgs.stdenv.mkDerivation {
    pname = "proton-drive-cli";
    version = "latest";

    src = pkgs.fetchurl {
      url = "https://proton.me/download/drive/cli/0.4.6/linux-x64/proton-drive";
      hash = "sha256-iaVBMaCBHkLqGOxDBz1us0fYD1lO0CJgCbuUEY9M2oY=";
    };

    dontUnpack = true;
    dontStrip = true;

    nativeBuildInputs = with pkgs; [
      autoPatchelfHook
    ];

    buildInputs = with pkgs; [
      stdenv.cc.cc.lib
      libsecret
      glib
    ];

    installPhase = ''
      runHook preInstall

      mkdir -p $out/bin

      cp $src $out/bin/proton-drive

      chmod +w $out/bin/proton-drive
      chmod +x $out/bin/proton-drive

      patchelf --add-needed libsecret-1.so.0 $out/bin/proton-drive

      runHook postInstall
    '';

    meta = with pkgs.lib; {
      description = "Official Proton Drive CLI";
      homepage = "https://github.com/ProtonDriveApps/sdk/tree/main/js/cli";
      license = licenses.mit;
      platforms = [ "x86_64-linux" ];
    };
  };
in
{
  home.packages = [
    protonDriveCli
  ];
}
