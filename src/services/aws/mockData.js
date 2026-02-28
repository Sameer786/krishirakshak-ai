const MOCK_RESPONSES = {
  hi: [
    {
      keywords: ['कीटनाशक', 'छिड़काव', 'spray', 'pesticide', 'दवाई', 'दवा', 'स्प्रे', 'कीड़ेमार', 'फंगीसाइड', 'herbicide', 'insecticide', 'जहर', 'poison'],
      answer: 'कीटनाशक छिड़काव के लिए सुरक्षा नियम:\n\n1. हमेशा दस्ताने, मास्क और चश्मा पहनें\n2. हवा की दिशा में खड़े होकर छिड़काव करें\n3. छिड़काव के बाद हाथ-मुंह साबुन से अच्छी तरह धोएं\n4. खाली बोतलों को कभी पानी भरने के लिए इस्तेमाल न करें\n5. बच्चों और जानवरों को दूर रखें\n6. सुबह या शाम को छिड़काव करें, दोपहर में नहीं\n7. छिड़काव के बाद कम से कम 24 घंटे खेत में न जाएं',
      sources: ['ICAR कीटनाशक सुरक्षा दिशानिर्देश', 'कृषि मंत्रालय अधिसूचना 2023'],
      confidence: 0.95,
    },
    {
      keywords: ['ट्रैक्टर', 'tractor', 'चलाना', 'गाड़ी', 'मशीन', 'ड्राइव', 'drive', 'हल', 'plough', 'टिलर', 'tiller', 'रोटावेटर', 'rotavator', 'कल्टीवेटर', 'cultivator'],
      answer: 'ट्रैक्टर सुरक्षा के नियम:\n\n1. ट्रैक्टर चालू करने से पहले चारों तरफ देखें\n2. सीट बेल्ट हमेशा लगाएं\n3. ढलान पर धीमी गति से चलाएं\n4. कभी भी चलते ट्रैक्टर से न कूदें\n5. रात में लाइट जरूर जलाएं\n6. बच्चों को ट्रैक्टर पर न बैठाएं\n7. नियमित रूप से ब्रेक और टायर की जांच करें\n8. ट्रैक्टर पर अधिक भार न लादें',
      sources: ['भारतीय मानक ब्यूरो - ट्रैक्टर सुरक्षा', 'ICAR कृषि यंत्र विभाग'],
      confidence: 0.93,
    },
    {
      keywords: ['गर्मी', 'धूप', 'heat', 'sun', 'लू', 'तापमान', 'गरम', 'पसीना', 'heatstroke', 'sunstroke', 'loo', 'summer'],
      answer: 'गर्मी में सुरक्षित काम के उपाय:\n\n1. सुबह जल्दी या शाम को काम करें (10AM-4PM से बचें)\n2. हर 30 मिनट में पानी पिएं\n3. सिर पर टोपी या कपड़ा रखें\n4. हल्के रंग के ढीले कपड़े पहनें\n5. ORS या नमक-चीनी का घोल साथ रखें\n6. चक्कर आने पर तुरंत छाया में जाएं\n7. साथी किसान का ध्यान रखें\n8. भारी काम दोपहर में न करें',
      sources: ['राष्ट्रीय आपदा प्रबंधन प्राधिकरण', 'WHO हीट स्ट्रेस गाइडलाइन'],
      confidence: 0.96,
    },
    {
      keywords: ['बिजली', 'करंट', 'electric', 'तार', 'बिजली का झटका', 'शॉक', 'shock', 'wire', 'current', 'voltage', 'बिजली लाइन'],
      answer: 'खेत में बिजली सुरक्षा:\n\n1. बिजली के तारों के पास सिंचाई पाइप न ले जाएं\n2. गीले हाथों से बिजली के उपकरण न छुएं\n3. मोटर पंप में अर्थिंग जरूर लगवाएं\n4. टूटे तार दिखें तो दूर रहें और बिजली विभाग को बताएं\n5. बारिश में बिजली के खंभों से दूर रहें\n6. MCB/ELCB जरूर लगवाएं',
      sources: ['विद्युत सुरक्षा नियमावली भारत', 'ICAR खेत सुरक्षा मैनुअल'],
      confidence: 0.92,
    },
    {
      keywords: ['सांप', 'snake', 'काटना', 'bite', 'कीड़ा', 'बिच्छू', 'scorpion', 'sting', 'डंक', 'मकड़ी', 'spider'],
      answer: 'सांप/कीड़े काटने पर प्राथमिक उपचार:\n\n1. घबराएं नहीं, शांत रहें\n2. काटी हुई जगह को हिलाएं नहीं\n3. कसकर पट्टी न बांधें\n4. चीरा न लगाएं, मुंह से जहर न चूसें\n5. तुरंत नजदीकी अस्पताल जाएं\n6. अगर हो सके तो सांप की फोटो लें\n7. खेत में जूते और लंबे कपड़े पहनें',
      sources: ['WHO सर्पदंश उपचार प्रोटोकॉल', 'भारतीय चिकित्सा अनुसंधान परिषद'],
      confidence: 0.94,
    },
    {
      keywords: ['PPE', 'सुरक्षा उपकरण', 'दस्ताने', 'मास्क', 'चश्मा', 'कपड़े', 'protective', 'gloves', 'safety gear', 'helmet', 'जूते', 'boots'],
      answer: 'खेती में सुरक्षा उपकरण (PPE):\n\n1. दस्ताने: कीटनाशक और उर्वरक छूने के लिए\n2. मास्क: धूल और रसायन से बचाव\n3. चश्मा: छिड़काव और कटाई के समय\n4. जूते: सांप, कांटे और नमी से बचाव\n5. टोपी: धूप और गर्मी से बचाव\n6. पूरे बांह के कपड़े: त्वचा सुरक्षा\n7. PPE को काम के बाद अच्छी तरह धोएं',
      sources: ['ICAR सुरक्षा गाइडलाइन', 'कृषि श्रमिक सुरक्षा अधिनियम'],
      confidence: 0.91,
    },
    {
      keywords: ['रासायनिक', 'भंडारण', 'storage', 'chemical', 'रखना', 'स्टोर', 'store', 'खाद', 'fertilizer', 'उर्वरक', 'यूरिया', 'urea', 'DAP'],
      answer: 'रसायनों/खाद का सुरक्षित भंडारण:\n\n1. बच्चों की पहुंच से दूर रखें\n2. खाने-पीने की चीजों से अलग रखें\n3. ठंडी और सूखी जगह पर रखें\n4. मूल पैकेजिंग में ही रखें, दूसरे बर्तन में न डालें\n5. लेबल हमेशा पढ़ें और समाप्ति तिथि जांचें\n6. ताला लगाकर रखें\n7. खाली बोतलें तोड़कर गड्ढे में गाड़ दें',
      sources: ['CIB&RC दिशानिर्देश', 'कीटनाशक अधिनियम 1968'],
      confidence: 0.93,
    },
    {
      keywords: ['मशीनरी', 'maintenance', 'मरम्मत', 'रखरखाव', 'सर्विस', 'repair', 'tool', 'औजार', 'उपकरण', 'equipment'],
      answer: 'कृषि मशीनरी रखरखाव:\n\n1. हर उपयोग से पहले तेल और पानी जांचें\n2. चलती मशीन की मरम्मत कभी न करें\n3. ढीले कपड़े पहनकर मशीन न चलाएं\n4. बेल्ट और चेन की नियमित जांच करें\n5. मशीन बंद करके ही सफाई करें\n6. स्पेयर पार्ट्स केवल प्रमाणित ही इस्तेमाल करें\n7. मशीन के पास आग न जलाएं',
      sources: ['ICAR कृषि इंजीनियरिंग विभाग', 'FMC मशीनरी सुरक्षा मैनुअल'],
      confidence: 0.90,
    },
    {
      keywords: ['प्राथमिक उपचार', 'first aid', 'जहर', 'poison', 'विषाक्तता', 'exposure', 'चोट', 'injury', 'घाव', 'wound', 'कट', 'cut'],
      answer: 'कीटनाशक विषाक्तता प्राथमिक उपचार:\n\n1. रोगी को खुली हवा में ले जाएं\n2. दूषित कपड़े तुरंत उतारें\n3. त्वचा पर लगा हो तो साबुन-पानी से धोएं\n4. आंखों में गया हो तो 15 मिनट पानी से धोएं\n5. निगल लिया हो तो उल्टी न करवाएं\n6. तुरंत 108 पर कॉल करें\n7. कीटनाशक का लेबल/बोतल अस्पताल ले जाएं',
      sources: ['WHO कीटनाशक विषाक्तता गाइड', 'AIIMS आपातकालीन प्रोटोकॉल'],
      confidence: 0.95,
    },
    {
      keywords: ['सिंचाई', 'irrigation', 'पानी', 'pump', 'पंप', 'नहर', 'कुआं', 'well', 'बोर', 'bore', 'ट्यूबवेल', 'tubewell', 'मोटर'],
      answer: 'सिंचाई प्रणाली सुरक्षा:\n\n1. पंप चालू करने से पहले वायरिंग जांचें\n2. नहर/कुएं के पास बच्चों को न जाने दें\n3. पंप की मोटर पर अर्थिंग लगवाएं\n4. पाइप लाइन में लीकेज तुरंत ठीक करें\n5. बरसात में पंप हाउस में पानी न भरने दें\n6. ड्रिप/स्प्रिंकलर की नियमित सफाई करें',
      sources: ['जल संसाधन मंत्रालय', 'ICAR सिंचाई सुरक्षा'],
      confidence: 0.89,
    },
    {
      keywords: ['कटाई', 'harvest', 'फसल कटाई', 'काटना', 'reaping', 'cutting', 'हंसिया', 'sickle', 'कंबाइन', 'combine'],
      answer: 'फसल कटाई सुरक्षा:\n\n1. हंसिया/दरांती की धार तेज रखें (कम बल लगता है)\n2. दस्ताने पहनकर काम करें\n3. कंबाइन हार्वेस्टर के पास सावधानी रखें\n4. बंडल बांधते समय कमर सीधी रखें\n5. भारी बोझ न उठाएं, ट्रॉली का उपयोग करें\n6. बारिश में गीली फसल काटते समय फिसलन से बचें',
      sources: ['ICAR कटाई सुरक्षा मैनुअल', 'कृषि श्रमिक कल्याण बोर्ड'],
      confidence: 0.91,
    },
    {
      keywords: ['अनाज', 'grain', 'गोदाम', 'बोरी', 'silo', 'bag', 'godown'],
      answer: 'अनाज भंडारण सुरक्षा:\n\n1. गोदाम में हवा का आवागमन सुनिश्चित करें\n2. अनाज सूखा होने पर ही भंडारण करें\n3. गोदाम में चूहे/कीड़ों से बचाव करें\n4. भंडारण गृह में जाने से पहले हवा आने दें (जहरीली गैस)\n5. नमी से बचाव के लिए प्लास्टिक शीट बिछाएं\n6. बोरियों को दीवार से दूर रखें',
      sources: ['FCI भंडारण दिशानिर्देश', 'खाद्य सुरक्षा अधिनियम'],
      confidence: 0.90,
    },
    {
      keywords: ['आग', 'fire', 'जलाना', 'पराली', 'stubble', 'burn', 'flame', 'धुआं', 'smoke'],
      answer: 'आग सुरक्षा और पराली जलाना:\n\n1. पराली जलाने से पहले फायर ब्रेक बनाएं\n2. पानी और रेत पास में रखें\n3. तेज हवा में कभी न जलाएं\n4. आसपास के किसानों को सूचित करें\n5. जलती आग को कभी अकेला न छोड़ें\n6. पराली को मल्चिंग/कंपोस्ट में बदलें (बेहतर विकल्प)\n7. अगर आग फैले तो 101 पर कॉल करें',
      sources: ['राष्ट्रीय हरित प्राधिकरण', 'अग्निशमन विभाग दिशानिर्देश'],
      confidence: 0.92,
    },
    {
      keywords: ['जानवर', 'animal', 'पशु', 'गाय', 'भैंस', 'बैल', 'cow', 'buffalo', 'bull', 'cattle', 'livestock', 'बकरी', 'goat'],
      answer: 'पशु सुरक्षा नियम:\n\n1. अजनबी जानवरों के पास धीरे-धीरे जाएं\n2. जानवर को पीछे से कभी न छुएं\n3. बीमार जानवर को छूने से पहले दस्ताने पहनें\n4. बैल/भैंसे को बांधने के लिए मजबूत रस्सी उपयोग करें\n5. पशु चिकित्सक की सलाह नियमित लें\n6. जानवरों के टीकाकरण समय पर करवाएं',
      sources: ['पशुपालन विभाग', 'ICAR पशु सुरक्षा दिशानिर्देश'],
      confidence: 0.88,
    },
    {
      keywords: ['प्रदूषण', 'contamination', 'दूषित', 'पीने', 'drinking', 'quality', 'शुद्ध', 'pure', 'safe water'],
      answer: 'खेत में पानी सुरक्षा:\n\n1. कीटनाशक छिड़काव के पास पीने का पानी न रखें\n2. खेत का पानी बिना उबाले न पिएं\n3. रासायनिक बर्तन कभी पानी के स्रोत के पास न धोएं\n4. कुएं को ढक कर रखें\n5. पानी की टंकी की नियमित सफाई करें\n6. बारिश के पानी का संग्रह सुरक्षित तरीके से करें',
      sources: ['जल गुणवत्ता मानक BIS', 'स्वच्छ भारत जल सुरक्षा'],
      confidence: 0.91,
    },
    // --- Crop-specific safety entries ---
    {
      keywords: ['गन्ना', 'गन्ने', 'sugarcane', 'sugar cane', 'शुगर केन', 'शुगरकेन', 'ईख', 'गुड़', 'jaggery'],
      answer: 'गन्ने की खेती में सुरक्षा:\n\n1. गन्ना काटते समय दस्ताने और पूरी बांह के कपड़े पहनें — पत्तियों से कट लग सकता है\n2. गन्ने के खेत में जाने से पहले जूते पहनें (सांप छिपे हो सकते हैं)\n3. गन्ना लोडिंग करते समय सावधानी रखें — भारी बंडल से चोट का खतरा\n4. कोल्हू/क्रशर चलाते समय हाथ दूर रखें\n5. गन्ने में कीटनाशक छिड़काव के बाद 48 घंटे खेत में न जाएं\n6. गर्मी में काम करते समय पानी पीते रहें\n7. गन्ना जलाने से बचें — पराली की तरह धुएं से सांस की समस्या होती है',
      sources: ['ICAR गन्ना अनुसंधान संस्थान', 'कृषि सुरक्षा दिशानिर्देश'],
      confidence: 0.92,
    },
    {
      keywords: ['धान', 'चावल', 'rice', 'paddy', 'रोपाई', 'transplanting', 'बुवाई'],
      answer: 'धान की खेती में सुरक्षा:\n\n1. रोपाई करते समय रबर के जूते/गमबूट पहनें\n2. पानी भरे खेत में नंगे पैर न जाएं (संक्रमण का खतरा)\n3. लंबे समय तक झुककर काम न करें — बीच-बीच में आराम करें\n4. जलभराव वाले खेत में बिजली के तार/उपकरण से दूर रहें\n5. कीटनाशक छिड़काव पानी में मिलकर और खतरनाक हो सकता है\n6. मच्छरों से बचाव के लिए पूरे कपड़े पहनें',
      sources: ['ICAR धान अनुसंधान', 'कृषि श्रमिक स्वास्थ्य मैनुअल'],
      confidence: 0.91,
    },
    {
      keywords: ['गेहूं', 'गेहूँ', 'wheat', 'रोटी', 'आटा'],
      answer: 'गेहूं की खेती में सुरक्षा:\n\n1. कंबाइन हार्वेस्टर के पास सावधानी रखें — दूर खड़े रहें\n2. गेहूं की धूल से एलर्जी हो सकती है — मास्क पहनें\n3. बुवाई के समय बीज उपचार रसायनों को सीधे न छुएं\n4. भंडारण में जाने से पहले हवा का इंतजार करें\n5. गेहूं की पराली जलाना कानूनन प्रतिबंधित है — मल्चिंग करें\n6. भारी बोरियां उठाते समय कमर सीधी रखें',
      sources: ['ICAR गेहूं अनुसंधान निदेशालय', 'कृषि मंत्रालय'],
      confidence: 0.90,
    },
    {
      keywords: ['कपास', 'cotton', 'रुई', 'कॉटन', 'BT', 'बीटी'],
      answer: 'कपास की खेती में सुरक्षा:\n\n1. कपास चुनते समय दस्ताने पहनें — कांटों से कट लग सकती है\n2. BT कपास के बीज का अनधिकृत कीटनाशक उपयोग खतरनाक है\n3. कीटनाशक छिड़काव में PPE अनिवार्य है\n4. कपास की धूल से सांस की बीमारी हो सकती है — मास्क पहनें\n5. खेत में काम के बाद कपड़े बदलें और नहाएं\n6. बच्चों को कपास चुनने के काम में न लगाएं',
      sources: ['ICAR केंद्रीय कपास अनुसंधान संस्थान', 'कृषि श्रमिक सुरक्षा'],
      confidence: 0.90,
    },
    {
      keywords: ['सोयाबीन', 'soybean', 'सोया', 'soya', 'दाल', 'दलहन', 'pulse', 'मूंग', 'moong', 'चना', 'chana', 'अरहर', 'तूर'],
      answer: 'दलहन/सोयाबीन की खेती में सुरक्षा:\n\n1. बीज उपचार रसायनों को नंगे हाथ से न छुएं\n2. फसल सुखाते समय धूल से बचने के लिए मास्क पहनें\n3. दाल की बोरियां उठाते समय सही तरीके से उठाएं\n4. कीटनाशक छिड़काव के बाद निर्धारित समय तक खेत में न जाएं\n5. भंडारण में कीड़ों से बचाव के लिए सुरक्षित तरीके अपनाएं\n6. फसल अवशेषों को जलाने की बजाय खाद बनाएं',
      sources: ['ICAR दलहन अनुसंधान', 'कृषि सुरक्षा दिशानिर्देश'],
      confidence: 0.88,
    },
    {
      keywords: ['सब्जी', 'vegetable', 'सब्ज़ी', 'टमाटर', 'tomato', 'आलू', 'potato', 'प्याज', 'onion', 'मिर्च', 'chilli', 'बैंगन', 'brinjal', 'भिंडी', 'okra', 'गोभी', 'cauliflower', 'पालक', 'spinach'],
      answer: 'सब्जी की खेती में सुरक्षा:\n\n1. सब्जियों पर कीटनाशक छिड़काव के बाद निश्चित अवधि तक तोड़ाई न करें\n2. जैविक खेती अपनाएं — रासायनिक अवशेष से बचें\n3. ग्रीनहाउस में काम करते समय हवा का ध्यान रखें — गर्मी से बचें\n4. सब्जी धोए बिना न खाएं — कीटनाशक अवशेष हो सकता है\n5. खाद और उर्वरक मिलाते समय दस्ताने पहनें\n6. सब्जी के तेज कांटों/पत्तियों से कट से बचने के लिए दस्ताने पहनें',
      sources: ['ICAR सब्जी अनुसंधान', 'खाद्य सुरक्षा मानक'],
      confidence: 0.89,
    },
    {
      keywords: ['फल', 'fruit', 'आम', 'mango', 'केला', 'banana', 'अमरूद', 'guava', 'सेब', 'apple', 'संतरा', 'orange', 'अंगूर', 'grape', 'बागवानी', 'horticulture', 'बाग', 'orchard'],
      answer: 'बागवानी/फल की खेती में सुरक्षा:\n\n1. पेड़ पर चढ़ते समय सीढ़ी और सुरक्षा बेल्ट का उपयोग करें\n2. ऊंचाई से फल तोड़ते समय सावधानी रखें — गिरने का खतरा\n3. फल पर छिड़काव के बाद निर्धारित अवधि तक न तोड़ें\n4. कार्बाइड से पकाए फल स्वास्थ्य के लिए हानिकारक हैं\n5. पैकिंग और ट्रांसपोर्ट में स्वच्छता बनाए रखें\n6. बागवानी उपकरण (कैंची, आरी) सावधानी से उपयोग करें',
      sources: ['ICAR बागवानी अनुसंधान', 'फल उत्पादन सुरक्षा मैनुअल'],
      confidence: 0.89,
    },
    // --- Additional safety topics ---
    {
      keywords: ['बारिश', 'rain', 'बाढ़', 'flood', 'तूफान', 'storm', 'बिजली गिरना', 'lightning', 'आंधी', 'मौसम', 'weather'],
      answer: 'बारिश/तूफान में खेत सुरक्षा:\n\n1. बिजली चमकने पर खुले खेत में न रहें — पेड़ के नीचे भी न खड़े हों\n2. बाढ़ के पानी में न चलें — करंट और संक्रमण का खतरा\n3. तेज हवा में मशीनरी न चलाएं\n4. बारिश के बाद बिजली उपकरण जांच कर ही चालू करें\n5. जलभराव में मच्छरों से बचाव करें\n6. फसल बीमा कराएं — प्रधानमंत्री फसल बीमा योजना',
      sources: ['IMD मौसम सुरक्षा', 'राष्ट्रीय आपदा प्रबंधन'],
      confidence: 0.90,
    },
    {
      keywords: ['कमर दर्द', 'back pain', 'शरीर दर्द', 'body pain', 'थकान', 'fatigue', 'मांसपेशी', 'muscle', 'ergonomic', 'स्वास्थ्य', 'health', 'बीमारी', 'disease', 'skin', 'त्वचा', 'allergy', 'एलर्जी', 'सांस', 'breathing'],
      answer: 'किसान स्वास्थ्य और शरीर सुरक्षा:\n\n1. लंबे समय तक झुककर काम न करें — हर 30 मिनट में खड़े हों\n2. भारी बोझ उठाते समय घुटने मोड़ें, कमर नहीं\n3. कीटनाशक से त्वचा एलर्जी होने पर तुरंत डॉक्टर दिखाएं\n4. धूल और रसायन से सांस की समस्या के लिए मास्क पहनें\n5. पर्याप्त पानी पिएं और पौष्टिक भोजन करें\n6. नियमित स्वास्थ्य जांच करवाएं',
      sources: ['AIIMS कृषि स्वास्थ्य अध्ययन', 'WHO कृषि श्रमिक स्वास्थ्य'],
      confidence: 0.88,
    },
    {
      keywords: ['मिट्टी', 'soil', 'खाद', 'manure', 'compost', 'कम्पोस्ट', 'जैविक', 'organic', 'वर्मीकम्पोस्ट', 'vermicompost'],
      answer: 'मिट्टी और खाद सुरक्षा:\n\n1. रासायनिक खाद मिलाते समय दस्ताने और मास्क पहनें\n2. यूरिया, DAP आदि को सीधे हाथों से न छुएं\n3. जैविक खाद (गोबर, कम्पोस्ट) बनाते समय दस्ताने पहनें\n4. खाद को बच्चों की पहुंच से दूर रखें\n5. मिट्टी परीक्षण करवाएं — अधिक रसायन से मिट्टी खराब होती है\n6. जैविक खेती अपनाएं — स्वास्थ्य और मिट्टी दोनों के लिए अच्छा',
      sources: ['ICAR मृदा विज्ञान', 'जैविक खेती मिशन'],
      confidence: 0.87,
    },
    {
      keywords: ['बीज', 'seed', 'बीजोपचार', 'seed treatment', 'नर्सरी', 'nursery', 'पौध', 'seedling'],
      answer: 'बीज उपचार सुरक्षा:\n\n1. बीज उपचार रसायन (थीरम, कार्बेंडाजिम) को नंगे हाथ से न छुएं\n2. बीज उपचार करते समय मास्क और दस्ताने पहनें\n3. उपचारित बीज को खाने या जानवरों को खिलाने के लिए कभी उपयोग न करें\n4. बीज उपचार बच्चों की पहुंच से दूर करें\n5. बचे हुए रसायन को सुरक्षित तरीके से निपटान करें\n6. बीज उपचार के बाद हाथ अच्छी तरह धोएं',
      sources: ['ICAR बीज विज्ञान', 'कृषि विभाग दिशानिर्देश'],
      confidence: 0.88,
    },
  ],
  en: [
    {
      keywords: ['pesticide', 'spray', 'chemical', 'insecticide', 'medicine', 'herbicide', 'fungicide', 'poison', 'weedicide'],
      answer: 'Pesticide Safety Guidelines:\n\n1. Always wear gloves, mask, and goggles\n2. Spray in the direction of the wind\n3. Wash hands and face thoroughly with soap after spraying\n4. Never reuse empty pesticide containers for water or food\n5. Keep children and animals away during spraying\n6. Spray early morning or evening, avoid midday heat\n7. Do not enter the field for at least 24 hours after spraying',
      sources: ['ICAR Pesticide Safety Guidelines', 'Ministry of Agriculture Notification 2023'],
      confidence: 0.95,
    },
    {
      keywords: ['tractor', 'driving', 'machinery', 'vehicle', 'plough', 'plow', 'tiller', 'rotavator', 'cultivator', 'harvester', 'thresher'],
      answer: 'Tractor Safety Rules:\n\n1. Check all sides before starting the tractor\n2. Always wear a seatbelt\n3. Drive slowly on slopes and uneven terrain\n4. Never jump from a moving tractor\n5. Use headlights when driving at night\n6. Never allow children to ride on the tractor\n7. Regularly check brakes, tires, and hydraulics\n8. Do not overload the tractor',
      sources: ['Bureau of Indian Standards - Tractor Safety', 'ICAR Agricultural Engineering'],
      confidence: 0.93,
    },
    {
      keywords: ['heat', 'sun', 'hot', 'summer', 'temperature', 'heatstroke', 'sunstroke', 'dehydration', 'sweat'],
      answer: 'Heat Safety Measures:\n\n1. Work early morning or evening (avoid 10AM-4PM)\n2. Drink water every 30 minutes\n3. Wear a hat or cover your head\n4. Wear light-colored, loose clothing\n5. Keep ORS or salt-sugar solution handy\n6. Move to shade immediately if you feel dizzy\n7. Watch out for fellow workers showing heat stress signs\n8. Avoid heavy physical work during peak heat',
      sources: ['National Disaster Management Authority', 'WHO Heat Stress Guidelines'],
      confidence: 0.96,
    },
    {
      keywords: ['electric', 'power', 'wire', 'shock', 'current', 'electrocution', 'voltage', 'power line'],
      answer: 'Farm Electrical Safety:\n\n1. Keep irrigation pipes away from power lines\n2. Never touch electrical equipment with wet hands\n3. Ensure proper earthing for motor pumps\n4. Stay away from broken wires, report to electricity department\n5. Stay away from electric poles during rain\n6. Install MCB/ELCB for protection',
      sources: ['Indian Electricity Safety Regulations', 'ICAR Farm Safety Manual'],
      confidence: 0.92,
    },
    {
      keywords: ['snake', 'bite', 'insect', 'scorpion', 'sting', 'spider', 'venomous'],
      answer: 'Snake/Insect Bite First Aid:\n\n1. Stay calm, do not panic\n2. Keep the bitten area still and below heart level\n3. Do NOT tie a tight tourniquet\n4. Do NOT cut or suck the wound\n5. Rush to the nearest hospital immediately\n6. If possible, take a photo of the snake for the doctor\n7. Wear boots and long clothing in the field',
      sources: ['WHO Snakebite Treatment Protocol', 'ICMR Guidelines'],
      confidence: 0.94,
    },
    {
      keywords: ['PPE', 'protective', 'gloves', 'mask', 'goggles', 'clothing', 'equipment', 'safety gear', 'helmet', 'boots'],
      answer: 'Farm Personal Protective Equipment (PPE):\n\n1. Gloves: For handling pesticides and fertilizers\n2. Mask: Protection from dust and chemicals\n3. Goggles: During spraying and harvesting\n4. Boots: Protection from snakes, thorns, and moisture\n5. Hat: Sun and heat protection\n6. Full-sleeve clothing: Skin protection\n7. Clean PPE thoroughly after each use',
      sources: ['ICAR Safety Guidelines', 'Agricultural Workers Safety Act'],
      confidence: 0.91,
    },
    {
      keywords: ['chemical', 'storage', 'store', 'keep', 'container', 'fertilizer', 'urea', 'DAP', 'manure'],
      answer: 'Chemical Storage Safety:\n\n1. Keep away from children\n2. Store separately from food and water\n3. Keep in cool, dry place\n4. Keep in original packaging, never transfer to other containers\n5. Always read labels and check expiry dates\n6. Keep under lock and key\n7. Dispose empty containers by crushing and burying',
      sources: ['CIB&RC Guidelines', 'Insecticides Act 1968'],
      confidence: 0.93,
    },
    {
      keywords: ['maintenance', 'repair', 'service', 'tool', 'implement'],
      answer: 'Farm Machinery Maintenance Safety:\n\n1. Check oil and water before every use\n2. Never repair a running machine\n3. Do not wear loose clothing near machines\n4. Regularly inspect belts and chains\n5. Turn off machine before cleaning\n6. Use only certified spare parts\n7. Do not light fires near machinery',
      sources: ['ICAR Agricultural Engineering Division', 'FMC Machinery Safety Manual'],
      confidence: 0.90,
    },
    {
      keywords: ['first aid', 'poison', 'exposure', 'poisoning', 'toxic', 'injury', 'wound', 'cut', 'bleeding'],
      answer: 'Pesticide Exposure First Aid:\n\n1. Move the person to fresh air immediately\n2. Remove contaminated clothing\n3. If on skin, wash with soap and water\n4. If in eyes, rinse with water for 15 minutes\n5. If swallowed, do NOT induce vomiting\n6. Call 108 emergency immediately\n7. Take the pesticide label/bottle to the hospital',
      sources: ['WHO Pesticide Poisoning Guide', 'AIIMS Emergency Protocol'],
      confidence: 0.95,
    },
    {
      keywords: ['irrigation', 'water', 'pump', 'canal', 'well', 'bore', 'tubewell', 'motor', 'sprinkler', 'drip'],
      answer: 'Irrigation System Safety:\n\n1. Check wiring before starting the pump\n2. Keep children away from canals and wells\n3. Ensure proper earthing on pump motors\n4. Fix pipeline leaks immediately\n5. Prevent water from flooding the pump house during rain\n6. Clean drip/sprinkler systems regularly',
      sources: ['Ministry of Water Resources', 'ICAR Irrigation Safety'],
      confidence: 0.89,
    },
    {
      keywords: ['harvest', 'harvesting', 'cutting', 'crop', 'reaping', 'sickle', 'combine'],
      answer: 'Harvesting Safety:\n\n1. Keep sickles/blades sharp (requires less force)\n2. Wear gloves while working\n3. Be careful near combine harvesters\n4. Keep your back straight while bundling\n5. Do not carry heavy loads, use a trolley\n6. Watch for slippery conditions when harvesting wet crops',
      sources: ['ICAR Harvesting Safety Manual', 'Agricultural Workers Welfare Board'],
      confidence: 0.91,
    },
    {
      keywords: ['grain', 'warehouse', 'silo', 'bag', 'godown'],
      answer: 'Grain Storage Safety:\n\n1. Ensure ventilation in the storage area\n2. Only store grain when completely dry\n3. Protect against rodents and insects\n4. Allow fresh air before entering storage (toxic gases)\n5. Use plastic sheets to prevent moisture\n6. Keep bags away from walls',
      sources: ['FCI Storage Guidelines', 'Food Safety Act'],
      confidence: 0.90,
    },
    {
      keywords: ['fire', 'burn', 'stubble', 'flame', 'smoke'],
      answer: 'Fire Safety & Stubble Burning:\n\n1. Create firebreaks around the field before burning\n2. Keep water and sand ready to control fire\n3. Never burn on windy days\n4. Inform nearby farmers before burning\n5. Never leave a fire unattended\n6. Consider mulching or composting as alternatives\n7. Call 101 if fire spreads out of control',
      sources: ['National Green Tribunal', 'Fire Department Guidelines'],
      confidence: 0.92,
    },
    {
      keywords: ['animal', 'cattle', 'cow', 'buffalo', 'bull', 'livestock', 'goat', 'poultry', 'chicken'],
      answer: 'Animal Handling Safety:\n\n1. Approach unfamiliar animals slowly and calmly\n2. Never touch an animal from behind\n3. Wear gloves when handling sick animals\n4. Use strong ropes for tying bulls/buffaloes\n5. Get regular veterinary checkups\n6. Ensure timely vaccination of all livestock',
      sources: ['Department of Animal Husbandry', 'ICAR Animal Safety Guidelines'],
      confidence: 0.88,
    },
    {
      keywords: ['contamination', 'pollution', 'drinking', 'quality', 'pure', 'safe water'],
      answer: 'Farm Water Safety:\n\n1. Do not keep drinking water near pesticide spraying areas\n2. Do not drink field water without boiling\n3. Never wash chemical containers near water sources\n4. Keep wells covered\n5. Clean water tanks regularly\n6. Collect rainwater safely using proper methods',
      sources: ['BIS Water Quality Standards', 'Swachh Bharat Water Safety'],
      confidence: 0.91,
    },
    // --- Crop-specific safety entries ---
    {
      keywords: ['sugarcane', 'sugar cane', 'cane', 'jaggery', 'gur'],
      answer: 'Sugarcane Farming Safety:\n\n1. Wear gloves and full-sleeve clothing when cutting — leaves cause cuts\n2. Wear boots in sugarcane fields (snakes may hide in dense crop)\n3. Be careful during loading — heavy bundles can cause back injuries\n4. Keep hands away from crushers/juice extractors\n5. Wait 48 hours after pesticide spraying before entering the field\n6. Stay hydrated during fieldwork in hot weather\n7. Avoid burning sugarcane trash — causes respiratory problems',
      sources: ['ICAR Sugarcane Research Institute', 'Agricultural Safety Guidelines'],
      confidence: 0.92,
    },
    {
      keywords: ['rice', 'paddy', 'transplanting', 'sowing', 'nursery', 'seedling'],
      answer: 'Rice/Paddy Farming Safety:\n\n1. Wear rubber boots during transplanting — avoid going barefoot\n2. Standing water can cause skin infections — wear protective gear\n3. Take breaks from bending — rest every 30 minutes\n4. Keep away from electrical equipment in waterlogged fields\n5. Pesticides in standing water are more hazardous — use extra PPE\n6. Wear full clothing to protect against mosquitoes',
      sources: ['ICAR Rice Research', 'Agricultural Workers Health Manual'],
      confidence: 0.91,
    },
    {
      keywords: ['wheat', 'roti', 'flour', 'atta'],
      answer: 'Wheat Farming Safety:\n\n1. Stay at safe distance from combine harvesters\n2. Wheat dust can cause allergies — wear a mask\n3. Wear gloves when handling seed treatment chemicals\n4. Allow ventilation before entering grain storage\n5. Burning wheat stubble is banned — use mulching instead\n6. Keep your back straight when lifting heavy bags',
      sources: ['ICAR Wheat Research Directorate', 'Ministry of Agriculture'],
      confidence: 0.90,
    },
    {
      keywords: ['cotton', 'BT', 'ginning', 'fiber'],
      answer: 'Cotton Farming Safety:\n\n1. Wear gloves when picking — thorns can cause cuts\n2. Unauthorized pesticide use on BT cotton is dangerous\n3. PPE is mandatory during pesticide spraying\n4. Cotton dust can cause respiratory issues — wear a mask\n5. Change clothes and bathe after fieldwork\n6. Do not use child labor for cotton picking',
      sources: ['ICAR Central Cotton Research Institute', 'Agricultural Workers Safety'],
      confidence: 0.90,
    },
    {
      keywords: ['soybean', 'soya', 'pulse', 'dal', 'moong', 'chana', 'gram', 'lentil', 'toor', 'arhar'],
      answer: 'Pulse/Soybean Farming Safety:\n\n1. Do not touch seed treatment chemicals with bare hands\n2. Wear mask when drying crops to avoid dust inhalation\n3. Lift grain bags properly — bend knees, not back\n4. Observe waiting period after pesticide application\n5. Use safe methods for pest control in storage\n6. Compost crop residue instead of burning',
      sources: ['ICAR Pulse Research', 'Agricultural Safety Guidelines'],
      confidence: 0.88,
    },
    {
      keywords: ['vegetable', 'tomato', 'potato', 'onion', 'chilli', 'brinjal', 'okra', 'cauliflower', 'spinach', 'garden', 'kitchen garden'],
      answer: 'Vegetable Farming Safety:\n\n1. Observe pre-harvest interval after pesticide spraying\n2. Adopt organic methods to avoid chemical residues\n3. Ensure ventilation when working in greenhouses\n4. Always wash vegetables before eating — pesticide residue risk\n5. Wear gloves when mixing fertilizers\n6. Use gloves to avoid cuts from thorny/sharp plant parts',
      sources: ['ICAR Vegetable Research', 'Food Safety Standards'],
      confidence: 0.89,
    },
    {
      keywords: ['fruit', 'mango', 'banana', 'guava', 'apple', 'orange', 'grape', 'orchard', 'horticulture', 'garden'],
      answer: 'Fruit Farming/Orchard Safety:\n\n1. Use ladder and safety belt when climbing trees\n2. Be careful picking fruit at height — fall risk\n3. Observe waiting period after spraying before harvesting\n4. Carbide-ripened fruit is harmful to health\n5. Maintain hygiene during packing and transport\n6. Use pruning shears and saws carefully',
      sources: ['ICAR Horticultural Research', 'Fruit Production Safety Manual'],
      confidence: 0.89,
    },
    {
      keywords: ['rain', 'flood', 'storm', 'lightning', 'thunder', 'weather', 'cyclone', 'wind'],
      answer: 'Rain/Storm Farm Safety:\n\n1. Do not stay in open fields during lightning — avoid standing under trees\n2. Do not walk in floodwater — risk of electrocution and infection\n3. Do not operate machinery in high winds\n4. Inspect electrical equipment before use after rain\n5. Protect against mosquitoes in waterlogged areas\n6. Get crop insurance — PM Fasal Bima Yojana',
      sources: ['IMD Weather Safety', 'National Disaster Management'],
      confidence: 0.90,
    },
    {
      keywords: ['back pain', 'body pain', 'fatigue', 'muscle', 'ergonomic', 'health', 'disease', 'skin', 'allergy', 'breathing', 'respiratory', 'lung'],
      answer: 'Farmer Health & Body Safety:\n\n1. Do not bend continuously — stand up every 30 minutes\n2. Bend knees when lifting heavy loads, not your back\n3. See a doctor immediately if you get skin allergies from pesticides\n4. Wear mask to prevent dust and chemical respiratory issues\n5. Stay hydrated and eat nutritious food\n6. Get regular health checkups',
      sources: ['AIIMS Agricultural Health Study', 'WHO Agricultural Workers Health'],
      confidence: 0.88,
    },
    {
      keywords: ['soil', 'compost', 'organic', 'vermicompost', 'worm', 'earth'],
      answer: 'Soil & Fertilizer Safety:\n\n1. Wear gloves and mask when mixing chemical fertilizers\n2. Do not touch urea, DAP etc. with bare hands\n3. Wear gloves when making organic compost\n4. Keep fertilizers out of reach of children\n5. Get soil tested — excess chemicals harm soil health\n6. Adopt organic farming — better for health and soil',
      sources: ['ICAR Soil Science', 'Organic Farming Mission'],
      confidence: 0.87,
    },
    {
      keywords: ['seed', 'seed treatment', 'nursery', 'seedling', 'germination'],
      answer: 'Seed Treatment Safety:\n\n1. Do not handle seed treatment chemicals (Thiram, Carbendazim) with bare hands\n2. Wear mask and gloves during seed treatment\n3. Never eat or feed treated seeds to animals\n4. Keep seed treatment area away from children\n5. Dispose leftover chemicals safely\n6. Wash hands thoroughly after seed treatment',
      sources: ['ICAR Seed Science', 'Agriculture Department Guidelines'],
      confidence: 0.88,
    },
  ],
}

