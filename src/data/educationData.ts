import { Article, FAQ, CycleTip } from '../types/education';

export const articles: Article[] = [
  {
    id: 'understanding-menstrual-cycle',
    category: 'menstrual-health',
    title: 'Understanding Your Menstrual Cycle',
    summary: 'Learn about the four phases of the menstrual cycle and what happens in your body.',
    content: `The menstrual cycle is divided into four main phases:

**Menstrual Phase (Days 1-5)**
This is when you have your period. The uterine lining sheds, and hormone levels are at their lowest. You might feel tired or experience cramps.

**Follicular Phase (Days 1-13)**
Overlapping with menstruation, this phase sees rising estrogen levels as your body prepares to release an egg. Energy levels typically increase.

**Ovulation Phase (Day 14)**
A mature egg is released from the ovary. This is your most fertile time. You might notice increased cervical mucus and energy.

**Luteal Phase (Days 15-28)**
After ovulation, progesterone rises to prepare for potential pregnancy. PMS symptoms may appear as hormone levels drop if pregnancy doesn't occur.

Understanding these phases helps you anticipate changes in your body, mood, and energy levels.`,
    mediaType: 'text',
    readTimeMinutes: 5,
    tags: ['basics', 'cycle', 'phases'],
  },
  {
    id: 'tracking-fertility-signs',
    category: 'fertility',
    title: 'Tracking Your Fertility Signs',
    summary: 'Learn how to identify and track key fertility indicators.',
    content: `Your body gives several signs about fertility:

**Cervical Mucus**
Changes throughout your cycle. Around ovulation, it becomes clear, stretchy, and resembles raw egg white - perfect for sperm survival.

**Basal Body Temperature (BBT)**
Your lowest body temperature at rest. It rises slightly (0.5-1°F) after ovulation due to progesterone.

**Ovulation Predictor Kits**
Detect the LH surge that happens 24-36 hours before ovulation. Most accurate when used in the afternoon.

**Cervical Position**
Your cervix changes position and texture. During fertile days, it's higher, softer, and more open.

**Mittelschmerz**
Some women feel mild pain or cramping during ovulation on one side of the lower abdomen.

Tracking multiple signs gives you the most accurate picture of your fertile window.`,
    mediaType: 'text',
    readTimeMinutes: 6,
    tags: ['fertility', 'ovulation', 'tracking'],
    cyclePhase: 'ovulation',
  },
  {
    id: 'managing-pms',
    category: 'symptoms',
    title: 'Managing PMS Symptoms',
    summary: 'Practical strategies to reduce premenstrual syndrome symptoms.',
    content: `PMS affects up to 75% of women. Here's how to manage it:

**Physical Symptoms**
- Exercise regularly to reduce bloating and mood swings
- Reduce salt intake to minimize water retention
- Take magnesium supplements (consult your doctor first)
- Apply heat for cramps

**Emotional Symptoms**
- Get adequate sleep (7-9 hours)
- Practice stress-reduction techniques like meditation
- Maintain stable blood sugar with regular, balanced meals
- Consider vitamin B6 supplements

**Lifestyle Adjustments**
- Limit caffeine and alcohol
- Stay hydrated
- Track your symptoms to identify patterns
- Plan lighter schedules during PMS days if possible

**When to See a Doctor**
If PMS severely impacts your daily life, you may have PMDD (Premenstrual Dysphoric Disorder), which requires medical treatment.`,
    mediaType: 'text',
    readTimeMinutes: 5,
    tags: ['pms', 'symptoms', 'wellbeing'],
    cyclePhase: 'luteal',
  },
  {
    id: 'nutrition-for-cycle',
    category: 'lifestyle',
    title: 'Cycle-Syncing Your Nutrition',
    summary: 'Optimize your diet for each phase of your menstrual cycle.',
    content: `Different cycle phases have different nutritional needs:

**Menstrual Phase**
- Iron-rich foods (spinach, red meat) to replace blood loss
- Omega-3 fatty acids to reduce inflammation
- Warm, comforting foods
- Stay hydrated

**Follicular Phase**
- Fresh fruits and vegetables
- Lean proteins
- Fermented foods for gut health
- Light, energizing meals

**Ovulation Phase**
- Fiber-rich foods to eliminate excess estrogen
- Raw vegetables and fruits
- Anti-inflammatory foods
- Lighter portions as metabolism is higher

**Luteal Phase**
- Complex carbohydrates for serotonin
- Magnesium-rich foods (dark chocolate, nuts)
- Calcium to reduce PMS
- Vitamin B6 foods (chickpeas, bananas)

Listen to your body's cravings - they often indicate what you need!`,
    mediaType: 'text',
    readTimeMinutes: 6,
    tags: ['nutrition', 'lifestyle', 'wellness'],
  },
  {
    id: 'irregular-periods',
    category: 'menstrual-health',
    title: 'When to Worry About Irregular Periods',
    summary: "Understanding what's normal and when to seek medical advice.",
    content: `Cycle length varies between women, but when should you be concerned?

**Normal Variations**
- Cycles between 21-35 days are generally normal
- Slight variations (2-3 days) month to month
- Changes during stress, travel, or illness
- Irregular cycles in the first few years after first period
- Changes approaching menopause (age 45+)

**Red Flags - See a Doctor If:**
- Periods stop for 3+ months (not pregnant)
- Cycles shorter than 21 days or longer than 35 days
- Bleeding lasts more than 7 days
- Very heavy bleeding (changing pad/tampon every hour)
- Severe pain that interferes with daily activities
- Bleeding between periods
- Post-menopausal bleeding

**Common Causes of Irregularity**
- Polycystic Ovary Syndrome (PCOS)
- Thyroid disorders
- Significant weight changes
- Excessive exercise
- Stress
- Certain medications

Early detection and treatment of underlying conditions is important for long-term health.`,
    mediaType: 'text',
    readTimeMinutes: 5,
    tags: ['irregularity', 'health', 'medical'],
  },
];

