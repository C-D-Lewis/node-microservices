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

Find bad blocks (takes hours):

```
sudo badblocks -nsv /dev/sdXY > ./bad_blocks.txt
```

Repair with list of bad blocks found:

```
sudo e2fsck -B 4096 -y -l ./bad_blocks.txt /dev/sdXY
```
