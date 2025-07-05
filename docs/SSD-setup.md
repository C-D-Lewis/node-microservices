# See drives
```
sudo fdisk -l
```

# Unmount
```
umount /dev/sda1
```

# Erase and add new partition
```
sudo parted /dev/sda
```
  ```
  mklabel gpt
  mkpart
  raid1
  ext4
  0%
  100%
  quit
  ```
> `raid1` is the drive name, here and after

Possibly need to reboot here?

# Make partition (1 on sda as example)
```
sudo mkfs.ext4 /dev/sda1
sudo e2label /dev/sda1 raid1
```

# Prepare mount point
```
sudo mkdir -p /mnt/ssd
```

## Get UUID and TYPE
```
sudo blkid /dev/sda1
```

## Add to mount table (example)
```
sudo nano /etc/fstab
```

```
UUID= /mnt/ssd ext4 defaults,auto,users,rw,nofail,exec 0 0
```

Note the UUID before opening fstab:


# First mount
```
sudo mount -t ext4 /dev/sda1 /mnt/ssd
```

# Permissions

```
sudo chown pi -R /mnt/ssd
sudo chmod a+rwx /mnt/ssd
```

# Reboot
```
sudo shutdown -r now
```

# If issues with USB/SATA disconnecting (in dmesg)

Enable quirks mode (seems to help) over using UAS mode:

```
sudo nano /boot/firmware/cmdline.txt
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
