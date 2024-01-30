> Assuming SSD-setup.md is completed

# Setup Sambda
```
sudo apt install -y samba samba-common
```

# Setup share
```
sudo nano /etc/samba/smb.conf
```

```
[raid1]
path = /mnt/raid1/
writeable = yes
create mask = 0775
directory mask = 0775
public=no
```

# Add pi password
```
sudo smbpasswd -a pi
```

# Reboot Sambda
```
sudo systemctl restart smbd
```

# If issues with USB/SATA disconnecting (in dmesg)

Enable quirks mode (seems to help) over using UAS mode:

```
sudo nano /boot/cmdline.txt
```

```
usb-storage.quirks=aaaa:bbbb:u
```

Where `aaaa` is the `idVendor` for your device and `bbbb` is the `idProduct`, added to the start of the file. These are found in `dmesg` when the drive is plugged in with the USB > SSD cable:

```
[    2.488234] usb 2-2.3: new SuperSpeed USB device number 3 using xhci_hcd
[    2.513780] usb 2-2.3: New USB device found, idVendor=174c, idProduct=1153, bcdDevice= 1.00
[    2.513839] usb 2-2.3: New USB device strings: Mfr=2, Product=3, SerialNumber=1
[    2.513868] usb 2-2.3: Product: Ugreen Storage Device
[    2.513891] usb 2-2.3: Manufacturer: Ugreen
[    2.513912] usb 2-2.3: SerialNumber: 26A1EE833C9C
```

Quirks mode can be confirmed with `dmesg | grep usb-storage`:

```
[    2.517433] usb 2-2.3: UAS is ignored for this device, using usb-storage instead
[    2.517588] usb 2-2.3: UAS is ignored for this device, using usb-storage instead
[    2.517619] usb-storage 2-2.3:1.0: USB Mass Storage device detected
[    2.518212] usb-storage 2-2.3:1.0: Quirks match for vid 174c pid 1153: 800000
```
