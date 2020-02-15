export const setFleetList = fleetList => ({
  type: 'SET_FLEET_LIST',
  fleetList,
});

export const setApps = apps => ({
  type: 'SET_APPS',
  apps,
});

export const setIp = ip => ({
  type: 'SET_IP',
  ip,
});

export const setBottomBarText = bottomBarText => ({
  type: 'SET_BOTTOM_BAR_TEXT',
  bottomBarText,
});

export const setAtticData = atticData => ({
  type: 'SET_ATTIC_DATA',
  atticData,
});

export const setConduitData = conduitData => ({
  type: 'SET_CONDUIT_DATA',
  conduitData,
});

export const setAmbienceData = ambienceData => ({
  type: 'SET_AMBIENCE_DATA',
  ambienceData,
});

export const setVisualsData = visualsData => ({
  type: 'SET_VISUALS_DATA',
  visualsData,
});