const FALLBACK = {
  hi: {
    answer: 'यह विषय हमारे डेमो में अभी उपलब्ध नहीं है, लेकिन यहां कुछ सामान्य कृषि सुरक्षा सुझाव हैं:\n\n1. खेत में काम करते समय हमेशा सुरक्षा उपकरण (दस्ताने, मास्क, जूते) पहनें\n2. कीटनाशक और रसायनों को सावधानी से संभालें — लेबल पढ़ें\n3. गर्मी में पर्याप्त पानी पिएं और छाया में आराम करें\n4. मशीनरी चलाने से पहले सुरक्षा जांच करें\n5. आपातकाल में 108 (एम्बुलेंस) या 112 (आपातकालीन) पर कॉल करें\n\nपूर्ण AI सहायता के लिए, AWS बैकएंड से कनेक्ट करें। अभी Quick Questions दबाकर और विषय पूछें।',
    sources: ['ICAR कृषि सुरक्षा', 'कृषि मंत्रालय'],
    confidence: 0.6,
  },
  en: {
    answer: "This topic isn't available in our demo yet, but here are some general farm safety tips:\n\n1. Always wear safety equipment (gloves, mask, boots) when working in the field\n2. Handle pesticides and chemicals carefully — always read labels\n3. Stay hydrated in the heat and rest in the shade regularly\n4. Do safety checks before operating any machinery\n5. In emergencies, call 108 (ambulance) or 112 (emergency)\n\nFor full AI assistance, connect the AWS backend. Try tapping Quick Questions for specific safety topics.",
    sources: ['ICAR Agricultural Safety', 'Ministry of Agriculture'],
    confidence: 0.6,
  },
}

