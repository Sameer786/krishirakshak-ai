import { useState, useEffect } from 'react'

const STORAGE_KEY = 'krishirakshak_profile'

const STATES = [
  { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
  { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
  { en: 'Rajasthan', hi: 'राजस्थान' },
  { en: 'Maharashtra', hi: 'महाराष्ट्र' },
  { en: 'Punjab', hi: 'पंजाब' },
  { en: 'Haryana', hi: 'हरियाणा' },
  { en: 'Bihar', hi: 'बिहार' },
  { en: 'Gujarat', hi: 'गुजरात' },
  { en: 'Karnataka', hi: 'कर्नाटक' },
  { en: 'Tamil Nadu', hi: 'तमिल नाडु' },
]

const CROPS = [
  { en: 'Rice', hi: 'धान' },
  { en: 'Wheat', hi: 'गेहूं' },
  { en: 'Cotton', hi: 'कपास' },
  { en: 'Sugarcane', hi: 'गन्ना' },
  { en: 'Maize', hi: 'मक्का' },
  { en: 'Soybean', hi: 'सोयाबीन' },
  { en: 'Pulses', hi: 'दालें' },
  { en: 'Vegetables', hi: 'सब्जियां' },
  { en: 'Fruits', hi: 'फल' },
  { en: 'Other', hi: 'अन्य' },
]

const FARM_SIZES = [
  { value: 'small', en: 'Small (< 2 hectares)', hi: 'छोटा (< 2 हेक्टेयर)' },
  { value: 'medium', en: 'Medium (2-5 hectares)', hi: 'मध्यम (2-5 हेक्टेयर)' },
  { value: 'large', en: 'Large (> 5 hectares)', hi: 'बड़ा (> 5 हेक्टेयर)' },
]

const EMPTY_PROFILE = {
  name: '',
  state: '',
  district: '',
  crop: '',
  farmSize: '',
  language: 'hi',
}

function loadProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...EMPTY_PROFILE, ...JSON.parse(stored) } : { ...EMPTY_PROFILE }
  } catch {
    return { ...EMPTY_PROFILE }
  }
}

export default function Profile() {
  const [form, setForm] = useState(loadProfile)
  const [saved, setSaved] = useState(false)

  // Re-load if storage changes from another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setForm(loadProfile())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    const profile = {
      ...form,
      updatedAt: new Date().toISOString(),
      createdAt: form.createdAt || new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))

    // Also persist language preference in the shared lang key
    localStorage.setItem(
      'krishirakshak_lang',
      profile.language === 'en' ? 'en-IN' : 'hi-IN'
    )

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5 pb-4">
      {/* Avatar + heading */}
      <div className="text-center pt-2">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <span className="text-4xl">👨‍🌾</span>
        </div>
        <h2 className="text-xl font-bold text-primary-dark">किसान प्रोफाइल</h2>
        <p className="text-sm text-gray-500">Farmer Profile</p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <label className="block mb-2">
            <span className="text-sm font-semibold text-gray-800">आपका नाम</span>
            <span className="text-xs text-gray-400 ml-2">Your Name</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="नाम दर्ज करें / Enter your name"
            className="w-full px-4 py-3 text-base rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        {/* State */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <label className="block mb-2">
            <span className="text-sm font-semibold text-gray-800">राज्य</span>
            <span className="text-xs text-gray-400 ml-2">State</span>
          </label>
          <select
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-4 py-3 text-base rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white appearance-none"
          >
            <option value="">-- चुनें / Select --</option>
            {STATES.map((s) => (
              <option key={s.en} value={s.en}>
                {s.hi} / {s.en}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <label className="block mb-2">
            <span className="text-sm font-semibold text-gray-800">जिला</span>
            <span className="text-xs text-gray-400 ml-2">District</span>
          </label>
          <input
            type="text"
            value={form.district}
            onChange={(e) => handleChange('district', e.target.value)}
            placeholder="जिला दर्ज करें / Enter district"
            className="w-full px-4 py-3 text-base rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        {/* Primary Crop */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <label className="block mb-2">
            <span className="text-sm font-semibold text-gray-800">मुख्य फसल</span>
            <span className="text-xs text-gray-400 ml-2">Primary Crop</span>
          </label>
          <select
            value={form.crop}
            onChange={(e) => handleChange('crop', e.target.value)}
            className="w-full px-4 py-3 text-base rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white appearance-none"
          >
            <option value="">-- चुनें / Select --</option>
            {CROPS.map((c) => (
              <option key={c.en} value={c.en}>
                {c.hi} / {c.en}
              </option>
            ))}
          </select>
        </div>

        {/* Farm Size */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <label className="block mb-2">
            <span className="text-sm font-semibold text-gray-800">खेत का आकार</span>
            <span className="text-xs text-gray-400 ml-2">Farm Size</span>
          </label>
          <select
            value={form.farmSize}
            onChange={(e) => handleChange('farmSize', e.target.value)}
            className="w-full px-4 py-3 text-base rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white appearance-none"
          >
            <option value="">-- चुनें / Select --</option>
            {FARM_SIZES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.hi} / {f.en}
              </option>
            ))}
          </select>
        </div>

        {/* Language Preference */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <label className="block mb-3">
            <span className="text-sm font-semibold text-gray-800">भाषा</span>
            <span className="text-xs text-gray-400 ml-2">Language</span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleChange('language', 'hi')}
              className={`flex-1 py-3 rounded-lg text-base font-semibold transition-all border-2 ${
                form.language === 'hi'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => handleChange('language', 'en')}
              className={`flex-1 py-3 rounded-lg text-base font-semibold transition-all border-2 ${
                form.language === 'en'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white text-lg font-bold rounded-xl shadow-md active:scale-[0.98] transition-all"
        >
          {saved ? '✓ प्रोफाइल सहेजा गया! / Profile Saved!' : 'प्रोफाइल सहेजें / Save Profile'}
        </button>

        {/* Success Toast */}
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center animate-fade-in">
            <p className="text-sm font-semibold text-green-700">
              प्रोफाइल सहेजा गया!
            </p>
            <p className="text-xs text-green-600">Profile Saved Successfully</p>
          </div>
        )}
      </div>
    </div>
  )
}
