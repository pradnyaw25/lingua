// Parallel texts. Each text is sentence-aligned: pairs[i].target lines up with pairs[i].en.
// All texts here are public-domain fables retold in simple prose (safe to publish).
// To add a text: copy a block, keep the alignment 1:1, give it a unique id.
window.TEXTS = [
  {
    id: "fr-corbeau-renard",
    lang: "fr",
    langLabel: "Français",
    title: "Le Corbeau et le Renard",
    source: "Aesop / La Fontaine — retold, public domain",
    level: "A2",
    pairs: [
      { target: `Maître Corbeau, perché sur un arbre, tenait dans son bec un morceau de fromage.`,
        en: `Master Crow, perched on a tree, held a piece of cheese in his beak.` },
      { target: `Maître Renard, attiré par l'odeur, lui parla ainsi.`,
        en: `Master Fox, drawn by the smell, spoke to him thus.` },
      { target: `« Bonjour, Monsieur du Corbeau. Que vous êtes joli ! Que vous me semblez beau ! »`,
        en: `"Good day, Mister Crow. How pretty you are! How handsome you seem to me!"` },
      { target: `« Si votre chant ressemble à votre plumage, vous êtes le plus beau des oiseaux de ces bois. »`,
        en: `"If your song is as fine as your feathers, you are the finest bird in these woods."` },
      { target: `À ces mots, le Corbeau ne se sent plus de joie.`,
        en: `At these words, the Crow could not contain his joy.` },
      { target: `Et, pour montrer sa belle voix, il ouvre un large bec et laisse tomber son fromage.`,
        en: `And, to show off his beautiful voice, he opened his beak wide and let his cheese fall.` },
      { target: `Le Renard s'en saisit et dit : « Tout flatteur vit aux dépens de celui qui l'écoute. »`,
        en: `The Fox snatched it up and said: "Every flatterer lives at the expense of the one who listens to him."` },
      { target: `Le Corbeau, honteux et confus, jura, mais un peu tard, qu'on ne l'y prendrait plus.`,
        en: `The Crow, ashamed and confused, swore, though a little late, that he would not be fooled again.` }
    ]
  },
  {
    id: "fr-lion-souris",
    lang: "fr",
    langLabel: "Français",
    title: "Le Lion et la Souris",
    source: "Aesop — retold, public domain",
    level: "A1",
    pairs: [
      { target: `Un lion dormait quand une petite souris se mit à courir sur lui.`,
        en: `A lion was sleeping when a little mouse began to run over him.` },
      { target: `Le lion se réveilla et attrapa la souris dans sa patte.`,
        en: `The lion woke up and caught the mouse in his paw.` },
      { target: `« Pardon, roi des animaux ! Si tu me laisses partir, un jour je t'aiderai. »`,
        en: `"Forgive me, king of the animals! If you let me go, one day I will help you."` },
      { target: `Le lion rit, mais il la laissa partir.`,
        en: `The lion laughed, but he let her go.` },
      { target: `Quelques jours plus tard, le lion fut pris dans le filet d'un chasseur.`,
        en: `A few days later, the lion was caught in a hunter's net.` },
      { target: `La souris entendit ses rugissements et vint ronger les cordes.`,
        en: `The mouse heard his roars and came to gnaw through the ropes.` },
      { target: `Ainsi, la petite souris sauva le grand lion.`,
        en: `And so the little mouse saved the great lion.` }
    ]
  },
  {
    id: "es-liebre-tortuga",
    lang: "es",
    langLabel: "Español",
    title: "La Liebre y la Tortuga",
    source: "Aesop — retold, public domain",
    level: "A2",
    pairs: [
      { target: `Una liebre se burlaba de una tortuga por lo lenta que era.`,
        en: `A hare was mocking a tortoise for how slow she was.` },
      { target: `La tortuga, cansada de las burlas, la retó a una carrera.`,
        en: `The tortoise, tired of the mockery, challenged her to a race.` },
      { target: `La liebre aceptó, riéndose, segura de ganar.`,
        en: `The hare accepted, laughing, sure she would win.` },
      { target: `Al empezar la carrera, la liebre corrió muy rápido y pronto dejó atrás a la tortuga.`,
        en: `When the race began, the hare ran very fast and soon left the tortoise behind.` },
      { target: `Confiada, decidió descansar bajo un árbol y se quedó dormida.`,
        en: `Confident, she decided to rest under a tree and fell asleep.` },
      { target: `La tortuga, paso a paso, siguió avanzando sin detenerse.`,
        en: `The tortoise, step by step, kept moving forward without stopping.` },
      { target: `Cuando la liebre despertó, vio que la tortuga estaba cerca de la meta.`,
        en: `When the hare woke up, she saw that the tortoise was near the finish line.` },
      { target: `Corrió con todas sus fuerzas, pero ya era demasiado tarde.`,
        en: `She ran with all her might, but it was already too late.` },
      { target: `La tortuga había ganado. Lento pero seguro se gana la carrera.`,
        en: `The tortoise had won. Slow but steady wins the race.` }
    ]
  },
  {
    id: "es-viento-sol",
    lang: "es",
    langLabel: "Español",
    title: "El Viento y el Sol",
    source: "Aesop — retold, public domain",
    level: "A1",
    pairs: [
      { target: `El viento y el sol discutían sobre quién era más fuerte.`,
        en: `The wind and the sun were arguing about which of them was stronger.` },
      { target: `Vieron a un viajero que caminaba con un abrigo.`,
        en: `They saw a traveler walking along in a coat.` },
      { target: `« El que logre quitarle el abrigo será el más fuerte », dijo el sol.`,
        en: `"Whoever manages to take off his coat will be the stronger," said the sun.` },
      { target: `El viento sopló con toda su fuerza.`,
        en: `The wind blew with all its strength.` },
      { target: `Pero cuanto más soplaba, más se abrigaba el viajero.`,
        en: `But the harder it blew, the more tightly the traveler wrapped himself up.` },
      { target: `Entonces el sol brilló con suavidad y calor.`,
        en: `Then the sun shone gently and warmly.` },
      { target: `El viajero, con calor, se quitó el abrigo.`,
        en: `The traveler, feeling hot, took off his coat.` },
      { target: `La suavidad logró lo que la fuerza no pudo.`,
        en: `Gentleness achieved what force could not.` }
    ]
  }
];
