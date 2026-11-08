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
    { id: 20, day: 1, term: "Feedback", ipa: "/ˈfiːd.bæk/ (n)", def: "Phản hồi / Nhận xét.", example: "Constructive feedback from lecturers helps improve writing skills.", category: "Campus", starred: false }
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
    ]}
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
