export const CONFIG = {
  width: 800,
  height: 600,

  // Lane Y positions
  lanes: [150, 300, 450],

  // X positions
  heroX: 55,
  gooseStartX: 200,
  enemySpawnX: 830,
  baseX: 40,           // enemy reaching this X triggers damage

  // Goose unit
  goose: {
    damage: 15,
    fireRate: 1500,    // ms between shots
    cost: 75           // gold to place extra goose
  },

  // Hero ability – Medical Ointment
  ability: {
    cost: 100,
    duration: 5000,
    fireRateMultiplier: 2
  },

  // Bureaucrat speech phrases (secular / administrative satire only)
  phrases: [
    'Где справка №404?',
    'У нас обед!',
    'Приходите завтра!',
    'Не мой вопрос!',
    'Запись закрыта!',
    'Нужна печать №7!'
  ],

  // Initial state
  startGold: 150,
  startHealth: 10,

  // Fallback palette (no images)
  colors: {
    hero:       0xA0522D,
    heroSpear:  0xC0C0C0,
    goose:      0xFFFFFF,
    gooseBeak:  0xFFA500,
    borshch:    0xCC2222,
    intern:     0x3355BB,
    clerk:      0x338833,
    boss:       0xAA1111
  }
};
