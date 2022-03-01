// // Detect wifi stealers!
// const { execSync } = require('child_process');
// const { log } = require('../node-common')(['log']);

// const sleep = require('../modules/sleep');

// Reimplement with conduit when the time comes
// server.getExpressApp().get('/devices', (req, res) => {
//   log.info('<< /devices');
//   res.status(200);
//   res.send(JSON.stringify(recentDevices));
// });

// Major code style update

// var recentDevices = [];  // [{ ip, mac, name, lastSeen }]

// function discoverDevices(now, args) {
//   var rows = execSync('sudo nmap -sn 192.168.0.*/24').toString().split('\n');
//   rows = rows.slice(rows.indexOf(rows.find((row) => row.includes('Nmap scan report'))));

//   const devices = [];
//   while(rows.find((item) => item.includes('Nmap scan report'))) {
//     const ip = rows[0].substring(rows[0].indexOf('192'));
//     var name = 'N/A', mac = 'N/A', known = false;
//     if(rows[2].includes('MAC Address')) {
//       mac = rows[2].substring(rows[2].indexOf(': ') + 2, rows[2].indexOf('(') - 1);
//       const foundDevice = args.KNOWN.find((knownDevice) => knownDevice.MAC === mac);
//       if(foundDevice) {
//         name = foundDevice.NAME;
//         known = true;
//       } else {
//         name = `??? ${rows[2].substring(rows[2].indexOf('(') + 1, rows[2].indexOf(')'))}`;
//       }
//       rows.splice(0, 3);
//     } else {
//       const staticIpDevice = args.KNOWN.find((knownDevice) => {
//         return knownDevice.STATIC_IP && knownDevice.STATIC_IP === ip
//       });
//       name = staticIpDevice ? staticIpDevice.NAME : 'MAC?';
//       rows.splice(0, 2);
//     }
//     const device = { ip: ip, mac: mac, name: name, lastSeen: now, known: known };
//     log.debug(`device=${JSON.stringify(device)}`);
//     devices.push(device);
//   }
//   return devices;
// }

// function getNewDevices(devices, now) {
//   const newNames = [];
//   for(var i = 0; i < devices.length; i++) {
//     const device = devices[i];
//     const deviceString = `${device.name} (${device.ip}, ${device.mac})`;

//     // Was this device around last scan?
//     var recentDevice = recentDevices.find((item) => item.ip === device.ip);
//     if(!recentDevice) {
//       // New device found, not recently seen
//       if(!device.known) newNames.push(deviceString);
//       recentDevices.push(device);
//       log.info(`New device: ${deviceString}`);
//       continue;
//     }

//     // Update last seen
//     recentDevice.lastSeen = now;
//     log.info(`Updated ${deviceString}`);
//   }
//   return newNames;
// }

// function getExpiringDevices(devices, now, args) {
//   const expiringNames = [];
//   for(var i = 0; i < recentDevices.length; i++) {
//     const recentDevice = recentDevices[i];
//     const recentDeviceString = `${recentDevice.name} (${recentDevice.ip}, ${recentDevice.mac})`;

//     // Recent device not in last scanned device list?
//     const missingDevice = devices.find((item) => item.ip === recentDevice.ip);
//     if(!missingDevice) {
//       if((now - recentDevice.lastSeen) > args.FORGET_AFTER_M * 60 * 1000) {
//         // Been a long time since it was last seen?
//         if(!recentDevice.known) expiringNames.push(recentDeviceString);
//         log.info(`Removed ${recentDeviceString}`);
//         recentDevices.splice(recentDevices.indexOf(recentDevice), 1);
//       } else {
//         log.info(`Expiring: ${recentDeviceString}`);
//       }
//     }
//   }
//   return expiringNames;
// }

// module.exports = (args) => {
//   if(sleep.sleeping()) return;

//   const now = new Date().getTime();
//   const devices = discoverDevices(now, args);
//   log.info(`Discovered ${devices.length} devices.`);

//   if(recentDevices.length === 0) recentDevices = devices;

//   // Check all new devices are in recentDevices
//   const newNames = getNewDevices(devices, now);
//   const expiringNames = getExpiringDevices(devices, now, args);

//   // Nofification logic based on new/missing devices
//   var message = '';
//   if(newNames.length >= 1) {
//     if(newNames.length === 1) message += `${newNames[0]} joined the network. `;
//     else message += `New devices: ${newNames.join(',')}. `;
//   }
//   if(expiringNames.length >= 1) {
//     if(expiringNames.length === 1) message += `${expiringNames[0]} left the network.`;
//     else message += `Devices left: ${expiringNames.join(',')}.`;
//   }
//   if(args.NOTIFY_CHANGES && message.length > 0) {
//     log.info(message);
//     Some other notification mechanism
//   }
// }