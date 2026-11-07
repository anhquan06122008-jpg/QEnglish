/* ==========================================================================
   QEnglish - Extended Multi-Level & IELTS Content + All 7 Reading Question Types
   Separates CEFR (A1-C2) and IELTS (3.0-9.0) cleanly without fixed conversion
   ========================================================================== */

(function enrichBuiltInDatasets() {
    // 1. Add A1, C1, C2 & Dedicated IELTS Reading Passages (with Matching Headings, Matching Info & Summary Completion)
    if (typeof READING_PASSAGES !== "undefined") {
        READING_PASSAGES.unshift({
            id: "r-a1-01",
            title: "A Student Cafe on Campus",
            level: "A1",
            levelSystem: "CEFR",
            topic: "Campus Life",
            passage: `Green Bean is a small cafe inside our university campus. It opens at seven o'clock every morning and closes at six in the evening.

Many students visit Green Bean before their morning classes. A cup of iced milk coffee costs twenty thousand VND, and warm bread costs fifteen thousand VND.

There are ten wooden tables near the window. Students often sit there to read books, check emails, or talk quietly with friends.`,
            keyVocab: [
                { word: "campus", ipa: "/ˈkæm.pəs/", vi: "khuôn viên trường đại học" },
                { word: "wooden", ipa: "/ˈwʊd.ən/", vi: "làm bằng gỗ" },
                { word: "quietly", ipa: "/ˈkwaɪət.li/", vi: "một cách yên tĩnh, khẽ khàng" }
            ],
            questions: [
                { type: "multiple_choice", question: "What time does Green Bean cafe open?", options: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM"], answer: "7:00 AM", paragraphRef: 1, explanation: "Đoạn 1 nêu rõ: 'It opens at seven o'clock every morning' (mở cửa lúc 7 giờ sáng)." },
                { type: "true_false_notgiven", question: "Iced milk coffee is more expensive than warm bread.", options: ["True", "False", "Not Given"], answer: "True", paragraphRef: 2, explanation: "Đoạn 2 nêu cà phê sữa đá giá 20.000đ còn bánh mì nóng giá 15.000đ -> cà phê đắt hơn (True)." },
                { type: "fill_blank", question: "There are ten _______ tables near the window.", answer: "wooden", paragraphRef: 3, explanation: "Đoạn 3 viết: 'There are ten wooden tables near the window'." },
                { type: "short_answer", question: "Where is Green Bean cafe located?", answer: "inside our university campus", paragraphRef: 1, explanation: "Đoạn 1 viết: 'inside our university campus'." }
            ]
        });

        READING_PASSAGES.push(
            {
                id: "r-ielts-60",
                title: "IELTS Reading: Micro-Credentials and the Changing University Model",
                level: "IELTS 6.0",
                levelSystem: "IELTS",
                topic: "Higher Education & Careers",
                passage: `[Paragraph A] For centuries, the traditional four-year university degree served as the primary gateway to professional employment. Students completed a fixed curriculum before entering the labor market, confident that their qualification would remain relevant for decades. Today, however, rapid technological disruption in fields such as software engineering and data science has shortened the shelf life of technical skills.

[Paragraph B] In response, universities and employers have increasingly embraced micro-credentials—short, focused certifications that verify specific competencies such as cloud architecture, semiconductor testing, or business communication. Unlike general degrees, micro-credentials can be updated within months to reflect industry standards.

[Paragraph C] At institutions like FPT University, academic programs often combine foundational degree coursework with industry certificates and mandatory company internships. Educators argue that this hybrid model gives undergraduates both theoretical depth and immediate workplace readiness.

[Paragraph D] Critics nevertheless warn against replacing broad university education entirely with narrow skill badges. Without foundational training in critical thinking, ethics, and academic writing, graduates may struggle to adapt when current tools become obsolete.`,
                keyVocab: [
                    { word: "disruption", ipa: "/dɪsˈrʌp.ʃən/", vi: "sự đột phá / xáo trộn thay đổi mạnh mẽ" },
                    { word: "competencies", ipa: "/ˈkɒm.pɪ.tən.siz/", vi: "năng lực chuyên môn" },
                    { word: "hybrid", ipa: "/ˈhaɪ.brɪd/", vi: "kết hợp, lai ghép" },
                    { word: "obsolete", ipa: "/ˌɒb.səlˈiːt/", vi: "lỗi thời" }
                ],
                questions: [
                    {
                        type: "matching_headings",
                        question: "Matching Headings — Choose the best heading for Paragraph B:",
                        options: [
                            "i. Risks of abandoning broad academic foundations",
                            "ii. Flexible short certifications for specific skills",
                            "iii. The historical stability of traditional degrees",
                            "iv. Combining university degrees with real-world training"
                        ],
                        answer: "ii. Flexible short certifications for specific skills",
                        paragraphRef: 2,
                        explanation: "Đoạn B định nghĩa 'micro-credentials—short, focused certifications...' và khả năng cập nhật nhanh theo chuẩn ngành -> khớp tiêu đề ii."
                    },
                    {
                        type: "matching_headings",
                        question: "Matching Headings — Choose the best heading for Paragraph D:",
                        options: [
                            "i. Risks of abandoning broad academic foundations",
                            "ii. Flexible short certifications for specific skills",
                            "iii. Campus life in Vietnam",
                            "iv. How to apply for scholarships"
                        ],
                        answer: "i. Risks of abandoning broad academic foundations",
                        paragraphRef: 4,
                        explanation: "Đoạn D nêu cảnh báo của giới phê bình ('Critics nevertheless warn...') nếu bỏ nền tảng tư duy phản biện, đạo đức và viết học thuật -> khớp tiêu đề i."
                    },
                    {
                        type: "matching_info",
                        question: "Matching Information — Which paragraph mentions mandatory company internships alongside degree courses?",
                        options: ["Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D"],
                        answer: "Paragraph C",
                        paragraphRef: 3,
                        explanation: "Đoạn C nhắc trực tiếp đến 'combine foundational degree coursework with industry certificates and mandatory company internships'."
                    },
                    {
                        type: "summary_completion",
                        question: "Summary Completion — Complete the summary using ONE word from Paragraph A: Rapid technological change has reduced the shelf life of _______ skills.",
                        answer: "technical",
                        paragraphRef: 1,
                        explanation: "Câu cuối Đoạn A viết: 'shortened the shelf life of technical skills'."
                    },
                    {
                        type: "true_false_notgiven",
                        question: "Micro-credentials take at least four years to update.",
                        options: ["True", "False", "Not Given"],
                        answer: "False",
                        paragraphRef: 2,
                        explanation: "Đoạn B ghi rõ 'micro-credentials can be updated within months' (chỉ mất vài tháng để cập nhật, không phải 4 năm) -> False."
                    },
                    {
                        type: "short_answer",
                        question: "According to Paragraph D, what may happen to current tools in the future? (Write ONE adjective from the text)",
                        answer: "obsolete",
                        paragraphRef: 4,
                        explanation: "Câu cuối Đoạn D viết: 'when current tools become obsolete' (trở nên lỗi thời)."
                    }
                ]
            },
            {
                id: "r-c2-01",
                title: "Cognitive Load Theory in Second Language Acquisition",
                level: "C2",
                levelSystem: "CEFR",
                topic: "Applied Linguistics",
                passage: `[Paragraph A] Cognitive Load Theory (CLT), originally formulated by John Sweller, posits that human working memory possesses strictly limited capacity when processing novel information. In second language acquisition (SLA), learners simultaneously decode phonological streams, retrieve lexical items, and parse syntactic structures—an endeavour that rapidly saturates cognitive bandwidth unless instructional design intervenes.

[Paragraph B] Empirical studies distinguish between intrinsic load, dictated by the inherent complexity of the target grammar, and extraneous load, generated by poorly structured learning materials. When digital platforms bombard elementary learners with ungraded texts and dense metalinguistic jargon, extraneous load spikes, impeding schema consolidation in long-term memory.

[Paragraph C] Conversely, scaffolded multimodal systems—wherein learners progress incrementally from isolated lexical recognition to guided sentence production and spaced retrieval—automate lower-order decoding. Once foundational patterns become proceduralized, working memory is liberated for higher-order pragmatic nuance and spontaneous discourse.`,
                keyVocab: [
                    { word: "posits", ipa: "/ˈpɒz.ɪts/", vi: "đưa ra luận điểm / giả định" },
                    { word: "extraneous", ipa: "/ɪkˈstreɪ.ni.əs/", vi: "ngoại lai, không thiết yếu (gây nhiễu)" },
                    { word: "impeding", ipa: "/ɪmˈpiː.dɪŋ/", vi: "cản trở, làm chậm lại" },
                    { word: "scaffolded", ipa: "/ˈskæf.əld.ɪd/", vi: "được phân bậc hỗ trợ từng bước" }
                ],
                questions: [
                    { type: "matching_info", question: "Which paragraph contrasts two distinct categories of cognitive load?", options: ["Paragraph A", "Paragraph B", "Paragraph C"], answer: "Paragraph B", paragraphRef: 2, explanation: "Đoạn B phân biệt 'intrinsic load' và 'extraneous load'." },
                    { type: "summary_completion", question: "Summary Completion (ONE word from Paragraph C): Once basic language patterns are automated, working memory is freed up for higher-order pragmatic _______.", answer: "nuance", paragraphRef: 3, explanation: "Câu cuối Đoạn C viết: 'liberated for higher-order pragmatic nuance and spontaneous discourse'." },
                    { type: "true_false_notgiven", question: "Working memory has unlimited capacity when learning a second language.", options: ["True", "False", "Not Given"], answer: "False", paragraphRef: 1, explanation: "Đoạn A khẳng định 'working memory possesses strictly limited capacity' -> False." }
                ]
            }
        );
    }

    // 2. Add A1, A2, C1, C2 & IELTS Listening Exercises
    if (typeof LISTENING_EXERCISES !== "undefined") {
        LISTENING_EXERCISES.unshift(
            {
                id: "l-a1-01",
                title: "Greeting a Classmate on Monday Morning",
                level: "A1",
                levelSystem: "CEFR",
                type: "dictation",
                transcript: "Good morning! Are you in English class room 204? Yes, I am. My name is Quan. Nice to meet you!",
                audioText: "Good morning! Are you in English class room 204? Yes, I am. My name is Quan. Nice to meet you!",
                sentences: [
                    "Good morning!",
                    "Are you in English class room 204?",
                    "Yes, I am.",
                    "My name is Quan.",
                    "Nice to meet you!"
                ]
            },
            {
                id: "l-a2-01",
                title: "Asking About Library Hours",
                level: "A2",
                levelSystem: "CEFR",
                type: "multiple_choice",
                transcript: "Excuse me, can I borrow this English grammar book? Sure, please show me your student ID card. You can keep the book for fourteen days. Remember to return it before next Friday, or there is a small late fee of five thousand dong per day.",
                audioText: "Excuse me, can I borrow this English grammar book? Sure, please show me your student ID card. You can keep the book for fourteen days. Remember to return it before next Friday, or there is a small late fee of five thousand dong per day.",
                sentences: [
                    "Excuse me, can I borrow this English grammar book?",
                    "Sure, please show me your student ID card.",
                    "You can keep the book for fourteen days.",
                    "Remember to return it before next Friday, or there is a small late fee of five thousand dong per day."
                ],
                questions: [
                    { question: "What does the student need to show to borrow the book?", options: ["Passport", "Student ID card", "Bus ticket", "Class schedule"], answer: "Student ID card", explanationVi: "Thủ thư nói: 'please show me your student ID card' (vui lòng xuất trình thẻ sinh viên)." },
                    { question: "How long can the student keep the book?", options: ["7 days", "10 days", "14 days", "30 days"], answer: "14 days", explanationVi: "Bài nghe nói rõ: 'You can keep the book for fourteen days' (14 ngày)." }
                ]
            }
        );

        LISTENING_EXERCISES.push(
            {
                id: "l-c1-01",
                title: "Academic Lecture: Ethical AI in Software Development",
                level: "C1",
                levelSystem: "CEFR",
                type: "fill_blanks",
                transcript: "As software engineers deploy machine learning models into healthcare and finance, algorithmic transparency becomes paramount. Biased training datasets inevitably yield discriminatory outcomes unless developers implement rigorous auditing protocols.",
                audioText: "As software engineers deploy machine learning models into healthcare and finance, algorithmic transparency becomes paramount. Biased training datasets inevitably yield discriminatory outcomes unless developers implement rigorous auditing protocols.",
                blankedText: "As software engineers deploy machine learning models into healthcare and finance, algorithmic ___(1)___ becomes paramount. Biased training datasets inevitably yield ___(2)___ outcomes unless developers implement ___(3)___ auditing protocols.",
                answers: ["transparency", "discriminatory", "rigorous"],
                sentences: [
                    "As software engineers deploy machine learning models into healthcare and finance, algorithmic transparency becomes paramount.",
                    "Biased training datasets inevitably yield discriminatory outcomes unless developers implement rigorous auditing protocols."
                ]
            },
            {
                id: "l-ielts-60",
                title: "IELTS Listening Section 3: Research Project Consultation",
                level: "IELTS 6.0",
                levelSystem: "IELTS",
                type: "full_test",
                durationSeconds: 360,
                transcript: "Tutor: Welcome Minh and Mai. How is your survey on student study habits progressing? Mai: We have collected one hundred and twenty responses so far, mostly from first-year IT students. Minh: However, we noticed that self-reported screen time was inaccurate, so we plan to ask twenty volunteers to share their phone usage logs for one week. Tutor: That is a smart methodological adjustment. Make sure you obtain written consent from every participant before collecting any personal data, and submit your interim report by Thursday afternoon.",
                audioText: "Welcome Minh and Mai. How is your survey on student study habits progressing? We have collected one hundred and twenty responses so far, mostly from first-year IT students. However, we noticed that self-reported screen time was inaccurate, so we plan to ask twenty volunteers to share their phone usage logs for one week. That is a smart methodological adjustment. Make sure you obtain written consent from every participant before collecting any personal data, and submit your interim report by Thursday afternoon.",
                sentences: [
                    "Welcome Minh and Mai. How is your survey on student study habits progressing?",
                    "We have collected one hundred and twenty responses so far, mostly from first-year IT students.",
                    "However, we noticed that self-reported screen time was inaccurate, so we plan to ask twenty volunteers to share their phone usage logs for one week.",
                    "That is a smart methodological adjustment.",
                    "Make sure you obtain written consent from every participant before collecting any personal data, and submit your interim report by Thursday afternoon."
                ],
                questions: [
                    { question: "How many survey responses have the students collected so far?", options: ["20", "100", "120", "200"], answer: "120", explanationVi: "Mai nói: 'We have collected one hundred and twenty responses so far'." },
                    { question: "Why did Minh suggest using phone usage logs?", options: ["To save money", "Because self-reported screen time was inaccurate", "Because first-year students refused the survey", "To test a new game"], answer: "Because self-reported screen time was inaccurate", explanationVi: "Minh giải thích: 'self-reported screen time was inaccurate' (thời gian dùng màn hình tự khai báo không chính xác)." },
                    { question: "What must the students obtain from volunteers first?", options: ["Payment", "Student ID cards", "Written consent", "Library passes"], answer: "Written consent", explanationVi: "Giảng viên dặn: 'Make sure you obtain written consent from every participant' (xin sự đồng ý bằng văn bản)." },
                    { question: "When is the interim report due?", options: ["Monday morning", "Wednesday noon", "Thursday afternoon", "Friday midnight"], answer: "Thursday afternoon", explanationVi: "Câu cuối: 'submit your interim report by Thursday afternoon'." }
                ]
            }
        );
    }

    // 3. Add Email, Letter, C2 & IELTS Writing Topics
    if (typeof WRITING_TOPICS !== "undefined") {
        WRITING_TOPICS.push(
            {
                id: "w-b1-email",
                title: "Email to Lecturer Requesting Feedback",
                level: "B1",
                levelSystem: "CEFR",
                type: "email",
                prompt: "Write a polite email to your English lecturer asking for feedback on your paragraph draft and requesting a short 10-minute consultation after class.",
                promptVi: "Viết một email lịch sự gửi giảng viên tiếng Anh xin nhận xét về bản nháp đoạn văn và xin hẹn gặp 10 phút sau giờ học.",
                guidelines: [
                    "Include a clear subject line and formal salutation (Dear Ms./Mr. ...).",
                    "State your full name, student ID, and class code in the opening.",
                    "Politely explain what you need help with and suggest a time.",
                    "End with a formal sign-off (Best regards / Sincerely)."
                ],
                minWords: 80,
                maxWords: 150,
                sampleOutline: ["Subject & Greeting", "Self-introduction (Class code)", "Reason for writing & specific question", "Request for brief meeting", "Polite closing"],
                vocabulary: ["I am writing to...", "I would really appreciate your feedback on...", "Would you be available for...", "Thank you for your time and guidance", "Best regards"],
                timeLimit: 15
            },
            {
                id: "w-ielts-60",
                title: "IELTS Writing Task 2: Online vs. Classroom University Courses",
                level: "IELTS 6.0",
                levelSystem: "IELTS",
                type: "essay",
                prompt: "Some people believe that university students learn better through online courses, while others think traditional classroom learning is irreplaceable. Discuss both views and give your own opinion.",
                promptVi: "Một số người tin rằng sinh viên đại học học tốt hơn qua các khóa trực tuyến, trong khi những người khác cho rằng lớp học truyền thống là không thể thay thế. Thảo luận cả hai quan điểm và nêu ý kiến của bạn.",
                guidelines: [
                    "Write at least 250 words in formal academic register (avoid contractions like don't, can't).",
                    "Paragraph 1: Paraphrase the prompt and state your thesis clearly.",
                    "Paragraph 2: Discuss advantages of online learning (flexibility, recorded lectures).",
                    "Paragraph 3: Discuss strengths of face-to-face classrooms (hands-on labs, peer interaction).",
                    "Paragraph 4: Summarize and reinforce your balanced opinion."
                ],
                minWords: 250,
                maxWords: 350,
                sampleOutline: ["Introduction & Thesis", "Body 1: Merits of digital learning", "Body 2: Value of in-person instruction", "Conclusion & Hybrid recommendation"],
                vocabulary: ["on the one hand", "on the other hand", "flexibility and accessibility", "face-to-face interaction", "blended learning approach", "in conclusion"],
                timeLimit: 40
            },
            {
                id: "w-c2-01",
                title: "Epistemic Autonomy in the Era of Generative AI",
                level: "C2",
                levelSystem: "CEFR",
                type: "essay",
                prompt: "To what extent does reliance on generative artificial intelligence erode students' epistemic autonomy and critical reasoning capacities?",
                promptVi: "Ở mức độ nào việc phụ thuộc vào trí tuệ nhân tạo tạo sinh làm xói mòn tính tự chủ nhận thức và năng lực tư duy phản biện của người học?",
                guidelines: [
                    "Use precise academic hedging and nuanced argumentation.",
                    "Address cognitive offloading versus augmented inquiry.",
                    "Maintain cohesive progression across complex paragraphs."
                ],
                minWords: 280,
                maxWords: 450,
                sampleOutline: ["Introduction: Defining epistemic autonomy", "Cognitive offloading risks", "Pedagogical integration as cognitive scaffolding", "Conclusion"],
                vocabulary: ["epistemic autonomy", "cognitive offloading", "metacognitive awareness", "uncurated synthesis", "pedagogical guardrails"],
                timeLimit: 45
            }
        );
    }

    // 4. Add C1, C2 & IELTS Speaking Topics
    if (typeof SPEAKING_TOPICS !== "undefined") {
        SPEAKING_TOPICS.push(
            {
                id: "s-b1-uni",
                title: "My University — FPT Campus Life",
                level: "B1",
                levelSystem: "CEFR",
                type: "monologue",
                prompt: "Describe your university campus in Ho Chi Minh City, your favorite study spot, and why you chose to study here.",
                promptVi: "Mô tả khuôn viên trường đại học của bạn tại TP.HCM, góc tự học yêu thích và lý do bạn chọn học tại đây.",
                suggestedQuestions: [
                    "Where is your university campus located?",
                    "What facilities on campus do you use most often?",
                    "Why did you choose FPT University?",
                    "How do you feel about English Level 3 so far?"
                ],
                suggestedQuestionsVi: [
                    "Khuôn viên trường bạn nằm ở đâu?",
                    "Bạn hay sử dụng cơ sở vật chất nào nhất?",
                    "Vì sao bạn chọn Đại học FPT?",
                    "Bạn cảm thấy thế nào về chương trình Tiếng Anh Level 3 hiện tại?"
                ],
                usefulPhrases: ["Currently, I am a freshman at...", "What impresses me most about the campus is...", "My go-to place for self-study is...", "One reason I chose this university is its practical curriculum."],
                sampleAnswer: "Currently, I am a freshman at FPT University in Ho Chi Minh City. What impresses me most about our campus is the green space and modern computer labs. My go-to place for self-study is the library because it is quiet and air-conditioned. Right now, I am focusing on completing English Level 3 so I can read technical documents and communicate confidently in my major.",
                duration: 90
            },
            {
                id: "s-ielts-60",
                title: "IELTS Speaking Part 2: Describe a Skill You Learned Online",
                level: "IELTS 6.0",
                levelSystem: "IELTS",
                type: "monologue",
                prompt: "Describe a useful skill you learned using the internet. You should say: what the skill was, how you learned it, how long it took, and explain why this skill is helpful to you.",
                promptVi: "Mô tả một kỹ năng hữu ích bạn học được qua mạng Internet (kỹ năng gì, học bằng cách nào, mất bao lâu và vì sao nó hữu ích).",
                suggestedQuestions: [
                    "What was the skill you decided to learn?",
                    "Which websites or tools did you use?",
                    "What difficulties did you face at the beginning?",
                    "How does this skill benefit your university studies?"
                ],
                suggestedQuestionsVi: [
                    "Kỹ năng bạn quyết định học là gì?",
                    "Bạn đã dùng trang web hay công cụ nào?",
                    "Ban đầu bạn gặp khó khăn gì?",
                    "Kỹ năng này giúp ích gì cho việc học đại học của bạn?"
                ],
                usefulPhrases: ["I'd like to talk about...", "Initially, I found it quite challenging to...", "By practicing consistently for twenty minutes a day...", "Looking back, acquiring this skill has enabled me to..."],
                sampleAnswer: "I'd like to talk about touch-typing and daily English dictation, which I learned online last semester. Initially, I found it quite challenging to keep up with native speakers' speed. However, by practicing consistently for twenty minutes a day on structured web platforms, my listening accuracy and typing speed improved dramatically. Looking back, acquiring this skill has enabled me to take lecture notes effortlessly.",
                duration: 120
            },
            {
                id: "s-c1-01",
                title: "Balancing Automation and Human Creativity",
                level: "C1",
                levelSystem: "CEFR",
                type: "discussion",
                prompt: "Discuss whether artificial intelligence will enhance human creativity or make people overly dependent on automated tools.",
                promptVi: "Thảo luận xem AI sẽ nâng tầm sự sáng tạo của con người hay khiến con người phụ thuộc quá mức vào công cụ tự động.",
                suggestedQuestions: [
                    "In what ways can AI accelerate brainstorming?",
                    "What happens if students let AI write essays for them?",
                    "How should universities regulate AI usage?"
                ],
                suggestedQuestionsVi: [
                    "AI giúp tăng tốc việc lên ý tưởng như thế nào?",
                    "Chuyện gì xảy ra nếu sinh viên để AI viết hộ bài luận?",
                    "Các trường đại học nên quy định việc dùng AI ra sao?"
                ],
                usefulPhrases: ["From my perspective, AI acts as a double-edged sword...", "When used judiciously as a tutor rather than a ghostwriter...", "Ultimately, critical judgment remains uniquely human."],
                sampleAnswer: "From my perspective, AI acts as a double-edged sword in education. When used judiciously as an interactive tutor to point out grammar errors, it accelerates self-correction. Conversely, if learners passively copy generated essays, their own writing muscles atrophy. Ultimately, technology should amplify human effort rather than replace it.",
                duration: 120
            }
        );
    }
})();

// Legal, Copyright-Safe External Learning Resources (PHẦN 3.3.C & PHẦN 5.2)
const EXTERNAL_RESOURCES = [
    {
        id: "ext-dailydictation",
        title: "Daily Dictation — Luyện nghe chép chính tả từng câu",
        skill: "listening",
        levelSystem: "CEFR",
        level: "A2",
        url: "https://dailydictation.com/",
        sourceName: "DailyDictation.com",
        description: "Kho bài luyện nghe chép chính tả theo chủ đề Short Stories, TOEIC, IELTS, Giao tiếp hàng ngày rất phù hợp cho sinh viên mất gốc nghe."
    },
    {
        id: "ext-bbc-6min",
        title: "BBC Learning English — 6 Minute English",
        skill: "listening",
        levelSystem: "CEFR",
        level: "B1",
        url: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english",
        sourceName: "BBC Learning English",
        description: "Podcast thảo luận 6 phút chuẩn giọng Anh với danh sách từ vựng và transcript chính thống."
    },
    {
        id: "ext-bc-listening",
        title: "British Council LearnEnglish — A1 to C1 Skills",
        skill: "listening",
        levelSystem: "CEFR",
        level: "B1",
        url: "https://learnenglish.britishcouncil.org/skills/listening",
        sourceName: "British Council",
        description: "Hệ thống bài Nghe - Đọc - Viết - Nói phân cấp chuẩn khung tham chiếu châu Âu CEFR A1–C1."
    },
    {
        id: "ext-voa",
        title: "VOA Learning English — Tin tức tốc độ chậm",
        skill: "listening",
        levelSystem: "CEFR",
        level: "A2",
        url: "https://learningenglish.voanews.com/",
        sourceName: "VOA Learning English",
        description: "Bản tin khoa học, giáo dục, công nghệ đọc chậm hơn 30% giúp tai làm quen phát âm tiếng Anh-Mỹ rõ chữ."
    },
    {
        id: "ext-cambridge-write",
        title: "Cambridge Write & Improve",
        skill: "writing",
        levelSystem: "CEFR",
        level: "B1",
        url: "https://writeandimprove.com/",
        sourceName: "University of Cambridge",
        description: "Nền tảng luyện viết miễn phí chính thống từ Đại học Cambridge theo thang CEFR & IELTS."
    },
    {
        id: "ext-bc-reading",
        title: "British Council Academic & B1-B2 Reading",
        skill: "reading",
        levelSystem: "CEFR",
        level: "B2",
        url: "https://learnenglish.britishcouncil.org/skills/reading",
        sourceName: "British Council",
        description: "Bài đọc theo tình huống đại học, công sở và học thuật kèm bài tập tương tác."
    }
];

const DAILY_QUOTES = [
    { en: "Small daily improvements over time lead to stunning results.", vi: "Mỗi ngày tiến bộ một chút theo thời gian sẽ tạo ra kết quả đáng kinh ngạc.", author: "Robin Sharma", tip: "Đừng cố học 100 từ một đêm — hãy hoàn thành đều đặn 10 từ + 1 bài nghe mỗi ngày cho tới 17/12/2026!" },
    { en: "Mistakes are proof that you are trying.", vi: "Lỗi sai chính là bằng chứng cho thấy bạn đang nỗ lực luyện tập.", author: "Proverb", tip: "Mỗi khi viết sai câu, hãy xem giải thích trong Mistake Notebook và tự viết lại câu đó 1 lần!" },
    { en: "To have another language is to possess a second soul.", vi: "Biết thêm một ngôn ngữ là sở hữu thêm một tâm hồn thứ hai.", author: "Charlemagne", tip: "Hãy đọc to (shadowing) các câu ví dụ trong Flashcard để kết nối cả tai nghe và cơ miệng!" },
    { en: "Consistency beats intensity when building language fluency.", vi: "Sự đều đặn luôn chiến thắng sự bộc phát nhất thời khi xây dựng phản xạ ngoại ngữ.", author: "EdTech Principle", tip: "Dù ngày bận thi ở FPT, chỉ cần giữ chuỗi Streak 15 phút nghe và ôn SRS là bạn đã thắng!" },
    { en: "First understand the pattern, then make the sentence your own.", vi: "Trước hết hãy hiểu công thức câu, sau đó biến câu nói thành của riêng bạn.", author: "QEnglish Method", tip: "Khi học từ mới, hãy đặt câu gắn với chính ngành học và cuộc sống tại campus HCM của bạn." }
];
