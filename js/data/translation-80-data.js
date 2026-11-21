/* ==========================================================================
   QEnglish — 80-Lesson Vietnamese-to-English Translation Writing Curriculum
   Levels: A1 (1–12), A2 (13–42), B1 (43–70), B2 (71–76), C1 (77–80)
   NOTE: sampleTranslation is strictly revealed ONLY AFTER the user submits!
   ========================================================================== */

const TRANSLATION_80_LESSONS = [
    /* ===================== A1: 1–12 (Nền tảng câu đơn) ===================== */
    {
        id: 1,
        level: "A1",
        title: "Giới Thiệu Bản Thân",
        grammarFocus: ["Động từ to be", "Hiện tại đơn", "Tính từ sở hữu"],
        vietnameseText: "Xin chào, tôi tên là Nam và tôi mười chín tuổi. Tôi là sinh viên năm nhất tại một trường đại học ở Thành phố Hồ Chí Minh. Tôi sống cùng anh trai trong một căn hộ nhỏ gần trường. Vào thời gian rảnh, tôi thích nghe nhạc và chơi cầu lông cùng bạn bè.",
        hints: [
            { en: "first-year student", vi: "sinh viên năm nhất" },
            { en: "apartment", vi: "căn hộ" },
            { en: "in my free time", vi: "vào thời gian rảnh" },
            { en: "badminton", vi: "cầu lông" }
        ],
        sampleTranslation: "Hello, my name is Nam, and I am nineteen years old. I am a first-year student at a university in Ho Chi Minh City. I live with my older brother in a small apartment near my school. In my free time, I like listening to music and playing badminton with my friends."
    },
    {
        id: 2,
        level: "A1",
        title: "Gia Đình Nhỏ Của Tôi",
        grammarFocus: ["There is / There are", "Hiện tại đơn", "Từ vựng nghề nghiệp"],
        vietnameseText: "Gia đình tôi có bốn người: bố, mẹ, em gái tôi và tôi. Bố tôi là kỹ sư và ông ấy làm việc rất chăm chỉ mỗi ngày. Mẹ tôi là giáo viên tiểu học ở gần nhà. Vào buổi tối, cả nhà tôi luôn ăn cơm cùng nhau và trò chuyện rất vui vẻ.",
        hints: [
            { en: "engineer", vi: "kỹ sư" },
            { en: "primary school teacher", vi: "giáo viên tiểu học" },
            { en: "hard-working / work hard", vi: "làm việc chăm chỉ" },
            { en: "have dinner together", vi: "ăn tối cùng nhau" }
        ],
        sampleTranslation: "There are four people in my family: my father, my mother, my younger sister, and me. My father is an engineer, and he works very hard every day. My mother teaches at a primary school near our house. In the evening, my whole family always has dinner together and talks happily."
    },
    {
        id: 3,
        level: "A1",
        title: "Một Ngày Bình Thường",
        grammarFocus: ["Hiện tại đơn", "Trạng từ tần suất", "Giới từ chỉ thời gian"],
        vietnameseText: "Mỗi sáng, tôi thường thức dậy lúc sáu giờ ba mươi. Sau khi đánh răng và rửa mặt, tôi ăn sáng nhanh rồi đi học bằng xe buýt. Buổi chiều, tôi học bài ở thư viện đến năm giờ. Buổi tối, tôi nấu bữa tối, xem một bộ phim ngắn và đi ngủ trước mười một giờ.",
        hints: [
            { en: "wake up", vi: "thức dậy" },
            { en: "brush my teeth", vi: "đánh răng" },
            { en: "by bus", vi: "bằng xe buýt" },
            { en: "go to bed", vi: "đi ngủ" }
        ],
        sampleTranslation: "Every morning, I usually wake up at 6:30. After brushing my teeth and washing my face, I eat a quick breakfast and go to school by bus. In the afternoon, I study at the library until five o'clock. In the evening, I cook dinner, watch a short movie, and go to bed before eleven."
    },
    {
        id: 4,
        level: "A1",
        title: "Căn Phòng Của Tôi",
        grammarFocus: ["There is / There are", "Giới từ vị trí", "Mạo từ a / an / the"],
        vietnameseText: "Phòng ngủ của tôi không lớn lắm nhưng rất sáng và gọn gàng. Có một chiếc giường gỗ ở góc phòng và một bàn học đặt ngay cạnh cửa sổ. Trên bàn có chiếc máy tính xách tay, vài quyển vở và một chiếc đèn nhỏ. Tôi rất thích học bài trong căn phòng này vì nó yên tĩnh.",
        hints: [
            { en: "neat / tidy", vi: "gọn gàng" },
            { en: "in the corner", vi: "ở góc phòng" },
            { en: "next to the window", vi: "ngay cạnh cửa sổ" },
            { en: "small lamp", vi: "đèn nhỏ" }
        ],
        sampleTranslation: "My bedroom is not very big, but it is bright and tidy. There is a wooden bed in the corner of the room and a study desk right next to the window. On the desk, there is a laptop, a few notebooks, and a small lamp. I really like studying in this room because it is quiet."
    },
    {
        id: 5,
        level: "A1",
        title: "Bữa Sáng Yêu Thích",
        grammarFocus: ["So sánh nhất", "Danh từ đếm được & không đếm được", "Hiện tại đơn"],
        vietnameseText: "Tôi nghĩ bữa sáng là bữa ăn quan trọng nhất trong ngày. Vào các ngày trong tuần, tôi thường ăn bánh mì trứng và uống một ly sữa ấm. Cuối tuần, mẹ tôi hay nấu phở bò cho cả gia đình. Món ăn nóng hổi và thơm ngon giúp tôi có nhiều năng lượng cho cả buổi sáng.",
        hints: [
            { en: "on weekdays", vi: "vào các ngày trong tuần" },
            { en: "warm milk", vi: "sữa ấm" },
            { en: "beef noodle soup", vi: "phở bò" },
            { en: "energy", vi: "năng lượng" }
        ],
        sampleTranslation: "I think breakfast is the most important meal of the day. On weekdays, I usually eat bread with eggs and drink a glass of warm milk. On weekends, my mother often cooks beef noodle soup for the whole family. A hot and delicious meal gives me plenty of energy for the whole morning."
    },
    {
        id: 6,
        level: "A1",
        title: "Thời Tiết Hôm Nay",
        grammarFocus: ["Chủ ngữ giả It", "Hiện tại tiếp diễn", "Tính từ thời tiết"],
        vietnameseText: "Hôm nay trời nắng nhẹ và khá mát mẻ. Bầu trời trong xanh và có vài đám mây trắng trôi chậm. Mọi người đang đi dạo trong công viên và trẻ em đang chơi đùa trên bãi cỏ. Tôi mặc một chiếc áo phông mỏng và mang theo mũ vì buổi trưa trời có thể nóng hơn.",
        hints: [
            { en: "sunny and cool", vi: "nắng nhẹ và mát mẻ" },
            { en: "take a walk", vi: "đi dạo" },
            { en: "on the grass", vi: "trên bãi cỏ" },
            { en: "light T-shirt", vi: "áo phông mỏng" }
        ],
        sampleTranslation: "Today it is mildly sunny and quite cool. The sky is clear blue, and a few white clouds are drifting slowly. People are taking a walk in the park, and children are playing on the grass. I am wearing a light T-shirt and carrying a hat because it may get hotter at noon."
    },
    {
        id: 7,
        level: "A1",
        title: "Cuối Tuần Ở Nhà",
        grammarFocus: ["Hiện tại đơn", "Liên từ and / but / or", "Trạng từ tần suất"],
        vietnameseText: "Tôi rất mong chờ ngày Chủ nhật vì tôi không phải đi học. Sáng Chủ nhật, tôi ngủ thêm một chút rồi dọn dẹp phòng và giặt quần áo. Buổi chiều, tôi giúp mẹ tưới cây ngoài ban công hoặc đọc truyện tranh. Cuối tuần yên bình giúp tôi cảm thấy thoải mái hơn cho tuần mới.",
        hints: [
            { en: "look forward to", vi: "mong chờ" },
            { en: "do the laundry", vi: "giặt quần áo" },
            { en: "water the plants", vi: "tưới cây" },
            { en: "balcony", vi: "ban công" }
        ],
        sampleTranslation: "I really look forward to Sunday because I do not have to go to school. On Sunday morning, I sleep in a little, then clean my room and do the laundry. In the afternoon, I help my mother water the plants on the balcony or read comic books. A peaceful weekend helps me feel refreshed for the new week."
    },
    {
        id: 8,
        level: "A1",
        title: "Lớp Học Tiếng Anh",
        grammarFocus: ["Can / Can't", "Hiện tại đơn", "Cụm từ lớp học"],
        vietnameseText: "Lớp học tiếng Anh của tôi có mười lăm học viên và một cô giáo rất thân thiện. Chúng tôi học ba buổi mỗi tuần vào thứ Hai, thứ Tư và thứ Sáu. Trong lớp, mọi người có thể luyện nói theo cặp và đặt câu hỏi thoải mái. Tôi còn yếu phần nghe, nhưng tôi đang cố gắng luyện tập mỗi ngày.",
        hints: [
            { en: "friendly", vi: "thân thiện" },
            { en: "three times a week", vi: "ba buổi mỗi tuần" },
            { en: "in pairs", vi: "theo cặp" },
            { en: "weak at listening", vi: "yếu phần nghe" }
        ],
        sampleTranslation: "My English class has fifteen students and a very friendly teacher. We study three times a week on Monday, Wednesday, and Friday. In class, everyone can practice speaking in pairs and ask questions freely. I am still weak at listening, but I am trying to practice every day."
    },
    {
        id: 9,
        level: "A1",
        title: "Đi Chợ Cùng Mẹ",
        grammarFocus: ["Hiện tại đơn", "Trạng từ tần suất", "Danh từ thực phẩm"],
        vietnameseText: "Sáng thứ Bảy, tôi thường đi chợ gần nhà cùng mẹ. Khu chợ luôn đông đúc và nhộn nhịp ngay từ bảy giờ sáng. Mẹ tôi mua rau xanh, cà chua, cá tươi và một ít trái cây ngọt. Tôi giúp mẹ xách túi đồ nặng và học cách chọn thực phẩm tươi ngon.",
        hints: [
            { en: "crowded and lively", vi: "đông đúc và nhộn nhịp" },
            { en: "fresh fish", vi: "cá tươi" },
            { en: "carry heavy bags", vi: "xách túi đồ nặng" },
            { en: "choose fresh food", vi: "chọn thực phẩm tươi" }
        ],
        sampleTranslation: "On Saturday mornings, I usually go to the local market with my mother. The market is always crowded and lively as early as seven in the morning. My mother buys green vegetables, tomatoes, fresh fish, and some sweet fruit. I help her carry the heavy bags and learn how to choose fresh ingredients."
    },
    {
        id: 10,
        level: "A1",
        title: "Thú Cưng Trong Nhà",
        grammarFocus: ["Have / Has", "Tính từ miêu tả", "Hiện tại đơn"],
        vietnameseText: "Nhà tôi nuôi một chú mèo nhỏ có bộ lông màu vàng trắng rất mềm. Chúng tôi gọi nó là Mướp vì nó rất lanh lợi và dễ thương. Ban ngày, Mướp thường nằm ngủ gần cửa sổ nơi có ánh nắng ấm. Mỗi khi tôi đi học về, nó đều chạy ra cửa đón tôi ngay lập tức.",
        hints: [
            { en: "soft fur", vi: "bộ lông mềm" },
            { en: "clever / playful", vi: "lanh lợi" },
            { en: "warm sunlight", vi: "ánh nắng ấm" },
            { en: "greet me at the door", vi: "ra cửa đón tôi" }
        ],
        sampleTranslation: "My family has a little cat with very soft yellow and white fur. We call him Muop because he is clever and cute. During the day, Muop usually sleeps near the window where there is warm sunlight. Whenever I come home from school, he runs to the door to greet me right away."
    },
    {
        id: 11,
        level: "A1",
        title: "Quán Cà Phê Gần Trường",
        grammarFocus: ["There is / There are", "Tính từ miêu tả", "Giới từ chỉ nơi chốn"],
        vietnameseText: "Đối diện cổng trường tôi có một quán cà phê nhỏ rất đẹp. Không gian bên trong ấm cúng với nhiều cây xanh và nhạc nhẹ nhàng. Đồ uống ở đây không đắt, và món trà đào của quán rất ngon. Tôi và bạn cùng lớp hay ngồi ở tầng hai để làm bài tập nhóm.",
        hints: [
            { en: "across from / opposite", vi: "đối diện" },
            { en: "cozy atmosphere", vi: "không gian ấm cúng" },
            { en: "peach tea", vi: "trà đào" },
            { en: "second floor", vi: "tầng hai" }
        ],
        sampleTranslation: "Across from my school gate, there is a very nice little coffee shop. The space inside is cozy with many green plants and soft music. The drinks here are not expensive, and their peach tea is delicious. My classmates and I often sit on the second floor to do group assignments."
    },
    {
        id: 12,
        level: "A1",
        title: "Kế Hoạch Tối Nay",
        grammarFocus: ["Be going to & Will", "Câu điều kiện loại 1 cơ bản", "Trình tự thời gian"],
        vietnameseText: "Tối nay tôi không có bài kiểm tra nên tôi định về nhà sớm. Đầu tiên, tôi sẽ nấu món mì xào trứng cho bữa tối. Sau đó, tôi sẽ ôn lại hai mươi từ vựng tiếng Anh mới học trong tuần này. Nếu xong sớm, tôi sẽ gọi điện hỏi thăm ông bà ở quê.",
        hints: [
            { en: "fried noodles", vi: "mì xào" },
            { en: "review vocabulary", vi: "ôn lại từ vựng" },
            { en: "finish early", vi: "xong sớm" },
            { en: "grandparents", vi: "ông bà" }
        ],
        sampleTranslation: "I do not have a test tonight, so I am going to go home early. First, I am going to cook fried noodles with eggs for dinner. After that, I will review twenty new English words I learned this week. If I finish early, I will call my grandparents in my hometown to check on them."
    },

    /* ===================== A2: 13–42 (Sơ trung cấp, kể chuyện) ===================== */
    {
        id: 13,
        level: "A2",
        title: "Người Bạn Thân Từ Nhỏ",
        grammarFocus: ["Quá khứ đơn", "Tính từ miêu tả", "Liên từ"],
        vietnameseText: "Ngày nhỏ, tôi có một người bạn thân tên là Minh. Chúng tôi học cùng trường và thường chơi với nhau sau giờ học. Minh là người vui vẻ, tốt bụng và luôn sẵn sàng giúp đỡ mọi người. Vào những ngày cuối tuần, hai đứa thường đạp xe quanh công viên gần nhà và nói đủ thứ chuyện trên đời. Dù bây giờ mỗi người sống ở một thành phố khác nhau, chúng tôi vẫn giữ liên lạc thường xuyên.",
        hints: [
            { en: "close friend", vi: "bạn thân" },
            { en: "cheerful", vi: "vui vẻ" },
            { en: "kind", vi: "tốt bụng" },
            { en: "after school", vi: "sau giờ học" },
            { en: "keep in touch", vi: "giữ liên lạc" }
        ],
        sampleTranslation: "When I was young, I had a close friend named Minh. We went to the same school and often played together after school. Minh was cheerful, kind, and always willing to help everyone. On weekends, the two of us usually rode our bikes around the park near our house and talked about all kinds of things. Although we now live in different cities, we still keep in touch regularly."
    },
    {
        id: 14,
        level: "A2",
        title: "Chuyến Đi Biển Mùa Hè",
        grammarFocus: ["Quá khứ đơn", "Trạng từ chỉ thời gian", "Tính từ miêu tả trải nghiệm"],
        vietnameseText: "Mùa hè năm ngoái, gia đình tôi đã đi du lịch Nha Trang trong ba ngày. Chúng tôi dậy rất sớm vào buổi sáng đầu tiên để ngắm mặt trời mọc trên biển. Nước biển trong xanh và mát lạnh khiến tôi thích thú vô cùng. Buổi tối, cả nhà đi dạo dọc bờ biển và thưởng thức hải sản nướng tại một quán ăn địa phương. Đó thực sự là một kỳ nghỉ đáng nhớ đối với tôi.",
        hints: [
            { en: "watch the sunrise", vi: "ngắm mặt trời mọc" },
            { en: "crystal clear", vi: "trong xanh" },
            { en: "grilled seafood", vi: "hải sản nướng" },
            { en: "memorable vacation", vi: "kỳ nghỉ đáng nhớ" }
        ],
        sampleTranslation: "Last summer, my family went on a three-day trip to Nha Trang. We woke up very early on the first morning to watch the sunrise over the sea. The seawater was crystal clear and cool, which made me extremely excited. In the evening, we strolled along the beach and enjoyed grilled seafood at a local restaurant. It was truly a memorable vacation for me."
    },
    {
        id: 15,
        level: "A2",
        title: "Lần Đầu Học Lái Xe Máy",
        grammarFocus: ["Quá khứ đơn", "Tính từ đuôi -ed / -ing", "Because / So"],
        vietnameseText: "Năm mười tám tuổi, bố đã dạy tôi cách lái xe máy ở một con đường vắng gần nhà. Lúc mới ngồi lên xe, tôi rất lo lắng vì sợ giữ thăng bằng không tốt. Trong mười phút đầu, tay lái của tôi hơi run và xe đi khá chậm. Nhờ bố kiên nhẫn hướng dẫn từng bước, tôi dần trở nên tự tin hơn. Sau ba buổi tập, tôi đã có thể tự lái xe an toàn và cảm thấy rất tự hào.",
        hints: [
            { en: "quiet road", vi: "con đường vắng" },
            { en: "keep my balance", vi: "giữ thăng bằng" },
            { en: "patiently", vi: "kiên nhẫn" },
            { en: "feel proud", vi: "cảm thấy tự hào" }
        ],
        sampleTranslation: "When I turned eighteen, my father taught me how to ride a motorbike on a quiet road near our house. When I first got on the bike, I was very nervous because I was afraid of losing my balance. During the first ten minutes, my hands trembled slightly and the bike moved quite slowly. Thanks to my father's patient step-by-step guidance, I gradually became more confident. After three practice sessions, I could ride safely on my own and felt very proud."
    },
    {
        id: 16,
        level: "A2",
        title: "Bữa Tối Sinh Nhật Bất Ngờ",
        grammarFocus: ["Quá khứ đơn & Quá khứ tiếp diễn", "When / While", "Cụm động từ cơ bản"],
        vietnameseText: "Tuần trước là sinh nhật lần thứ hai mươi của tôi, và tôi nghĩ hôm đó chỉ là một ngày bình thường. Khi tôi mở cửa phòng trọ sau giờ học tối, đèn bên trong đều tắt tối om. Bất ngờ, bốn người bạn thân bật đèn lên và đồng thanh hát chúc mừng sinh nhật. Họ đã bí mật chuẩn bị một chiếc bánh kem nhỏ và vài món ăn tôi thích nhất. Tôi xúc động đến mức không nói nên lời trong vài giây.",
        hints: [
            { en: "rented room", vi: "phòng trọ" },
            { en: "pitch dark", vi: "tối om" },
            { en: "in unison", vi: "đồng thanh" },
            { en: "touched / moved", vi: "xúc động" }
        ],
        sampleTranslation: "Last week was my twentieth birthday, and I thought it would just be an ordinary day. When I opened the door to my rented room after evening class, all the lights inside were turned off. Suddenly, four of my close friends switched on the lights and sang Happy Birthday in unison. They had secretly prepared a small birthday cake and a few of my favorite dishes. I was so touched that I was speechless for a few seconds."
    },
    {
        id: 17,
        level: "A2",
        title: "Ngày Đầu Tiên Vào Đại Học",
        grammarFocus: ["Quá khứ đơn", "So sánh hơn", "Cấu trúc It took + O + time + to V"],
        vietnameseText: "Ngày đầu tiên bước vào giảng đường đại học, tôi vừa hồi hộp vừa háo hức. Khuôn viên trường rộng hơn trường cấp ba của tôi rất nhiều nên tôi mất khá lâu để tìm đúng phòng học. Trong tiết học đầu tiên, giảng viên giới thiệu cách học chủ động và yêu cầu chúng tôi làm quen với người ngồi cạnh. Nhờ vậy, tôi đã kết bạn được với hai bạn cùng quê ngay trong buổi sáng hôm đó. Cuối ngày, mọi lo lắng ban đầu của tôi gần như biến mất.",
        hints: [
            { en: "lecture hall / campus", vi: "giảng đường / khuôn viên trường" },
            { en: "active learning", vi: "học chủ động" },
            { en: "from the same hometown", vi: "cùng quê" },
            { en: "disappear", vi: "biến mất" }
        ],
        sampleTranslation: "On my first day stepping into the university campus, I felt both nervous and excited. The campus was much larger than my high school, so it took me quite a while to find the right classroom. During the first class, the lecturer introduced active learning and asked us to get to know the person sitting next to us. Because of that, I made friends with two students from my hometown that very morning. By the end of the day, almost all of my initial worries had disappeared."
    },
    {
        id: 18,
        level: "A2",
        title: "Kỷ Niệm Mưa Bất Chợt",
        grammarFocus: ["Quá khứ tiếp diễn & Quá khứ đơn", "While / When", "Mạo từ"],
        vietnameseText: "Chiều thứ Năm tuần trước, khi tôi đang đi bộ từ thư viện về nhà thì trời đột nhiên đổ mưa to. Tôi không mang theo áo mưa hay ô vì buổi sáng trời vẫn nắng đẹp. Tôi đành chạy nhanh vào trú dưới mái hiên một tiệm sách cũ ven đường. Trong lúc chờ mưa tạnh, tôi bắt chuyện với chú chủ tiệm và được mời một tách trà gừng nóng. Cơn mưa bất chợt lại mang đến cho tôi một kỷ niệm thật ấm áp.",
        hints: [
            { en: "pour down / rain heavily", vi: "đổ mưa to" },
            { en: "take shelter", vi: "trú mưa" },
            { en: "porch / awning", vi: "mái hiên" },
            { en: "ginger tea", vi: "trà gừng" }
        ],
        sampleTranslation: "Last Thursday afternoon, while I was walking home from the library, it suddenly began to rain heavily. I had not brought a raincoat or an umbrella because it had been sunny that morning. I had to run quickly to take shelter under the awning of an old bookstore along the street. While waiting for the rain to stop, I chatted with the shop owner and was offered a cup of hot ginger tea. That unexpected shower ended up giving me a truly warm memory."
    },
    {
        id: 19,
        level: "A2",
        title: "Thói Quen Đọc Sách Trước Khi Ngủ",
        grammarFocus: ["Used to", "Quá khứ đơn & Hiện tại đơn", "So sánh hơn"],
        vietnameseText: "Trước đây, tôi thường lướt điện thoại hơn một tiếng mỗi tối trước khi đi ngủ. Điều đó khiến mắt tôi mỏi và tôi thường xuyên khó ngủ. Hai tháng trước, tôi quyết định đặt điện thoại ra xa giường và đọc mười trang sách mỗi đêm. Ban đầu việc này khá khó, nhưng dần dần tôi bắt đầu yêu thích khoảng thời gian yên tĩnh đó. Giờ đây, tôi ngủ sâu hơn và học thêm được nhiều kiến thức thú vị.",
        hints: [
            { en: "scroll through my phone", vi: "lướt điện thoại" },
            { en: "have trouble sleeping", vi: "khó ngủ" },
            { en: "gradually", vi: "dần dần" },
            { en: "sleep more soundly", vi: "ngủ sâu hơn" }
        ],
        sampleTranslation: "In the past, I used to scroll through my phone for over an hour every night before going to bed. That made my eyes tired, and I frequently had trouble sleeping. Two months ago, I decided to put my phone away from my bed and read ten pages of a book each night. At first, it was quite difficult, but gradually I began to love that quiet time. Now, I sleep more soundly and gain a lot of interesting knowledge."
    },
    {
        id: 20,
        level: "A2",
        title: "Một Lần Bị Lạc Đường",
        grammarFocus: ["Quá khứ đơn", "Câu gián tiếp đơn giản (asked for directions)", "Giới từ chỉ phương hướng"],
        vietnameseText: "Tháng trước, tôi đến một quận mới để tham gia một buổi hội thảo tiếng Anh. Điện thoại của tôi bất ngờ hết pin ngay khi tôi vừa xuống trạm xe buýt. Tôi đi bộ rẽ nhầm vào một con hẻm nhỏ và nhận ra mình đã bị lạc. May mắn thay, một cô bán hàng gần đó đã nhiệt tình chỉ đường cho tôi đi thẳng hai ngã tư rồi rẽ trái. Nhờ cô ấy, tôi đến hội thảo đúng giờ và tự nhủ sẽ luôn mang theo sạc dự phòng.",
        hints: [
            { en: "run out of battery", vi: "hết pin" },
            { en: "get lost", vi: "bị lạc" },
            { en: "intersection / crossroads", vi: "ngã tư" },
            { en: "power bank", vi: "sạc dự phòng" }
        ],
        sampleTranslation: "Last month, I went to a new district to attend an English workshop. My phone suddenly ran out of battery right after I got off at the bus stop. I walked into the wrong alley and realized that I was lost. Fortunately, a nearby shopkeeper kindly told me to go straight past two intersections and then turn left. Thanks to her, I arrived at the workshop on time and reminded myself to always carry a power bank."
    },
    {
        id: 21,
        level: "A2",
        title: "Trải Nghiệm Nấu Ăn Lần Đầu",
        grammarFocus: ["Quá khứ đơn", "Trạng từ chỉ thứ tự (First, Then, Finally)", "Too / Enough"],
        vietnameseText: "Cuối tuần rồi, tôi quyết định tự nấu món thịt kho trứng theo công thức trên mạng. Đầu tiên, tôi rửa sạch nguyên liệu và ướp thịt với gia vị trong hai mươi phút. Khi bắt đầu đun, tôi để lửa hơi lớn nên nước sốt cạn nhanh hơn dự kiến. Tôi vội giảm lửa nhỏ và thêm một chút nước ấm để món ăn không bị cháy. Dù vị hơi mặn một chút, bạn cùng phòng tôi vẫn khen ngon và ăn hết sạch.",
        hints: [
            { en: "recipe", vi: "công thức nấu ăn" },
            { en: "marinate", vi: "ướp" },
            { en: "turn down the heat", vi: "giảm lửa nhỏ" },
            { en: "a bit salty", vi: "hơi mặn một chút" }
        ],
        sampleTranslation: "Last weekend, I decided to cook braised pork with eggs by myself following an online recipe. First, I washed the ingredients and marinated the meat with seasonings for twenty minutes. When I started cooking, I set the heat too high, so the sauce reduced faster than expected. I quickly turned down the heat and added a little warm water to keep the dish from burning. Although it was slightly salty, my roommate still praised it and ate everything."
    },
    {
        id: 22,
        level: "A2",
        title: "Chuyến Về Quê Dịp Tết",
        grammarFocus: ["Quá khứ đơn", "Động từ nguyên mẫu chỉ mục đích (to V)", "Từ vựng truyền thống"],
        vietnameseText: "Dịp Tết vừa rồi, tôi bắt chuyến tàu đêm để về quê sum họp cùng gia đình. Trên tàu rất đông người, ai cũng mang theo quà và nét mặt rạng rỡ. Khi về đến nhà, tôi cùng bố lau dọn bàn thờ và gói bánh chưng ngoài sân với ông bà. Đêm giao thừa, cả nhà quây quần xem pháo hoa và chúc nhau một năm mới bình an. Những ngày ở quê luôn nhắc tôi nhớ rằng gia đình là điều quý giá nhất.",
        hints: [
            { en: "reunite with family", vi: "sum họp cùng gia đình" },
            { en: "New Year's Eve", vi: "đêm giao thừa" },
            { en: "gather together", vi: "quây quần" },
            { en: "precious", vi: "quý giá" }
        ],
        sampleTranslation: "During the last Tet holiday, I took an overnight train back to my hometown to reunite with my family. The train was packed, and everyone carried gifts with bright smiles on their faces. Once I arrived home, I helped my father clean the altar and wrapped banh chung in the yard with my grandparents. On New Year's Eve, the whole family gathered to watch fireworks and wish each other a peaceful new year. Those days at home always remind me that family is the most precious thing."
    },
    {
        id: 23,
        level: "A2",
        title: "Cuộc Gọi Điện Thoại Đường Dài",
        grammarFocus: ["Hiện tại hoàn thành", "Quá khứ đơn", "Động từ chỉ cảm xúc"],
        vietnameseText: "Tối qua, tôi đã gọi video cho chị gái đang học thạc sĩ ở Nhật Bản. Chúng tôi chưa gặp nhau trực tiếp suốt hơn một năm nay nên cả hai có rất nhiều chuyện để kể. Chị kể rằng thời tiết bên đó đang rất lạnh nhưng bạn bè trong lớp lại vô cùng ấm áp. Tôi chia sẻ với chị về kết quả học kỳ vừa qua và kế hoạch luyện thi tiếng Anh sắp tới. Cuộc gọi kéo dài gần một tiếng nhưng vẫn khiến tôi cảm thấy như mới vài phút.",
        hints: [
            { en: "master's degree", vi: "bằng thạc sĩ" },
            { en: "in person", vi: "trực tiếp" },
            { en: "last for nearly an hour", vi: "kéo dài gần một tiếng" },
            { en: "upcoming exam", vi: "kỳ thi sắp tới" }
        ],
        sampleTranslation: "Last night, I made a video call to my older sister, who is pursuing a master's degree in Japan. We have not seen each other in person for over a year, so we both had so much to share. She told me that the weather there is freezing, yet her classmates are wonderfully warm and welcoming. I shared my last semester's results and my upcoming English exam plans with her. The call lasted nearly an hour, but it felt like only a few minutes."
    },
    {
        id: 24,
        level: "A2",
        title: "Buổi Phỏng Vấn Việc Làm Thêm",
        grammarFocus: ["Quá khứ đơn", "Động từ khuyết thiếu could / had to", "Từ vựng công việc"],
        vietnameseText: "Sáng thứ Ba, tôi đi phỏng vấn xin làm nhân viên phục vụ bán thời gian tại một tiệm bánh. Tôi chuẩn bị hồ sơ cẩn thận và đến sớm hơn giờ hẹn mười lăm phút. Người quản lý hỏi tôi về lịch học ở trường và kinh nghiệm giao tiếp với khách hàng. Dù chưa từng làm công việc này trước đây, tôi trả lời thành thật rằng tôi học rất nhanh và luôn đúng giờ. Chiều hôm đó, tôi nhận được tin nhắn báo trúng tuyển và vui suốt cả tối.",
        hints: [
            { en: "part-time", vi: "bán thời gian" },
            { en: "arrive early", vi: "đến sớm" },
            { en: "honestly", vi: "thành thật" },
            { en: "get accepted / hired", vi: "trúng tuyển" }
        ],
        sampleTranslation: "On Tuesday morning, I went for an interview for a part-time server position at a bakery. I prepared my resume carefully and arrived fifteen minutes ahead of schedule. The manager asked me about my school timetable and my experience dealing with customers. Although I had never done this job before, I answered honestly that I learn quickly and am always punctual. That afternoon, I received a message saying I got the job, and I was thrilled all evening."
    },
    {
        id: 25,
        level: "A2",
        title: "Ngày Mất Điện Mùa Hè",
        grammarFocus: ["Quá khứ tiếp diễn & Quá khứ đơn", "Without + N/V-ing", "So sánh"],
        vietnameseText: "Giữa tháng Năm, khu phố tôi bị mất điện từ hai giờ chiều đến tận tám giờ tối. Trời nóng nực, không có quạt hay wifi nên ai cũng thấy bất tiện. Thay vì ngồi trong nhà than phiền, hàng xóm quanh xóm đều mang ghế ra sân trước hóng gió. Trẻ con chơi nhảy dây còn người lớn kể lại những câu chuyện ngày xưa dưới ánh đèn pin. Nhờ buổi tối mất điện ấy, mọi người trong xóm lại có dịp trò chuyện gần gũi hơn.",
        hints: [
            { en: "power outage / power cut", vi: "mất điện" },
            { en: "inconvenient", vi: "bất tiện" },
            { en: "complain", vi: "than phiền" },
            { en: "flashlight", vi: "đèn pin" }
        ],
        sampleTranslation: "In mid-May, my neighborhood had a power outage from two in the afternoon until eight in the evening. It was sweltering, and without fans or Wi-Fi, everyone felt uncomfortable. Instead of staying indoors complaining, the neighbors brought chairs out to the front yard to catch a breeze. The children played jump rope while the adults shared stories from the old days by flashlight. Thanks to that evening without electricity, everyone in the neighborhood got a chance to chat and grow closer."
    },
    {
        id: 26,
        level: "A2",
        title: "Người Hàng Xóm Tốt Bụng",
        grammarFocus: ["Hiện tại đơn & Quá khứ đơn", "Đại từ quan hệ who", "Tính từ miêu tả tính cách"],
        vietnameseText: "Bác Hùng, người sống ngay cạnh nhà tôi, là một người hàng xóm vô cùng chu đáo. Bác đã nghỉ hưu năm ngoái và thường chăm sóc một vườn rau nhỏ trước cửa. Mỗi khi thu hoạch được nhiều rau sạch, bác đều mang sang biếu gia đình tôi một ít. Có lần tôi quên chìa khóa ở trường, bác đã cho tôi sang nhà ngồi chờ bố mẹ về và còn nấu mì cho tôi ăn. Tôi luôn kính trọng sự chân thành và tấm lòng tốt bụng của bác.",
        hints: [
            { en: "thoughtful / considerate", vi: "chu đáo" },
            { en: "retired", vi: "nghỉ hưu" },
            { en: "harvest", vi: "thu hoạch" },
            { en: "sincerity", vi: "sự chân thành" }
        ],
        sampleTranslation: "Uncle Hung, who lives right next door to us, is an extraordinarily thoughtful neighbor. He retired last year and usually tends a small vegetable garden in front of his house. Whenever he harvests plenty of fresh vegetables, he brings some over as a gift for my family. Once, when I left my keys at school, he let me wait at his house for my parents and even cooked noodles for me. I always respect his sincerity and kind heart."
    },
    {
        id: 27,
        level: "A2",
        title: "Thử Thách Chạy Bộ 30 Ngày",
        grammarFocus: ["Hiện tại hoàn thành", "Quá khứ đơn", "So sánh hơn"],
        vietnameseText: "Đầu tháng này, tôi tham gia thử thách chạy bộ hai cây số mỗi sáng cùng câu lạc bộ thể thao của trường. Ba ngày đầu tiên, chân tôi đau nhức và tôi chỉ muốn bỏ cuộc để ngủ tiếp. Tuy nhiên, thấy các bạn vẫn kiên trì điểm danh mỗi sáng, tôi tự động viên mình không được dừng lại. Sau hai tuần, tôi thở đều hơn và không còn thấy mệt mỏi như trước nữa. Đến nay, tôi đã chạy được hai mươi ngày liên tiếp và cảm thấy cơ thể khỏe khoắn hơn hẳn.",
        hints: [
            { en: "sore legs", vi: "đau nhức chân" },
            { en: "give up", vi: "bỏ cuộc" },
            { en: "encourage myself", vi: "tự động viên mình" },
            { en: "in a row / consecutively", vi: "liên tiếp" }
        ],
        sampleTranslation: "Earlier this month, I joined a challenge to run two kilometers every morning with my school's sports club. During the first three days, my legs were sore and I just wanted to give up and keep sleeping. However, seeing my friends consistently checking in each morning, I encouraged myself not to quit. After two weeks, my breathing became steadier and I no longer felt as exhausted as before. So far, I have run for twenty days in a row and feel much healthier."
    },
    {
        id: 28,
        level: "A2",
        title: "Một Buổi Xem Phim Cuối Tuần",
        grammarFocus: ["Quá khứ đơn", "Although / Even though", "Từ vựng giải trí"],
        vietnameseText: "Tối thứ Sáu tuần trước, tôi cùng hai người bạn ra rạp xem một bộ phim hoạt hình mới ra mắt. Chúng tôi đặt vé trực tuyến từ sớm để chọn được hàng ghế giữa có góc nhìn đẹp nhất. Mặc dù rạp chiếu phim khá đông, mọi người đều giữ trật tự nên trải nghiệm xem rất dễ chịu. Bộ phim có hình ảnh sống động, âm nhạc cảm động và câu chuyện ý nghĩa về tình gia đình. Sau khi phim kết thúc, chúng tôi ngồi bàn luận về nhân vật mình yêu thích suốt đường về.",
        hints: [
            { en: "newly released", vi: "mới ra mắt" },
            { en: "book tickets online", vi: "đặt vé trực tuyến" },
            { en: "vivid visuals", vi: "hình ảnh sống động" },
            { en: "discuss", vi: "bàn luận" }
        ],
        sampleTranslation: "Last Friday evening, I went to the cinema with two friends to watch a newly released animated movie. We booked our tickets online early to get seats in the middle row with the best view. Although the theater was quite crowded, everyone stayed quiet, making the viewing experience very pleasant. The film featured vivid visuals, touching music, and a meaningful story about family love. After the movie ended, we discussed our favorite characters all the way home."
    },
    {
        id: 29,
        level: "A2",
        title: "Món Quà Khiến Tôi Nhớ Mãi",
        grammarFocus: ["Quá khứ đơn", "Mệnh đề quan hệ which / that", "Hiện tại hoàn thành"],
        vietnameseText: "Khi tôi đỗ đại học, ông nội đã tặng tôi một chiếc đồng hồ đeo tay đơn giản nhưng rất bền. Ông nói rằng thời gian là thứ không bao giờ quay trở lại nên cháu phải biết trân trọng từng phút giây. Chiếc đồng hồ đó không phải hàng đắt tiền, nhưng đối với tôi nó mang giá trị tinh thần rất lớn. Mỗi lần nhìn xuống cổ tay trước giờ học hay kỳ thi, tôi lại nhớ đến lời dặn của ông. Suốt hai năm qua, tôi vẫn đeo nó hằng ngày và giữ gìn cẩn thận.",
        hints: [
            { en: "pass the university entrance exam", vi: "đỗ đại học" },
            { en: "durable", vi: "bền" },
            { en: "cherish / value", vi: "trân trọng" },
            { en: "sentimental value", vi: "giá trị tinh thần" }
        ],
        sampleTranslation: "When I got into university, my grandfather gave me a simple yet very durable wristwatch. He told me that time never comes back, so I must learn to value every single minute. That watch is not an expensive brand, yet it holds immense sentimental value for me. Every time I glance at my wrist before a class or an exam, I remember his advice. Over the past two years, I have worn it every day and taken good care of it."
    },
    {
        id: 30,
        level: "A2",
        title: "Chuyển Đến Phòng Trọ Mới",
        grammarFocus: ["Quá khứ đơn", "So sánh hơn", "Have to + V"],
        vietnameseText: "Đầu học kỳ hai, tôi chuyển sang một phòng trọ mới gần trạm xe buýt hơn để tiện đi học. Việc đóng gói sách vở và đồ dùng cá nhân mất gần cả buổi sáng Chủ nhật. Hai người bạn thân đã sang giúp tôi khuân đồ lên tầng ba và sắp xếp lại bàn học. Phòng mới nhỏ hơn một chút nhưng có cửa sổ rộng đón gió và yên tĩnh hơn nhiều. Sau khi dọn xong, chúng tôi cùng nhau ăn lẩu ngay trên sàn nhà để ăn mừng.",
        hints: [
            { en: "convenient for commuting", vi: "tiện đi học / đi lại" },
            { en: "pack belongings", vi: "đóng gói đồ dùng" },
            { en: "carry things upstairs", vi: "khuân đồ lên tầng" },
            { en: "celebrate", vi: "ăn mừng" }
        ],
        sampleTranslation: "At the beginning of the second semester, I moved to a new rented room closer to the bus stop for an easier commute. Packing my books and personal belongings took almost the entire Sunday morning. Two close friends came over to help me carry everything up to the third floor and arrange my study desk. The new room is slightly smaller, but it has a wide breezy window and is much quieter. After finishing the move, we shared a hotpot right on the floor to celebrate."
    },
    {
        id: 31,
        level: "A2",
        title: "Lớp Học Nấu Ăn Cuối Tuần",
        grammarFocus: ["Quá khứ đơn", "Động từ + V-ing / to V", "Từ vựng nấu nướng"],
        vietnameseText: "Chủ nhật vừa rồi, tôi đăng ký một lớp học làm bánh ngắn hạn cùng em họ. Giáo viên hướng dẫn chúng tôi cách cân đo bột mì, đánh trứng và điều chỉnh nhiệt độ lò nướng. Tôi từng nghĩ làm bánh rất dễ, nhưng thực tế chỉ cần sai một bước nhỏ là bánh sẽ không nở. Sau hai tiếng chăm chú thực hành, mẻ bánh bông lan đầu tiên của chúng tôi ra lò thơm phức. Chúng tôi mang bánh về biếu bố mẹ và ai cũng bất ngờ trước thành quả này.",
        hints: [
            { en: "sign up for", vi: "đăng ký" },
            { en: "measure flour", vi: "cân đo bột mì" },
            { en: "oven temperature", vi: "nhiệt độ lò nướng" },
            { en: "sponge cake", vi: "bánh bông lan" }
        ],
        sampleTranslation: "Last Sunday, I signed up for a short baking workshop with my cousin. The instructor showed us how to measure flour, beat eggs, and adjust the oven temperature. I used to think baking was easy, but in reality, even one small mistake can stop the cake from rising. After two hours of focused practice, our first batch of sponge cake came out of the oven smelling wonderful. We brought the cakes home for our parents, and everyone was surprised by the result."
    },
    {
        id: 32,
        level: "A2",
        title: "Ngày Tôi Làm Mất Chiếc Ví",
        grammarFocus: ["Quá khứ đơn & Quá khứ hoàn thành cơ bản", "Tính từ cảm xúc", "Should / Shouldn't"],
        vietnameseText: "Hôm thứ Tư, tôi phát hiện chiếc ví của mình biến mất khi chuẩn bị trả tiền cơm trưa ở căng tin. Trong ví có thẻ sinh viên, căn cước công dân và tiền chi tiêu cho cả tuần. Tôi hốt hoảng chạy ngược lại phòng học buổi sáng để tìm quanh chỗ ngồi nhưng không thấy. Đúng lúc tôi định báo bảo vệ, một bạn sinh viên nhắn tin qua trang nhóm của trường báo đã nhặt được ví của tôi. Bài học đó nhắc tôi phải luôn kiểm tra đồ cá nhân cẩn thận trước khi rời khỏi phòng.",
        hints: [
            { en: "canteen / cafeteria", vi: "căng tin" },
            { en: "student ID card", vi: "thẻ sinh viên" },
            { en: "in a panic", vi: "hốt hoảng" },
            { en: "security guard", vi: "bảo vệ" }
        ],
        sampleTranslation: "On Wednesday, I discovered that my wallet was missing as I was about to pay for lunch at the cafeteria. Inside the wallet were my student ID card, citizen ID, and my allowance for the whole week. I ran back to my morning classroom in a panic to search around my seat, but it was nowhere to be found. Just as I was about to inform the security guard, another student messaged me through the school's group page saying they had found my wallet. That lesson reminded me to always check my personal belongings carefully before leaving a room."
    },
    {
        id: 33,
        level: "A2",
        title: "Kỳ Nghỉ Ở Đà Lạt",
        grammarFocus: ["Quá khứ đơn", "So sánh nhất", "Tính từ miêu tả cảnh quan"],
        vietnameseText: "Tháng Mười hai năm ngoái, nhóm bạn bốn người chúng tôi đã có chuyến đi Đà Lạt hai ngày một đêm. Điều tôi ấn tượng nhất là không khí se lạnh vào sáng sớm và sương mù phủ nhẹ trên những đồi thông. Chúng tôi thuê xe máy đi thăm vườn dâu, uống sữa đậu nành nóng ở chợ đêm và chụp rất nhiều ảnh đẹp. Buổi tối, cả nhóm ngồi bên bếp than nướng bắp và kể chuyện đến khuya. Đà Lạt thực sự là nơi tuyệt vời nhất để nghỉ ngơi sau kỳ thi căng thẳng.",
        hints: [
            { en: "chilly air", vi: "không khí se lạnh" },
            { en: "pine hills", vi: "đồi thông" },
            { en: "hot soy milk", vi: "sữa đậu nành nóng" },
            { en: "stressful exams", vi: "kỳ thi căng thẳng" }
        ],
        sampleTranslation: "Last December, my group of four friends took a two-day, one-night trip to Da Lat. What impressed me most was the chilly early-morning air and the light mist covering the pine hills. We rented motorbikes to visit a strawberry farm, drank hot soy milk at the night market, and took lots of lovely photos. In the evening, we sat around a charcoal stove roasting corn and talking late into the night. Da Lat is truly the best place to unwind after stressful exams."
    },
    {
        id: 34,
        level: "A2",
        title: "Học Cách Quản Lý Tiền Tiêu Vặt",
        grammarFocus: ["Hiện tại đơn & Quá khứ đơn", "Without + V-ing", "Quản lý thói quen"],
        vietnameseText: "Học kỳ đầu tiên sống xa nhà, tôi thường tiêu hết tiền trợ cấp trước khi tháng kết thúc. Tôi hay mua trà sữa, đặt đồ ăn vặt vào ban đêm mà không ghi chép lại chi tiêu. Sau khi nhận ra vấn đề, tôi tải một ứng dụng quản lý tài chính và chia ngân sách thành từng khoản rõ ràng. Tôi bắt đầu tự nấu cơm nhiều hơn và chỉ mua những món đồ thực sự cần thiết. Nhờ thay đổi thói quen nhỏ này, mỗi tháng tôi đã tiết kiệm được một khoản kha khá.",
        hints: [
            { en: "monthly allowance", vi: "tiền trợ cấp hàng tháng" },
            { en: "track expenses", vi: "ghi chép chi tiêu" },
            { en: "budget", vi: "ngân sách" },
            { en: "save a decent amount", vi: "tiết kiệm được khoản kha khá" }
        ],
        sampleTranslation: "During my first semester living away from home, I often ran out of my allowance before the month ended. I frequently bought milk tea and ordered late-night snacks without tracking my expenses. After realizing the problem, I downloaded a budgeting app and divided my money into clear categories. I started cooking at home more often and only bought items I truly needed. Thanks to this small habit change, I now manage to save a decent amount every month."
    },
    {
        id: 35,
        level: "A2",
        title: "Một Buổi Học Nhóm Hiệu Quả",
        grammarFocus: ["Quá khứ đơn", "Câu bị động cơ bản / Make + O + adj", "Liên từ"],
        vietnameseText: "Tuần trước, nhóm năm người chúng tôi họp tại thư viện để chuẩn bị cho bài thuyết trình môn Kinh tế. Trước buổi họp, trưởng nhóm đã phân công rõ ràng phần việc cho từng thành viên. Nhờ ai cũng chuẩn bị tài liệu trước ở nhà, cuộc thảo luận diễn ra nhanh chóng và không bị lan man. Khi một bạn gặp khó khăn trong việc thiết kế biểu đồ, cả nhóm cùng góp ý và sửa lại cho dễ hiểu hơn. Kết quả là bài thuyết trình hôm sau đạt điểm cao nhất lớp.",
        hints: [
            { en: "team leader", vi: "trưởng nhóm" },
            { en: "assign tasks", vi: "phân công phần việc" },
            { en: "stay on track", vi: "không bị lan man" },
            { en: "charts / graphs", vi: "biểu đồ" }
        ],
        sampleTranslation: "Last week, our group of five met at the library to prepare for our Economics presentation. Before the meeting, the team leader clearly assigned tasks to each member. Because everyone had prepared their materials at home beforehand, the discussion went smoothly and stayed on track. When one teammate struggled to design the charts, the whole group offered suggestions to make them clearer. As a result, our presentation the next day earned the highest score in the class."
    },
    {
        id: 36,
        level: "A2",
        title: "Thói Quen Dậy Sớm Mỗi Sáng",
        grammarFocus: ["Hiện tại hoàn thành", "Used to", "So sánh hơn"],
        vietnameseText: "Trước đây, tôi thường thức khuya đến một giờ sáng và luôn vội vã khi đến lớp tiết một. Từ đầu năm nay, tôi tập đi ngủ lúc mười một giờ để có thể thức dậy lúc sáu giờ sáng. Buổi sáng yên tĩnh giúp tôi có đủ thời gian tập thể dục nhẹ, ăn sáng đầy đủ và xem lại kế hoạch trong ngày. Tôi nhận thấy đầu óc mình tỉnh táo hơn và làm việc hiệu quả hơn hẳn so với trước kia. Dậy sớm hóa ra không quá khó nếu mình giữ lịch sinh hoạt đều đặn.",
        hints: [
            { en: "stay up late", vi: "thức khuya" },
            { en: "in a rush", vi: "vội vã" },
            { en: "clear-headed / alert", vi: "tỉnh táo" },
            { en: "consistent routine", vi: "lịch sinh hoạt đều đặn" }
        ],
        sampleTranslation: "In the past, I used to stay up until one in the morning and was always in a rush for my first class. Since the beginning of this year, I have trained myself to go to bed at eleven so I can wake up at six. Quiet mornings give me enough time to do light exercise, eat a proper breakfast, and review my daily plan. I notice that my mind feels much sharper and I work far more efficiently than before. Waking up early turns out not to be so hard if you keep a consistent routine."
    },
    {
        id: 37,
        level: "A2",
        title: "Trận Bóng Đá Dưới Mưa",
        grammarFocus: ["Quá khứ đơn & Quá khứ tiếp diễn", "Despite / Even though", "Động từ thể thao"],
        vietnameseText: "Chiều Chủ nhật, lớp tôi tổ chức một trận bóng đá giao hữu với lớp bên cạnh tại sân cỏ gần ký túc xá. Hiệp một diễn ra rất kịch tính với tỉ số hòa một đều. Khi hiệp hai vừa bắt đầu được mười phút, một cơn mưa rào đổ xuống làm mặt sân trơn trượt. Dù quần áo ướt sũng, không ai muốn dừng trận đấu vì mọi người đều đang rất hăng say. Cuối cùng đội tôi ghi thêm một bàn ở phút chót và cả lớp ôm nhau ăn mừng đầy phấn khích.",
        hints: [
            { en: "friendly match", vi: "trận giao hữu" },
            { en: "slippery pitch", vi: "mặt sân trơn trượt" },
            { en: "soaked", vi: "ướt sũng" },
            { en: "at the last minute", vi: "ở phút chót" }
        ],
        sampleTranslation: "On Sunday afternoon, my class organized a friendly football match against the class next door at the field near the dormitory. The first half was thrilling, ending in a one-all draw. Just ten minutes into the second half, a rain shower poured down and made the pitch slippery. Even though our clothes were soaked, nobody wanted to stop the game because everyone was so enthusiastic. In the end, my team scored one more goal at the last minute, and the whole class hugged each other in excitement."
    },
    {
        id: 38,
        level: "A2",
        title: "Thăm Lại Trường Cấp Ba",
        grammarFocus: ["Quá khứ đơn & Hiện tại hoàn thành", "Used to", "Tính từ cảm xúc"],
        vietnameseText: "Nhân ngày Nhà giáo Việt Nam, tôi và vài người bạn cũ rủ nhau về thăm trường cấp ba. Ngôi trường đã sơn lại tường mới và trồng thêm nhiều cây xanh dọc hành lang. Khi đi ngang qua phòng học lớp mười hai cũ, bao kỷ niệm về những giờ kiểm tra và tiếng cười giờ ra chơi lại ùa về. Chúng tôi mang theo một bó hoa nhỏ đến thăm cô giáo chủ nhiệm và kể cho cô nghe cuộc sống đại học hiện tại. Cô mỉm cười rất vui và dặn chúng tôi luôn giữ vững đam mê học hỏi.",
        hints: [
            { en: "Vietnamese Teachers' Day", vi: "ngày Nhà giáo Việt Nam" },
            { en: "homeroom teacher", vi: "giáo viên chủ nhiệm" },
            { en: "flood back", vi: "ùa về (kỷ niệm)" },
            { en: "bouquet of flowers", vi: "bó hoa" }
        ],
        sampleTranslation: "On Vietnamese Teachers' Day, a few old friends and I visited our high school together. The school had repainted its walls and planted more green trees along the hallways. As we walked past our old twelfth-grade classroom, memories of pop quizzes and laughter during recess came flooding back. We brought a small bouquet of flowers to visit our homeroom teacher and told her about our current university life. She smiled warmly and reminded us to always keep our passion for learning alive."
    },
    {
        id: 39,
        level: "A2",
        title: "Một Ngày Không Dùng Điện Thoại",
        grammarFocus: ["Quá khứ đơn", "Hiện tại hoàn thành", "Động từ + V-ing / to V"],
        vietnameseText: "Cuối tuần trước, tôi thử tắt điện thoại suốt cả ngày thứ Bảy để xem mình sẽ làm gì khi không có mạng. Hai tiếng đầu tiên, tôi cứ vô thức đưa tay tìm điện thoại mỗi khi rảnh rỗi. Sau đó, tôi quyết định dọn lại giá sách, vẽ vài bức phác thảo và đi dạo ra công viên gần nhà. Tôi ngạc nhiên nhận ra một ngày dài hơn rất nhiều khi mình không bị cuốn vào tin nhắn và video ngắn. Từ đó, tôi cố gắng dành ít nhất nửa ngày mỗi tuần để tạm rời xa màn hình.",
        hints: [
            { en: "subconsciously / automatically", vi: "vô thức" },
            { en: "reorganize the bookshelf", vi: "dọn lại giá sách" },
            { en: "short videos", vi: "video ngắn" },
            { en: "step away from screens", vi: "tạm rời xa màn hình" }
        ],
        sampleTranslation: "Last weekend, I tried turning off my phone for the entire Saturday to see what I would do without the internet. During the first two hours, I subconsciously reached for my phone whenever I had a spare moment. After that, I decided to reorganize my bookshelf, draw a few sketches, and take a walk to the nearby park. I was surprised to realize how much longer a day feels when you are not caught up in messages and short videos. Since then, I have tried to spend at least half a day each week stepping away from screens."
    },
    {
        id: 40,
        level: "A2",
        title: "Trải Nghiệm Làm Tình Nguyện Viên",
        grammarFocus: ["Quá khứ đơn", "Cấu trúc help someone (to) V", "Mệnh đề quan hệ"],
        vietnameseText: "Mùa hè vừa qua, tôi tham gia chiến dịch tình nguyện dạy học cho trẻ em ở một xã vùng ven. Mỗi sáng, nhóm tôi tổ chức các trò chơi tiếng Anh đơn giản và hướng dẫn các em ôn bài toán. Thời tiết khá nắng nóng và cơ sở vật chất còn thiếu thốn, nhưng nụ cười hồn nhiên của bọn trẻ khiến mọi mệt nhọc tan biến. Qua chuyến đi này, tôi học được cách làm việc nhóm tốt hơn và biết chia sẻ với những hoàn cảnh khó khăn. Tôi chắc chắn sẽ tiếp tục tham gia vào năm sau.",
        hints: [
            { en: "volunteer campaign", vi: "chiến dịch tình nguyện" },
            { en: "suburban / rural commune", vi: "xã vùng ven" },
            { en: "facilities", vi: "cơ sở vật chất" },
            { en: "innocent smiles", vi: "nụ cười hồn nhiên" }
        ],
        sampleTranslation: "Last summer, I joined a volunteer campaign teaching children in a suburban commune. Every morning, my team organized simple English games and helped the kids review their math lessons. Although the weather was quite hot and the facilities were limited, the children's innocent smiles made all our exhaustion vanish. Through this trip, I learned how to collaborate better and how to empathize with people in difficult circumstances. I will definitely take part again next year."
    },
    {
        id: 41,
        level: "A2",
        title: "Sự Cố Trước Giờ Thuyết Trình",
        grammarFocus: ["Quá khứ đơn & Quá khứ tiếp diễn", "May mắn thay / Tuy nhiên", "Động từ khuyết thiếu"],
        vietnameseText: "Sáng hôm thuyết trình cuối kỳ, máy tính xách tay của tôi bất ngờ không thể kết nối với máy chiếu trong lớp. Lúc đó chỉ còn năm phút nữa là đến lượt tôi lên nói, khiến tim tôi đập thình thịch. Thay vì hoảng loạn, tôi nhanh chóng mở bản sao lưu trang trình chiếu mà tôi đã tải lên lưu trữ đám mây tối hôm trước. Tôi mượn máy tính của bạn cùng lớp và trình bày trọn vẹn bài nói trong mười phút. Trải nghiệm đó dạy tôi luôn phải chuẩn bị phương án dự phòng cho mọi việc quan trọng.",
        hints: [
            { en: "projector", vi: "máy chiếu" },
            { en: "my heart pounded", vi: "tim tôi đập thình thịch" },
            { en: "backup copy", vi: "bản sao lưu" },
            { en: "backup plan", vi: "phương án dự phòng" }
        ],
        sampleTranslation: "On the morning of my final presentation, my laptop suddenly failed to connect to the classroom projector. There were only five minutes left before my turn to speak, and my heart was pounding. Instead of panicking, I quickly opened the backup copy of my slides that I had uploaded to cloud storage the night before. I borrowed a classmate's laptop and delivered my entire ten-minute talk smoothly. That experience taught me to always have a backup plan for anything important."
    },
    {
        id: 42,
        level: "A2",
        title: "Dự Định Cho Kỳ Nghỉ Sắp Tới",
        grammarFocus: ["Be going to & Will", "Câu điều kiện loại 1", "Động từ chỉ kế hoạch"],
        vietnameseText: "Tháng sau chúng tôi sẽ kết thúc học kỳ và có ba tuần nghỉ ngắn. Trong tuần đầu tiên, tôi dự định về nhà nghỉ ngơi và giúp bố mẹ sửa lại khu vườn sau nhà. Sang tuần thứ hai, tôi sẽ dành ba tiếng mỗi ngày để luyện viết và nghe tiếng Anh nhằm chuẩn bị cho kỳ thi chứng chỉ. Nếu còn thời gian và đủ kinh phí, tôi muốn đi tàu ra miền Trung thăm vài người bạn cũ. Tôi hy vọng kỳ nghỉ này sẽ vừa thư giãn vừa thật bổ ích.",
        hints: [
            { en: "plan to / intend to", vi: "dự định" },
            { en: "certificate exam", vi: "kỳ thi chứng chỉ" },
            { en: "budget / funds", vi: "kinh phí" },
            { en: "relaxing and productive", vi: "thư giãn và bổ ích" }
        ],
        sampleTranslation: "Next month we will finish the semester and have a three-week break. During the first week, I am going to go home to rest and help my parents fix up the backyard garden. In the second week, I will spend three hours a day practicing English writing and listening to prepare for my certificate exam. If I have enough time and budget, I want to take a train to Central Vietnam to visit some old friends. I hope this vacation will be both relaxing and productive."
    },

    /* ===================== B1: 43–70 (Trung cấp, lập luận) ===================== */
    {
        id: 43,
        level: "B1",
        title: "Lợi Ích Của Việc Học Ngoại Ngữ Sớm",
        grammarFocus: ["Danh động từ làm chủ ngữ", "Câu điều kiện loại 1", "Từ nối lập luận"],
        vietnameseText: "Học ngoại ngữ từ khi còn nhỏ mang lại nhiều lợi ích lâu dài cho sự phát triển tư duy của trẻ. Trước hết, trẻ em có khả năng bắt chước phát âm và tiếp thu ngữ điệu tự nhiên hơn nhiều so với người lớn. Bên cạnh đó, việc tiếp xúc với ngôn ngữ thứ hai giúp các em rèn luyện trí nhớ và linh hoạt hơn khi giải quyết vấn đề. Tuy nhiên, cha mẹ không nên tạo áp lực điểm số quá nặng mà hãy để trẻ học thông qua trò chơi và câu chuyện thú vị. Nếu được hướng dẫn đúng phương pháp, ngoại ngữ sẽ trở thành chiếc cầu nối mở ra nhiều cơ hội trong tương lai.",
        hints: [
            { en: "cognitive development", vi: "phát triển tư duy" },
            { en: "imitate pronunciation", vi: "bắt chước phát âm" },
            { en: "put pressure on", vi: "tạo áp lực" },
            { en: "a bridge to opportunities", vi: "cầu nối mở ra cơ hội" }
        ],
        sampleTranslation: "Learning a foreign language at an early age brings many long-term benefits to children's cognitive development. First of all, young learners can imitate pronunciation and pick up natural intonation far more easily than adults. In addition, exposure to a second language strengthens their memory and makes them more flexible problem-solvers. However, parents should not put excessive pressure on grades; instead, they should let children learn through engaging games and stories. If guided with the right approach, a foreign language will become a bridge opening up countless future opportunities."
    },
    {
        id: 44,
        level: "B1",
        title: "Làm Việc Từ Xa Hay Tại Văn Phòng",
        grammarFocus: ["Mệnh đề tương phản (Whereas / While)", "Câu bị động", "So sánh lập luận"],
        vietnameseText: "Trong những năm gần đây, làm việc từ xa đã trở thành xu hướng phổ biến ở nhiều doanh nghiệp công nghệ. Ưu điểm lớn nhất của mô hình này là nhân viên tiết kiệm được thời gian di chuyển và dễ dàng cân bằng việc nhà với công việc. Ngược lại, làm việc tại văn phòng lại tạo điều kiện cho đồng nghiệp trao đổi trực tiếp, nảy sinh ý tưởng nhanh và gắn kết tinh thần đội nhóm hơn. Đối với người mới đi làm, sự hướng dẫn trực tiếp từ quản lý tại công ty thường khó có thể thay thế hoàn toàn qua màn hình. Vì vậy, mô hình kết hợp giữa hai hình thức đang được xem là giải pháp hợp lý nhất.",
        hints: [
            { en: "remote work", vi: "làm việc từ xa" },
            { en: "commuting time", vi: "thời gian di chuyển" },
            { en: "team spirit", vi: "tinh thần đội nhóm" },
            { en: "hybrid model", vi: "mô hình kết hợp" }
        ],
        sampleTranslation: "In recent years, remote work has become a widespread trend across many technology companies. The greatest advantage of this model is that employees save commuting time and find it easier to balance household duties with work. By contrast, working in an office allows colleagues to communicate face to face, spark ideas quickly, and build stronger team spirit. For newcomers to the workforce, in-person guidance from managers is often difficult to replace completely through a screen. Therefore, a hybrid model combining both arrangements is increasingly regarded as the most sensible solution."
    },
    {
        id: 45,
        level: "B1",
        title: "Tác Động Của Mạng Xã Hội Đến Sinh Viên",
        grammarFocus: ["Not only... but also", "Mệnh đề quan hệ", "Cấu trúc lead to / result in"],
        vietnameseText: "Mạng xã hội đóng vai trò hai mặt trong đời sống học tập của sinh viên hiện nay. Một mặt, nó không chỉ giúp người học cập nhật thông tin học bổng nhanh chóng mà còn tạo ra nhiều cộng đồng chia sẻ tài liệu miễn phí. Mặt khác, việc dành hàng giờ lướt bảng tin không kiểm soát dễ dẫn đến mất tập trung và trì hoãn bài tập quan trọng. Hơn nữa, so sánh bản thân với cuộc sống hào nhoáng của người khác trên mạng có thể gây ra cảm giác tự ti. Do đó, sinh viên cần đặt ra giới hạn thời gian rõ ràng để biến mạng xã hội thành công cụ hỗ trợ thay vì yếu tố gây xao nhãng.",
        hints: [
            { en: "double-edged role", vi: "vai trò hai mặt" },
            { en: "loss of focus", vi: "mất tập trung" },
            { en: "feel insecure / inferior", vi: "cảm giác tự ti" },
            { en: "distraction", vi: "yếu tố gây xao nhãng" }
        ],
        sampleTranslation: "Social media plays a double-edged role in university students' academic lives today. On the one hand, it not only helps learners stay updated on scholarship opportunities quickly but also fosters communities that share free study resources. On the other hand, spending hours scrolling endlessly through feeds easily leads to a loss of focus and procrastination on important assignments. Furthermore, comparing oneself to the polished lives of others online can trigger feelings of insecurity. Consequently, students need to set clear time limits to turn social media into a helpful tool rather than a distraction."
    },
    {
        id: 46,
        level: "B1",
        title: "Vì Sao Cần Giữ Thói Quen Tự Học",
        grammarFocus: ["Mệnh đề quan hệ", "Câu điều kiện loại 1", "Động từ khuyết thiếu"],
        vietnameseText: "Kiến thức trên giảng đường chỉ là nền tảng ban đầu và không thể bao quát hết mọi thay đổi nhanh chóng của xã hội. Những người có khả năng tự học thường biết cách đặt câu hỏi, tự tìm nguồn tài liệu đáng tin cậy và chủ động khắc phục điểm yếu của mình. Trong bối cảnh công nghệ đổi mới từng ngày, một kỹ năng hữu ích hôm nay có thể trở nên lỗi thời chỉ sau vài năm. Nếu sinh viên chỉ chờ thầy cô giao bài mới học, họ sẽ gặp nhiều bất lợi khi bước vào thị trường lao động cạnh tranh. Chính vì thế, tự học suốt đời là chìa khóa giúp mỗi cá nhân giữ vững năng lực thích nghi.",
        hints: [
            { en: "self-directed learning", vi: "tự học" },
            { en: "reliable sources", vi: "nguồn tài liệu đáng tin cậy" },
            { en: "outdated / obsolete", vi: "lỗi thời" },
            { en: "adaptability", vi: "năng lực thích nghi" }
        ],
        sampleTranslation: "Classroom knowledge is only an initial foundation and cannot cover all the rapid changes in modern society. People who possess strong self-learning habits usually know how to ask questions, find reliable resources, and actively address their own weaknesses. As technology evolves daily, a skill that is valuable today may become obsolete within just a few years. If students only study when teachers assign homework, they will face serious disadvantages upon entering a competitive job market. For this reason, lifelong self-learning is the key to maintaining personal adaptability."
    },
    {
        id: 47,
        level: "B1",
        title: "Bảo Vệ Môi Trường Từ Những Hành Động Nhỏ",
        grammarFocus: ["Câu điều kiện loại 1 & 2", "Câu bị động", "Danh động từ"],
        vietnameseText: "Nhiều người cho rằng bảo vệ môi trường là trách nhiệm của chính phủ và các tập đoàn lớn hơn là cá nhân. Tuy nhiên, nếu hàng triệu người cùng thay đổi những thói quen hằng ngày, tác động tích cực tạo ra sẽ vô cùng đáng kể. Việc mang theo bình nước cá nhân, hạn chế túi ni lông dùng một lần và phân loại rác tại nhà đều là những hành động rất dễ thực hiện. Ngoài ra, tắt các thiết bị điện khi không sử dụng không chỉ giảm lượng khí thải mà còn tiết kiệm chi phí sinh hoạt. Một lối sống xanh bền vững luôn bắt đầu từ ý thức của chính mỗi chúng ta.",
        hints: [
            { en: "single-use plastic bags", vi: "túi ni lông dùng một lần" },
            { en: "sort waste", vi: "phân loại rác" },
            { en: "carbon emissions", vi: "lượng khí thải" },
            { en: "sustainable green lifestyle", vi: "lối sống xanh bền vững" }
        ],
        sampleTranslation: "Many people believe that protecting the environment is the responsibility of governments and large corporations rather than individuals. However, if millions of people change their daily habits together, the positive impact created will be remarkably significant. Carrying a reusable water bottle, cutting down on single-use plastic bags, and sorting waste at home are all easy actions to adopt. In addition, turning off electrical appliances when not in use not only reduces emissions but also lowers living expenses. A sustainable green lifestyle always begins with each individual's awareness."
    },
    {
        id: 48,
        level: "B1",
        title: "Áp Lực Đồng Trang Lứa Ở Tuổi Trẻ",
        grammarFocus: ["Mệnh đề quan hệ", "Cấu trúc make / force someone to V", "Từ nối nhượng bộ"],
        vietnameseText: "Áp lực đồng trang lứa là cảm giác căng thẳng khi ta thấy bạn bè cùng lứa tuổi đạt được nhiều thành tựu nổi bật hơn mình. Ở mức độ tích cực, áp lực này có thể trở thành động lực thúc đẩy người trẻ nỗ lực học hỏi và không ngừng hoàn thiện bản thân. Thế nhưng, khi nó vượt quá giới hạn, nhiều sinh viên dễ rơi vào trạng thái lo âu kéo dài hoặc chạy theo mục tiêu không phù hợp với năng lực thật sự. Mỗi người đều có xuất phát điểm và nhịp độ phát triển riêng biệt. Thay vì so sánh mù quáng, hãy tập trung vào việc mình hôm nay có tiến bộ hơn ngày hôm qua hay không.",
        hints: [
            { en: "peer pressure", vi: "áp lực đồng trang lứa" },
            { en: "motivation", vi: "động lực" },
            { en: "prolonged anxiety", vi: "lo âu kéo dài" },
            { en: "starting point", vi: "xuất phát điểm" }
        ],
        sampleTranslation: "Peer pressure is the stressful feeling that arises when we see friends our own age achieving more remarkable success than we have. At a healthy level, this pressure can serve as motivation that pushes young people to work harder and continuously improve themselves. Yet when it goes too far, many students fall into prolonged anxiety or chase goals that do not match their true strengths. Everyone has a different starting point and a unique pace of growth. Instead of comparing blindly, we should focus on whether we are better today than we were yesterday."
    },
    {
        id: 49,
        level: "B1",
        title: "Học Trực Tuyến So Với Học Trực Tiếp",
        grammarFocus: ["So sánh đối chiếu", "Mệnh đề trạng ngữ chỉ điều kiện", "Động từ khuyết thiếu"],
        vietnameseText: "Sự phát triển của internet đã giúp các khóa học trực tuyến trở nên phổ biến và dễ tiếp cận hơn bao giờ hết. Người học có thể xem lại bài giảng nhiều lần, chủ động chọn khung giờ phù hợp và tiết kiệm chi phí đi lại. Dẫu vậy, học trực tuyến đòi hỏi tính kỷ luật tự giác rất cao vì không có giáo viên giám sát trực tiếp. Trong khi đó, lớp học truyền thống lại mang đến bầu không khí tương tác sôi nổi, giúp học viên dễ đặt câu hỏi và nhận phản hồi ngay lập tức. Hiệu quả học tập cuối cùng phụ thuộc nhiều vào thái độ của người học hơn là hình thức lớp học.",
        hints: [
            { en: "accessible", vi: "dễ tiếp cận" },
            { en: "self-discipline", vi: "tính kỷ luật tự giác" },
            { en: "interactive atmosphere", vi: "bầu không khí tương tác" },
            { en: "immediate feedback", vi: "phản hồi ngay lập tức" }
        ],
        sampleTranslation: "The growth of the internet has made online courses more popular and accessible than ever before. Learners can replay lectures multiple times, choose schedules that suit them, and cut down on travel expenses. Nevertheless, online learning demands strong self-discipline because no teacher is supervising in person. Meanwhile, traditional classrooms offer a lively, interactive atmosphere where students can easily ask questions and receive immediate feedback. Ultimately, learning effectiveness depends far more on a student's attitude than on the format of the class."
    },
    {
        id: 50,
        level: "B1",
        title: "Vai Trò Của Kỹ Năng Giao Tiếp Trong Công Việc",
        grammarFocus: ["Mệnh đề danh ngữ", "Cấu trúc enable / allow O to V", "Từ nối bổ sung"],
        vietnameseText: "Trong môi trường làm việc hiện đại, kiến thức chuyên môn vững vàng vẫn chưa đủ để đảm bảo thành công lâu dài. Kỹ năng giao tiếp hiệu quả cho phép nhân viên trình bày ý tưởng rõ ràng, thuyết phục khách hàng và hạn chế tối đa những hiểu lầm không đáng có. Quan trọng không kém việc nói hay chính là khả năng lắng nghe chân thành để thấu hiểu nhu cầu của đồng nghiệp. Thực tế cho thấy nhiều dự án thất bại không phải do thiếu nhân tài mà vì các bộ phận không phối hợp thông tin ăn ý. Bởi vậy, rèn luyện kỹ năng giao tiếp ngay từ thời sinh viên là một khoản đầu tư vô cùng xứng đáng.",
        hints: [
            { en: "technical expertise", vi: "kiến thức chuyên môn" },
            { en: "unnecessary misunderstandings", vi: "hiểu lầm không đáng có" },
            { en: "active listening", vi: "lắng nghe chân thành / chủ động" },
            { en: "worthwhile investment", vi: "khoản đầu tư xứng đáng" }
        ],
        sampleTranslation: "In the modern workplace, solid technical expertise alone is not enough to guarantee long-term success. Effective communication skills enable employees to present ideas clearly, persuade clients, and minimize unnecessary misunderstandings. Equally important to speaking well is the ability to listen sincerely in order to understand colleagues' needs. In practice, many projects fail not because of a lack of talent, but because departments fail to coordinate information smoothly. Therefore, developing communication skills while still at university is an extremely worthwhile investment."
    },
    {
        id: 51,
        level: "B1",
        title: "Có Nên Cho Trẻ Em Dùng Điện Thoại Sớm",
        grammarFocus: ["Should / Ought to", "Mệnh đề nguyên nhân & nhượng bộ", "Câu bị động"],
        vietnameseText: "Việc có nên cho trẻ nhỏ sử dụng điện thoại thông minh từ sớm đang gây ra nhiều tranh cãi giữa các bậc phụ huynh. Một số cha mẹ đồng ý vì thiết bị này giúp họ dễ dàng liên lạc với con và cung cấp nhiều ứng dụng học tập trực quan. Ngược lại, nhiều chuyên gia giáo dục cảnh báo rằng tiếp xúc màn hình quá sớm có thể ảnh hưởng xấu đến thị lực và khả năng giao tiếp trực tiếp của trẻ. Trẻ em cần nhiều thời gian vận động ngoài trời và tương tác thực tế với gia đình hơn là ngồi nhìn màn hình. Giải pháp hợp lý là chỉ cho trẻ tiếp cận khi đủ độ tuổi phù hợp và luôn có sự đồng hành giám sát của người lớn.",
        hints: [
            { en: "spark debate", vi: "gây ra tranh cãi" },
            { en: "visual learning apps", vi: "ứng dụng học tập trực quan" },
            { en: "eyesight / vision", vi: "thị lực" },
            { en: "adult supervision", vi: "sự giám sát của người lớn" }
        ],
        sampleTranslation: "Whether young children should be allowed to use smartphones early has sparked considerable debate among parents. Some parents agree because the device makes it easy to stay in touch with their children and offers visual learning apps. Conversely, many education experts warn that early screen exposure can harm children's eyesight and face-to-face communication skills. Kids need far more outdoor physical activity and real-life family interaction than screen time. A sensible solution is to allow access only at an appropriate age and always under adult supervision."
    },
    {
        id: 52,
        level: "B1",
        title: "Tầm Quan Trọng Của Giấc Ngủ Đối Với Hiệu Suất",
        grammarFocus: ["Câu điều kiện loại 1", "Mệnh đề quan hệ", "Cấu trúc affect / impact"],
        vietnameseText: "Nhiều sinh viên có thói quen thức trắng đêm để ôn thi với suy nghĩ rằng học càng nhiều giờ thì điểm càng cao. Trên thực tế, thiếu ngủ làm giảm đáng kể khả năng ghi nhớ dài hạn và khiến tư duy phản xạ trở nên chậm chạp. Trong lúc chúng ta ngủ sâu, não bộ thực hiện quá trình sắp xếp và củng cố những kiến thức đã tiếp thu suốt cả ngày. Nếu tình trạng thiếu ngủ kéo dài nhiều tuần, không chỉ kết quả học tập sa sút mà sức đề kháng của cơ thể cũng bị suy yếu. Ngủ đủ bảy đến tám tiếng mỗi đêm chính là cách đơn giản nhất để duy trì năng suất bền vững.",
        hints: [
            { en: "pull an all-nighter", vi: "thức trắng đêm" },
            { en: "long-term memory", vi: "trí nhớ dài hạn" },
            { en: "consolidate knowledge", vi: "củng cố kiến thức" },
            { en: "immune system", vi: "sức đề kháng" }
        ],
        sampleTranslation: "Many students have a habit of pulling all-nighters before exams, thinking that more study hours automatically lead to higher grades. In reality, sleep deprivation significantly impairs long-term memory and slows down mental reflexes. While we are in deep sleep, the brain organizes and consolidates the information absorbed throughout the day. If poor sleep persists for weeks, not only does academic performance decline, but the body's immune system also weakens. Getting seven to eight hours of sleep every night is the simplest way to maintain sustainable productivity."
    },
    {
        id: 53,
        level: "B1",
        title: "Mua Sắm Trực Tuyến Thay Đổi Thói Quen Tiêu Dùng",
        grammarFocus: ["Hiện tại hoàn thành", "Although / Despite", "Từ vựng thương mại điện tử"],
        vietnameseText: "Thương mại điện tử đã thay đổi hoàn toàn cách người tiêu dùng hiện đại chọn mua hàng hóa hằng ngày. Chỉ với vài thao tác trên điện thoại, người mua có thể so sánh giá cả từ hàng chục cửa hàng khác nhau và nhận hàng ngay tại nhà. Mặc dù sự tiện lợi này rất hấp dẫn, nó cũng khiến không ít người rơi vào thói quen mua sắm bốc đồng trong các đợt giảm giá lớn. Ngoài ra, rủi ro nhận phải sản phẩm kém chất lượng hơn hình ảnh quảng cáo vẫn thường xuyên xảy ra. Người tiêu dùng thông minh cần đọc kỹ đánh giá thực tế và chỉ đặt mua những món đồ đúng với nhu cầu.",
        hints: [
            { en: "e-commerce", vi: "thương mại điện tử" },
            { en: "impulse buying", vi: "mua sắm bốc đồng" },
            { en: "promotional sales", vi: "đợt giảm giá lớn" },
            { en: "customer reviews", vi: "đánh giá thực tế của khách hàng" }
        ],
        sampleTranslation: "E-commerce has completely transformed the way modern consumers shop for everyday goods. With just a few taps on a smartphone, buyers can compare prices across dozens of stores and have items delivered right to their doorstep. Although this convenience is highly appealing, it also leads many people into impulse buying during major sales events. Moreover, the risk of receiving products of lower quality than advertised still occurs frequently. Smart consumers should carefully read genuine reviews and only order items that truly match their needs."
    },
    {
        id: 54,
        level: "B1",
        title: "Giá Trị Của Việc Đi Du Lịch Một Mình",
        grammarFocus: ["Danh động từ", "Câu điều kiện loại 2", "Tính từ miêu tả trải nghiệm"],
        vietnameseText: "Đi du lịch một mình từng bị xem là điều khá mạo hiểm, nhưng ngày nay ngày càng nhiều bạn trẻ yêu thích hình thức trải nghiệm này. Khi tự lên lịch trình, bạn được hoàn toàn tự do dừng lại ở bất cứ nơi nào mình thích mà không phải phụ thuộc vào sở thích của người khác. Quan trọng hơn, việc tự xoay xở khi gặp tình huống bất ngờ giúp người đi rèn luyện bản lĩnh và sự tự lập rõ rệt. Đương nhiên, du lịch độc hành đòi hỏi sự chuẩn bị kỹ lưỡng về an toàn, ngân sách và thông tin điểm đến. Nếu có cơ hội, mỗi người nên thử một chuyến đi như vậy ít nhất một lần để hiểu rõ bản thân hơn.",
        hints: [
            { en: "solo travel", vi: "du lịch một mình / độc hành" },
            { en: "itinerary", vi: "lịch trình" },
            { en: "independence", vi: "sự tự lập" },
            { en: "thorough preparation", vi: "chuẩn bị kỹ lưỡng" }
        ],
        sampleTranslation: "Traveling alone was once considered quite risky, yet today more and more young people embrace this form of exploration. When planning your own itinerary, you have complete freedom to linger wherever you like without depending on anyone else's preferences. More importantly, handling unexpected situations on your own noticeably builds resilience and independence. Naturally, solo travel requires thorough preparation regarding safety, budgeting, and destination details. Given the chance, everyone should try such a trip at least once to understand themselves better."
    },
    {
        id: 55,
        level: "B1",
        title: "Làm Thêm Khi Còn Là Sinh Viên",
        grammarFocus: ["Mệnh đề nhượng bộ", "Cấu trúc gain / develop + N", "Lời khuyên should"],
        vietnameseText: "Đi làm thêm trong những năm đại học là lựa chọn phổ biến của rất nhiều sinh viên nhằm giảm bớt gánh nặng tài chính cho gia đình. Bên cạnh thu nhập, công việc bán thời gian giúp người trẻ làm quen với tác phong chuyên nghiệp, học cách ứng xử với khách hàng và mở rộng mối quan hệ xã hội. Tuy nhiên, nếu ham làm quá nhiều ca mà bỏ bê việc học, sinh viên rất dễ bị tụt lại phía sau hoặc phải học lại môn. Lý tưởng nhất là tìm những công việc có liên quan đến chuyên ngành đang theo học và sắp xếp thời gian hợp lý. Khi giữ được sự cân bằng, công việc làm thêm sẽ trở thành bước đệm giá trị trước khi ra trường.",
        hints: [
            { en: "financial burden", vi: "gánh nặng tài chính" },
            { en: "work ethic / professionalism", vi: "tác phong chuyên nghiệp" },
            { en: "fall behind", vi: "tụt lại phía sau" },
            { en: "stepping stone", vi: "bước đệm" }
        ],
        sampleTranslation: "Working part-time during university years is a popular choice among students looking to ease the financial burden on their families. Beyond earning extra income, a part-time job helps young people adapt to a professional work ethic, deal with customers, and expand their social network. However, taking on too many shifts while neglecting coursework can easily cause students to fall behind or retake classes. Ideally, one should look for roles related to their major and manage their schedule wisely. When properly balanced, a part-time job becomes a valuable stepping stone before graduation."
    },
    {
        id: 56,
        level: "B1",
        title: "Giao Thông Công Cộng Và Giảm Ùn Tắc Đô Thị",
        grammarFocus: ["Câu điều kiện loại 2", "Câu bị động", "Từ nối nguyên nhân – giải pháp"],
        vietnameseText: "Ùn tắc giao thông vào giờ cao điểm đang là bài toán nan giải tại hầu hết các đô thị lớn ở Việt Nam. Nguyên nhân chủ yếu xuất phát từ số lượng phương tiện cá nhân tăng quá nhanh trong khi hạ tầng đường sá chưa kịp mở rộng. Nếu hệ thống xe buýt và tàu điện đô thị được đầu tư đúng giờ, sạch sẽ và kết nối thuận tiện hơn, nhiều người dân sẽ sẵn sàng chuyển sang sử dụng giao thông công cộng. Việc này không chỉ giúp giảm kẹt xe mà còn góp phần cải thiện chất lượng không khí đáng kể. Thay đổi thói quen di chuyển đòi hỏi thời gian, nhưng đó là hướng đi tất yếu cho thành phố phát triển bền vững.",
        hints: [
            { en: "rush hour", vi: "giờ cao điểm" },
            { en: "private vehicles", vi: "phương tiện cá nhân" },
            { en: "urban rail / metro", vi: "tàu điện đô thị" },
            { en: "air quality", vi: "chất lượng không khí" }
        ],
        sampleTranslation: "Traffic congestion during rush hour remains a pressing problem in most major cities in Vietnam. The primary cause stems from the rapid surge in private vehicles while road infrastructure has not expanded quickly enough. If bus networks and urban rail systems were more punctual, cleaner, and better connected, many residents would gladly switch to public transit. Doing so would not only ease traffic jams but also significantly improve air quality. Changing commuting habits takes time, yet it is an essential path toward sustainable urban development."
    },
    {
        id: 57,
        level: "B1",
        title: "Đọc Sách Giấy Hay Đọc Sách Điện Tử",
        grammarFocus: ["So sánh đối chiếu", "Mệnh đề quan hệ", "Danh động từ"],
        vietnameseText: "Ngày nay, người yêu sách có thể dễ dàng lựa chọn giữa sách giấy truyền thống và sách điện tử gọn nhẹ. Sách điện tử cho phép bạn mang theo hàng trăm tựa sách trong một thiết bị nhỏ, tra từ điển tức thì và điều chỉnh cỡ chữ theo ý muốn. Trái lại, nhiều độc giả vẫn trung thành với sách giấy bởi cảm giác lật từng trang, mùi giấy mới và khả năng tập trung sâu mà không bị thông báo làm phiền. Các nghiên cứu cũng cho thấy việc ghi chú trực tiếp bên lề sách giấy thường giúp người đọc nhớ nội dung lâu hơn. Dù chọn hình thức nào, điều quan trọng nhất vẫn là duy trì niềm đam mê đọc mỗi ngày.",
        hints: [
            { en: "e-books", vi: "sách điện tử" },
            { en: "adjust font size", vi: "điều chỉnh cỡ chữ" },
            { en: "loyal to", vi: "trung thành với" },
            { en: "jot down notes in the margin", vi: "ghi chú bên lề" }
        ],
        sampleTranslation: "Today, book lovers can easily choose between traditional printed books and lightweight e-books. E-books let you carry hundreds of titles in a single device, look up words instantly, and adjust the font size at will. On the other hand, many readers remain loyal to paper books for the tactile pleasure of turning pages, the smell of fresh paper, and deeper focus without pop-up notifications. Studies also suggest that jotting notes directly in the margins of printed books often helps readers retain information longer. Whichever format one prefers, the most important thing is keeping the habit of reading alive every day."
    },
    {
        id: 58,
        level: "B1",
        title: "Cân Bằng Giữa Học Tập Và Cuộc Sống Cá Nhân",
        grammarFocus: ["Câu điều kiện loại 1", "Động từ khuyết thiếu should / must", "Danh động từ"],
        vietnameseText: "Nhiều sinh viên xuất sắc đôi khi gặp tình trạng kiệt sức vì họ dành toàn bộ thời gian cho bài vở và điểm số. Dù nỗ lực học tập là điều đáng khen ngợi, một lịch trình quá tải mà thiếu thời gian nghỉ ngơi hiếm khi mang lại hiệu quả lâu dài. Việc dành thời gian cho gia đình, thể thao và sở thích cá nhân giúp tinh thần được tái tạo năng lượng sau những tuần thi áp lực. Biết nói không với những hoạt động không cần thiết cũng là một kỹ năng quan trọng để bảo vệ quỹ thời gian của bản thân. Một cuộc sống cân bằng sẽ giúp sinh viên học tập bền bỉ và hạnh phúc hơn.",
        hints: [
            { en: "burnout", vi: "kiệt sức" },
            { en: "overloaded schedule", vi: "lịch trình quá tải" },
            { en: "recharge mentally", vi: "tái tạo năng lượng tinh thần" },
            { en: "say no to", vi: "nói không với" }
        ],
        sampleTranslation: "Many top-performing students occasionally experience burnout because they devote all their time to coursework and grades. Although academic dedication is admirable, an overloaded schedule without proper rest rarely delivers lasting results. Setting aside time for family, sports, and personal hobbies allows the mind to recharge after high-pressure exam weeks. Learning to say no to unnecessary commitments is also a vital skill for protecting one's schedule. A balanced life ultimately enables students to study with greater endurance and happiness."
    },
    {
        id: 59,
        level: "B1",
        title: "Vai Trò Của Thể Thao Đối Với Sức Khỏe Tinh Thần",
        grammarFocus: ["Not only... but also", "Câu bị động", "Mệnh đề quan hệ"],
        vietnameseText: "Khi nhắc đến thể thao, phần lớn mọi người thường chỉ nghĩ đến lợi ích cải thiện vóc dáng và thể lực. Tuy nhiên, các chuyên gia y tế khẳng định rằng vận động thường xuyên còn đóng vai trò quan trọng trong việc giảm căng thẳng và lo âu. Chỉ cần ba mươi phút đi bộ nhanh, bơi lội hoặc đạp xe mỗi ngày cũng đủ kích thích cơ thể tiết ra các hoóc-môn tạo cảm giác tích cực. Hơn thế nữa, các môn thể thao đồng đội giúp người tham gia mở rộng giao tiếp và cảm thấy gắn kết với cộng đồng hơn. Do đó, tập luyện thể chất nên được xem là một phần thiết yếu để chăm sóc cả thân lẫn tâm.",
        hints: [
            { en: "physical fitness", vi: "thể lực" },
            { en: "brisk walking", vi: "đi bộ nhanh" },
            { en: "release positive hormones", vi: "tiết ra hoóc-môn tích cực" },
            { en: "team sports", vi: "thể thao đồng đội" }
        ],
        sampleTranslation: "When people mention sports, most only think of benefits like improving body shape and physical fitness. However, health experts emphasize that regular physical activity also plays a crucial role in reducing stress and anxiety. Just thirty minutes of brisk walking, swimming, or cycling each day is enough to stimulate the body to release mood-boosting hormones. Moreover, team sports help participants expand their social circles and feel more connected to their community. Therefore, physical exercise should be viewed as an essential part of caring for both body and mind."
    },
    {
        id: 60,
        level: "B1",
        title: "Thói Quen Trì Hoãn Và Cách Vượt Qua",
        grammarFocus: ["Mệnh đề nguyên nhân", "Cấu trúc break down into", "Lời khuyên thực tế"],
        vietnameseText: "Trì hoãn công việc là thói quen phổ biến mà hầu như ai cũng từng mắc phải, đặc biệt là trước những nhiệm vụ lớn và khó. Nguyên nhân sâu xa thường không phải do lười biếng, mà vì chúng ta cảm thấy choáng ngợp hoặc sợ làm chưa đủ hoàn hảo. Một phương pháp rất hiệu quả để vượt qua điều này là chia mục tiêu lớn thành những bước nhỏ có thể hoàn thành trong vòng hai mươi phút. Khi bắt tay vào làm bước đầu tiên, cảm giác ngại ngần thường giảm đi đáng kể. Ngoài ra, dọn gọn góc làm việc và tắt thông báo điện thoại sẽ giúp bạn duy trì đà tập trung tốt hơn.",
        hints: [
            { en: "procrastination", vi: "sự trì hoãn" },
            { en: "feel overwhelmed", vi: "cảm thấy choáng ngợp" },
            { en: "break down into small steps", vi: "chia thành các bước nhỏ" },
            { en: "maintain momentum", vi: "duy trì đà tập trung" }
        ],
        sampleTranslation: "Procrastination is a common habit that almost everyone falls into, especially when facing large and challenging tasks. The root cause is often not laziness, but rather feeling overwhelmed or fearing that the result will not be perfect. A highly effective way to overcome this is to break a big goal down into small steps that can be completed within twenty minutes. Once you start on the very first step, hesitation usually drops dramatically. In addition, tidying your workspace and silencing phone notifications will help you maintain focus and momentum."
    },
    {
        id: 61,
        level: "B1",
        title: "Học Từ Thất Bại Quan Trọng Như Thế Nào",
        grammarFocus: ["Mệnh đề danh ngữ (What matters is...)", "Câu điều kiện loại 2", "Từ nối tương phản"],
        vietnameseText: "Không ai mong muốn gặp thất bại, nhưng đó lại là một phần khó tránh khỏi trên hành trình trưởng thành của mỗi người. Một lần trượt kỳ thi hay một dự án không như ý thường khiến chúng ta buồn bã trong thời gian đầu. Tuy nhiên, nếu bình tĩnh nhìn lại nguyên nhân gốc rễ, thất bại sẽ chỉ ra chính xác những lỗ hổng kiến thức hoặc sai sót trong cách chuẩn bị mà thành công dễ dàng che lấp. Nhiều nhà sáng lập nổi tiếng từng trải qua hàng loạt thất bại trước khi tạo nên sản phẩm đột phá. Điều quyết định không phải là bạn vấp ngã bao nhiêu lần, mà là bạn rút ra được bài học gì sau mỗi lần đứng dậy.",
        hints: [
            { en: "unavoidable", vi: "khó tránh khỏi" },
            { en: "root cause", vi: "nguyên nhân gốc rễ" },
            { en: "knowledge gaps", vi: "lỗ hổng kiến thức" },
            { en: "draw a lesson", vi: "rút ra bài học" }
        ],
        sampleTranslation: "Nobody wishes to fail, yet failure is an unavoidable part of everyone's journey toward maturity. Failing an exam or seeing a project fall short often leaves us discouraged at first. However, if we calmly examine the root cause, failure points out the exact knowledge gaps or planning mistakes that easy success tends to hide. Many renowned founders went through a series of setbacks before creating breakthrough products. What truly matters is not how many times you stumble, but what lessons you draw each time you get back up."
    },
    {
        id: 62,
        level: "B1",
        title: "Ảnh Hưởng Của Âm Nhạc Khi Tập Trung Làm Việc",
        grammarFocus: ["Whether... or not", "Mệnh đề quan hệ", "Động từ depend on"],
        vietnameseText: "Nghe nhạc trong lúc học bài hay làm việc có thực sự giúp tăng hiệu suất hay không còn phụ thuộc vào loại nhạc và tính chất công việc. Khi thực hiện các công việc lặp đi lặp lại hoặc vẽ thiết kế, nhạc không lời nhẹ nhàng có thể ngăn tiếng ồn xung quanh và tạo tâm trạng dễ chịu. Ngược lại, nếu bạn đang cần đọc hiểu tài liệu phức tạp hoặc viết bài luận tiếng Anh, các bài hát có lời dễ khiến não bộ bị phân tán sự chú ý. Mỗi người có mức độ nhạy cảm với âm thanh khác nhau nên không có công thức chung cho tất cả. Cách tốt nhất là tự thử nghiệm trong một tuần để chọn ra môi trường làm việc phù hợp nhất với mình.",
        hints: [
            { en: "instrumental music", vi: "nhạc không lời" },
            { en: "block out background noise", vi: "ngăn tiếng ồn xung quanh" },
            { en: "songs with lyrics", vi: "bài hát có lời" },
            { en: "experiment", vi: "tự thử nghiệm" }
        ],
        sampleTranslation: "Whether listening to music while studying or working actually boosts productivity depends on the genre and the nature of the task. When doing repetitive chores or visual design, soft instrumental music can block out background noise and create a pleasant mood. Conversely, if you are reading dense academic material or writing an English essay, songs with lyrics can easily distract the brain. Because people vary in their sensitivity to sound, there is no one-size-fits-all formula. The best approach is to experiment for a week to discover the working environment that suits you best."
    },
    {
        id: 63,
        level: "B1",
        title: "Tiêu Dùng Bền Vững Trong Đời Sống Hiện Đại",
        grammarFocus: ["Câu bị động", "Instead of + V-ing", "Từ vựng tiêu dùng & môi trường"],
        vietnameseText: "Thời trang nhanh và các sản phẩm giá rẻ khiến người tiêu dùng dễ mua sắm liên tục rồi vứt bỏ chỉ sau vài lần sử dụng. Xu hướng này tạo ra hàng triệu tấn rác thải mỗi năm và gây sức ép nặng nề lên tài nguyên thiên nhiên. Tiêu dùng bền vững khuyến khích chúng ta ưu tiên chất lượng hơn số lượng, sửa chữa đồ dùng khi còn dùng được và ủng hộ những thương hiệu minh bạch về quy trình sản xuất. Dù sản phẩm bền vững đôi khi có giá ban đầu cao hơn, tuổi thọ dài lâu lại giúp người mua tiết kiệm tiền về lâu dài. Thay đổi cách tiêu dùng hôm nay chính là cách thiết thực để bảo vệ tương lai chung.",
        hints: [
            { en: "fast fashion", vi: "thời trang nhanh" },
            { en: "quality over quantity", vi: "chất lượng hơn số lượng" },
            { en: "transparent", vi: "minh bạch" },
            { en: "in the long run", vi: "về lâu dài" }
        ],
        sampleTranslation: "Fast fashion and cheaply made goods encourage consumers to buy constantly and discard items after just a few uses. This trend generates millions of tons of waste every year and places heavy pressure on natural resources. Sustainable consumption encourages us to prioritize quality over quantity, repair items whenever possible, and support brands that are transparent about their production processes. Although sustainable products sometimes carry a higher upfront price, their longer lifespan saves buyers money in the long run. Changing how we consume today is a practical way to safeguard our shared future."
    },
    {
        id: 64,
        level: "B1",
        title: "Vai Trò Của Thư Viện Trong Thời Đại Số",
        grammarFocus: ["Even though / Although", "Hiện tại hoàn thành", "Mệnh đề quan hệ"],
        vietnameseText: "Nhiều người dự đoán rằng thư viện truyền thống sẽ dần biến mất khi hầu hết tài liệu đều có thể tìm thấy trên internet. Thực tế lại chứng minh điều ngược lại: thư viện hiện đại đang đổi mới mạnh mẽ để trở thành trung tâm học tập cộng đồng. Ngoài kho sách giấy và cơ sở dữ liệu học thuật có bản quyền, thư viện còn cung cấp không gian yên tĩnh, phòng họp nhóm và các buổi hướng dẫn kỹ năng nghiên cứu miễn phí. Đặc biệt đối với sinh viên chưa có điều kiện mua nhiều tài liệu đắt tiền, thư viện giúp thu hẹp khoảng cách tiếp cận tri thức. Vì vậy, giá trị của thư viện không hề giảm đi mà ngày càng trở nên thiết yếu hơn.",
        hints: [
            { en: "academic databases", vi: "cơ sở dữ liệu học thuật" },
            { en: "community learning hub", vi: "trung tâm học tập cộng đồng" },
            { en: "narrow the gap", vi: "thu hẹp khoảng cách" },
            { en: "indispensable / essential", vi: "thiết yếu" }
        ],
        sampleTranslation: "Many people predicted that traditional libraries would gradually vanish once nearly all information became searchable online. Reality has proven the opposite: modern libraries are transforming rapidly into vibrant community learning hubs. Beyond printed books and licensed academic databases, libraries offer quiet study areas, group meeting rooms, and free research skills workshops. Especially for students who cannot afford expensive textbooks, libraries help narrow the gap in access to knowledge. Consequently, the value of libraries has not diminished; instead, it has become even more essential."
    },
    {
        id: 65,
        level: "B1",
        title: "Chuyển Đổi Số Trong Giáo Dục Đại Học",
        grammarFocus: ["Câu bị động", "Hiện tại hoàn thành", "Từ nối kết quả"],
        vietnameseText: "Chuyển đổi số đang làm thay đổi sâu sắc cách giảng dạy và quản lý tại các trường đại học hiện nay. Sinh viên có thể nộp bài tập trực tuyến, tra cứu điểm số tức thì và tiếp cận kho bài giảng số hóa mọi lúc mọi nơi. Đối với giảng viên, các công cụ phân tích dữ liệu học tập giúp nhận diện sớm những sinh viên đang gặp khó khăn để hỗ trợ kịp thời. Tuy nhiên, công nghệ chỉ thực sự phát huy tác dụng khi nhà trường đầu tư đồng bộ vào đào tạo kỹ năng số cho cả thầy và trò. Mục tiêu cuối cùng của chuyển đổi số không phải là thay thế người thầy, mà là nâng cao chất lượng trải nghiệm học tập.",
        hints: [
            { en: "digital transformation", vi: "chuyển đổi số" },
            { en: "digitized lectures", vi: "bài giảng số hóa" },
            { en: "timely support", vi: "hỗ trợ kịp thời" },
            { en: "digital literacy", vi: "kỹ năng số" }
        ],
        sampleTranslation: "Digital transformation is profoundly changing how universities teach and manage operations today. Students can submit assignments online, check their grades instantly, and access digitized lectures anytime and anywhere. For lecturers, learning analytics tools help identify struggling students early so that timely support can be provided. However, technology only fulfills its potential when institutions invest consistently in digital literacy training for both faculty and students. The ultimate goal of digital transformation is not to replace teachers, but to elevate the quality of the learning experience."
    },
    {
        id: 66,
        level: "B1",
        title: "Sống Ở Thành Phố Lớn Hay Thị Trấn Nhỏ",
        grammarFocus: ["Mệnh đề tương phản (Whereas / While)", "So sánh hơn", "Mệnh đề quan hệ"],
        vietnameseText: "Quyết định sống ở thành phố lớn hay thị trấn nhỏ luôn là sự đánh đổi giữa cơ hội phát triển và sự bình yên. Các đô thị lớn thu hút người trẻ nhờ nguồn việc làm phong phú, dịch vụ y tế hiện đại và đời sống văn hóa đa dạng. Bù lại, cư dân thành phố phải đối mặt với chi phí sinh hoạt đắt đỏ, không khí ô nhiễm và nhịp sống vội vã quanh năm. Ngược lại, thị trấn nhỏ mang đến môi trường trong lành, cộng đồng gần gũi và ít áp lực hơn, dù cơ hội nghề nghiệp còn hạn chế. Lựa chọn phù hợp nhất thường thay đổi tùy theo từng giai đoạn cuộc đời và ưu tiên của mỗi cá nhân.",
        hints: [
            { en: "trade-off", vi: "sự đánh đổi" },
            { en: "cost of living", vi: "chi phí sinh hoạt" },
            { en: "fast-paced lifestyle", vi: "nhịp sống vội vã" },
            { en: "stage of life", vi: "giai đoạn cuộc đời" }
        ],
        sampleTranslation: "Deciding whether to live in a big city or a small town is always a trade-off between career opportunities and peace of mind. Major metropolises attract young people with abundant job prospects, modern healthcare, and vibrant cultural life. On the downside, city residents must cope with a high cost of living, air pollution, and a fast-paced lifestyle year-round. Conversely, small towns offer cleaner air, close-knit communities, and less stress, even though career options remain limited. The best choice often shifts depending on each individual's stage of life and personal priorities."
    },
    {
        id: 67,
        level: "B1",
        title: "Kỹ Năng Quản Lý Thời Gian Cho Người Trẻ",
        grammarFocus: ["Câu điều kiện loại 1", "Động từ nguyên mẫu chỉ mục đích", "Danh động từ"],
        vietnameseText: "Ai trong chúng ta cũng có đúng hai mươi bốn giờ mỗi ngày, nhưng cách sử dụng quỹ thời gian ấy lại tạo nên sự khác biệt lớn về kết quả. Quản lý thời gian tốt không có nghĩa là làm việc không ngừng nghỉ, mà là biết phân biệt giữa việc quan trọng và việc chỉ gây bận rộn. Lập danh sách ba mục tiêu ưu tiên vào mỗi tối trước khi ngủ giúp bạn bắt đầu ngày mới một cách chủ động và rõ ràng. Bên cạnh đó, hạn chế làm nhiều việc cùng lúc sẽ giúp giảm sai sót và hoàn thành nhiệm vụ nhanh hơn. Khi làm chủ được thời gian, người trẻ sẽ giảm bớt căng thẳng và tự tin hơn với kế hoạch tương lai.",
        hints: [
            { en: "distinguish between", vi: "phân biệt giữa" },
            { en: "top priorities", vi: "mục tiêu ưu tiên" },
            { en: "multitasking", vi: "làm nhiều việc cùng lúc" },
            { en: "take control of", vi: "làm chủ" }
        ],
        sampleTranslation: "Every one of us has exactly twenty-four hours in a day, yet how we use that time creates a huge difference in our outcomes. Good time management does not mean working nonstop; rather, it means distinguishing between tasks that truly matter and those that merely keep you busy. Listing three top priorities each evening before bed helps you start the next day with clarity and purpose. Furthermore, cutting back on multitasking reduces errors and allows you to finish tasks faster. When young people take control of their time, they experience less stress and feel more confident about their future plans."
    },
    {
        id: 68,
        level: "B1",
        title: "Lối Sống Tối Giản Và Hạnh Phúc Thực Sự",
        grammarFocus: ["Mệnh đề danh ngữ", "Not... but...", "Tính từ & Danh từ trừu tượng"],
        vietnameseText: "Lối sống tối giản ngày càng được nhiều người trẻ quan tâm như một cách giải thoát khỏi áp lực tiêu dùng quá mức. Thực chất, tối giản không phải là sống thiếu thốn hay vứt bỏ mọi vật dụng trong nhà, mà là chỉ giữ lại những gì thật sự có ích và mang lại niềm vui. Khi không gian sống gọn gàng hơn, tâm trí chúng ta cũng trở nên nhẹ nhõm và dễ tập trung vào các mối quan hệ ý nghĩa hơn. Thay vì chạy theo những món đồ mới nhất để chứng tỏ bản thân, người theo lối sống này thường ưu tiên đầu tư cho sức khỏe và trải nghiệm. Nhờ đó, họ nhận ra hạnh phúc bền vững đến từ sự đủ đầy bên trong hơn là sở hữu vật chất.",
        hints: [
            { en: "minimalist lifestyle", vi: "lối sống tối giản" },
            { en: "overconsumption", vi: "tiêu dùng quá mức" },
            { en: "clutter-free", vi: "gọn gàng, không bừa bộn" },
            { en: "material possessions", vi: "sở hữu vật chất" }
        ],
        sampleTranslation: "The minimalist lifestyle is attracting growing interest among young people as a way to break free from the pressure of overconsumption. In essence, minimalism is not about living in deprivation or throwing everything away, but about keeping only what is truly useful and brings joy. When our living space becomes clutter-free, our minds also feel lighter and better able to focus on meaningful relationships. Instead of chasing the latest gadgets to prove their worth, minimalists tend to invest in health and experiences. As a result, they realize that lasting happiness comes from inner fulfillment rather than material possessions."
    },
    {
        id: 69,
        level: "B1",
        title: "Ảnh Hưởng Của Quảng Cáo Đến Quyết Định Mua Hàng",
        grammarFocus: ["Câu bị động", "Mệnh đề quan hệ", "Cấu trúc persuade / tempt O to V"],
        vietnameseText: "Quảng cáo xuất hiện ở khắp mọi nơi, từ bảng hiệu ngoài phố cho đến từng video ngắn trên mạng xã hội. Nhờ thuật toán phân tích hành vi người dùng, các thương hiệu ngày nay có thể hiển thị đúng sản phẩm mà bạn vừa tìm kiếm vài phút trước. Những thông điệp khéo léo kết hợp cùng hình ảnh bắt mắt thường kích thích cảm xúc và khiến người xem tin rằng mình đang rất cần món hàng đó. Dù quảng cáo giúp khách hàng biết đến nhiều sản phẩm mới hữu ích, nó cũng dễ dẫn đến việc chi tiêu vượt quá kế hoạch. Vì vậy, tạm dừng suy nghĩ hai mươi bốn giờ trước khi thanh toán là thói quen đơn giản nhưng rất hiệu quả.",
        hints: [
            { en: "billboards", vi: "bảng hiệu ngoài phố" },
            { en: "algorithms", vi: "thuật toán" },
            { en: "eye-catching visuals", vi: "hình ảnh bắt mắt" },
            { en: "overspending", vi: "chi tiêu vượt quá kế hoạch" }
        ],
        sampleTranslation: "Advertisements appear everywhere, from street billboards to every short video on social media. Powered by algorithms that analyze user behavior, brands today can display the exact product you searched for just minutes ago. Clever messages paired with eye-catching visuals often trigger emotions and convince viewers that they urgently need the item. Although advertising helps consumers discover useful new products, it can also easily lead to overspending beyond one's budget. Therefore, pausing for twenty-four hours before checking out is a simple yet highly effective habit."
    },
    {
        id: 70,
        level: "B1",
        title: "Chuẩn Bị Gì Cho Nghề Nghiệp Tương Lai",
        grammarFocus: ["Tương lai đơn & Hiện tại hoàn thành", "Mệnh đề quan hệ", "Cấu trúc kết hợp động từ"],
        vietnameseText: "Thế giới việc làm đang thay đổi nhanh đến mức nhiều ngành nghề của thập kỷ tới có thể chưa từng tồn tại hôm nay. Để chuẩn bị vững vàng, sinh viên không nên chỉ học thuộc lý thuyết trong sách giáo khoa mà cần tham gia dự án thực tế và các kỳ thực tập sớm. Bên cạnh ngoại ngữ và kỹ năng công nghệ, khả năng tư duy giải quyết vấn đề và làm việc liên ngành sẽ là lợi thế cạnh tranh lớn. Xây dựng một hồ sơ năng lực trực tuyến ghi lại các sản phẩm đã làm cũng giúp nhà tuyển dụng đánh giá rõ năng lực của bạn hơn. Sự chủ động ngay từ giảng đường chính là nền móng cho một sự nghiệp bền vững.",
        hints: [
            { en: "internships", vi: "kỳ thực tập" },
            { en: "interdisciplinary collaboration", vi: "làm việc liên ngành" },
            { en: "competitive edge", vi: "lợi thế cạnh tranh" },
            { en: "online portfolio", vi: "hồ sơ năng lực trực tuyến" }
        ],
        sampleTranslation: "The job market is evolving so rapidly that many careers of the next decade may not even exist today. To prepare thoroughly, students should not merely memorize textbook theories; instead, they need to join hands-on projects and pursue internships early. Alongside foreign languages and digital skills, problem-solving ability and interdisciplinary collaboration will offer a major competitive edge. Building an online portfolio that showcases completed work also helps recruiters accurately assess your capabilities. Taking initiative while still in university lays the foundation for a sustainable career."
    },

    /* ===================== B2: 71–76 (Trung cao cấp) ===================== */
    {
        id: 71,
        level: "B2",
        title: "Trí Tuệ Nhân Tạo Và Thị Trường Lao Động",
        grammarFocus: ["Mệnh đề phân từ (Participle clauses)", "Câu bị động nâng cao", "Từ vựng học thuật"],
        vietnameseText: "Sự bùng nổ của trí tuệ nhân tạo tạo sinh đang làm dấy lên lo ngại sâu sắc rằng hàng triệu công việc văn phòng sẽ sớm bị tự động hóa. Không thể phủ nhận rằng nhiều tác vụ lặp lại như nhập liệu, tóm tắt tài liệu hay kiểm thử cơ bản đang được máy móc thực hiện với tốc độ vượt trội. Tuy nhiên, lịch sử các cuộc cách mạng công nghiệp cho thấy công nghệ không chỉ xóa bỏ nghề cũ mà còn khai sinh những vị trí đòi hỏi năng lực phán đoán phức tạp hơn. Thách thức thực sự không nằm ở việc cạnh tranh trực diện với máy móc, mà ở tốc độ đào tạo lại lực lượng lao động để phối hợp hiệu quả cùng công cụ thông minh. Những tổ chức đầu tư sớm vào con người thay vì chỉ cắt giảm nhân sự mới có thể tạo ra giá trị bền vững.",
        hints: [
            { en: "generative AI", vi: "trí tuệ nhân tạo tạo sinh" },
            { en: "repetitive tasks", vi: "tác vụ lặp lại" },
            { en: "complex judgment", vi: "năng lực phán đoán phức tạp" },
            { en: "reskill the workforce", vi: "đào tạo lại lực lượng lao động" }
        ],
        sampleTranslation: "The rapid rise of generative artificial intelligence has sparked deep concern that millions of white-collar jobs will soon be automated. Undeniably, many repetitive tasks such as data entry, document summarization, and basic testing are already being handled by machines at unmatched speed. Nevertheless, the history of industrial revolutions shows that technology does not merely eliminate old roles; it also creates positions demanding more complex human judgment. The real challenge lies not in competing head-to-head with machines, but in how swiftly we can reskill the workforce to collaborate effectively with intelligent tools. Only organizations that invest early in people, rather than simply downsizing staff, will generate lasting value."
    },
    {
        id: 72,
        level: "B2",
        title: "Quyền Riêng Tư Dữ Liệu Trong Kỷ Nguyên Kết Nối",
        grammarFocus: ["Mệnh đề nhượng bộ (While)", "Câu bị động", "Danh từ hóa"],
        vietnameseText: "Mỗi khi người dùng cài đặt một ứng dụng miễn phí hoặc thanh toán không tiền mặt, một lượng lớn dữ liệu cá nhân âm thầm được thu thập và phân tích. Mặc dù việc cá nhân hóa dịch vụ mang lại trải nghiệm mượt mà hơn, ranh giới giữa hỗ trợ người dùng và xâm phạm quyền riêng tư ngày càng trở nên mong manh. Đáng lo ngại hơn, nhiều người thường bấm đồng ý điều khoản sử dụng mà chưa từng đọc xem thông tin của mình sẽ được chia sẻ với bên thứ ba nào. Nếu không có khung pháp lý nghiêm ngặt và cơ chế minh bạch từ các nền tảng công nghệ, rủi ro rò rỉ dữ liệu hay lừa đảo trực tuyến sẽ tiếp tục gia tăng. Bảo vệ dữ liệu cá nhân vì thế không chỉ là vấn đề kỹ thuật mà còn là quyền cơ bản của công dân số.",
        hints: [
            { en: "cashless payment", vi: "thanh toán không tiền mặt" },
            { en: "thin line", vi: "ranh giới mong manh" },
            { en: "third parties", vi: "bên thứ ba" },
            { en: "regulatory framework", vi: "khung pháp lý" }
        ],
        sampleTranslation: "Every time users install a free app or make a cashless payment, vast amounts of personal data are quietly collected and analyzed. While service personalization delivers a smoother experience, the line between assisting users and invading privacy has become increasingly thin. More worryingly, many people routinely click agree on terms of service without ever reading which third parties their information may be shared with. Without strict regulatory frameworks and transparent practices from technology platforms, the risks of data breaches and online fraud will continue to escalate. Protecting personal data is therefore not merely a technical issue, but a fundamental right of digital citizens."
    },
    {
        id: 73,
        level: "B2",
        title: "Kinh Tế Tuần Hoàn Và Trách Nhiệm Doanh Nghiệp",
        grammarFocus: ["Cấu trúc Rather than", "Mệnh đề quan hệ không xác định", "Collocations kinh tế"],
        vietnameseText: "Mô hình kinh tế tuyến tính truyền thống dựa trên chu trình khai thác, sản xuất rồi thải bỏ đang đẩy nhiều hệ sinh thái đến ngưỡng quá tải. Trước áp lực biến đổi khí hậu và khan hiếm nguyên liệu, ngày càng nhiều doanh nghiệp buộc phải chuyển dịch sang mô hình kinh tế tuần hoàn. Thay vì xem phế phẩm là gánh nặng xử lý, cách tiếp cận này thiết kế sản phẩm sao cho dễ sửa chữa, tái chế và đưa vật liệu quay trở lại chuỗi giá trị. Dù quá trình chuyển đổi đòi hỏi chi phí đầu tư ban đầu đáng kể cho nghiên cứu và chuỗi cung ứng, các doanh nghiệp tiên phong lại giành được niềm tin lớn từ thế hệ người tiêu dùng có ý thức. Về dài hạn, phát triển xanh không còn là lựa chọn mang tính hình thức mà đã trở thành điều kiện sống còn để duy trì năng lực cạnh tranh.",
        hints: [
            { en: "linear economy", vi: "kinh tế tuyến tính" },
            { en: "circular economy", vi: "kinh tế tuần hoàn" },
            { en: "supply chain", vi: "chuỗi cung ứng" },
            { en: "vital prerequisite", vi: "điều kiện sống còn" }
        ],
        sampleTranslation: "The traditional linear economic model, built on extracting, producing, and discarding, is pushing numerous ecosystems past their breaking point. Facing climate pressure and resource scarcity, an increasing number of businesses are being compelled to transition toward a circular economy. Rather than treating waste as a disposal burden, this approach designs products to be easily repaired and recycled, returning materials to the value chain. Although the shift demands substantial upfront investment in research and supply chains, pioneering firms earn strong trust from environmentally conscious consumers. In the long run, green growth is no longer a symbolic gesture, but a vital prerequisite for staying competitive."
    },
    {
        id: 74,
        level: "B2",
        title: "Đô Thị Hóa Nhanh Và Bài Toán Nhà Ở",
        grammarFocus: ["Câu chẻ (Cleft sentences)", "Mệnh đề phân từ", "Từ nối nguyên nhân – hệ quả"],
        vietnameseText: "Quá trình đô thị hóa diễn ra với tốc độ chóng mặt đã biến nhiều thành phố thành đầu tàu kinh tế, nhưng đồng thời đẩy giá nhà lên vượt xa thu nhập của đại đa số người lao động trẻ. Khi chi phí thuê và mua nhà ở khu vực trung tâm tăng liên tục, nhiều gia đình buộc phải dịch chuyển ra vùng ngoại ô xa xôi, làm tăng thời gian di chuyển và áp lực lên hạ tầng giao thông. Nếu thiếu các chính sách quy hoạch đồng bộ về nhà ở xã hội và khu đô thị vệ tinh, khoảng cách giàu nghèo trong đô thị sẽ ngày càng bị khoét sâu. Chính sự kết hợp giữa quy hoạch dài hạn, kiểm soát đầu cơ bất động sản và phát triển giao thông công cộng mới có thể giải quyết bài toán này một cách căn cơ. Một thành phố đáng sống phải là nơi người lao động bình thường vẫn có cơ hội an cư ổn định.",
        hints: [
            { en: "rapid urbanization", vi: "đô thị hóa nhanh" },
            { en: "out of reach", vi: "vượt xa tầm với" },
            { en: "satellite towns", vi: "khu đô thị vệ tinh" },
            { en: "real estate speculation", vi: "đầu cơ bất động sản" }
        ],
        sampleTranslation: "Rapid urbanization has turned many cities into economic powerhouses, yet it has simultaneously pushed housing prices far beyond the income of most young workers. As rents and home prices in central districts climb relentlessly, many families are forced to relocate to distant suburbs, lengthening commutes and straining transport infrastructure. Without coordinated policies on affordable housing and well-planned satellite towns, the urban wealth gap will continue to widen. It is the combination of long-term urban planning, curbs on real estate speculation, and expanded public transit that can tackle this challenge at its roots. A truly livable city must be one where ordinary workers still have a fair chance to settle down securely."
    },
    {
        id: 75,
        level: "B2",
        title: "Tư Duy Phản Biện Trong Thời Đại Tin Giả",
        grammarFocus: ["Mệnh đề điều kiện hỗn hợp / loại 2", "Câu bị động với động từ khuyết thiếu", "Từ vựng truyền thông"],
        vietnameseText: "Trong môi trường truyền thông số nơi tốc độ chia sẻ thường được ưu tiên hơn độ chính xác, tin giả có khả năng lan truyền nhanh gấp nhiều lần thông tin đã kiểm chứng. Những tiêu đề giật gân được thiết kế khéo léo nhằm đánh vào nỗi sợ hãi hoặc sự phẫn nộ khiến không ít độc giả chia sẻ ngay mà chưa kịp xác minh nguồn gốc. Hệ quả là niềm tin xã hội bị xói mòn và các quyết định quan trọng về sức khỏe hay tài chính có thể bị dẫn dắt sai lệch. Do vậy, rèn luyện tư duy phản biện—biết đối chiếu nhiều nguồn độc lập, phân biệt dữ kiện với quan điểm cá nhân—đã trở thành kỹ năng sinh tồn thiết yếu. Giáo dục truyền thông cần được lồng ghép sớm vào nhà trường thay vì để người trẻ tự xoay xở giữa biển thông tin hỗn loạn.",
        hints: [
            { en: "sensational headlines", vi: "tiêu đề giật gân" },
            { en: "verify the source", vi: "xác minh nguồn gốc" },
            { en: "erode public trust", vi: "xói mòn niềm tin xã hội" },
            { en: "media literacy", vi: "giáo dục truyền thông" }
        ],
        sampleTranslation: "In a digital media landscape where sharing speed is often prioritized over accuracy, misinformation can spread many times faster than verified facts. Sensational headlines crafted to trigger fear or outrage lead countless readers to hit share before verifying the source. Consequently, public trust is eroded, and critical decisions regarding health or finance can be seriously misled. Developing critical thinking—cross-checking independent sources and distinguishing objective facts from personal opinion—has therefore become an essential survival skill. Media literacy ought to be integrated into school curricula early rather than leaving young people to navigate a chaotic flood of information on their own."
    },
    {
        id: 76,
        level: "B2",
        title: "Toàn Cầu Hóa Và Bản Sắc Văn Hóa Địa Phương",
        grammarFocus: ["Mệnh đề nhượng bộ (While / Whereas)", "Danh động từ & Danh từ hóa", "Collocations học thuật"],
        vietnameseText: "Toàn cầu hóa mở ra cơ hội giao lưu chưa từng có giữa các nền văn hóa, giúp người trẻ dễ dàng tiếp cận âm nhạc, ẩm thực và tri thức từ khắp năm châu. Tuy nhiên, quá trình hội nhập sâu rộng cũng làm nảy sinh nỗi lo rằng các giá trị truyền thống và ngôn ngữ địa phương có nguy cơ bị đồng hóa trước làn sóng văn hóa đại chúng toàn cầu. Thực tế cho thấy hội nhập và giữ gìn bản sắc không nhất thiết phải đối lập nhau nếu cộng đồng biết cách làm mới di sản theo ngôn ngữ của thời đại. Nhiều nghệ sĩ trẻ hiện nay đã khéo léo kết hợp nhạc cụ dân tộc với âm nhạc hiện đại, đưa văn hóa bản địa vươn ra sân khấu quốc tế một cách đầy tự hào. Bản sắc văn hóa chỉ thực sự sống động khi nó tiếp tục được sáng tạo chứ không chỉ nằm yên trong viện bảo tàng.",
        hints: [
            { en: "cultural exchange", vi: "giao lưu văn hóa" },
            { en: "assimilated / homogenized", vi: "bị đồng hóa" },
            { en: "global pop culture", vi: "văn hóa đại chúng toàn cầu" },
            { en: "traditional instruments", vi: "nhạc cụ dân tộc" }
        ],
        sampleTranslation: "Globalization has opened up unprecedented opportunities for cultural exchange, enabling young people to easily access music, cuisine, and knowledge from across the globe. Yet deep integration has also sparked concerns that local traditions and languages risk being homogenized by the wave of global pop culture. In reality, global integration and preserving identity need not be opposing forces if communities find creative ways to revitalize heritage for contemporary audiences. Many young artists today skillfully blend traditional instruments with modern music, proudly bringing indigenous culture onto the international stage. Cultural identity remains truly alive only when it continues to be reinvented rather than sitting untouched inside museums."
    },

    /* ===================== C1: 77–80 (Cao cấp) ===================== */
    {
        id: 77,
        level: "C1",
        title: "Nghịch Lý Của Sự Lựa Chọn Trong Xã Hội Tiêu Dùng",
        grammarFocus: ["Đảo ngữ (Not only... / Rarely...)", "Danh từ hóa nâng cao", "Hedging học thuật"],
        vietnameseText: "Từ lâu, tự do lựa chọn vẫn được mặc nhiên xem là thước đo quan trọng của sự thịnh vượng và quyền tự quyết cá nhân. Thế nhưng, các nghiên cứu tâm lý học hành vi chỉ ra một nghịch lý đáng suy ngẫm: khi đứng trước quá nhiều phương án tương đương, con người không những không cảm thấy thỏa mãn hơn mà còn dễ rơi vào trạng thái tê liệt quyết định. Áp lực phải tìm ra lựa chọn tối ưu nhất khiến chi phí cơ hội của những phương án bị bỏ qua trở nên nặng nề hơn trong tâm trí người tiêu dùng. Hệ quả là ngay cả sau khi đã đưa ra quyết định, cảm giác hối tiếc mơ hồ vẫn thường âm ỉ làm giảm niềm vui thực sự. Hiếm khi người ta nhận ra rằng một phạm vi lựa chọn có chọn lọc, thay vì sự dư thừa vô hạn, mới là điều kiện nuôi dưỡng sự an tâm và hài lòng bền vững.",
        hints: [
            { en: "paradox of choice", vi: "nghịch lý của sự lựa chọn" },
            { en: "decision paralysis", vi: "tê liệt quyết định" },
            { en: "opportunity cost", vi: "chi phí cơ hội" },
            { en: "lingering regret", vi: "cảm giác hối tiếc âm ỉ" }
        ],
        sampleTranslation: "Freedom of choice has long been taken for granted as a vital measure of prosperity and personal autonomy. Yet behavioral psychology research points to a thought-provoking paradox: when confronted with an overwhelming array of comparable options, not only do people fail to feel more satisfied, but they also frequently fall into decision paralysis. The pressure to identify the single optimal choice magnifies the perceived opportunity cost of every rejected alternative. Consequently, even after a decision has been made, a lingering sense of regret often quietly diminishes genuine enjoyment. Rarely do individuals recognize that a thoughtfully curated range of options, rather than boundless abundance, is what truly fosters peace of mind and lasting contentment."
    },
    {
        id: 78,
        level: "C1",
        title: "Đạo Đức Công Nghệ Và Quyền Tự Chủ Của Con Người",
        grammarFocus: ["Đảo ngữ với Only when / Should", "Mệnh đề phân từ hiện tại", "Văn phong nghị luận C1"],
        vietnameseText: "Khi các hệ thống thuật toán ngày càng tham gia sâu vào những quyết định nhạy cảm như xét duyệt tín dụng, tuyển dụng hay chẩn đoán y khoa, câu hỏi về đạo đức công nghệ không còn mang tính lý thuyết xa vời. Nếu dữ liệu huấn luyện vốn mang sẵn định kiến lịch sử của xã hội, chính các mô hình tự động ấy có thể vô tình tái sản xuất và hợp thức hóa sự bất công dưới lớp vỏ khách quan của con số. Đáng chú ý hơn, việc phó mặc phán đoán cho những hệ thống hộp đen thiếu khả năng giải trình sẽ dần làm suy giảm quyền tự chủ và trách nhiệm đạo đức của con người. Chỉ khi tính minh bạch, khả năng kiểm toán độc lập và quyền giám sát của con người được đặt làm nguyên tắc cốt lõi ngay từ khâu thiết kế, công nghệ mới thực sự phục vụ lợi ích chung. Tiến bộ kỹ thuật chỉ có ý nghĩa trọn vẹn khi nó củng cố phẩm giá con người chứ không thay thế tiếng nói của lương tri.",
        hints: [
            { en: "historical biases", vi: "định kiến lịch sử" },
            { en: "black-box systems", vi: "hệ thống hộp đen" },
            { en: "accountability", vi: "khả năng giải trình" },
            { en: "human dignity", vi: "phẩm giá con người" }
        ],
        sampleTranslation: "As algorithmic systems become increasingly embedded in high-stakes decisions such as credit approval, hiring, and medical diagnosis, questions of technological ethics are no longer distant theoretical debates. Should training data already reflect historical societal biases, these automated models may inadvertently reproduce and legitimize inequality beneath a veneer of numerical objectivity. More critically, delegating judgment to opaque black-box systems lacking accountability gradually erodes human autonomy and moral responsibility. Only when transparency, independent auditing, and meaningful human oversight are established as core principles from the design stage onward can technology genuinely serve the public good. Technical progress achieves its fullest meaning only when it upholds human dignity rather than silencing the voice of conscience."
    },
    {
        id: 79,
        level: "C1",
        title: "Chính Sách Giáo Dục Đại Học Trước Biến Động Kinh Tế Tri Thức",
        grammarFocus: ["Bàng thái cách (Subjunctive)", "Mệnh đề quan hệ nâng cao", "Từ vựng học thuật chính sách"],
        vietnameseText: "Trong nền kinh tế tri thức biến động không ngừng, mô hình đào tạo đại học khép kín kéo dài bốn năm theo giáo trình cố định đang bộc lộ nhiều giới hạn rõ rệt. Khoảng cách giữa những gì được giảng dạy trong nhà trường và năng lực thực tế mà thị trường yêu cầu đòi hỏi các nhà hoạch định chính sách phải tái cấu trúc tư duy giáo dục một cách toàn diện. Điều cấp thiết là các trường đại học cần thiết kế lộ trình học tập linh hoạt theo học phần, khuyến khích nghiên cứu liên ngành và gắn kết chặt chẽ hơn với doanh nghiệp cũng như cộng đồng khoa học quốc tế. Song song đó, giáo dục đại học không nên bị thu hẹp thành một dây chuyền đào tạo nghề thuần túy mà phải nuôi dưỡng tư duy độc lập, đạo đức nghề nghiệp và khả năng tự tái tạo năng lực suốt đời. Một hệ thống đại học tiên tiến sẽ không chỉ đáp ứng nhu cầu thị trường hiện tại mà còn đào tạo nên những công dân đủ bản lĩnh kiến tạo tương lai.",
        hints: [
            { en: "knowledge economy", vi: "kinh tế tri thức" },
            { en: "policymakers", vi: "nhà hoạch định chính sách" },
            { en: "modular learning pathways", vi: "lộ trình học tập linh hoạt theo học phần" },
            { en: "vocational assembly line", vi: "dây chuyền đào tạo nghề thuần túy" }
        ],
        sampleTranslation: "In a rapidly shifting knowledge economy, the closed four-year university model anchored to a static curriculum is revealing clear structural limitations. The widening gap between what is taught in lecture halls and the capabilities demanded by the market requires that policymakers fundamentally rethink higher education. It is imperative that universities design flexible, modular learning pathways, foster interdisciplinary research, and forge stronger links with both industry and the global scientific community. At the same time, higher education must not be reduced to a mere vocational assembly line; rather, it should cultivate independent reasoning, professional ethics, and lifelong self-renewal. A forward-looking university system does more than supply today's labor market—it nurtures citizens equipped to shape the future."
    },
    {
        id: 80,
        level: "C1",
        title: "Khả Năng Thích Ứng Khí Hậu Và Công Bằng Liên Thế Hệ",
        grammarFocus: ["Đảo ngữ & Nhượng bộ phức hợp", "Mệnh đề phân từ", "Văn phong học thuật quốc tế"],
        vietnameseText: "Biến đổi khí hậu không đơn thuần là một khủng hoảng môi trường mang tính kỹ thuật, mà sâu xa hơn là bài kiểm tra đạo đức về công bằng liên thế hệ. Những cộng đồng ven biển và các quốc gia đang phát triển—vốn đóng góp rất ít vào tổng lượng phát thải lịch sử—lại đang phải hứng chịu những hậu quả khắc nghiệt nhất từ nước biển dâng và thời tiết cực đoan. Nếu các chiến lược thích ứng chỉ tập trung vào những công trình hạ tầng tốn kém mà bỏ qua sinh kế của người dân dễ bị tổn thương, bất bình đẳng xã hội sẽ tiếp tục trầm trọng hơn sau mỗi mùa thiên tai. Đứng trước thực tế ấy, hợp tác quốc tế thực chất về tài chính khí hậu và chuyển giao công nghệ sạch không thể bị trì hoãn thêm nữa bởi lợi ích kinh tế ngắn hạn. Cách thế hệ hôm nay hành động trước thách thức khí hậu sẽ quyết định liệu chúng ta để lại cho mai sau một hành tinh đáng sống hay một món nợ sinh thái không thể trả nổi.",
        hints: [
            { en: "intergenerational justice", vi: "công bằng liên thế hệ" },
            { en: "historical emissions", vi: "lượng phát thải lịch sử" },
            { en: "vulnerable livelihoods", vi: "sinh kế dễ bị tổn thương" },
            { en: "ecological debt", vi: "món nợ sinh thái" }
        ],
        sampleTranslation: "Climate change is not merely a technical environmental crisis; at a deeper level, it is a profound moral test of intergenerational justice. Coastal communities and developing nations—having contributed only a small fraction of historical global emissions—are nonetheless bearing the brunt of rising sea levels and extreme weather events. Should adaptation strategies focus solely on costly infrastructure while overlooking the livelihoods of vulnerable populations, social inequality will deepen in the aftermath of every natural disaster. Confronted with this reality, substantive international cooperation on climate finance and clean technology transfer can no longer be deferred for the sake of short-term economic gain. How today's generation responds to the climate challenge will ultimately determine whether we bequeath to the future a livable planet or an unpayable ecological debt."
    }
];
