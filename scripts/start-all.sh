cd "../apps/conduit" && npm start &
sleep 5
cd "../apps/attic" && npm start &
sleep 5
cd "../apps/led-server" && npm start &
sleep 5
cd "../apps/backlight-server" && npm start &
sleep 5
cd "../apps/plug-server" && npm start &
sleep 5
cd "../apps/webhooks" && npm start &
# sleep 5
# cd "../apps/spotify-auth" && npm start &
sleep 5
cd "../apps/monitor" && npm start &
# sleep 5
# cd "../apps/service-dashboard" && npm run serve &
sleep 5