/**
 * Find the best matching mock answer using keyword scoring.
 * Returns the response with the most keyword matches, or fallback.
 */
export function findMockAnswer(question, langKey) {
  const responses = MOCK_RESPONSES[langKey] || MOCK_RESPONSES.en
  const q = question.toLowerCase()

  // Score each response by number of keyword matches
  let bestMatch = null
  let bestScore = 0

  for (const r of responses) {
    let score = 0
    for (const kw of r.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = r
    }
  }

  return bestMatch || FALLBACK[langKey] || FALLBACK.en
}

export function getSampleQuestions(lang) {
  const langKey = typeof lang === 'string' && lang.startsWith('hi') ? 'hi' : 'en'
  const questionMap = {
    hi: [
      'कीटनाशक कैसे छिड़कना चाहिए?',
      'ट्रैक्टर चलाते समय क्या ध्यान रखें?',
      'गर्मी में खेत में कैसे काम करें?',
      'गन्ने की खेती में क्या सावधानी रखें?',
      'सांप काटने पर क्या करें?',
    ],
    en: [
      'How to spray pesticides safely?',
      'Tractor operation safety tips?',
      'Working in heat - what precautions?',
      'Sugarcane farming safety tips?',
      'What to do if bitten by a snake?',
    ],
  }
  return questionMap[langKey] || questionMap.en
}
