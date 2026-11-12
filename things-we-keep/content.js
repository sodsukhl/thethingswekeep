/* =========================================================
   CONTENT — each { ... } block is one trinket.
   photos : slideshow images, in order
   audio  : interview clip (add audioStart / audioEnd in seconds
            to play only part of it)
   ========================================================= */

const TRINKETS = [
  {
    // Jade & Frank — Furby, little animals, LOL doll and Frankenstein (Figma: Group 6)
    image: "assets/trinket-1.png",
    photos: ["assets/image 8.png", "assets/image 9.png", "assets/image 10.png", "assets/image 11.png"],
    audio: "assets/jadeandfrankinterview.mp3",
    x: 279, y: 110, w: 377, h: 165,
    hit: [305, 112, 306, 145],
    title: "Jade & Frank’s Collection",
    owner: "— my best friends, 22 and 23",
    quote: "“It's all love, and I don't really feel any sadness or anything about those types of feelings because everyone collects in different ways and loves their things differently.”",
    p1: "Jade and Frank first bonded over a Draculaura doll Frank was holding when they met. They've gifted each other collectibles ever since, so many pieces are reminders of their relationship. A favourite is the Frightfully Tall Elissabat Frank gave Jade, after Jade thought they'd never complete their collection.",
    p2: "They love the thrill of finding something rare at a good price and bringing it home. Together, their shelves are a collage of everything they've loved. Some see clutter, but they embrace maximalism: every item has meaning."
  },
  {
    // Nana — comic books (Figma: Group 7)
    image: "assets/trinket-2.png",
    photos: ["assets/image 3.png", "assets/image 4.png", "assets/image 5.png", "assets/image 6.png", "assets/image 7.png"],
    audio: "assets/nanainterview.mp3",
    x: 198, y: 136, w: 95, h: 110,
    hit: [200, 136, 93, 110],
    title: "Nana’s Collection",
    owner: "— my childhood best friend, 23",
    quote: "“It's not just like stuff to me… Especially music and like comic books and media, that's like culture. Why not make meaning out of some stuff? If it makes you happy, that's like your life.”",
    p1: "Nana has collected comic books since middle school, starting with compiled volumes before moving on to single issues. Many remind them of reading on the commute to school and university. A special find: Doom Patrol: Mixtape by Gerard Way, discovered at a flea market.",
    p2: "Their room is also full of plushies, keychains and other memorabilia. Being surrounded by things they love makes them feel safe, especially when they feel alone or can't sleep. Preserving physical media gives it meaning beyond its material value."
  },
  {
    // Ryan — Pokémon cards (Figma: image 35)
    image: "assets/trinket-3.png",
    photos: ["assets/image 12.png"],
    audio: "assets/ryaninterview.mp3",
    x: 222, y: 363, w: 121, h: 121,
    hit: [230, 386, 104, 76],
    title: "Ryan’s Collection",
    owner: "— my boyfriend, 22",
    quote: "“I guess I think novelty is the right word, but you just basically learn more about things and you learn more about yourself. The collection is just the process of that.”",
    p1: "Ryan collects video games and memorabilia, from figures to trading cards and Pokémon cards. It started with Skylanders as a kid: showing off new characters at friends' houses, trading and playing together. A special piece is his first Pokémon booster box, bought with his own money after starting his career.",
    p2: "To Ryan, collecting is self-expression and exploration, discovering new things within interests he already loves. He's sometimes doubted impulse buys, or whether a new interest is just a phase, but collecting keeps him exploring his hobbies and who he is."
  },
  {
    // Jassu — white swirl (Figma: image 36)
    image: "assets/trinket-4.png",
    photos: ["assets/image 1.png"],
    audio: "assets/jasinterview.mp3",
    x: 290, y: 287, w: 255, h: 255,
    hit: [342, 360, 150, 86],
    title: "Jassu’s Collection",
    owner: "— my younger sister, 15",
    quote: "“But honest, I just like collecting… I know that this is my interest and it might not interest them, and that's not my problem.”",
    p1: "Jassu collects memorabilia from her favourite K-pop groups, video games and anime. Her favourite is aespa, a four-member girl group, and she has an abundance of their albums, posters and photocards.",
    p2: "She talked about how competitive K-pop collecting can be, where whoever spends the most gets validated as the bigger fan. Still, looking at her favourite things brings her comfort in the downtime from a busy school schedule."
  },
  {
    // Juni — doll in the green dress (Figma: image 37)
    image: "assets/trinket-5.png",
    photos: ["assets/image 2.png"],
    audio: "assets/juniinterview.mp3",
    x: 490, y: 337, w: 134, h: 134,
    hit: [506, 334, 98, 128],
    title: "Juni’s Collection",
    owner: "— one of my best friends, 22",
    quote: "“This doll reminds me that people care, which I know, but the doll reminds me that people care.”",
    p1: "Juni has collected Monster High dolls since they first came out, when Juni was six or seven, and almost every family member has gifted or helped choose one. Their Afro Venus from the Fearbook Collection was a surprise from their parents, on a trip Juni couldn't join while struggling with their health.",
    p2: "To Juni, the dolls are reminders that people care, and they love seeing more dolls with textured hair. Some call the collection childish, clutter or a waste of money, but it holds years of memories that can't be measured by price."
  }
];

