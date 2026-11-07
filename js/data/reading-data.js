const READING_PASSAGES = [
  // ===== A2 PASSAGES =====
  {
    id: 'r1',
    title: 'My First Week at University',
    level: 'A2',
    topic: 'University Life',
    passage: `Last week was my first week at FPT University. I was very nervous but also excited. On Monday, I arrived at the campus early. The campus is very big and modern. There are many buildings with classrooms, a library, and a canteen.

I met my classmates on the first day. They are friendly and come from many different cities in Vietnam. My teacher introduced herself and explained the rules of the class. We have to attend all classes and submit homework on time.

The library is my favorite place. It has many books and computers. I can study there until 9 PM. The canteen has cheap and delicious food. I usually eat pho or com tam for lunch.

I also joined a club. I chose the English Speaking Club because I want to improve my English. We meet every Wednesday afternoon. I think university life is very different from high school, but I like it very much.`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'How did the writer feel on the first day?',
        options: ['Only nervous', 'Only excited', 'Nervous and excited', 'Bored'],
        answer: 'Nervous and excited',
        explanation: 'Bài viết nói "I was very nervous but also excited" - tác giả vừa lo lắng vừa hào hứng.'
      },
      {
        type: 'true_false_notgiven',
        question: 'The campus is small and old.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói "The campus is very big and modern" - khuôn viên rộng và hiện đại, không phải nhỏ và cũ.'
      },
      {
        type: 'multiple_choice',
        question: 'What time does the library close?',
        options: ['8 PM', '9 PM', '10 PM', '7 PM'],
        answer: '9 PM',
        explanation: 'Bài viết nói "I can study there until 9 PM" - thư viện mở đến 9 giờ tối.'
      },
      {
        type: 'fill_blank',
        question: 'The writer joined the English _______ Club.',
        answer: 'Speaking',
        explanation: 'Tác giả tham gia "English Speaking Club" - Câu lạc bộ Nói tiếng Anh.'
      },
      {
        type: 'true_false_notgiven',
        question: 'The English Speaking Club meets on Fridays.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói "We meet every Wednesday afternoon" - họ gặp nhau vào chiều thứ Tư, không phải thứ Sáu.'
      },
      {
        type: 'short_answer',
        question: 'Why did the writer choose the English Speaking Club?',
        answer: 'to improve English',
        explanation: 'Tác giả chọn câu lạc bộ vì "I want to improve my English" - muốn cải thiện tiếng Anh.'
      }
    ]
  },
  {
    id: 'r2',
    title: 'Using Social Media Safely',
    level: 'A2',
    topic: 'Social Media',
    passage: `Social media is very popular with young people today. Most students use Facebook, Instagram, TikTok, and Zalo every day. We use social media to talk with friends, share photos, and read news. It is fun and useful.

However, social media can also be dangerous. Some people share too much personal information online. They post their phone number, home address, or school name. Bad people can use this information to hurt them.

Here are some tips to stay safe on social media. First, do not share personal information with strangers. Second, use a strong password for your accounts. A good password has letters, numbers, and symbols. Third, think before you post. Ask yourself: "Is this safe to share?"

Also, do not spend too much time on social media. It can make you feel sad or tired. Try to limit your screen time to one or two hours a day. Remember, real life is more important than online life.`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'What do most students use social media for?',
        options: [
          'Only reading news',
          'Talking with friends, sharing photos, and reading news',
          'Only sharing photos',
          'Playing games'
        ],
        answer: 'Talking with friends, sharing photos, and reading news',
        explanation: 'Bài viết liệt kê "talk with friends, share photos, and read news" - nói chuyện với bạn, chia sẻ ảnh, và đọc tin.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Sharing personal information online is always safe.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết cảnh báo "social media can also be dangerous" khi chia sẻ thông tin cá nhân - có thể nguy hiểm.'
      },
      {
        type: 'fill_blank',
        question: 'A good password has letters, numbers, and _______.',
        answer: 'symbols',
        explanation: 'Mật khẩu tốt bao gồm "letters, numbers, and symbols" - chữ cái, số, và ký hiệu.'
      },
      {
        type: 'multiple_choice',
        question: 'How much time should you spend on social media each day?',
        options: ['3-4 hours', '1-2 hours', '5-6 hours', 'All day'],
        answer: '1-2 hours',
        explanation: 'Bài viết khuyên "limit your screen time to one or two hours a day" - giới hạn 1-2 giờ mỗi ngày.'
      },
      {
        type: 'short_answer',
        question: 'What question should you ask yourself before posting?',
        answer: 'Is this safe to share',
        explanation: 'Bạn nên tự hỏi "Is this safe to share?" - Chia sẻ điều này có an toàn không?'
      }
    ]
  },

  // ===== B1 PASSAGES =====
  {
    id: 'r3',
    title: 'The Rise of Artificial Intelligence in Education',
    level: 'B1',
    topic: 'Technology and AI',
    passage: `Artificial Intelligence (AI) is changing the way we learn. In recent years, many educational tools powered by AI have become available to students and teachers. These tools can help students learn more effectively and at their own pace.

One popular example is AI-powered language learning apps. These apps can analyze a student's strengths and weaknesses and create personalized lessons. If a student struggles with grammar, the app will provide more grammar exercises. If they are good at reading but weak at listening, the app will focus more on listening activities.

AI tutors are another exciting development. These virtual tutors can answer students' questions 24 hours a day, seven days a week. Unlike human tutors, they never get tired or impatient. However, many experts believe that AI tutors cannot completely replace human teachers. Human teachers provide emotional support, motivation, and real-world experience that AI cannot offer.

At FPT University, students are encouraged to use AI tools to support their studies. However, teachers remind students that AI should be a tool, not a replacement for critical thinking. Students still need to think independently, analyze information, and develop their own ideas. The best approach is to combine AI tools with traditional learning methods.

The future of AI in education looks promising. As technology continues to improve, AI tools will become even more helpful. But we must remember that the goal of education is not just to memorize facts — it is to develop creative, thoughtful, and responsible individuals.`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'What can AI-powered language learning apps do?',
        options: [
          'Replace all teachers',
          'Analyze strengths and weaknesses and create personalized lessons',
          'Only teach grammar',
          'Only improve listening skills'
        ],
        answer: 'Analyze strengths and weaknesses and create personalized lessons',
        explanation: 'Bài viết nói ứng dụng AI có thể "analyze a student\'s strengths and weaknesses and create personalized lessons" - phân tích điểm mạnh, yếu và tạo bài học cá nhân hóa.'
      },
      {
        type: 'true_false_notgiven',
        question: 'AI tutors can work 24 hours a day without getting tired.',
        options: ['True', 'False', 'Not Given'],
        answer: 'True',
        explanation: 'Bài viết nói "These virtual tutors can answer students\' questions 24 hours a day" và "they never get tired" - hoạt động 24/7 không mệt.'
      },
      {
        type: 'multiple_choice',
        question: 'According to experts, what can human teachers provide that AI cannot?',
        options: [
          'More homework',
          'Emotional support, motivation, and real-world experience',
          'Better technology',
          'Faster answers'
        ],
        answer: 'Emotional support, motivation, and real-world experience',
        explanation: 'Chuyên gia cho rằng giáo viên cung cấp "emotional support, motivation, and real-world experience" - hỗ trợ cảm xúc, động lực, và kinh nghiệm thực tế.'
      },
      {
        type: 'fill_blank',
        question: 'At FPT University, AI should be a tool, not a replacement for _______ thinking.',
        answer: 'critical',
        explanation: 'AI nên là công cụ, không thay thế cho "critical thinking" - tư duy phản biện.'
      },
      {
        type: 'true_false_notgiven',
        question: 'FPT University bans students from using AI tools.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Ngược lại, bài viết nói "students are encouraged to use AI tools" - sinh viên được khuyến khích sử dụng AI.'
      },
      {
        type: 'short_answer',
        question: 'What is the goal of education according to the passage?',
        answer: 'to develop creative, thoughtful, and responsible individuals',
        explanation: 'Mục tiêu giáo dục là "develop creative, thoughtful, and responsible individuals" - phát triển cá nhân sáng tạo, tư duy và có trách nhiệm.'
      },
      {
        type: 'multiple_choice',
        question: 'What is the best approach to using AI in learning?',
        options: [
          'Only use AI tools',
          'Never use AI tools',
          'Combine AI tools with traditional learning methods',
          'Use AI only for exams'
        ],
        answer: 'Combine AI tools with traditional learning methods',
        explanation: 'Cách tiếp cận tốt nhất là "combine AI tools with traditional learning methods" - kết hợp AI với phương pháp học truyền thống.'
      }
    ]
  },
  {
    id: 'r4',
    title: 'How to Prepare for a Job Interview',
    level: 'B1',
    topic: 'Career and Jobs',
    passage: `Getting a job interview is exciting, but it can also be stressful. Many university students feel nervous because they do not know what to expect. Here are some useful tips to help you prepare for your first job interview.

First, research the company before the interview. Visit their website and learn about their products, services, and culture. Employers are impressed when candidates know about the company. You can also check the company's social media pages to understand their values and recent activities.

Second, practice answering common interview questions. Some popular questions include: "Tell me about yourself," "What are your strengths and weaknesses?" and "Why do you want to work here?" Practice your answers out loud, but do not memorize them word by word. Your responses should sound natural and confident.

Third, dress appropriately for the interview. In Vietnam, most companies expect candidates to wear formal clothing. Men should wear a shirt and trousers, while women can wear a blouse and skirt or trousers. Avoid wearing casual clothes like T-shirts and jeans unless the company has a casual dress code.

Fourth, arrive at least 10 to 15 minutes early. Being late for an interview creates a very bad first impression. Plan your route in advance and consider traffic conditions, especially in busy cities like Ho Chi Minh City or Hanoi.

Finally, remember to bring copies of your CV, certificates, and any relevant documents. After the interview, send a thank-you email to the interviewer. This small gesture shows your professionalism and interest in the position.

With good preparation, you can feel more confident and increase your chances of getting the job. Good luck!`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'What should you do first before a job interview?',
        options: [
          'Buy new clothes',
          'Research the company',
          'Write a thank-you email',
          'Print your CV'
        ],
        answer: 'Research the company',
        explanation: 'Bước đầu tiên là "research the company before the interview" - tìm hiểu về công ty trước buổi phỏng vấn.'
      },
      {
        type: 'true_false_notgiven',
        question: 'You should memorize your answers word by word.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết khuyên "do not memorize them word by word" - không nên học thuộc từng từ.'
      },
      {
        type: 'fill_blank',
        question: 'You should arrive at least _______ minutes early for an interview.',
        answer: '10 to 15',
        explanation: 'Bạn nên đến sớm "at least 10 to 15 minutes" - ít nhất 10-15 phút.'
      },
      {
        type: 'multiple_choice',
        question: 'What should men wear to an interview in Vietnam?',
        options: [
          'T-shirt and jeans',
          'A shirt and trousers',
          'A suit and tie only',
          'Any casual clothes'
        ],
        answer: 'A shirt and trousers',
        explanation: 'Bài viết nói nam giới nên mặc "a shirt and trousers" - áo sơ mi và quần tây.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Most FPT University graduates find jobs within one month.',
        options: ['True', 'False', 'Not Given'],
        answer: 'Not Given',
        explanation: 'Bài viết không đề cập đến thời gian sinh viên FPT tìm được việc - thông tin không được đưa ra.'
      },
      {
        type: 'short_answer',
        question: 'What should you do after the interview?',
        answer: 'send a thank-you email',
        explanation: 'Sau phỏng vấn nên "send a thank-you email to the interviewer" - gửi email cảm ơn người phỏng vấn.'
      },
      {
        type: 'multiple_choice',
        question: 'Why is it important to check traffic conditions before an interview?',
        options: [
          'To find a good restaurant nearby',
          'To avoid being late',
          'To save money on transportation',
          'To practice driving'
        ],
        answer: 'To avoid being late',
        explanation: 'Cần kiểm tra giao thông để không đến muộn vì "Being late creates a very bad first impression" - đến muộn tạo ấn tượng xấu.'
      }
    ]
  },
  {
    id: 'r5',
    title: 'The Benefits of Learning a Second Language',
    level: 'B1',
    topic: 'Learning English',
    passage: `In today's globalized world, knowing a second language is more important than ever. For Vietnamese students, English is the most popular second language to learn. But have you ever wondered why learning a new language is so beneficial?

First, learning a second language improves your career opportunities. Many international companies in Vietnam, such as Samsung, Intel, and FPT Software, require employees to communicate in English. Workers who speak English often receive higher salaries and have more chances for promotion. In the technology industry, almost all programming documentation and technical resources are written in English.

Second, learning a new language makes your brain stronger. Research shows that bilingual people have better memory, improved concentration, and stronger problem-solving skills. When you learn a new language, your brain creates new neural connections, which keeps it healthy and active. Some studies even suggest that being bilingual can delay the onset of diseases like Alzheimer's.

Third, knowing another language allows you to connect with people from different cultures. You can make friends from other countries, understand their customs, and share your own culture with them. This cultural exchange makes you a more open-minded and understanding person.

However, learning a new language requires time and effort. Many students give up because they expect quick results. Language experts recommend studying a little every day rather than studying a lot once a week. Consistency is the key to success. Setting small, achievable goals — such as learning five new words a day — can help you stay motivated.

At FPT University, English is not just a subject; it is a skill that will accompany students throughout their careers. So keep practicing, and remember that every expert was once a beginner!`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'According to the passage, why do many companies require English?',
        options: [
          'Because it is easy to learn',
          'Because they need to communicate internationally',
          'Because the government requires it',
          'Because English is the most beautiful language'
        ],
        answer: 'Because they need to communicate internationally',
        explanation: 'Các công ty quốc tế "require employees to communicate in English" - yêu cầu nhân viên giao tiếp bằng tiếng Anh.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Bilingual people have worse memory than monolingual people.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Ngược lại, bài viết nói "bilingual people have better memory" - người song ngữ có trí nhớ tốt hơn.'
      },
      {
        type: 'fill_blank',
        question: 'Language experts recommend studying a little every day rather than studying a lot once a _______.',
        answer: 'week',
        explanation: 'Chuyên gia khuyên học mỗi ngày một ít thay vì học nhiều một lần mỗi "week" - tuần.'
      },
      {
        type: 'multiple_choice',
        question: 'What is the key to success in language learning?',
        options: ['Talent', 'Consistency', 'Expensive courses', 'Living abroad'],
        answer: 'Consistency',
        explanation: 'Bài viết khẳng định "Consistency is the key to success" - Sự kiên trì là chìa khóa thành công.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Being bilingual can help prevent Alzheimer\'s disease completely.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết chỉ nói "can delay the onset" - có thể trì hoãn sự khởi phát, không phải ngăn chặn hoàn toàn.'
      },
      {
        type: 'short_answer',
        question: 'What small goal does the passage suggest for daily language learning?',
        answer: 'learning five new words a day',
        explanation: 'Bài viết gợi ý "learning five new words a day" - học 5 từ mới mỗi ngày.'
      }
    ]
  },
  {
    id: 'r6',
    title: 'The Impact of Social Media on Mental Health',
    level: 'B1',
    topic: 'Social Media',
    passage: `Social media has become an essential part of daily life for most young people. In Vietnam, the average person spends over two hours per day on social media platforms. While social media offers many benefits, such as staying connected with friends and accessing information, it can also have negative effects on mental health.

One major problem is social comparison. When people see their friends posting photos of vacations, parties, or achievements, they may feel that their own life is boring or unsuccessful. This feeling is sometimes called "FOMO" — the Fear of Missing Out. FOMO can lead to feelings of anxiety, loneliness, and low self-esteem.

Another issue is cyberbullying. Some people use social media to send mean messages, spread rumors, or share embarrassing photos of others. Cyberbullying can cause serious emotional harm, especially to teenagers and young adults. In some extreme cases, victims of cyberbullying have experienced depression and even considered self-harm.

Sleep disruption is also a common problem. Many students stay up late scrolling through their phones, which affects the quality and quantity of their sleep. Poor sleep can lead to difficulty concentrating in class, lower academic performance, and increased stress.

Experts suggest several strategies to maintain good mental health while using social media. First, limit your screen time to a reasonable amount each day. Second, unfollow accounts that make you feel bad about yourself. Third, remember that people usually share only the best moments of their lives online — nobody's life is perfect. Finally, if you feel overwhelmed, take a break from social media and spend time with friends and family in person.

Being aware of these effects is the first step toward using social media in a healthier way.`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'What does "FOMO" stand for?',
        options: [
          'Fear of Making Opinions',
          'Fear of Missing Out',
          'Feeling of Many Obstacles',
          'Friends on Media Online'
        ],
        answer: 'Fear of Missing Out',
        explanation: 'FOMO là viết tắt của "Fear of Missing Out" - Nỗi sợ bỏ lỡ.'
      },
      {
        type: 'true_false_notgiven',
        question: 'The average Vietnamese person spends over three hours on social media daily.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói "over two hours per day" - hơn 2 giờ mỗi ngày, không phải 3 giờ.'
      },
      {
        type: 'multiple_choice',
        question: 'Which of the following is NOT mentioned as an effect of social media on mental health?',
        options: [
          'Social comparison',
          'Cyberbullying',
          'Physical injuries',
          'Sleep disruption'
        ],
        answer: 'Physical injuries',
        explanation: 'Bài viết đề cập so sánh xã hội, bắt nạt mạng, và rối loạn giấc ngủ - nhưng không nói về chấn thương thể chất.'
      },
      {
        type: 'fill_blank',
        question: 'People usually share only the best _______ of their lives online.',
        answer: 'moments',
        explanation: 'Mọi người thường chỉ chia sẻ những "moments" (khoảnh khắc) tốt đẹp nhất trên mạng.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Cyberbullying only affects teenagers.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói ảnh hưởng đến "teenagers and young adults" - cả thanh thiếu niên và người trẻ.'
      },
      {
        type: 'short_answer',
        question: 'What should you do if you feel overwhelmed by social media?',
        answer: 'take a break from social media and spend time with friends and family',
        explanation: 'Nếu cảm thấy quá tải, hãy "take a break from social media and spend time with friends and family in person" - nghỉ dùng mạng xã hội và dành thời gian với bạn bè, gia đình.'
      },
      {
        type: 'multiple_choice',
        question: 'How can poor sleep affect students?',
        options: [
          'It makes them stronger',
          'It has no effect',
          'It can cause difficulty concentrating and lower academic performance',
          'It only affects their appetite'
        ],
        answer: 'It can cause difficulty concentrating and lower academic performance',
        explanation: 'Ngủ kém gây "difficulty concentrating in class, lower academic performance" - khó tập trung, kết quả học tập giảm.'
      }
    ]
  },

  // ===== B2 PASSAGES =====
  {
    id: 'r7',
    title: 'The Ethical Dilemmas of Artificial Intelligence',
    level: 'B2',
    topic: 'Technology and AI',
    passage: `As artificial intelligence becomes increasingly integrated into our daily lives, society faces a growing number of ethical dilemmas that demand careful consideration. From self-driving cars to AI-powered hiring tools, the decisions made by algorithms can have profound consequences for individuals and communities.

One of the most debated issues is algorithmic bias. AI systems learn from historical data, which often contains existing societal biases. For instance, an AI hiring tool trained on data from a company that historically hired mostly men might discriminate against female candidates. Similarly, facial recognition technology has been shown to be less accurate for people with darker skin tones, raising concerns about racial discrimination in law enforcement.

Privacy is another critical concern. AI systems require vast amounts of data to function effectively. Tech companies collect personal information from users' online activities, social media posts, and even their physical movements through smartphone sensors. While this data enables convenient services like personalized recommendations, it also creates significant privacy risks. The question of who owns this data and how it should be used remains largely unresolved.

The impact of AI on employment is equally troubling. Automation and AI are expected to replace millions of jobs in manufacturing, transportation, and customer service. While new jobs will be created in the technology sector, many workers may lack the skills needed for these positions. This could widen the gap between skilled and unskilled workers, leading to greater economic inequality.

Furthermore, the question of accountability is complex. When an autonomous vehicle causes an accident, who is responsible — the manufacturer, the software developer, or the owner? Current legal frameworks are not equipped to address such questions adequately.

Despite these challenges, it is important to recognize that AI also offers tremendous benefits. The key lies in developing AI responsibly, with robust regulations, transparent algorithms, and a commitment to fairness and human rights. Only through thoughtful governance can we ensure that AI serves humanity rather than undermining it.`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'What is "algorithmic bias"?',
        options: [
          'When AI systems work too slowly',
          'When AI systems reflect existing societal biases from their training data',
          'When AI systems are too expensive',
          'When AI systems crash frequently'
        ],
        answer: 'When AI systems reflect existing societal biases from their training data',
        explanation: 'Thiên lệch thuật toán xảy ra khi "AI systems learn from historical data, which often contains existing societal biases" - AI học từ dữ liệu có sẵn thiên lệch xã hội.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Facial recognition technology works equally well for all skin tones.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói công nghệ nhận diện khuôn mặt "less accurate for people with darker skin tones" - kém chính xác hơn với người da sẫm.'
      },
      {
        type: 'multiple_choice',
        question: 'According to the passage, what is a major privacy concern with AI?',
        options: [
          'AI uses too much electricity',
          'Tech companies collect vast amounts of personal data',
          'AI makes too many mistakes',
          'AI is too difficult to use'
        ],
        answer: 'Tech companies collect vast amounts of personal data',
        explanation: 'Mối lo ngại về quyền riêng tư là "Tech companies collect personal information from users\' online activities" - công ty thu thập thông tin cá nhân từ hoạt động trực tuyến.'
      },
      {
        type: 'fill_blank',
        question: 'Automation and AI could widen the gap between skilled and unskilled workers, leading to greater economic _______.',
        answer: 'inequality',
        explanation: 'AI có thể dẫn đến "greater economic inequality" - bất bình đẳng kinh tế lớn hơn.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Current legal frameworks can adequately handle AI accountability issues.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói "Current legal frameworks are not equipped to address such questions adequately" - luật hiện tại chưa đủ để giải quyết.'
      },
      {
        type: 'short_answer',
        question: 'What does the author suggest is the key to responsible AI development?',
        answer: 'robust regulations, transparent algorithms, and commitment to fairness and human rights',
        explanation: 'Tác giả đề xuất "robust regulations, transparent algorithms, and a commitment to fairness and human rights" - quy định chặt chẽ, thuật toán minh bạch, và cam kết công bằng.'
      },
      {
        type: 'multiple_choice',
        question: 'When an autonomous vehicle causes an accident, who does the author suggest is responsible?',
        options: [
          'Only the manufacturer',
          'Only the owner',
          'Only the software developer',
          'The answer is complex and current laws cannot adequately determine this'
        ],
        answer: 'The answer is complex and current laws cannot adequately determine this',
        explanation: 'Tác giả nói "the question of accountability is complex" và luật hiện tại chưa giải quyết được - câu hỏi trách nhiệm rất phức tạp.'
      },
      {
        type: 'true_false_notgiven',
        question: 'The author believes AI should be completely banned due to ethical concerns.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Tác giả nhấn mạnh "AI also offers tremendous benefits" và cần phát triển AI có trách nhiệm, không phải cấm hoàn toàn.'
      }
    ]
  },
  {
    id: 'r8',
    title: 'Remote Work: The Future of Employment?',
    level: 'B2',
    topic: 'Career and Jobs',
    passage: `The COVID-19 pandemic fundamentally transformed the way people work around the world. What was once considered a temporary arrangement has evolved into a permanent shift for many organizations. Remote work, also known as working from home or telecommuting, has become a defining feature of the modern workplace.

Proponents of remote work highlight numerous advantages. Employees save time and money by eliminating their daily commute. Studies have shown that remote workers often report higher levels of job satisfaction and productivity. The flexibility to choose when and where to work allows individuals to achieve a better work-life balance. Parents, for example, can be more present for their children while still meeting their professional responsibilities.

For employers, remote work can reduce operational costs significantly. Companies can downsize their office space, lower utility bills, and access a global talent pool unrestricted by geographical boundaries. This is particularly relevant for the technology sector in Vietnam, where companies like FPT Software have embraced hybrid work models to attract top talent from across the country.

However, remote work is not without its drawbacks. Many employees report feelings of isolation and loneliness when working from home for extended periods. The blurring of boundaries between work and personal life can lead to overwork and burnout. Without face-to-face interaction, building team cohesion and maintaining company culture becomes considerably more challenging.

Communication can also suffer in remote environments. Despite the availability of tools like Zoom, Slack, and Microsoft Teams, misunderstandings are more common when people cannot read body language and facial expressions. Junior employees may find it particularly difficult to learn from senior colleagues without the informal mentoring that occurs naturally in an office setting.

Looking ahead, most experts predict that the future of work will be hybrid — a combination of remote and in-office work. This model aims to capture the benefits of both arrangements while mitigating their respective disadvantages. For today's university students, developing strong digital communication skills and self-discipline will be essential for thriving in this evolving work landscape.`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'What triggered the widespread adoption of remote work?',
        options: [
          'Advances in technology',
          'The COVID-19 pandemic',
          'Government regulations',
          'Student preferences'
        ],
        answer: 'The COVID-19 pandemic',
        explanation: 'Đại dịch COVID-19 "fundamentally transformed the way people work" - đã thay đổi căn bản cách làm việc.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Remote workers generally report lower job satisfaction than office workers.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Ngược lại, bài viết nói "remote workers often report higher levels of job satisfaction" - nhân viên làm việc từ xa thường hài lòng hơn.'
      },
      {
        type: 'multiple_choice',
        question: 'How does remote work benefit employers?',
        options: [
          'It increases office rent',
          'It reduces costs and provides access to global talent',
          'It makes management easier',
          'It eliminates the need for meetings'
        ],
        answer: 'It reduces costs and provides access to global talent',
        explanation: 'Nhà tuyển dụng có thể "reduce operational costs" và "access a global talent pool" - giảm chi phí và tiếp cận nhân tài toàn cầu.'
      },
      {
        type: 'fill_blank',
        question: 'The blurring of boundaries between work and personal life can lead to overwork and _______.',
        answer: 'burnout',
        explanation: 'Ranh giới mờ nhạt giữa công việc và cuộc sống cá nhân có thể dẫn đến "overwork and burnout" - làm việc quá sức và kiệt sức.'
      },
      {
        type: 'true_false_notgiven',
        question: 'FPT Software has adopted a fully remote work model.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói FPT Software "embraced hybrid work models" - mô hình làm việc kết hợp, không phải hoàn toàn từ xa.'
      },
      {
        type: 'short_answer',
        question: 'What two skills does the passage say will be essential for university students in the future workplace?',
        answer: 'digital communication skills and self-discipline',
        explanation: 'Sinh viên cần "strong digital communication skills and self-discipline" - kỹ năng giao tiếp số và kỷ luật tự giác.'
      },
      {
        type: 'multiple_choice',
        question: 'Why is communication more difficult in remote work?',
        options: [
          'Because technology is unreliable',
          'Because people cannot read body language and facial expressions',
          'Because people are not trained',
          'Because there are too many tools'
        ],
        answer: 'Because people cannot read body language and facial expressions',
        explanation: 'Giao tiếp khó hơn vì "people cannot read body language and facial expressions" - không thể đọc ngôn ngữ cơ thể và biểu cảm.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Most experts predict that fully remote work will completely replace offices.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Chuyên gia dự đoán "the future of work will be hybrid" - tương lai là kết hợp, không phải hoàn toàn từ xa.'
      }
    ]
  },
  {
    id: 'r9',
    title: 'Sustainable Living: Small Changes, Big Impact',
    level: 'B2',
    topic: 'Environment',
    passage: `Climate change is arguably the most pressing challenge facing humanity today. Rising global temperatures, extreme weather events, and the loss of biodiversity threaten the very foundations of life on Earth. While governments and corporations bear the greatest responsibility for addressing this crisis, individuals can also make a meaningful difference through sustainable living practices.

One of the most effective changes individuals can make is reducing their consumption of single-use plastics. In Vietnam, an estimated 1.8 million tonnes of plastic waste are generated annually, much of which ends up in rivers and oceans. By carrying reusable water bottles, shopping bags, and food containers, we can significantly reduce our plastic footprint. Many cafes in Ho Chi Minh City and Hanoi have already started offering discounts to customers who bring their own cups.

Diet is another area where personal choices can have a substantial environmental impact. The livestock industry is responsible for approximately 14.5% of global greenhouse gas emissions. Reducing meat consumption, even by one or two meals per week, can lower an individual's carbon footprint considerably. This does not necessarily mean becoming vegetarian or vegan; simply choosing more plant-based meals and locally sourced ingredients can make a difference.

Transportation habits also play a significant role. In many Vietnamese cities, motorbikes and cars contribute heavily to air pollution. Using public transportation, cycling, or walking when possible not only reduces emissions but also improves physical health. Electric vehicles and e-scooters are becoming increasingly affordable and represent a promising alternative for the future.

Energy conservation at home is equally important. Simple actions such as turning off lights when leaving a room, unplugging electronic devices when not in use, and using energy-efficient appliances can reduce both energy consumption and electricity bills. Installing solar panels, while requiring an initial investment, can provide long-term savings and environmental benefits.

Ultimately, sustainable living is not about making dramatic sacrifices. It is about making conscious, informed choices that collectively contribute to a healthier planet. As the Vietnamese proverb suggests, "Góp gió thành bão" — many small contributions can create a powerful force for change.`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'How much plastic waste does Vietnam generate annually?',
        options: [
          '1.8 million tonnes',
          '2.5 million tonnes',
          '1 million tonnes',
          '3 million tonnes'
        ],
        answer: '1.8 million tonnes',
        explanation: 'Việt Nam tạo ra "an estimated 1.8 million tonnes of plastic waste annually" - khoảng 1,8 triệu tấn rác thải nhựa mỗi năm.'
      },
      {
        type: 'true_false_notgiven',
        question: 'The livestock industry produces about 14.5% of global greenhouse gas emissions.',
        options: ['True', 'False', 'Not Given'],
        answer: 'True',
        explanation: 'Bài viết nói ngành chăn nuôi "responsible for approximately 14.5% of global greenhouse gas emissions" - chiếm khoảng 14,5% khí thải nhà kính toàn cầu.'
      },
      {
        type: 'multiple_choice',
        question: 'According to the passage, what does sustainable living require?',
        options: [
          'Dramatic sacrifices',
          'Becoming vegetarian',
          'Conscious, informed choices',
          'Buying expensive products'
        ],
        answer: 'Conscious, informed choices',
        explanation: 'Sống bền vững là "making conscious, informed choices" - đưa ra lựa chọn có ý thức và thông tin.'
      },
      {
        type: 'fill_blank',
        question: 'The Vietnamese proverb "_______ thành bão" means many small contributions can create a powerful force.',
        answer: 'Góp gió',
        explanation: '"Góp gió thành bão" - tục ngữ Việt Nam, nghĩa là nhiều đóng góp nhỏ tạo thành sức mạnh lớn.'
      },
      {
        type: 'true_false_notgiven',
        question: 'All cafes in Vietnam now offer discounts for reusable cups.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết chỉ nói "Many cafes" - nhiều quán, không phải tất cả.'
      },
      {
        type: 'short_answer',
        question: 'Name two benefits of using public transportation or cycling mentioned in the passage.',
        answer: 'reduces emissions and improves physical health',
        explanation: 'Sử dụng phương tiện công cộng "reduces emissions" và "improves physical health" - giảm khí thải và cải thiện sức khỏe.'
      },
      {
        type: 'multiple_choice',
        question: 'What is required to install solar panels?',
        options: [
          'Government permission',
          'An initial investment',
          'A new house',
          'Special training'
        ],
        answer: 'An initial investment',
        explanation: 'Lắp đặt pin năng lượng mặt trời cần "an initial investment" - khoản đầu tư ban đầu.'
      },
      {
        type: 'true_false_notgiven',
        question: 'The author argues that individuals have more responsibility than governments for climate change.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói "governments and corporations bear the greatest responsibility" - chính phủ và doanh nghiệp chịu trách nhiệm lớn nhất.'
      }
    ]
  },
  {
    id: 'r10',
    title: 'Understanding Cultural Differences in Business',
    level: 'B2',
    topic: 'Cultural Differences',
    passage: `In an increasingly interconnected world, understanding cultural differences has become essential for success in international business. As Vietnam continues to attract foreign investment and Vietnamese companies expand overseas, professionals must develop cross-cultural competence to navigate diverse business environments effectively.

One fundamental difference lies in communication styles. Western cultures, particularly the United States and Australia, tend to favor direct communication. People say exactly what they mean, and honesty is valued even when the message is uncomfortable. In contrast, many Asian cultures, including Vietnam, prefer indirect communication. Rather than saying "no" directly, Vietnamese professionals might say "that could be difficult" or "we will consider it." Understanding these nuances prevents misunderstandings and helps build stronger relationships.

The concept of time also varies significantly across cultures. In Germany and Japan, punctuality is considered a sign of respect, and being even a few minutes late is seen as unprofessional. In some Latin American and Middle Eastern cultures, however, schedules are viewed more flexibly, and meetings may not start at the exact scheduled time. Vietnamese business culture generally values punctuality, though some flexibility is common in informal settings.

Hierarchy and decision-making processes differ as well. In many Western organizations, employees at all levels are encouraged to voice their opinions and challenge ideas openly. In Vietnamese companies, however, decisions typically flow from the top down, and younger employees may hesitate to disagree with their superiors publicly. Understanding this hierarchy is crucial when working with Vietnamese business partners.

Gift-giving etiquette presents another area of cultural variation. In Vietnam, gifts are commonly exchanged during business meetings, holidays, and special occasions. However, in some Western countries, business gifts may be viewed with suspicion or even considered unethical, particularly if they are expensive. Knowing when and how to give gifts appropriately can strengthen or damage a business relationship.

For FPT University students preparing for international careers, developing cultural intelligence is just as important as developing technical skills. Reading about different cultures, traveling when possible, and building friendships with international students are all valuable ways to broaden one's cultural perspective.`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'How do Western cultures typically communicate in business?',
        options: [
          'Indirectly and politely',
          'Directly and honestly',
          'Through written messages only',
          'Through intermediaries'
        ],
        answer: 'Directly and honestly',
        explanation: 'Văn hóa phương Tây "favor direct communication" và "honesty is valued" - ưa thích giao tiếp trực tiếp và coi trọng sự thành thật.'
      },
      {
        type: 'true_false_notgiven',
        question: 'In Vietnam, people always say "no" directly in business situations.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Người Việt Nam thường dùng cách nói gián tiếp như "that could be difficult" thay vì nói "no" trực tiếp.'
      },
      {
        type: 'fill_blank',
        question: 'In Germany and Japan, _______ is considered a sign of respect.',
        answer: 'punctuality',
        explanation: 'Ở Đức và Nhật, "punctuality is considered a sign of respect" - đúng giờ được coi là thể hiện sự tôn trọng.'
      },
      {
        type: 'multiple_choice',
        question: 'How is decision-making typically structured in Vietnamese companies?',
        options: [
          'All employees make decisions equally',
          'Decisions flow from the top down',
          'Only foreign managers make decisions',
          'Decisions are made by voting'
        ],
        answer: 'Decisions flow from the top down',
        explanation: 'Trong công ty Việt Nam, "decisions typically flow from the top down" - quyết định thường từ trên xuống.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Expensive business gifts are always welcome in Western countries.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói ở phương Tây quà đắt tiền "may be viewed with suspicion or even considered unethical" - có thể bị nghi ngờ hoặc coi là phi đạo đức.'
      },
      {
        type: 'short_answer',
        question: 'What three activities does the passage suggest for developing cultural intelligence?',
        answer: 'reading about different cultures, traveling, and building friendships with international students',
        explanation: 'Bài viết gợi ý "Reading about different cultures, traveling when possible, and building friendships with international students" để phát triển trí tuệ văn hóa.'
      },
      {
        type: 'multiple_choice',
        question: 'Why is understanding cultural differences important for Vietnamese professionals?',
        options: [
          'Because Vietnam has no culture',
          'Because Vietnam attracts foreign investment and companies expand overseas',
          'Because Vietnamese culture is wrong',
          'Because it is required by law'
        ],
        answer: 'Because Vietnam attracts foreign investment and companies expand overseas',
        explanation: 'Quan trọng vì "Vietnam continues to attract foreign investment and Vietnamese companies expand overseas" - thu hút đầu tư nước ngoài và mở rộng ra nước ngoài.'
      }
    ]
  },
  {
    id: 'r11',
    title: 'The Science of Healthy Sleep Habits',
    level: 'B2',
    topic: 'Health and Lifestyle',
    passage: `Sleep is one of the most fundamental biological processes, yet it is frequently neglected by university students. Research consistently demonstrates that adequate sleep is essential for cognitive function, emotional well-being, and physical health. Despite this evidence, a significant proportion of students regularly sacrifice sleep for studying, socializing, or scrolling through social media.

The science behind sleep reveals why it is so critical. During sleep, the brain undergoes a process called memory consolidation, in which short-term memories are transferred to long-term storage. This means that pulling an all-nighter before an exam is counterproductive — without sleep, the brain cannot effectively retain the information that was studied. Studies have shown that students who get seven to eight hours of sleep before an exam typically perform better than those who stay up all night cramming.

Sleep deprivation has wide-ranging consequences beyond academic performance. Chronic lack of sleep weakens the immune system, making individuals more susceptible to illnesses such as colds and flu. It also increases the risk of developing serious conditions like obesity, diabetes, and cardiovascular disease. On a psychological level, insufficient sleep is strongly associated with anxiety, depression, and difficulty managing emotions.

Creating healthy sleep habits, often referred to as "sleep hygiene," involves several evidence-based strategies. Maintaining a consistent sleep schedule — going to bed and waking up at the same time every day, including weekends — helps regulate the body's internal clock. Avoiding caffeine and heavy meals in the evening, limiting screen time before bed, and keeping the bedroom cool and dark all contribute to better sleep quality.

Exercise also plays an important role in promoting good sleep. Regular physical activity, particularly earlier in the day, has been shown to help people fall asleep faster and enjoy deeper sleep. However, vigorous exercise too close to bedtime can have the opposite effect.

For Vietnamese students who may share dormitory rooms, creating an optimal sleep environment can be challenging. Using earplugs, eye masks, or white noise apps can help minimize disruptions. Ultimately, prioritizing sleep is not a luxury — it is a necessity for academic success and overall well-being.`,
    questions: [
      {
        type: 'multiple_choice',
        question: 'What happens in the brain during sleep?',
        options: [
          'The brain shuts down completely',
          'Memory consolidation occurs — short-term memories move to long-term storage',
          'The brain deletes unnecessary information',
          'New brain cells are created'
        ],
        answer: 'Memory consolidation occurs — short-term memories move to long-term storage',
        explanation: 'Trong khi ngủ, não thực hiện "memory consolidation" - chuyển trí nhớ ngắn hạn sang lưu trữ dài hạn.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Staying up all night before an exam is an effective study strategy.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói "pulling an all-nighter before an exam is counterproductive" - thức trắng đêm trước kỳ thi phản tác dụng.'
      },
      {
        type: 'multiple_choice',
        question: 'How many hours of sleep are recommended before an exam?',
        options: ['5-6 hours', '7-8 hours', '9-10 hours', '4-5 hours'],
        answer: '7-8 hours',
        explanation: 'Sinh viên ngủ "seven to eight hours" trước kỳ thi thường đạt kết quả tốt hơn.'
      },
      {
        type: 'fill_blank',
        question: 'Chronic lack of sleep weakens the _______ system.',
        answer: 'immune',
        explanation: 'Thiếu ngủ mãn tính làm suy yếu "immune system" - hệ miễn dịch.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Vigorous exercise right before bedtime helps people sleep better.',
        options: ['True', 'False', 'Not Given'],
        answer: 'False',
        explanation: 'Bài viết nói "vigorous exercise too close to bedtime can have the opposite effect" - tập thể dục mạnh gần giờ ngủ có tác dụng ngược.'
      },
      {
        type: 'short_answer',
        question: 'What tools does the passage suggest for students in shared dormitory rooms?',
        answer: 'earplugs, eye masks, or white noise apps',
        explanation: 'Cho sinh viên ở ký túc xá, bài viết gợi ý dùng "earplugs, eye masks, or white noise apps" - nút tai, mặt nạ ngủ, hoặc ứng dụng tiếng ồn trắng.'
      },
      {
        type: 'multiple_choice',
        question: 'What does "sleep hygiene" refer to?',
        options: [
          'Taking a shower before bed',
          'Evidence-based strategies for healthy sleep habits',
          'Cleaning your bedroom',
          'Sleeping in a clean bed'
        ],
        answer: 'Evidence-based strategies for healthy sleep habits',
        explanation: '"Sleep hygiene" là "evidence-based strategies" cho thói quen ngủ lành mạnh - các chiến lược dựa trên bằng chứng.'
      },
      {
        type: 'true_false_notgiven',
        question: 'Most Vietnamese university students get enough sleep regularly.',
        options: ['True', 'False', 'Not Given'],
        answer: 'Not Given',
        explanation: 'Bài viết nói "a significant proportion of students regularly sacrifice sleep" nhưng không nói cụ thể về tỷ lệ sinh viên Việt Nam - thông tin không đủ.'
      }
    ]
  }
];
