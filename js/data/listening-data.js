const LISTENING_EXERCISES = [
  // ===== DICTATION EXERCISES =====
  {
    id: 'l1',
    title: 'Introducing Yourself at University',
    level: 'B1',
    type: 'dictation',
    transcript: `Hello everyone. My name is Minh and I am a first-year student at FPT University. I am studying software engineering because I am passionate about technology. In my free time, I enjoy playing basketball and reading books about artificial intelligence. I hope to become a skilled developer after graduation. Nice to meet all of you.`,
    audioText: `Hello everyone. My name is Minh and I am a first-year student at FPT University. I am studying software engineering because I am passionate about technology. In my free time, I enjoy playing basketball and reading books about artificial intelligence. I hope to become a skilled developer after graduation. Nice to meet all of you.`,
    sentences: [
      'Hello everyone.',
      'My name is Minh and I am a first-year student at FPT University.',
      'I am studying software engineering because I am passionate about technology.',
      'In my free time, I enjoy playing basketball and reading books about artificial intelligence.',
      'I hope to become a skilled developer after graduation.',
      'Nice to meet all of you.'
    ]
  },
  {
    id: 'l2',
    title: 'A Day in the Life of a Student',
    level: 'B1',
    type: 'dictation',
    transcript: `I usually wake up at six thirty in the morning. After taking a shower and having breakfast, I ride my motorbike to campus. My first class starts at eight o'clock. I have three classes today: English, mathematics, and programming. During lunch break, I eat at the canteen with my friends. After classes finish at four, I go to the library to study for about two hours. In the evening, I review my notes and prepare for tomorrow's lessons.`,
    audioText: `I usually wake up at six thirty in the morning. After taking a shower and having breakfast, I ride my motorbike to campus. My first class starts at eight o'clock. I have three classes today: English, mathematics, and programming. During lunch break, I eat at the canteen with my friends. After classes finish at four, I go to the library to study for about two hours. In the evening, I review my notes and prepare for tomorrow's lessons.`,
    sentences: [
      'I usually wake up at six thirty in the morning.',
      'After taking a shower and having breakfast, I ride my motorbike to campus.',
      "My first class starts at eight o'clock.",
      'I have three classes today: English, mathematics, and programming.',
      'During lunch break, I eat at the canteen with my friends.',
      'After classes finish at four, I go to the library to study for about two hours.',
      "In the evening, I review my notes and prepare for tomorrow's lessons."
    ]
  },
  {
    id: 'l3',
    title: 'Making Plans with Friends',
    level: 'B1',
    type: 'dictation',
    transcript: `Hey Lan, are you free this Saturday? I was thinking we could go to the new shopping mall downtown. I heard they have a great food court with Japanese and Korean restaurants. We could also watch a movie after lunch. The new action film looks really exciting. Let me know if you are interested. We can meet at the bus stop at ten in the morning.`,
    audioText: `Hey Lan, are you free this Saturday? I was thinking we could go to the new shopping mall downtown. I heard they have a great food court with Japanese and Korean restaurants. We could also watch a movie after lunch. The new action film looks really exciting. Let me know if you are interested. We can meet at the bus stop at ten in the morning.`,
    sentences: [
      'Hey Lan, are you free this Saturday?',
      'I was thinking we could go to the new shopping mall downtown.',
      'I heard they have a great food court with Japanese and Korean restaurants.',
      'We could also watch a movie after lunch.',
      'The new action film looks really exciting.',
      'Let me know if you are interested.',
      'We can meet at the bus stop at ten in the morning.'
    ]
  },

  // ===== FILL IN THE BLANKS EXERCISES =====
  {
    id: 'l4',
    title: 'The Importance of Teamwork',
    level: 'B1',
    type: 'fill_blanks',
    transcript: `Teamwork is an essential skill in both university and the workplace. When people work together, they can achieve much more than when they work alone. Each team member brings different strengths and perspectives to the project. Good communication is the foundation of effective teamwork. Team members should listen actively, share ideas openly, and respect different opinions. Conflicts may arise, but they can be resolved through honest discussion and compromise. Learning to work well in a team will prepare you for success in your future career.`,
    audioText: `Teamwork is an essential skill in both university and the workplace. When people work together, they can achieve much more than when they work alone. Each team member brings different strengths and perspectives to the project. Good communication is the foundation of effective teamwork. Team members should listen actively, share ideas openly, and respect different opinions. Conflicts may arise, but they can be resolved through honest discussion and compromise. Learning to work well in a team will prepare you for success in your future career.`,
    blankedText: `Teamwork is an ___(1)___ skill in both university and the workplace. When people work together, they can ___(2)___ much more than when they work alone. Each team member brings different strengths and ___(3)___ to the project. Good ___(4)___ is the foundation of effective teamwork. Team members should listen ___(5)___, share ideas openly, and respect different opinions. Conflicts may arise, but they can be resolved through honest ___(6)___ and compromise. Learning to work well in a team will ___(7)___ you for success in your future career.`,
    answers: ['essential', 'achieve', 'perspectives', 'communication', 'actively', 'discussion', 'prepare'],
    sentences: [
      'Teamwork is an essential skill in both university and the workplace.',
      'When people work together, they can achieve much more than when they work alone.',
      'Each team member brings different strengths and perspectives to the project.',
      'Good communication is the foundation of effective teamwork.',
      'Team members should listen actively, share ideas openly, and respect different opinions.',
      'Conflicts may arise, but they can be resolved through honest discussion and compromise.',
      'Learning to work well in a team will prepare you for success in your future career.'
    ]
  },
  {
    id: 'l5',
    title: 'Tips for Effective Online Learning',
    level: 'B1',
    type: 'fill_blanks',
    transcript: `Online learning has become increasingly popular among university students. To succeed in online courses, you need strong self-discipline and time management skills. First, create a dedicated study space that is quiet and free from distractions. Second, establish a regular study schedule and stick to it consistently. Third, participate actively in online discussions and ask questions when you do not understand something. Fourth, take regular breaks to avoid mental fatigue. Finally, stay connected with your classmates through group chats and virtual study sessions. With the right approach, online learning can be just as effective as traditional classroom learning.`,
    audioText: `Online learning has become increasingly popular among university students. To succeed in online courses, you need strong self-discipline and time management skills. First, create a dedicated study space that is quiet and free from distractions. Second, establish a regular study schedule and stick to it consistently. Third, participate actively in online discussions and ask questions when you do not understand something. Fourth, take regular breaks to avoid mental fatigue. Finally, stay connected with your classmates through group chats and virtual study sessions. With the right approach, online learning can be just as effective as traditional classroom learning.`,
    blankedText: `Online learning has become ___(1)___ popular among university students. To succeed in online courses, you need strong self-discipline and time ___(2)___ skills. First, create a ___(3)___ study space that is quiet and free from distractions. Second, ___(4)___ a regular study schedule and stick to it consistently. Third, ___(5)___ actively in online discussions and ask questions when you do not understand something. Fourth, take regular breaks to avoid mental ___(6)___. Finally, stay ___(7)___ with your classmates through group chats and virtual study sessions. With the right ___(8)___, online learning can be just as effective as traditional classroom learning.`,
    answers: ['increasingly', 'management', 'dedicated', 'establish', 'participate', 'fatigue', 'connected', 'approach'],
    sentences: [
      'Online learning has become increasingly popular among university students.',
      'To succeed in online courses, you need strong self-discipline and time management skills.',
      'First, create a dedicated study space that is quiet and free from distractions.',
      'Second, establish a regular study schedule and stick to it consistently.',
      'Third, participate actively in online discussions and ask questions when you do not understand something.',
      'Fourth, take regular breaks to avoid mental fatigue.',
      'Finally, stay connected with your classmates through group chats and virtual study sessions.',
      'With the right approach, online learning can be just as effective as traditional classroom learning.'
    ]
  },
  {
    id: 'l6',
    title: 'Climate Change and Our Responsibility',
    level: 'B2',
    type: 'fill_blanks',
    transcript: `Climate change is one of the most significant challenges of our generation. Scientists have confirmed that human activities, particularly the burning of fossil fuels, are the primary cause of global warming. The consequences are already visible: rising sea levels, more frequent extreme weather events, and the loss of biodiversity. Vietnam is especially vulnerable to climate change due to its long coastline and low-lying river deltas. To address this crisis, we need both government action and individual responsibility. Reducing carbon emissions, transitioning to renewable energy sources, and protecting natural ecosystems are all essential steps toward a sustainable future.`,
    audioText: `Climate change is one of the most significant challenges of our generation. Scientists have confirmed that human activities, particularly the burning of fossil fuels, are the primary cause of global warming. The consequences are already visible: rising sea levels, more frequent extreme weather events, and the loss of biodiversity. Vietnam is especially vulnerable to climate change due to its long coastline and low-lying river deltas. To address this crisis, we need both government action and individual responsibility. Reducing carbon emissions, transitioning to renewable energy sources, and protecting natural ecosystems are all essential steps toward a sustainable future.`,
    blankedText: `Climate change is one of the most ___(1)___ challenges of our generation. Scientists have confirmed that human activities, particularly the burning of ___(2)___, are the primary cause of global warming. The ___(3)___ are already visible: rising sea levels, more frequent extreme weather events, and the loss of ___(4)___. Vietnam is especially ___(5)___ to climate change due to its long coastline and low-lying river deltas. To address this crisis, we need both government action and individual ___(6)___. Reducing carbon ___(7)___, transitioning to renewable energy sources, and protecting natural ___(8)___ are all essential steps toward a sustainable future.`,
    answers: ['significant', 'fossil fuels', 'consequences', 'biodiversity', 'vulnerable', 'responsibility', 'emissions', 'ecosystems'],
    sentences: [
      'Climate change is one of the most significant challenges of our generation.',
      'Scientists have confirmed that human activities, particularly the burning of fossil fuels, are the primary cause of global warming.',
      'The consequences are already visible: rising sea levels, more frequent extreme weather events, and the loss of biodiversity.',
      'Vietnam is especially vulnerable to climate change due to its long coastline and low-lying river deltas.',
      'To address this crisis, we need both government action and individual responsibility.',
      'Reducing carbon emissions, transitioning to renewable energy sources, and protecting natural ecosystems are all essential steps toward a sustainable future.'
    ]
  },
  {
    id: 'l7',
    title: 'The Future of Work and Technology',
    level: 'B2',
    type: 'fill_blanks',
    transcript: `The workplace is undergoing a dramatic transformation driven by advances in technology. Artificial intelligence and automation are reshaping entire industries, creating new opportunities while simultaneously making some traditional jobs obsolete. According to recent research, approximately forty percent of current jobs could be automated within the next two decades. However, this does not necessarily mean widespread unemployment. Throughout history, technological progress has consistently created more jobs than it has destroyed. The key challenge lies in ensuring that workers have the skills needed for emerging roles. Critical thinking, creativity, emotional intelligence, and digital literacy are increasingly valued by employers. For university students, this means that lifelong learning and adaptability will be essential throughout their careers.`,
    audioText: `The workplace is undergoing a dramatic transformation driven by advances in technology. Artificial intelligence and automation are reshaping entire industries, creating new opportunities while simultaneously making some traditional jobs obsolete. According to recent research, approximately forty percent of current jobs could be automated within the next two decades. However, this does not necessarily mean widespread unemployment. Throughout history, technological progress has consistently created more jobs than it has destroyed. The key challenge lies in ensuring that workers have the skills needed for emerging roles. Critical thinking, creativity, emotional intelligence, and digital literacy are increasingly valued by employers. For university students, this means that lifelong learning and adaptability will be essential throughout their careers.`,
    blankedText: `The workplace is undergoing a dramatic ___(1)___ driven by advances in technology. Artificial intelligence and ___(2)___ are reshaping entire industries, creating new opportunities while ___(3)___ making some traditional jobs obsolete. According to recent research, ___(4)___ forty percent of current jobs could be automated within the next two decades. However, this does not necessarily mean widespread ___(5)___. Throughout history, technological progress has ___(6)___ created more jobs than it has destroyed. The key ___(7)___ lies in ensuring that workers have the skills needed for emerging roles. Critical thinking, creativity, emotional ___(8)___, and digital literacy are increasingly valued by employers.`,
    answers: ['transformation', 'automation', 'simultaneously', 'approximately', 'unemployment', 'consistently', 'challenge', 'intelligence'],
    sentences: [
      'The workplace is undergoing a dramatic transformation driven by advances in technology.',
      'Artificial intelligence and automation are reshaping entire industries, creating new opportunities while simultaneously making some traditional jobs obsolete.',
      'According to recent research, approximately forty percent of current jobs could be automated within the next two decades.',
      'However, this does not necessarily mean widespread unemployment.',
      'Throughout history, technological progress has consistently created more jobs than it has destroyed.',
      'The key challenge lies in ensuring that workers have the skills needed for emerging roles.',
      'Critical thinking, creativity, emotional intelligence, and digital literacy are increasingly valued by employers.',
      'For university students, this means that lifelong learning and adaptability will be essential throughout their careers.'
    ]
  },

  // ===== MULTIPLE CHOICE EXERCISES =====
  {
    id: 'l8',
    title: 'A University Campus Tour',
    level: 'B1',
    type: 'multiple_choice',
    transcript: `Welcome to FPT University! I will be your guide today as we tour the campus. Let me start with the main building, which is right behind me. This is where most of the lectures take place. It has twenty classrooms, each equipped with modern projectors and air conditioning. On the second floor, you will find the computer labs where students practice programming. Moving to the left, we have the library. It is open from seven in the morning until nine at night on weekdays, and from eight to five on weekends. The library has over fifty thousand books and a large digital collection. Now, if you follow me this way, I will show you the student dormitories. Each room accommodates four students and includes basic furniture, Wi-Fi, and air conditioning. The monthly rent is one point five million dong, which includes electricity and water. Finally, let me show you the sports facilities. We have a football field, basketball courts, and a swimming pool. Students can use these facilities for free with their student ID.`,
    audioText: `Welcome to FPT University! I will be your guide today as we tour the campus. Let me start with the main building, which is right behind me. This is where most of the lectures take place. It has twenty classrooms, each equipped with modern projectors and air conditioning. On the second floor, you will find the computer labs where students practice programming. Moving to the left, we have the library. It is open from seven in the morning until nine at night on weekdays, and from eight to five on weekends. The library has over fifty thousand books and a large digital collection. Now, if you follow me this way, I will show you the student dormitories. Each room accommodates four students and includes basic furniture, Wi-Fi, and air conditioning. The monthly rent is one point five million dong, which includes electricity and water. Finally, let me show you the sports facilities. We have a football field, basketball courts, and a swimming pool. Students can use these facilities for free with their student ID.`,
    sentences: [
      'Welcome to FPT University!',
      'I will be your guide today as we tour the campus.',
      'Let me start with the main building, which is right behind me.',
      'This is where most of the lectures take place.',
      'It has twenty classrooms, each equipped with modern projectors and air conditioning.',
      'On the second floor, you will find the computer labs where students practice programming.',
      'Moving to the left, we have the library.',
      'It is open from seven in the morning until nine at night on weekdays, and from eight to five on weekends.',
      'The library has over fifty thousand books and a large digital collection.',
      'Now, if you follow me this way, I will show you the student dormitories.',
      'Each room accommodates four students and includes basic furniture, Wi-Fi, and air conditioning.',
      'The monthly rent is one point five million dong, which includes electricity and water.',
      'Finally, let me show you the sports facilities.',
      'We have a football field, basketball courts, and a swimming pool.',
      'Students can use these facilities for free with their student ID.'
    ],
    questions: [
      {
        question: 'How many classrooms are in the main building?',
        options: ['Ten', 'Twenty', 'Thirty', 'Fifteen'],
        answer: 'Twenty',
        explanationVi: 'Hướng dẫn viên nói "It has twenty classrooms" - Tòa nhà chính có 20 phòng học.'
      },
      {
        question: 'What time does the library close on weekdays?',
        options: ['8 PM', '9 PM', '10 PM', '5 PM'],
        answer: '9 PM',
        explanationVi: 'Thư viện mở "from seven in the morning until nine at night on weekdays" - đến 9 giờ tối các ngày trong tuần.'
      },
      {
        question: 'How many students share each dormitory room?',
        options: ['Two', 'Three', 'Four', 'Six'],
        answer: 'Four',
        explanationVi: 'Mỗi phòng ký túc xá "accommodates four students" - chứa 4 sinh viên.'
      },
      {
        question: 'What is NOT included in the monthly dormitory rent?',
        options: ['Electricity', 'Water', 'Food', 'Wi-Fi'],
        answer: 'Food',
        explanationVi: 'Tiền thuê bao gồm "electricity and water" và phòng có Wi-Fi, nhưng không bao gồm thức ăn.'
      },
      {
        question: 'What do students need to use the sports facilities for free?',
        options: ['A membership card', 'A student ID', 'A sports uniform', 'Permission from a teacher'],
        answer: 'A student ID',
        explanationVi: 'Sinh viên cần "student ID" - thẻ sinh viên để sử dụng miễn phí cơ sở thể thao.'
      }
    ]
  },
  {
    id: 'l9',
    title: 'A Job Interview Conversation',
    level: 'B2',
    type: 'multiple_choice',
    transcript: `Good morning. Please have a seat. Thank you for coming in today. I have reviewed your resume and I am quite impressed with your academic achievements. Can you tell me why you applied for this position at our company? Well, I have been following your company for several years now, and I am very impressed by your commitment to innovation in the technology sector. I believe my skills in software development and my experience with project management during my university years make me a strong fit for this role. That sounds great. Can you describe a challenging situation you faced and how you handled it? Certainly. During my final year project, our team had a major disagreement about the technical approach. Two members wanted to use Python while the others preferred Java. As the team leader, I organized a meeting where each side presented their arguments. We eventually decided on Python because it was better suited for our machine learning project. The experience taught me the importance of listening to all perspectives before making a decision. Excellent. What are your salary expectations? Based on my research and the industry standard for this position, I would expect a salary in the range of fifteen to eighteen million dong per month. However, I am flexible and open to negotiation based on the full compensation package. Very good. Do you have any questions for us? Yes, I would like to know more about the opportunities for professional development and training within the company.`,
    audioText: `Good morning. Please have a seat. Thank you for coming in today. I have reviewed your resume and I am quite impressed with your academic achievements. Can you tell me why you applied for this position at our company? Well, I have been following your company for several years now, and I am very impressed by your commitment to innovation in the technology sector. I believe my skills in software development and my experience with project management during my university years make me a strong fit for this role. That sounds great. Can you describe a challenging situation you faced and how you handled it? Certainly. During my final year project, our team had a major disagreement about the technical approach. Two members wanted to use Python while the others preferred Java. As the team leader, I organized a meeting where each side presented their arguments. We eventually decided on Python because it was better suited for our machine learning project. The experience taught me the importance of listening to all perspectives before making a decision. Excellent. What are your salary expectations? Based on my research and the industry standard for this position, I would expect a salary in the range of fifteen to eighteen million dong per month. However, I am flexible and open to negotiation based on the full compensation package. Very good. Do you have any questions for us? Yes, I would like to know more about the opportunities for professional development and training within the company.`,
    sentences: [
      'Good morning. Please have a seat.',
      'Thank you for coming in today.',
      'I have reviewed your resume and I am quite impressed with your academic achievements.',
      'Can you tell me why you applied for this position at our company?',
      'Well, I have been following your company for several years now, and I am very impressed by your commitment to innovation in the technology sector.',
      'I believe my skills in software development and my experience with project management during my university years make me a strong fit for this role.',
      'That sounds great. Can you describe a challenging situation you faced and how you handled it?',
      'Certainly. During my final year project, our team had a major disagreement about the technical approach.',
      'Two members wanted to use Python while the others preferred Java.',
      'As the team leader, I organized a meeting where each side presented their arguments.',
      'We eventually decided on Python because it was better suited for our machine learning project.',
      'The experience taught me the importance of listening to all perspectives before making a decision.',
      'Excellent. What are your salary expectations?',
      'Based on my research and the industry standard for this position, I would expect a salary in the range of fifteen to eighteen million dong per month.',
      'However, I am flexible and open to negotiation based on the full compensation package.',
      'Very good. Do you have any questions for us?',
      'Yes, I would like to know more about the opportunities for professional development and training within the company.'
    ],
    questions: [
      {
        question: 'Why did the candidate apply to this company?',
        options: [
          'Because it offers the highest salary',
          'Because of the company\'s commitment to innovation',
          'Because a friend recommended it',
          'Because it is close to home'
        ],
        answer: 'Because of the company\'s commitment to innovation',
        explanationVi: 'Ứng viên nói ấn tượng bởi "commitment to innovation in the technology sector" - cam kết đổi mới trong lĩnh vực công nghệ.'
      },
      {
        question: 'What was the disagreement about in the team project?',
        options: [
          'The project deadline',
          'The team leader',
          'The technical approach — Python vs Java',
          'The project budget'
        ],
        answer: 'The technical approach — Python vs Java',
        explanationVi: 'Nhóm bất đồng về "the technical approach" - phương pháp kỹ thuật, cụ thể là Python hay Java.'
      },
      {
        question: 'Why did the team choose Python?',
        options: [
          'Because it was easier to learn',
          'Because it was better suited for their machine learning project',
          'Because the team leader preferred it',
          'Because more team members voted for it'
        ],
        answer: 'Because it was better suited for their machine learning project',
        explanationVi: 'Nhóm chọn Python vì "better suited for our machine learning project" - phù hợp hơn cho dự án machine learning.'
      },
      {
        question: 'What salary range does the candidate expect?',
        options: [
          '10-12 million dong',
          '12-15 million dong',
          '15-18 million dong',
          '18-22 million dong'
        ],
        answer: '15-18 million dong',
        explanationVi: 'Ứng viên mong đợi mức lương "fifteen to eighteen million dong per month" - 15-18 triệu đồng/tháng.'
      },
      {
        question: 'What question did the candidate ask the interviewer?',
        options: [
          'About the office location',
          'About vacation days',
          'About professional development and training opportunities',
          'About work-from-home policies'
        ],
        answer: 'About professional development and training opportunities',
        explanationVi: 'Ứng viên hỏi về "opportunities for professional development and training" - cơ hội phát triển chuyên môn và đào tạo.'
      }
    ]
  },
  {
    id: 'l10',
    title: 'A Lecture on Digital Marketing',
    level: 'B2',
    type: 'multiple_choice',
    transcript: `Good morning everyone. Today we are going to discuss digital marketing, which is one of the fastest growing fields in the business world. Digital marketing refers to any marketing effort that uses electronic devices or the internet. Businesses use digital channels such as search engines, social media, email, and websites to connect with current and potential customers. There are several key components of digital marketing. First, search engine optimization, or SEO, involves improving your website so that it appears higher in search engine results. The higher your site ranks, the more visitors you will attract. Second, content marketing focuses on creating and sharing valuable content to attract and engage your target audience. This could include blog posts, videos, podcasts, or infographics. Third, social media marketing uses platforms like Facebook, Instagram, and TikTok to promote products and build brand awareness. In Vietnam, social media marketing is particularly effective because over seventy million people are active social media users. Fourth, email marketing remains one of the most cost-effective strategies. Despite being one of the oldest forms of digital marketing, it consistently delivers the highest return on investment. One important trend to watch is the use of artificial intelligence in marketing. AI can analyze customer behavior, predict trends, and personalize marketing messages at scale. Companies that embrace AI-driven marketing will have a significant competitive advantage in the coming years.`,
    audioText: `Good morning everyone. Today we are going to discuss digital marketing, which is one of the fastest growing fields in the business world. Digital marketing refers to any marketing effort that uses electronic devices or the internet. Businesses use digital channels such as search engines, social media, email, and websites to connect with current and potential customers. There are several key components of digital marketing. First, search engine optimization, or SEO, involves improving your website so that it appears higher in search engine results. The higher your site ranks, the more visitors you will attract. Second, content marketing focuses on creating and sharing valuable content to attract and engage your target audience. This could include blog posts, videos, podcasts, or infographics. Third, social media marketing uses platforms like Facebook, Instagram, and TikTok to promote products and build brand awareness. In Vietnam, social media marketing is particularly effective because over seventy million people are active social media users. Fourth, email marketing remains one of the most cost-effective strategies. Despite being one of the oldest forms of digital marketing, it consistently delivers the highest return on investment. One important trend to watch is the use of artificial intelligence in marketing. AI can analyze customer behavior, predict trends, and personalize marketing messages at scale. Companies that embrace AI-driven marketing will have a significant competitive advantage in the coming years.`,
    sentences: [
      'Good morning everyone.',
      'Today we are going to discuss digital marketing, which is one of the fastest growing fields in the business world.',
      'Digital marketing refers to any marketing effort that uses electronic devices or the internet.',
      'Businesses use digital channels such as search engines, social media, email, and websites to connect with current and potential customers.',
      'There are several key components of digital marketing.',
      'First, search engine optimization, or SEO, involves improving your website so that it appears higher in search engine results.',
      'The higher your site ranks, the more visitors you will attract.',
      'Second, content marketing focuses on creating and sharing valuable content to attract and engage your target audience.',
      'This could include blog posts, videos, podcasts, or infographics.',
      'Third, social media marketing uses platforms like Facebook, Instagram, and TikTok to promote products and build brand awareness.',
      'In Vietnam, social media marketing is particularly effective because over seventy million people are active social media users.',
      'Fourth, email marketing remains one of the most cost-effective strategies.',
      'Despite being one of the oldest forms of digital marketing, it consistently delivers the highest return on investment.',
      'One important trend to watch is the use of artificial intelligence in marketing.',
      'AI can analyze customer behavior, predict trends, and personalize marketing messages at scale.',
      'Companies that embrace AI-driven marketing will have a significant competitive advantage in the coming years.'
    ],
    questions: [
      {
        question: 'What does SEO stand for?',
        options: [
          'Social Engine Online',
          'Search Engine Optimization',
          'Standard Electronic Output',
          'Systematic Email Outreach'
        ],
        answer: 'Search Engine Optimization',
        explanationVi: 'SEO là viết tắt của "Search Engine Optimization" - Tối ưu hóa công cụ tìm kiếm.'
      },
      {
        question: 'How many active social media users are there in Vietnam?',
        options: [
          'Over fifty million',
          'Over sixty million',
          'Over seventy million',
          'Over eighty million'
        ],
        answer: 'Over seventy million',
        explanationVi: 'Việt Nam có "over seventy million people are active social media users" - hơn 70 triệu người dùng mạng xã hội.'
      },
      {
        question: 'Which form of digital marketing delivers the highest return on investment?',
        options: [
          'Social media marketing',
          'Content marketing',
          'Email marketing',
          'SEO'
        ],
        answer: 'Email marketing',
        explanationVi: 'Email marketing "consistently delivers the highest return on investment" - luôn mang lại lợi nhuận đầu tư cao nhất.'
      },
      {
        question: 'What can AI do in marketing?',
        options: [
          'Replace all marketing employees',
          'Analyze behavior, predict trends, and personalize messages',
          'Only send emails automatically',
          'Only manage social media accounts'
        ],
        answer: 'Analyze behavior, predict trends, and personalize messages',
        explanationVi: 'AI có thể "analyze customer behavior, predict trends, and personalize marketing messages" - phân tích hành vi, dự đoán xu hướng, và cá nhân hóa tin nhắn.'
      },
      {
        question: 'What is NOT mentioned as a component of digital marketing?',
        options: [
          'Search engine optimization',
          'Television advertising',
          'Content marketing',
          'Email marketing'
        ],
        answer: 'Television advertising',
        explanationVi: 'Bài giảng đề cập SEO, content marketing, social media marketing, và email marketing - nhưng không nói về quảng cáo truyền hình.'
      }
    ]
  },

  // ===== FULL TEST EXERCISES =====
  {
    id: 'l11',
    title: 'Academic Presentation: The Effects of Screen Time',
    level: 'B2',
    type: 'full_test',
    transcript: `Good afternoon, everyone. My name is Thu, and today I would like to present my research on the effects of excessive screen time on university students. As we all know, smartphones and laptops have become indispensable tools for modern students. However, the average student now spends approximately eight to ten hours per day looking at screens, including both study and leisure time. My research surveyed three hundred students at our university and found some concerning results. Sixty-five percent of respondents reported experiencing eye strain or headaches related to screen use. Nearly half said they regularly stayed up past midnight using their phones, which significantly affected their sleep quality. Perhaps most surprisingly, forty percent admitted that they check their phones within five minutes of waking up, before even getting out of bed. The health implications are significant. Prolonged screen time is associated with increased rates of myopia, or nearsightedness, which has become an epidemic among young adults in Asia. It also contributes to a sedentary lifestyle, increasing the risk of obesity and related health problems. Based on my findings, I would like to suggest three practical recommendations. First, follow the twenty-twenty-twenty rule: every twenty minutes, look at something twenty feet away for twenty seconds. This helps reduce eye strain. Second, set a digital curfew. Stop using screens at least one hour before bedtime to improve sleep quality. Third, use apps that track and limit your screen time. Many phones now have built-in features for this purpose. In conclusion, while technology is essential for our education, we need to be more mindful about how much time we spend in front of screens. Our health and well-being depend on finding the right balance. Thank you for listening. I am happy to take any questions.`,
    audioText: `Good afternoon, everyone. My name is Thu, and today I would like to present my research on the effects of excessive screen time on university students. As we all know, smartphones and laptops have become indispensable tools for modern students. However, the average student now spends approximately eight to ten hours per day looking at screens, including both study and leisure time. My research surveyed three hundred students at our university and found some concerning results. Sixty-five percent of respondents reported experiencing eye strain or headaches related to screen use. Nearly half said they regularly stayed up past midnight using their phones, which significantly affected their sleep quality. Perhaps most surprisingly, forty percent admitted that they check their phones within five minutes of waking up, before even getting out of bed. The health implications are significant. Prolonged screen time is associated with increased rates of myopia, or nearsightedness, which has become an epidemic among young adults in Asia. It also contributes to a sedentary lifestyle, increasing the risk of obesity and related health problems. Based on my findings, I would like to suggest three practical recommendations. First, follow the twenty-twenty-twenty rule: every twenty minutes, look at something twenty feet away for twenty seconds. This helps reduce eye strain. Second, set a digital curfew. Stop using screens at least one hour before bedtime to improve sleep quality. Third, use apps that track and limit your screen time. Many phones now have built-in features for this purpose. In conclusion, while technology is essential for our education, we need to be more mindful about how much time we spend in front of screens. Our health and well-being depend on finding the right balance. Thank you for listening. I am happy to take any questions.`,
    sentences: [
      'Good afternoon, everyone.',
      'My name is Thu, and today I would like to present my research on the effects of excessive screen time on university students.',
      'As we all know, smartphones and laptops have become indispensable tools for modern students.',
      'However, the average student now spends approximately eight to ten hours per day looking at screens, including both study and leisure time.',
      'My research surveyed three hundred students at our university and found some concerning results.',
      'Sixty-five percent of respondents reported experiencing eye strain or headaches related to screen use.',
      'Nearly half said they regularly stayed up past midnight using their phones, which significantly affected their sleep quality.',
      'Perhaps most surprisingly, forty percent admitted that they check their phones within five minutes of waking up, before even getting out of bed.',
      'The health implications are significant.',
      'Prolonged screen time is associated with increased rates of myopia, or nearsightedness, which has become an epidemic among young adults in Asia.',
      'It also contributes to a sedentary lifestyle, increasing the risk of obesity and related health problems.',
      'Based on my findings, I would like to suggest three practical recommendations.',
      'First, follow the twenty-twenty-twenty rule: every twenty minutes, look at something twenty feet away for twenty seconds.',
      'This helps reduce eye strain.',
      'Second, set a digital curfew.',
      'Stop using screens at least one hour before bedtime to improve sleep quality.',
      'Third, use apps that track and limit your screen time.',
      'Many phones now have built-in features for this purpose.',
      'In conclusion, while technology is essential for our education, we need to be more mindful about how much time we spend in front of screens.',
      'Our health and well-being depend on finding the right balance.',
      'Thank you for listening. I am happy to take any questions.'
    ],
    questions: [
      {
        question: 'How many students were surveyed in the research?',
        options: ['Two hundred', 'Three hundred', 'Four hundred', 'Five hundred'],
        answer: 'Three hundred',
        explanationVi: 'Nghiên cứu khảo sát "three hundred students" - 300 sinh viên.'
      },
      {
        question: 'What percentage of students experienced eye strain or headaches?',
        options: ['45%', '55%', '65%', '75%'],
        answer: '65%',
        explanationVi: '"Sixty-five percent" - 65% sinh viên bị mỏi mắt hoặc đau đầu do dùng màn hình.'
      },
      {
        question: 'What is the 20-20-20 rule?',
        options: [
          'Study for 20 minutes, rest for 20 minutes, repeat 20 times',
          'Every 20 minutes, look at something 20 feet away for 20 seconds',
          'Use your phone for 20 minutes maximum, 20 times a day',
          'Sleep for 20 hours in 20 days'
        ],
        answer: 'Every 20 minutes, look at something 20 feet away for 20 seconds',
        explanationVi: 'Quy tắc 20-20-20: cứ 20 phút, nhìn vào vật cách 20 feet trong 20 giây để giảm mỏi mắt.'
      },
      {
        question: 'What does "myopia" mean?',
        options: ['Farsightedness', 'Nearsightedness', 'Color blindness', 'Night blindness'],
        answer: 'Nearsightedness',
        explanationVi: 'Myopia nghĩa là "nearsightedness" - cận thị.'
      },
      {
        question: 'How long before bedtime should you stop using screens?',
        options: ['30 minutes', '1 hour', '2 hours', '3 hours'],
        answer: '1 hour',
        explanationVi: 'Nên ngừng dùng màn hình "at least one hour before bedtime" - ít nhất 1 giờ trước khi đi ngủ.'
      },
      {
        question: 'What percentage of students check their phones within 5 minutes of waking up?',
        options: ['20%', '30%', '40%', '50%'],
        answer: '40%',
        explanationVi: '"Forty percent" - 40% sinh viên kiểm tra điện thoại trong vòng 5 phút sau khi thức dậy.'
      }
    ]
  },
  {
    id: 'l12',
    title: 'Conversation: Planning a Study Abroad Trip',
    level: 'B2',
    type: 'multiple_choice',
    transcript: `Hey Tuan, have you heard about the exchange program with the university in Australia? Yes, I saw the announcement yesterday. It sounds like an amazing opportunity. Students can study there for one semester and the credits transfer back to FPT. That is right. I have been thinking about applying, but I am a bit worried about the cost. Let me check. The tuition is covered by the scholarship, but you need to pay for accommodation and living expenses yourself. They estimate about two thousand Australian dollars per month for everything. That is quite a lot. But I think working part-time could help. International students in Australia can work up to forty hours per fortnight during the semester. That would definitely help with expenses. What about the English requirement? You need an IELTS score of at least six point five overall, with no band below six. I got six point five last time, but my writing was only five point five. So I would need to retake it. You should also consider the cultural adjustment. Living in a completely different country can be challenging at first. But it is also the best way to improve your English and broaden your perspective. You are right. I think the benefits outweigh the challenges. Let us start preparing our applications together. The deadline is next month.`,
    audioText: `Hey Tuan, have you heard about the exchange program with the university in Australia? Yes, I saw the announcement yesterday. It sounds like an amazing opportunity. Students can study there for one semester and the credits transfer back to FPT. That is right. I have been thinking about applying, but I am a bit worried about the cost. Let me check. The tuition is covered by the scholarship, but you need to pay for accommodation and living expenses yourself. They estimate about two thousand Australian dollars per month for everything. That is quite a lot. But I think working part-time could help. International students in Australia can work up to forty hours per fortnight during the semester. That would definitely help with expenses. What about the English requirement? You need an IELTS score of at least six point five overall, with no band below six. I got six point five last time, but my writing was only five point five. So I would need to retake it. You should also consider the cultural adjustment. Living in a completely different country can be challenging at first. But it is also the best way to improve your English and broaden your perspective. You are right. I think the benefits outweigh the challenges. Let us start preparing our applications together. The deadline is next month.`,
    sentences: [
      'Hey Tuan, have you heard about the exchange program with the university in Australia?',
      'Yes, I saw the announcement yesterday.',
      'It sounds like an amazing opportunity.',
      'Students can study there for one semester and the credits transfer back to FPT.',
      'That is right. I have been thinking about applying, but I am a bit worried about the cost.',
      'Let me check. The tuition is covered by the scholarship, but you need to pay for accommodation and living expenses yourself.',
      'They estimate about two thousand Australian dollars per month for everything.',
      'That is quite a lot. But I think working part-time could help.',
      'International students in Australia can work up to forty hours per fortnight during the semester.',
      'That would definitely help with expenses. What about the English requirement?',
      'You need an IELTS score of at least six point five overall, with no band below six.',
      'I got six point five last time, but my writing was only five point five.',
      'So I would need to retake it.',
      'You should also consider the cultural adjustment.',
      'Living in a completely different country can be challenging at first.',
      'But it is also the best way to improve your English and broaden your perspective.',
      'You are right. I think the benefits outweigh the challenges.',
      'Let us start preparing our applications together. The deadline is next month.'
    ],
    questions: [
      {
        question: 'How long is the exchange program?',
        options: ['One month', 'One semester', 'One year', 'Two semesters'],
        answer: 'One semester',
        explanationVi: 'Chương trình trao đổi kéo dài "one semester" - một học kỳ.'
      },
      {
        question: 'What does the scholarship cover?',
        options: [
          'All expenses',
          'Only tuition',
          'Only accommodation',
          'Tuition and accommodation'
        ],
        answer: 'Only tuition',
        explanationVi: 'Học bổng chi trả "tuition" - học phí, còn sinh viên phải tự trả chi phí ăn ở.'
      },
      {
        question: 'How many hours can international students work per fortnight in Australia?',
        options: ['Twenty hours', 'Thirty hours', 'Forty hours', 'Fifty hours'],
        answer: 'Forty hours',
        explanationVi: 'Sinh viên quốc tế có thể làm việc "up to forty hours per fortnight" - tối đa 40 giờ mỗi hai tuần.'
      },
      {
        question: 'What IELTS score is required?',
        options: [
          'At least 6.0 overall',
          'At least 6.5 overall with no band below 6',
          'At least 7.0 overall',
          'At least 5.5 overall'
        ],
        answer: 'At least 6.5 overall with no band below 6',
        explanationVi: 'Yêu cầu IELTS "at least six point five overall, with no band below six" - ít nhất 6.5 tổng, không kỹ năng nào dưới 6.'
      },
      {
        question: 'Why does one speaker need to retake the IELTS?',
        options: [
          'The score expired',
          'The overall score was too low',
          'The writing score was only 5.5',
          'The speaking score was too low'
        ],
        answer: 'The writing score was only 5.5',
        explanationVi: 'Người nói cần thi lại vì "writing was only five point five" - điểm viết chỉ 5.5, dưới mức tối thiểu 6.0.'
      }
    ]
  }
];
