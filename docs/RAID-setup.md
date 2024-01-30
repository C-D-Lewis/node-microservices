> Assuming SSD-setup.md is completed

# Install mdadm
```
sudo apt-get install mdadm
```

# Find mount points
```
lsblk
```

# Unmount
```
sudo umount /dev/sda1
sudo umount /dev/sdb1
```

# Create RAID-1 array
```
sudo mdadm --create --verbose /dev/md0 --level=mirror --raid-devices=2 /dev/sda1 /dev/sdb1
```

# Confirm status
```
cat /proc/mdstat
```

(Check rsync progress and speed)

# Save array config
```
sudo -i
mdadm --detail --scan >> /etc/mdadm/mdadm.conf
nano /etc/mdadm/mdadm.conf
exit
```

# Create filesystem
```
sudo mkfs.ext4 -v -m .1 -b 4096 -E stride=32,stripe-width=64 /dev/md0
```

# First mount
```
sudo mkdir /mnt/raid1
sudo mount /dev/md0 /mnt/raid1
sudo chown -R pi /mnt/raid1
```

# fstab
```
sudo nano /etc/fstab
```
  ```
  UUID= /mnt/raid1 ext4 defaults,noatime 0 0
  ```

# Check performance
```
sudo hdparm -tT --direct /dev/md0
```

# PiOLED monitor
```
sudo crontab -e
```
  ```
  @reboot python3 /home/pi/code/node-microservices/tools/cirroc_oled/main.py > /home/pi/cirroc_oled.log
  ```
