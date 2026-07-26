// Curated thematic sections for quick access, per language.
// These complement the frequency list (data/vocab.js) — they include words a learner
// wants grouped (numbers, days, colors…) even when they're not in the top-1000.
// Grammar sections (Adjectives, Verbs, Nouns, Adverbs) are generated automatically from
// the frequency list's `pos` field in js/vocab.js — don't add them here.
window.CATEGORIES = {
  fr: [
    { id: "numbers", label: "Numbers", icon: "🔢", words: [
      { word: "zéro", en: "zero" }, { word: "un", en: "one" }, { word: "deux", en: "two" },
      { word: "trois", en: "three" }, { word: "quatre", en: "four" }, { word: "cinq", en: "five" },
      { word: "six", en: "six" }, { word: "sept", en: "seven" }, { word: "huit", en: "eight" },
      { word: "neuf", en: "nine" }, { word: "dix", en: "ten" }, { word: "onze", en: "eleven" },
      { word: "douze", en: "twelve" }, { word: "treize", en: "thirteen" }, { word: "quatorze", en: "fourteen" },
      { word: "quinze", en: "fifteen" }, { word: "seize", en: "sixteen" }, { word: "dix-sept", en: "seventeen" },
      { word: "dix-huit", en: "eighteen" }, { word: "dix-neuf", en: "nineteen" }, { word: "vingt", en: "twenty" },
      { word: "trente", en: "thirty" }, { word: "quarante", en: "forty" }, { word: "cinquante", en: "fifty" },
      { word: "soixante", en: "sixty" }, { word: "soixante-dix", en: "seventy" }, { word: "quatre-vingts", en: "eighty" },
      { word: "quatre-vingt-dix", en: "ninety" }, { word: "cent", en: "one hundred" }, { word: "mille", en: "one thousand" }
    ]},
    { id: "questions", label: "Questions", icon: "❓", words: [
      { word: "qui", en: "who" }, { word: "que / quoi", en: "what" }, { word: "où", en: "where" },
      { word: "quand", en: "when" }, { word: "pourquoi", en: "why" }, { word: "comment", en: "how" },
      { word: "combien", en: "how much, how many" }, { word: "quel / quelle", en: "which, what" },
      { word: "est-ce que", en: "(question marker)" }
    ]},
    { id: "adjectives", label: "Adjectives", icon: "▧", words: [
      { word: "grand", en: "big, tall" }, { word: "petit", en: "small" }, { word: "bon", en: "good" },
      { word: "mauvais", en: "bad" }, { word: "beau", en: "beautiful" }, { word: "laid", en: "ugly" },
      { word: "nouveau", en: "new" }, { word: "vieux", en: "old" }, { word: "jeune", en: "young" },
      { word: "chaud", en: "hot, warm" }, { word: "froid", en: "cold" }, { word: "long", en: "long" },
      { word: "court", en: "short" }, { word: "facile", en: "easy" }, { word: "difficile", en: "difficult" },
      { word: "heureux", en: "happy" }, { word: "triste", en: "sad" }, { word: "fort", en: "strong" },
      { word: "faible", en: "weak" }, { word: "rapide", en: "fast" }, { word: "lent", en: "slow" },
      { word: "riche", en: "rich" }, { word: "pauvre", en: "poor" }, { word: "propre", en: "clean" },
      { word: "sale", en: "dirty" }, { word: "plein", en: "full" }, { word: "vide", en: "empty" },
      { word: "important", en: "important" }, { word: "vrai", en: "true" }, { word: "faux", en: "false" }
    ]},
    { id: "verbs", label: "Verbs", icon: "▷", words: [
      { word: "être", en: "to be" }, { word: "avoir", en: "to have" }, { word: "aller", en: "to go" },
      { word: "faire", en: "to do, to make" }, { word: "dire", en: "to say" }, { word: "pouvoir", en: "to be able to" },
      { word: "vouloir", en: "to want" }, { word: "savoir", en: "to know" }, { word: "voir", en: "to see" },
      { word: "venir", en: "to come" }, { word: "prendre", en: "to take" }, { word: "donner", en: "to give" },
      { word: "parler", en: "to speak" }, { word: "aimer", en: "to love, to like" }, { word: "manger", en: "to eat" },
      { word: "boire", en: "to drink" }, { word: "dormir", en: "to sleep" }, { word: "comprendre", en: "to understand" },
      { word: "apprendre", en: "to learn" }, { word: "écrire", en: "to write" }, { word: "lire", en: "to read" },
      { word: "entendre", en: "to hear" }, { word: "sortir", en: "to go out" }, { word: "acheter", en: "to buy" },
      { word: "trouver", en: "to find" }, { word: "penser", en: "to think" }, { word: "croire", en: "to believe" },
      { word: "vivre", en: "to live" }
    ]},
    { id: "colors", label: "Colors", icon: "🎨", words: [
      { word: "rouge", en: "red" }, { word: "bleu", en: "blue" }, { word: "vert", en: "green" },
      { word: "jaune", en: "yellow" }, { word: "orange", en: "orange" }, { word: "rose", en: "pink" },
      { word: "violet", en: "purple" }, { word: "marron", en: "brown" }, { word: "noir", en: "black" },
      { word: "blanc", en: "white" }, { word: "gris", en: "grey" }
    ]},
    { id: "days", label: "Days", icon: "📅", words: [
      { word: "lundi", en: "Monday" }, { word: "mardi", en: "Tuesday" }, { word: "mercredi", en: "Wednesday" },
      { word: "jeudi", en: "Thursday" }, { word: "vendredi", en: "Friday" }, { word: "samedi", en: "Saturday" },
      { word: "dimanche", en: "Sunday" }
    ]},
    { id: "months", label: "Months", icon: "🗓️", words: [
      { word: "janvier", en: "January" }, { word: "février", en: "February" }, { word: "mars", en: "March" },
      { word: "avril", en: "April" }, { word: "mai", en: "May" }, { word: "juin", en: "June" },
      { word: "juillet", en: "July" }, { word: "août", en: "August" }, { word: "septembre", en: "September" },
      { word: "octobre", en: "October" }, { word: "novembre", en: "November" }, { word: "décembre", en: "December" }
    ]},
    { id: "family", label: "Family", icon: "👪", words: [
      { word: "famille", en: "family" }, { word: "mère", en: "mother" }, { word: "père", en: "father" },
      { word: "parents", en: "parents" }, { word: "fils", en: "son" }, { word: "fille", en: "daughter, girl" },
      { word: "frère", en: "brother" }, { word: "sœur", en: "sister" }, { word: "grand-mère", en: "grandmother" },
      { word: "grand-père", en: "grandfather" }, { word: "oncle", en: "uncle" }, { word: "tante", en: "aunt" },
      { word: "mari", en: "husband" }, { word: "femme", en: "wife, woman" }
    ]},
    { id: "greetings", label: "Greetings", icon: "👋", words: [
      { word: "bonjour", en: "hello, good day" }, { word: "bonsoir", en: "good evening" }, { word: "salut", en: "hi, bye" },
      { word: "au revoir", en: "goodbye" }, { word: "à bientôt", en: "see you soon" }, { word: "merci", en: "thank you" },
      { word: "de rien", en: "you're welcome" }, { word: "s'il vous plaît", en: "please" }, { word: "pardon", en: "excuse me, sorry" },
      { word: "oui", en: "yes" }, { word: "non", en: "no" }, { word: "comment ça va ?", en: "how are you?" }
    ]}
  ],
  es: [
    { id: "numbers", label: "Numbers", icon: "🔢", words: [
      { word: "cero", en: "zero" }, { word: "uno", en: "one" }, { word: "dos", en: "two" },
      { word: "tres", en: "three" }, { word: "cuatro", en: "four" }, { word: "cinco", en: "five" },
      { word: "seis", en: "six" }, { word: "siete", en: "seven" }, { word: "ocho", en: "eight" },
      { word: "nueve", en: "nine" }, { word: "diez", en: "ten" }, { word: "once", en: "eleven" },
      { word: "doce", en: "twelve" }, { word: "trece", en: "thirteen" }, { word: "catorce", en: "fourteen" },
      { word: "quince", en: "fifteen" }, { word: "dieciséis", en: "sixteen" }, { word: "diecisiete", en: "seventeen" },
      { word: "dieciocho", en: "eighteen" }, { word: "diecinueve", en: "nineteen" }, { word: "veinte", en: "twenty" },
      { word: "treinta", en: "thirty" }, { word: "cuarenta", en: "forty" }, { word: "cincuenta", en: "fifty" },
      { word: "sesenta", en: "sixty" }, { word: "setenta", en: "seventy" }, { word: "ochenta", en: "eighty" },
      { word: "noventa", en: "ninety" }, { word: "cien", en: "one hundred" }, { word: "mil", en: "one thousand" }
    ]},
    { id: "questions", label: "Questions", icon: "❓", words: [
      { word: "quién", en: "who" }, { word: "qué", en: "what" }, { word: "dónde", en: "where" },
      { word: "cuándo", en: "when" }, { word: "por qué", en: "why" }, { word: "cómo", en: "how" },
      { word: "cuánto", en: "how much, how many" }, { word: "cuál", en: "which" }
    ]},
    { id: "adjectives", label: "Adjectives", icon: "▧", words: [
      { word: "grande", en: "big, large" }, { word: "pequeño", en: "small" }, { word: "bueno", en: "good" },
      { word: "malo", en: "bad" }, { word: "bonito", en: "pretty" }, { word: "feo", en: "ugly" },
      { word: "nuevo", en: "new" }, { word: "viejo", en: "old" }, { word: "joven", en: "young" },
      { word: "caliente", en: "hot" }, { word: "frío", en: "cold" }, { word: "largo", en: "long" },
      { word: "corto", en: "short" }, { word: "fácil", en: "easy" }, { word: "difícil", en: "difficult" },
      { word: "feliz", en: "happy" }, { word: "triste", en: "sad" }, { word: "fuerte", en: "strong" },
      { word: "débil", en: "weak" }, { word: "rápido", en: "fast" }, { word: "lento", en: "slow" },
      { word: "rico", en: "rich" }, { word: "pobre", en: "poor" }, { word: "limpio", en: "clean" },
      { word: "sucio", en: "dirty" }, { word: "lleno", en: "full" }, { word: "vacío", en: "empty" },
      { word: "importante", en: "important" }, { word: "verdadero", en: "true" }, { word: "falso", en: "false" }
    ]},
    { id: "verbs", label: "Verbs", icon: "▷", words: [
      { word: "ser", en: "to be" }, { word: "estar", en: "to be" }, { word: "tener", en: "to have" },
      { word: "hacer", en: "to do, to make" }, { word: "ir", en: "to go" }, { word: "decir", en: "to say" },
      { word: "poder", en: "to be able to" }, { word: "querer", en: "to want, to love" }, { word: "saber", en: "to know" },
      { word: "ver", en: "to see" }, { word: "venir", en: "to come" }, { word: "tomar", en: "to take" },
      { word: "dar", en: "to give" }, { word: "hablar", en: "to speak" }, { word: "gustar", en: "to like" },
      { word: "comer", en: "to eat" }, { word: "beber", en: "to drink" }, { word: "dormir", en: "to sleep" },
      { word: "entender", en: "to understand" }, { word: "aprender", en: "to learn" }, { word: "escribir", en: "to write" },
      { word: "leer", en: "to read" }, { word: "oír", en: "to hear" }, { word: "salir", en: "to go out" },
      { word: "comprar", en: "to buy" }, { word: "encontrar", en: "to find" }, { word: "pensar", en: "to think" },
      { word: "creer", en: "to believe" }, { word: "vivir", en: "to live" }
    ]},
    { id: "colors", label: "Colors", icon: "🎨", words: [
      { word: "rojo", en: "red" }, { word: "azul", en: "blue" }, { word: "verde", en: "green" },
      { word: "amarillo", en: "yellow" }, { word: "naranja", en: "orange" }, { word: "rosa", en: "pink" },
      { word: "morado", en: "purple" }, { word: "marrón", en: "brown" }, { word: "negro", en: "black" },
      { word: "blanco", en: "white" }, { word: "gris", en: "grey" }
    ]},
    { id: "days", label: "Days", icon: "📅", words: [
      { word: "lunes", en: "Monday" }, { word: "martes", en: "Tuesday" }, { word: "miércoles", en: "Wednesday" },
      { word: "jueves", en: "Thursday" }, { word: "viernes", en: "Friday" }, { word: "sábado", en: "Saturday" },
      { word: "domingo", en: "Sunday" }
    ]},
    { id: "months", label: "Months", icon: "🗓️", words: [
      { word: "enero", en: "January" }, { word: "febrero", en: "February" }, { word: "marzo", en: "March" },
      { word: "abril", en: "April" }, { word: "mayo", en: "May" }, { word: "junio", en: "June" },
      { word: "julio", en: "July" }, { word: "agosto", en: "August" }, { word: "septiembre", en: "September" },
      { word: "octubre", en: "October" }, { word: "noviembre", en: "November" }, { word: "diciembre", en: "December" }
    ]},
    { id: "family", label: "Family", icon: "👪", words: [
      { word: "familia", en: "family" }, { word: "madre", en: "mother" }, { word: "padre", en: "father" },
      { word: "padres", en: "parents" }, { word: "hijo", en: "son" }, { word: "hija", en: "daughter" },
      { word: "hermano", en: "brother" }, { word: "hermana", en: "sister" }, { word: "abuela", en: "grandmother" },
      { word: "abuelo", en: "grandfather" }, { word: "tío", en: "uncle" }, { word: "tía", en: "aunt" },
      { word: "esposo", en: "husband" }, { word: "esposa", en: "wife" }
    ]},
    { id: "greetings", label: "Greetings", icon: "👋", words: [
      { word: "hola", en: "hello, hi" }, { word: "buenos días", en: "good morning" }, { word: "buenas noches", en: "good night" },
      { word: "adiós", en: "goodbye" }, { word: "hasta luego", en: "see you later" }, { word: "gracias", en: "thank you" },
      { word: "de nada", en: "you're welcome" }, { word: "por favor", en: "please" }, { word: "perdón", en: "excuse me, sorry" },
      { word: "sí", en: "yes" }, { word: "no", en: "no" }, { word: "¿cómo estás?", en: "how are you?" }
    ]}
  ]
};
