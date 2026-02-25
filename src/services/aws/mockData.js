const MOCK_RESPONSES = {
  hi: [
    {
      keywords: ['कीटनाशक', 'छिड़काव', 'spray', 'pesticide', 'दवाई'],
      answer: 'कीटनाशक छिड़काव के लिए सुरक्षा नियम:\n\n1. हमेशा दस्ताने, मास्क और चश्मा पहनें\n2. हवा की दिशा में खड़े होकर छिड़काव करें\n3. छिड़काव के बाद हाथ-मुंह साबुन से अच्छी तरह धोएं\n4. खाली बोतलों को कभी पानी भरने के लिए इस्तेमाल न करें\n5. बच्चों और जानवरों को दूर रखें\n6. सुबह या शाम को छिड़काव करें, दोपहर में नहीं\n7. छिड़काव के बाद कम से कम 24 घंटे खेत में न जाएं',
      sources: ['ICAR कीटनाशक सुरक्षा दिशानिर्देश', 'कृषि मंत्रालय अधिसूचना 2023'],
      confidence: 0.95,
    },
    {
      keywords: ['ट्रैक्टर', 'tractor', 'चलाना', 'गाड़ी', 'मशीन'],
      answer: 'ट्रैक्टर सुरक्षा के नियम:\n\n1. ट्रैक्टर चालू करने से पहले चारों तरफ देखें\n2. सीट बेल्ट हमेशा लगाएं\n3. ढलान पर धीमी गति से चलाएं\n4. कभी भी चलते ट्रैक्टर से न कूदें\n5. रात में लाइट जरूर जलाएं\n6. बच्चों को ट्रैक्टर पर न बैठाएं\n7. नियमित रूप से ब्रेक और टायर की जांच करें\n8. ट्रैक्टर पर अधिक भार न लादें',
      sources: ['भारतीय मानक ब्यूरो - ट्रैक्टर सुरक्षा', 'ICAR कृषि यंत्र विभाग'],
      confidence: 0.93,
    },
    {
      keywords: ['गर्मी', 'धूप', 'heat', 'sun', 'लू', 'तापमान'],
      answer: 'गर्मी में सुरक्षित काम के उपाय:\n\n1. सुबह जल्दी या शाम को काम करें (10AM-4PM से बचें)\n2. हर 30 मिनट में पानी पिएं\n3. सिर पर टोपी या कपड़ा रखें\n4. हल्के रंग के ढीले कपड़े पहनें\n5. ORS या नमक-चीनी का घोल साथ रखें\n6. चक्कर आने पर तुरंत छाया में जाएं\n7. साथी किसान का ध्यान रखें\n8. भारी काम दोपहर में न करें',
      sources: ['राष्ट्रीय आपदा प्रबंधन प्राधिकरण', 'WHO हीट स्ट्रेस गाइडलाइन'],
      confidence: 0.96,
    },
    {
      keywords: ['बिजली', 'करंट', 'electric', 'तार', 'बिजली का झटका'],
      answer: 'खेत में बिजली सुरक्षा:\n\n1. बिजली के तारों के पास सिंचाई पाइप न ले जाएं\n2. गीले हाथों से बिजली के उपकरण न छुएं\n3. मोटर पंप में अर्थिंग जरूर लगवाएं\n4. टूटे तार दिखें तो दूर रहें और बिजली विभाग को बताएं\n5. बारिश में बिजली के खंभों से दूर रहें\n6. MCB/ELCB जरूर लगवाएं',
      sources: ['विद्युत सुरक्षा नियमावली भारत', 'ICAR खेत सुरक्षा मैनुअल'],
      confidence: 0.92,
    },
    {
      keywords: ['सांप', 'snake', 'काटना', 'bite', 'कीड़ा', 'बिच्छू'],
      answer: 'सांप/कीड़े काटने पर प्राथमिक उपचार:\n\n1. घबराएं नहीं, शांत रहें\n2. काटी हुई जगह को हिलाएं नहीं\n3. कसकर पट्टी न बांधें\n4. चीरा न लगाएं, मुंह से जहर न चूसें\n5. तुरंत नजदीकी अस्पताल जाएं\n6. अगर हो सके तो सांप की फोटो लें\n7. खेत में जूते और लंबे कपड़े पहनें',
      sources: ['WHO सर्पदंश उपचार प्रोटोकॉल', 'भारतीय चिकित्सा अनुसंधान परिषद'],
      confidence: 0.94,
    },
    {
      keywords: ['PPE', 'सुरक्षा उपकरण', 'दस्ताने', 'मास्क', 'चश्मा', 'कपड़े', 'protective'],
      answer: 'खेती में सुरक्षा उपकरण (PPE):\n\n1. दस्ताने: कीटनाशक और उर्वरक छूने के लिए\n2. मास्क: धूल और रसायन से बचाव\n3. चश्मा: छिड़काव और कटाई के समय\n4. जूते: सांप, कांटे और नमी से बचाव\n5. टोपी: धूप और गर्मी से बचाव\n6. पूरे बांह के कपड़े: त्वचा सुरक्षा\n7. PPE को काम के बाद अच्छी तरह धोएं',
      sources: ['ICAR सुरक्षा गाइडलाइन', 'कृषि श्रमिक सुरक्षा अधिनियम'],
      confidence: 0.91,
    },
    {
      keywords: ['रासायनिक', 'भंडारण', 'storage', 'chemical', 'रखना', 'स्टोर'],
      answer: 'रसायनों का सुरक्षित भंडारण:\n\n1. बच्चों की पहुंच से दूर रखें\n2. खाने-पीने की चीजों से अलग रखें\n3. ठंडी और सूखी जगह पर रखें\n4. मूल पैकेजिंग में ही रखें, दूसरे बर्तन में न डालें\n5. लेबल हमेशा पढ़ें और समाप्ति तिथि जांचें\n6. ताला लगाकर रखें\n7. खाली बोतलें तोड़कर गड्ढे में गाड़ दें',
      sources: ['CIB&RC दिशानिर्देश', 'कीटनाशक अधिनियम 1968'],
      confidence: 0.93,
    },
    {
      keywords: ['मशीनरी', 'maintenance', 'मरम्मत', 'रखरखाव', 'सर्विस'],
      answer: 'कृषि मशीनरी रखरखाव:\n\n1. हर उपयोग से पहले तेल और पानी जांचें\n2. चलती मशीन की मरम्मत कभी न करें\n3. ढीले कपड़े पहनकर मशीन न चलाएं\n4. बेल्ट और चेन की नियमित जांच करें\n5. मशीन बंद करके ही सफाई करें\n6. स्पेयर पार्ट्स केवल प्रमाणित ही इस्तेमाल करें\n7. मशीन के पास आग न जलाएं',
      sources: ['ICAR कृषि इंजीनियरिंग विभाग', 'FMC मशीनरी सुरक्षा मैनुअल'],
      confidence: 0.90,
    },
    {
      keywords: ['प्राथमिक उपचार', 'first aid', 'जहर', 'poison', 'विषाक्तता', 'exposure'],
      answer: 'कीटनाशक विषाक्तता प्राथमिक उपचार:\n\n1. रोगी को खुली हवा में ले जाएं\n2. दूषित कपड़े तुरंत उतारें\n3. त्वचा पर लगा हो तो साबुन-पानी से धोएं\n4. आंखों में गया हो तो 15 मिनट पानी से धोएं\n5. निगल लिया हो तो उल्टी न करवाएं\n6. तुरंत 108 पर कॉल करें\n7. कीटनाशक का लेबल/बोतल अस्पताल ले जाएं',
      sources: ['WHO कीटनाशक विषाक्तता गाइड', 'AIIMS आपातकालीन प्रोटोकॉल'],
      confidence: 0.95,
    },
    {
      keywords: ['सिंचाई', 'irrigation', 'पानी', 'pump', 'पंप', 'नहर'],
      answer: 'सिंचाई प्रणाली सुरक्षा:\n\n1. पंप चालू करने से पहले वायरिंग जांचें\n2. नहर/कुएं के पास बच्चों को न जाने दें\n3. पंप की मोटर पर अर्थिंग लगवाएं\n4. पाइप लाइन में लीकेज तुरंत ठीक करें\n5. बरसात में पंप हाउस में पानी न भरने दें\n6. ड्रिप/स्प्रिंकलर की नियमित सफाई करें',
      sources: ['जल संसाधन मंत्रालय', 'ICAR सिंचाई सुरक्षा'],
      confidence: 0.89,
    },
    {
      keywords: ['कटाई', 'harvest', 'फसल कटाई', 'काटना'],
      answer: 'फसल कटाई सुरक्षा:\n\n1. हंसिया/दरांती की धार तेज रखें (कम बल लगता है)\n2. दस्ताने पहनकर काम करें\n3. कंबाइन हार्वेस्टर के पास सावधानी रखें\n4. बंडल बांधते समय कमर सीधी रखें\n5. भारी बोझ न उठाएं, ट्रॉली का उपयोग करें\n6. बारिश में गीली फसल काटते समय फिसलन से बचें',
      sources: ['ICAR कटाई सुरक्षा मैनुअल', 'कृषि श्रमिक कल्याण बोर्ड'],
      confidence: 0.91,
    },
    {
      keywords: ['अनाज', 'भंडारण', 'grain', 'storage', 'गोदाम', 'बोरी'],
      answer: 'अनाज भंडारण सुरक्षा:\n\n1. गोदाम में हवा का आवागमन सुनिश्चित करें\n2. अनाज सूखा होने पर ही भंडारण करें\n3. गोदाम में चूहे/कीड़ों से बचाव करें\n4. भंडारण गृह में जाने से पहले हवा आने दें (जहरीली गैस)\n5. नमी से बचाव के लिए प्लास्टिक शीट बिछाएं\n6. बोरियों को दीवार से दूर रखें',
      sources: ['FCI भंडारण दिशानिर्देश', 'खाद्य सुरक्षा अधिनियम'],
      confidence: 0.90,
    },
    {
      keywords: ['आग', 'fire', 'जलाना', 'पराली', 'stubble'],
      answer: 'आग सुरक्षा और पराली जलाना:\n\n1. पराली जलाने से पहले फायर ब्रेक बनाएं\n2. पानी और रेत पास में रखें\n3. तेज हवा में कभी न जलाएं\n4. आसपास के किसानों को सूचित करें\n5. जलती आग को कभी अकेला न छोड़ें\n6. पराली को मल्चिंग/कंपोस्ट में बदलें (बेहतर विकल्प)\n7. अगर आग फैले तो 101 पर कॉल करें',
      sources: ['राष्ट्रीय हरित प्राधिकरण', 'अग्निशमन विभाग दिशानिर्देश'],
      confidence: 0.92,
    },
    {
      keywords: ['जानवर', 'animal', 'पशु', 'गाय', 'भैंस', 'बैल'],
      answer: 'पशु सुरक्षा नियम:\n\n1. अजनबी जानवरों के पास धीरे-धीरे जाएं\n2. जानवर को पीछे से कभी न छुएं\n3. बीमार जानवर को छूने से पहले दस्ताने पहनें\n4. बैल/भैंसे को बांधने के लिए मजबूत रस्सी उपयोग करें\n5. पशु चिकित्सक की सलाह नियमित लें\n6. जानवरों के टीकाकरण समय पर करवाएं',
      sources: ['पशुपालन विभाग', 'ICAR पशु सुरक्षा दिशानिर्देश'],
      confidence: 0.88,
    },
    {
      keywords: ['पानी', 'water', 'प्रदूषण', 'contamination', 'दूषित', 'पीने'],
      answer: 'खेत में पानी सुरक्षा:\n\n1. कीटनाशक छिड़काव के पास पीने का पानी न रखें\n2. खेत का पानी बिना उबाले न पिएं\n3. रासायनिक बर्तन कभी पानी के स्रोत के पास न धोएं\n4. कुएं को ढक कर रखें\n5. पानी की टंकी की नियमित सफाई करें\n6. बारिश के पानी का संग्रह सुरक्षित तरीके से करें',
      sources: ['जल गुणवत्ता मानक BIS', 'स्वच्छ भारत जल सुरक्षा'],
      confidence: 0.91,
    },
  ],
  en: [
    {
      keywords: ['pesticide', 'spray', 'chemical', 'insecticide', 'medicine'],
      answer: 'Pesticide Safety Guidelines:\n\n1. Always wear gloves, mask, and goggles\n2. Spray in the direction of the wind\n3. Wash hands and face thoroughly with soap after spraying\n4. Never reuse empty pesticide containers for water or food\n5. Keep children and animals away during spraying\n6. Spray early morning or evening, avoid midday heat\n7. Do not enter the field for at least 24 hours after spraying',
      sources: ['ICAR Pesticide Safety Guidelines', 'Ministry of Agriculture Notification 2023'],
      confidence: 0.95,
    },
    {
      keywords: ['tractor', 'driving', 'machinery', 'vehicle'],
      answer: 'Tractor Safety Rules:\n\n1. Check all sides before starting the tractor\n2. Always wear a seatbelt\n3. Drive slowly on slopes and uneven terrain\n4. Never jump from a moving tractor\n5. Use headlights when driving at night\n6. Never allow children to ride on the tractor\n7. Regularly check brakes, tires, and hydraulics\n8. Do not overload the tractor',
      sources: ['Bureau of Indian Standards - Tractor Safety', 'ICAR Agricultural Engineering'],
      confidence: 0.93,
    },
    {
      keywords: ['heat', 'sun', 'hot', 'summer', 'temperature', 'heatstroke'],
      answer: 'Heat Safety Measures:\n\n1. Work early morning or evening (avoid 10AM-4PM)\n2. Drink water every 30 minutes\n3. Wear a hat or cover your head\n4. Wear light-colored, loose clothing\n5. Keep ORS or salt-sugar solution handy\n6. Move to shade immediately if you feel dizzy\n7. Watch out for fellow workers showing heat stress signs\n8. Avoid heavy physical work during peak heat',
      sources: ['National Disaster Management Authority', 'WHO Heat Stress Guidelines'],
      confidence: 0.96,
    },
    {
      keywords: ['electric', 'power', 'wire', 'shock', 'current', 'electrocution'],
      answer: 'Farm Electrical Safety:\n\n1. Keep irrigation pipes away from power lines\n2. Never touch electrical equipment with wet hands\n3. Ensure proper earthing for motor pumps\n4. Stay away from broken wires, report to electricity department\n5. Stay away from electric poles during rain\n6. Install MCB/ELCB for protection',
      sources: ['Indian Electricity Safety Regulations', 'ICAR Farm Safety Manual'],
      confidence: 0.92,
    },
    {
      keywords: ['snake', 'bite', 'insect', 'scorpion', 'sting'],
      answer: 'Snake/Insect Bite First Aid:\n\n1. Stay calm, do not panic\n2. Keep the bitten area still and below heart level\n3. Do NOT tie a tight tourniquet\n4. Do NOT cut or suck the wound\n5. Rush to the nearest hospital immediately\n6. If possible, take a photo of the snake for the doctor\n7. Wear boots and long clothing in the field',
      sources: ['WHO Snakebite Treatment Protocol', 'ICMR Guidelines'],
      confidence: 0.94,
    },
    {
      keywords: ['PPE', 'protective', 'gloves', 'mask', 'goggles', 'clothing', 'equipment'],
      answer: 'Farm Personal Protective Equipment (PPE):\n\n1. Gloves: For handling pesticides and fertilizers\n2. Mask: Protection from dust and chemicals\n3. Goggles: During spraying and harvesting\n4. Boots: Protection from snakes, thorns, and moisture\n5. Hat: Sun and heat protection\n6. Full-sleeve clothing: Skin protection\n7. Clean PPE thoroughly after each use',
      sources: ['ICAR Safety Guidelines', 'Agricultural Workers Safety Act'],
      confidence: 0.91,
    },
    {
      keywords: ['chemical', 'storage', 'store', 'keep', 'container'],
      answer: 'Chemical Storage Safety:\n\n1. Keep away from children\n2. Store separately from food and water\n3. Keep in cool, dry place\n4. Keep in original packaging, never transfer to other containers\n5. Always read labels and check expiry dates\n6. Keep under lock and key\n7. Dispose empty containers by crushing and burying',
      sources: ['CIB&RC Guidelines', 'Insecticides Act 1968'],
      confidence: 0.93,
    },
    {
      keywords: ['machinery', 'maintenance', 'repair', 'service', 'equipment'],
      answer: 'Farm Machinery Maintenance Safety:\n\n1. Check oil and water before every use\n2. Never repair a running machine\n3. Do not wear loose clothing near machines\n4. Regularly inspect belts and chains\n5. Turn off machine before cleaning\n6. Use only certified spare parts\n7. Do not light fires near machinery',
      sources: ['ICAR Agricultural Engineering Division', 'FMC Machinery Safety Manual'],
      confidence: 0.90,
    },
    {
      keywords: ['first aid', 'poison', 'exposure', 'poisoning', 'toxic'],
      answer: 'Pesticide Exposure First Aid:\n\n1. Move the person to fresh air immediately\n2. Remove contaminated clothing\n3. If on skin, wash with soap and water\n4. If in eyes, rinse with water for 15 minutes\n5. If swallowed, do NOT induce vomiting\n6. Call 108 emergency immediately\n7. Take the pesticide label/bottle to the hospital',
      sources: ['WHO Pesticide Poisoning Guide', 'AIIMS Emergency Protocol'],
      confidence: 0.95,
    },
    {
      keywords: ['irrigation', 'water', 'pump', 'canal', 'well', 'bore'],
      answer: 'Irrigation System Safety:\n\n1. Check wiring before starting the pump\n2. Keep children away from canals and wells\n3. Ensure proper earthing on pump motors\n4. Fix pipeline leaks immediately\n5. Prevent water from flooding the pump house during rain\n6. Clean drip/sprinkler systems regularly',
      sources: ['Ministry of Water Resources', 'ICAR Irrigation Safety'],
      confidence: 0.89,
    },
    {
      keywords: ['harvest', 'harvesting', 'cutting', 'crop', 'reaping'],
      answer: 'Harvesting Safety:\n\n1. Keep sickles/blades sharp (requires less force)\n2. Wear gloves while working\n3. Be careful near combine harvesters\n4. Keep your back straight while bundling\n5. Do not carry heavy loads, use a trolley\n6. Watch for slippery conditions when harvesting wet crops',
      sources: ['ICAR Harvesting Safety Manual', 'Agricultural Workers Welfare Board'],
      confidence: 0.91,
    },
    {
      keywords: ['grain', 'storage', 'warehouse', 'silo', 'bag', 'godown'],
      answer: 'Grain Storage Safety:\n\n1. Ensure ventilation in the storage area\n2. Only store grain when completely dry\n3. Protect against rodents and insects\n4. Allow fresh air before entering storage (toxic gases)\n5. Use plastic sheets to prevent moisture\n6. Keep bags away from walls',
      sources: ['FCI Storage Guidelines', 'Food Safety Act'],
      confidence: 0.90,
    },
    {
      keywords: ['fire', 'burn', 'stubble', 'flame'],
      answer: 'Fire Safety & Stubble Burning:\n\n1. Create firebreaks around the field before burning\n2. Keep water and sand ready to control fire\n3. Never burn on windy days\n4. Inform nearby farmers before burning\n5. Never leave a fire unattended\n6. Consider mulching or composting as alternatives\n7. Call 101 if fire spreads out of control',
      sources: ['National Green Tribunal', 'Fire Department Guidelines'],
      confidence: 0.92,
    },
    {
      keywords: ['animal', 'cattle', 'cow', 'buffalo', 'bull', 'livestock'],
      answer: 'Animal Handling Safety:\n\n1. Approach unfamiliar animals slowly and calmly\n2. Never touch an animal from behind\n3. Wear gloves when handling sick animals\n4. Use strong ropes for tying bulls/buffaloes\n5. Get regular veterinary checkups\n6. Ensure timely vaccination of all livestock',
      sources: ['Department of Animal Husbandry', 'ICAR Animal Safety Guidelines'],
      confidence: 0.88,
    },
    {
      keywords: ['water', 'contamination', 'pollution', 'drinking', 'quality'],
      answer: 'Farm Water Safety:\n\n1. Do not keep drinking water near pesticide spraying areas\n2. Do not drink field water without boiling\n3. Never wash chemical containers near water sources\n4. Keep wells covered\n5. Clean water tanks regularly\n6. Collect rainwater safely using proper methods',
      sources: ['BIS Water Quality Standards', 'Swachh Bharat Water Safety'],
      confidence: 0.91,
    },
  ],
}

