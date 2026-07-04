import { GoogleGenAI } from '@google/genai';

// Initialize Gemini if key is provided
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// English stopwords
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'do', 'does', 
  'did', 'for', 'from', 'have', 'has', 'had', 'having', 'he', 'her', 'here', 'him', 'himself', 'his', 'how', 
  'i', 'if', 'in', 'is', 'it', 'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'of', 'on', 'or', 'our', 
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 
  'whom', 'why', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

// Basic stemming implementation
function stemWord(word: string): string {
  word = word.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
  if (word.endsWith('ing')) return word.slice(0, -3);
  if (word.endsWith('ed')) return word.slice(0, -2);
  if (word.endsWith('es')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

// Tokenize, lowercase, and clean text
export function processText(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ')
    .split(/\s+/);
  
  return words
    .map(w => w.trim())
    .filter(w => w.length > 0 && !STOPWORDS.has(w))
    .map(w => stemWord(w));
}

// Service facts reference
export const SERVICE_FACTS = {
  timing: "Monday–Saturday: 9:00 AM – 7:00 PM. Sunday: Closed.",
  brands: ["Samsung", "Apple", "Xiaomi", "Vivo", "Oppo", "OnePlus", "Realme", "Motorola"],
  prices: {
    screen: "₹2,500 - ₹12,000",
    battery: "₹1,000 - ₹4,500",
    charging_port: "₹700 - ₹2,000",
    camera: "₹1,500 - ₹6,000",
    water_damage: "Inspection Required (Based on damage complexity)",
    speaker: "₹800 - ₹2,500",
    mic: "₹700 - ₹1,800",
    motherboard: "Inspection Required (Starting from ₹2,000)",
    software: "₹500 - ₹1,500"
  },
  warranty: "We provide a 90-day comprehensive warranty on all replaced parts. The warranty covers manufacturing and component defects but strictly excludes physical impact, screen cracks, water damage, or unauthorized self-tampering.",
  contact: {
    phone: "+91-9876543210",
    email: "support@smartmobileservice.com",
    address: "123 Tech Park, Sector 5, Bangalore, Karnataka - 560001",
    map: "https://maps.google.com/?q=123+Tech+Park+Sector+5+Bangalore"
  }
};

// System instruction context for Gemini
const GEMINI_SYSTEM_INSTRUCTION = `
You are 'Smarty', the highly professional AI Support Assistant for the 'Smart Mobile Service Center'.
You must always assist the user in a helpful, friendly, and expert manner. Use polite emojis where appropriate.

Use these service center facts to answer questions:
- TIMINGS: ${SERVICE_FACTS.timing}
- BRANDS SUPPORTED: ${SERVICE_FACTS.brands.join(', ')}
- SERVICES & PRICE LIST:
  * Screen Replacement: ${SERVICE_FACTS.prices.screen}
  * Battery Replacement: ${SERVICE_FACTS.prices.battery}
  * Charging Port Repair: ${SERVICE_FACTS.prices.charging_port}
  * Camera Repair: ${SERVICE_FACTS.prices.camera}
  * Speaker Repair: ${SERVICE_FACTS.prices.speaker}
  * Microphone Repair: ${SERVICE_FACTS.prices.mic}
  * Water Damage: ${SERVICE_FACTS.prices.water_damage}
  * Motherboard Repair: ${SERVICE_FACTS.prices.motherboard}
  * Software Update/Flash: ${SERVICE_FACTS.prices.software}
- WARRANTY POLICY: ${SERVICE_FACTS.warranty}
- GENUINE PARTS: Yes, we use high-quality, genuine, or OEM-equivalent parts. All repairs include a 90-day warranty.
- APPOINTMENTS: Customers can walk in directly or schedule an appointment online. Bookings ensure zero wait times.
- PICKUP SERVICE: Yes, we offer home pickup and delivery within a 10km radius for ₹150.
- REPAIR TIME: Most screen & battery repairs take 1-2 hours. Complex motherboard/water damage works take 1-2 days.
- CONTACT DETAILS:
  * Phone: ${SERVICE_FACTS.contact.phone}
  * Email: ${SERVICE_FACTS.contact.email}
  * Address: ${SERVICE_FACTS.contact.address}

IMPORTANT INSTRUCTIONS:
1. If the query is about booking an appointment, politely guide them to use our 'Book Appointment' button/form in the sidebar or menu, or collect details step by step.
2. If the user asks about repair status tracking, ask them to provide their Job ID (e.g. JOB101) or use the tracking tab.
3. If they rate or give feedback, thank them warmly!
4. If the query is completely outside of mobile repairs/support, or you are unsure, politely ask them to contact support at ${SERVICE_FACTS.contact.phone} or email ${SERVICE_FACTS.contact.email}.
`;

// Simple rule-based intent matching as absolute fallback or hybrid
export function getRuleBasedResponse(message: string): { response: string; intent?: string } | null {
  const stems = processText(message);
  const msgLower = message.toLowerCase();

  // 1. GREETING INTENT
  const greetingKeywords = ['hi', 'hello', 'hey', 'morning', 'evening', 'gday', 'g\'day', 'sup', 'hola'];
  if (greetingKeywords.some(kw => msgLower.startsWith(kw) || stems.includes(stemWord(kw)))) {
    return {
      response: "👋 Hello! Welcome to Smart Mobile Service Center Customer Support. How can I assist you with your mobile device today? You can ask about our repair services, price estimates, track your repair status, or book a service appointment!",
      intent: "GREETING"
    };
  }

  // 2. WARRANTY INTENT
  if (msgLower.includes('warranty') || msgLower.includes('guarantee') || stems.includes('warranti')) {
    return {
      response: `🛡️ **Warranty Information:**\n${SERVICE_FACTS.warranty}`,
      intent: "WARRANTY"
    };
  }

  // 3. TIMING INTENT
  if (msgLower.includes('time') || msgLower.includes('timing') || msgLower.includes('hour') || msgLower.includes('open') || msgLower.includes('close') || msgLower.includes('sunday')) {
    return {
      response: `📅 **Service Center Timings:**\nOur service center is open:\n- **${SERVICE_FACTS.timing}**\nFeel free to walk in or book an appointment online!`,
      intent: "TIMINGS"
    };
  }

  // 4. CONTACT / LOCATION INTENT
  if (msgLower.includes('contact') || msgLower.includes('phone') || msgLower.includes('email') || msgLower.includes('address') || msgLower.includes('location') || msgLower.includes('where') || msgLower.includes('map')) {
    return {
      response: `📍 **Contact & Location Details:**\n📞 **Phone:** ${SERVICE_FACTS.contact.phone}\n📧 **Email:** ${SERVICE_FACTS.contact.email}\n🏠 **Address:** ${SERVICE_FACTS.contact.address}\n🗺️ **Google Maps:** [Click here to navigate](${SERVICE_FACTS.contact.map})`,
      intent: "CONTACT"
    };
  }

  // 5. SCREEN CRACKS / REPAIR INTENT
  if (
    msgLower.includes('screen') || msgLower.includes('display') || msgLower.includes('glass') || msgLower.includes('cracked') || msgLower.includes('broken') || msgLower.includes('shattered') || msgLower.includes('smashed') ||
    stems.includes('screen') || stems.includes('display') || stems.includes('crack') || stems.includes('break')
  ) {
    return {
      response: `📱 **Screen Repair / Replacement:**\nYes, we replace cracked, broken, or flickering mobile displays with brand-new premium parts!\n💵 **Estimated Cost:** ${SERVICE_FACTS.prices.screen}\n⚡ **Repair Time:** 1-2 hours.\n🛡️ **Warranty:** 90 days.\nWould you like to book an appointment for this?`,
      intent: "SCREEN_REPAIR"
    };
  }

  // 6. BATTERY ISSUE INTENT
  if (
    msgLower.includes('battery') || msgLower.includes('drain') || msgLower.includes('backup') || msgLower.includes('charging problem') || msgLower.includes('charge problem') ||
    stems.includes('batteri') || stems.includes('drain')
  ) {
    return {
      response: `🔋 **Battery Issue / Replacement:**\nWe resolve rapid battery draining, poor backup, swelling batteries, and power issues!\n💵 **Estimated Cost:** ${SERVICE_FACTS.prices.battery}\n⚡ **Repair Time:** 30-60 minutes.\n🛡️ **Warranty:** 90 days.`,
      intent: "BATTERY_REPAIR"
    };
  }

  // 7. CHARGING PORT INTENT
  if (msgLower.includes('charging port') || msgLower.includes('charger port') || msgLower.includes('plug') || msgLower.includes('usb') || msgLower.includes('lightning port')) {
    return {
      response: `🔌 **Charging Port Repair:**\nIf your phone isn't charging or connection feels loose, we repair or replace the port!\n💵 **Estimated Cost:** ${SERVICE_FACTS.prices.charging_port}\n⚡ **Repair Time:** 45 minutes.\n🛡️ **Warranty:** 90 days.`,
      intent: "CHARGING_REPAIR"
    };
  }

  // 8. WATER DAMAGE INTENT
  if (msgLower.includes('water') || msgLower.includes('liquid') || msgLower.includes('wet') || msgLower.includes('drop') || msgLower.includes('toilet') || msgLower.includes('spill') || stems.includes('water')) {
    return {
      response: `💧 **Water / Liquid Damage Service:**\nOh no! Please keep the phone switched off and do not charge it. Bring it in immediately.\n💵 **Estimated Cost:** ${SERVICE_FACTS.prices.water_damage}\n🛠️ **Action:** We do chemical cleaning, diagnostic inspection, and repair damaged IC components.`,
      intent: "WATER_DAMAGE"
    };
  }

  // 9. REPAIR COST / GENERAL CHARGES INTENT
  if (msgLower.includes('cost') || msgLower.includes('charge') || msgLower.includes('price') || msgLower.includes('how much') || msgLower.includes('rate') || msgLower.includes('fee')) {
    return {
      response: `💰 **Estimated Repair Charges:**\n- **Screen Replacement:** ${SERVICE_FACTS.prices.screen}\n- **Battery Replacement:** ${SERVICE_FACTS.prices.battery}\n- **Charging Port Repair:** ${SERVICE_FACTS.prices.charging_port}\n- **Camera Repair:** ${SERVICE_FACTS.prices.camera}\n- **Speaker Repair:** ${SERVICE_FACTS.prices.speaker}\n- **Software Updates:** ${SERVICE_FACTS.prices.software}\n- **Water Damage:** ${SERVICE_FACTS.prices.water_damage}\n\nAll prices are estimates. Book an appointment for a free physical diagnostics evaluation!`,
      intent: "CHARGES"
    };
  }

  // 10. BRANDS INTENT
  const matchedBrand = SERVICE_FACTS.brands.find(brand => msgLower.includes(brand.toLowerCase()));
  if (matchedBrand) {
    return {
      response: `🛠️ **${matchedBrand} Brand Support:**\nYes, we are highly experienced in repairing all models of **${matchedBrand}** smartphones! This includes screens, batteries, charging ports, motherboards, software diagnostics, and water damage remediation.`,
      intent: "BRAND_SUPPORT"
    };
  }

  // 11. FAQ: GENUINE PARTS
  if (msgLower.includes('genuine') || msgLower.includes('original') || msgLower.includes('quality') || msgLower.includes('part')) {
    return {
      response: "⚙️ **Parts Quality:**\nYes, we use 100% genuine parts or premium OEM-equivalent parts which deliver identical performance. Every part replacement is covered by our robust 90-day parts warranty for complete peace of mind.",
      intent: "FAQ_GENUINE"
    };
  }

  // 12. FAQ: HOW LONG / REPAIR DURATION
  if (msgLower.includes('how long') || msgLower.includes('repair take') || msgLower.includes('duration') || msgLower.includes('time to fix')) {
    return {
      response: "⏳ **Repair Duration:**\n- Screen, Battery, or Charging Port replacements: **1-2 hours**\n- Water damage, motherboard diagnostic, or data recovery: **1-2 days**\nWe strive for same-day service on over 85% of mobile repair jobs!",
      intent: "FAQ_DURATION"
    };
  }

  // 13. FAQ: WALK IN VS APPOINTMENT
  if (msgLower.includes('walk in') || msgLower.includes('without appointment') || msgLower.includes('just come')) {
    return {
      response: "🚶‍♂️ **Walk-Ins:**\nYes, walk-ins are absolutely welcome! You can visit us directly. However, we highly recommend scheduling an appointment using our appointment portal to secure a dedicated technician immediately on arrival and avoid wait times.",
      intent: "FAQ_WALKIN"
    };
  }

  // 14. FAQ: HOME PICKUP
  if (msgLower.includes('pickup') || msgLower.includes('drop') || msgLower.includes('home delivery') || msgLower.includes('collect')) {
    return {
      response: "🚗 **Home Pickup & Delivery:**\nYes! We offer a convenient doorstep mobile repair pickup and delivery service within a 10km radius of our service center for a small flat rate of ₹150. Let us know if you'd like to arrange a pickup!",
      intent: "FAQ_PICKUP"
    };
  }

  // 15. FAQ: DATA RECOVERY
  if (msgLower.includes('data') || msgLower.includes('recovery') || msgLower.includes('lost files') || msgLower.includes('photos lost') || stems.includes('recov')) {
    return {
      response: "💾 **Data Recovery Services:**\nYes, we perform data recovery on bricked, bootlooping, water-damaged, or physically dead devices. We can backup/recover your photos, contacts, and files safely.\n💵 **Charges:** Subject to diagnostic evaluation.",
      intent: "DATA_RECOVERY"
    };
  }

  return null;
}

// Main chat handler combining Rules + Gemini
export async function handleBotChat(message: string): Promise<{ text: string; mode: 'ai' | 'rules' | 'fallback' }> {
  try {
    // 1. Try to fetch matching rule-based intent response first for local accuracy
    const ruleMatch = getRuleBasedResponse(message);
    
    // 2. If Gemini is configured, use it for conversational AI beauty!
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: message,
          config: {
            systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
            temperature: 0.7
          }
        });
        
        if (response.text && response.text.trim().length > 0) {
          return {
            text: response.text.trim(),
            mode: 'ai'
          };
        }
      } catch (geminiErr) {
        console.error("Gemini API call failed, falling back to Rules:", geminiErr);
      }
    }

    // 3. If Gemini is not configured or failed, use the rule-based match
    if (ruleMatch) {
      return {
        text: ruleMatch.response,
        mode: 'rules'
      };
    }

    // 4. Default Fallback Support Message
    return {
      text: "🤖 I'm sorry, I couldn't understand your request. Please contact our human customer support specialists directly at **+91-9876543210** or email us at **support@smartmobileservice.com** for instant help! Our technicians will be delighted to guide you.",
      mode: 'fallback'
    };

  } catch (error) {
    console.error("Critical chatbot handler error:", error);
    return {
      text: "⚠️ I encountered an unexpected error. Please call our team directly at **+91-9876543210**.",
      mode: 'fallback'
    };
  }
}
