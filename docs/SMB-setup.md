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
