/* ==========================================================================
   QEnglish - Sacred Default Deck (20 Original Words) & Rich Vocabulary Data
   ========================================================================== */

const DEFAULT_DECK = [
    // Ngày 1 - STEM (10 từ)
    { id: 1, day: 1, term: "Semiconductor", ipa: "/ˌsem.i.kənˈdʌk.tər/ (n)", def: "Chất bán dẫn.", example: "Silicon is a common semiconductor used in microchips.", category: "STEM", starred: false },
    { id: 2, day: 1, term: "Circuit", ipa: "/ˈsɜː.kɪt/ (n)", def: "Mạch điện.", example: "This electric circuit connects directly to the main power source.", category: "STEM", starred: false },
    { id: 3, day: 1, term: "Transistor", ipa: "/trænˈzɪs.tər/ (n)", def: "Bóng bán dẫn / Linh kiện bán dẫn.", example: "Modern computer processors contain billions of tiny transistors.", category: "STEM", starred: false },
    { id: 4, day: 1, term: "Current", ipa: "/ˈkʌr.ənt/ (n)", def: "Dòng điện.", example: "Electric current flows efficiently through copper wiring.", category: "STEM", starred: false },
    { id: 5, day: 1, term: "Voltage", ipa: "/ˈvəʊl.tɪdʒ/ (n)", def: "Điện áp.", example: "High voltage electrical components require special protection.", category: "STEM", starred: false },
    { id: 6, day: 1, term: "Microchip", ipa: "/ˈmaɪ.krəʊ.tʃɪp/ (n)", def: "Vi mạch.", example: "A tiny microchip controls the memory system of the computer.", category: "STEM", starred: false },
    { id: 7, day: 1, term: "Conductor", ipa: "/kənˈdʌk.tər/ (n)", def: "Vật dẫn điện.", example: "Gold is an excellent electrical conductor used in high-end circuits.", category: "STEM", starred: false },
    { id: 8, day: 1, term: "Component", ipa: "/kəmˈpəʊ.nənt/ (n)", def: "Linh kiện / Thành phần.", example: "Each electronic component performs a vital function in the system.", category: "STEM", starred: false },
    { id: 9, day: 1, term: "Resistance", ipa: "/rɪˈzɪs.təns/ (n)", def: "Điện trở.", example: "Superconductors display zero electrical resistance at low temperatures.", category: "STEM", starred: false },
    { id: 10, day: 1, term: "Integration", ipa: "/ˌɪn.tɪˈɡreɪ.ʃən/ (n)", def: "Sự tích hợp (Mạch tích hợp).", example: "Large-scale system integration enables faster microprocessors.", category: "STEM", starred: false },

    // Ngày 1 - Campus (10 từ)
    { id: 11, day: 1, term: "Syllabus", ipa: "/ˈsɪl.ə.bəs/ (n)", def: "Đề cương môn học.", example: "Please review the course syllabus for assignment details.", category: "Campus", starred: false },
    { id: 12, day: 1, term: "Assignment", ipa: "/əˈsaɪn.mənt/ (n)", def: "Bài tập về nhà / Tiểu luận.", example: "Students must submit their homework assignment by midnight.", category: "Campus", starred: false },
    { id: 13, day: 1, term: "Deadline", ipa: "/ˈded.laɪn/ (n)", def: "Hạn chót.", example: "Meeting the project deadline is required for a passing grade.", category: "Campus", starred: false },
    { id: 14, day: 1, term: "Lecture", ipa: "/ˈlek.tʃər/ (n)", def: "Bài giảng đại học.", example: "The professor delivered an engaging lecture on computer science.", category: "Campus", starred: false },
    { id: 15, day: 1, term: "Campus", ipa: "/ˈkæm.pəs/ (n)", def: "Khuôn viên đại học.", example: "The university campus features modern academic facilities.", category: "Campus", starred: false },
    { id: 16, day: 1, term: "Presentation", ipa: "/ˌprez.ənˈteɪ.ʃən/ (n)", def: "Bài thuyết trình.", example: "Our team gave a comprehensive presentation during the seminar.", category: "Campus", starred: false },
    { id: 17, day: 1, term: "Attendance", ipa: "/əˈten.dəns/ (n)", def: "Sự điểm danh / Chuyên cần.", example: "Class attendance accounts for ten percent of the overall mark.", category: "Campus", starred: false },
    { id: 18, day: 1, term: "Discussion", ipa: "/dɪˈskʌʃ.ən/ (n)", def: "Cuộc thảo luận nhóm.", example: "Active group discussion enhances critical understanding of topics.", category: "Campus", starred: false },
    { id: 19, day: 1, term: "Prerequisite", ipa: "/ˌpriːˈrek.wɪ.zɪt/ (n)", def: "Môn học tiên quyết.", example: "Basic algebra is a prerequisite for advanced circuit analysis.", category: "Campus", starred: false },
    { id: 20, day: 1, term: "Feedback", ipa: "/ˈfiːd.bæk/ (n)", def: "Phản hồi / Nhận xét.", example: "Constructive feedback from lecturers helps improve writing skills.", category: "Campus", starred: false },
    {"id": 21, "term": "University", "ipa": "/ˌjuː.nɪˈvɜː.sə.ti/ (n)", "def": "Trường đại học.", "example": "FPT University TP.HCM provides modern facilities for students.", "category": "Education", "pos": "noun", "level": "A1", "starred": false, "day": 1},
    {"id": 22, "term": "Library", "ipa": "/ˈlaɪ.brər.i/ (n)", "def": "Thư viện.", "example": "Students often borrow textbooks from the campus library.", "category": "Education", "pos": "noun", "level": "A1", "starred": false, "day": 1},
    {"id": 23, "term": "Schedule", "ipa": "/ˈskedʒ.uːl/ (n)", "def": "Lịch trình, thời khóa biểu.", "example": "Check your class schedule on the student portal every Sunday.", "category": "Daily Life", "pos": "noun", "level": "A1", "starred": false, "day": 1},
    {"id": 24, "term": "Classmate", "ipa": "/ˈklɑːs.meɪt/ (n)", "def": "Bạn cùng lớp.", "example": "My classmates are friendly and always help me with coursework.", "category": "Education", "pos": "noun", "level": "A1", "starred": false, "day": 1},
    {"id": 25, "term": "Cafeteria", "ipa": "/ˌkæf.əˈtɪə.ri.ə/ (n)", "def": "Quán ăn tự phục vụ, căng tin.", "example": "We usually have lunch at the university cafeteria.", "category": "Food and Drinks", "pos": "noun", "level": "A1", "starred": false, "day": 1},
    {"id": 26, "term": "Healthy", "ipa": "/ˈhel.θi/ (adj)", "def": "Lành mạnh, tốt cho sức khỏe.", "example": "Eating fresh vegetables keeps your body healthy during exam periods.", "category": "Health", "pos": "adj", "level": "A1", "starred": false, "day": 2},
    {"id": 27, "term": "Commute", "ipa": "/kəˈmjuːt/ (v)", "def": "Đi lại hàng ngày giữa nhà và nơi học/làm.", "example": "Many undergraduates commute to campus by public bus.", "category": "Transportation", "pos": "verb", "level": "A2", "starred": false, "day": 2},
    {"id": 28, "term": "Budget", "ipa": "/ˈbʌdʒ.ɪt/ (n)", "def": "Ngân sách, khoản tiền dự trù.", "example": "Living away from home teaches students how to manage a monthly budget.", "category": "Business and Economics", "pos": "noun", "level": "A2", "starred": false, "day": 2},
    {"id": 29, "term": "Routine", "ipa": "/ruːˈtiːn/ (n)", "def": "Thói quen hàng ngày, nề nếp thường nhật.", "example": "A consistent morning routine boosts concentration throughout the day.", "category": "Daily Life", "pos": "noun", "level": "A2", "starred": false, "day": 2},
    {"id": 30, "term": "Convenient", "ipa": "/kənˈviː.ni.ənt/ (adj)", "def": "Thuận tiện, tiện lợi.", "example": "Online library access is extremely convenient for busy students.", "category": "Technology", "pos": "adj", "level": "A2", "starred": false, "day": 2},
    {"id": 31, "term": "Methodology", "ipa": "/ˌmeθ.əˈdɒl.ə.dʒi/ (n)", "def": "Phương pháp luận nghiên cứu.", "example": "The research methodology must be clearly explained in the academic paper.", "category": "Academic English", "pos": "noun", "level": "B2", "starred": false, "day": 3},
    {"id": 32, "term": "Curriculum", "ipa": "/kəˈrɪk.jə.ləm/ (n)", "def": "Chương trình giảng dạy chính khóa.", "example": "The software engineering curriculum integrates modern artificial intelligence.", "category": "Education", "pos": "noun", "level": "B2", "starred": false, "day": 3},
    {"id": 33, "term": "Sustainable", "ipa": "/səˈsteɪ.nə.bəl/ (adj)", "def": "Bền vững, bảo vệ môi trường lâu dài.", "example": "Renewable energy provides a sustainable alternative to fossil fuels.", "category": "Environment", "pos": "adj", "level": "B2", "starred": false, "day": 3},
    {"id": 34, "term": "Collaborate", "ipa": "/kəˈlæb.ə.reɪt/ (v)", "def": "Hợp tác, cộng tác làm việc.", "example": "Engineers and designers must collaborate closely to build intuitive software.", "category": "Work and Career", "pos": "verb", "level": "B2", "starred": false, "day": 3},
    {"id": 35, "term": "Optimize", "ipa": "/ˈɒp.tɪ.maɪz/ (v)", "def": "Tối ưu hóa, tinh chỉnh đạt hiệu suất cao nhất.", "example": "Developers write clean code to optimize system performance.", "category": "Technology", "pos": "verb", "level": "B2", "starred": false, "day": 3},
    {"id": 36, "term": "Resilience", "ipa": "/rɪˈzɪl.jəns/ (n)", "def": "Khả năng kiên cường phục hồi sau nghịch cảnh.", "example": "Academic resilience helps students overcome difficult exam results.", "category": "Emotions", "pos": "noun", "level": "B2", "starred": false, "day": 4},
    {"id": 37, "term": "Algorithm", "ipa": "/ˈæl.ɡə.rɪ.ðəm/ (n)", "def": "Thuật toán, quy trình xử lý dữ liệu.", "example": "Search engines use a sophisticated algorithm to rank web pages.", "category": "Science", "pos": "noun", "level": "B2", "starred": false, "day": 4},
    {"id": 38, "term": "Analyze", "ipa": "/ˈæn.əl.aɪz/ (v)", "def": "Phân tích số liệu hoặc tài liệu.", "example": "Data analysts carefully analyze consumer trends before product launches.", "category": "Science", "pos": "verb", "level": "B1", "starred": false, "day": 4},
    {"id": 39, "term": "Diversity", "ipa": "/daɪˈvɜː.sə.ti/ (n)", "def": "Sự đa dạng về văn hóa, sinh thái hoặc quan điểm.", "example": "Cultural diversity enriches campus life and broadens horizons.", "category": "Culture", "pos": "noun", "level": "B2", "starred": false, "day": 4},
    {"id": 40, "term": "Perspective", "ipa": "/pəˈspek.tɪv/ (n)", "def": "Góc nhìn, quan điểm nhận thức.", "example": "Studying abroad provides a fresh perspective on international affairs.", "category": "Society", "pos": "noun", "level": "B2", "starred": false, "day": 4},
    {"id": 41, "term": "Paradigm", "ipa": "/ˈpær.ə.daɪm/ (n)", "def": "Mô hình chuẩn, hệ tư tưởng khuôn mẫu.", "example": "Quantum computing represents a paradigm shift in data processing.", "category": "Academic English", "pos": "noun", "level": "C1", "starred": false, "day": 5},
    {"id": 42, "term": "Ubiquitous", "ipa": "/juːˈbɪk.wɪ.təs/ (adj)", "def": "Có mặt ở khắp mọi nơi, phổ biến rộng rãi.", "example": "Smartphones have become ubiquitous across modern urban society.", "category": "Technology", "pos": "adj", "level": "C1", "starred": false, "day": 5},
    {"id": 43, "term": "Comprehensive", "ipa": "/ˌkɒm.prɪˈhen.sɪv/ (adj)", "def": "Toàn diện, bao quát mọi khía cạnh.", "example": "The course provides a comprehensive overview of cybersecurity fundamentals.", "category": "Academic English", "pos": "adj", "level": "C1", "starred": false, "day": 5},
    {"id": 44, "term": "Substantiate", "ipa": "/səbˈstæn.ʃi.eɪt/ (v)", "def": "Chứng minh, đưa ra bằng chứng xác thực.", "example": "Academic researchers must substantiate their claims with empirical evidence.", "category": "Academic English", "pos": "verb", "level": "C1", "starred": false, "day": 5},
    {"id": 45, "term": "Equivocal", "ipa": "/ɪˈkwɪv.ə.kəl/ (adj)", "def": "Mập mờ, nước đôi, khó giải nghĩa chính xác.", "example": "The politician gave an equivocal response to avoid controversy.", "category": "Politics", "pos": "adj", "level": "C2", "starred": false, "day": 6},
    {"id": 46, "term": "Juxtaposition", "ipa": "/ˌdʒʌk.stə.pəˈzɪʃ.ən/ (n)", "def": "Sự đặt cạnh nhau để làm nổi bật nét tương phản.", "example": "The documentary highlights the juxtaposition of extreme wealth and poverty.", "category": "Media", "pos": "noun", "level": "C2", "starred": false, "day": 6},
    {"id": 47, "term": "Ephemeral", "ipa": "/ɪˈfem.ər.əl/ (adj)", "def": "Phù du, chóng tàn, chỉ tồn tại trong thời gian ngắn.", "example": "Social media fame is often ephemeral compared to lasting creative achievements.", "category": "Media", "pos": "adj", "level": "C2", "starred": false, "day": 6},
    {"id": 48, "term": "Exemplify", "ipa": "/ɪɡˈzem.plɪ.faɪ/ (v)", "def": "Là ví dụ điển hình cho, minh họa rõ nét.", "example": "Her outstanding graduation project exemplifies the university's academic excellence.", "category": "Academic English", "pos": "verb", "level": "C1", "starred": false, "day": 6},
    {"id": 49, "term": "Disseminate", "ipa": "/dɪˈsem.ɪ.neɪt/ (v)", "def": "Phổ biến, truyền bá tri thức rộng rãi.", "example": "Scholars use open-access journals to disseminate research findings worldwide.", "category": "Academic English", "pos": "verb", "level": "C1", "starred": false, "day": 6},
    {"id": 50, "term": "Pragmatic", "ipa": "/præɡˈmæt.ɪk/ (adj)", "def": "Thực dụng, thực tế, đề cao tính ứng dụng.", "example": "Engineers favor pragmatic solutions that can be implemented within budget.", "category": "Work and Career", "pos": "adj", "level": "C1", "starred": false, "day": 6}
];

