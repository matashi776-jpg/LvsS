# Lanchyn vs Savok 🏡⚔️

Сатиричний Tower Defense на **Phaser 3 + Vite**.

Ніка (після важких змін у синагозі та з болем у коліні) захищає свій Хутір від армії безликих бюрократів-заочників.

---

## Запуск

```bash
cd game
npm install
npm run dev       # http://localhost:3000
npm run build     # збірка у game/dist/
```

---

## Структура проекту

```
game/
├── main.js                    # Точка входу Vite
├── index.html
├── vite.config.js
├── public/
│   ├── goose.png              # Спрайт Бойового Гусака
│   └── borshch.png            # Спрайт Борщової Гармати
└── src/
    ├── data/
    │   └── TowerRegistry.js   # Реєстр усіх веж (єдине місце додавання нових)
    ├── utils/
    │   └── Calculator.js      # Математичне ядро: HP, урон, нагорода
    ├── logic/
    │   └── WaveManager.js     # Стан-машина хвиль
    └── scenes/
        ├── PreloadScene.js    # Завантаження ассетів + fallback-текстури
        ├── KhutirScene.js     # Головне меню
        ├── BattleScene.js     # Оркестратор бою
        └── UIScene.js         # HUD + Drag & Drop інвентар (overlay)
```

---

## Архітектурні рішення

| Проблема | Рішення |
|---|---|
| Витік памʼяті (снаряди) | Object Pool: `physics.add.group({ classType, maxSize: 80 })` |
| `destroy()` у overlap callback | `killAndHide()` + `body.enable = false` → відкладений `delayedCall(0, destroy)` |
| `alert()` у `update()` | In-game overlay + `scene.start('KhutirScene')` з затримкою |
| Магічні числа в сценах | Вся математика у `Calculator.js`, всі дані веж у `TowerRegistry.js` |
| `registry.set` після `new Phaser.Game` | `callbacks.preBoot` гарантує порядок ініціалізації |
| Крос-сцен витік слухачів | `events.once('shutdown', cleanup)` у `UIScene` |
| Мутація масиву під час ітерації | `filter()` збирає кандидатів, потім окремий `forEach` |

---

## Додавання нової вежі

1. Додати запис у `src/data/TowerRegistry.js`
2. Покласти `mytower.png` у `public/`
3. **Більше нічого не змінювати** — `UIScene` та `BattleScene` підхоплять автоматично

---

## Ассети

Покладіть спрайти у папку `game/public/`:

- `goose.png` — Бойовий Гусак
- `borshch.png` — Борщова Гармата

Якщо файли відсутні — `PreloadScene` генерує кольорові прямокутники-замінники.
