import type { GenerateRequest, GenerateResponse } from "../types/index.ts";

export function generateFallbackContent(req: GenerateRequest): GenerateResponse {
  const isAr = req.language === "ar";
  const topic = req.topic.trim() || (isAr ? "علامتك التجارية" : "your brand");
  const audience =
    req.audience?.trim() || (isAr ? "جمهورك المستهدف" : "your target audience");
  const extra = req.extraOption?.trim() || "";

  const cleanTag = topic
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join("");

  if (req.tool === "facebook") {
    const cta =
      extra ||
      (isAr
        ? "شاركنا رأيك في التعليقات!"
        : "Drop your thoughts in the comments below!");
    const post = isAr
      ? `هل تبحث عن نقلة حقيقية في ${topic}؟ 🚀\n\nصُمّم هذا الحل خصيصاً لـ ${audience} الذين يبحثون عن الجودة والنتائج الملموسة دون تعقيد.\n\n✅ توفير حقيقي في الوقت والجهد\n✅ تجربة استخدام سلسة وموثوقه\n✅ نتائج واضحة من الأسبوع الأول\n\n${cta}`
      : `Ready to level up your approach to ${topic}? 🚀\n\nWe built this specifically for ${audience} who want reliable results without the guesswork.\n\n✅ Save hours every single week\n✅ Simple, repeatable workflow\n✅ Proven impact from day one\n\n${cta}`;

    const tip = isAr
      ? "أفضل وقت مقترح للنشر: الثلاثاء أو الخميس الساعة 7:30 مساءً مع صورة واضحة أو تصميم كاروسيل."
      : "Best posting tip: Publish Tuesday or Thursday at 11:00 AM–1:00 PM with a clean branded visual or short carousel.";

    return {
      mode: "sample-demo",
      tool: "facebook",
      sections: [
        {
          label: isAr ? "منشور فيسبوك المقترح" : "Generated Facebook Post",
          content: post,
        },
        { label: isAr ? "نصيحة التفاعل" : "Engagement Tip", content: tip },
      ],
      rawText: post,
    };
  }

  if (req.tool === "instagram") {
    const tags = isAr
      ? [
          `#${cleanTag || "تسويق"}`,
          "#محتوى_رقمي",
          "#ريادة_أعمال",
          "#نجاح",
          "#تطوير_الذات",
        ]
      : [
          `#${cleanTag || "SocialGrowth"}`,
          "#ContentCreator",
          "#DigitalMarketing",
          "#BrandStrategy",
          "#DailyInspiration",
        ];

    const shortCap = isAr
      ? `البساطة تصنع الفرق في ${topic} ✨ جرّبها اليوم واكتشف النتيجة بنفسك!`
      : `Less noise, better results with ${topic} ✨ Save this for your next breakthrough.`;

    const storyCap = isAr
      ? `عندما بدأنا التفكير في ${topic}، كان هدفنا مساعدة ${audience} على تجاوز التحديات اليومية بثقة.\n\nالنتيجة؟ خطوات عملية، وضوح تام، وإنجاز أسرع.\n\nاحفظ المنشور للرجوع إليه لاحقاً 📌`
      : `When it comes to ${topic}, ${audience} often ask how to stay consistent without burning out.\n\nHere’s the secret: focus on high-impact systems, not busywork.\n\nBookmark this post and share it with someone who needs it today 📌`;

    const questionCap = isAr
      ? `ما هو أكبر تحدٍ يواجهك حالياً مع ${topic}؟ أخبرنا في التعليقات لنشاركك الحل المناسب 👇`
      : `What is your #1 challenge with ${topic} right now? Tell us below and we’ll reply with tips 👇`;

    return {
      mode: "sample-demo",
      tool: "instagram",
      hashtags: tags,
      sections: [
        {
          label: isAr ? "خيار 1: قصير وجذاب" : "Option 1: Short & Punchy",
          content: shortCap,
        },
        {
          label: isAr ? "خيار 2: سرد قصصي" : "Option 2: Storytelling",
          content: storyCap,
        },
        {
          label: isAr ? "خيار 3: سؤال تفاعلي" : "Option 3: Engagement Question",
          content: questionCap,
        },
      ],
      rawText: `${storyCap}\n\n${tags.join(" ")}`,
    };
  }

  if (req.tool === "hashtags") {
    const high = isAr
      ? ["#تسويق_رقمي", "#محتوى", "#ريادة", "#نجاح", "#تطوير"]
      : [
          "#MarketingTips",
          "#SocialMediaStrategy",
          "#BusinessGrowth",
          "#ContentCreation",
          "#DigitalTrends",
        ];
    const niche = isAr
      ? [
          `#${cleanTag || "إبداع"}`,
          "#استراتيجية_محتوى",
          "#نمو_الأعمال",
          "#تسويق_بالمحتوى",
          "#مشاريع_ناشئة",
        ]
      : [
          `#${cleanTag || "NicheGrowth"}`,
          "#CreatorEconomy",
          "#AudienceBuilding",
          "#SmartWorkflow",
          "#BrandVoice",
        ];
    const community = isAr
      ? [
          "#مجتمع_المبدعين",
          "#نصائح_يومية",
          "#تطوير_مستمر",
          "#قصة_نجاح",
          "#شارك_فكرتك",
        ]
      : [
          "#CreatorsCommunity",
          "#GrowthMindset",
          "#SmallBizSupport",
          "#BehindTheBrand",
          "#DailyTips",
        ];

    const all = [...high, ...niche, ...community];
    return {
      mode: "sample-demo",
      tool: "hashtags",
      hashtags: all,
      sections: [
        {
          label: isAr ? "هاشتاقات عالية الانتشار" : "High-Reach Hashtags",
          content: high.join(" "),
        },
        {
          label: isAr ? "هاشتاقات متخصصة" : "Targeted Niche Hashtags",
          content: niche.join(" "),
        },
        {
          label: isAr ? "هاشتاقات مجتمعية" : "Community & Engagement Hashtags",
          content: community.join(" "),
        },
      ],
      rawText: all.join(" "),
    };
  }

  if (req.tool === "tiktok") {
    const duration = extra || "30s";
    const hook = isAr
      ? `(0-3 ثوانٍ) [نص على الشاشة: توقف عن ارتكاب هذا الخطأ في ${topic}!]\nالمتحدث بحماس: "إذا كنت من ${audience}، فهذا الفيديو سيختصر عليك شهوراً من التجربة!"`
      : `(0–3s) [On-Screen Text: Stop making this mistake with ${topic}!]\nSpeaker (high energy): "If you're part of ${audience}, watch this before you waste another week!"`;

    const body = isAr
      ? `(3-22 ثانية) [لقطات سريعة B-Roll توضح التطبيق العملي]\n1. ابدأ بتحديد الهدف الأساسي بوضوح.\n2. استخدم أداة أو خطة عمل ثابتة لتوفير الوقت.\n3. راقب النتائج وطوّر أسلوبك أسبوعياً.\n[مؤثر بصري: انتقال سريع مع عرض النقاط الثلاث على الشاشة]`
      : `(3–22s) [Quick B-roll showing step-by-step workflow]\n"First, simplify your core message. Second, build a repeatable system around ${topic}. Third, track what actually drives engagement instead of guessing."\n[Visual Cue: Pop-up checklist icons on screen for each step]`;

    const cta = isAr
      ? `(22-${duration}) "احفظ الفيديو الآن وتابع الحساب للمزيد من النصائح العملية حول ${topic}!"`
      : `(22–${duration}) "Save this video for later and follow for daily frameworks on ${topic}!"`;

    return {
      mode: "sample-demo",
      tool: "tiktok",
      sections: [
        { label: isAr ? "الخطّاف (Hook)" : "The Hook (0–3s)", content: hook },
        {
          label: isAr ? "محتوى الفيديو والمشاهد" : "Script Body & Visual Cues",
          content: body,
        },
        {
          label: isAr ? "الخاتمة والدعوة للإجراء" : "Call to Action (Outro)",
          content: cta,
        },
      ],
      rawText: `${hook}\n\n${body}\n\n${cta}`,
    };
  }

  const titles = isAr
    ? [
        `الدليل الشامل لـ ${topic} في 2026 (خطوة بخطوة)`,
        `5 أسرار في ${topic} يتمنّى الجميع معرفتها مبكراً!`,
        `كيف تتقن ${topic} بأقل مجهود؟ شرح عملي لـ ${audience}`,
        `أخطاء شائعة في ${topic} وكيف تتجنبها فوراً`,
        `تجربتي الحقيقية مع ${topic}: النتائج الكاملة!`,
      ]
    : [
        `The Complete Guide to ${topic} in 2026 (Step-by-Step)`,
        `5 ${topic} Secrets Nobody Tells ${audience}`,
        `How to Master ${topic} Faster: Practical Framework`,
        `Stop Making These ${topic} Mistakes (Fix Them Today)`,
        `I Tested ${topic} for 30 Days — Here Are the Real Results`,
      ];

  const description = isAr
    ? `في هذا الفيديو نستعرض معكم دليلاً عملياً حول ${topic} مصمماً خصيصاً لـ ${audience}.\n\n📌 محاور الفيديو (Timestamps):\n00:00 مقدمة مهمة\n01:30 الأساسيات التي تحتاجها\n04:15 التطبيق العملي والأمثلة\n07:45 نصائح احترافية والملخص\n\n🔔 لا تنسَ الاشتراك في القناة وتفعيل الجرس ليصلك كل جديد!\n\nالكلمات المفتاحية: ${extra || topic}`
    : `In this video, we break down everything ${audience} need to know about ${topic} with actionable steps you can apply right away.\n\n📌 Video Chapters:\n00:00 Intro & What You'll Learn\n01:25 Core Foundations\n04:10 Step-by-Step Walkthrough\n07:40 Pro Tips & Common Pitfalls\n\n🔔 Subscribe for weekly tutorials and strategies!\n\nKeywords: ${extra || topic}`;

  return {
    mode: "sample-demo",
    tool: "youtube",
    sections: [
      {
        label: isAr
          ? "5 عناوين مقترحة متوافقة مع SEO"
          : "5 High-CTR SEO Titles",
        content: titles.map((t, i) => `${i + 1}. ${t}`).join("\n"),
      },
      {
        label: isAr ? "وصف الفيديو المقترح" : "SEO Video Description",
        content: description,
      },
    ],
    rawText: `${titles[0]}\n\n${description}`,
  };
}