const FALLBACK = {
  hi: {
    answer: 'मुझे इस विषय पर अभी सटीक जानकारी नहीं मिली। कृपया अपने नजदीकी कृषि विस्तार अधिकारी से संपर्क करें। आप अपना सवाल दूसरे तरीके से भी पूछ सकते हैं।',
    sources: ['कृषि विस्तार सेवा'],
    confidence: 0.3,
  },
  en: {
    answer: "I don't have specific information on this topic yet. Please contact your nearest agricultural extension officer. You can also try rephrasing your question.",
    sources: ['Agricultural Extension Service'],
    confidence: 0.3,
  },
}

export function findMockAnswer(question, langKey) {
  const responses = MOCK_RESPONSES[langKey] || MOCK_RESPONSES.en
  const q = question.toLowerCase()

  const match = responses.find((r) =>
    r.keywords.some((kw) => q.includes(kw.toLowerCase()))
  )

  return match || FALLBACK[langKey] || FALLBACK.en
}

export function getSampleQuestions(langKey) {
  const responses = MOCK_RESPONSES[langKey] || MOCK_RESPONSES.en
  return responses.slice(0, 3).map((r, i) => {
    const questionMap = {
      hi: [
        'कीटनाशक कैसे छिड़कना चाहिए?',
        'ट्रैक्टर चलाते समय क्या ध्यान रखें?',
        'गर्मी में खेत में कैसे काम करें?',
      ],
      en: [
        'How to spray pesticides safely?',
        'Tractor operation safety tips?',
        'Working in heat - what precautions?',
      ],
    }
    return (questionMap[langKey] || questionMap.en)[i] || r.keywords[0]
  })
}
