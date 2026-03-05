import { useState, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Scheme data
// ---------------------------------------------------------------------------
const SCHEMES = [
  {
    id: 1,
    nameEn: 'PM Fasal Bima Yojana',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना',
    category: 'Insurance',
    categoryHi: 'बीमा',
    descEn: 'Crop insurance against natural calamities, pests & diseases',
    descHi: 'प्राकृतिक आपदाओं से फसल सुरक्षा',
    eligibility: 'All farmers growing notified crops',
    eligibilityHi: 'अधिसूचित फसल उगाने वाले सभी किसान',
    url: 'https://pmfby.gov.in',
  },
  {
    id: 2,
    nameEn: 'PM-KISAN',
    nameHi: 'पीएम किसान सम्मान निधि',
    category: 'Subsidy',
    categoryHi: 'सब्सिडी',
    descEn: '\u20B96,000/year direct income support in 3 installments',
    descHi: 'सालाना \u20B96,000 सीधे बैंक खाते में',
    eligibility: 'Small & marginal farmers with land < 2 hectares',
    eligibilityHi: '2 हेक्टेयर से कम भूमि वाले किसान',
    url: 'https://pmkisan.gov.in',
  },
  {
    id: 3,
    nameEn: 'Kisan Credit Card',
    nameHi: 'किसान क्रेडिट कार्ड',
    category: 'Credit',
    categoryHi: 'ऋण',
    descEn: 'Short-term credit for crop cultivation at low interest rates',
    descHi: 'कम ब्याज पर खेती के लिए ऋण',
    eligibility: 'All farmers, sharecroppers & tenant farmers',
    eligibilityHi: 'सभी किसान, बटाईदार और किरायेदार किसान',
    url: 'https://www.nabard.org/content1.aspx?id=572',
  },
  {
    id: 4,
    nameEn: 'Soil Health Card Scheme',
    nameHi: 'मृदा स्वास्थ्य कार्ड योजना',
    category: 'Subsidy',
    categoryHi: 'सब्सिडी',
    descEn: 'Free soil testing and nutrient recommendations for your land',
    descHi: 'मुफ्त मिट्टी जांच और खाद सलाह',
    eligibility: 'All farmers',
    eligibilityHi: 'सभी किसान',
    url: 'https://soilhealth.dac.gov.in',
  },
  {
    id: 5,
    nameEn: 'PM Kisan Mandhan Yojana',
    nameHi: 'पीएम किसान मानधन योजना',
    category: 'Subsidy',
    categoryHi: 'सब्सिडी',
    descEn: 'Pension scheme \u2014 \u20B93,000/month after age 60',
    descHi: '60 वर्ष बाद \u20B93,000 प्रति माह पेंशन',
    eligibility: 'Farmers aged 18-40 with small/marginal landholding',
    eligibilityHi: '18-40 वर्ष के छोटे/सीमांत किसान',
    url: 'https://maandhan.in',
  },
  {
    id: 6,
    nameEn: 'PMKVY \u2014 Kisan Skill Training',
    nameHi: 'प्रधानमंत्री कौशल विकास योजना',
    category: 'Training',
    categoryHi: 'प्रशिक्षण',
    descEn: 'Free skill training in modern farming techniques',
    descHi: 'आधुनिक खेती की मुफ्त ट्रेनिंग',
    eligibility: 'Farmers and rural youth',
    eligibilityHi: 'किसान और ग्रामीण युवा',
    url: 'https://www.pmkvyofficial.org',
  },
  {
    id: 7,
    nameEn: 'National Agriculture Market (eNAM)',
    nameHi: 'राष्ट्रीय कृषि बाजार (ई-नाम)',
    category: 'Subsidy',
    categoryHi: 'सब्सिडी',
    descEn: 'Online platform to sell crops at best prices across India',
    descHi: 'ऑनलाइन मंडी \u2014 पूरे भारत में बेचें',
    eligibility: 'All farmers registered with local APMC mandi',
    eligibilityHi: 'स्थानीय APMC मंडी में पंजीकृत किसान',
    url: 'https://enam.gov.in',
  },
  {
    id: 8,
    nameEn: 'PM Krishi Sinchai Yojana',
    nameHi: 'प्रधानमंत्री कृषि सिंचाई योजना',
    category: 'Subsidy',
    categoryHi: 'सब्सिडी',
    descEn: 'Subsidy on drip & sprinkler irrigation to save water',
    descHi: 'ड्रिप/स्प्रिंकलर सिंचाई पर सब्सिडी',
    eligibility: 'All farmers, priority to water-stressed regions',
    eligibilityHi: 'सभी किसान, जल-तनाव क्षेत्रों को प्राथमिकता',
    url: 'https://pmksy.gov.in',
  },
]

const CATEGORIES = [
  { key: 'all', en: 'All', hi: 'सभी' },
  { key: 'Insurance', en: 'Insurance', hi: 'बीमा' },
  { key: 'Credit', en: 'Credit', hi: 'ऋण' },
  { key: 'Subsidy', en: 'Subsidy', hi: 'सब्सिडी' },
  { key: 'Training', en: 'Training', hi: 'प्रशिक्षण' },
]

const CATEGORY_COLORS = {
  Insurance: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  Credit: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  Subsidy: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  Training: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
}

export default function GovtSchemes() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [lang, setLang] = useState(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('krishirakshak_profile') || '{}')
      return profile.language || 'hi'
    } catch {
      return 'hi'
    }
  })

  const isHindi = lang === 'hi'

  const filtered = useMemo(() => {
    return SCHEMES.filter((s) => {
      // Category filter
      if (activeCategory !== 'all' && s.category !== activeCategory) return false
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          s.nameEn.toLowerCase().includes(q) ||
          s.nameHi.includes(q) ||
          s.descEn.toLowerCase().includes(q) ||
          s.descHi.includes(q) ||
          s.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, activeCategory])

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-bold text-primary-dark">
            {isHindi ? 'सरकारी योजनाएं' : 'Government Schemes'}
          </h2>
          <p className="text-xs text-gray-500">
            {isHindi ? 'Government Schemes' : 'सरकारी योजनाएं'}
          </p>
        </div>

        {/* Language toggle */}
        <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isHindi ? 'bg-primary text-white' : 'text-gray-500'
            }`}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              !isHindi ? 'bg-primary text-white' : 'text-gray-500'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isHindi ? 'योजना खोजें...' : 'Search schemes...'}
          className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                isActive
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {isHindi ? cat.hi : cat.en}
            </button>
          )
        })}
      </div>

      {/* Scheme count */}
      <p className="text-xs text-gray-400">
        {filtered.length} {isHindi ? 'योजनाएं मिलीं' : 'schemes found'}
      </p>

      {/* Scheme cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-8 text-center">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm text-gray-500">
              {isHindi ? 'कोई योजना नहीं मिली' : 'No schemes found'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isHindi ? 'खोज या फ़िल्टर बदलें' : 'Try changing search or filter'}
            </p>
          </div>
        ) : (
          filtered.map((scheme) => {
            const colors = CATEGORY_COLORS[scheme.category]
            return (
              <div
                key={scheme.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all active:scale-[0.99]"
              >
                <div className="p-4">
                  {/* Category badge + name */}
                  <div className="flex items-start gap-3 mb-2">
                    <span
                      className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                      {isHindi ? scheme.categoryHi : scheme.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {isHindi ? scheme.nameHi : scheme.nameEn}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isHindi ? scheme.nameEn : scheme.nameHi}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                    {isHindi ? scheme.descHi : scheme.descEn}
                  </p>

                  {/* Eligibility */}
                  <div className="mt-3 flex items-start gap-2">
                    <span className="text-xs mt-0.5">👤</span>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-600">
                        {isHindi ? 'पात्रता' : 'Eligibility'}:
                      </span>{' '}
                      {isHindi ? scheme.eligibilityHi : scheme.eligibility}
                    </p>
                  </div>

                  {/* Apply button */}
                  <a
                    href={scheme.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg transition-all active:scale-95 hover:bg-primary/20 no-underline"
                  >
                    {isHindi ? 'और जानें / Apply' : 'Learn More / Apply'}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
