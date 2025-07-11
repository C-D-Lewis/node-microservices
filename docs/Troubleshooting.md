# Troubleshooting

## Check for bad blocks

Check file system with no action taken:

```
sudo e2fsck -n /dev/sdXY 
```

Get block size:

```
sudo dumpe2fs /dev/sdXY | grep "Block size"
```

Find bad blocks (takes hours) with example 4096 block size:

```
sudo badblocks -b 4096 -nsv /dev/sdXY > ./bad_blocks.txt
```

Repair with list of bad blocks found:

```
sudo e2fsck -B 4096 -y -l ./bad_blocks.txt /dev/sdXY
```

## Copy image to another drive

Unmount the source drive.

Copy an image file:

```
sudo dd if=/dev/sdX of=/home/chris/example.img bs=4M status=progress
```

Copy to the new drive:

```
sudo dd if=/home/chris/example.img of=/dev/sdX bs=4M status=progress oflag=sync
```
