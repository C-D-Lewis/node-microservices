# RAID Setup

## Install mdadm
```
sudo apt install -y mdadm
```

## Find mount points
```
lsblk
```

## Unmount
```
sudo umount /dev/sda1
sudo umount /dev/sdb1
```

## Create RAID-1 array
```
sudo mdadm --create --verbose /dev/mdX --level=mirror --raid-devices=2 /dev/sda1 /dev/sdb1
```

## Confirm status
```
cat /proc/mdstat
```

(Check rsync progress and speed)

## Save array config
```
sudo -i
mdadm --detail --scan >> /etc/mdadm/mdadm.conf
nano /etc/mdadm/mdadm.conf
exit
```

## Create filesystem
```
sudo mkfs.ext4 -v -m .1 -b 4096 -E stride=32,stripe-width=64 /dev/mdX
```

## First mount
```
sudo mkdir /mnt/raid1
sudo mount /dev/mdX /mnt/raid1
sudo chown -R pi /mnt/raid1
```

## fstab
Get UUID:
```
sudo blkid /dev/mdX
```

```
sudo nano /etc/fstab
```

```
UUID= /mnt/raid1 ext4 defaults,noatime 0 0
```

## Check performance
```
sudo apt install -y hdparm
```

```
sudo hdparm -tT --direct /dev/mdX
```

## PiOLED monitor
```
sudo crontab -e
```

```
# pi-oled cirroc display
@reboot python3 /home/pi/code/node-microservices/tools/cirroc_oled/main.py > /home/pi/cirroc_oled.log
```

## Move array to new system

1. Check array is clean

```
sudo mdadm --detail /dev/mdX
```

2. Stop the array / shutdown

```
sudo mdadm --stop /dev/mdX
```

3. Move drives to new system

4. Try a scan

```
sudo mdadm --assemble --scan
```

or check it was auto-found:

```
cat /proc/mdstat
```

```
sudo mdadm --detail /dev/mdX
```

5. Mount and check data

```
sudo mkdir /mnt/raid1
sudo mount /dev/mdX /mnt/raid1
```

6. Add to mdadm config

```
sudo mdadm --detail --scan | sudo tee -a /etc/mdadm/mdadm.conf
```

7. Update fstab (see above)
