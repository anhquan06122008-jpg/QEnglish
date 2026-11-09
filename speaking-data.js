const SPEAKING_TOPICS = [
  // ============ A1 LEVEL ============
  {
    id: 's-a1-01',
    title: 'Greeting and Self-Introduction',
    level: 'A1',
    type: 'conversation',
    prompt: 'Practice introducing yourself to a new classmate at the university. Share your name, where you come from, and what you study.',
    promptVi: 'Thực hành giới thiệu bản thân với một bạn cùng lớp mới tại trường đại học. Chia sẻ tên, quê quán và ngành học của bạn.',
    suggestedQuestions: [
      'What is your name?',
      'Where are you from?',
      'What do you study at the university?',
      'How old are you?',
      'What do you like to do in your free time?'
    ],
    suggestedQuestionsVi: [
      'Bạn tên là gì?',
      'Bạn đến từ đâu?',
      'Bạn học ngành gì tại trường đại học?',
      'Bạn bao nhiêu tuổi?',
      'Bạn thích làm gì trong thời gian rảnh?'
    ],
    usefulPhrases: [
      'Hi, my name is...', 'Nice to meet you!', 'I\'m from...',
      'I\'m studying...', 'I\'m a first-year student.', 'How about you?',
      'I like to...', 'What\'s your major?'
    ],
    sampleAnswer: 'Hi! My name is Minh. Nice to meet you! I\'m from Da Nang, and I\'m 19 years old. I\'m a first-year student at the university, and I\'m studying Software Engineering. In my free time, I like to play football and listen to music. What about you? What\'s your name and where are you from?',
    duration: 60
  },
  {
    id: 's-a1-02',
    title: 'My Daily Life',
    level: 'A1',
    type: 'monologue',
    prompt: 'Talk about your typical day as a student at the university. Describe what you do from morning to evening.',
    promptVi: 'Nói về một ngày bình thường của bạn với tư cách sinh viên trường đại học. Mô tả những gì bạn làm từ sáng đến tối.',
    suggestedQuestions: [
      'What time do you usually wake up?',
      'How do you get to university?',
      'What time do your classes start?',
      'What do you usually have for lunch?',
      'What do you do after class?'
    ],
    suggestedQuestionsVi: [
      'Bạn thường thức dậy lúc mấy giờ?',
      'Bạn đến trường bằng phương tiện gì?',
      'Lớp học của bạn bắt đầu lúc mấy giờ?',
      'Bạn thường ăn trưa gì?',
      'Bạn làm gì sau giờ học?'
    ],
    usefulPhrases: [
      'I usually wake up at...', 'First, I...', 'Then I...',
      'After class, I...', 'In the evening, I...', 'I go to bed at...',
      'I take the bus to...', 'I have lunch at the canteen.'
    ],
    sampleAnswer: 'I usually wake up at 6:30 in the morning. First, I take a shower and have breakfast. Then I go to the university by bus. My classes start at 8 o\'clock. I study until 11:30 and then have lunch at the canteen. In the afternoon, I have more classes or study at the library. After class, I go home and do my homework. In the evening, I sometimes play games or watch YouTube. I usually go to bed at 11 o\'clock.',
    duration: 60
  },
  {
    id: 's-a1-03',
    title: 'Talking About Food',
    level: 'A1',
    type: 'conversation',
    prompt: 'Have a conversation about food. Talk about your favorite Vietnamese dishes and ask your partner about their food preferences.',
    promptVi: 'Trò chuyện về đồ ăn. Nói về những món ăn Việt Nam yêu thích và hỏi bạn bè về sở thích ăn uống của họ.',
    suggestedQuestions: [
      'What is your favorite food?',
      'Can you cook?',
      'What do you usually eat for breakfast?',
      'Do you like Vietnamese food or Western food more?',
      'What food do you not like?'
    ],
    suggestedQuestionsVi: [
      'Món ăn yêu thích của bạn là gì?',
      'Bạn có biết nấu ăn không?',
      'Bạn thường ăn gì vào bữa sáng?',
      'Bạn thích đồ ăn Việt Nam hay đồ ăn phương Tây hơn?',
      'Bạn không thích món ăn nào?'
    ],
    usefulPhrases: [
      'My favorite food is...', 'I really like...', 'I don\'t like...',
      'Have you tried...?', 'It tastes delicious!', 'I prefer...',
      'I usually eat...', 'I can/can\'t cook.'
    ],
    sampleAnswer: 'My favorite food is pho. It\'s a Vietnamese noodle soup with beef. I usually eat it for breakfast. I also really like banh mi — it\'s a Vietnamese sandwich with meat and vegetables. I can\'t cook very well, but I can make fried rice. I don\'t like durian because it smells bad! I prefer Vietnamese food because it is fresh and healthy.',
    duration: 60
  },

  // ============ A2 LEVEL ============
  {
    id: 's-a2-01',
    title: 'My Hometown',
    level: 'A2',
    type: 'monologue',
    prompt: 'Describe your hometown to someone who has never been there. Talk about what it looks like, what people do, and what makes it special.',
    promptVi: 'Mô tả quê hương bạn cho một người chưa bao giờ đến đó. Nói về nơi đó trông như thế nào, mọi người làm gì và điều gì khiến nó đặc biệt.',
    suggestedQuestions: [
      'Where is your hometown?',
      'What is your hometown famous for?',
      'What is the weather like there?',
      'What do people do for fun?',
      'Do you want to live there after graduation?'
    ],
    suggestedQuestionsVi: [
      'Quê bạn ở đâu?',
      'Quê bạn nổi tiếng về điều gì?',
      'Thời tiết ở đó như thế nào?',
      'Mọi người làm gì để giải trí?',
      'Bạn có muốn sống ở đó sau khi tốt nghiệp không?'
    ],
    usefulPhrases: [
      'My hometown is located in...', 'It is famous for...',
      'The weather is usually...', 'People there are very...',
      'What I love most about my hometown is...',
      'There are many... in my hometown.', 'You should visit...'
    ],
    sampleAnswer: 'My hometown is Hue, and it is located in central Vietnam. It is famous for its beautiful ancient buildings and delicious food, like bun bo Hue. The weather is hot in summer and rainy in winter. People there are very friendly and kind. There are many temples and pagodas to visit. What I love most about my hometown is the Perfume River — it is very peaceful, especially in the evening. I hope to go back and live there someday after I finish my studies at university.',
    duration: 90
  },
  {
    id: 's-a2-02',
    title: 'Weekend Plans',
    level: 'A2',
    type: 'conversation',
    prompt: 'Discuss your plans for the coming weekend with a friend. Talk about what activities you want to do and make suggestions.',
    promptVi: 'Thảo luận về kế hoạch cuối tuần sắp tới với một người bạn. Nói về những hoạt động bạn muốn làm và đưa ra gợi ý.',
    suggestedQuestions: [
      'What are you doing this weekend?',
      'Do you want to go somewhere?',
      'Have you been to any good restaurants lately?',
      'Shall we study together or hang out?',
      'What time should we meet?'
    ],
    suggestedQuestionsVi: [
      'Cuối tuần này bạn làm gì?',
      'Bạn có muốn đi đâu không?',
      'Gần đây bạn có đi nhà hàng nào ngon không?',
      'Chúng ta nên học cùng nhau hay đi chơi?',
      'Chúng ta nên gặp nhau lúc mấy giờ?'
    ],
    usefulPhrases: [
      'How about we...?', 'Why don\'t we...?', 'That sounds great!',
      'I\'m planning to...', 'Let\'s go to...', 'I\'d love to!',
      'Sorry, I\'m busy on...', 'What time works for you?'
    ],
    sampleAnswer: 'This weekend, I\'m planning to go to the new shopping mall near the university. I heard there are some good restaurants there. On Saturday morning, I need to finish my programming homework, but in the afternoon I\'m free. How about we go together? We could have lunch and then watch a movie. On Sunday, I want to rest and maybe play some games online. What are your plans? Do you want to join me on Saturday?',
    duration: 90
  },
  {
    id: 's-a2-03',
    title: 'Talking About Movies and Music',
    level: 'A2',
    type: 'conversation',
    prompt: 'Have a conversation about your favorite movies and music. Talk about what genres you like, your favorite artists, and recent movies you have watched.',
    promptVi: 'Trò chuyện về phim và nhạc yêu thích. Nói về thể loại bạn thích, nghệ sĩ yêu thích và những bộ phim gần đây bạn đã xem.',
    suggestedQuestions: [
      'What kind of movies do you like?',
      'Who is your favorite singer or band?',
      'What is the last movie you watched?',
      'Do you prefer watching movies at home or at the cinema?',
      'What kind of music do you listen to when studying?'
    ],
    suggestedQuestionsVi: [
      'Bạn thích thể loại phim gì?',
      'Ca sĩ hoặc ban nhạc yêu thích của bạn là ai?',
      'Bộ phim gần nhất bạn xem là gì?',
      'Bạn thích xem phim ở nhà hay ở rạp hơn?',
      'Bạn nghe nhạc gì khi học bài?'
    ],
    usefulPhrases: [
      'I\'m a big fan of...', 'I prefer... to...', 'The movie was...',
      'I enjoy listening to...', 'Have you seen/heard...?',
      'I\'d recommend...', 'It\'s worth watching/listening to.'
    ],
    sampleAnswer: 'I really like action movies and sci-fi movies. My favorite movie is Avengers: Endgame because the story is exciting and the effects are amazing. The last movie I watched was a Korean drama on Netflix. For music, I\'m a big fan of K-pop. I listen to BTS and BLACKPINK a lot. When I\'m studying, I prefer to listen to lo-fi music because it helps me focus. I usually watch movies at home on my laptop because it\'s more comfortable than going to the cinema.',
    duration: 90
  },

  // ============ B1 LEVEL ============
  {
    id: 's-b1-01',
    title: 'University Life at university',
    level: 'B1',
    type: 'monologue',
    prompt: 'Talk about your experience as a student at the university. Discuss the courses, campus life, challenges, and what you enjoy most.',
    promptVi: 'Nói về trải nghiệm của bạn với tư cách sinh viên tại trường đại học. Thảo luận về các khóa học, đời sống sinh viên, thách thức và điều bạn thích nhất.',
    suggestedQuestions: [
      'What do you study and why did you choose this major?',
      'What is your favorite course so far?',
      'What are the biggest challenges of university life?',
      'How do you manage your time between study and social activities?',
      'What advice would you give to new students?'
    ],
    suggestedQuestionsVi: [
      'Bạn học ngành gì và tại sao bạn chọn ngành này?',
      'Môn học yêu thích của bạn là gì?',
      'Những thách thức lớn nhất của cuộc sống đại học là gì?',
      'Bạn quản lý thời gian giữa học tập và hoạt động xã hội như thế nào?',
      'Bạn sẽ đưa ra lời khuyên gì cho sinh viên mới?'
    ],
    usefulPhrases: [
      'I\'m currently studying...', 'What I enjoy most about my university is...',
      'One of the biggest challenges is...', 'I manage my time by...',
      'I would recommend that new students...', 'In my experience...',
      'The most valuable thing I\'ve learned is...'
    ],
    sampleAnswer: 'I\'m currently a second-year student at the university, studying Software Engineering. I chose this major because I\'ve always been interested in technology and programming. My favorite course so far has been Web Development because we get to build real projects. The campus life at university is very active — there are many clubs and events. One of the biggest challenges for me is managing my time, especially during exam season when I have multiple projects due at the same time. I manage this by making a weekly schedule and prioritizing my tasks. What I enjoy most about my university is the practical approach to learning. We don\'t just study theory; we actually build things. My advice for new students would be to join a club, make friends, and don\'t be afraid to ask questions in class.',
    duration: 120
  },
  {
    id: 's-b1-02',
    title: 'Technology in Our Lives',
    level: 'B1',
    type: 'discussion',
    prompt: 'Discuss how technology has changed the way we live, work, and communicate. Share your personal experiences and opinions.',
    promptVi: 'Thảo luận về cách công nghệ đã thay đổi cách chúng ta sống, làm việc và giao tiếp. Chia sẻ trải nghiệm và ý kiến cá nhân của bạn.',
    suggestedQuestions: [
      'How has technology changed education in Vietnam?',
      'Do you think smartphones make us more or less productive?',
      'What technology could you not live without?',
      'How do you think technology will change in the next 10 years?',
      'Are there any negative effects of using too much technology?'
    ],
    suggestedQuestionsVi: [
      'Công nghệ đã thay đổi giáo dục ở Việt Nam như thế nào?',
      'Bạn nghĩ điện thoại thông minh làm chúng ta năng suất hơn hay kém hơn?',
      'Bạn không thể sống thiếu công nghệ nào?',
      'Bạn nghĩ công nghệ sẽ thay đổi như thế nào trong 10 năm tới?',
      'Có tác động tiêu cực nào khi sử dụng quá nhiều công nghệ không?'
    ],
    usefulPhrases: [
      'Technology has significantly changed...', 'In my opinion...',
      'For instance...', 'I believe that...', 'On the other hand...',
      'It\'s hard to imagine life without...', 'The main advantage/disadvantage is...',
      'Looking ahead, I think...'
    ],
    sampleAnswer: 'Technology has significantly changed almost every aspect of our lives. In terms of education, I remember during COVID-19, all our classes at university moved online, and we used Zoom and Google Classroom every day. It was challenging at first, but it showed us that learning doesn\'t have to happen in a physical classroom. Personally, I think smartphones are both helpful and distracting. They help me access information quickly and communicate with my classmates, but I often catch myself scrolling through social media when I should be studying. The technology I couldn\'t live without is probably my laptop because I need it for coding and all my university work. Looking ahead, I believe AI will change how we learn and work. As an IT student, I find this both exciting and a little concerning because it means we need to keep updating our skills constantly.',
    duration: 120
  },
  {
    id: 's-b1-03',
    title: 'Travel and Culture',
    level: 'B1',
    type: 'monologue',
    prompt: 'Talk about a place you have visited or would like to visit. Describe the location, activities, food, and cultural experiences.',
    promptVi: 'Nói về một nơi bạn đã đến hoặc muốn đến. Mô tả địa điểm, hoạt động, đồ ăn và trải nghiệm văn hóa.',
    suggestedQuestions: [
      'Where did you go and who did you go with?',
      'What was the most interesting thing you did there?',
      'What local food did you try?',
      'Would you recommend this place to others?',
      'What did you learn from this trip?'
    ],
    suggestedQuestionsVi: [
      'Bạn đã đi đâu và đi cùng ai?',
      'Điều thú vị nhất bạn làm ở đó là gì?',
      'Bạn đã thử món ăn địa phương nào?',
      'Bạn có giới thiệu nơi này cho người khác không?',
      'Bạn đã học được gì từ chuyến đi này?'
    ],
    usefulPhrases: [
      'I went to... last...', 'The highlight of the trip was...',
      'What impressed me most was...', 'I would highly recommend...',
      'The local cuisine was...', 'I learned that...',
      'If you get the chance, you should definitely visit...'
    ],
    sampleAnswer: 'Last summer, I went to Da Lat with my university friends. We took an overnight bus from Ho Chi Minh City, and the journey took about 6 hours. Da Lat is a beautiful mountain city with cool weather and amazing scenery. The highlight of the trip was visiting the flower gardens and the Valley of Love. We also tried local strawberry ice cream and grilled corn, which were delicious. What impressed me most was how peaceful and relaxing the city felt compared to the busy cities we\'re used to. I would highly recommend Da Lat to anyone who wants a short holiday from studying. The trip taught me that sometimes you need to take a break to come back refreshed and more productive.',
    duration: 120
  },

  // ============ B2 LEVEL ============
  {
    id: 's-b2-01',
    title: 'The Future of Work in IT',
    level: 'B2',
    type: 'discussion',
    prompt: 'Discuss how the IT industry is evolving and what skills will be most important for future software developers. Consider AI, remote work, and new technologies.',
    promptVi: 'Thảo luận về cách ngành CNTT đang phát triển và những kỹ năng nào sẽ quan trọng nhất cho các nhà phát triển phần mềm tương lai. Xem xét AI, làm việc từ xa và các công nghệ mới.',
    suggestedQuestions: [
      'How do you think AI will affect software development jobs?',
      'What skills should IT students focus on developing now?',
      'Do you prefer working remotely or in an office? Why?',
      'What new technologies are you most excited about?',
      'How important are soft skills compared to technical skills?'
    ],
    suggestedQuestionsVi: [
      'Bạn nghĩ AI sẽ ảnh hưởng đến công việc phát triển phần mềm như thế nào?',
      'Sinh viên CNTT nên tập trung phát triển kỹ năng gì bây giờ?',
      'Bạn thích làm việc từ xa hay tại văn phòng? Tại sao?',
      'Bạn hào hứng nhất về công nghệ mới nào?',
      'Kỹ năng mềm quan trọng như thế nào so với kỹ năng kỹ thuật?'
    ],
    usefulPhrases: [
      'The IT industry is rapidly evolving...', 'In my view...',
      'One trend that stands out is...', 'It\'s worth noting that...',
      'The demand for... is increasing.', 'This raises the question of...',
      'To remain competitive, developers need to...', 'Taking everything into account...'
    ],
    sampleAnswer: 'The IT industry is rapidly evolving, and I think the most significant change we\'re seeing is the integration of AI into software development. Tools like GitHub Copilot and ChatGPT are already helping developers write code faster, which means the role of a software developer is shifting. Rather than just writing code, developers will need to be skilled at designing systems, understanding business requirements, and working effectively with AI tools. In my view, the most important skills for future developers are problem-solving, system design, and adaptability. Soft skills like communication and teamwork are becoming equally important because most projects involve collaboration across teams and even countries. Regarding remote work, the pandemic proved that many IT jobs can be done remotely, and I think hybrid work models will become the standard. As an IT student, I\'m particularly excited about cloud computing and AI/ML because I believe these technologies will shape the next decade of software development.',
    duration: 150
  },
  {
    id: 's-b2-02',
    title: 'Environmental Issues and Youth Responsibility',
    level: 'B2',
    type: 'discussion',
    prompt: 'Discuss the role of young people in addressing environmental challenges. What can university students do to help protect the environment? Consider both individual and collective actions.',
    promptVi: 'Thảo luận về vai trò của người trẻ trong việc giải quyết các thách thức môi trường. Sinh viên đại học có thể làm gì để bảo vệ môi trường? Xem xét cả hành động cá nhân và tập thể.',
    suggestedQuestions: [
      'What environmental problems concern you the most?',
      'What are some simple things students can do to be more eco-friendly?',
      'Should environmental education be mandatory in universities?',
      'How can technology help solve environmental problems?',
      'Do you think individual actions can really make a difference?'
    ],
    suggestedQuestionsVi: [
      'Vấn đề môi trường nào khiến bạn lo ngại nhất?',
      'Sinh viên có thể làm những điều đơn giản nào để thân thiện với môi trường hơn?',
      'Giáo dục môi trường có nên bắt buộc trong các trường đại học không?',
      'Công nghệ có thể giúp giải quyết vấn đề môi trường như thế nào?',
      'Bạn có nghĩ hành động cá nhân thực sự tạo ra sự khác biệt không?'
    ],
    usefulPhrases: [
      'One of the most pressing issues is...', 'Young people have a crucial role to play...',
      'It is our responsibility to...', 'We can make a difference by...',
      'This is a matter of urgency because...', 'Research has shown that...',
      'Both individual and collective action are needed.',
      'Sustainability should be at the heart of...'
    ],
    sampleAnswer: 'Environmental issues are among the most pressing challenges of our generation, and I believe young people, especially university students, have a crucial role to play. The problem that concerns me most is plastic pollution, particularly in Vietnam where single-use plastics are still very common. At the university, students can start with simple actions like using reusable water bottles and bags, reducing food waste, and choosing public transport or cycling. However, individual actions alone are not enough. We need collective efforts such as organizing campus clean-up events, creating awareness campaigns on social media, and even developing technology solutions. As IT students, we\'re in a unique position because we can build apps and platforms that help people track their carbon footprint or connect recycling services. I strongly believe that environmental education should be integrated into university curricula because understanding the science behind climate change is essential for making informed decisions.',
    duration: 150
  },
  {
    id: 's-b2-03',
    title: 'Social Media: Benefits and Drawbacks',
    level: 'B2',
    type: 'discussion',
    prompt: 'Discuss the benefits and drawbacks of social media for university students. How does it affect study habits, relationships, and mental health?',
    promptVi: 'Thảo luận về lợi ích và hạn chế của mạng xã hội đối với sinh viên đại học. Nó ảnh hưởng đến thói quen học tập, các mối quan hệ và sức khỏe tinh thần như thế nào?',
    suggestedQuestions: [
      'How much time do you spend on social media each day?',
      'Has social media ever helped you with your studies?',
      'Do you think social media affects students\' mental health?',
      'Should universities restrict social media use on campus?',
      'How do you balance social media use with studying?'
    ],
    suggestedQuestionsVi: [
      'Bạn dành bao nhiêu thời gian cho mạng xã hội mỗi ngày?',
      'Mạng xã hội đã bao giờ giúp bạn trong học tập chưa?',
      'Bạn có nghĩ mạng xã hội ảnh hưởng đến sức khỏe tinh thần của sinh viên không?',
      'Trường đại học có nên hạn chế sử dụng mạng xã hội trong khuôn viên trường không?',
      'Bạn cân bằng giữa sử dụng mạng xã hội và học tập như thế nào?'
    ],
    usefulPhrases: [
      'Social media has become an integral part of...',
      'While there are undeniable benefits...', 'The flip side is that...',
      'Studies have shown that...', 'It\'s important to strike a balance between...',
      'From my personal experience...', 'This can lead to...',
      'A more nuanced view would be...'
    ],
    sampleAnswer: 'Social media has become an integral part of student life, and as someone who uses it daily, I can see both its benefits and drawbacks clearly. On the positive side, platforms like Facebook and Zalo are essential for university communication — our class groups share assignments, notes, and announcements there. LinkedIn is also valuable for networking and finding internship opportunities. However, the flip side is that social media can be incredibly distracting. I often find myself checking Instagram or TikTok when I should be working on assignments. From my personal experience, this can lead to procrastination and increased stress when deadlines approach. Regarding mental health, I think the constant comparison with others on social media can affect self-esteem, especially when we see people posting only the best parts of their lives. My approach is to set specific times for checking social media and use app timers to limit my daily usage. I believe it\'s about self-discipline rather than banning social media entirely.',
    duration: 150
  },

  // ============ C1 LEVEL ============
  {
    id: 's-c1-01',
    title: 'Ethics in Artificial Intelligence',
    level: 'C1',
    type: 'discussion',
    prompt: 'Discuss the ethical considerations surrounding the development and deployment of artificial intelligence. Address issues such as bias, privacy, job displacement, and accountability.',
    promptVi: 'Thảo luận về các cân nhắc đạo đức xung quanh việc phát triển và triển khai trí tuệ nhân tạo. Đề cập đến các vấn đề như thiên kiến, quyền riêng tư, mất việc làm và trách nhiệm giải trình.',
    suggestedQuestions: [
      'Who should be held accountable when an AI system makes a harmful decision?',
      'How can developers minimize bias in AI algorithms?',
      'Should there be international regulations governing AI development?',
      'To what extent should AI be allowed to make decisions that affect human lives?',
      'How do we balance innovation with ethical responsibility?'
    ],
    suggestedQuestionsVi: [
      'Ai nên chịu trách nhiệm khi một hệ thống AI đưa ra quyết định gây hại?',
      'Các nhà phát triển có thể giảm thiểu thiên kiến trong thuật toán AI như thế nào?',
      'Có nên có các quy định quốc tế quản lý việc phát triển AI không?',
      'AI nên được phép đưa ra quyết định ảnh hưởng đến cuộc sống con người ở mức độ nào?',
      'Làm thế nào để cân bằng giữa đổi mới và trách nhiệm đạo đức?'
    ],
    usefulPhrases: [
      'This raises fundamental questions about...', 'From an ethical standpoint...',
      'The implications of this are far-reaching.', 'There is a growing consensus that...',
      'It is incumbent upon developers to...', 'This necessitates a framework for...',
      'The crux of the matter is...', 'We must grapple with the reality that...',
      'A multifaceted approach is required.'
    ],
    sampleAnswer: 'The rapid advancement of artificial intelligence raises fundamental questions about ethics, accountability, and the kind of society we want to build. From an ethical standpoint, one of the most pressing concerns is algorithmic bias. AI systems are trained on data that reflects existing societal inequalities, which means they can perpetuate and even amplify discrimination in areas such as hiring, lending, and law enforcement. As IT professionals, it is incumbent upon us to recognize that the code we write has real-world consequences. Privacy is another critical concern — AI-powered surveillance and data collection have created an environment where personal information is commodified, often without meaningful consent. The question of job displacement is equally complex. While AI will undoubtedly automate certain roles, history has shown that technological revolutions also create new categories of employment. The crux of the matter, in my view, is accountability. When an autonomous vehicle causes an accident or an AI system denies someone a loan, who bears responsibility? This necessitates a comprehensive regulatory framework that holds developers, companies, and governments accountable. I believe a multifaceted approach is required — one that combines international regulation, industry self-governance, and robust ethical training for all technology professionals.',
    duration: 180
  },
  {
    id: 's-c1-02',
    title: 'Globalization and Cultural Identity',
    level: 'C1',
    type: 'monologue',
    prompt: 'Analyze how globalization has influenced Vietnamese culture and identity. Discuss specific examples of cultural change, preservation efforts, and the concept of "glocalization."',
    promptVi: 'Phân tích cách toàn cầu hóa đã ảnh hưởng đến văn hóa và bản sắc Việt Nam. Thảo luận về các ví dụ cụ thể về thay đổi văn hóa, nỗ lực bảo tồn và khái niệm "toàn cầu hóa địa phương" (glocalization).',
    suggestedQuestions: [
      'In what ways has Vietnamese culture been influenced by globalization?',
      'Are traditional Vietnamese values being eroded by Western influence?',
      'How do young Vietnamese people navigate between global and local identities?',
      'What examples of cultural hybridization can you identify in Vietnam?',
      'Should the government take active measures to preserve traditional culture?'
    ],
    suggestedQuestionsVi: [
      'Văn hóa Việt Nam đã bị ảnh hưởng bởi toàn cầu hóa theo những cách nào?',
      'Các giá trị truyền thống Việt Nam có đang bị xói mòn bởi ảnh hưởng phương Tây không?',
      'Người trẻ Việt Nam điều hướng giữa bản sắc toàn cầu và địa phương như thế nào?',
      'Bạn có thể xác định những ví dụ nào về sự lai hóa văn hóa ở Việt Nam?',
      'Chính phủ có nên thực hiện các biện pháp tích cực để bảo tồn văn hóa truyền thống không?'
    ],
    usefulPhrases: [
      'Globalization has had a profound impact on...',
      'This phenomenon can be observed in...', 'What is particularly noteworthy is...',
      'The concept of glocalization suggests...', 'Cultural identity is not static; rather...',
      'This represents a departure from...', 'It would be reductive to suggest that...',
      'A more sophisticated analysis reveals...', 'The interplay between... and... is complex.'
    ],
    sampleAnswer: 'Globalization has had a profound impact on Vietnamese culture, manifesting in ways that are both visible and subtle. The most obvious changes can be observed in urban areas like Ho Chi Minh City and Hanoi, where international fast-food chains, Western fashion brands, and K-pop culture have become ubiquitous. Young Vietnamese people, including students at modern universities, consume global media daily through platforms such as Netflix, YouTube, and TikTok, which inevitably shapes their worldview and cultural preferences. However, it would be reductive to suggest that globalization is simply erasing Vietnamese identity. A more sophisticated analysis reveals what scholars call "glocalization" — the adaptation of global trends to local contexts. For example, Vietnamese coffee culture has not been displaced by Starbucks; rather, establishments like Highlands Coffee have blended international café aesthetics with distinctly Vietnamese flavors and traditions. Similarly, while young people embrace global fashion trends, traditional áo dài remains a proud symbol of cultural identity worn at important occasions. What is particularly noteworthy about Vietnam\'s experience is the resilience of family-centered values and community bonds, which continue to anchor cultural identity even as younger generations adopt more individualistic lifestyles. The interplay between the global and the local is complex, and Vietnam\'s ability to selectively adopt and adapt foreign influences while maintaining its cultural core suggests that globalization need not be a zero-sum game for cultural identity.',
    duration: 180
  }
];

