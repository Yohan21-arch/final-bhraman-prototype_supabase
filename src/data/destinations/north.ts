import type { Place } from "@/types";

export const northPlaces: Place[] = [
  // LADAKH
  {
    id: "pangong-tso",
    name: "Pangong Tso",
    state: "ladakh",
    category: "iconic",
    shortDesc: "The world's highest saltwater lake shifting from cerulean to turquoise beneath barren mountains.",
    whyVisit: "Sitting at 14,270 feet, this 134 km long trans-Himalayan lake spans from India to Tibet. The water changes shades of intense cobalt, emerald, and violet throughout the day, framed by dramatic snow peaks.",
    bestTimeToVisit: "June to September (frozen solid in winter for the Chadar experience)",
    howToReach: "5 hours drive from Leh across Chang La pass (17,688 ft). Requires Inner Line Permit (ILP).",
    entryInfo: "Environmental fee & Inner Line Permit required via Leh DC office portal.",
    travelerTip: "Stay overnight in eco-cottages in Spangmik or Merak instead of a day trip to witness the Milky Way galaxy unpolluted by any city lights.",
    tags: ["High Altitude", "Nature", "Photography", "Scenic"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Pangong_Tso_lake_banner.jpg/1280px-Pangong_Tso_lake_banner.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/ISS054-E-7809_-_View_of_Earth_%28cropped%29.jpg/1280px-ISS054-E-7809_-_View_of_Earth_%28cropped%29.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pangong_Tso_lake_banner.jpg",
                "title": "Pangong Tso lake banner",
                "sourceName": "Wikimedia Commons"
          },
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:ISS054-E-7809_-_View_of_Earth_(cropped).jpg",
                "title": "ISS054-E-7809 - View of Earth (cropped)",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 33.7595, lng: 78.6674 },
    featured: true,
  },
  {
    id: "nubra-valley-hunder",
    name: "Nubra Valley & Hunder Sand Dunes",
    state: "ladakh",
    category: "iconic",
    shortDesc: "High-altitude desert valley with double-humped Bactrian camels and the colossal Maitreya Buddha at Diskit.",
    whyVisit: "Nubra was a historical Silk Route artery where high-altitude sand dunes meet rushing glacial streams. Witness the 106-foot golden Maitreya Buddha overlooking the Shyok River.",
    bestTimeToVisit: "May to October",
    howToReach: "Drive from Leh across Khardung La (17,982 ft), one of the highest motorable passes in the world (approx 4-5 hours).",
    entryInfo: "Ladakh Protected Area Permit (PAP/ILP) required.",
    travelerTip: "Take an evening safari on the Bactrian camels during sunset when the Himalayan cold desert glow turns pastel pink and amber.",
    tags: ["High Altitude", "Nature", "Scenic", "Culture"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Shyok_river_at_Hunder%2C_Nubra_valley.jpg/1280px-Shyok_river_at_Hunder%2C_Nubra_valley.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Nubra_Valley_2.jpg/1280px-Nubra_Valley_2.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Shyok_river_at_Hunder%2C_Nubra_valley.jpg",
                "title": "Shyok river at Hunder, Nubra valley",
                "sourceName": "Wikimedia Commons"
          },
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nubra_Valley_2.jpg",
                "title": "Nubra Valley 2",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 34.5822, lng: 77.4691 },
  },
  {
    id: "zanskar-valley",
    name: "Zanskar Valley & Phugtal Gompa",
    state: "ladakh",
    category: "hidden",
    shortDesc: "A remote cliffside honey-comb monastery built into the mouth of a massive limestone cave.",
    whyVisit: "Phugtal Gompa looks like a swallow's nest clinging to the sheer gorge wall of the Lungnak River. Founded in the 12th century, it is one of the most secluded monastic retreats on earth.",
    bestTimeToVisit: "July to September",
    howToReach: "Drive to Padum via Shinku La or Darcha, followed by a scenic 2-3 hour trek to the cave monastery.",
    entryInfo: "No commercial ticket; modest monastery donation appreciated.",
    travelerTip: "Attend the 6:00 AM monk chanting in the natural cave assembly hall.",
    tags: ["High Altitude", "Spiritual", "Trek", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Cave_Buildings_Phuktal_Monastery_02.jpg/1280px-Cave_Buildings_Phuktal_Monastery_02.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cave_Buildings_Phuktal_Monastery_02.jpg",
                "title": "Cave Buildings Phuktal Monastery 02",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 33.2844, lng: 77.1772 },
  },

  // JAMMU & KASHMIR
  {
    id: "dal-lake-srinagar",
    name: "Dal Lake & Floating Gardens",
    state: "jammu-kashmir",
    category: "iconic",
    shortDesc: "The Jewel in the Crown of Kashmir with hand-carved cedar houseboats and floating vegetable markets.",
    whyVisit: "Glide in a velvet-cushioned Shikara as the morning mist lifts over the Pir Panjal mountains. Experience floating flower and spice markets where local farmers trade directly from wooden canoes.",
    bestTimeToVisit: "April to October (Tulip season in April; golden Chinar autumn in October)",
    howToReach: "25 minutes from Sheikh ul-Alam International Airport (SXR), Srinagar.",
    entryInfo: "Shikara rides regulated by government rates (approx INR 700-1200 per hour).",
    travelerTip: "Wake up at 5:30 AM for the floating vegetable market in the deeper interior channels of the lake.",
    tags: ["Scenic", "Culture", "Photography", "Nature"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Dal_Lake_Hazratbal_Srinagar.jpg/1280px-Dal_Lake_Hazratbal_Srinagar.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Empty_shikara_on_Dal_Lake%2C_Srinagar%2C_Kashmir%2C_India.jpg/1280px-Empty_shikara_on_Dal_Lake%2C_Srinagar%2C_Kashmir%2C_India.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dal_Lake_Hazratbal_Srinagar.jpg",
                "title": "Dal Lake Hazratbal Srinagar",
                "sourceName": "Wikimedia Commons"
          },
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Empty_shikara_on_Dal_Lake%2C_Srinagar%2C_Kashmir%2C_India.jpg",
                "title": "Empty shikara on Dal Lake, Srinagar, Kashmir, India",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 34.0837, lng: 74.837 },
    featured: true,
  },
  {
    id: "gulmarg-apharwat",
    name: "Gulmarg Gondola & Apharwat Peak",
    state: "jammu-kashmir",
    category: "iconic",
    shortDesc: "Asia's highest operating cable car whisking travelers to 13,780 ft powder-snow alpine ridges.",
    whyVisit: "In winter, Gulmarg transforms into premier ski slopes with deep powder snow; in summer, it blossoms into a carpet of alpine lupines and daisies with views of Nanga Parbat.",
    bestTimeToVisit: "December to March for skiing/snow; May to September for lush meadows.",
    howToReach: "50 km west of Srinagar (approx 1.5 hours drive).",
    entryInfo: "Phase 1: INR 810; Phase 2: INR 1010. Online booking mandatory in advance.",
    travelerTip: "Book Phase 2 Gondola tickets at least 3 weeks in advance through the official JK Cable Car portal.",
    tags: ["High Altitude", "Scenic", "Trek", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Gulmarg_Gondola%2C_Cable_Car.JPG/1280px-Gulmarg_Gondola%2C_Cable_Car.JPG",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Gulmarg_Gondola%2C_Cable_Car.JPG",
                "title": "Gulmarg Gondola, Cable Car",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 34.0484, lng: 74.3805 },
  },
  {
    id: "gurez-valley",
    name: "Gurez Valley & Habba Khatoon Peak",
    state: "jammu-kashmir",
    category: "hidden",
    shortDesc: "A pristine high-altitude valley along the Kishanganga River guarded by the pyramid-shaped Habba Khatoon mountain.",
    whyVisit: "Deep in the northern frontier, Gurez offers pure wooden Dard-Shin villages, wildflower meadows, and crystal-clear river waters with virtually no commercial crowds.",
    bestTimeToVisit: "June to September",
    howToReach: "6-hour mountain drive from Srinagar via Razdan Pass (11,672 ft).",
    entryInfo: "Indian ID verification at military checkpoints along the pass.",
    travelerTip: "Taste fresh local trout fish prepared by riverside homestay hosts in Dawar village.",
    tags: ["Scenic", "Nature", "Culture", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Habba_Khatoon_Peak_Gurez_Valley.jpg/1280px-Habba_Khatoon_Peak_Gurez_Valley.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Habba_Khatoon_Peak_Gurez_Valley.jpg",
                "title": "Habba Khatoon Peak Gurez Valley",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 34.6367, lng: 74.8392 },
  },

  // HIMACHAL PRADESH
  {
    id: "spiti-valley-key",
    name: "Spiti Valley & Key Monastery",
    state: "himachal-pradesh",
    category: "iconic",
    shortDesc: "A thousand-year-old fort-like Buddhist monastery perched atop a cone hill at 13,668 feet.",
    whyVisit: "Spiti ('The Middle Land') is a surreal cold desert moonscape. Key Gompa houses ancient murals, thangkas, and rare manuscripts overlooking the braided Spiti River basin.",
    bestTimeToVisit: "June to October (roads via Rohtang and Kunzum Pass are open)",
    howToReach: "Via Shimla-Kaza route (all-weather) or Manali-Atal Tunnel-Kunzum Pass (summer).",
    entryInfo: "Free entry; photography permits inside inner prayer shrines.",
    travelerTip: "Send a postcard from Hikkim (14,567 ft), home to the world's highest functioning post office.",
    tags: ["High Altitude", "Spiritual", "Heritage", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Key_Monastery_-_Spiti_-Himachal_Pradesh_MG_6796.jpg/1280px-Key_Monastery_-_Spiti_-Himachal_Pradesh_MG_6796.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Kee_monastery_Spiti_Valley_%28edited%29.jpg/1280px-Kee_monastery_Spiti_Valley_%28edited%29.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Key_Monastery_-_Spiti_-Himachal_Pradesh_MG_6796.jpg",
                "title": "Key Monastery - Spiti -Himachal Pradesh MG 6796",
                "sourceName": "Wikimedia Commons"
          },
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kee_monastery_Spiti_Valley_(edited).jpg",
                "title": "Kee monastery Spiti Valley (edited)",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 32.298, lng: 78.0125 },
    featured: true,
  },
  {
    id: "chitkul-kinnaur",
    name: "Chitkul & Sangla Valley",
    state: "himachal-pradesh",
    category: "hidden",
    shortDesc: "The last inhabited village on the old Indo-Tibetan trade road beside the turquoise Baspa River.",
    whyVisit: "Surrounded by snow-dusted Kinnaur Kailash peaks, Chitkul features traditional slate-roofed wooden houses, apple orchards, and potato farms yielding the sweetest harvest in India.",
    bestTimeToVisit: "April to October",
    howToReach: "250 km from Shimla via NH-5 through Karcham and Sangla.",
    entryInfo: "Free access; checkpost verification.",
    travelerTip: "Have a hot cup of chai and pahadi rajma-chawal at the iconic 'Hindustan Ka Aakhri Dhaba' on the river bank.",
    tags: ["Nature", "Scenic", "Culture", "High Altitude"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Baspa_river_flowing_through_Chitkul.jpg/1280px-Baspa_river_flowing_through_Chitkul.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Baspa_river_flowing_through_Chitkul.jpg",
                "title": "Baspa river flowing through Chitkul",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 31.3524, lng: 78.4357 },
  },
  {
    id: "khajjiar-chamba",
    name: "Khajjiar (Mini Switzerland of India)",
    state: "himachal-pradesh",
    category: "iconic",
    shortDesc: "A saucer-shaped alpine meadow with a central floating island lake ringed by dense deodar pine forests.",
    whyVisit: "Officially christened 'Mini Switzerland' by the Swiss Ambassador in 1992, Khajjiar offers gentle green pastures, horse riding, paragliding, and the 12th-century wooden Khajji Nag Temple.",
    bestTimeToVisit: "March to June (lush green) or December to February (snow blanket)",
    howToReach: "22 km from Dalhousie; 110 km from Gaggal Airport, Dharamshala.",
    entryInfo: "Free entry to meadow; adventure sports paid per activity.",
    travelerTip: "Trek the 3.5 km nature trail from Khajjiar to Kalatop Wildlife Sanctuary through ancient cedar woods.",
    tags: ["Scenic", "Nature", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Beautiful_Khajjair_01.jpg/1280px-Beautiful_Khajjair_01.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Beautiful_Khajjair_01.jpg",
                "title": "Beautiful Khajjair 01",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 32.5511, lng: 76.0601 },
  },

  // UTTARAKHAND
  {
    id: "valley-of-flowers",
    name: "Valley of Flowers National Park",
    state: "uttarakhand",
    category: "iconic",
    shortDesc: "A UNESCO World Heritage alpine wonderland bursting into hundreds of endemic wildflowers every monsoon.",
    whyVisit: "Nestled in the Western Himalayas at 11,500 feet, this pristine park is carpeted with blue poppies, orchids, primulas, and Brahma kamal, surrounded by glacier-fed streams.",
    bestTimeToVisit: "Mid-July to August (peak floral blooming season)",
    howToReach: "Drive from Rishikesh to Govindghat, followed by a 14 km scenic trek to Ghangaria base camp.",
    entryInfo: "INR 150 for Indians, INR 600 for foreigners (valid for 3 days).",
    travelerTip: "Combine your visit with the nearby pilgrimage trek to Hemkund Sahib glacial lake (14,200 ft).",
    tags: ["Nature", "Trek", "Scenic", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Valley_of_Flowers_National_Park.jpg/1280px-Valley_of_Flowers_National_Park.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Valley_of_Flowers_National_Park.jpg",
                "title": "Valley of Flowers National Park",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 30.728, lng: 79.6053 },
  },
  {
    id: "rishikesh-ganga-aarti",
    name: "Rishikesh & Triveni Ghat Ganga Aarti",
    state: "uttarakhand",
    category: "iconic",
    shortDesc: "The World Capital of Yoga where emerald Himalayan waters flow past spiritual ashrams and suspension bridges.",
    whyVisit: "Experience the electrifying evening Maha Aarti at Triveni Ghat and Parmarth Niketan, walk across Ram Jhula, and visit the historic Beatles Ashram covered in vibrant counter-culture murals.",
    bestTimeToVisit: "September to April",
    howToReach: "35 km from Jolly Grant Airport (DED), Dehradun; direct rail link to Yog Nagari Rishikesh.",
    entryInfo: "Ghats are free; Beatles Ashram INR 150 for Indians, INR 600 for foreigners.",
    travelerTip: "Attend the morning meditation session along the white sand beaches of Shivpuri upstream.",
    tags: ["Spiritual", "Culture", "Nature", "Scenic"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Holy_Smokes%21_02.jpg/1280px-Holy_Smokes%21_02.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Holy_Smokes!_02.jpg",
                "title": "Holy Smokes! 02",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 30.1033, lng: 78.2948 },
    featured: true,
  },
  {
    id: "auli-ropeway-meadows",
    name: "Auli Bugyal & Ropeway",
    state: "uttarakhand",
    category: "hidden",
    shortDesc: "Vast undulating alpine meadows providing unobstructed panoramic vistas of Nanda Devi, Kamet, and Trishul.",
    whyVisit: "Ride India's longest aerial ropeway (4 km) from Joshimath to Auli at 9,200 ft. Auli boasts pristine artificial snow lakes, oak forests, and winter Olympic-standard ski slopes.",
    bestTimeToVisit: "December to March for skiing; May to October for lush alpine bugyals.",
    howToReach: "From Rishikesh/Haridwar drive to Joshimath (260 km), then take the cable car up to Auli.",
    entryInfo: "Ropeway return ticket approx INR 1000 per person.",
    travelerTip: "Trek to Gorson Bugyal (3 km from Auli) for close-up views of the sacred peak of Nanda Devi.",
    tags: ["Scenic", "High Altitude", "Nature", "Trek"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Auli_Ski_Resort_in_summer_2012.jpg/1280px-Auli_Ski_Resort_in_summer_2012.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Auli_Ski_Resort_in_summer_2012.jpg",
                "title": "Auli Ski Resort in summer 2012",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 30.5285, lng: 79.5678 },
  },

  // PUNJAB
  {
    id: "golden-temple-amritsar",
    name: "Sri Harmandir Sahib (Golden Temple)",
    state: "punjab",
    category: "iconic",
    shortDesc: "The holiest Sikh spiritual shrine shimmering in gold leaf above the sacred Amrit Sarovar lake.",
    whyVisit: "Harmandir Sahib welcomes people of all religions and backgrounds. The temple runs the world's largest community kitchen (Langar), serving over 100,000 free hot meals every single day with selfless volunteer devotion.",
    bestTimeToVisit: "October to March (Visit at 4:00 AM for the Palki Sahib procession or 9:00 PM for night illumination)",
    howToReach: "12 km from Sri Guru Ram Dass Jee International Airport (ATQ), Amritsar.",
    entryInfo: "Free admission for everyone. Head coverings and shoe removal mandatory.",
    travelerTip: "Volunteer for 30 minutes in the Langar hall to peel garlic, roll rotis, or serve dal alongside pilgrims.",
    tags: ["Spiritual", "Heritage", "Architecture", "Culinary"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/1280px-The_Golden_Temple_of_Amrithsar_7.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Golden_Temple_of_Amrithsar_7.jpg",
                "title": "The Golden Temple of Amrithsar 7",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 31.62, lng: 74.8765 },
    featured: true,
  },
  {
    id: "wagah-border-amritsar",
    name: "Wagah Border Beating Retreat",
    state: "punjab",
    category: "iconic",
    shortDesc: "A high-octane daily ceremonial military parade by India's Border Security Force and Pakistan Rangers.",
    whyVisit: "Witness synchronized high kicks, booming patriotic anthems, and theatrical drill movements as the international border gates are closed at sundown.",
    bestTimeToVisit: "Year-round (arrive by 3:30 PM for a seat in the grandstands)",
    howToReach: "30 km west of Amritsar city center along the Grand Trunk Road.",
    entryInfo: "Free entry. Original government photo ID required.",
    travelerTip: "Avoid carrying backpacks or large bags as only mobile phones and wallets are permitted inside the stadium.",
    tags: ["Culture", "Heritage"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Young_Woman_Celebrating_at_Border-Closing_Ceremony_-_Attari-Wagah_India-Pakistan_Border_-_Near_Amritsar_-_Punjab_-_India_%2812697910564%29.jpg/1280px-Young_Woman_Celebrating_at_Border-Closing_Ceremony_-_Attari-Wagah_India-Pakistan_Border_-_Near_Amritsar_-_Punjab_-_India_%2812697910564%29.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Young_Woman_Celebrating_at_Border-Closing_Ceremony_-_Attari-Wagah_India-Pakistan_Border_-_Near_Amritsar_-_Punjab_-_India_(12697910564).jpg",
                "title": "Young Woman Celebrating at Border-Closing Ceremony - Attari-Wagah India-Pakistan Border - Near Amritsar - Punjab - India (12697910564)",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 31.6046, lng: 74.5734 },
  },

  // HARYANA
  {
    id: "brahma-sarovar-kurukshetra",
    name: "Brahma Sarovar & Jyotisar",
    state: "haryana",
    category: "iconic",
    shortDesc: "Asia's largest sacred man-made water tank and the historical birthplace where the Bhagavad Gita was spoken.",
    whyVisit: "Brahma Sarovar spans 3.4 km in perimeter, mentioned in the Mahabharata and Al-Biruni's memoirs. Nearby Jyotisar enshrines the ancient banyan tree where Lord Krishna delivered the Gita sermon.",
    bestTimeToVisit: "October to March (especially during the International Gita Mahotsav)",
    howToReach: "150 km north of Delhi via NH-44; Kurukshetra Junction railway station.",
    entryInfo: "Free entry.",
    travelerTip: "Visit during the evening when thousands of earthen lamps float across the water during the deep daan aarti.",
    tags: ["Spiritual", "Heritage", "Culture"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Brahma_Sarovar_Kurukshetra_1.jpg/1280px-Brahma_Sarovar_Kurukshetra_1.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Brahma_Sarovar_Kurukshetra_1.jpg",
                "title": "Brahma Sarovar Kurukshetra 1",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 29.9657, lng: 76.8378 },
  },
  {
    id: "sultanpur-bird-sanctuary",
    name: "Sultanpur National Park & Wetland",
    state: "haryana",
    category: "hidden",
    shortDesc: "A protected freshwater wetland sanctuary hosting over 250 species of winter migratory waterfowl.",
    whyVisit: "Located right on the outskirts of Gurugram, Sultanpur is a Ramsar wetland site frequented by Siberian cranes, greater flamingos, pelicans, and painted storks from Central Asia.",
    bestTimeToVisit: "November to February",
    howToReach: "45 km from Central Delhi; 15 km from Gurugram on Gurgaon-Farrukhnagar Road.",
    entryInfo: "INR 10 per person; camera fee extra.",
    travelerTip: "Bring binoculars and climb watchtower #3 for 360-degree views of flamingos feeding in the shallow waters.",
    tags: ["Wildlife", "Nature", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Sultanpur_National_Park%2C_Gurgaon%2C_Haryana.jpg/1280px-Sultanpur_National_Park%2C_Gurgaon%2C_Haryana.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sultanpur_National_Park%2C_Gurgaon%2C_Haryana.jpg",
                "title": "Sultanpur National Park, Gurgaon, Haryana",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 28.4615, lng: 76.8925 },
  },

  // DELHI
  {
    id: "humayuns-tomb-delhi",
    name: "Humayun's Tomb & Sunder Nursery",
    state: "delhi",
    category: "iconic",
    shortDesc: "The red sandstone UNESCO masterpiece that inspired the Taj Mahal, set within restored Persian Charbagh gardens.",
    whyVisit: "Built in 1570, this grand tomb represents the synthesis of Persian and Rajput architecture. Adjacent Sunder Nursery features 90 acres of restored Mughal pavilions, lotus ponds, and 300+ tree species.",
    bestTimeToVisit: "October to March (Late afternoon golden hour)",
    howToReach: "Located in Nizamuddin East. Nearest metro stations are JLN Stadium (Violet Line) and Sarai Kale Khan (Pink Line).",
    entryInfo: "INR 40 for Indians, INR 600 for foreigners. Sunder Nursery entry INR 50.",
    travelerTip: "Pair your visit with an evening qawwali session at the nearby Nizamuddin Dargah on Thursday evenings.",
    tags: ["Heritage", "Architecture", "Photography", "Culture"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Humayuns_tomb_new_Delhi_4.jpg/1280px-Humayuns_tomb_new_Delhi_4.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Humayuns_tomb_new_Delhi_4.jpg",
                "title": "Humayuns tomb new Delhi 4",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 28.5933, lng: 77.2507 },
    featured: true,
  },
  {
    id: "qutub-minar-complex",
    name: "Qutub Minar & Mehrauli Archaeological Park",
    state: "delhi",
    category: "iconic",
    shortDesc: "The world's tallest brick minaret at 72.5 meters, flanked by the rust-resistant 4th-century Iron Pillar of Chandragupta.",
    whyVisit: "Constructed in 1192 by Qutb-ud-din Aibak, the complex features exquisite Quranic calligraphic carvings, the Quwwat-ul-Islam mosque, and the Alai Darwaza gateway.",
    bestTimeToVisit: "November to February",
    howToReach: "Qutub Minar Metro Station (Yellow Line) is 1 km away.",
    entryInfo: "INR 40 for Indians, INR 600 for foreigners.",
    travelerTip: "Explore the nearby Mehrauli Archaeological Park to discover Jamali Kamali mosque and Rajon ki Baori stepwell.",
    tags: ["Heritage", "Architecture", "Photography"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Qutb_Minar_in_Delhi_03-2016_img3.jpg/1280px-Qutb_Minar_in_Delhi_03-2016_img3.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Qutb_Minar_in_Delhi_03-2016_img3.jpg",
                "title": "Qutb Minar in Delhi 03-2016 img3",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 28.5245, lng: 77.1855 },
  },

  // CHANDIGARH
  {
    id: "rock-garden-chandigarh",
    name: "Nek Chand's Rock Garden & Sukhna Lake",
    state: "chandigarh",
    category: "iconic",
    shortDesc: "A 40-acre visionary sculpture kingdom built secretly from industrial waste, discarded porcelain, and bangles.",
    whyVisit: "Created over 18 years by road inspector Nek Chand using scrap materials from demolished villages, the maze contains man-made waterfalls, amphitheaters, and hundreds of whimsical figures.",
    bestTimeToVisit: "October to March",
    howToReach: "Sector 1, Chandigarh. 8 km from Chandigarh Junction railway station.",
    entryInfo: "INR 30 for adults, INR 10 for children.",
    travelerTip: "Rent a solar paddle boat on the tranquil waters of adjacent Sukhna Lake at sunset.",
    tags: ["Culture", "Architecture", "Scenic"],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chandigarh_Rock_Garden_Sculptures.jpg/1280px-Chandigarh_Rock_Garden_Sculptures.jpg",
    ],
    imageAttributions: [
          {
                "author": "Wikimedia Commons Contributor",
                "license": "CC BY-SA 4.0",
                "sourceUrl": "https://commons.wikimedia.org/wiki/File:Chandigarh_Rock_Garden_Sculptures.jpg",
                "title": "Chandigarh Rock Garden Sculptures",
                "sourceName": "Wikimedia Commons"
          }
    ],
    coordinates: { lat: 30.7525, lng: 76.8065 },
  },
];