const SAMPLE_IMPORT_TEXT = `Hypothesis - (/haɪˈpɑː.θə.sɪs/) Giả thuyết nghiên cứu. | The research team formulated a clear hypothesis before starting the lab experiment.
Experiment - (/ɪkˈsper.ə.mənt/) Thí nghiệm. | We spent three hours in the chemistry laboratory running a titration experiment.
Nanotechnology - (/ˌnæn.oʊ.tekˈnɑː.lə.dʒi/) Công nghệ nano. | Researchers are applying nanotechnology to build faster microprocessors.
Renewable - (/rɪˈnuː.ə.bəl/) Tái tạo được (Năng lượng). | The university campus installed solar panels to utilize renewable energy.
Robotics - (/roʊˈbɑː.tɪks/) Ngành khoa học robot. | Engineering students designed an autonomous vehicle for the annual robotics contest.
Thermodynamics - (/ˌθɜːr.moʊ.daɪˈnæm.ɪks/) Nhiệt động lực học. | The professor derived the second law of thermodynamics during physics lecture.
Algorithm - (/ˈæl.ɡə.rɪ.ðəm/) Thuật toán. | Our computer science professor demonstrated an efficient sorting algorithm in class.
Bandwidth - (/ˈbænd.wɪdθ/) Băng thông. | High bandwidth is required to stream online lectures without interruption.
Architecture - (/ˈɑːr.kə.tek.tʃər/) Kiến trúc hệ thống / Máy tính. | Students analyzed ARM architecture in the advanced computer systems module.
Protocol - (/ˈproʊ.tə.kɑːl/) Giao thức mạng. | HTTPS is a secure communication protocol used across modern web applications.
Hardware - (/ˈhɑːrd.wer/) Phần cứng máy tính. | The engineering lab provided specialized hardware for microcontroller programming.
Internship - (/ˈɪntɜːrnʃɪp/) Kỳ thực tập. | university students complete a four-month software engineering internship in their third year.
Curriculum - (/kəˈrɪk.jə.ləm/) Chương trình học. | The academic curriculum is updated annually to match tech industry demands.
Presentation - (/ˌprez.ənˈteɪ.ʃən/) Bài thuyết trình. | Each project team gave a ten-minute presentation to the industry experts.
Attendance - (/əˈten.dəns/) Điểm danh / Chuyên cần. | High attendance in lab sessions is mandatory for passing the module.
Tuition - (/tuːˈɪʃ.ən/) Học phí đại học. | Students can manage and pay their semester tuition through the campus portal.`;

