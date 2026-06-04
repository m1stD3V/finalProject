import GameScene from './GameScene.js';
import { LEVELS } from '../levelData.js';

export default class Level2Scene extends GameScene {
  constructor() { super('Level2Scene'); }
  getLevelConfig() { return LEVELS[2]; }
}
