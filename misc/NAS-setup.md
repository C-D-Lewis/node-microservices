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

# Make partition (1 on sda as example)
```
sudo mkfs.ext4 /dev/sda1
sudo e2label /dev/sda1 raid1
```

# Prepare mount point
```
sudo mkdir -p /mnt/usb/raid1
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
  UUID= /mnt/usb/raid1 ext4 defaults,auto,users,rw,nofail 0 0
  ```

# First mount
```
sudo mount -t ext4 /dev/sda1 /mnt/usb/raid1
sudo chown -R pi /mnt/usb/raid1
```

# Reboot
```
sudo shutdown -r now
```

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
  path = /mnt/usb/raid1/
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

Where `aaaa` is the `idVendor` for your device and `bbbb` is the `idProduct`,
added to the start of the file.