const DYNAMIC_EXAMPLE_TEMPLATES = [
    (t) => ({
        en: `The professor explained how ${t.toLowerCase()} works during today's academic lecture.`,
        vi: `Giảng viên đã giải thích cách "${t}" hoạt động trong bài giảng học thuật hôm nay.`,
        structure: `explain + how + S + V (Mệnh đề danh từ làm tân ngữ)`
    }),
    (t) => ({
        en: `Students worked in the laboratory to analyze the key principles of ${t.toLowerCase()}.`,
        vi: `Sinh viên làm việc trong phòng thí nghiệm để phân tích các nguyên lý cốt lõi của "${t}".`,
        structure: `work in ... + to V (Chỉ mục đích hành động)`
    }),
    (t) => ({
        en: `Understanding ${t.toLowerCase()} is essential for passing the end-of-term examination.`,
        vi: `Việc hiểu rõ "${t}" là điều thiết yếu để vượt qua kỳ thi cuối kỳ.`,
        structure: `V-ing (Gerund làm chủ ngữ) + is essential for + N/V-ing`
    }),
    (t) => ({
        en: `Our study group prepared a detailed report focusing on ${t.toLowerCase()}.`,
        vi: `Nhóm học tập của chúng tôi đã chuẩn bị một báo cáo chi tiết tập trung vào "${t}".`,
        structure: `prepare a report + focusing on + N (Rút gọn mệnh đề quan hệ V-ing)`
    }),
    (t) => ({
        en: `During the the university workshop, speakers highlighted the practical value of ${t.toLowerCase()}.`,
        vi: `Trong buổi hội thảo tại trường đại học, các diễn giả đã nhấn mạnh giá trị thực tiễn của "${t}".`,
        structure: `highlight the value/importance of + N (Nhấn mạnh tầm quan trọng)`
    })
];

