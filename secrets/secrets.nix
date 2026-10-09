let
  hector = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKdUvdD+NWcwnmDPM5ReY9so1jR/Oho7idYx7wbCq2Lv";
  zimablade = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGzazjDoj2BB2VGj3V5X9SKDHFkMF/J7tdsv8UpDak9+";
in
{
  "ntfy-url.age".publicKeys = [
    hector
    zimablade
  ];
  "zimablade-netbird-setup-key.age".publicKeys = [
    hector
    zimablade
  ];
}
