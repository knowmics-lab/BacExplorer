import Store from 'electron-store';
import path from 'path';
import { containerVariables } from '../global_variables.js';

const ALL_DBS = ['amrfinder', 'card', 'argannot', 'vfdb', 'megares', 'resfinder'];

const store = new Store({
  name: 'db-update-state',
  defaults: {
    lastUpdate: {},
    autoUpdate: true,
    intervalDays: 30,
    updateOnStartup: true,
    virulencefinderDb: containerVariables.virulencefinderDbDir,
    vfdb: path.join(containerVariables.dbsDir, 'vfdb'),
    abricateDb: path.join(containerVariables.dbsDir, 'abricate'),
    megaresDb: path.join(containerVariables.dbsDir, 'megares'),
    resfinderDb: path.join(containerVariables.dbsDir, 'resfinder'),
    argannotDb: path.join(containerVariables.dbsDir, 'argannot'),
    cardDb: path.join(containerVariables.dbsDir, 'card'),
    amrfinderDb: containerVariables.amrfinderDbDir,
    vfdbSet: 'setA',
    containerName: containerVariables.containerName,
    scriptPathInContainer: '/app/scripts/update_dbs.sh',
  }
});

// Ritorna lo stato di tutti i DB (usato da ipcMain 'db-get-status')
function getDbStatus() {
  const intervalDays = store.get('intervalDays', 30);
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;

  return ALL_DBS.map(db => ({
    name: db,
    lastUpdate: store.get(`lastUpdate.${db}`, null),
    isDue: Date.now() - store.get(`lastUpdate.${db}`, 0) > intervalMs,
    intervalDays,
  }));
}

export { getDbStatus, ALL_DBS };
export default store;