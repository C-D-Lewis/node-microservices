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
  DRIVE_NAME
  ext4
  0%
  100%
  quit
  ```

# Make partition (1 on sda as example)
```
sudo mkfs.ext4 /dev/sda1
sudo e2label /dev/sda1 DRIVE_NAME
```

# Prepare mount point
```
sudo mkdir -p /mnt/usb/DRIVE_NAME
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
  UUID= /mnt/usb/DRIVE_NAME ext4 defaults,auto,users,rw,nofail 0 0
  ```

# First mount
```
mount -t ext4 /dev/sda1 /mnt/usb/DRIVE_NAME
sudo chown -R pi /mnt/usb/DRIVE_NAME
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
  [DRIVE_NAME]
  path = /mnt/usb/DRIVE_NAME/
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
sudo systemctl restart smbd
