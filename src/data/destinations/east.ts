import type { Place } from "@/types";

export const eastPlaces: Place[] = [
  // WEST BENGAL
  {
    id: "darjeeling-toy-train-tiger-hill",
    name: "Darjeeling Himalayan Railway & Tiger Hill",
    state: "west-bengal",
    category: "iconic",
    shortDesc: "UNESCO heritage steam train chugging past tea gardens and sunrise over Mount Kanchenjunga (8,586 m).",
    whyVisit: "Engineered in 1881, the narrow-gauge 'Toy Train' ascends from the plains through loops and zig-zags to Ghoom (7,407 ft). Tiger Hill offers the magical sight of the first dawn rays illuminating Kanchenjunga and Mount Everest in crimson gold.",
    bestTimeToVisit: "March to May (magnolias and rhododendrons) and October to December (crystal clear skies)",
    howToReach: "70 km from Bagdogra Airport (IXB) and New Jalpaiguri (NJP) Railway Station.",
    entryInfo: "Joyride steam train tickets approx INR 1,500; Tiger Hill observatory pass INR 50-100.",
    travelerTip: "Arrive at Tiger Hill by 4:30 AM with a warm woolen shawl and enjoy a hot cup of first-flush Darjeeling Muscatel tea at Batasia Loop.",
    tags: ["High Altitude", "Scenic", "Heritage", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Darjeeling_Himalayan_Railway%2C_Batasia_Loop.jpg/1280px-Darjeeling_Himalayan_Railway%2C_Batasia_Loop.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Darjeeling_Himalayan_Railway%2C_Batasia_Loop.jpg",
                "title": "Darjeeling Himalayan Railway, Batasia Loop",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 27.036, lng: 88.2627 },
    featured: true,
  },
  {
    id: "sundarbans-tiger-reserve",
    name: "Sundarbans National Park (Mangrove Delta)",
    state: "west-bengal",
    category: "iconic",
    shortDesc: "The world's largest halophytic mangrove forest and the swimming Royal Bengal Tiger biosphere.",
    whyVisit: "A UNESCO World Heritage sanctuary spanning the Ganges-Brahmaputra delta. Travel exclusively by motorized wooden safari boats through tidal creeks to spot estuarine crocodiles, spotted deer, and the elusive Royal Bengal Tiger.",
    bestTimeToVisit: "November to March",
    howToReach: "Drive 100 km from Kolkata to Godkhali port, followed by guided boat cruises into the delta.",
    entryInfo: "Entry permit and boat guide charges organized via West Bengal Forest Department.",
    travelerTip: "Climb the Sajnekhali and Dobanki watchtowers for elevated views above the dense sundari mangrove canopy.",
    tags: ["Wildlife", "Nature", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Royal_Bengal_Tiger_walking_in_Sundarbans.jpg/1280px-Royal_Bengal_Tiger_walking_in_Sundarbans.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Royal_Bengal_Tiger_walking_in_Sundarbans.jpg",
                "title": "Royal Bengal Tiger walking in Sundarbans",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 21.9497, lng: 88.8999 },
  },
  {
    id: "bishnupur-terracotta",
    name: "Bishnupur Terracotta Temples",
    state: "west-bengal",
    category: "hidden",
    shortDesc: "17th-century curved-roof terracotta shrines adorned with thousands of baked red-clay mythological friezes.",
    whyVisit: "Under the Malla kings, Bishnupur became Bengal's cultural capital. Because stone was scarce in the delta, architects used local alluvial clay to craft the Jor Bangla, Rasmancha, and Shyam Rai temples.",
    bestTimeToVisit: "October to March",
    howToReach: "140 km northwest of Kolkata (approx 3.5 hours train or road journey).",
    entryInfo: "Composite ticket INR 25 for Indians, INR 300 for foreigners.",
    travelerTip: "Shop for authentic handloom Baluchari silk sarees and hand-carved Bankura terracotta long-eared clay horses directly from artisan looms.",
    tags: ["Heritage", "Architecture", "Culture"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Terracotta_work_on_Jor_Bangla_Temple_Bishnupur.jpg/1280px-Terracotta_work_on_Jor_Bangla_Temple_Bishnupur.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Terracotta_work_on_Jor_Bangla_Temple_Bishnupur.jpg",
                "title": "Terracotta work on Jor Bangla Temple Bishnupur",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 23.0673, lng: 87.3195 },
  },

  // ODISHA
  {
    id: "konark-sun-temple",
    name: "Konark Sun Temple (Black Pagoda)",
    state: "odisha",
    category: "iconic",
    shortDesc: "A colossal 13th-century UNESCO stone chariot of Surya with 24 carved sundial wheels pulled by seven horses.",
    whyVisit: "Conceived as the cosmic chariot of the Sun God Surya, each 10-foot stone wheel serves as an accurate sundial capable of calculating time down to the minute by shadow alignment.",
    bestTimeToVisit: "October to March (Konark Dance Festival in December)",
    howToReach: "35 km from Puri; 65 km from Biju Patnaik International Airport (BBI), Bhubaneswar.",
    entryInfo: "INR 40 for Indians, INR 600 for foreigners.",
    travelerTip: "Hire an ASI-certified guide to demonstrate how to read the exact time using the spokes and bead carvings on the main wheels.",
    tags: ["Heritage", "Architecture", "Culture", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konarka_Temple.jpg/1280px-Konarka_Temple.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Konarka_Temple.jpg",
                "title": "Konarka Temple",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 19.8876, lng: 86.0945 },
    featured: true,
  },
  {
    id: "chilika-lake-manglajodi",
    name: "Chilika Lake & Mangalajodi Wetland",
    state: "odisha",
    category: "hidden",
    shortDesc: "Asia's largest brackish coastal lagoon hosting rare Irrawaddy dolphins and a million winter migratory birds.",
    whyVisit: "Mangalajodi on the northern edge of Chilika is an eco-tourism success story where former poachers now operate silent wooden poled boats to guide visitors within inches of nesting purple swamphens and flamingos.",
    bestTimeToVisit: "November to February",
    howToReach: "70 km from Bhubaneswar via NH-16; Satapada is 50 km from Puri.",
    entryInfo: "Mangalajodi boat safari approx INR 1,200-1,800 per boat for 2 hours.",
    travelerTip: "Visit Satapada at the sea mouth early in the morning to see wild Irrawaddy dolphins breaching in the open water.",
    tags: ["Wildlife", "Nature", "Photography", "Scenic"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Chilika_Lake_Mangalajodi_Birds.jpg/1280px-Chilika_Lake_Mangalajodi_Birds.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Chilika_Lake_Mangalajodi_Birds.jpg",
                "title": "Chilika Lake Mangalajodi Birds",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 19.7183, lng: 85.3218 },
  },

  // BIHAR
  {
    id: "mahabodhi-bodh-gaya",
    name: "Mahabodhi Temple Complex, Bodh Gaya",
    state: "bihar",
    category: "iconic",
    shortDesc: "The sacred UNESCO epicenter of Buddhism where Siddhartha Gautama attained supreme enlightenment under the Bodhi Tree.",
    whyVisit: "Enshrines the direct descendant of the original sacred Peepal tree (Ficus religiosa) and the 50-meter pyramidal brick temple dating to the 5th-6th century CE, attracting monks from around the globe.",
    bestTimeToVisit: "October to March",
    howToReach: "12 km from Gaya International Airport (GAY); 16 km from Gaya Junction railway station.",
    entryInfo: "Free entry; mobile phone storage fee INR 20.",
    travelerTip: "Sit in silent meditation under the southern boughs of the sacred Bodhi tree at dusk during the evening monk chanting.",
    tags: ["Spiritual", "Heritage", "Architecture", "Culture"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mahabodhitemple.jpg/1280px-Mahabodhitemple.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mahabodhitemple.jpg",
                "title": "Mahabodhitemple",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 24.696, lng: 84.9914 },
    featured: true,
  },
  {
    id: "nalanda-university-ruins",
    name: "Nalanda Mahavihara Ancient University Ruins",
    state: "bihar",
    category: "iconic",
    shortDesc: "The world's oldest residential university (5th-12th century CE) that housed 10,000 scholars and 9 million manuscripts.",
    whyVisit: "A UNESCO World Heritage marvel featuring red brick monasteries, stupas, meditation cells, and ancient drainage systems where scholars like Xuanzang studied astronomy, logic, and medicine.",
    bestTimeToVisit: "November to March",
    howToReach: "15 km from Rajgir; 90 km southeast of Patna Airport (PAT).",
    entryInfo: "INR 40 for Indians, INR 600 for foreigners.",
    travelerTip: "Walk the central monastic avenue and visit the on-site Archaeological Museum to view bronzes, seals, and stone statues unearthed during excavations.",
    tags: ["Heritage", "Architecture", "Culture"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Temple_No.-_3_Nalanda.jpg/1280px-Temple_No.-_3_Nalanda.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Temple_No.-_3_Nalanda.jpg",
                "title": "Temple No.- 3 Nalanda",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 25.1357, lng: 85.445 },
  },

  // JHARKHAND
  {
    id: "netarhat-queen-chotanagpur",
    name: "Netarhat (Queen of Chotanagpur)",
    state: "jharkhand",
    category: "iconic",
    shortDesc: "A tranquil hill station surrounded by dense sal forests, pear orchards, and the dramatic Magnolia Sunset Point.",
    whyVisit: "Perched at 3,600 feet on the Chotanagpur plateau, Netarhat offers cool mountain breezes, cascading waterfalls like Lower Ghaghri, and panoramic cliff vistas stretching across deep jungle valleys.",
    bestTimeToVisit: "October to March",
    howToReach: "155 km west of Ranchi Airport (IXR); accessible via scenic forest highway.",
    entryInfo: "Free access.",
    travelerTip: "Head to Magnolia Point 45 minutes before sunset to watch the sun dip below the rolling Sal forest horizons.",
    tags: ["Nature", "Scenic", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Pine_trees_of_Netarhat.jpg/1280px-Pine_trees_of_Netarhat.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pine_trees_of_Netarhat.jpg",
                "title": "Pine trees of Netarhat",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 23.4795, lng: 84.2694 },
    featured: true,
  },
  {
    id: "betla-national-park",
    name: "Betla National Park & Palamau Fort",
    state: "jharkhand",
    category: "hidden",
    shortDesc: "Jharkhand's premier tiger reserve harboring wild elephant herds, leopards, and crumbling 16th-century tribal Chero forts.",
    whyVisit: "Betla holds historical significance as the location where the world's first tiger census by pugmark count was conducted in 1934. Deep in the sal forests stand the stone ruins of the two historic Palamau Forts.",
    bestTimeToVisit: "November to April",
    howToReach: "25 km from Daltonganj; 170 km from Ranchi.",
    entryInfo: "Forest entry INR 100 + Gypsy safari charges.",
    travelerTip: "Book an early morning elephant ride or open-top jeep safari to spot herds of gaur (Indian bison) and wild elephants.",
    tags: ["Wildlife", "Heritage", "Nature"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Entrance_of_Palamu_Fort.jpg/1280px-Entrance_of_Palamu_Fort.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Entrance_of_Palamu_Fort.jpg",
                "title": "Entrance of Palamu Fort",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 23.8867, lng: 84.1873 },
  },
];
