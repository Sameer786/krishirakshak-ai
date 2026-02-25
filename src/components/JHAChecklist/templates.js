// PPE icon keys used in checklist items
export const PPE_ICONS = {
  mask: { label: 'Mask', hi: 'मास्क', icon: 'M' },
  gloves: { label: 'Gloves', hi: 'दस्ताने', icon: 'G' },
  boots: { label: 'Boots', hi: 'जूते', icon: 'B' },
  coverall: { label: 'Coverall', hi: 'कवरऑल', icon: 'C' },
  seatbelt: { label: 'Seatbelt', hi: 'सीटबेल्ट', icon: 'S' },
  goggles: { label: 'Goggles', hi: 'चश्मा', icon: 'E' },
  helmet: { label: 'Helmet', hi: 'हेलमेट', icon: 'H' },
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
        en: 'Check wind speed — should be less than 10 km/h',
        hi: 'हवा की गति जांचें — 10 km/h से कम होनी चाहिए',
        ppe: ['mask'],
      },
      {
        id: 2,
        en: 'Wear full PPE: mask, gloves, boots, long-sleeved clothing',
        hi: 'पूर्ण PPE पहनें: मास्क, दस्ताने, जूते, लंबी आस्तीन के कपड़े',
        ppe: ['mask', 'gloves', 'boots', 'coverall'],
      },
      {
        id: 3,
        en: 'Verify pesticide mixing ratios per label instructions',
        hi: 'लेबल निर्देशों के अनुसार कीटनाशक मिश्रण अनुपात सत्यापित करें',
        ppe: ['gloves'],
      },
      {
        id: 4,
        en: 'Check spray equipment for leaks and proper function',
        hi: 'लीक और उचित कार्य के लिए स्प्रे उपकरण की जांच करें',
        ppe: [],
      },
      {
        id: 5,
        en: 'Ensure proper ventilation in mixing area',
        hi: 'मिश्रण क्षेत्र में उचित हवा का प्रवाह सुनिश्चित करें',
        ppe: ['mask'],
      },
      {
        id: 6,
        en: 'Note re-entry timing — do not enter field for specified hours',
        hi: 'पुनः प्रवेश समय नोट करें — निर्दिष्ट घंटों तक खेत में प्रवेश न करें',
        ppe: [],
      },
      {
        id: 7,
        en: 'Dispose of empty containers safely — do not reuse',
        hi: 'खाली कंटेनर सुरक्षित रूप से निपटाएं — पुन: उपयोग न करें',
        ppe: ['gloves'],
      },
      {
        id: 8,
        en: 'Wash hands and face thoroughly after application',
        hi: 'छिड़काव के बाद हाथ और चेहरा अच्छी तरह धोएं',
        ppe: [],
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
        en: 'Check tire pressure and condition',
        hi: 'टायर प्रेशर और स्थिति जांचें',
        ppe: [],
      },
      {
        id: 2,
        en: 'Test brakes before operation',
        hi: 'संचालन से पहले ब्रेक टेस्ट करें',
        ppe: [],
      },
      {
        id: 3,
        en: 'Verify fuel and oil levels',
        hi: 'ईंधन और तेल का स्तर जांचें',
        ppe: [],
      },
      {
        id: 4,
        en: 'Inspect hydraulic system for leaks',
        hi: 'लीक के लिए हाइड्रोलिक सिस्टम की जांच करें',
        ppe: ['gloves'],
      },
      {
        id: 5,
        en: 'Ensure all safety guards are in place',
        hi: 'सभी सुरक्षा गार्ड सही जगह हैं सुनिश्चित करें',
        ppe: [],
      },
      {
        id: 6,
        en: 'Check lights and signals are working',
        hi: 'लाइट और सिग्नल काम कर रहे हैं जांचें',
        ppe: [],
      },
      {
        id: 7,
        en: 'Wear seatbelt during operation',
        hi: 'संचालन के दौरान सीटबेल्ट पहनें',
        ppe: ['seatbelt'],
      },
      {
        id: 8,
        en: 'Keep first aid kit accessible',
        hi: 'प्राथमिक चिकित्सा किट पहुंच में रखें',
        ppe: [],
      },
    ],
  },
]

export default TEMPLATES
