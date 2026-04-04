/**
 * TowerRegistry.js — Реєстр усіх башт.
 * Щоб додати нову башту — достатньо одного нового запису тут.
 * Сцени ніколи не містять if (type === 'goose') ланцюжків.
 */
export const TOWERS = {
    goose: {
        key: 'goose',
        name: 'Бойовий Гусак',
        description: 'Швидка маневрена турель. Атакує клювом та гоготом.',
        cost: 50,
        fireRate: 1000,       // мс між пострілами
        damage: 30,           // базовий урон
        bulletSpeed: 550,     // px/s
        bulletColor: 0xffee00,
        bulletSize: 6,        // радіус кола (відображення)
        texture: 'goose'
    },
    borshch: {
        key: 'borshch',
        name: 'Борщова Гармата',
        description: 'Важка артилерія. Заливає ворогів гарячим борщем.',
        cost: 150,
        fireRate: 2500,
        damage: 100,
        bulletSpeed: 300,
        bulletColor: 0x8b0000,
        bulletSize: 12,
        texture: 'borshch'
    }
};

/** Впорядкований масив ключів для рендера інвентарю */
export const TOWER_KEYS = Object.keys(TOWERS);
