const RESPONSES = {
  hi: [
    {
      keywords: ['कीटनाशक', 'छिड़काव', 'spray', 'pesticide'],
      question: 'कीटनाशक कैसे छिड़कना चाहिए?',
      answer:
        'कीटनाशक छिड़काव के लिए सुरक्षा नियम:\n\n' +
        '1. हमेशा दस्ताने, मास्क और चश्मा पहनें\n' +
        '2. हवा की दिशा में खड़े होकर छिड़काव करें\n' +
        '3. छिड़काव के बाद हाथ-मुंह साबुन से अच्छी तरह धोएं\n' +
        '4. खाली बोतलों को कभी पानी भरने के लिए इस्तेमाल न करें\n' +
        '5. बच्चों और जानवरों को दूर रखें\n' +
        '6. सुबह या शाम को छिड़काव करें, दोपहर में नहीं',
    },
    {
      keywords: ['ट्रैक्टर', 'tractor', 'चलाना', 'driving'],
      question: 'ट्रैक्टर चलाते समय क्या ध्यान रखें?',
      answer:
        'ट्रैक्टर सुरक्षा के नियम:\n\n' +
        '1. ट्रैक्टर चालू करने से पहले चारों तरफ देखें\n' +
        '2. सीट बेल्ट हमेशा लगाएं\n' +
        '3. ढलान पर धीमी गति से चलाएं\n' +
        '4. कभी भी चलते ट्रैक्टर से न कूदें\n' +
        '5. रात में लाइट जरूर जलाएं\n' +
        '6. बच्चों को ट्रैक्टर पर न बैठाएं\n' +
        '7. नियमित रूप से ब्रेक और टायर की जांच करें',
    },
    {
      keywords: ['गर्मी', 'धूप', 'heat', 'sun', 'लू'],
      question: 'गर्मी में खेत में कैसे काम करें?',
      answer:
        'गर्मी में सुरक्षित काम के उपाय:\n\n' +
        '1. सुबह जल्दी या शाम को काम करें (10AM-4PM से बचें)\n' +
        '2. हर 30 मिनट में पानी पिएं\n' +
        '3. सिर पर टोपी या कपड़ा रखें\n' +
        '4. हल्के रंग के ढीले कपड़े पहनें\n' +
        '5. ORS या नमक-चीनी का घोल साथ रखें\n' +
        '6. चक्कर आने पर तुरंत छाया में जाएं\n' +
        '7. साथी किसान का ध्यान रखें',
    },
    {
      keywords: ['बिजली', 'करंट', 'electric', 'तार'],
      question: 'खेत में बिजली से कैसे बचें?',
      answer:
        'बिजली सुरक्षा:\n\n' +
        '1. बिजली के तारों के पास सिंचाई पाइप न ले जाएं\n' +
        '2. गीले हाथों से बिजली के उपकरण न छुएं\n' +
        '3. मोटर पंप में अर्थिंग जरूर लगवाएं\n' +
        '4. टूटे तार दिखें तो दूर रहें और बिजली विभाग को बताएं\n' +
        '5. बारिश में बिजली के खंभों से दूर रहें',
    },
    {
      keywords: ['सांप', 'snake', 'काटना', 'bite'],
      question: 'सांप काटने पर क्या करें?',
      answer:
        'सांप काटने पर प्राथमिक उपचार:\n\n' +
        '1. घबराएं नहीं, शांत रहें\n' +
        '2. काटी हुई जगह को हिलाएं नहीं\n' +
        '3. कसकर पट्टी न बांधें\n' +
        '4. चीरा न लगाएं, मुंह से जहर न चूसें\n' +
        '5. तुरंत नजदीकी अस्पताल जाएं\n' +
        '6. अगर हो सके तो सांप की फोटो लें (डॉक्टर के लिए)',
    },
  ],
  en: [
    {
      keywords: ['pesticide', 'spray', 'chemical', 'insecticide'],
      question: 'How to spray pesticides safely?',
      answer:
        'Pesticide Safety Guidelines:\n\n' +
        '1. Always wear gloves, mask, and goggles\n' +
        '2. Spray in the direction of the wind\n' +
        '3. Wash hands and face thoroughly with soap after spraying\n' +
        '4. Never reuse empty pesticide containers for water or food\n' +
        '5. Keep children and animals away during spraying\n' +
        '6. Spray early morning or evening, avoid midday heat',
    },
    {
      keywords: ['tractor', 'driving', 'machinery', 'vehicle'],
      question: 'Tractor operation safety tips?',
      answer:
        'Tractor Safety Rules:\n\n' +
        '1. Check all sides before starting the tractor\n' +
        '2. Always wear a seatbelt\n' +
        '3. Drive slowly on slopes and uneven terrain\n' +
        '4. Never jump from a moving tractor\n' +
        '5. Use headlights when driving at night\n' +
        '6. Never allow children to ride on the tractor\n' +
        '7. Regularly check brakes, tires, and hydraulics',
    },
    {
      keywords: ['heat', 'sun', 'hot', 'summer', 'temperature'],
      question: 'Working in heat - what precautions?',
      answer:
        'Heat Safety Measures:\n\n' +
        '1. Work early morning or evening (avoid 10AM-4PM)\n' +
        '2. Drink water every 30 minutes\n' +
        '3. Wear a hat or cover your head\n' +
        '4. Wear light-colored, loose clothing\n' +
        '5. Keep ORS or salt-sugar solution handy\n' +
        '6. Move to shade immediately if you feel dizzy\n' +
        '7. Watch out for fellow workers showing heat stress signs',
    },
    {
      keywords: ['electric', 'power', 'wire', 'shock', 'current'],
      question: 'How to stay safe from electricity on farm?',
      answer:
        'Electrical Safety:\n\n' +
        '1. Keep irrigation pipes away from power lines\n' +
        '2. Never touch electrical equipment with wet hands\n' +
        '3. Ensure proper earthing for motor pumps\n' +
        '4. Stay away from broken wires and report to electricity department\n' +
        '5. Stay away from electric poles during rain',
    },
    {
      keywords: ['snake', 'bite', 'animal', 'attack'],
      question: 'What to do if bitten by a snake?',
      answer:
        'Snake Bite First Aid:\n\n' +
        '1. Stay calm, do not panic\n' +
        '2. Keep the bitten area still and below heart level\n' +
        '3. Do NOT tie a tight tourniquet\n' +
        '4. Do NOT cut or suck the wound\n' +
        '5. Rush to the nearest hospital immediately\n' +
        '6. If possible, take a photo of the snake for the doctor',
    },
    {
      keywords: ['fire', 'burn', 'stubble'],
      question: 'Fire safety while burning crop stubble?',
      answer:
        'Stubble Burning Safety:\n\n' +
        '1. Create firebreaks around the field before burning\n' +
        '2. Keep water and sand ready to control fire\n' +
        '3. Never burn on windy days\n' +
        '4. Inform nearby farmers before burning\n' +
        '5. Never leave a fire unattended\n' +
        '6. Consider alternatives like mulching or composting',
    },
  ],
}

const FALLBACK = {
  hi: 'मुझे इस विषय पर अभी सटीक जानकारी नहीं मिली। कृपया अपने नजदीकी कृषि विस्तार अधिकारी से संपर्क करें। आप अपना सवाल दूसरे तरीके से भी पूछ सकते हैं।',
  en: "I don't have specific information on this topic yet. Please contact your nearest agricultural extension officer. You can also try rephrasing your question.",
}

export function getMockResponse(question, lang = 'hi') {
  const langKey = lang.startsWith('hi') ? 'hi' : 'en'
  const responses = RESPONSES[langKey]
  const q = question.toLowerCase()

  const match = responses.find((r) =>
    r.keywords.some((kw) => q.includes(kw.toLowerCase()))
  )

  if (match) {
    return { question: match.question, answer: match.answer }
  }

  return { question, answer: FALLBACK[langKey] }
}

export function getSampleQuestions(lang = 'hi') {
  const langKey = lang.startsWith('hi') ? 'hi' : 'en'
  return RESPONSES[langKey].slice(0, 3).map((r) => r.question)
}
