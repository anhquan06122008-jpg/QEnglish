const WRITING_TOPICS = [
  // ============ A1 LEVEL ============
  {
    id: 'w-a1-01',
    title: 'Introduce Yourself',
    level: 'A1',
    type: 'paragraph',
    prompt: 'Write a short paragraph to introduce yourself. Include your name, age, where you are from, and what you like to do.',
    promptVi: 'Viết một đoạn văn ngắn để giới thiệu bản thân. Bao gồm tên, tuổi, quê quán và sở thích của bạn.',
    guidelines: [
      'Start with a greeting such as "Hello" or "Hi".',
      'Use simple sentences: Subject + Verb + Object.',
      'Include basic personal information: name, age, hometown.',
      'Mention one or two hobbies or interests.',
      'End with a friendly closing sentence.'
    ],
    minWords: 40,
    maxWords: 80,
    sampleOutline: [
      'Greeting and name',
      'Age and hometown',
      'School or university',
      'Hobbies and interests',
      'Closing sentence'
    ],
    vocabulary: [
      'My name is...', 'I am ... years old', 'I come from...', 'I live in...',
      'I am a student at...', 'I like / enjoy...', 'My hobby is...',
      'In my free time...', 'Nice to meet you'
    ],
    timeLimit: 10
  },
  {
    id: 'w-a1-02',
    title: 'My Family',
    level: 'A1',
    type: 'paragraph',
    prompt: 'Write about your family. How many people are in your family? What do they do? What do you like to do together?',
    promptVi: 'Viết về gia đình bạn. Gia đình bạn có bao nhiêu người? Họ làm nghề gì? Bạn thích làm gì cùng nhau?',
    guidelines: [
      'Start by saying how many people are in your family.',
      'Introduce each family member briefly.',
      'Use possessive pronouns: my father, my mother, my sister.',
      'Describe what your family members do (jobs or school).',
      'Mention a family activity you enjoy together.'
    ],
    minWords: 50,
    maxWords: 100,
    sampleOutline: [
      'Family size',
      'Parents and their jobs',
      'Siblings (brothers/sisters)',
      'Family activities',
      'Why you love your family'
    ],
    vocabulary: [
      'There are ... people in my family', 'My father/mother is a...',
      'older/younger brother/sister', 'We usually...', 'On weekends, we...',
      'I love my family because...', 'take care of', 'spend time together'
    ],
    timeLimit: 10
  },
  {
    id: 'w-a1-03',
    title: 'My Daily Routine',
    level: 'A1',
    type: 'paragraph',
    prompt: 'Describe your typical day. What time do you wake up? What do you do in the morning, afternoon, and evening?',
    promptVi: 'Mô tả một ngày bình thường của bạn. Bạn thức dậy lúc mấy giờ? Bạn làm gì vào buổi sáng, chiều và tối?',
    guidelines: [
      'Organize your paragraph by time of day: morning, afternoon, evening.',
      'Use time expressions: at 7 o\'clock, in the morning, after lunch.',
      'Use present simple tense for routines.',
      'Include activities like eating, studying, and relaxing.',
      'Keep sentences short and clear.'
    ],
    minWords: 50,
    maxWords: 100,
    sampleOutline: [
      'Morning routine (wake up, breakfast)',
      'Going to school/university',
      'Afternoon activities (classes, lunch)',
      'Evening routine (dinner, homework, hobbies)',
      'Bedtime'
    ],
    vocabulary: [
      'wake up', 'get dressed', 'have breakfast/lunch/dinner',
      'go to school', 'attend class', 'do homework', 'watch TV',
      'go to bed', 'take a shower', 'in the morning/afternoon/evening',
      'after that', 'then', 'usually', 'always', 'sometimes'
    ],
    timeLimit: 10
  },

  // ============ A2 LEVEL ============
  {
    id: 'w-a2-01',
    title: 'My Favorite Hobby',
    level: 'A2',
    type: 'paragraph',
    prompt: 'Write about your favorite hobby. What is it? When did you start? Why do you enjoy it? How often do you do it?',
    promptVi: 'Viết về sở thích yêu thích của bạn. Đó là gì? Bạn bắt đầu khi nào? Tại sao bạn thích nó? Bạn thực hiện nó bao lâu một lần?',
    guidelines: [
      'Clearly state what your hobby is in the opening sentence.',
      'Explain when and how you started this hobby.',
      'Give reasons why you enjoy it.',
      'Use frequency adverbs: always, usually, often, sometimes.',
      'Add specific examples or experiences related to your hobby.'
    ],
    minWords: 60,
    maxWords: 120,
    sampleOutline: [
      'What your hobby is',
      'How you started',
      'Why you enjoy it',
      'How often you do it',
      'What you have learned from it'
    ],
    vocabulary: [
      'My favorite hobby is...', 'I started ... when I was...',
      'I enjoy ... because...', 'It makes me feel...', 'I usually ... every week',
      'passionate about', 'spend time on', 'interested in',
      'fun', 'relaxing', 'exciting', 'creative'
    ],
    timeLimit: 15
  },
  {
    id: 'w-a2-02',
    title: 'Describe Your School',
    level: 'A2',
    type: 'paragraph',
    prompt: 'Describe your school or university. What does it look like? What facilities does it have? What do you like most about it?',
    promptVi: 'Mô tả trường học hoặc đại học của bạn. Trường trông như thế nào? Có những cơ sở vật chất gì? Bạn thích điều gì nhất ở trường?',
    guidelines: [
      'Start with the name and location of your school.',
      'Describe the physical appearance: buildings, campus, classrooms.',
      'List important facilities: library, labs, sports areas.',
      'Say what you like most and why.',
      'Use adjectives to describe: big, modern, beautiful, clean.'
    ],
    minWords: 60,
    maxWords: 120,
    sampleOutline: [
      'Name and location',
      'Campus and buildings',
      'Facilities and equipment',
      'Favorite place in school',
      'Overall impression'
    ],
    vocabulary: [
      'is located in...', 'campus', 'building', 'classroom', 'library',
      'laboratory', 'canteen', 'sports ground', 'modern', 'spacious',
      'well-equipped', 'What I like most is...', 'facilities'
    ],
    timeLimit: 15
  },
  {
    id: 'w-a2-03',
    title: 'A Memorable Day',
    level: 'A2',
    type: 'paragraph',
    prompt: 'Write about a memorable day in your life. What happened? Where were you? How did you feel? Why was it special?',
    promptVi: 'Viết về một ngày đáng nhớ trong cuộc đời bạn. Chuyện gì đã xảy ra? Bạn ở đâu? Bạn cảm thấy thế nào? Tại sao ngày đó đặc biệt?',
    guidelines: [
      'Set the scene: when and where it happened.',
      'Tell the story in chronological order.',
      'Use past simple tense for completed actions.',
      'Describe your feelings and emotions.',
      'Explain why this day was important to you.'
    ],
    minWords: 70,
    maxWords: 130,
    sampleOutline: [
      'When and where it happened',
      'What happened first',
      'The main event',
      'Your feelings during and after',
      'Why it is memorable'
    ],
    vocabulary: [
      'One day...', 'Last year/month...', 'I remember when...',
      'I felt happy/excited/surprised', 'It was special because...',
      'unforgettable', 'memorable', 'wonderful', 'amazing',
      'First...', 'Then...', 'After that...', 'Finally...'
    ],
    timeLimit: 15
  },

  // ============ B1 LEVEL ============
  {
    id: 'w-b1-01',
    title: 'Advantages of Learning English',
    level: 'B1',
    type: 'essay',
    prompt: 'Write an essay discussing the advantages of learning English. Why is English important in today\'s world? How can it help in studies and career?',
    promptVi: 'Viết một bài luận thảo luận về những lợi ích của việc học tiếng Anh. Tại sao tiếng Anh quan trọng trong thế giới ngày nay? Nó có thể giúp ích như thế nào trong học tập và sự nghiệp?',
    guidelines: [
      'Write a clear introduction with a thesis statement.',
      'Present 2-3 main advantages, each in a separate paragraph.',
      'Support each point with examples or explanations.',
      'Use linking words: Firstly, Moreover, In addition, Furthermore.',
      'Write a conclusion that summarizes your main points.'
    ],
    minWords: 120,
    maxWords: 200,
    sampleOutline: [
      'Introduction: English as a global language',
      'Body 1: Better job opportunities',
      'Body 2: Access to information and education',
      'Body 3: Communication with people worldwide',
      'Conclusion: Summary and personal opinion'
    ],
    vocabulary: [
      'global language', 'communication', 'international', 'opportunity',
      'career advancement', 'access to information', 'cultural exchange',
      'competitive advantage', 'essential skill', 'in today\'s world',
      'play an important role', 'open doors to', 'broaden one\'s horizons'
    ],
    timeLimit: 25
  },
  {
    id: 'w-b1-02',
    title: 'Technology in Education',
    level: 'B1',
    type: 'essay',
    prompt: 'Write about how technology is used in education. What are the benefits? Are there any challenges? Give examples from your experience as a student.',
    promptVi: 'Viết về cách công nghệ được sử dụng trong giáo dục. Những lợi ích là gì? Có thách thức nào không? Cho ví dụ từ trải nghiệm của bạn với tư cách sinh viên.',
    guidelines: [
      'Begin with an introduction about technology in modern education.',
      'Discuss at least two benefits of using technology in learning.',
      'Mention one or two challenges or disadvantages.',
      'Include personal examples from your experience at FPT University.',
      'Conclude with your overall opinion.'
    ],
    minWords: 120,
    maxWords: 200,
    sampleOutline: [
      'Introduction: Technology and education today',
      'Body 1: Benefits (online resources, interactive learning)',
      'Body 2: Benefits (flexibility, convenience)',
      'Body 3: Challenges (distraction, technical issues)',
      'Conclusion: Overall opinion'
    ],
    vocabulary: [
      'digital tools', 'online learning', 'e-learning platform', 'interactive',
      'educational app', 'virtual classroom', 'LMS (Learning Management System)',
      'distance learning', 'distraction', 'screen time', 'digital literacy',
      'enhance learning', 'improve efficiency'
    ],
    timeLimit: 25
  },
  {
    id: 'w-b1-03',
    title: 'Online vs Offline Learning',
    level: 'B1',
    type: 'essay',
    prompt: 'Compare online learning and offline (traditional) learning. What are the advantages and disadvantages of each? Which do you prefer and why?',
    promptVi: 'So sánh học trực tuyến và học trực tiếp (truyền thống). Ưu điểm và nhược điểm của mỗi hình thức là gì? Bạn thích hình thức nào hơn và tại sao?',
    guidelines: [
      'Write a balanced comparison of both learning methods.',
      'Use comparison language: while, whereas, on the other hand.',
      'Give specific advantages and disadvantages for each.',
      'State your preference clearly with reasons.',
      'Use examples from your university experience.'
    ],
    minWords: 130,
    maxWords: 220,
    sampleOutline: [
      'Introduction: Two forms of learning',
      'Body 1: Advantages of online learning',
      'Body 2: Advantages of offline learning',
      'Body 3: Disadvantages of each',
      'Conclusion: Your preference and reasons'
    ],
    vocabulary: [
      'face-to-face', 'virtual', 'flexibility', 'self-discipline',
      'interaction', 'convenience', 'traditional classroom', 'remote learning',
      'on the other hand', 'compared to', 'in contrast', 'whereas',
      'prefer', 'advantage', 'disadvantage', 'effective'
    ],
    timeLimit: 25
  },
  {
    id: 'w-b1-04',
    title: 'My Future Career',
    level: 'B1',
    type: 'essay',
    prompt: 'Write about your future career plans. What job do you want to have? Why did you choose this career? What skills do you need? How are you preparing for it?',
    promptVi: 'Viết về kế hoạch nghề nghiệp tương lai của bạn. Bạn muốn làm công việc gì? Tại sao bạn chọn nghề này? Bạn cần những kỹ năng gì? Bạn đang chuẩn bị cho nó như thế nào?',
    guidelines: [
      'State your career goal clearly in the introduction.',
      'Explain your motivation for choosing this career.',
      'List important skills and qualifications needed.',
      'Describe how you are preparing (studies, projects, internships).',
      'End with your vision for the future.'
    ],
    minWords: 120,
    maxWords: 200,
    sampleOutline: [
      'Introduction: Your dream career',
      'Body 1: Why you chose this career',
      'Body 2: Required skills and qualifications',
      'Body 3: How you are preparing at FPT University',
      'Conclusion: Future goals and vision'
    ],
    vocabulary: [
      'software developer', 'IT engineer', 'career path', 'ambition',
      'pursue a career in...', 'passion for...', 'skill set', 'internship',
      'qualification', 'professional development', 'in the future',
      'I aspire to...', 'My goal is to...', 'gain experience'
    ],
    timeLimit: 25
  },

  // ============ B2 LEVEL ============
  {
    id: 'w-b2-01',
    title: 'Impact of Social Media on Students',
    level: 'B2',
    type: 'essay',
    prompt: 'Discuss the impact of social media on university students. Consider both positive and negative effects on academic performance, mental health, and social relationships.',
    promptVi: 'Thảo luận về tác động của mạng xã hội đối với sinh viên đại học. Xem xét cả tác động tích cực và tiêu cực đến kết quả học tập, sức khỏe tinh thần và các mối quan hệ xã hội.',
    guidelines: [
      'Write a balanced essay with both positive and negative impacts.',
      'Organize paragraphs by theme: academics, mental health, relationships.',
      'Use evidence and examples to support your arguments.',
      'Include academic vocabulary and formal register.',
      'Conclude with a nuanced opinion, not just one-sided.'
    ],
    minWords: 180,
    maxWords: 300,
    sampleOutline: [
      'Introduction: Social media in student life',
      'Body 1: Positive effects (networking, information sharing, group study)',
      'Body 2: Negative effects on academic performance (distraction, procrastination)',
      'Body 3: Impact on mental health and relationships',
      'Conclusion: Balanced view and recommendations'
    ],
    vocabulary: [
      'social networking', 'digital footprint', 'cyberbullying', 'FOMO (fear of missing out)',
      'procrastination', 'online community', 'peer pressure', 'self-esteem',
      'screen addiction', 'information overload', 'time management',
      'it is widely acknowledged that...', 'research suggests...', 'on balance'
    ],
    timeLimit: 30
  },
  {
    id: 'w-b2-02',
    title: 'Should University Education Be Free?',
    level: 'B2',
    type: 'essay',
    prompt: 'Some people believe that university education should be free for all students. Others argue that students should pay tuition fees. Discuss both views and give your own opinion.',
    promptVi: 'Một số người cho rằng giáo dục đại học nên miễn phí cho tất cả sinh viên. Những người khác cho rằng sinh viên nên đóng học phí. Thảo luận cả hai quan điểm và đưa ra ý kiến của bạn.',
    guidelines: [
      'Present both sides of the argument fairly.',
      'Use formal academic language throughout.',
      'Support each argument with reasoning and examples.',
      'Clearly state your own position in the conclusion.',
      'Use hedging language: tend to, it could be argued, there is evidence to suggest.'
    ],
    minWords: 180,
    maxWords: 300,
    sampleOutline: [
      'Introduction: The debate on free university education',
      'Body 1: Arguments for free education (equal access, reduced debt)',
      'Body 2: Arguments against free education (funding, quality concerns)',
      'Body 3: Alternative solutions (scholarships, subsidies)',
      'Conclusion: Your position with justification'
    ],
    vocabulary: [
      'tuition fees', 'scholarship', 'student loan', 'financial burden',
      'equal opportunity', 'taxpayer', 'government funding', 'subsidy',
      'academic merit', 'socioeconomic background', 'higher education',
      'it could be argued that...', 'proponents claim...', 'critics argue...'
    ],
    timeLimit: 30
  },
  {
    id: 'w-b2-03',
    title: 'The Role of AI in Education',
    level: 'B2',
    type: 'report',
    prompt: 'Write a report on the role of artificial intelligence (AI) in education. How is AI currently being used? What are the potential benefits and risks? What might the future look like?',
    promptVi: 'Viết một báo cáo về vai trò của trí tuệ nhân tạo (AI) trong giáo dục. AI hiện đang được sử dụng như thế nào? Những lợi ích và rủi ro tiềm tàng là gì? Tương lai có thể trông như thế nào?',
    guidelines: [
      'Use a report structure with clear sections.',
      'Include an introduction, findings, and recommendations.',
      'Discuss current applications of AI in education.',
      'Analyze both benefits and potential risks.',
      'Make predictions about future developments.',
      'Use formal and objective language.'
    ],
    minWords: 200,
    maxWords: 320,
    sampleOutline: [
      'Introduction: AI in the education landscape',
      'Current applications: chatbots, adaptive learning, automated grading',
      'Benefits: personalization, efficiency, accessibility',
      'Risks and concerns: plagiarism, job displacement, data privacy',
      'Future outlook and recommendations'
    ],
    vocabulary: [
      'artificial intelligence', 'machine learning', 'adaptive learning',
      'personalized education', 'automated assessment', 'chatbot',
      'data privacy', 'ethical implications', 'digital transformation',
      'academic integrity', 'plagiarism detection', 'human oversight',
      'it is recommended that...', 'the findings suggest...'
    ],
    timeLimit: 35
  },

  // ============ C1 LEVEL ============
  {
    id: 'w-c1-01',
    title: 'Technology and Human Interaction',
    level: 'C1',
    type: 'essay',
    prompt: 'Discuss the balance between technology and human interaction in modern society. To what extent has technology enhanced or diminished the quality of human relationships? Use specific examples to support your argument.',
    promptVi: 'Thảo luận về sự cân bằng giữa công nghệ và tương tác con người trong xã hội hiện đại. Công nghệ đã nâng cao hay làm giảm chất lượng các mối quan hệ giữa con người ở mức độ nào? Sử dụng các ví dụ cụ thể để hỗ trợ lập luận của bạn.',
    guidelines: [
      'Develop a clear thesis that addresses the complexity of the issue.',
      'Use sophisticated sentence structures and academic vocabulary.',
      'Present multiple perspectives before stating your own position.',
      'Include concrete examples from daily life, work, and education.',
      'Demonstrate critical thinking through analysis, not just description.',
      'Use cohesive devices to ensure smooth paragraph transitions.'
    ],
    minWords: 250,
    maxWords: 400,
    sampleOutline: [
      'Introduction: The paradox of connectivity in the digital age',
      'Body 1: How technology has enhanced human connection (global communication, remote relationships)',
      'Body 2: How technology has diminished interaction quality (superficial connections, reduced face-to-face time)',
      'Body 3: The impact on workplace and educational relationships',
      'Body 4: Finding a sustainable balance',
      'Conclusion: Synthesis and forward-looking perspective'
    ],
    vocabulary: [
      'interpersonal communication', 'digital divide', 'social isolation',
      'virtual community', 'face-to-face interaction', 'emotional intelligence',
      'superficial connection', 'deep conversation', 'empathy deficit',
      'paradoxically', 'notwithstanding', 'it is incumbent upon...',
      'the ramifications of...', 'a nuanced perspective', 'in light of'
    ],
    timeLimit: 40
  },
  {
    id: 'w-c1-02',
    title: 'Globalization and Local Cultures',
    level: 'C1',
    type: 'essay',
    prompt: 'Analyze the impact of globalization on local cultures. Is globalization leading to cultural homogenization, or can local traditions and identities coexist with global influences? Discuss with reference to specific cultural examples.',
    promptVi: 'Phân tích tác động của toàn cầu hóa đối với văn hóa địa phương. Toàn cầu hóa có dẫn đến sự đồng nhất văn hóa không, hay các truyền thống và bản sắc địa phương có thể cùng tồn tại với ảnh hưởng toàn cầu? Thảo luận với tham chiếu đến các ví dụ văn hóa cụ thể.',
    guidelines: [
      'Construct a well-structured argumentative essay.',
      'Define key terms such as globalization and cultural homogenization.',
      'Present arguments for and against cultural homogenization.',
      'Use specific cultural examples (e.g., Vietnamese culture in global context).',
      'Demonstrate the ability to synthesize complex ideas.',
      'Write a conclusion that offers an insightful, balanced perspective.'
    ],
    minWords: 250,
    maxWords: 400,
    sampleOutline: [
      'Introduction: Defining globalization and its cultural dimensions',
      'Body 1: Evidence of cultural homogenization (Western media, global brands)',
      'Body 2: Resilience of local cultures (traditions, language, festivals)',
      'Body 3: Hybridization — the blending of global and local (glocalization)',
      'Body 4: The role of technology in cultural preservation and erosion',
      'Conclusion: A synthesis acknowledging both convergence and diversity'
    ],
    vocabulary: [
      'cultural homogenization', 'glocalization', 'cultural identity',
      'indigenous traditions', 'cultural imperialism', 'heritage preservation',
      'cross-cultural exchange', 'multiculturalism', 'assimilation',
      'cultural erosion', 'cosmopolitan', 'vernacular', 'diaspora',
      'it is imperative to recognize...', 'the interplay between...',
      'a compelling argument can be made that...'
    ],
    timeLimit: 40
  }
];
