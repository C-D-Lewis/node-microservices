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
UUID= /mnt/usb/raid1 ext4 defaults,auto,users,rw,nofail,exec 0 0
```

# First mount
```
sudo mount -t ext4 /dev/sda1 /mnt/usb/raid1
```

# Permissions

```
sudo chown pi -R /mnt/usb/raid1
sudo chmod a+rwx /mnt/usb/raid1
```

# Reboot
```
sudo shutdown -r now
```
