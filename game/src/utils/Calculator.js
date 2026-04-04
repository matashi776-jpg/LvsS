/**
 * Calculator.js — Математичне ядро гри.
 * Всі ігрові формули централізовані тут, щоб уникнути
 * магічних чисел у сценах.
 */
export class Calculator {
    /**
     * Здоров'я ворога: 100 × 1.2^(хвиля−1)
     * Експоненційний ріст — бюрократи товщають швидко.
     * @param {number} wave — поточна хвиля (1-based)
     */
    static getEnemyHealth(wave) {
        return Math.floor(100 * Math.pow(1.2, wave - 1));
    }

    /**
     * Урон вежі: base × (1 + 0.4 × log₂(рівень + 1))
     * Логарифмічний ріст — прокачка відчутна, але не ламає баланс.
     * @param {number} baseDmg — базовий урон із TowerRegistry
     * @param {number} level   — рівень вежі (мінімум 1)
     */
    static getTowerDamage(baseDmg, level) {
        return Math.floor(baseDmg * (1 + 0.4 * Math.log2(level + 1)));
    }

    /**
     * Нагорода за знищеного «заочника».
     * @param {number} wave — поточна хвиля
     */
    static getGoldReward(wave) {
        return Math.floor(15 + 5 * Math.sqrt(wave));
    }
}
