/* Вставить в data.js */
// Data and translations
const L = {
    nl: {
        h: {
            t: "Magisch Schoon, Natuurlijk Puur",
            s: "Professionele stoomreiniging en loodgieterij in heel Antwerpen."
        },
        s: {
            t: "Onze Master Services"
        },
        g: {
            t: "Before & After Gallery"
        },
        e: {
            t: "Expertise & Facts"
        },
        c: {
            t: "Prijscalculator",
            o1: "120°C Stoomreiniging (€85/h)",
            o2: "Nood Loodgieter 24/7 (€120/h)",
            o3: "Kantoor Schoonmaak (€45/h)",
            o4: "Huisreiniging (€35/h)",
            o5: "Horeca / FAVV Ready (€55/h)",
            o6: "Diepe Matrasreiniging (€65/stuk)",
            l1: "Aantal uren",
            f: "Wist je dat stoom op 120°C bacteriën in 1 seconde doodt?"
        },
        msg: "Purrr... Magisch schoon!",
        sv: [
            {t:"Kantoorschoonmaak", d:"Grondige reiniging met milieuvriendelijke producten.", p:"Vanaf €45/u", i:"🧽"},
            {t:"Huisreiniging", d:"Wij stoffen, dweilen en reinigen alles.", p:"Vanaf €35/u", i:"🧹"},
            {t:"120°C Stoom", d:"Doodt 99,9% van bacteriën en huisstofmijten.", p:"Vanaf €85/u", i:"♨️"},
            {t:"Horeca & FAVV", d:"Dieptereiniging van industriële keukens.", p:"Custom Quote", i:"🍽️"},
            {t:"Loodgieter 24/7", d:"Directe hulp bij verstoppingen in Antwerpen.", p:"Vanaf €120/u", i:"🚰"}
        ],
        ex: [
            "120°C stoom vernietigt schimmels.", 
            "90% minder waterverbruik.", 
            "Veilig voor baby's en dieren.", 
            "Verhoogt focus en welzijn.", 
            "Respect voor Antwerps erfgoed.", 
            "Dringt 10cm diep in matrassen."
        ],
        gal: [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500",
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500"
        ],
        cf: [
            "Stoom droogt direct!",
            "Geen chemische geuren.",
            "Voor Ekeren en Merksem!"
        ]
    },
    ru: {
        h: {
            t: "Магия чистоты",
            s: "Профессиональная чистка паром в Антверпене."
        },
        s: {
            t: "Наши Услуги"
        },
        g: {
            t: "Наши Работы"
        },
        e: {
            t: "Факты"
        },
        c: {
            t: "Калькулятор",
            o1: "Пар 120°C (€85/ч)",
            o2: "Сантехника 24/7 (€120/ч)",
            o3: "Офисы (€45/ч)",
            o4: "Дома (€35/ч)",
            o5: "Рестораны (€55/ч)",
            o6: "Матрасы (€65/шт)",
            l1: "Количество часов",
            f: "Пар разрушает ДНК плесени."
        },
        msg: "Мурр... Будет чисто!",
        sv: [
            {t:"Офисы", d:"Эко-продукты для идеального впечатления.", p:"От €45/ч", i:"🧽"},
            {t:"Дома", d:"Берем на себя всё: от полов до кухонь.", p:"От €35/ч", i:"🧹"},
            {t:"Пар 120°C", d:"Убивает 99.9% бактерий и клещей без химии.", p:"От €85/ч", i:"♨️"},
            {t:"Рестораны", d:"Готовим заведение к инспекции FAVV.", p:"По запросу", i:"🍽️"},
            {t:"Сантехника 24/7", d:"Решаем проблемы с засорами в любое время.", p:"От €120/ч", i:"🚰"}
        ],
        ex: [
            "Пар разрушает ДНК плесени.", 
            "Меньше расхода воды.", 
            "Безопасно для детей.", 
            "Улучшает самочувствие.", 
            "Чистим старинные дома.", 
            "Глубокая чистка матрасов."
        ],
        gal: [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500",
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500"
        ],
        cf: [
            "Пар высыхает мгновенно!",
            "Только чистая вода.",
            "Антверпен, Экеран, Мерксем!"
        ]
    },
    en: {
        h: {
            t: "Magically Clean",
            s: "Professional steam cleaning in Antwerp."
        },
        s: {
            t: "Our Services"
        },
        g: {
            t: "Before & After"
        },
        e: {
            t: "Facts"
        },
        c: {
            t: "Calculator",
            o1: "120°C Steam (€85/h)",
            o2: "Plumbing 24/7 (€120/h)",
            o3: "Office Cleaning (€45/h)",
            o4: "Home Cleaning (€35/h)",
            o5: "Horeca & FAVV (€55/h)",
            o6: "Mattress Deep Cleaning (€65/unit)",
            l1: "Number of hours",
            f: "Steam destroys mold."
        },
        msg: "Purrr... So clean!",
        sv: [
            {t:"Office Cleaning", d:"Thorough cleaning using eco-friendly products.", p:"From €45/h", i:"🧽"},
            {t:"Home Cleaning", d:"Every corner gets our full attention.", p:"From €35/h", i:"🧹"},
            {t:"120°C Steam", d:"Kills 99.9% of bacteria without chemicals.", p:"From €85/h", i:"♨️"},
            {t:"Horeca & FAVV", d:"Deep cleaning of industrial kitchens.", p:"Custom Quote", i:"🍽️"},
            {t:"Plumbing 24/7", d:"Blockage? We solve it day and night.", p:"From €120/h", i:"🚰"}
        ],
        ex: [
            "Steam destroys mold.", 
            "Eco-friendly.", 
            "Safe for pets.", 
            "Increases focus.", 
            "Respect for heritage.", 
            "Deep mattress cleaning."
        ],
        gal: [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500",
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500"
        ],
        cf: [
            "Dries instantly!",
            "No chemicals.",
            "Serving all Antwerp!"
        ]
    }
};