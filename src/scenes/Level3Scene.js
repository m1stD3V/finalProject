import GameScene from './GameScene.js';
import { LEVELS } from '../levelData.js';

export default class Level3Scene extends GameScene {
  constructor() { super('Level3Scene'); }
  getLevelConfig() { return LEVELS[3]; }
}
