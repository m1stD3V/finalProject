import GameScene from './GameScene.js';
import { LEVELS } from '../levelData.js';

export default class Level0Scene extends GameScene {
  constructor() { super('Level0Scene'); }
  getLevelConfig() { return LEVELS[0]; }
}
