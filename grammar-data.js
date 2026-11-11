/* ==========================================================================
   QEnglish - Comprehensive Grammar Curriculum (A1 - C2, All 16+ Core Topics)
   ========================================================================== */

const GRAMMAR_LESSONS = [
    {
        id: "g-01",
        topic: "Parts of Speech",
        title: "Parts of Speech — Từ loại trong tiếng Anh",
        level: "A1",
        intro: "Nền tảng quan trọng nhất để đặt câu tiếng Anh đúng là hiểu rõ vai trò của từng từ loại (Parts of Speech) trong câu.",
        explanation: "Trong tiếng Anh có 8 từ loại chính: Danh từ (Noun - chỉ người/vật/khái niệm), Đại từ (Pronoun - thay thế danh từ), Động từ (Verb - chỉ hành động/trạng thái), Tính từ (Adjective - bổ nghĩa cho danh từ), Trạng từ (Adverb - bổ nghĩa cho động từ/tính từ), Giới từ (Preposition - chỉ vị trí/thời gian), Liên từ (Conjunction - nối từ/mệnh đề) và Thán từ (Interjection). Khi đặt câu, sinh viên Việt Nam thường nhầm tính từ với động từ (ví dụ viết 'I nervous' thay vì 'I am nervous').",
        formula: "Subject (Noun/Pronoun) + Verb + Object (Noun) | Adj + Noun | Verb + Adv",
        examples: [
            { en: "Diligent students study English effectively at university.", vi: "Những sinh viên chăm chỉ (Adj + N) học (V) tiếng Anh (N) một cách hiệu quả (Adv) ở trường đại học (Prep + N)." },
            { en: "She quickly solved the difficult problem.", vi: "Cô ấy (Pron) đã nhanh chóng (Adv) giải quyết (V) bài toán khó (Adj + N)." },
            { en: "Information technology is very exciting.", vi: "Công nghệ thông tin (N phrase) thì (linking V) rất (Adv) thú vị (Adj)." }
        ],
        commonMistakes: [
            { wrong: "I very happy today.", correct: "I am very happy today.", why: "'Happy' là tính từ (Adjective), không phải động từ nên bắt buộc phải có động từ 'to be' (am) đứng trước." },
            { wrong: "He speaks English fluent.", correct: "He speaks English fluently.", why: "Bổ nghĩa cho động từ thường 'speaks' phải dùng trạng từ 'fluently' (đuôi -ly), không dùng tính từ 'fluent'." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Identify the part of speech of 'carefully' in: 'Please read the syllabus carefully.'", options: ["Noun", "Adjective", "Adverb", "Verb"], answer: "Adverb", explanationVi: "'Carefully' có đuôi -ly và bổ nghĩa cho động từ 'read' (đọc như thế nào? -> đọc một cách cẩn thận) nên là Trạng từ (Adverb)." },
            { type: "fill_blank", question: "My lecturer is very _______ (help) whenever we ask questions.", answer: "helpful", explanationVi: "Sau động từ to be 'is' và trạng từ chỉ mức độ 'very', ta cần một Tính từ (Adjective) -> 'helpful' (nhiệt tình giúp đỡ)." },
            { type: "multiple_choice", question: "Which sentence uses Parts of Speech correctly?", options: ["She presentation very good.", "Her presentation was very good.", "She presented very good.", "Her present was goodly."], answer: "Her presentation was very good.", explanationVi: "Câu cần Chủ ngữ cụm danh từ ('Her presentation') + Động từ to be ('was') + Cụm tính từ ('very good')." },
            { type: "rewrite", question: "Sửa lỗi từ loại trong câu: 'I afraid of speaking English in class.'", answer: "I am afraid of speaking English in class.", explanationVi: "'Afraid' là tính từ nên phải thêm động từ 'am' sau chủ ngữ 'I'." }
        ]
    },
    {
        id: "g-02",
        topic: "Nouns",
        title: "Nouns — Danh từ đếm được & không đếm được",
        level: "A1",
        intro: "Phân biệt danh từ đếm được (Countable) và không đếm được (Uncountable) giúp bạn chia động từ và dùng a/an, s/es, many/much chính xác.",
        explanation: "Danh từ đếm được có dạng số ít (dùng a/an) và số nhiều (thêm -s/-es hoặc bất quy tắc như child -> children, person -> people). Danh từ KHÔNG đếm được (như information, advice, feedback, homework, equipment, knowledge, money) KHÔNG BAO GIỜ thêm -s/-es và luôn đi với động từ chia số ít!",
        formula: "Countable: a/an + N(ít) | many/few + N(s/es)  •  Uncountable: much/little/some + N(không thêm s) + V(số ít)",
        examples: [
            { en: "We have three assignments this week.", vi: "Chúng tôi có ba bài tập lớn (assignment đếm được -> thêm s) trong tuần này." },
            { en: "The teacher gave me useful feedback on my essay.", vi: "Giáo viên đã cho tôi nhận xét hữu ích (feedback không đếm được -> không dùng 'a' hay 'feedbacks') về bài luận." },
            { en: "How much homework do we have today?", vi: "Hôm nay chúng ta có bao nhiêu bài tập về nhà (homework không đếm được -> dùng much)?" }
        ],
        commonMistakes: [
            { wrong: "Can you give me some advices and informations?", correct: "Can you give me some advice and information?", why: "'Advice' và 'information' là danh từ không đếm được trong tiếng Anh, tuyệt đối không thêm 's'." },
            { wrong: "Many student are in the library.", correct: "Many students are in the library.", why: "Sau 'many' phải là danh từ đếm được số nhiều ('students')." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Choose the correct sentence:", options: ["I need a new equipment for the lab.", "I need some new equipment for the lab.", "I need two equipments for the lab.", "Equipments are expensive."], answer: "I need some new equipment for the lab.", explanationVi: "'Equipment' (thiết bị) là danh từ không đếm được nên dùng 'some', không dùng 'a' hay thêm 's'." },
            { type: "fill_blank", question: "How _______ (many/much) time do you spend learning vocabulary every day?", answer: "much", explanationVi: "'Time' (thời gian nói chung) là danh từ không đếm được nên đi với 'much' (How much time)." },
            { type: "multiple_choice", question: "All the _______ you shared yesterday _______ very helpful.", options: ["information / was", "informations / were", "information / were", "informations / was"], answer: "information / was", explanationVi: "'Information' là danh từ không đếm được nên không có 's' và động từ theo sau luôn chia ở số ít ('was')." },
            { type: "rewrite", question: "Sửa câu sai: 'My teacher gave me many homeworks.'", answer: "My teacher gave me a lot of homework.", acceptAlt: ["My teacher gave me much homework.", "My teacher gave me some homework."], explanationVi: "'Homework' là danh từ không đếm được nên đổi 'many homeworks' thành 'a lot of homework' (hoặc 'much/some homework')." }
        ]
    },
    {
        id: "g-03",
        topic: "Pronouns",
        title: "Pronouns — Đại từ nhân xưng, sở hữu & phản thân",
        level: "A1",
        intro: "Sử dụng đúng đại từ giúp câu văn mạch lạc, tránh lặp từ và đúng vai trò chủ ngữ - tân ngữ.",
        explanation: "Cần phân biệt rõ 5 cột đại từ: (1) Đại từ chủ ngữ đứng đầu câu làm chủ ngữ (I, you, we, they, he, she, it); (2) Đại từ tân ngữ đứng sau động từ/giới từ (me, you, us, them, him, her, it); (3) Tính từ sở hữu bắt buộc có danh từ theo sau (my, your, our, their, his, her, its); (4) Đại từ sở hữu đứng độc lập thay cho cụm sở hữu (mine, yours, ours, theirs, his, hers); (5) Đại từ phản thân khi chủ ngữ tự tác động lên chính mình (myself, yourself, themselves...).",
        formula: "S (I/She/They) + V + O (me/her/them)  •  Possessive Adj (my/their) + Noun = Possessive Pronoun (mine/theirs)",
        examples: [
            { en: "My laptop is out of battery. Can I borrow yours?", vi: "Laptop của tôi (my + N) hết pin rồi. Tôi có thể mượn cái của bạn (yours = your laptop) được không?" },
            { en: "Our lecturer encouraged us to correct the mistakes ourselves.", vi: "Giảng viên của chúng tôi (our) khuyến khích chúng tôi (us - tân ngữ) tự mình (ourselves) sửa lỗi." },
            { en: "The university updated its curriculum this year.", vi: "Trường đại học đã cập nhật chương trình học của nó (its - không có dấu nháy đơn!)." }
        ],
        commonMistakes: [
            { wrong: "Me and Minh are in the same group.", correct: "Minh and I are in the same group.", why: "Vị trí chủ ngữ phải dùng đại từ chủ ngữ 'I' (không dùng tân ngữ 'me'), và theo phép lịch sự thường đặt tên người khác trước 'I'." },
            { wrong: "The company changed it's logo.", correct: "The company changed its logo.", why: "'It's' là viết tắt của 'it is' hoặc 'it has'. Tính từ sở hữu của 'it' là 'its' (không có dấu phẩy trên)." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Dr. Nam asked Lan and _______ to present first.", options: ["I", "me", "my", "mine"], answer: "me", explanationVi: "Đứng sau động từ 'asked' là vị trí tân ngữ nên phải chọn đại từ tân ngữ 'me'." },
            { type: "fill_blank", question: "Students should learn how to study by _______ (they).", answer: "themselves", explanationVi: "Cấu trúc 'by + đại từ phản thân' mang nghĩa 'tự lực / một mình'. Chủ ngữ số nhiều 'Students' ứng với 'themselves'." },
            { type: "multiple_choice", question: "This notebook is _______. _______ is on the desk over there.", options: ["my / Your", "mine / Yours", "mine / Your", "my / Yours"], answer: "mine / Yours", explanationVi: "Cả hai vị trí đều đứng độc lập không có danh từ theo sau nên dùng đại từ sở hữu 'mine' (= my notebook) và 'Yours' (= Your notebook)." }
        ]
    },
    {
        id: "g-04",
        topic: "Articles",
        title: "Articles — Mạo từ a, an, the và Zero Article (Ø)",
        level: "A1",
        intro: "Mạo từ xuất hiện trong hầu hết mọi câu tiếng Anh. Hiểu quy tắc âm thanh và tính xác định sẽ giúp bạn không còn đoán mò a/an/the.",
        explanation: "1) Dùng 'a/an' với danh từ đếm được số ít khi nhắc tới lần đầu hoặc mang nghĩa 'một'. Chọn 'a' hay 'an' dựa vào ÂM ĐẦU khi phát âm, không phải chữ cái viết (ví dụ: 'a university' vì bắt đầu bằng âm /j/, 'an hour' vì 'h' câm bắt đầu bằng nguyên âm /aʊ/). 2) Dùng 'the' khi người nghe và người nói đều biết rõ đối tượng đó, vật duy nhất (the sun, the internet), so sánh nhất (the best). 3) KHÔNG dùng mạo từ (Ø) trước danh từ số nhiều hoặc không đếm được khi nói chung chung (VD: 'Technology changes education', không nói 'The technology...').",
        formula: "a + phụ âm phát âm (/j/, /w/, /b/...) | an + nguyên âm phát âm (/æ/, /e/, /ɪ/, /ɒ/, /ʌ/) | the + danh từ đã xác định",
        examples: [
            { en: "I am a first-year student at an international university.", vi: "Tôi là một sinh viên năm nhất tại một trường đại học quốc tế ('a' trước /f/, 'an' trước /ɪ/)." },
            { en: "I bought a book yesterday. The book is about Python.", vi: "Hôm qua tôi mua một cuốn sách (nhắc lần đầu -> a). Cuốn sách đó (nhắc lại đã xác định -> The) viết về Python." },
            { en: " Ø English plays an important role in software engineering.", vi: "Tiếng Anh (môn học/ngôn ngữ nói chung -> không dùng mạo từ) đóng một vai trò quan trọng trong ngành kỹ thuật phần mềm." }
        ],
        commonMistakes: [
            { wrong: "She studies at an university in Ho Chi Minh City.", correct: "She studies at a university in Ho Chi Minh City.", why: "'University' phát âm là /ˌjuː.nɪˈvɜː.sə.ti/, bắt đầu bằng phụ âm /j/ nên phải dùng 'a', không dùng 'an'." },
            { wrong: "I like listening to the music in my free time.", correct: "I like listening to music in my free time.", why: "Nói về âm nhạc nói chung (general concept) thì không dùng 'the'." }
        ],
        exercises: [
            { type: "multiple_choice", question: "It takes me half _______ hour to get to _______ university campus.", options: ["a / a", "an / the", "a / the", "an / an"], answer: "an / the", explanationVi: "'Hour' có âm 'h' câm (/aʊər/) nên dùng 'an hour'; khuôn viên trường mà người nói đang theo học đã xác định nên dùng 'the university campus'." },
            { type: "fill_blank", question: "_______ (A/An/The) Internet has transformed how students access knowledge.", answer: "The", explanationVi: "Với mạng lưới toàn cầu duy nhất 'Internet', ta luôn dùng mạo từ xác định 'The Internet'." },
            { type: "multiple_choice", question: "Choose the correct sentence:", options: ["The life at college is exciting.", "Life at college is exciting.", "A life at the college is exciting.", "An life at college is exciting."], answer: "Life at college is exciting.", explanationVi: "'Life' mang nghĩa cuộc sống nói chung là danh từ trừu tượng không đếm được -> không dùng 'The'." }
        ]
    },
    {
        id: "g-05",
        topic: "Verbs",
        title: "Verbs — Động từ to be, Động từ thường & Động từ khuyết thiếu (Modals)",
        level: "A2",
        intro: "Nắm vững sự khác biệt giữa 'to be', động từ hành động (Action Verbs) và động từ khuyết thiếu (can, should, must...) để không bao giờ viết câu thừa 'am/is/are'!",
        explanation: "Lỗi kinh điển số 1 của người học Việt Nam là ghép trực tiếp 'am/is/are' với động từ nguyên mẫu (VD: 'I am study English' — SAI!). Quy tắc vàng: (1) To be chỉ đi với Danh từ, Tính từ, Cụm giới từ, V-ing (tiếp diễn) hoặc V3/ed (bị động). (2) Động từ thường ở thì đơn đứng trực tiếp sau chủ ngữ, khi phủ định/nghi vấn phải mượn trợ động từ do/does/did. (3) Động từ khuyết thiếu (can, could, will, would, should, must, may, might) luôn cộng trực tiếp với V nguyên mẫu không 'to'!",
        formula: "To be: S + am/is/are + Adj/N  •  Action Verb: S + V(s/es) / don't-doesn't + V  •  Modal: S + can/should/must + V(bare)",
        examples: [
            { en: "I study at the university, and my major is Software Engineering.", vi: "'study' là động từ thường đứng thẳng sau 'I'; 'is' là to be nối với danh từ ngành học." },
            { en: "You should review new vocabulary every evening.", vi: "Sau modal verb 'should' là động từ nguyên mẫu 'review' (không có 'to')." },
            { en: "Does she understand the grammar formula?", vi: "Câu hỏi với động từ thường 'understand' phải mượn trợ động từ 'Does' và đưa động từ chính về nguyên mẫu." }
        ],
        commonMistakes: [
            { wrong: "I am agree with your opinion.", correct: "I agree with your opinion.", why: "'Agree' là động từ thường (đồng ý), KHÔNG phải tính từ, nên tuyệt đối không viết 'I am agree'." },
            { wrong: "Students must to wear their ID cards on campus.", correct: "Students must wear their ID cards on campus.", why: "Sau động từ khuyết thiếu 'must' là V nguyên mẫu không 'to'." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Choose the grammatically correct sentence:", options: ["I am totally agree with you.", "I totally agree with you.", "I do totally agreeing with you.", "I can to agree with you."], answer: "I totally agree with you.", explanationVi: "'Agree' là động từ thường, đứng trực tiếp sau chủ ngữ 'I' (có trạng từ 'totally' bổ nghĩa ở giữa)." },
            { type: "fill_blank", question: "_______ (Do/Are) you usually practice listening before bed?", answer: "Do", explanationVi: "'Practice' là động từ thường nguyên mẫu nên câu hỏi ở Hiện tại đơn phải mượn trợ động từ 'Do', không dùng 'Are'." },
            { type: "rewrite", question: "Sửa lỗi câu sau: 'He can speaks English quite well.'", answer: "He can speak English quite well.", explanationVi: "Sau động từ khuyết thiếu 'can', động từ 'speak' giữ nguyên mẫu cho mọi ngôi, không thêm 's'." }
        ]
    },
    {
        id: "g-06",
        topic: "Tenses",
        title: "Tenses (Part 1) — Hiện tại đơn, Hiện tại tiếp diễn, Quá khứ đơn & Tương lai",
        level: "A2",
        intro: "Bốn thì cốt lõi chiếm hơn 75% giao tiếp và bài viết ở trình độ Intermediate English.",
        explanation: "1) Present Simple (Hiện tại đơn): Thói quen hàng ngày, sự thật hiển nhiên, lịch trình cố định (always, usually, every day). 2) Present Continuous (Hiện tại tiếp diễn): Hành động đang diễn ra ngay lúc nói hoặc tạm thời trong giai đoạn hiện tại (now, right now, this week). 3) Past Simple (Quá khứ đơn): Hành động đã xảy ra và ĐÃ KẾT THÚC tại thời điểm xác định trong quá khứ (yesterday, last week, in 2024, ago). 4) Future (will vs be going to): 'will + V' cho quyết định tức thì hoặc dự đoán; 'be going to + V' cho kế hoạch đã dự định trước.",
        formula: "HTĐ: S + V(s/es) | HTTD: S + am/is/are + V-ing | QKĐ: S + V2/ed | TL: S + will + V / am-is-are going to + V",
        examples: [
            { en: "I usually take the bus, but today I am riding my motorbike.", vi: "Thói quen hàng ngày dùng Hiện tại đơn ('take'), hành động tạm thời hôm nay dùng Tiếp diễn ('am riding')." },
            { en: "Last night, I completed two reading passages and learned ten words.", vi: "'Last night' là mốc quá khứ đã kết thúc -> chia Quá khứ đơn ('completed', 'learned')." },
            { en: "I am going to finish B1 Intermediate successfully by December.", vi: "Kế hoạch mục tiêu đã định rõ -> dùng 'am going to finish'." }
        ],
        commonMistakes: [
            { wrong: "Yesterday I go to the library and study for three hours.", correct: "Yesterday I went to the library and studied for three hours.", why: "Có mốc quá khứ 'Yesterday' nhưng quên chia động từ sang quá khứ ('went', 'studied') — lỗi rất phổ biến khi viết và nói!" },
            { wrong: "I am knowing the answer now.", correct: "I know the answer now.", why: "Động từ chỉ nhận thức/trạng thái (know, understand, believe, like, want, need) KHÔNG chia ở thì tiếp diễn." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Quiet please! Our group _______ a video for the Speaking assignment right now.", options: ["records", "recorded", "is recording", "will record"], answer: "is recording", explanationVi: "Dấu hiệu 'Quiet please!' và 'right now' cho biết hành động đang diễn ra ngay lúc nói -> Hiện tại tiếp diễn 'is recording'." },
            { type: "fill_blank", question: "Two days ago, our lecturer _______ (explain) how to write a topic sentence.", answer: "explained", explanationVi: "'Two days ago' là dấu hiệu rõ ràng của thì Quá khứ đơn -> 'explained'." },
            { type: "multiple_choice", question: "Look at your schedule! We _______ a group meeting at 3 PM, so don't forget.", options: ["were having", "are going to have", "had", "having"], answer: "are going to have", explanationVi: "Kế hoạch đã được sắp xếp trước trong lịch -> dùng 'are going to have'." }
        ]
    },
    {
        id: "g-07",
        topic: "Tenses",
        title: "Tenses (Part 2) — Hiện tại hoàn thành & Quá khứ tiếp diễn",
        level: "B1",
        intro: "Phân biệt rõ Hiện tại hoàn thành (Present Perfect) với Quá khứ đơn (Past Simple) để nâng trình Writing & Speaking lên B1-B2.",
        explanation: "1) Present Perfect (have/has + V3/ed): Dùng cho hành động bắt đầu trong quá khứ nhưng CÒN KÉO DÀI đến hiện tại (for + khoảng thời gian, since + mốc thời gian), trải nghiệm tính đến nay (ever, never), hoặc hành động vừa xảy ra mà kết quả còn ảnh hưởng hiện tại (already, yet, just, recently). Tuyệt đối KHÔNG dùng Present Perfect với mốc quá khứ cụ thể như 'yesterday', 'in 2022'! 2) Past Continuous (was/were + V-ing): Hành động đang diễn ra tại một thời điểm trong quá khứ hoặc đang diễn ra thì hành động khác xen vào (chia QKĐ).",
        formula: "Present Perfect: S + have/has + V3/ed (since/for/already/yet)  •  Past Continuous: While S + was/were + V-ing, S + V2/ed",
        examples: [
            { en: "I have studied at the university since September.", vi: "Tôi bắt đầu học từ tháng 9 và hiện tại vẫn đang học -> Hiện tại hoàn thành." },
            { en: "While I was reading an English article, my friend called me.", vi: "Đang đọc bài báo (was reading - hành động nền kéo dài) thì bạn gọi điện xen vào (called - Quá khứ đơn)." }
        ],
        commonMistakes: [
            { wrong: "I have met him last week.", correct: "I met him last week.", why: "'Last week' là thời điểm quá khứ đã khép lại, bắt buộc dùng Quá khứ đơn 'met', không dùng 'have met'." },
            { wrong: "She lives in Ho Chi Minh City for two years.", correct: "She has lived in Ho Chi Minh City for two years.", why: "Có 'for two years' diễn tả quá trình kéo dài từ quá khứ đến hiện tại -> phải chia Hiện tại hoàn thành 'has lived'." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Technology _______ the way university students learn over the past decade.", options: ["transformed", "has transformed", "is transforming", "was transforming"], answer: "has transformed", explanationVi: "Cụm 'over the past decade' (trong suốt thập kỷ qua tính đến nay) là dấu hiệu chuẩn của thì Hiện tại hoàn thành 'has transformed'." },
            { type: "fill_blank", question: "While we _______ (discuss) the project, the internet connection suddenly dropped.", answer: "were discussing", explanationVi: "Sau 'While' diễn tả hành động đang diễn ra trong quá khứ thì sự cố bất ngờ xen vào ('dropped') -> chia Quá khứ tiếp diễn 'were discussing'." },
            { type: "multiple_choice", question: "Have you submitted your writing draft _______?", options: ["already", "since", "yet", "ago"], answer: "yet", explanationVi: "'Yet' đứng cuối câu hỏi hoặc câu phủ định ở thì Hiện tại hoàn thành mang nghĩa 'đã ... chưa?'." }
        ]
    },
    {
        id: "g-08",
        topic: "Subject-Verb Agreement",
        title: "Subject-Verb Agreement — Sự hòa hợp giữa Chủ ngữ và Động từ",
        level: "A2",
        intro: "Đảm bảo động từ luôn chia đúng số ít/số nhiều với chủ ngữ chính, kể cả khi chủ ngữ là cụm từ dài.",
        explanation: "Các quy tắc quan trọng cần nhớ: (1) Khi chủ ngữ là 'The number of + N(số nhiều)' -> chia SỐ ÍT (con số), nhưng 'A number of + N(số nhiều)' -> chia SỐ NHIỀU (nhiều...). (2) Danh động từ V-ing đứng đầu câu làm chủ ngữ (Learning new words...) -> luôn chia SỐ ÍT! (3) Đại từ bất định (Everyone, everybody, someone, nobody, each, every) -> luôn chia SỐ ÍT! (4) Khi có giới từ chen giữa (The quality of these products...) -> chia theo danh từ CHÍNH đứng trước giới từ ('quality' -> số ít)!",
        formula: "V-ing + V(số ít) | Everyone/Each + V(số ít) | N1 + of + N2 -> chia theo N1",
        examples: [
            { en: "Practicing English for thirty minutes every day builds strong habits.", vi: "Chủ ngữ là cụm V-ing 'Practicing English...' (việc luyện tiếng Anh), không phải 'minutes', nên động từ thêm s ('builds')." },
            { en: "Everyone in our class wants to pass B1 Intermediate.", vi: "'Everyone' luôn đi với động từ số ít ('wants')." },
            { en: "The impact of social media platforms on teenagers is undeniable.", vi: "Chủ ngữ chính là 'The impact' (số ít), không phải 'platforms' hay 'teenagers' -> dùng 'is'." }
        ],
        commonMistakes: [
            { wrong: "Reading English books help me expand my vocabulary.", correct: "Reading English books helps me expand my vocabulary.", why: "Chủ ngữ thực sự là hành động 'Reading' (việc đọc sách - số ít), không phải 'books', nên động từ phải là 'helps'." },
            { wrong: "Everybody have their own learning style.", correct: "Everybody has their own learning style.", why: "'Everybody' luôn chia động từ số ít ('has')." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Listening to short podcasts every morning _______ a great way to improve pronunciation.", options: ["are", "is", "were", "have been"], answer: "is", explanationVi: "Chủ ngữ là cụm danh động từ 'Listening to short podcasts...' -> chia động từ số ít 'is'." },
            { type: "fill_blank", question: "The number of international students at our campus _______ (increase) every year.", answer: "increases", explanationVi: "'The number of...' (Con số của...) là chủ ngữ số ít nên động từ hiện tại đơn thêm 's' -> 'increases'." },
            { type: "multiple_choice", question: "Each of the team members _______ responsible for one section of the report.", options: ["are", "is", "were", "have"], answer: "is", explanationVi: "Chủ ngữ bắt đầu bằng 'Each of...' luôn chia động từ số ít ('is')." }
        ]
    },
    {
        id: "g-09",
        topic: "Adjectives",
        title: "Adjectives — Tính từ, đuôi -ed/-ing & Cấu trúc So sánh",
        level: "A2",
        intro: "Sử dụng tính từ chính xác để miêu tả sự vật, cảm xúc và so sánh trong bài viết học thuật.",
        explanation: "1) Vị trí: Tính từ đứng TRƯỚC danh từ (a modern campus) hoặc SAU linking verbs (be, feel, seem, become, look, sound). 2) Phân biệt tính từ đuôi -ING và -ED: Đuôi -ING chỉ bản chất/tính chất gây ra cảm xúc (an interesting lecture - bài giảng thú vị); đuôi -ED chỉ cảm xúc của con người bị tác động (I am interested in the lecture - tôi cảm thấy hứng thú). 3) So sánh hơn: Tính từ ngắn + '-er than'; Tính từ dài dùng 'more + adj + than'. So sánh nhất: 'the + adj-est' hoặc 'the most + adj'. Bất quy tắc: good -> better -> the best; bad -> worse -> the worst.",
        formula: "Adj(-ing): bản chất sự vật | Adj(-ed): cảm xúc con người  •  Comparative: adj-er / more adj + than",
        examples: [
            { en: "The exam was exhausting, so all students felt exhausted.", vi: "Kỳ thi có tính chất gây mệt (exhausting), nên sinh viên cảm thấy kiệt sức (exhausted)." },
            { en: "Online dictionaries are much faster and more convenient than paper ones.", vi: "'faster' (tính từ ngắn) và 'more convenient' (tính từ dài 3 âm tiết) + than." }
        ],
        commonMistakes: [
            { wrong: "I am very boring in this class.", correct: "I am very bored in this class.", why: "'I am boring' có nghĩa là 'Tôi là kẻ nhạt nhẽo gây chán'! Để diễn tả cảm xúc của bản thân đang chán, phải dùng 'bored'." },
            { wrong: "Reading is more easier than writing for me.", correct: "Reading is easier than writing for me.", why: "Không bao giờ dùng kép 'more' + '-er' ('more easier'). 'Easy' kết thúc bằng -y đổi thành 'easier'." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Many freshmen feel _______ when speaking English in front of the class because pronunciation rules can be _______.", options: ["confusing / confused", "confused / confusing", "confuse / confused", "confused / confuse"], answer: "confused / confusing", explanationVi: "Sinh viên cảm thấy bối rối -> 'confused' (-ed chỉ cảm xúc người); quy tắc phát âm có tính chất gây bối rối -> 'confusing' (-ing)." },
            { type: "fill_blank", question: "Practicing every day is much _______ (effective) than cramming before the test.", answer: "more effective", explanationVi: "'Effective' là tính từ dài 3 âm tiết nên so sánh hơn dùng 'more effective'." },
            { type: "rewrite", question: "Sửa câu sai: 'This is the most good app for learning vocabulary.'", answer: "This is the best app for learning vocabulary.", explanationVi: "So sánh nhất của tính từ bất quy tắc 'good' là 'the best', không dùng 'the most good'." }
        ]
    },
    {
        id: "g-10",
        topic: "Adverbs",
        title: "Adverbs — Trạng từ chỉ cách thức, tần suất & mức độ",
        level: "B1",
        intro: "Trạng từ giúp câu văn giàu sắc thái, chính xác và đạt điểm Vocabulary/Grammar cao hơn trong Speaking & Writing.",
        explanation: "1) Trạng từ chỉ cách thức (Adverbs of Manner): Thường tạo bằng Adj + '-ly' (slow -> slowly, careful -> carefully, easy -> easily). Lưu ý các trạng từ BẤT QUY TẮC: good -> well, fast -> fast, hard -> hard (chăm chỉ/khó; khác hoàn toàn với 'hardly' = hầu như không!), late -> late ('lately' = gần đây). 2) Trạng từ tần suất (always, usually, often, sometimes, rarely, never): Đứng TRƯỚC động từ thường nhưng đứng SAU động từ 'to be' (She is always punctual / She always arrives on time). 3) Trạng từ liên kết học thuật (However, Furthermore, Therefore, Consequently): Đứng đầu câu và có dấu phẩy theo sau.",
        formula: "S + Adv(tần suất) + V | S + be + Adv(tần suất) | S + V + O + Adv(cách thức)",
        examples: [
            { en: "He worked hard all semester and performed remarkably well in the final test.", vi: "'hard' (chăm chỉ) và 'well' (tốt) là hai trạng từ bất quy tắc bổ nghĩa cho 'worked' và 'performed'." },
            { en: "Students rarely remember words if they never use them in sentences.", vi: "'rarely' và 'never' đứng ngay trước động từ thường 'remember' và 'use'." }
        ],
        commonMistakes: [
            { wrong: "I very like learning English through movies.", correct: "I really like learning English through movies.", why: "'Very' KHÔNG bổ nghĩa trực tiếp cho động từ! Để nhấn mạnh động từ 'like', hãy dùng 'really like' hoặc 'like ... very much'." },
            { wrong: "She studies hardly for the exam.", correct: "She studies hard for the exam.", why: "'Hardly' có nghĩa là 'hầu như KHÔNG'! Muốn nói học chăm chỉ phải dùng 'studies hard'." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Choose the natural and grammatically correct sentence:", options: ["I very enjoy working in teams.", "I really enjoy working in teams.", "I enjoy very working in teams.", "I am really enjoy working in teams."], answer: "I really enjoy working in teams.", explanationVi: "Dùng trạng từ 'really' đứng trước động từ thường 'enjoy' (không dùng 'very' trước động từ)." },
            { type: "fill_blank", question: "If you listen closely, you can understand native speakers _______ (clear).", answer: "clearly", explanationVi: "Bổ nghĩa cho động từ 'understand' cần trạng từ cách thức -> 'clearly'." },
            { type: "multiple_choice", question: "He _______ misses a morning lecture because he _______ sets two alarms.", options: ["hard / always", "hardly / always", "always / hardly", "lately / usually"], answer: "hardly / always", explanationVi: "'Hardly misses' = hầu như không bao giờ bỏ lỡ; 'always sets' = luôn đặt hai báo thức." }
        ]
    },
    {
        id: "g-11",
        topic: "Prepositions",
        title: "Prepositions — Giới từ chỉ thời gian, nơi chốn & Collocations",
        level: "B1",
        intro: "Sử dụng chuẩn IN - ON - AT và các cụm giới từ cố định (Dependent Prepositions) thường xuyên xuất hiện trong bài thi.",
        explanation: "1) Quy tắc IN - ON - AT cho Thời gian & Địa điểm (từ rộng -> hẹp): IN + năm, tháng, mùa, buổi trong ngày, quốc gia, thành phố (in 2026, in November, in the morning, in Vietnam); ON + ngày trong tuần, ngày tháng cụ thể, bề mặt, phương tiện lớn/nền tảng số (on Monday, on November 4th, on the internet, on social media, on campus - hoặc at campus khi chỉ điểm hẹn); AT + giờ cụ thể, thời điểm lễ, địa điểm cụ thể (at 8:00 AM, at night, at noon, at the university, at home). 2) Cụm cố định bắt buộc nhớ: depend ON, focus ON, interested IN, good AT, responsible FOR, impact ON, participate IN, pay attention TO.",
        formula: "IN (tháng/năm/thành phố) > ON (ngày/nền tảng) > AT (giờ/địa điểm cụ thể)  •  Prep + V-ing / Noun",
        examples: [
            { en: "Our Intermediate English course starts on November 4th, 2026 at 7:30 AM.", vi: "Ngày tháng cụ thể dùng 'on', giờ chính xác dùng 'at'." },
            { en: "Instead of worrying about mistakes, focus on communicating your ideas.", vi: "Sau giới từ ('Instead of', 'about', 'on') động từ luôn phải chia ở dạng V-ing!" }
        ],
        commonMistakes: [
            { wrong: "Social media has a big effect to young people.", correct: "Social media has a big effect on young people.", why: "Danh từ 'effect / impact / influence' luôn đi với giới từ 'ON' (tác động lên ai/cái gì), không đi với 'to'." },
            { wrong: "Thank you for help me with my pronunciation.", correct: "Thank you for helping me with my pronunciation.", why: "Đứng ngay sau giới từ 'for', động từ bắt buộc phải ở dạng V-ing ('helping')." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Success in language learning largely depends _______ daily consistency rather than talent.", options: ["in", "at", "on", "with"], answer: "on", explanationVi: "Cấu trúc cố định: 'depend on / upon' (phụ thuộc vào)." },
            { type: "fill_blank", question: "Are you interested in _______ (join) our English Speaking Club this Wednesday?", answer: "joining", explanationVi: "Sau giới từ 'in' ('interested in'), động từ 'join' phải chia dạng danh động từ V-ing -> 'joining'." },
            { type: "multiple_choice", question: "Classes finish _______ December 17th, and many students return to their hometowns _______ January.", options: ["in / on", "on / in", "at / in", "on / at"], answer: "on / in", explanationVi: "'December 17th' có ngày cụ thể nên dùng 'on'; 'January' chỉ có tháng nên dùng 'in'." }
        ]
    },
    {
        id: "g-12",
        topic: "Conjunctions",
        title: "Conjunctions — Liên từ kết hợp, phụ thuộc & Từ nối mạch lạc",
        level: "B1",
        intro: "Liên từ là 'chất keo' kết nối các ý tưởng, quyết định trực tiếp điểm Coherence & Cohesion trong bài viết và bài nói.",
        explanation: "1) Liên từ kết hợp FANBOYS (for, and, nor, but, or, yet, so): Nối hai mệnh đề độc lập ngang hàng (S + V, but S + V). 2) Liên từ phụ thuộc (because, since, as, although, even though, while, whereas, if, unless): Nối mệnh đề phụ với mệnh đề chính. ĐẶC BIỆT LƯU Ý: Trong tiếng Anh, KHÔNG BAO GIỜ dùng cặp 'Although ... but ...' hoặc 'Because ... so ...' trong cùng một câu — chỉ được chọn MỘT trong hai! 3) Phân biệt liên từ + Mệnh đề (Although / Because + S + V) với giới từ + Cụm danh từ/V-ing (Despite / In spite of / Because of / Due to + N/V-ing).",
        formula: "Although + S + V, S + V (KHÔNG có 'but'!)  •  Despite / Because of + Noun / V-ing, S + V",
        examples: [
            { en: "Although my listening skill is still weak, I practice dictation every day.", vi: "Mặc dù kỹ năng nghe của tôi còn yếu, tôi vẫn luyện chép chính tả mỗi ngày (KHÔNG có 'but' ở vế sau!)." },
            { en: "Despite the heavy rain, everyone arrived at the exam room on time.", vi: "Sau 'Despite' là cụm danh từ 'the heavy rain'." }
        ],
        commonMistakes: [
            { wrong: "Although English grammar seems complex, but we can master it step by step.", correct: "Although English grammar seems complex, we can master it step by step.", why: "Lỗi dịch từng từ từ tiếng Việt 'Mặc dù... nhưng...'. Đã dùng 'Although' thì TUYỆT ĐỐI bỏ 'but'!" },
            { wrong: "Because I woke up late, so I missed the shuttle bus.", correct: "Because I woke up late, I missed the shuttle bus.", why: "Đã dùng 'Because' ở đầu câu thì KHÔNG được dùng thêm 'so' ở mệnh đề chính." }
        ],
        exercises: [
            { type: "multiple_choice", question: "_______ having a busy schedule, Minh still spends 30 minutes reading English articles daily.", options: ["Although", "Because", "Despite", "However"], answer: "Despite", explanationVi: "Theo sau chỗ trống là cụm V-ing ('having a busy schedule') chứ không phải mệnh đề S+V, và mang nghĩa nhượng bộ -> chọn 'Despite'." },
            { type: "rewrite", question: "Sửa lỗi thừa liên từ: 'Although I was nervous, but I finished my presentation.'", answer: "Although I was nervous, I finished my presentation.", acceptAlt: ["I was nervous, but I finished my presentation."], explanationVi: "Bỏ 'but' khi đã có 'Although' (hoặc bỏ 'Although' và giữ 'but')." },
            { type: "multiple_choice", question: "You will not remember new vocabulary long-term _______ you review it regularly.", options: ["unless", "because of", "despite", "so"], answer: "unless", explanationVi: "'Unless' = 'if ... not' (trừ khi / nếu bạn không ôn tập thường xuyên)." }
        ]
    },
    {
        id: "g-13",
        topic: "Sentence Structures",
        title: "Sentence Structures — Câu đơn, Câu ghép, Câu phức & Lỗi Run-on / Fragment",
        level: "B1",
        intro: "Viết câu hoàn chỉnh, đa dạng hóa câu đơn - câu ghép - câu phức và loại bỏ triệt để lỗi câu cụt (Fragment) hay câu dính (Comma Splice).",
        explanation: "Một bài văn tốt cần kết hợp 3 kiểu câu: (1) Simple Sentence (Câu đơn: 1 mệnh đề độc lập S + V); (2) Compound Sentence (Câu ghép: 2 mệnh đề độc lập nối bằng ', + and/but/so' hoặc '; however,'); (3) Complex Sentence (Câu phức: 1 mệnh đề chính + ≥1 mệnh đề phụ bắt đầu bằng when, because, if, although, who, which, that). HAI LỖI CẤU TRÚC NGHIÊM TRỌNG CẦN TRÁNH: • Fragment (Câu cụt): Viết mệnh đề phụ đứng riêng lẻ chấm câu luôn ('Because I want to get a good job.' -> Thiếu mệnh đề chính!). • Comma Splice (Nối 2 câu bằng dấu phẩy khơi khơi): 'English is important, it opens many doors.' -> Sai! Phải sửa thành dấu chấm, hoặc thêm liên từ ', so it opens...', hoặc dùng 'because'.",
        formula: "Simple: S + V. | Compound: S + V, and/but/so S + V. | Complex: Subordinator + S + V, S + V.",
        examples: [
            { en: "Learning English requires patience, so you should celebrate small daily improvements.", vi: "Câu ghép chuẩn: Hai mệnh đề độc lập được nối bằng dấu phẩy + liên từ 'so'." },
            { en: "When students understand sentence structures, their writing becomes much clearer.", vi: "Câu phức chuẩn: Mệnh đề phụ 'When...' + dấu phẩy + mệnh đề chính." }
        ],
        commonMistakes: [
            { wrong: "the university is modern, it has great labs.", correct: "the university is modern, and it has great labs.", why: "Lỗi Comma Splice: Hai mệnh đề hoàn chỉnh không được nối với nhau chỉ bằng một dấu phẩy mà không có liên từ!" },
            { wrong: "For example, watching English videos with subtitles.", correct: "For example, students can watch English videos with subtitles.", why: "Lỗi Sentence Fragment: Cụm 'watching English videos...' chưa có chủ ngữ và động từ chia thì nên chưa phải là một câu hoàn chỉnh." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Which of the following is a grammatically complete sentence (NOT a fragment or comma splice)?", options: ["Because technology is advancing rapidly nowadays.", "Technology is advancing rapidly, we must keep learning.", "As technology advances rapidly, we must keep learning new skills.", "For instance, artificial intelligence and cloud computing."], answer: "As technology advances rapidly, we must keep learning new skills.", explanationVi: "Đây là câu phức hoàn chỉnh gồm mệnh đề phụ ('As technology advances rapidly') và mệnh đề chính ('we must keep learning new skills'). Các câu còn lại bị lỗi Fragment hoặc Comma Splice." },
            { type: "rewrite", question: "Sửa lỗi Comma Splice sau bằng liên từ 'so': 'My listening was weak, I practiced dictation every night.'", answer: "My listening was weak, so I practiced dictation every night.", explanationVi: "Thêm liên từ kết hợp 'so' sau dấu phẩy để nối hai mệnh đề độc lập đúng ngữ pháp." },
            { type: "multiple_choice", question: "Identify the type of sentence: 'Students who read regularly develop a richer vocabulary.'", options: ["Simple sentence", "Compound sentence", "Complex sentence", "Sentence fragment"], answer: "Complex sentence", explanationVi: "Câu chứa mệnh đề chính 'Students develop a richer vocabulary' và mệnh đề quan hệ phụ thuộc 'who read regularly' -> Câu phức (Complex sentence)." }
        ]
    },
    {
        id: "g-14",
        topic: "Passive Voice",
        title: "Passive Voice — Câu bị động trong tiếng Anh học thuật",
        level: "B1",
        intro: "Câu bị động được dùng rất nhiều trong báo cáo khoa học, quy trình kỹ thuật và bài luận học thuật khi muốn nhấn mạnh đối tượng nhận hành động.",
        explanation: "Để chuyển sang câu bị động: Đưa Tân ngữ lên làm Chủ ngữ + chia động từ 'TO BE' theo đúng thì của câu chủ động + Động từ chính luôn đưa về Quá khứ phân từ (V3/ed). Nếu cần nêu tác nhân thực hiện mới thêm 'by + O' (bỏ qua 'by people / by someone / by them' nếu không quan trọng). Lưu ý: Nội động từ (happen, occur, arrive, appear, die, rise) KHÔNG có tân ngữ nên KHÔNG BAO GIỜ chia bị động (không bao giờ viết 'was happened'!).",
        formula: "Active: S + V + O  ⟹  Passive: S(mới) + be (chia theo thì) + V3/ed (+ by O)",
        examples: [
            { en: "Silicon is widely used to manufacture semiconductors.", vi: "Hiện tại đơn bị động (is + used): Nhấn mạnh vật liệu Silicon hơn là người sản xuất." },
            { en: "All assignments must be submitted before 11:59 PM.", vi: "Bị động với Modal Verb (must + be + submitted)." },
            { en: "New AI tools have been integrated into our learning platform.", vi: "Hiện tại hoàn thành bị động (have been + integrated)." }
        ],
        commonMistakes: [
            { wrong: "A serious network error was happened yesterday.", correct: "A serious network error happened yesterday.", why: "'Happen' (xảy ra) và 'occur' là nội động từ, TUYỆT ĐỐI không dùng dạng bị động 'was happened'!" },
            { wrong: "The report written by our team leader last night.", correct: "The report was written by our team leader last night.", why: "Thiếu động từ 'to be' ('was') trước V3 'written'." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Final grades _______ on the student portal within one week after the exam.", options: ["will publish", "will be published", "are publishing", "have published"], answer: "will be published", explanationVi: "Điểm thi ('Final grades') được công bố chứ không tự công bố -> Bị động thì tương lai đơn: 'will be + V3/ed' ('will be published')." },
            { type: "fill_blank", question: "English _______ (speak) as an official or second language in dozens of countries.", answer: "is spoken", explanationVi: "Sự thật ở hiện tại, chủ ngữ số ít 'English' được nói -> Hiện tại đơn bị động 'is spoken'." },
            { type: "rewrite", question: "Chuyển sang câu bị động: 'Engineers designed this microchip.'", answer: "This microchip was designed by engineers.", explanationVi: "Đưa 'This microchip' lên đầu, thì quá khứ đơn ('designed') -> 'was designed' + 'by engineers'." }
        ]
    },
    {
        id: "g-15",
        topic: "Conditional Sentences",
        title: "Conditional Sentences — Câu điều kiện Loại 0, 1, 2 & 3",
        level: "B2",
        intro: "Diễn đạt quy luật tự nhiên, khả năng thực tế trong tương lai và các giả định trái ngược hiện tại/quá khứ.",
        explanation: "4 loại câu điều kiện chuẩn: • Type 0 (Sự thật hiển nhiên/quy luật): If + HTĐ, HTĐ. • Type 1 (Có thật/khả thi ở hiện tại hoặc tương lai): If + HTĐ, S + will/can/should + V. • Type 2 (Giả định KHÔNG có thật ở hiện tại, hoặc lời khuyên 'If I were you'): If + QKĐ (be -> were cho mọi ngôi), S + would/could + V. • Type 3 (Giả định trái ngược quá khứ — tiếc nuối điều đã qua): If + Quá khứ hoàn thành (had + V3/ed), S + would/could have + V3/ed.",
        formula: "Type 1: If + S + V(s/es), S + will + V  |  Type 2: If + S + V2/were, S + would + V  |  Type 3: If + S + had V3, S + would have V3",
        examples: [
            { en: "If you review words using Spaced Repetition, you will remember them much longer.", vi: "Điều kiện có thật, hoàn toàn khả thi (Type 1)." },
            { en: "If I were more confident, I would speak English with international visitors every weekend.", vi: "Giả định trái với hiện tại (Type 2 — dùng 'were' cho cả ngôi 'I')." },
            { en: "If she had checked her essay carefully, she wouldn't have made those spelling mistakes.", vi: "Tiếc nuối chuyện đã xảy ra trong quá khứ (Type 3)." }
        ],
        commonMistakes: [
            { wrong: "If it will rain tomorrow, we will study online.", correct: "If it rains tomorrow, we will study online.", why: "Trong mệnh đề 'If' của câu điều kiện loại 1, dùng Hiện tại đơn ('rains') thay cho tương lai, KHÔNG dùng 'will' ngay sau 'If'!" },
            { wrong: "If I have more free time now, I would learn a third language.", correct: "If I had more free time now, I would learn a third language.", why: "Vế chính dùng 'would learn' (giả định trái với hiện tại - Type 2) nên vế If phải lùi về Quá khứ giả định ('had')." }
        ],
        exercises: [
            { type: "multiple_choice", question: "If students _______ their notes within 24 hours after a lecture, they retain significantly more information.", options: ["will review", "reviewed", "review", "had reviewed"], answer: "review", explanationVi: "Vế chính chia Hiện tại đơn ('retain') diễn tả quy luật thực tế (Type 0) hoặc kết hợp Type 1 -> mệnh đề If dùng Hiện tại đơn 'review'." },
            { type: "fill_blank", question: "If I _______ (be) you, I would practice speaking aloud for 15 minutes every day.", answer: "were", explanationVi: "Cấu trúc khuyên nhủ giả định loại 2 chuẩn học thuật: 'If I were you, I would + V'." },
            { type: "multiple_choice", question: "If we had backed up our source code, we _______ all our work when the computer crashed.", options: ["wouldn't lose", "won't lose", "wouldn't have lost", "didn't lose"], answer: "wouldn't have lost", explanationVi: "Mệnh đề If chia 'had backed up' (Type 3 - trái với quá khứ) -> mệnh đề chính dùng 'wouldn't have + V3' ('wouldn't have lost')." }
        ]
    },
    {
        id: "g-16",
        topic: "Reported Speech",
        title: "Reported Speech — Câu tường thuật (Gián tiếp)",
        level: "B2",
        intro: "Tường thuật lại lời nói, câu hỏi hoặc lời khuyên của người khác một cách tự nhiên và đúng quy tắc lùi thì.",
        explanation: "Khi động từ tường thuật ở quá khứ (said, told + O, asked), ta thực hiện 3 bước: (1) Đổi đại từ nhân xưng/sở hữu theo ngữ cảnh; (2) LÙI THÌ 1 bậc (HTĐ -> QKĐ; HTTD -> QKTD; QKĐ / HTHT -> Quá khứ hoàn thành 'had + V3'; will -> would; can -> could; must -> had to); (3) Đổi trạng từ thời gian/nơi chốn (today -> that day; tomorrow -> the next day; yesterday -> the previous day; now -> then; here -> there). ĐẶC BIỆT với câu hỏi tường thuật: KHÔNG đảo trợ động từ lên trước chủ ngữ nữa (giữ trật tự S + V như câu trần thuật)!",
        formula: "Statement: S + said / told + O + (that) + S + V(lùi thì)  •  Question: S + asked (+ O) + if/whether/Wh- + S + V(lùi thì, KHÔNG đảo ngữ!)",
        examples: [
            { en: "Direct: 'I will check your drafts tomorrow,' the teacher said. → The teacher said that she would check our drafts the next day.", vi: "'will' lùi thành 'would', 'tomorrow' đổi thành 'the next day'." },
            { en: "He asked me where I studied.", vi: "Câu hỏi tường thuật giữ nguyên trật tự S + V ('where I studied', TUYỆT ĐỐI không viết 'where did I study')." }
        ],
        commonMistakes: [
            { wrong: "She said me that she was busy.", correct: "She told me that she was busy.", why: "'Say' không đi trực tiếp với tân ngữ chỉ người ('say to me' hoặc 'tell me')." },
            { wrong: "My friend asked me what time did the class start.", correct: "My friend asked me what time the class started.", why: "Câu tường thuật không còn là câu hỏi trực tiếp nên bỏ trợ động từ 'did' và chia 'started' theo trật tự S + V." }
        ],
        exercises: [
            { type: "multiple_choice", question: "The academic advisor told us _______ forget to register before Friday.", options: ["don't", "not to", "to not to", "didn't"], answer: "not to", explanationVi: "Tường thuật câu mệnh lệnh/dặn dò phủ định dùng cấu trúc: 'tell/advise + O + not to + V'." },
            { type: "multiple_choice", question: "The interviewer asked Lan why she _______ Software Engineering.", options: ["chooses", "did she choose", "had chosen", "has chosen"], answer: "had chosen", explanationVi: "Động từ tường thuật 'asked' ở quá khứ -> lùi từ quá khứ đơn/hiện tại hoàn thành về quá khứ hoàn thành 'had chosen' và giữ trật tự S + V." },
            { type: "rewrite", question: "Viết lại câu tường thuật: Minh said, 'I am practicing speaking now.' -> Minh said that...", answer: "Minh said that he was practicing speaking then.", explanationVi: "Đổi 'I' -> 'he', lùi 'am practicing' -> 'was practicing', đổi 'now' -> 'then'." }
        ]
    },
    {
        id: "g-17",
        topic: "Relative Clauses",
        title: "Relative Clauses — Mệnh đề quan hệ (who, whom, which, that, whose, where)",
        level: "B2",
        intro: "Công cụ số 1 để mở rộng câu, giải thích thuật ngữ và nâng điểm Grammatical Range trong Writing & Speaking.",
        explanation: "Đại từ quan hệ đứng ngay sau danh từ mà nó bổ nghĩa: • WHO (thay cho người - làm chủ ngữ/tân ngữ); • WHOM (thay cho người - làm tân ngữ trang trọng); • WHICH (thay cho vật/sự việc; hoặc ', which' bổ nghĩa cho cả mệnh đề phía trước!); • THAT (thay cho who/which trong mệnh đề quan hệ xác định, KHÔNG bao giờ đứng sau dấu phẩy!); • WHOSE + Noun (chỉ sự sở hữu cho cả người và vật); • WHERE (= in/at which, chỉ nơi chốn, theo sau phải là S + V). Có thể RÚT GỌN mệnh đề quan hệ thành V-ing (chủ động) hoặc V3/ed (bị động).",
        formula: "N(người) + who + V | N(vật) + which/that + V | N + whose + N + V | S + V, which + V(số ít)",
        examples: [
            { en: "Students who review mistakes regularly progress much faster.", vi: "Mệnh đề xác định 'who review mistakes regularly' làm rõ nhóm sinh viên nào." },
            { en: "He practices English every evening, which has greatly improved his confidence.", vi: "', which' thay thế cho toàn bộ hành động phía trước và chia động từ số ít ('has')." },
            { en: "the university is a place where students learn through real-world projects.", vi: "'where' chỉ nơi chốn (= at which), theo sau là mệnh đề S + V." }
        ],
        commonMistakes: [
            { wrong: "The book which I bought it yesterday is very useful.", correct: "The book which I bought yesterday is very useful.", why: "'Which' đã thay thế cho 'the book' rồi nên tuyệt đối không lặp lại đại từ 'it' ở sau 'bought' nữa!" },
            { wrong: "My laptop, that I bought last year, still runs fast.", correct: "My laptop, which I bought last year, still runs fast.", why: "Sau dấu phẩy (mệnh đề không xác định), KHÔNG ĐƯỢC dùng 'that', phải đổi thành 'which' (hoặc 'who' với người)." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Semiconductors are materials _______ electrical conductivity lies between a conductor and an insulator.", options: ["which", "that", "whose", "where"], answer: "whose", explanationVi: "Theo sau chỗ trống là cụm danh từ 'electrical conductivity' thuộc sở hữu của 'materials' -> dùng đại từ sở hữu 'whose'." },
            { type: "multiple_choice", question: "Online courses allow learners to study at their own pace, _______ is ideal for busy university students.", options: ["that", "which", "what", "where"], answer: "which", explanationVi: "Sau dấu phẩy để thay thế cho cả mệnh đề phía trước, ta dùng ', which' (tuyệt đối không dùng 'that')." },
            { type: "fill_blank", question: "The library is the quietest place _______ (which/where) I can focus on writing essays.", answer: "where", explanationVi: "Theo sau là mệnh đề hoàn chỉnh 'I can focus...' diễn tả hoạt động diễn ra TẠI địa điểm 'place' (= in which) -> dùng 'where'." }
        ]
    },
    {
        id: "g-18",
        topic: "Sentence Structures",
        title: "Advanced Inversion & Cleft Sentences — Đảo ngữ & Câu chẻ nhấn mạnh",
        level: "C1",
        intro: "Cấu trúc nâng cao (C1) giúp bài luận Argumentative Essay gây ấn tượng mạnh về độ linh hoạt ngữ pháp.",
        explanation: "1) Đảo ngữ với trạng từ phủ định/giới hạn đứng đầu câu (Not only, Seldom, Rarely, Hardly, Only by + V-ing, Under no circumstances): Đảo trợ động từ lên TRƯỚC chủ ngữ giống cấu trúc câu hỏi (Not only + trợ động từ + S + V, but S + also...). 2) Câu chẻ (It-cleft): 'It is/was + [thành phần cần nhấn mạnh] + that/who + mệnh đề còn lại' để tạo điểm nhấn sắc bén trong lập luận.",
        formula: "Not only + do/does/did/can + S + V, but S + also + V  •  It is + Noun/Phrase + that + V",
        examples: [
            { en: "Not only does AI save grading time, but it also provides personalized feedback.", vi: "Đảo trợ động từ 'does' lên trước chủ ngữ 'AI' sau cụm 'Not only'." },
            { en: "Only by practicing consistently can learners achieve genuine fluency.", vi: "Đảo ngữ xảy ra ở mệnh đề chính ('can learners achieve') sau cụm 'Only by + V-ing'." }
        ],
        commonMistakes: [
            { wrong: "Not only AI saves time, but it also reduces errors.", correct: "Not only does AI save time, but it also reduces errors.", why: "Khi đưa 'Not only' ra đầu câu, bắt buộc phải đảo trợ động từ ('does') lên trước chủ ngữ." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Not only _______ access to global knowledge, but it also connects students across borders.", options: ["the internet provides", "does the internet provide", "provides the internet", "is the internet provide"], answer: "does the internet provide", explanationVi: "Sau 'Not only' đứng đầu câu với động từ thường hiện tại đơn, mượn trợ động từ 'does' + S ('the internet') + V nguyên mẫu ('provide')." },
            { type: "fill_blank", question: "Rarely _______ (do) we realize how much daily micro-habits shape our long-term fluency.", answer: "do", explanationVi: "Trạng từ tần suất mang nghĩa phủ định 'Rarely' đứng đầu câu -> đảo trợ động từ 'do' lên trước 'we'." }
        ]
    },
    {
        id: "g-19",
        topic: "Verbs",
        title: "Participle Clauses & Formal Subjunctive — Mệnh đề phân từ & Giả định thức",
        level: "C2",
        intro: "Đỉnh cao cô đọng câu văn học thuật ở mức C2: Rút gọn mệnh đề đồng chủ ngữ và cấu trúc giả định trang trọng.",
        explanation: "1) Participle Clauses (Mệnh đề phân từ): Khi hai mệnh đề có CÙNG CHỦ NGỮ, có thể rút gọn mệnh đề phụ thành 'V-ing...' (chủ động) hoặc 'V3/ed...' (bị động), hoặc 'Having + V3/ed...' (nhấn mạnh hành động hoàn tất trước). Cảnh báo lỗi Dangling Participle: Chủ ngữ đứng sau dấu phẩy bắt buộc phải là chủ thể của phân từ đứng đầu! 2) Formal Subjunctive: Sau các động từ/tính từ mang tính đề xuất cấp thiết (suggest, recommend, insist, essential, imperative, vital + that), mệnh đề sau 'that' dùng động từ NGUYÊN MẪU KHÔNG CHIA ('V-bare' hoặc 'be + V3') cho mọi ngôi!",
        formula: "Having + V3/ed, S + V  •  It is imperative/essential that + S + V(nguyên mẫu không chia)",
        examples: [
            { en: "It is imperative that every student verify AI-generated information before citing it.", vi: "Giả định thức trang trọng: dù chủ ngữ là số ít 'every student', động từ 'verify' vẫn giữ nguyên mẫu không thêm -ies!" },
            { en: "Equipped with strong English skills, graduates can compete in the global tech market.", vi: "Mệnh đề quá khứ phân từ bị động: 'graduates' chính là đối tượng 'được trang bị' (Equipped)." }
        ],
        commonMistakes: [
            { wrong: "Walking onto the campus, the modern buildings impressed me.", correct: "Walking onto the campus, I was impressed by the modern buildings.", why: "Lỗi Dangling Modifier: Tòa nhà không biết 'đi bộ' (Walking)! Chủ ngữ ngay sau dấu phẩy phải là 'I'." }
        ],
        exercises: [
            { type: "multiple_choice", question: "Educators recommend that each learner _______ an active mistake notebook.", options: ["keeps", "keep", "kept", "keeping"], answer: "keep", explanationVi: "Cấu trúc Subjunctive trang trọng sau 'recommend that + S': động từ giữ nguyên mẫu không chia ('keep') bất kể chủ ngữ số ít." },
            { type: "multiple_choice", question: "_______ all required modules, she became eligible for the industry internship.", options: ["Completed", "Having completed", "Being completed", "To completed"], answer: "Having completed", explanationVi: "Chủ ngữ 'she' chủ động hoàn tất các môn học trước khi đủ điều kiện thực tập -> dùng phân từ hoàn thành chủ động 'Having completed'." }
        ]
    },
    {
        "id": "g-20",
        "topic": "Verbs",
        "title": "Gerunds & Infinitives — Danh động từ (V-ing) và Động từ nguyên mẫu (to-V / V-bare)",
        "level": "B1",
        "intro": "Phân biệt khi nào đi sau một động từ là V-ing, To-V hoặc V-bare, cùng các động từ đổi nghĩa khi đổi dạng.",
        "explanation": "1) V-ing (Gerunds): Đi sau giới từ (interested in learning), làm chủ ngữ (Learning English opens doors), hoặc sau các động từ: enjoy, avoid, practice, mind, suggest, admit, consider, postpone. 2) To-V (Infinitives): Đi sau các động từ diễn tả ý định, kỳ vọng, quyết định: want, decide, hope, plan, promise, offer, agree, afford, refuse, would like. 3) V-bare (Infinitive không 'to'): Sau động từ khuyết thiếu (can, should, must) và cấu trúc let/make/have someone do something. 4) Nhóm đổi nghĩa then chốt: remember/forget to-V (nhớ phải làm bổn phận) vs V-ing (nhớ đã làm trong quá khứ); stop to-V (dừng lại ĐỂ làm việc khác) vs stop V-ing (từ bỏ, dừng hẳn hành động đang làm); try to-V (cố gắng nỗ lực) vs try V-ing (thử nghiệm phương pháp mới).",
        "formula": "Verb + V-ing  •  Verb + to-V  •  make/let + O + V-bare",
        "examples": [
                {
                        "en": "I decided to practice speaking English every morning to improve my fluency.",
                        "vi": "Sau 'decide' bắt buộc dùng to-V ('to practice'); sau 'practice' bắt buộc dùng V-ing ('speaking')."
                },
                {
                        "en": "She stopped drinking coffee late at night because it ruined her sleep.",
                        "vi": "Cô ấy đã dừng hẳn việc uống cà phê ban đêm ('stop + V-ing')."
                },
                {
                        "en": "On the way to campus, he stopped to buy a bottle of water.",
                        "vi": "Trên đường đến trường, anh ấy dừng lại ĐỂ mua một chai nước ('stop + to-V')."
                }
        ],
        "commonMistakes": [
                {
                        "wrong": "I am looking forward to see you again.",
                        "correct": "I am looking forward to seeing you again.",
                        "why": "'Look forward to' có 'to' là một GIỚI TỪ (Preposition), do đó động từ đi sau bắt buộc phải ở dạng V-ing ('seeing')."
                },
                {
                        "wrong": "The professor made us to write a 10-page essay.",
                        "correct": "The professor made us write a 10-page essay.",
                        "why": "Cấu trúc 'make + someone + do something' dùng V-bare, không dùng 'to write'."
                }
        ],
        "exercises": [
                {
                        "type": "multiple_choice",
                        "question": "He avoided _______ the difficult question posed by the examiner.",
                        "options": [
                                "to answer",
                                "answering",
                                "answer",
                                "answered"
                        ],
                        "answer": "answering",
                        "explanationVi": "Động từ 'avoid' (tránh né) bắt buộc đi kèm Danh động từ V-ing -> 'answering'."
                },
                {
                        "type": "multiple_choice",
                        "question": "Don't forget _______ the assignment on Canvas before 23:59 tonight!",
                        "options": [
                                "submit",
                                "submitting",
                                "to submit",
                                "submitted"
                        ],
                        "answer": "to submit",
                        "explanationVi": "'Forget to do sth' nghĩa là quên phải thực hiện một bổn phận/nhiệm vụ trong tương lai -> 'to submit'."
                },
                {
                        "type": "fill_blank",
                        "question": "My mentor encouraged me _______ (apply) for the prestigious tech scholarship.",
                        "answer": "to apply",
                        "explanationVi": "Cấu trúc 'encourage someone to-V' (khuyến khích ai làm gì) -> 'to apply'."
                }
        ]
    },
    {
        "id": "g-21",
        "topic": "Verbs",
        "title": "Phrasal Verbs — Cụm động từ thiết yếu trong giao tiếp & học thuật",
        "level": "B2",
        "intro": "Cụm động từ kết hợp giữa Động từ + Giới từ / Trạng từ tạo ra nghĩa hoàn toàn mới khác với từ gốc.",
        "explanation": "Phrasal verbs là linh hồn của tiếng Anh tự nhiên. Được chia làm 2 loại chính: 1) Tách được (Separable): Khi tân ngữ là đại từ (it, them), đại từ BẮT BUỘC nằm ở giữa (Turn it on, fill it out, figure it out). 2) Không tách được (Inseparable): Tân ngữ luôn đứng sau giới từ (look after someone, run into a friend, come up with an idea). Trong văn phong học thuật, người viết thường chuộng từ vựng đơn tương đương trang trọng hơn (VD: look into -> investigate; bring about -> cause; put off -> postpone; figure out -> determine/solve), nhưng trong bài thi Speaking và giao tiếp thực tế, phrasal verbs lại giúp bạn đạt điểm Idiomatic Language rất cao!",
        "formula": "Verb + Preposition/Particle (+ Object)  •  Verb + Pronoun (it/them) + Particle",
        "examples": [
                {
                        "en": "Our research team came up with an innovative solution to reduce system latency.",
                        "vi": "'Come up with' nghĩa là nảy ra / đề xuất được một ý tưởng, giải pháp mới."
                },
                {
                        "en": "You should look up unfamiliar academic terminology in a reputable learner's dictionary.",
                        "vi": "'Look up' nghĩa là tra cứu thông tin (trong từ điển, sách vở, internet)."
                }
        ],
        "commonMistakes": [
                {
                        "wrong": "Please turn on it immediately.",
                        "correct": "Please turn it on immediately.",
                        "why": "Với phrasal verb tách được, khi tân ngữ là đại từ 'it' hoặc 'them', ta BẮT BUỘC phải đặt đại từ ở GIỮA ('turn it on')."
                },
                {
                        "wrong": "He carried on to talk even after the bell rang.",
                        "correct": "He carried on talking even after the bell rang.",
                        "why": "'Carry on' có 'on' là giới từ, nên động từ theo sau phải ở dạng V-ing ('talking')."
                }
        ],
        "exercises": [
                {
                        "type": "multiple_choice",
                        "question": "Because of the heavy storm, the committee decided to _______ the outdoor campus festival.",
                        "options": [
                                "call off",
                                "call in",
                                "call up",
                                "call for"
                        ],
                        "answer": "call off",
                        "explanationVi": "'Call off' là cụm động từ mang nghĩa hủy bỏ (cancel) một sự kiện đã lên lịch."
                },
                {
                        "type": "fill_blank",
                        "question": "It took our engineering team several days to _______ (figure) out the root cause of the server crash.",
                        "answer": "figure",
                        "explanationVi": "'Figure out' có nghĩa là tìm ra / hiểu được nguyên nhân hoặc lời giải cho một vấn đề."
                },
                {
                        "type": "multiple_choice",
                        "question": "I accidentally _______ my former high school English teacher at the airport.",
                        "options": [
                                "ran into",
                                "ran over",
                                "ran out of",
                                "ran through"
                        ],
                        "answer": "ran into",
                        "explanationVi": "'Run into someone' (hoặc 'bump into someone') nghĩa là tình cờ gặp lại ai đó mà không hẹn trước."
                }
        ]
    },
    {
        "id": "g-22",
        "topic": "Vocabulary",
        "title": "Collocations — Cụm từ cố định tự nhiên trong văn phong Anh ngữ",
        "level": "B2",
        "intro": "Sự kết hợp tự nhiên giữa các từ mà người bản xứ mặc định dùng chung, giúp bài viết và bài nói thoát khỏi cảm giác 'dịch word-by-word'.",
        "explanation": "Collocation là thói quen kết hợp từ ngữ. Nếu dùng sai, câu vẫn có thể hiểu được nhưng nghe rất gượng gạo hoặc kỳ quặc đối với người bản xứ. Các dạng collocation phổ biến: 1) Verb + Noun: make a decision (KHÔNG dùng 'do a decision'), do research (KHÔNG dùng 'make research'), take an exam (KHÔNG dùng 'make an exam'), give a presentation, conduct an experiment. 2) Adjective + Noun: heavy rain (KHÔNG dùng 'strong rain'), strong wind (KHÔNG dùng 'heavy wind'), valid reason, high priority. 3) Adverb + Adjective: bitterly disappointed (thất vọng cay đắng), highly recommended (được khuyên dùng nhiệt tình), deeply concerned (vô cùng lo ngại). Khi học một từ mới, hãy luôn ghi nhớ cả cụm đi kèm của nó!",
        "formula": "Verb + Noun  •  Adj + Noun  •  Adv + Adj  •  Noun + Noun",
        "examples": [
                {
                        "en": "University students must do extensive research before writing their graduation thesis.",
                        "vi": "Dùng đúng collocation 'do research' (nghiên cứu), tuyệt đối không dùng 'make research'."
                },
                {
                        "en": "The keynote speaker gave a very persuasive presentation on artificial intelligence.",
                        "vi": "Collocation 'give a presentation' (thuyết trình) và 'persuasive presentation' (bài thuyết trình thuyết phục)."
                }
        ],
        "commonMistakes": [
                {
                        "wrong": "I did a big mistake in my calculus final exam.",
                        "correct": "I made a big mistake in my calculus final exam.",
                        "why": "'Mistake' luôn kết hợp với động từ 'make' ('make a mistake'), không kết hợp với 'do'."
                },
                {
                        "wrong": "We got stuck on the highway due to strong traffic.",
                        "correct": "We got stuck on the highway due to heavy traffic.",
                        "why": "Để diễn tả tình trạng tắc đường, mật độ xe đông đúc, tiếng Anh chuẩn dùng 'heavy traffic', không dùng 'strong traffic'."
                }
        ],
        "exercises": [
                {
                        "type": "multiple_choice",
                        "question": "Before launching a new tech product, companies must _______ a comprehensive market survey.",
                        "options": [
                                "conduct",
                                "create",
                                "make",
                                "produce"
                        ],
                        "answer": "conduct",
                        "explanationVi": "Collocation học thuật chuẩn: 'conduct a survey / conduct an experiment' (tiến hành một cuộc khảo sát / thí nghiệm)."
                },
                {
                        "type": "fill_blank",
                        "question": "The software engineer _______ (made) a significant contribution to the open-source community.",
                        "answer": "made",
                        "explanationVi": "Collocation chuẩn: 'make a contribution to sth' (đóng góp đáng kể vào cái gì)."
                },
                {
                        "type": "multiple_choice",
                        "question": "I am _______ convinced that renewable energy is vital for our planet's future.",
                        "options": [
                                "firmly",
                                "strongly",
                                "hardly",
                                "heavily"
                        ],
                        "answer": "firmly",
                        "explanationVi": "Collocation chuẩn kết hợp với tính từ convinced (bị thuyết phục / tin chắc): 'firmly convinced' hoặc 'totally convinced'."
                }
        ]
    },
    {
        "id": "g-23",
        "topic": "Sentence Structures",
        "title": "Question Forms & Embedded Questions — Các dạng câu hỏi & Câu hỏi gián tiếp",
        "level": "A2",
        "intro": "Làm chủ cấu trúc câu hỏi trực tiếp (Yes/No, Wh-), câu hỏi đuôi (Tag questions) và câu hỏi gián tiếp lịch sự (Embedded questions).",
        "explanation": "1) Direct Questions: Trợ động từ (Auxiliary) đứng trước Chủ ngữ: 'Do you study IT?' • 'Where does she work?'. 2) Tag Questions (Câu hỏi đuôi): Vế trước khẳng định -> đuôi phủ định (You are a student, aren't you?); vế trước phủ định -> đuôi khẳng định (She doesn't like spicy food, does she?). Lưu ý đặc biệt: 'I am right, aren't I?' và 'Let's go, shall we?'. 3) Embedded Questions (Câu hỏi gián tiếp): Dùng khi muốn hỏi một cách lịch sự, trang trọng (Could you tell me...? • Do you know...? • I wonder...). QUY TẮC VÀNG: Trong câu hỏi gián tiếp, trật tự từ TRỞ LẠI DẠNG KHẲNG ĐỊNH (S + V), KHÔNG ĐẢO TRỢ ĐỘNG TỪ DO/DOES/DID RA TRƯỚC CHỦ NGỮ!",
        "formula": "Wh- + Aux + Subject + Verb?  •  Polite phrase + Wh-word/If + Subject + Verb",
        "examples": [
                {
                        "en": "Could you please tell me where the library is?",
                        "vi": "Câu hỏi gián tiếp lịch sự: 'where the library is' (S + is), KHÔNG đảo thành 'where is the library'."
                },
                {
                        "en": "I wonder if the professor has graded our midterm project.",
                        "vi": "Câu hỏi gián tiếp dạng Yes/No dùng liên từ 'if' hoặc 'whether' + S + V."
                }
        ],
        "commonMistakes": [
                {
                        "wrong": "Do you know what time does the lecture start?",
                        "correct": "Do you know what time the lecture starts?",
                        "why": "Trong câu hỏi gián tiếp sau 'Do you know', bỏ trợ động từ 'does' và chia động từ 'starts' theo chủ ngữ ngôi 3 số ít."
                },
                {
                        "wrong": "Everyone passed the exam, didn't he?",
                        "correct": "Everyone passed the exam, didn't they?",
                        "why": "Với các đại từ bất định chỉ người như everyone, everybody, someone, đại từ thay thế trong câu hỏi đuôi bắt buộc là 'they' -> 'didn't they?'"
                }
        ],
        "exercises": [
                {
                        "type": "multiple_choice",
                        "question": "Excuse me, could you let me know how much _______?",
                        "options": [
                                "does this textbook cost",
                                "this textbook costs",
                                "costs this textbook",
                                "is this textbook cost"
                        ],
                        "answer": "this textbook costs",
                        "explanationVi": "Sau 'could you let me know', mệnh đề là câu hỏi gián tiếp nên giữ trật tự S + V ('this textbook costs'), không dùng trợ động từ 'does'."
                },
                {
                        "type": "fill_blank",
                        "question": "You haven't finished compiling the source code yet, _______ (have) you?",
                        "answer": "have",
                        "explanationVi": "Vế trước dùng thì Hiện tại hoàn thành phủ định ('haven't finished') -> câu hỏi đuôi khẳng định dùng 'have you?'."
                },
                {
                        "type": "multiple_choice",
                        "question": "Neither of the proposals was approved by the board, _______?",
                        "options": [
                                "was it",
                                "were they",
                                "wasn't it",
                                "didn't they"
                        ],
                        "answer": "was it",
                        "explanationVi": "'Neither of + N' mang nghĩa phủ định (không phương án nào) và số ít ('was') -> câu hỏi đuôi dùng khẳng định 'was it?'."
                }
        ]
    }
];
