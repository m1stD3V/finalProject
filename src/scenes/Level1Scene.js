import GameScene from './GameScene.js';
import { LEVELS } from '../levelData.js';

export default class Level1Scene extends GameScene {
  constructor() { super('Level1Scene'); }
  getLevelConfig() { return LEVELS[1]; }
}