const CONVERSATION_STARTERS = [
  // ============ A1 LEVEL ============
  {
    id: 'cs-a1-01',
    question: 'What is your name and where are you from?',
    level: 'A1',
    topic: 'Personal Information',
    followUps: [
      'How old are you?',
      'Do you have brothers or sisters?',
      'What do you do? Are you a student?'
    ]
  },
  {
    id: 'cs-a1-02',
    question: 'What do you like to do in your free time?',
    level: 'A1',
    topic: 'Hobbies',
    followUps: [
      'How often do you do it?',
      'Do you do it alone or with friends?',
      'When did you start this hobby?'
    ]
  },
  {
    id: 'cs-a1-03',
    question: 'What is your favorite food?',
    level: 'A1',
    topic: 'Food',
    followUps: [
      'Can you cook it?',
      'Where do you usually eat it?',
      'Do you like sweet or salty food more?'
    ]
  },
  {
    id: 'cs-a1-04',
    question: 'What time do you wake up every day?',
    level: 'A1',
    topic: 'Daily Routine',
    followUps: [
      'What do you eat for breakfast?',
      'How do you go to school?',
      'What time do you go to bed?'
    ]
  },
  {
    id: 'cs-a1-05',
    question: 'Do you like music? What kind of music do you listen to?',
    level: 'A1',
    topic: 'Music',
    followUps: [
      'Who is your favorite singer?',
      'Do you play any instruments?',
      'When do you usually listen to music?'
    ]
  },

  // ============ A2 LEVEL ============
  {
    id: 'cs-a2-01',
    question: 'Tell me about your best friend. How did you meet?',
    level: 'A2',
    topic: 'Friendship',
    followUps: [
      'What do you usually do together?',
      'What do you like most about your friend?',
      'Have you ever had a disagreement? What happened?'
    ]
  },
  {
    id: 'cs-a2-02',
    question: 'What is your favorite subject at school? Why do you like it?',
    level: 'A2',
    topic: 'Education',
    followUps: [
      'Is it easy or difficult for you?',
      'Who is your favorite teacher?',
      'How do you study for exams?'
    ]
  },
  {
    id: 'cs-a2-03',
    question: 'Have you ever traveled to another city? Tell me about it.',
    level: 'A2',
    topic: 'Travel',
    followUps: [
      'Who did you go with?',
      'What was the best part of the trip?',
      'Would you like to go back?'
    ]
  },
  {
    id: 'cs-a2-04',
    question: 'What do you usually do on weekends?',
    level: 'A2',
    topic: 'Weekend Activities',
    followUps: [
      'Do you prefer staying at home or going out?',
      'What did you do last weekend?',
      'Do you spend weekends with family or friends?'
    ]
  },
  {
    id: 'cs-a2-05',
    question: 'What kind of movies do you enjoy watching?',
    level: 'A2',
    topic: 'Entertainment',
    followUps: [
      'What is the best movie you have ever seen?',
      'Do you prefer watching movies at home or at the cinema?',
      'Who is your favorite actor or actress?'
    ]
  },

  // ============ B1 LEVEL ============
  {
    id: 'cs-b1-01',
    question: 'If you could learn any new skill, what would it be and why?',
    level: 'B1',
    topic: 'Self-Development',
    followUps: [
      'How would you go about learning it?',
      'Do you think this skill would help in your career?',
      'Have you already tried learning it before?'
    ]
  },
  {
    id: 'cs-b1-02',
    question: 'What are the biggest differences between your parents\' generation and yours?',
    level: 'B1',
    topic: 'Generational Differences',
    followUps: [
      'How do these differences affect family relationships?',
      'What values from your parents\' generation do you want to keep?',
      'What changes do you think are positive?'
    ]
  },
  {
    id: 'cs-b1-03',
    question: 'How do you think university life is different from high school?',
    level: 'B1',
    topic: 'University Life',
    followUps: [
      'What has been your biggest challenge at university?',
      'How has university changed you as a person?',
      'What do you wish you had known before starting university?'
    ]
  },
  {
    id: 'cs-b1-04',
    question: 'Do you think social media has more positive or negative effects on young people?',
    level: 'B1',
    topic: 'Social Media',
    followUps: [
      'How many hours a day do you spend on social media?',
      'Have you ever taken a break from social media?',
      'Which social media platform is most popular among your friends?'
    ]
  },
  {
    id: 'cs-b1-05',
    question: 'What would you do if you had one month of free time with no responsibilities?',
    level: 'B1',
    topic: 'Hypothetical',
    followUps: [
      'Would you travel, rest, or work on a personal project?',
      'Is there something you\'ve always wanted to try but never had time for?',
      'How do you usually spend your holidays?'
    ]
  },

  // ============ B2 LEVEL ============
  {
    id: 'cs-b2-01',
    question: 'How do you think artificial intelligence will change the job market in Vietnam?',
    level: 'B2',
    topic: 'AI and Employment',
    followUps: [
      'Which industries do you think will be most affected?',
      'How are you preparing for these changes as a student?',
      'Should universities adapt their curricula to address AI?'
    ]
  },
  {
    id: 'cs-b2-02',
    question: 'To what extent should the government be responsible for citizens\' health and well-being?',
    level: 'B2',
    topic: 'Government and Society',
    followUps: [
      'Should healthcare be free for everyone?',
      'What role do individuals play in maintaining their own health?',
      'How has the pandemic changed your views on public health?'
    ]
  },
  {
    id: 'cs-b2-03',
    question: 'Some people say that university degrees are becoming less valuable. Do you agree?',
    level: 'B2',
    topic: 'Value of Education',
    followUps: [
      'What alternatives to a university degree exist?',
      'Do employers value experience or qualifications more?',
      'Has studying at university changed your perspective on this?'
    ]
  },
  {
    id: 'cs-b2-04',
    question: 'How can technology be used to preserve and promote Vietnamese culture?',
    level: 'B2',
    topic: 'Culture and Technology',
    followUps: [
      'Can you think of any apps or platforms that do this well?',
      'Is there a risk that technology could dilute traditional culture?',
      'How do young Vietnamese people engage with their cultural heritage?'
    ]
  },
  {
    id: 'cs-b2-05',
    question: 'What do you think makes a good leader in today\'s world?',
    level: 'B2',
    topic: 'Leadership',
    followUps: [
      'Can leadership skills be learned, or are they innate?',
      'Who is a leader you admire and why?',
      'How important is emotional intelligence for a leader?'
    ]
  }
];