// Non-destructive enrichment metadata for default & common words (used when user hasn't set custom fields yet)
const VOCAB_ENRICHMENT_MAP = {
    semiconductor: { pos: "noun", level: "B2", synonyms: "chip material, wafer", antonyms: "insulator", extraExamples: [
        { en: "Vietnam is rapidly developing its semiconductor industry.", vi: "Việt Nam đang phát triển nhanh chóng ngành công nghiệp bán dẫn.", structure: "be + adv + V-ing (Hiện tại tiếp diễn diễn tả xu hướng)" },
        { en: "Many university graduates aspire to work in semiconductor design.", vi: "Nhiều sinh viên tốt nghiệp đại học mong muốn làm việc trong lĩnh vực thiết kế bán dẫn.", structure: "aspire to + V (Khao khát, hướng tới làm gì)" },
        { en: "A semiconductor conducts electricity better than glass but worse than copper.", vi: "Chất bán dẫn dẫn điện tốt hơn thủy tinh nhưng kém hơn đồng.", structure: "better than ... but worse than ... (Cấu trúc so sánh đối chiếu)" }
    ]},
    circuit: { pos: "noun", level: "B1", synonyms: "loop, network, wiring", antonyms: "disconnection", extraExamples: [
        { en: "Always turn off the power before testing an electrical circuit.", vi: "Luôn tắt nguồn điện trước khi kiểm tra mạch điện.", structure: "before + V-ing (Trước khi làm gì)" },
        { en: "A short circuit caused the laboratory computer to shut down.", vi: "Hiện tượng đoản mạch đã khiến máy tính phòng lab bị tắt.", structure: "cause + O + to V (Khiến cái gì xảy ra)" },
        { en: "We designed a simple LED circuit in our first engineering lab.", vi: "Chúng tôi đã thiết kế một mạch đèn LED đơn giản trong buổi thực hành kỹ thuật đầu tiên.", structure: "design + a/an + adj + N" }
    ]},
    transistor: { pos: "noun", level: "B2", synonyms: "electronic switch, amplifier", antonyms: "vacuum tube (historical)", extraExamples: [
        { en: "The invention of the transistor revolutionized modern electronics.", vi: "Phát minh ra bóng bán dẫn đã cách mạng hóa ngành điện tử hiện đại.", structure: "The invention of + N + revolutionized + N" },
        { en: "Each transistor acts as a tiny electronic switch.", vi: "Mỗi bóng bán dẫn hoạt động như một công tắc điện tử siêu nhỏ.", structure: "act as + N (Đóng vai trò như là)" },
        { en: "Smaller transistors allow chips to process data much faster.", vi: "Các bóng bán dẫn nhỏ hơn cho phép chip xử lý dữ liệu nhanh hơn nhiều.", structure: "allow + O + to V (Cho phép ai/cái gì làm gì)" }
    ]},
    current: { pos: "noun", level: "B1", synonyms: "electric flow, stream", antonyms: "static charge", extraExamples: [
        { en: "Direct current flows in only one direction.", vi: "Dòng điện một chiều chỉ chạy theo một hướng duy nhất.", structure: "flow in + direction (Chảy/di chuyển theo hướng)" },
        { en: "We used an ammeter to measure the electric current.", vi: "Chúng tôi sử dụng ampe kế để đo dòng điện.", structure: "use + O + to V (Dùng công cụ để làm gì)" },
        { en: "Too much current can overheat thin wires.", vi: "Dòng điện quá lớn có thể làm quá nhiệt các dây dẫn mảnh.", structure: "Too much + N (không đếm được) + can + V" }
    ]},
    voltage: { pos: "noun", level: "B2", synonyms: "electric potential, tension", antonyms: "zero potential", extraExamples: [
        { en: "Standard household voltage in Vietnam is 220 volts.", vi: "Điện áp gia dụng tiêu chuẩn ở Việt Nam là 220 vôn.", structure: "Standard + N + is + số liệu" },
        { en: "Please check the input voltage before plugging in the adapter.", vi: "Vui lòng kiểm tra điện áp đầu vào trước khi cắm bộ chuyển đổi.", structure: "check + N + before + V-ing" },
        { en: "A sudden drop in voltage may reset the device.", vi: "Sự sụt giảm điện áp đột ngột có thể làm khởi động lại thiết bị.", structure: "A sudden drop in + N (Sự sụt giảm đột ngột về...)" }
    ]},
    microchip: { pos: "noun", level: "B1", synonyms: "integrated circuit, IC, chip", antonyms: "manual mechanism", extraExamples: [
        { en: "Smartphones rely on powerful microchips to run AI applications.", vi: "Điện thoại thông minh dựa vào các vi mạch mạnh mẽ để chạy ứng dụng AI.", structure: "rely on + N + to V (Dựa vào cái gì để làm gì)" },
        { en: "Every student ID card contains an embedded microchip.", vi: "Mỗi thẻ sinh viên đều chứa một vi mạch được gắn bên trong.", structure: "contain + an embedded + N" },
        { en: "Manufacturing a microchip requires an ultra-clean room.", vi: "Việc sản xuất vi mạch đòi hỏi phòng siêu sạch.", structure: "V-ing + requires + N (Đòi hỏi cái gì)" }
    ]},
    conductor: { pos: "noun", level: "B1", synonyms: "transmitter, carrier", antonyms: "insulator, nonconductor", extraExamples: [
        { en: "Copper is widely used because it is a reliable conductor.", vi: "Đồng được sử dụng rộng rãi vì nó là vật dẫn điện đáng tin cậy.", structure: "be widely used because + S + V" },
        { en: "Rubber is an insulator, whereas silver is a great conductor.", vi: "Cao su là chất cách điện, trong khi bạc là chất dẫn điện tuyệt vời.", structure: "S + V, whereas + S + V (Đối lập hai mệnh đề)" },
        { en: "Water containing salt becomes an electrical conductor.", vi: "Nước có chứa muối sẽ trở thành vật dẫn điện.", structure: "N + V-ing (Rút gọn mệnh đề quan hệ chủ động)" }
    ]},
    component: { pos: "noun", level: "B1", synonyms: "part, element, module", antonyms: "whole, entirety", extraExamples: [
        { en: "Vocabulary is a key component of English proficiency.", vi: "Từ vựng là một thành phần then chốt của năng lực tiếng Anh.", structure: "be a key component of + N (Là thành phần chủ chốt của)" },
        { en: "We replaced the damaged component on the motherboard.", vi: "Chúng tôi đã thay thế linh kiện bị hỏng trên bo mạch chủ.", structure: "replace + the + V-ed/adj + N" },
        { en: "Teamwork is an essential component of every team project.", vi: "Làm việc nhóm là yếu tố thiết yếu của mọi dự án trong học tập.", structure: "an essential component of + N" }
    ]},
    resistance: { pos: "noun", level: "B2", synonyms: "impedance, opposition", antonyms: "conductivity, acceptance", extraExamples: [
        { en: "Electrical resistance is measured in ohms.", vi: "Điện trở được đo bằng đơn vị ôm (ohm).", structure: "be measured in + đơn vị (Bị động)" },
        { en: "Longer wires generally have higher electrical resistance.", vi: "Dây dẫn dài hơn thường có điện trở cao hơn.", structure: "generally have + comparative adj + N" },
        { en: "The new policy met with little resistance from students.", vi: "Chính sách mới gặp rất ít sự phản đối từ sinh viên.", structure: "meet with + little/strong + resistance" }
    ]},
    integration: { pos: "noun", level: "B2", synonyms: "combination, unification, incorporation", antonyms: "separation, fragmentation", extraExamples: [
        { en: "The integration of AI into education helps personalize learning.", vi: "Việc tích hợp AI vào giáo dục giúp cá nhân hóa việc học.", structure: "The integration of A into B (Sự tích hợp A vào B)" },
        { en: "Seamless software integration saves developers hours of work.", vi: "Việc tích hợp phần mềm mượt mà giúp lập trình viên tiết kiệm hàng giờ làm việc.", structure: "save + somebody + time" },
        { en: "System integration testing starts next Monday.", vi: "Kiểm thử tích hợp hệ thống sẽ bắt đầu vào thứ Hai tới.", structure: "Present Simple cho lịch trình cố định" }
    ]},
    syllabus: { pos: "noun", level: "B1", synonyms: "curriculum outline, course plan", antonyms: "improvisation", extraExamples: [
        { en: "You can download the Intermediate English syllabus from the student portal.", vi: "Bạn có thể tải đề cương môn Tiếng Anh Trung cấp từ hệ thống FAP hoặc CMS.", structure: "download + N + from + nguồn" },
        { en: "The lecturer went through the syllabus on the first day of class.", vi: "Giảng viên đã phổ biến kỹ đề cương môn học vào ngày đầu tiên của lớp.", structure: "go through + N (Xem xét/phổ biến kỹ lưỡng)" },
        { en: "All exam topics are listed clearly in the course syllabus.", vi: "Tất cả chủ đề thi đều được liệt kê rõ ràng trong đề cương khóa học.", structure: "be listed + adv + in + N" }
    ]},
    assignment: { pos: "noun", level: "A2", synonyms: "task, homework, project", antonyms: "free time", extraExamples: [
        { en: "I finished my writing assignment two hours before the deadline.", vi: "Tôi đã hoàn thành bài tập viết trước hạn chót hai tiếng.", structure: "finish + N + time + before..." },
        { en: "Our group assignment requires both research and a slide presentation.", vi: "Bài tập nhóm của chúng tôi yêu cầu cả nghiên cứu lẫn thuyết trình slide.", structure: "require + both A and B (Yêu cầu cả A và B)" },
        { en: "Please double-check your grammar before submitting the assignment.", vi: "Vui lòng kiểm tra kỹ lại ngữ pháp trước khi nộp bài tập.", structure: "before + V-ing" }
    ]},
    deadline: { pos: "noun", level: "B1", synonyms: "due date, time limit", antonyms: "extension, open schedule", extraExamples: [
        { en: "The deadline for the final project is Friday at 11:59 PM.", vi: "Hạn chót cho đồ án cuối kỳ là 23:59 thứ Sáu.", structure: "The deadline for + N + is + thời gian" },
        { en: "Good time management helps students meet tight deadlines.", vi: "Quản lý thời gian tốt giúp sinh viên hoàn thành kịp các hạn chót gấp gáp.", structure: "meet a deadline (Hoàn thành đúng hạn — Collocation chuẩn!)" },
        { en: "If you miss the deadline, ten percent will be deducted.", vi: "Nếu bạn trễ hạn nộp bài, 10% số điểm sẽ bị trừ.", structure: "If + Present Simple, S + will + V (Câu điều kiện loại 1)" }
    ]},
    lecture: { pos: "noun", level: "A2", synonyms: "talk, class, discourse", antonyms: "practical lab", extraExamples: [
        { en: "I always take notes in my notebook during the morning lecture.", vi: "Tôi luôn ghi chép vào sổ trong suốt bài giảng buổi sáng.", structure: "take notes + during + N (Ghi chép trong suốt...)" },
        { en: "Today's guest lecture focused on software career paths.", vi: "Bài giảng khách mời hôm nay tập trung vào lộ trình nghề nghiệp phần mềm.", structure: "focus on + N (Tập trung vào)" },
        { en: "Recording the lecture requires permission from the instructor.", vi: "Việc ghi âm bài giảng cần có sự cho phép của giảng viên.", structure: "require permission from + ai đó" }
    ]},
    campus: { pos: "noun", level: "A2", synonyms: "university grounds, college site", antonyms: "off-campus", extraExamples: [
        { en: "our university campus has lots of green trees.", vi: "Khuôn viên trường đại học có rất nhiều cây xanh.", structure: "have lots of + N" },
        { en: "First-year students enjoy meeting friends at the campus cafe.", vi: "Sinh viên năm nhất thích gặp gỡ bạn bè tại quán cà phê trong khuôn viên trường.", structure: "enjoy + V-ing (Thích làm gì)" },
        { en: "Shuttle buses run directly to the campus every morning.", vi: "Xe buýt đưa đón chạy thẳng tới khuôn viên trường mỗi sáng.", structure: "run directly to + địa điểm" }
    ]},
    presentation: { pos: "noun", level: "B1", synonyms: "speech, talk, demonstration", antonyms: "silent reading", extraExamples: [
        { en: "Practicing in front of a mirror improved my English presentation.", vi: "Luyện tập trước gương đã giúp cải thiện bài thuyết trình tiếng Anh của tôi.", structure: "V-ing (Chủ ngữ) + V-ed + O" },
        { en: "She used clear visuals to make her presentation easy to follow.", vi: "Cô ấy sử dụng hình ảnh minh họa rõ ràng để làm bài thuyết trình dễ theo dõi.", structure: "make + O + adj (Làm cho cái gì trở nên thế nào)" },
        { en: "We have a five-minute Q&A session after each presentation.", vi: "Chúng tôi có phần hỏi đáp 5 phút sau mỗi bài thuyết trình.", structure: "five-minute (Tính từ ghép có gạch nối không thêm 's')" }
    ]},
    attendance: { pos: "noun", level: "B1", synonyms: "presence, turnout", antonyms: "absence, truancy", extraExamples: [
        { en: "At the university, at least 80% attendance is required to take the final exam.", vi: "Tại trường đại học, sinh viên cần điểm danh tối thiểu 80% để được dự thi cuối kỳ.", structure: "be required to + V (Được yêu cầu để làm gì)" },
        { en: "The teacher checks attendance at the beginning of every slot.", vi: "Giảng viên kiểm tra điểm danh vào đầu mỗi ca học.", structure: "check/take attendance (Điểm danh — Collocation chuẩn)" },
        { en: "Regular attendance helps you understand the lessons much better.", vi: "Đi học đều đặn giúp bạn hiểu bài tốt hơn nhiều.", structure: "help + O + (to) V" }
    ]},
    discussion: { pos: "noun", level: "A2", synonyms: "debate, conversation, dialogue", antonyms: "monologue, silence", extraExamples: [
        { en: "Don't be afraid to speak up during the English group discussion.", vi: "Đừng ngại lên tiếng trong buổi thảo luận nhóm bằng tiếng Anh.", structure: "Don't be afraid to + V (Đừng ngại làm gì)" },
        { en: "We had a productive discussion about our team project.", vi: "Chúng tôi đã có một cuộc thảo luận hiệu quả về dự án nhóm.", structure: "have a productive discussion about + N" },
        { en: "Listening carefully is just as important as speaking in a discussion.", vi: "Lắng nghe kỹ cũng quan trọng không kém việc nói trong một cuộc thảo luận.", structure: "as + adj + as (So sánh ngang bằng)" }
    ]},
    prerequisite: { pos: "noun", level: "B2", synonyms: "requirement, precondition", antonyms: "elective, optional item", extraExamples: [
        { en: "Passing Elementary English is a prerequisite for entering B1 Intermediate.", vi: "Vượt qua Tiếng Anh Sơ cấp là điều kiện tiên quyết để vào học B1 Intermediate.", structure: "be a prerequisite for + N/V-ing" },
        { en: "Consistent daily practice is a prerequisite for fluency.", vi: "Luyện tập đều đặn hàng ngày là điều kiện tiên quyết để đạt sự trôi chảy.", structure: "prerequisite for + N" },
        { en: "Check the prerequisite courses before registering for next semester.", vi: "Hãy kiểm tra các môn tiên quyết trước khi đăng ký học kỳ tới.", structure: "before + V-ing" }
    ]},
    feedback: { pos: "noun", level: "B1", synonyms: "review, critique, comment", antonyms: "ignore", extraExamples: [
        { en: "Note: 'Feedback' is an uncountable noun, so never say 'feedbacks'.", vi: "Lưu ý: 'Feedback' là danh từ không đếm được, nên không bao giờ thêm 's' thành 'feedbacks'.", structure: "Uncountable noun (Danh từ không đếm được)" },
        { en: "My teacher gave me helpful feedback on my paragraph structure.", vi: "Giáo viên đã đưa cho tôi những nhận xét hữu ích về cấu trúc đoạn văn.", structure: "give somebody feedback on + N" },
        { en: "I use AI and teacher feedback to fix my recurring mistakes.", vi: "Tôi sử dụng nhận xét từ AI và giáo viên để sửa các lỗi lặp lại của mình.", structure: "use + N + to V" }
    ]},
    "university": {
        "pos": "noun",
        "level": "A1",
        "synonyms": "college, academy, campus",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "She was accepted into a prestigious international university.",
                        "vi": "Cô ấy đã được nhận vào một trường đại học quốc tế danh giá.",
                        "structure": "be accepted into (Được nhận vào trường)"
                }
        ]
    },
    "library": {
        "pos": "noun",
        "level": "A1",
        "synonyms": "resource center, archive",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "Silence must be observed in the reading area of the library.",
                        "vi": "Phải giữ trật tự tại khu vực đọc sách của thư viện.",
                        "structure": "passive voice (Bị động diễn tả quy định)"
                }
        ]
    },
    "schedule": {
        "pos": "noun",
        "level": "A1",
        "synonyms": "timetable, agenda, calendar",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "Due to a scheduling conflict, the workshop was postponed.",
                        "vi": "Do trùng lịch trình, buổi hội thảo đã bị hoãn.",
                        "structure": "due to + N (Bởi vì lý do gì)"
                }
        ]
    },
    "classmate": {
        "pos": "noun",
        "level": "A1",
        "synonyms": "peer, fellow student",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "I formed a study group with three of my classmates.",
                        "vi": "Tôi đã thành lập một nhóm học tập với ba người bạn cùng lớp.",
                        "structure": "form a group with (Thành lập nhóm với ai)"
                }
        ]
    },
    "cafeteria": {
        "pos": "noun",
        "level": "A1",
        "synonyms": "canteen, dining hall",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "The university cafeteria offers affordable meal options for students.",
                        "vi": "Căng tin trường đại học phục vụ nhiều bữa ăn giá cả phải chăng cho sinh viên.",
                        "structure": "offer + adj + N (Cung cấp cái gì)"
                }
        ]
    },
    "healthy": {
        "pos": "adj",
        "level": "A1",
        "synonyms": "wholesome, nutritious, fit",
        "antonyms": "unhealthy, sick",
        "extraExamples": [
                {
                        "en": "Maintaining a healthy lifestyle requires regular exercise and sufficient sleep.",
                        "vi": "Duy trì lối sống lành mạnh đòi hỏi tập thể dục đều đặn và ngủ đủ giấc.",
                        "structure": "require + N (Đòi hỏi điều gì)"
                }
        ]
    },
    "commute": {
        "pos": "verb",
        "level": "A2",
        "synonyms": "travel, shuttle",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "He commutes forty minutes each day by motorcycle.",
                        "vi": "Anh ấy di chuyển bốn mươi phút mỗi ngày bằng xe máy.",
                        "structure": "commute + time + by vehicle (Đi lại bao lâu bằng phương tiện gì)"
                }
        ]
    },
    "budget": {
        "pos": "noun",
        "level": "A2",
        "synonyms": "financial plan, allowance",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "Students should plan a weekly budget to avoid overspending.",
                        "vi": "Sinh viên nên lập ngân sách hàng tuần để tránh chi tiêu quá tay.",
                        "structure": "avoid + V-ing (Tránh làm việc gì)"
                }
        ]
    },
    "routine": {
        "pos": "noun",
        "level": "A2",
        "synonyms": "habit, practice, regimen",
        "antonyms": "irregularity",
        "extraExamples": [
                {
                        "en": "Establishing a study routine improves academic discipline.",
                        "vi": "Xây dựng thói quen học tập giúp nâng cao tính kỷ luật học thuật.",
                        "structure": "V-ing as subject (Danh động từ làm chủ ngữ)"
                }
        ]
    },
    "convenient": {
        "pos": "adj",
        "level": "A2",
        "synonyms": "handy, accessible, practical",
        "antonyms": "inconvenient",
        "extraExamples": [
                {
                        "en": "The mobile app makes checking grades quick and convenient.",
                        "vi": "Ứng dụng di động giúp việc xem điểm nhanh chóng và thuận tiện.",
                        "structure": "make + O + adj (Làm cho cái gì trở nên thế nào)"
                }
        ]
    },
    "methodology": {
        "pos": "noun",
        "level": "B2",
        "synonyms": "approach, procedure, framework",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "The researcher adopted a qualitative methodology to interview participants.",
                        "vi": "Nhà nghiên cứu đã áp dụng phương pháp định tính để phỏng vấn các đối tượng tham gia.",
                        "structure": "adopt a methodology (Áp dụng một phương pháp luận)"
                }
        ]
    },
    "curriculum": {
        "pos": "noun",
        "level": "B2",
        "synonyms": "syllabus, course of study",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "Continuous curriculum updates ensure graduates meet industry requirements.",
                        "vi": "Việc cập nhật chương trình học liên tục đảm bảo sinh viên tốt nghiệp đáp ứng yêu cầu ngành nghề.",
                        "structure": "ensure + S + V (Đảm bảo điều gì)"
                }
        ]
    },
    "sustainable": {
        "pos": "adj",
        "level": "B2",
        "synonyms": "renewable, eco-friendly, enduring",
        "antonyms": "unsustainable, depleting",
        "extraExamples": [
                {
                        "en": "Sustainable business practices benefit both the economy and the ecosystem.",
                        "vi": "Các thực hành kinh doanh bền vững mang lại lợi ích cho cả nền kinh tế và hệ sinh thái.",
                        "structure": "benefit both A and B (Có lợi cho cả A và B)"
                }
        ]
    },
    "collaborate": {
        "pos": "verb",
        "level": "B2",
        "synonyms": "cooperate, partner, team up",
        "antonyms": "compete, isolate",
        "extraExamples": [
                {
                        "en": "Students collaborate in cross-functional teams to solve real-world problems.",
                        "vi": "Sinh viên hợp tác trong các nhóm đa ngành để giải quyết các vấn đề thực tiễn.",
                        "structure": "collaborate in teams to V (Hợp tác theo nhóm để làm gì)"
                }
        ]
    },
    "optimize": {
        "pos": "verb",
        "level": "B2",
        "synonyms": "enhance, refine, streamline",
        "antonyms": "impair, worsen",
        "extraExamples": [
                {
                        "en": "We used caching strategies to optimize web page load times.",
                        "vi": "Chúng tôi đã dùng các chiến lược bộ nhớ đệm để tối ưu hóa thời gian tải trang web.",
                        "structure": "use + O + to V (Dùng cái gì để làm gì)"
                }
        ]
    },
    "resilience": {
        "pos": "noun",
        "level": "B2",
        "synonyms": "tenacity, fortitude, endurance",
        "antonyms": "fragility, weakness",
        "extraExamples": [
                {
                        "en": "Emotional resilience allows people to recover quickly from setbacks.",
                        "vi": "Sự kiên cường về mặt cảm xúc giúp con người nhanh chóng đứng dậy sau những thất bại.",
                        "structure": "allow + O + to V (Cho phép ai làm gì)"
                }
        ]
    },
    "algorithm": {
        "pos": "noun",
        "level": "B2",
        "synonyms": "computational formula, procedure",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "Machine learning algorithms learn patterns directly from massive datasets.",
                        "vi": "Các thuật toán học máy tự học các quy luật trực tiếp từ các bộ dữ liệu khổng lồ.",
                        "structure": "learn patterns from (Học các quy luật từ)"
                }
        ]
    },
    "analyze": {
        "pos": "verb",
        "level": "B1",
        "synonyms": "examine, investigate, evaluate",
        "antonyms": "synthesize, overlook",
        "extraExamples": [
                {
                        "en": "The system automatically analyzes user submissions for grammatical accuracy.",
                        "vi": "Hệ thống tự động phân tích các bài nộp của người dùng để kiểm tra độ chính xác ngữ pháp.",
                        "structure": "analyze + O + for N (Phân tích cái gì để tìm điều gì)"
                }
        ]
    },
    "diversity": {
        "pos": "noun",
        "level": "B2",
        "synonyms": "variety, multiplicity, heterogeneity",
        "antonyms": "uniformity, monotony",
        "extraExamples": [
                {
                        "en": "Diversity of thought drives innovation in high-tech organizations.",
                        "vi": "Sự đa dạng về tư duy thúc đẩy đổi mới sáng tạo trong các tổ chức công nghệ cao.",
                        "structure": "drive innovation (Thúc đẩy đổi mới sáng tạo)"
                }
        ]
    },
    "perspective": {
        "pos": "noun",
        "level": "B2",
        "synonyms": "viewpoint, angle, stance",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "Reading international news provides a broader perspective on global trends.",
                        "vi": "Đọc tin tức quốc tế mang lại góc nhìn rộng mở hơn về các xu hướng toàn cầu.",
                        "structure": "provide a perspective on (Mang lại góc nhìn về)"
                }
        ]
    },
    "paradigm": {
        "pos": "noun",
        "level": "C1",
        "synonyms": "archetype, benchmark, model",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "The transition to remote work caused a shift in the corporate management paradigm.",
                        "vi": "Việc chuyển đổi sang làm việc từ xa đã gây ra sự dịch chuyển trong mô hình quản trị doanh nghiệp.",
                        "structure": "cause a shift in (Gây ra sự dịch chuyển trong)"
                }
        ]
    },
    "ubiquitous": {
        "pos": "adj",
        "level": "C1",
        "synonyms": "omnipresent, pervasive, universal",
        "antonyms": "rare, scarce",
        "extraExamples": [
                {
                        "en": "Artificial intelligence applications are rapidly becoming ubiquitous in modern society.",
                        "vi": "Các ứng dụng trí tuệ nhân tạo đang nhanh chóng trở nên hiện diện ở khắp mọi nơi trong xã hội hiện đại.",
                        "structure": "become + adj (Trở nên như thế nào)"
                }
        ]
    },
    "comprehensive": {
        "pos": "adj",
        "level": "C1",
        "synonyms": "exhaustive, thorough, inclusive",
        "antonyms": "partial, limited",
        "extraExamples": [
                {
                        "en": "A comprehensive review of academic literature was conducted prior to experimentation.",
                        "vi": "Một bản đánh giá toàn diện các tài liệu học thuật đã được thực hiện trước khi tiến hành thí nghiệm.",
                        "structure": "prior to + N (Trước khi có sự kiện gì)"
                }
        ]
    },
    "substantiate": {
        "pos": "verb",
        "level": "C1",
        "synonyms": "corroborate, validate, authenticate",
        "antonyms": "refute, debunk",
        "extraExamples": [
                {
                        "en": "Without empirical data, it is impossible to substantiate the proposed hypothesis.",
                        "vi": "Nếu không có số liệu thực nghiệm, không thể nào chứng minh giả thuyết đã đề xuất.",
                        "structure": "it is impossible to V (Không thể làm gì)"
                }
        ]
    },
    "equivocal": {
        "pos": "adj",
        "level": "C2",
        "synonyms": "ambiguous, cryptic, vague",
        "antonyms": "unequivocal, clear",
        "extraExamples": [
                {
                        "en": "The experimental results remained equivocal despite repeated testing under controlled conditions.",
                        "vi": "Kết quả thí nghiệm vẫn còn mập mờ dù đã lặp lại thử nghiệm nhiều lần trong điều kiện kiểm soát.",
                        "structure": "despite + N (Mặc dù có điều gì)"
                }
        ]
    },
    "juxtaposition": {
        "pos": "noun",
        "level": "C2",
        "synonyms": "contrast, collocation, pairing",
        "antonyms": "",
        "extraExamples": [
                {
                        "en": "The artistic juxtaposition of classical architecture and modern skyscrapers created a striking visual impact.",
                        "vi": "Sự đặt cạnh nhau đầy nghệ thuật giữa kiến trúc cổ điển và các tòa nhà chọc trời hiện đại đã tạo nên hiệu ứng thị giác ấn tượng.",
                        "structure": "juxtaposition of A and B (Sự đặt cạnh nhau giữa A và B)"
                }
        ]
    },
    "ephemeral": {
        "pos": "adj",
        "level": "C2",
        "synonyms": "transient, fleeting, momentary",
        "antonyms": "permanent, enduring",
        "extraExamples": [
                {
                        "en": "Online viral trends are notoriously ephemeral, vanishing within days of their emergence.",
                        "vi": "Các xu hướng lan truyền trên mạng nổi tiếng là ngắn ngủi, biến mất chỉ trong vài ngày sau khi xuất hiện.",
                        "structure": "vanishing within (Biến mất trong vòng)"
                }
        ]
    },
    "exemplify": {
        "pos": "verb",
        "level": "C1",
        "synonyms": "illustrate, epitomize, represent",
        "antonyms": "contradict",
        "extraExamples": [
                {
                        "en": "Her innovative research exemplifies the transformative power of multidisciplinary collaboration.",
                        "vi": "Nghiên cứu sáng tạo của cô ấy minh họa cho sức mạnh biến đổi của sự hợp tác đa ngành.",
                        "structure": "exemplify the power of (Minh họa cho sức mạnh của)"
                }
        ]
    },
    "disseminate": {
        "pos": "verb",
        "level": "C1",
        "synonyms": "broadcast, distribute, circulate",
        "antonyms": "suppress, withhold",
        "extraExamples": [
                {
                        "en": "Conferences serve as premier venues to disseminate cutting-edge scientific discoveries.",
                        "vi": "Các hội nghị khoa học đóng vai trò là những địa điểm hàng đầu để phổ biến các phát hiện khoa học tiên tiến.",
                        "structure": "serve as venues to V (Đóng vai trò là nơi để làm gì)"
                }
        ]
    },
    "pragmatic": {
        "pos": "adj",
        "level": "C1",
        "synonyms": "practical, realistic, utilitarian",
        "antonyms": "idealistic, theoretical",
        "extraExamples": [
                {
                        "en": "We must adopt a pragmatic approach to balance academic rigor with project deadlines.",
                        "vi": "Chúng ta phải áp dụng một phương pháp tiếp cận thực tế để cân bằng giữa sự chặt chẽ học thuật và thời hạn dự án.",
                        "structure": "adopt an approach to V (Áp dụng phương pháp để làm gì)"
                }
        ]
    }
};