/* The narrator line in the bottom bar, for each moment */
const PROMPTS = {
  hallway:  "> click the door to enter the bedroom.",
  bedroom:  "> click the items to learn more..",
  reading:  "> close the note when you're ready.",
  complete: "> every trinket is in colour now. you feel a sense of comfort."
};

/* The opening lines, shown one at a time before the title card.
   Each line stays until the visitor clicks. Edit freely. */
const INTRO_LINES = [
  "i've kept things my whole life.",
  "Plushies, Charms, Dolls, Movies",
  "i thought everyone did.",
  "then i was told i was too old for “toys.”",
  "but the people who understood me kept things too.",
  "so i asked them why."
];

const INTRO_PROMPTS = {
  intro: "> click to continue reading..",
  title: "> click to begin.."
};

/* The closing letter inside the chest (appears at the very end).
   Add as many paragraphs as you like — each "..." is one paragraph. */
const LETTER = {
  title: "",
  paragraphs: [
    "Thank you to everyone who agreed to be a part of the interviews and thank you for playing my little point and click style project.",
    "As someone who\u2019s collected things and found comfort in things her whole life, I kind of assumed that everyone was that way. And most people are. But there\u2019s pretty big differences that I could not ignore as I got older. Most girls my age would eventually swap their barbies for makeup and clothes. I swapped my barbies for more niche collectible charms and anime girl figurines. I did not find it odd until my mom would come into my room, berating me about how I am too old to be having such childish interests and \u201ctoys\u201d in here. As I neared the end of high school, my differences in being became more apparent, the only friends I had around me were those who were diagnosed with Autism, ADHD, or had other types of neurodivergence. They were the only people who I could feel close to, who would understand me. They\u2019d listen to me about my interests and understand my home life, why I am the way I am. Being in a better spot than I was in high school with way more friends now I have noticed that they all share types of traumas and neurodivergence with each other. All of my friends collect trinkets and items that most neurotypical people don\u2019t bother with. They fill shelves with their items, some of my friends bring items around with them for comfort on their day-to-day errands.",
    "So my question was why do neurodivergent people find comfort in collecting certain trinkets? I still don\u2019t know why it\u2019s something we do, but I am so glad to have met people who just get it. I will continue to do the things that make me happy because life is really about the small joys. I will continue to enjoy my hobbies with the important people I surround myself with. They are what I want to keep with me, always <3."
  ],
  signature: "-Suki"
};

/* Extra narrator lines for the ending */
PROMPTS.chest = "> something appeared on the floor..";
PROMPTS.letter = "> a little note, just for you.";
