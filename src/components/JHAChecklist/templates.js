// PPE icon keys used in checklist items
export const PPE_ICONS = {
  mask: { label: 'Mask', hi: 'मास्क', icon: '😷' },
  gloves: { label: 'Gloves', hi: 'दस्ताने', icon: '🧤' },
  boots: { label: 'Boots', hi: 'जूते', icon: '🥾' },
  coverall: { label: 'Coverall', hi: 'कवरऑल', icon: '🦺' },
  seatbelt: { label: 'Seatbelt', hi: 'सीटबेल्ट', icon: '🪢' },
  goggles: { label: 'Goggles', hi: 'चश्मा', icon: '🥽' },
  helmet: { label: 'Helmet', hi: 'हेलमेट', icon: '⛑️' },
}

const TEMPLATES = [
  {
    id: 'pesticide',
    icon: 'pesticide',
    title: { en: 'Pesticide Application Safety', hi: 'कीटनाशक छिड़काव सुरक्षा' },
    description: {
      en: 'Complete safety checklist before pesticide spraying',
      hi: 'कीटनाशक छिड़काव से पहले पूर्ण सुरक्षा जांच सूची',
    },
    estimatedMinutes: 15,
    items: [
      {
        id: 1,
        emoji: '🧤🥽',
        en: 'Wear full PPE: mask, gloves, boots, long-sleeved clothing',
        hi: 'पूर्ण PPE पहनें: मास्क, दस्ताने, जूते, लंबी आस्तीन के कपड़े',
        ppe: ['mask', 'gloves', 'goggles', 'boots', 'coverall'],
      },
      {
        id: 2,
        emoji: '📋',
        en: 'Read and verify pesticide label instructions carefully',
        hi: 'कीटनाशक लेबल निर्देशों को ध्यान से पढ़ें और सत्यापित करें',
        ppe: [],
      },
      {
        id: 3,
        emoji: '⚗️🧪',
        en: 'Verify pesticide mixing ratios per label instructions',
        hi: 'लेबल निर्देशों के अनुसार कीटनाशक मिश्रण अनुपात सत्यापित करें',
        ppe: ['gloves', 'goggles'],
      },
      {
        id: 4,
        emoji: '🌿💨',
        en: 'Check spray equipment for leaks and proper function',
        hi: 'लीक और उचित कार्य के लिए स्प्रे उपकरण की जांच करें',
        ppe: ['gloves'],
      },
      {
        id: 5,
        emoji: '🧼🚿',
        en: 'Wash hands and face thoroughly after application',
        hi: 'छिड़काव के बाद हाथ और चेहरा अच्छी तरह धोएं',
        ppe: [],
      },
      {
        id: 6,
        emoji: '🏪🔒',
        en: 'Store pesticides in locked, ventilated area away from food',
        hi: 'कीटनाशकों को बंद, हवादार जगह पर खाने से दूर रखें',
        ppe: [],
      },
      {
        id: 7,
        emoji: '🩹⛑️',
        en: 'Keep first aid kit nearby and know emergency contacts',
        hi: 'प्राथमिक चिकित्सा किट पास रखें और आपातकालीन नंबर जानें',
        ppe: [],
      },
      {
        id: 8,
        emoji: '🗑️♻️',
        en: 'Dispose of empty containers safely — do not reuse',
        hi: 'खाली कंटेनर सुरक्षित रूप से निपटाएं — पुन: उपयोग न करें',
        ppe: ['gloves'],
      },
    ],
  },
  {
    id: 'tractor',
    icon: 'tractor',
    title: { en: 'Tractor/Machinery Operation', hi: 'ट्रैक्टर/मशीनरी संचालन' },
    description: {
      en: 'Pre-operation safety inspection for tractors and machinery',
      hi: 'ट्रैक्टर और मशीनरी के लिए संचालन-पूर्व सुरक्षा निरीक्षण',
    },
    estimatedMinutes: 10,
    items: [
      {
        id: 1,
        emoji: '🔍🔧',
        en: 'Check tire pressure and condition',
        hi: 'टायर प्रेशर और स्थिति जांचें',
        ppe: ['gloves'],
      },
      {
        id: 2,
        emoji: '⛽🔥',
        en: 'Verify fuel and oil levels',
        hi: 'ईंधन और तेल का स्तर जांचें',
        ppe: ['gloves'],
      },
      {
        id: 3,
        emoji: '🪢',
        en: 'Wear seatbelt during operation',
        hi: 'संचालन के दौरान सीटबेल्ट पहनें',
        ppe: ['seatbelt', 'helmet'],
      },
      {
        id: 4,
        emoji: '💡🚨',
        en: 'Check lights and signals are working',
        hi: 'लाइट और सिग्नल काम कर रहे हैं जांचें',
        ppe: [],
      },
      {
        id: 5,
        emoji: '🛑',
        en: 'Test brakes before operation',
        hi: 'संचालन से पहले ब्रेक टेस्ट करें',
        ppe: [],
      },
      {
        id: 6,
        emoji: '🩹⛑️',
        en: 'Keep first aid kit accessible',
        hi: 'प्राथमिक चिकित्सा किट पहुंच में रखें',
        ppe: [],
      },
      {
        id: 7,
        emoji: '🛡️',
        en: 'Ensure all safety guards and rollover protection are in place',
        hi: 'सभी सुरक्षा गार्ड और रोलओवर प्रोटेक्शन सही जगह हैं सुनिश्चित करें',
        ppe: ['helmet'],
      },
      {
        id: 8,
        emoji: '🅿️',
        en: 'Inspect hydraulic system for leaks before parking',
        hi: 'पार्किंग से पहले लीक के लिए हाइड्रोलिक सिस्टम की जांच करें',
        ppe: ['gloves'],
      },
    ],
  },
]

export default TEMPLATES