// Built-in Academic & Reading Dictionary for Instant Word Lookup in Reading Workspace
const ACADEMIC_DICTIONARY = {
    artificial: { ipa: "/ˌɑː.tɪˈfɪʃ.əl/", pos: "adj", def: "Nhân tạo", level: "B1" },
    intelligence: { ipa: "/ɪnˈtel.ɪ.dʒəns/", pos: "noun", def: "Trí thông minh, trí tuệ", level: "B1" },
    personalized: { ipa: "/ˈpɜː.sən.əl.aɪzd/", pos: "adj", def: "Được cá nhân hóa", level: "B2" },
    effectively: { ipa: "/ɪˈfek.tɪv.li/", pos: "adv", def: "Một cách hiệu quả", level: "B1" },
    struggle: { ipa: "/ˈstrʌɡ.əl/", pos: "verb/noun", def: "Gặp khó khăn, vật lộn; cuộc đấu tranh", level: "B1" },
    nervous: { ipa: "/ˈnɜː.vəs/", pos: "adj", def: "Lo lắng, hồi hộp", level: "A2" },
    excited: { ipa: "/ɪkˈsaɪ.tɪd/", pos: "adj", def: "Hào hứng, phấn khích", level: "A2" },
    modern: { ipa: "/ˈmɒd.ən/", pos: "adj", def: "Hiện đại", level: "A1" },
    submit: { ipa: "/səbˈmɪt/", pos: "verb", def: "Nộp (bài tập, đơn từ)", level: "B1" },
    dangerous: { ipa: "/ˈdeɪn.dʒər.əs/", pos: "adj", def: "Nguy hiểm", level: "A2" },
    stranger: { ipa: "/ˈstreɪn.dʒər/", pos: "noun", def: "Người lạ", level: "A2" },
    limit: { ipa: "/ˈlɪm.ɪt/", pos: "verb/noun", def: "Giới hạn, hạn chế", level: "B1" },
    essential: { ipa: "/ɪˈsen.ʃəl/", pos: "adj", def: "Thiết yếu, vô cùng quan trọng", level: "B1" },
    achieve: { ipa: "/əˈtʃiːv/", pos: "verb", def: "Đạt được, giành được", level: "B1" },
    perspective: { ipa: "/pəˈspek.tɪv/", pos: "noun", def: "Góc nhìn, quan điểm", level: "B2" },
    foundation: { ipa: "/faʊnˈdeɪ.ʃən/", pos: "noun", def: "Nền tảng", level: "B2" },
    compromise: { ipa: "/ˈkɒm.prə.maɪz/", pos: "noun/verb", def: "Sự thỏa hiệp; thỏa hiệp", level: "B2" },
    discipline: { ipa: "/ˈdɪs.ə.plɪn/", pos: "noun", def: "Tính kỷ luật", level: "B2" },
    distraction: { ipa: "/dɪˈstræk.ʃən/", pos: "noun", def: "Sự xao nhãng, yếu tố gây mất tập trung", level: "B2" },
    consistently: { ipa: "/kənˈsɪs.tənt.li/", pos: "adv", def: "Một cách kiên định, đều đặn", level: "B2" },
    fatigue: { ipa: "/fəˈtiːɡ/", pos: "noun", def: "Sự mệt mỏi rã rời, kiệt sức", level: "B2" },
    significant: { ipa: "/sɪɡˈnɪf.ɪ.kənt/", pos: "adj", def: "Đáng kể, quan trọng", level: "B2" },
    consequence: { ipa: "/ˈkɒn.sɪ.kwəns/", pos: "noun", def: "Hậu quả, hệ quả", level: "B2" },
    biodiversity: { ipa: "/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/", pos: "noun", def: "Đa dạng sinh học", level: "B2" },
    vulnerable: { ipa: "/ˈvʌl.nər.ə.bəl/", pos: "adj", def: "Dễ bị tổn thương, dễ chịu tác động", level: "B2" },
    sustainable: { ipa: "/səˈsteɪ.nə.bəl/", pos: "adj", def: "Bền vững", level: "B2" },
    transformation: { ipa: "/ˌtræns.fəˈmeɪ.ʃən/", pos: "noun", def: "Sự chuyển đổi mạnh mẽ", level: "B2" },
    automation: { ipa: "/ˌɔː.təˈmeɪ.ʃən/", pos: "noun", def: "Tự động hóa", level: "B2" },
    obsolete: { ipa: "/ˌɒb.səlˈiːt/", pos: "adj", def: "Lỗi thời, không còn dùng nữa", level: "C1" },
    adaptability: { ipa: "/əˌdæp.təˈbɪl.ə.ti/", pos: "noun", def: "Khả năng thích ứng", level: "B2" },
    counterproductive: { ipa: "/ˌkaʊn.tə.prəˈdʌk.tɪv/", pos: "adj", def: "Phản tác dụng", level: "C1" },
    chronic: { ipa: "/ˈkrɒn.ɪk/", pos: "adj", def: "Mãn tính, kéo dài kinh niên", level: "B2" },
    immune: { ipa: "/ɪˈmjuːn/", pos: "adj", def: "Miễn dịch", level: "B2" },
    vigorous: { ipa: "/ˈvɪɡ.ər.əs/", pos: "adj", def: "Mạnh mẽ, cường độ cao", level: "C1" },
    hygiene: { ipa: "/ˈhaɪ.dʒiːn/", pos: "noun", def: "Vệ sinh, thói quen giữ gìn sức khỏe", level: "B2" },
    scholarship: { ipa: "/ˈskɒl.ə.ʃɪp/", pos: "noun", def: "Học bổng", level: "B1" },
    tuition: { ipa: "/tjuːˈɪʃ.ən/", pos: "noun", def: "Học phí", level: "B2" },
    accommodation: { ipa: "/əˌkɒm.əˈdeɪ.ʃən/", pos: "noun", def: "Chỗ ăn ở", level: "B1" },
    outweigh: { ipa: "/ˌaʊtˈweɪ/", pos: "verb", def: "Vượt trội hơn, lớn hơn (về lợi ích/tác hại)", level: "B2" },
    curriculum: { ipa: "/kəˈrɪk.jə.ləm/", pos: "noun", def: "Chương trình giảng dạy", level: "B2" },
    internship: { ipa: "/ˈɪn.tɜːn.ʃɪp/", pos: "noun", def: "Kỳ thực tập", level: "B1" },
    algorithm: { ipa: "/ˈæl.ɡə.rɪ.ðəm/", pos: "noun", def: "Thuật toán", level: "B2" },
    hypothesis: { ipa: "/haɪˈpɒθ.ə.sɪs/", pos: "noun", def: "Giả thuyết khoa học", level: "B2" },
    phenomenon: { ipa: "/fəˈnɒm.ɪ.nən/", pos: "noun", def: "Hiện tượng", level: "B2" },
    cognitive: { ipa: "/ˈkɒɡ.nə.tɪv/", pos: "adj", def: "Thuộc về nhận thức tư duy", level: "C1" },
    empirical: { ipa: "/ɪmˈpɪr.ɪ.kəl/", pos: "adj", def: "Thực nghiệm, dựa trên quan sát thực tế", level: "C1" },
    ubiquitous: { ipa: "/juːˈbɪk.wɪ.təs/", pos: "adj", def: "Có mặt ở khắp mọi nơi, phổ biến", level: "C2" },
    paradigm: { ipa: "/ˈpær.ə.daɪm/", pos: "noun", def: "Mô hình chuẩn, hệ tư tưởng", level: "C2" }
};
