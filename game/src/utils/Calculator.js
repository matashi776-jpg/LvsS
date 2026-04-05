// Scaling formulas as described in the Mega-Prompt
export const Calculator = {
  /** Enemy HP = 100 * 1.18^(wave-1) */
  enemyHP: (wave) => Math.floor(100 * Math.pow(1.18, wave - 1)),

  /** Tower Damage = base * (1 + 0.35 * log2(level + 1)) */
  towerDamage: (base, level) =>
    Math.floor(base * (1 + 0.35 * Math.log2(level + 1))),

  /** Gold reward per enemy type */
  goldReward: (type) => ({ intern: 10, clerk: 20, boss: 50 }[type] ?? 10),

  /** Enemy move speed (px/s) */
  enemySpeed: (type, wave) => {
    const base = { intern: 55, clerk: 80, boss: 38 }[type] ?? 55;
    return base + wave * 2;
  },

  /** Bonus gold on wave clear */
  waveClearBonus: (wave) => wave * 25
};