export const faqs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How long is a normal menstrual cycle?',
    answer: 'A normal menstrual cycle ranges from 21 to 35 days, measured from the first day of one period to the first day of the next. The average is 28 days, but variations are completely normal.',
    category: 'menstrual-health',
  },
  {
    id: 'faq-2',
    question: 'Can I get pregnant during my period?',
    answer: 'While unlikely, it is possible, especially if you have a shorter cycle or longer periods. Sperm can survive in the reproductive tract for up to 5 days, so if you ovulate early, conception could occur.',
    category: 'fertility',
  },
  {
    id: 'faq-3',
    question: 'How accurate are period tracking apps?',
    answer: 'Apps are most accurate when you have regular cycles and consistently log data. Predictions are based on your historical patterns and become more accurate over time. However, they should not be relied upon as a sole method of contraception.',
    category: 'faq',
  },
  {
    id: 'faq-4',
    question: 'What causes PMS?',
    answer: 'PMS is caused by hormonal fluctuations in the luteal phase of your cycle. Dropping estrogen and progesterone levels affect neurotransmitters like serotonin, leading to physical and emotional symptoms.',
    category: 'symptoms',
  },
  {
    id: 'faq-5',
    question: 'When is the best time to take a pregnancy test?',
    answer: 'For the most accurate result, wait until at least the first day of your missed period. Testing too early may result in a false negative because hCG levels may not be high enough to detect.',
    category: 'fertility',
  },
  {
    id: 'faq-6',
    question: 'What is ovulation pain?',
    answer: 'Ovulation pain (mittelschmerz) is a one-sided lower abdominal pain that some women experience during ovulation. It is caused by the release of the egg from the ovary and is usually mild and brief.',
    category: 'symptoms',
  },
  {
    id: 'faq-7',
    question: 'Can stress affect my period?',
    answer: 'Yes, stress can significantly impact your menstrual cycle. High stress levels can delay ovulation, making your period late, or in some cases, cause you to skip a period entirely.',
    category: 'menstrual-health',
  },
  {
    id: 'faq-8',
    question: 'What is a fertile window?',
    answer: 'Your fertile window is the 6-day period ending on the day of ovulation. This includes the 5 days before ovulation and the day of ovulation itself, when pregnancy is most likely to occur.',
    category: 'fertility',
  },
  {
    id: 'faq-9',
    question: 'Is it normal to have blood clots during my period?',
    answer: 'Small blood clots (smaller than a quarter) are normal and occur when menstrual blood pools before leaving the body. However, large or frequent clots may indicate heavy bleeding and should be discussed with a doctor.',
    category: 'menstrual-health',
  },
  {
    id: 'faq-10',
    question: 'Can I exercise during my period?',
    answer: 'Yes! Exercise during your period is safe and can actually help reduce cramps, improve mood, and decrease bloating. Listen to your body and adjust intensity as needed.',
    category: 'lifestyle',
  },
];

export const cycleTips: CycleTip[] = [
  {
    phase: 'menstrual',
    title: 'Rest and Restore',
    description: 'Your energy may be lower. Focus on gentle activities, warm baths, and iron-rich foods to replenish blood loss.',
    icon: 'bed-outline',
  },
  {
    phase: 'menstrual',
    title: 'Manage Cramps',
    description: 'Use heat pads, gentle stretching, or yoga. Anti-inflammatory foods like ginger and turmeric can help.',
    icon: 'heart-outline',
  },
  {
    phase: 'follicular',
    title: 'Energy Boost',
    description: 'Rising estrogen brings more energy. Great time to start new projects, try intense workouts, or socialize.',
    icon: 'flash-outline',
  },
  {
    phase: 'follicular',
    title: 'Try New Things',
    description: 'You may feel more confident and creative. Perfect for learning new skills or taking on challenges.',
    icon: 'rocket-outline',
  },
  {
    phase: 'ovulation',
    title: 'Peak Fertility',
    description: 'If trying to conceive, this is your most fertile time. If preventing pregnancy, use protection.',
    icon: 'flower-outline',
  },
  {
    phase: 'ovulation',
    title: 'Social Time',
    description: 'Estrogen peaks, making you feel more outgoing and attractive. Great for important meetings or dates.',
    icon: 'people-outline',
  },
  {
    phase: 'luteal',
    title: 'Slow Down',
    description: 'Energy naturally decreases. Honor your need for rest, lighter exercise, and more sleep.',
    icon: 'moon-outline',
  },
  {
    phase: 'luteal',
    title: 'Manage PMS',
    description: 'Eat regular meals with complex carbs, reduce caffeine and salt, and practice stress-relief techniques.',
    icon: 'nutrition-outline',
  },
  {
    phase: 'luteal',
    title: 'Self-Care',
    description: 'Progesterone can affect mood. Extra self-compassion, relaxation, and saying no to commitments is okay.',
    icon: 'heart-circle-outline',
  },
];
