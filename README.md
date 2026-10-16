<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QEnglish - Học Từ Vựng Thông Minh</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts: Plus Jakarta Sans & Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'] },
                    colors: {
                        qbrand: {
                            purple: '#8B5CF6',
                            indigo: '#6366F1',
                            cyan: '#06B6D4',
                            dark: '#090D16'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #090D16;
            background-image: 
                radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.12) 0px, transparent 50%);
            background-attachment: fixed;
        }

        /* 3D Flashcard Standard Setup */
        .perspective-1000 {
            perspective: 1000px;
        }
        .flashcard-inner {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 360px;
            transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
            transform-style: preserve-3d;
        }
        .flashcard-inner.is-flipped {
            transform: rotateY(180deg);
        }
        .flashcard-face {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border-radius: 1.5rem;
            overflow: hidden;
        }
        .flashcard-front {
            transform: rotateY(0deg);
            z-index: 2;
        }
        .flashcard-back {
            transform: rotateY(180deg);
            z-index: 1;
        }

        /* Glassmorphic Panel & Cards */
        .glass-panel {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-card {
            background: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-card:hover {
            border-color: rgba(139, 92, 246, 0.4);
            box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.3);
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #090d16; }
        ::-webkit-scrollbar-thumb { background: #1f293d; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #374151; }
    </style>
</head>
<body class="text-slate-100 min-h-screen font-sans flex flex-col justify-between selection:bg-violet-500 selection:text-white antialiased">

    <div id="toast-container" class="fixed top-5 right-5 z-50 flex flex-col gap-2"></div>

    <!-- Header Navigation -->
    <header class="glass-panel sticky top-0 z-40 border-b border-white/10 shadow-2xl">
        <div class="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            
            <!-- Logo QEnglish -->
            <div class="flex items-center gap-3.5 cursor-pointer group" onclick="switchTab('study')">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/30 group-hover:scale-105 transition duration-300">
                    <div class="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                        <span class="font-black text-2xl bg-gradient-to-tr from-violet-400 via-cyan-300 to-white bg-clip-text text-transparent">Q</span>
                    </div>
                </div>
                <div>
                    <h1 class="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">QEnglish</h1>
                    <p class="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">Smart Vocabulary</p>
                </div>
            </div>

            <!-- Navigation Tabs -->
            <nav class="hidden md:flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                <button id="tab-btn-study" onclick="switchTab('study')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30">
                    <i class="fa-solid fa-clone"></i> Thẻ Học
                </button>
                <button id="tab-btn-list" onclick="switchTab('list')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5">
                    <i class="fa-solid fa-layer-group"></i> Danh Sách (<span id="nav-count">20</span>)
                </button>
                <button id="tab-btn-quiz" onclick="switchTab('quiz')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5">
                    <i class="fa-solid fa-circle-question"></i> Trắc Nghiệm
                </button>
                <button id="tab-btn-import" onclick="switchTab('import')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5">
                    <i class="fa-solid fa-file-import"></i> Nhập & Quản Lý
                </button>
            </nav>

            <!-- Controls: Speed Selector & AutoPlay -->
            <div class="flex items-center gap-2.5">
                <div class="relative flex items-center bg-slate-950/90 border border-white/10 rounded-xl px-3 py-1.5 shadow-inner">
                    <i class="fa-solid fa-gauge-high text-cyan-400 text-xs mr-2"></i>
                    <span class="text-[11px] font-bold text-slate-400 mr-1.5 hidden sm:inline">Tốc độ:</span>
                    <select id="speed-select" onchange="updateSpeechRate(this.value)" class="bg-transparent text-xs font-extrabold text-cyan-300 focus:outline-none cursor-pointer">
                        <option value="0.1" class="bg-slate-900 text-slate-200">0.1x</option>
                        <option value="0.5" class="bg-slate-900 text-slate-200">0.5x</option>
                        <option value="0.8" class="bg-slate-900 text-slate-200">0.8x</option>
                        <option value="1.0" selected class="bg-slate-900 text-slate-200">1.0x (Chuẩn)</option>
                        <option value="1.2" class="bg-slate-900 text-slate-200">1.2x</option>
                        <option value="1.5" class="bg-slate-900 text-slate-200">1.5x</option>
                        <option value="2.0" class="bg-slate-900 text-slate-200">2.0x</option>
                        <option value="3.0" class="bg-slate-900 text-slate-200">3.0x</option>
                    </select>
                </div>

                <button id="btn-autoplay-toggle" onclick="toggleAutoPlay()" class="px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-white/10 text-xs font-bold transition flex items-center gap-1.5 text-emerald-400 hover:bg-slate-900">
                    <i class="fa-solid fa-volume-high text-xs"></i>
                    <span id="autoplay-text" class="hidden sm:inline">Tự Đọc: Bật</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Workspace -->
    <main class="max-w-4xl mx-auto px-4 py-8 w-full flex-grow flex flex-col justify-center">

        <!-- TAB 1: STUDY FLASHCARDS MODE -->
        <section id="view-study" class="flex-grow flex flex-col justify-between space-y-6">
            
            <!-- Filter Bar Panel -->
            <div class="glass-panel p-4 rounded-2xl space-y-3 shadow-xl">
                <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-400">Ngày học:</span>
                        <input type="text" id="study-day-input" value="1" placeholder="VD: 1, 2 hoặc 1-5" onchange="applyStudyFilter()" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-cyan-300 font-bold w-36 focus:outline-none focus:border-violet-500 transition">
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-400">Số từ tối đa:</span>
                        <input type="number" id="study-limit-input" value="20" placeholder="Số từ" onchange="applyStudyFilter()" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-cyan-300 font-bold w-20 focus:outline-none focus:border-violet-500 transition">
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-400">Thứ tự:</span>
                        <select id="study-order-select" onchange="applyStudyFilter()" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-cyan-300 font-bold focus:outline-none focus:border-violet-500 transition cursor-pointer">
                            <option value="sequential">Trình tự</option>
                            <option value="random">Ngẫu nhiên</option>
                        </select>
                    </div>

                    <button onclick="applyStudyFilter()" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition shadow-md shadow-violet-600/20 active:scale-95">
                        Áp Dụng
                    </button>
                </div>

                <div class="flex items-center justify-between border-t border-white/10 pt-2.5 text-xs">
                    <span id="card-counter" class="font-extrabold text-slate-200 bg-slate-950 px-3.5 py-1 rounded-full border border-white/10">
                        Thẻ 1 / 20
                    </span>
                    <span id="card-category-badge" class="font-extrabold px-3.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 tracking-wide">
                        Ngày 1 • STEM / Vi Mạch
                    </span>
                    <button onclick="toggleStarCurrent()" id="btn-star-current" class="p-1.5 text-slate-500 hover:text-amber-400 transition hover:scale-110" title="Đánh dấu từ khó">
                        <i class="fa-star fa-regular text-base"></i>
                    </button>
                </div>
            </div>

            <!-- Progress Indicator Bar -->
            <div class="w-full bg-slate-950 rounded-full h-2.5 p-0.5 border border-white/10 overflow-hidden shadow-inner">
                <div id="study-progress-bar" class="bg-gradient-to-r from-cyan-400 via-violet-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-lg shadow-violet-500/50" style="width: 5%"></div>
            </div>

            <!-- 3D ULTRA-STABLE FLASHCARD -->
            <div class="perspective-1000 w-full min-h-[360px] cursor-pointer my-2" onclick="flipCard()">
                <div id="flashcard-inner" class="flashcard-inner">
                    
                    <!-- FRONT SIDE -->
                    <div class="flashcard-face flashcard-front bg-[#0f172a] border-2 border-slate-700/80 shadow-2xl p-8 flex flex-col justify-between items-center text-center">
                        <div class="w-full flex justify-between items-center text-xs text-slate-400">
                            <span class="flex items-center gap-1.5"><i class="fa-regular fa-lightbulb text-amber-400"></i> Bấm Spacebar hoặc chạm để lật</span>
                            <span class="text-violet-400 font-extrabold tracking-wider text-[10px] uppercase bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">MẶT TRƯỚC</span>
                        </div>
                        <div class="my-auto space-y-4">
                            <h2 id="card-term" class="text-4xl md:text-6xl font-black tracking-tight text-white">Semiconductor</h2>
                            <p id="card-ipa" class="text-lg md:text-2xl text-cyan-400 font-mono font-bold tracking-wide">/ˌsem.i.kənˈdʌk.tər/</p>
                        </div>
                        <button onclick="event.stopPropagation(); playCurrentAudio();" class="px-6 py-2.5 rounded-2xl bg-violet-600/20 hover:bg-violet-600 text-violet-200 border border-violet-500/30 font-bold text-xs transition flex items-center gap-2 hover:scale-105 active:scale-95">
                            <i class="fa-solid fa-volume-high text-cyan-400"></i> Nghe Phát Âm
                        </button>
                    </div>

                    <!-- BACK SIDE -->
                    <div class="flashcard-face flashcard-back bg-[#0f172a] border-2 border-violet-500/40 shadow-2xl p-8 flex flex-col justify-between items-center text-center">
                        <div class="w-full flex justify-between items-center text-xs text-slate-400">
                            <span>Giải nghĩa & Câu ví dụ</span>
                            <span class="text-cyan-400 font-extrabold tracking-wider text-[10px] uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">MẶT SAU</span>
                        </div>
                        
                        <div class="my-auto space-y-5 max-w-lg w-full">
                            <!-- NGHĨA TIẾNG VIỆT -->
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Nghĩa Tiếng Việt</span>
                                <p id="card-definition" class="text-2xl md:text-3xl font-extrabold text-amber-300 leading-relaxed">Chất bán dẫn.</p>
                            </div>
                            
                            <!-- VÍ DỤ THỰC TẾ -->
                            <div id="card-example-box" onclick="event.stopPropagation(); playExampleAudio();" class="p-4 rounded-2xl bg-slate-950/90 border border-white/10 text-slate-300 cursor-pointer hover:border-violet-500/50 transition group/ex text-left shadow-inner">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Ví dụ thực tế:</span>
                                    <span class="text-xs text-cyan-400 group-hover/ex:text-cyan-300 flex items-center gap-1 font-bold">
                                        <i class="fa-solid fa-volume-high"></i> Nghe câu
                                    </span>
                                </div>
                                <p id="card-example" class="text-sm md:text-base italic text-slate-200 font-medium">
                                    "Silicon is a common semiconductor."
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <button onclick="event.stopPropagation(); playCurrentAudio();" class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/10">
                                <i class="fa-solid fa-volume-high text-cyan-400"></i> Nghe Lại Từ
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Bottom Navigation -->
            <div class="flex items-center justify-between gap-4 pt-2">
                <button onclick="prevCard()" class="flex-1 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 font-bold text-slate-200 transition flex items-center justify-center gap-2 shadow-lg active:scale-95">
                    <i class="fa-solid fa-arrow-left"></i> <span class="hidden sm:inline">Thẻ Trước</span>
                </button>
                <button onclick="flipCard()" class="py-4 px-8 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-extrabold text-white transition flex items-center justify-center gap-2 shadow-xl shadow-violet-600/30 active:scale-95">
                    <i class="fa-solid fa-rotate"></i> <span>Lật Thẻ</span>
                </button>
                <button onclick="nextCard()" class="flex-1 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 font-bold text-slate-200 transition flex items-center justify-center gap-2 shadow-lg active:scale-95">
                    <span class="hidden sm:inline">Thẻ Tiếp</span> <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </section>

        <!-- TAB 2: WORD LIST VIEW -->
        <section id="view-list" class="hidden space-y-6">
            <div class="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div class="relative w-full md:w-80">
                    <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                    <input type="text" id="search-input" oninput="renderWordList()" placeholder="Tìm từ vựng, IPA, từ dịch..." class="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition">
                </div>

                <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <input type="text" id="list-day-input" onchange="renderWordList()" placeholder="Lọc ngày (VD: 1, 2)" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold w-36 focus:outline-none">
                    <button onclick="filterCategory('all')" id="filter-btn-all" class="filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white shadow-md">Tất cả</button>
                    <button onclick="filterCategory('STEM')" id="filter-btn-STEM" class="filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-white/10">STEM</button>
                    <button onclick="filterCategory('Campus')" id="filter-btn-Campus" class="filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-white/10">Campus</button>
                </div>
            </div>

            <div id="word-list-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        </section>

        <!-- TAB 3: QUIZ MODE -->
        <section id="view-quiz" class="hidden space-y-6">
            <div class="glass-panel p-6 md:p-8 rounded-3xl max-w-2xl mx-auto space-y-6 shadow-2xl">
                
                <!-- Quiz Filters -->
                <div class="bg-slate-950/90 p-4 rounded-2xl border border-white/10 space-y-3 text-xs">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-slate-400">Chọn ngày:</span>
                            <input type="text" id="quiz-day-input" value="1" placeholder="VD: 1, 2" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-cyan-300 font-bold w-32 focus:outline-none">
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="font-bold text-slate-400">Số lượng:</span>
                            <input type="number" id="quiz-limit-input" value="10" placeholder="Số từ" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-cyan-300 font-bold w-20 focus:outline-none">
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="font-bold text-slate-400">Thứ tự:</span>
                            <select id="quiz-order-select" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-cyan-300 font-bold focus:outline-none cursor-pointer">
                                <option value="random">Ngẫu nhiên</option>
                                <option value="sequential">Trình tự</option>
                            </select>
                        </div>
                    </div>

                    <button onclick="startNewQuiz()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-extrabold text-white transition shadow-lg shadow-violet-600/20 active:scale-95">
                        <i class="fa-solid fa-play mr-1.5"></i> Bắt Đầu Bài Kiểm Tra
                    </button>
                </div>

                <div class="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                        <h3 class="text-xl font-black text-white tracking-tight">Kiểm Tra Phản Xạ</h3>
                        <p class="text-xs text-slate-400">Chọn nghĩa tiếng Việt chính xác của thuật ngữ</p>
                    </div>
                    <div class="text-right">
                        <span id="quiz-score" class="text-base font-black text-amber-400">Điểm: 0</span>
                        <p id="quiz-progress-text" class="text-xs text-slate-400 font-bold">Câu 1 / 10</p>
                    </div>
                </div>

                <div id="quiz-box" class="space-y-6">
                    <div class="text-center py-6 px-4 bg-slate-950/90 rounded-2xl border border-white/10 space-y-2.5 shadow-inner">
                        <span id="quiz-cat-badge" class="text-[10px] font-extrabold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wider">
                            Ngày 1 • STEM
                        </span>
                        <h2 id="quiz-term" class="text-3xl md:text-4xl font-black text-white tracking-tight">Semiconductor</h2>
                        <div class="flex items-center justify-center gap-2">
                            <p id="quiz-ipa" class="text-cyan-400 font-mono text-base font-bold">/ˌsem.i.kənˈdʌk.tər/</p>
                            <button onclick="playQuizAudio()" class="p-1.5 rounded-full hover:bg-slate-800 text-cyan-400 transition">
                                <i class="fa-solid fa-volume-high"></i>
                            </button>
                        </div>
                    </div>

                    <div id="quiz-options" class="grid grid-cols-1 gap-3"></div>
                </div>

                <div id="quiz-result" class="hidden text-center py-8 space-y-5">
                    <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                        <i class="fa-solid fa-trophy"></i>
                    </div>
                    <h3 class="text-2xl font-black text-white">Hoàn Thành Bài Kiểm Tra!</h3>
                    <p id="quiz-final-score" class="text-slate-300 text-base">Bạn đạt <span class="font-black text-amber-400">${quizScore} / ${quizQuestions.length}</span> câu đúng ngay từ lần chọn đầu tiên!</p>
                    <button onclick="startNewQuiz()" class="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-white transition shadow-xl shadow-violet-600/30 active:scale-95">
                        <i class="fa-solid fa-rotate-right mr-1.5"></i> Luyện Tập Tiếp
                    </button>
                </div>
            </div>
        </section>

        <!-- TAB 4: IMPORT & DATA MANAGEMENT -->
        <section id="view-import" class="hidden space-y-6">
            <!-- Import Box -->
            <div class="glass-panel p-6 md:p-8 rounded-3xl space-y-5 shadow-2xl">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 class="text-xl font-black text-white flex items-center gap-2">
                            <i class="fa-solid fa-file-import text-cyan-400"></i> Nhập Từ Vựng Mới
                        </h3>
                        <p class="text-xs text-slate-400 mt-1">Cú pháp: <code class="text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-white/10">Từ - (/IPA/) Nghĩa. | Câu ví dụ</code></p>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-slate-300 font-bold">Lưu vào Ngày:</span>
                            <input type="number" id="import-day-input" value="2" min="1" class="w-20 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-black focus:outline-none">
                        </div>

                        <select id="import-cat-select" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none cursor-pointer">
                            <option value="STEM">STEM / Vi Mạch</option>
                            <option value="Campus">Đại Học / Campus</option>
                        </select>
                    </div>
                </div>

                <textarea id="import-textarea" rows="7" placeholder="Algorithm - (/ˈælɡərɪðəm/) Thuật toán. | Our computer science professor demonstrated an efficient sorting algorithm during today's lecture.
Bandwidth - (/ˈbændwɪdθ/) Băng thông. | High bandwidth is required to stream university online lectures smoothly." class="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500 transition shadow-inner"></textarea>

                <div class="flex items-center justify-between pt-1">
                    <button onclick="loadSampleImport()" class="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline">Dán danh sách mẫu 16 từ học thuật AI</button>
                    <button id="btn-submit-import" onclick="processBatchImport()" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-white text-xs transition flex items-center gap-2 shadow-lg shadow-violet-600/25 active:scale-95">
                        <i class="fa-solid fa-plus"></i> Thêm Vào Bộ Thẻ
                    </button>
                </div>
            </div>

            <!-- Management Box -->
            <div class="glass-panel p-6 md:p-8 rounded-3xl border border-rose-900/30 space-y-4 shadow-2xl">
                <h3 class="text-lg font-black text-rose-300 flex items-center gap-2">
                    <i class="fa-solid fa-trash-can text-rose-400"></i> Quản Lý & Xóa Dữ Liệu
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div class="bg-slate-950/90 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                        <div>
                            <p class="text-xs font-bold text-slate-200">Xóa toàn bộ từ của 1 Ngày</p>
                            <p class="text-[11px] text-slate-400">Nhập số ngày cần xóa hoàn toàn</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="number" id="delete-day-input" placeholder="Ngày" min="1" class="w-16 bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-rose-300 font-bold focus:outline-none">
                            <button onclick="deleteSpecificDay()" class="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-200 border border-rose-500/30 text-xs font-bold transition">
                                Xóa
                            </button>
                        </div>
                    </div>

                    <div class="bg-slate-950/90 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-2">
                        <button onclick="restoreDefaultDeck()" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-white/10 transition">
                            <i class="fa-solid fa-rotate-left mr-1.5"></i> Khôi phục 20 từ gốc
                        </button>

                        <button onclick="clearAllDeck()" class="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-800/50 transition">
                            <i class="fa-solid fa-triangle-exclamation mr-1.5"></i> Xóa tất cả từ
                        </button>
                    </div>
                </div>
            </div>
        </section>

    </main>

    <!-- Footer -->
    <footer class="glass-panel border-t border-white/10 py-5 text-center text-xs text-slate-400 font-medium">
        <p><span class="font-extrabold text-white">QEnglish</span> • Nền Tảng Học Từ Vựng Tiếng Anh Thông Minh</p>
    </footer>

    <!-- JavaScript Engine -->
    <script>
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

        const DYNAMIC_EXAMPLE_TEMPLATES = [
            (t) => `The professor explained how ${t.toLowerCase()} works during today's academic lecture.`,
            (t) => `Students worked in the laboratory to analyze the key principles of ${t.toLowerCase()}.`,
            (t) => `Understanding ${t.toLowerCase()} is essential for passing the end-of-term examination.`,
            (t) => `Our study group prepared a detailed report focusing on ${t.toLowerCase()}.`,
            (t) => `Recent advancements in ${t.toLowerCase()} have created new opportunities in the tech industry.`,
            (t) => `The course syllabus includes several practical assignments related to ${t.toLowerCase()}.`,
            (t) => `During the university workshop, experts highlighted the importance of ${t.toLowerCase()}.`,
            (t) => `We reviewed several case studies demonstrating practical applications of ${t.toLowerCase()}.`
        ];

        let deck = [];
        let activeStudyDeck = [];
        let currentIndex = 0;
        let isFlipped = false;
        let autoPlay = true;
        let speechRate = 1.0;
        let activeTab = 'study';
        let currentCategoryFilter = 'all';

        window.addEventListener('DOMContentLoaded', () => {
            loadDeckFromStorage();
            applyStudyFilter();
            setupKeyboardListeners();
        });

        function loadDeckFromStorage() {
            const stored = localStorage.getItem('qenglish_deck_v2') || localStorage.getItem('qenglish_deck_v1') || localStorage.getItem('fpt_eng_deck_v3');
            deck = stored ? JSON.parse(stored) : [...DEFAULT_DECK];
            saveDeckToStorage();
        }

        function saveDeckToStorage() {
            localStorage.setItem('qenglish_deck_v2', JSON.stringify(deck));
            document.getElementById('nav-count').textContent = deck.length;
        }

        function updateSpeechRate(val) {
            speechRate = parseFloat(val) || 1.0;
            showToast(`Đã đổi tốc độ đọc sang ${speechRate}x`);
        }

        function parseDaysInput(str) {
            if (!str || str.trim() === '' || str.trim().toLowerCase() === 'all') return null;
            const set = new Set();
            const parts = str.split(',');
            parts.forEach(p => {
                p = p.trim();
                if (p.includes('-')) {
                    const [start, end] = p.split('-').map(n => parseInt(n.trim()));
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) set.add(i);
                    }
                } else {
                    const num = parseInt(p);
                    if (!isNaN(num)) set.add(num);
                }
            });
            return set.size > 0 ? set : null;
        }

        function getFilteredSubDeck(dayStr, limitVal, orderVal) {
            const daySet = parseDaysInput(dayStr);
            let result = deck.filter(item => {
                if (!daySet) return true;
                return daySet.has(item.day || 1);
            });

            if (orderVal === 'random') {
                result = [...result].sort(() => 0.5 - Math.random());
            } else {
                result = [...result].sort((a, b) => (a.day || 1) - (b.day || 1) || a.id - b.id);
            }

            const limit = parseInt(limitVal);
            if (!isNaN(limit) && limit > 0) {
                result = result.slice(0, limit);
            }
            return result;
        }

        function applyStudyFilter() {
            const dayStr = document.getElementById('study-day-input').value;
            const limitVal = document.getElementById('study-limit-input').value;
            const orderVal = document.getElementById('study-order-select').value;

            activeStudyDeck = getFilteredSubDeck(dayStr, limitVal, orderVal);
            currentIndex = 0;
            isFlipped = false;
            document.getElementById('flashcard-inner').classList.remove('is-flipped');
            renderCurrentCard();
        }

        function speakText(text) {
            if (!('speechSynthesis' in window) || !text) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = speechRate;
            window.speechSynthesis.speak(utterance);
        }

        function playCurrentAudio() {
            if (activeStudyDeck.length > 0) speakText(activeStudyDeck[currentIndex].term);
        }

        function playExampleAudio() {
            if (activeStudyDeck.length > 0 && activeStudyDeck[currentIndex].example) {
                speakText(activeStudyDeck[currentIndex].example);
            }
        }

        function playQuizAudio() {
            if (quizQuestions.length > 0 && quizQuestions[quizIndex]) {
                speakText(quizQuestions[quizIndex].term);
            }
        }

        function flipCard() {
            if (activeStudyDeck.length === 0) return;
            isFlipped = !isFlipped;
            const cardInner = document.getElementById('flashcard-inner');
            if (isFlipped) cardInner.classList.add('is-flipped');
            else cardInner.classList.remove('is-flipped');
        }

        function nextCard() {
            if (activeStudyDeck.length === 0) return;
            isFlipped = false;
            document.getElementById('flashcard-inner').classList.remove('is-flipped');
            currentIndex = (currentIndex + 1) % activeStudyDeck.length;
            renderCurrentCard();
            if (autoPlay) playCurrentAudio();
        }

        function prevCard() {
            if (activeStudyDeck.length === 0) return;
            isFlipped = false;
            document.getElementById('flashcard-inner').classList.remove('is-flipped');
            currentIndex = (currentIndex - 1 + activeStudyDeck.length) % activeStudyDeck.length;
            renderCurrentCard();
            if (autoPlay) playCurrentAudio();
        }

        function toggleStarCurrent() {
            if (activeStudyDeck.length === 0) return;
            const current = activeStudyDeck[currentIndex];
            current.starred = !current.starred;
            saveDeckToStorage();
            renderCurrentCard();
            showToast(current.starred ? 'Đã đánh dấu từ này' : 'Đã bỏ đánh dấu');
        }

        function renderCurrentCard() {
            if (activeStudyDeck.length === 0) {
                document.getElementById('card-term').textContent = "Trống";
                document.getElementById('card-ipa').textContent = "";
                document.getElementById('card-definition').textContent = "Không có từ vựng phù hợp điều kiện lọc.";
                document.getElementById('card-counter').textContent = "Thẻ 0 / 0";
                document.getElementById('card-example-box').classList.add('hidden');
                return;
            }

            const card = activeStudyDeck[currentIndex];
            document.getElementById('card-term').textContent = card.term;
            document.getElementById('card-ipa').textContent = card.ipa;
            document.getElementById('card-definition').textContent = card.def;
            
            const exBox = document.getElementById('card-example-box');
            if (card.example && card.example.trim() !== "") {
                document.getElementById('card-example').textContent = `"${card.example}"`;
                exBox.classList.remove('hidden');
            } else {
                exBox.classList.add('hidden');
            }

            document.getElementById('card-category-badge').textContent = `Ngày ${card.day || 1} • ${card.category === 'STEM' ? 'STEM / Vi Mạch' : 'Đại Học / Campus'}`;
            document.getElementById('card-counter').textContent = `Thẻ ${currentIndex + 1} / ${activeStudyDeck.length}`;
            document.getElementById('study-progress-bar').style.width = `${((currentIndex + 1) / activeStudyDeck.length) * 100}%`;

            const btn = document.getElementById('btn-star-current');
            if (card.starred) btn.innerHTML = `<i class="fa-solid fa-star text-amber-400 text-base"></i>`;
            else btn.innerHTML = `<i class="fa-regular fa-star text-slate-500 text-base"></i>`;
        }

        function processBatchImport() {
            const text = document.getElementById('import-textarea').value.trim();
            const selectedDay = parseInt(document.getElementById('import-day-input').value) || 1;
            const selectedCat = document.getElementById('import-cat-select').value;

            if (!text) {
                showToast('Vui lòng nhập từ vựng!', 'error');
                return;
            }

            const lines = text.split('\n');
            let addedCount = 0;

            lines.forEach((line, index) => {
                if (!line.trim()) return;

                let exampleStr = "";
                let mainContent = line;

                if (line.includes('|')) {
                    const exParts = line.split('|');
                    mainContent = exParts[0].trim();
                    exampleStr = exParts.slice(1).join('|').trim();
                }

                let term = "";
                let ipa = "";
                let def = "";

                if (mainContent.includes('-')) {
                    const parts = mainContent.split('-');
                    term = parts[0].trim();
                    const rest = parts.slice(1).join('-').trim();

                    const ipaMatch = rest.match(/\((.*?)\)/);
                    if (ipaMatch) {
                        ipa = ipaMatch[0];
                        def = rest.replace(ipaMatch[0], '').trim();
                    } else {
                        def = rest;
                    }
                } else {
                    term = mainContent.trim();
                }

                if (term) {
                    if (!exampleStr) {
                        const templateFn = DYNAMIC_EXAMPLE_TEMPLATES[index % DYNAMIC_EXAMPLE_TEMPLATES.length];
                        exampleStr = templateFn(term);
                    }

                    deck.push({
                        id: Date.now() + Math.random(),
                        day: selectedDay,
                        term: term,
                        ipa: ipa || "/.../",
                        def: def || term,
                        example: exampleStr,
                        category: selectedCat,
                        starred: false
                    });
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                saveDeckToStorage();
                document.getElementById('study-day-input').value = selectedDay.toString();
                applyStudyFilter();
                document.getElementById('import-textarea').value = "";
                showToast(`Đã thêm thành công ${addedCount} từ vựng vào Ngày ${selectedDay}!`);
                switchTab('study');
            }
        }

        function deleteItem(id) {
            if (confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) {
                deck = deck.filter(item => item.id !== id);
                saveDeckToStorage();
                renderWordList();
                applyStudyFilter();
                showToast('Đã xóa từ vựng thành công!');
            }
        }

        function deleteSpecificDay() {
            const dayVal = parseInt(document.getElementById('delete-day-input').value);
            if (isNaN(dayVal)) {
                showToast('Vui lòng nhập số ngày hợp lệ!', 'error');
                return;
            }
            const countBefore = deck.length;
            deck = deck.filter(item => (item.day || 1) !== dayVal);
            const deletedCount = countBefore - deck.length;

            if (deletedCount > 0) {
                saveDeckToStorage();
                renderWordList();
                applyStudyFilter();
                document.getElementById('delete-day-input').value = "";
                showToast(`Đã xóa ${deletedCount} từ vựng thuộc Ngày ${dayVal}!`);
            } else {
                showToast(`Không tìm thấy từ vựng nào thuộc Ngày ${dayVal}.`, 'error');
            }
        }

        function clearAllDeck() {
            if (confirm('Bạn có chắc chắn muốn XÓA TOÀN BỘ từ vựng không?')) {
                deck = [];
                saveDeckToStorage();
                renderWordList();
                applyStudyFilter();
                showToast('Đã xóa toàn bộ từ vựng!');
            }
        }

        function restoreDefaultDeck() {
            if (confirm('Khôi phục lại bộ 20 từ gốc Ngày 1?')) {
                deck = [...DEFAULT_DECK];
                saveDeckToStorage();
                renderWordList();
                applyStudyFilter();
                showToast('Đã khôi phục bộ từ vựng gốc!');
            }
        }

        /* QUIZ ENGINE */
        let quizQuestions = [];
        let quizIndex = 0;
        let quizScore = 0;
        let isFirstAttempt = true;

        function startNewQuiz() {
            const dayStr = document.getElementById('quiz-day-input').value;
            const limitVal = document.getElementById('quiz-limit-input').value;
            const orderVal = document.getElementById('quiz-order-select').value;

            quizQuestions = getFilteredSubDeck(dayStr, limitVal, orderVal);

            if (quizQuestions.length < 4) {
                showToast('Cần ít nhất 4 từ vựng trong điều kiện lọc để bắt đầu bài trắc nghiệm!', 'error');
                return;
            }

            document.getElementById('quiz-box').classList.remove('hidden');
            document.getElementById('quiz-result').classList.add('hidden');

            quizIndex = 0;
            quizScore = 0;
            renderQuizQuestion();
        }

        function renderQuizQuestion() {
            if (quizIndex >= quizQuestions.length) {
                showQuizResults();
                return;
            }

            isFirstAttempt = true;
            const current = quizQuestions[quizIndex];
            document.getElementById('quiz-score').textContent = `Điểm: ${quizScore}`;
            document.getElementById('quiz-progress-text').textContent = `Câu ${quizIndex + 1} / ${quizQuestions.length}`;
            document.getElementById('quiz-term').textContent = current.term;
            document.getElementById('quiz-ipa').textContent = current.ipa;
            document.getElementById('quiz-cat-badge').textContent = `Ngày ${current.day || 1} • ${current.category}`;

            const options = [current];
            while (options.length < 4) {
                const rand = deck[Math.floor(Math.random() * deck.length)];
                if (!options.some(o => o.id === rand.id)) options.push(rand);
            }
            options.sort(() => 0.5 - Math.random());

            const optionsContainer = document.getElementById('quiz-options');
            optionsContainer.innerHTML = options.map((opt) => `
                <button onclick="checkQuizAnswer(this, ${opt.id}, ${current.id})" class="quiz-opt-btn w-full p-4 rounded-2xl bg-slate-950 border border-white/10 font-bold text-left text-xs md:text-sm text-slate-200 transition flex items-center justify-between group hover:border-violet-500/50">
                    <span>${opt.def}</span>
                    <i class="fa-regular fa-circle text-slate-500 group-hover:text-violet-400"></i>
                </button>
            `).join('');

            if (autoPlay) speakText(current.term);
        }

        function checkQuizAnswer(btn, optId, correctId) {
            if (optId === correctId) {
                btn.className = "quiz-opt-btn w-full p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 font-extrabold text-left text-xs md:text-sm text-emerald-200 transition flex items-center justify-between shadow-lg shadow-emerald-500/10";
                btn.querySelector('i').className = "fa-solid fa-circle-check text-emerald-400 text-base";
                
                document.querySelectorAll('.quiz-opt-btn').forEach(b => b.onclick = null);

                if (isFirstAttempt) {
                    quizScore++;
                    document.getElementById('quiz-score').textContent = `Điểm: ${quizScore}`;
                }

                setTimeout(() => {
                    quizIndex++;
                    renderQuizQuestion();
                }, 900);
            } else {
                btn.className = "quiz-opt-btn w-full p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500 font-bold text-left text-xs md:text-sm text-rose-300 transition opacity-60 cursor-not-allowed";
                btn.querySelector('i').className = "fa-solid fa-circle-xmark text-rose-400 text-base";
                btn.onclick = null;
                isFirstAttempt = false;
                showToast('Chưa chính xác! Hãy chọn đáp án khác.', 'error');
            }
        }

        function showQuizResults() {
            document.getElementById('quiz-box').classList.add('hidden');
            document.getElementById('quiz-result').classList.remove('hidden');
            document.getElementById('quiz-final-score').innerHTML = `Bạn đạt <span class="font-black text-amber-400 text-lg">${quizScore} / ${quizQuestions.length}</span> câu đúng ngay từ lần chọn đầu tiên!`;
        }

        function switchTab(tab) {
            activeTab = tab;
            ['study', 'list', 'quiz', 'import'].forEach(t => {
                const view = document.getElementById(`view-${t}`);
                const btn = document.getElementById(`tab-btn-${t}`);
                if (t === tab) {
                    view.classList.remove('hidden');
                    if (btn) btn.className = "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30";
                } else {
                    view.classList.add('hidden');
                    if (btn) btn.className = "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5";
                }
            });
            if (tab === 'list') renderWordList();
            if (tab === 'quiz') startNewQuiz();
        }

        function renderWordList() {
            const container = document.getElementById('word-list-container');
            const search = document.getElementById('search-input').value.toLowerCase();
            const dayStr = document.getElementById('list-day-input').value;
            const daySet = parseDaysInput(dayStr);

            const filtered = deck.filter(item => {
                const matchesSearch = item.term.toLowerCase().includes(search) || item.def.toLowerCase().includes(search);
                const matchesDay = !daySet || daySet.has(item.day || 1);
                const matchesCat = currentCategoryFilter === 'all' || item.category === currentCategoryFilter;
                return matchesSearch && matchesDay && matchesCat;
            });

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12 text-slate-500 space-y-2">
                        <i class="fa-solid fa-folder-open text-4xl text-slate-600"></i>
                        <p class="font-bold">Không tìm thấy từ vựng phù hợp.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filtered.map(item => `
                <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3 transition duration-300">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <h4 class="font-black text-xl text-white tracking-tight">${item.term}</h4>
                                <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${item.category === 'STEM' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}">
                                    Ngày ${item.day || 1} • ${item.category}
                                </span>
                            </div>
                            <p class="text-xs font-mono text-cyan-400 mt-1 font-semibold">${item.ipa}</p>
                        </div>
                        <div class="flex items-center gap-1">
                            <button onclick="speakText('${item.term.replace(/'/g, "\\'")}')" class="p-2 text-cyan-400 hover:text-cyan-300 transition" title="Nghe từ">
                                <i class="fa-solid fa-volume-high"></i>
                            </button>
                            <button onclick="toggleStarItem(${item.id})" class="p-2 ${item.starred ? 'text-amber-400' : 'text-slate-600'} hover:text-amber-300 transition" title="Đánh dấu sao">
                                <i class="fa-solid fa-star"></i>
                            </button>
                            <button onclick="deleteItem(${item.id})" class="p-2 text-rose-500/70 hover:text-rose-400 transition" title="Xóa từ vựng">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-extrabold text-amber-300">${item.def}</p>
                        ${item.example ? `
                            <div class="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 cursor-pointer group/exitem" onclick="speakText('${item.example.replace(/'/g, "\\'")}')">
                                <p class="text-xs text-slate-300 italic group-hover/exitem:text-cyan-300 transition font-medium">"${item.example}"</p>
                                <span class="text-cyan-400 text-xs p-1"><i class="fa-solid fa-volume-high"></i></span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        function toggleStarItem(id) {
            const item = deck.find(d => d.id === id);
            if (item) {
                item.starred = !item.starred;
                saveDeckToStorage();
                renderWordList();
            }
        }

        function filterCategory(cat) {
            currentCategoryFilter = cat;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.className = "filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-white/10");
            const active = document.getElementById(`filter-btn-${cat}`);
            if (active) active.className = "filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white shadow-md";
            renderWordList();
        }

        function toggleAutoPlay() {
            autoPlay = !autoPlay;
            document.getElementById('autoplay-text').textContent = autoPlay ? "Tự Đọc: Bật" : "Tự Đọc: Tắt";
        }

        function setupKeyboardListeners() {
            document.addEventListener('keydown', (e) => {
                if (activeTab !== 'study' || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
                if (e.code === 'Space') { e.preventDefault(); flipCard(); }
                if (e.code === 'ArrowRight') nextCard();
                if (e.code === 'ArrowLeft') prevCard();
            });
        }

        function showToast(msg, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `px-4 py-3 rounded-2xl text-xs font-extrabold text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5 border border-white/10 ${type === 'error' ? 'bg-rose-600/90' : 'bg-gradient-to-r from-violet-600 to-indigo-600'}`;
            toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> ${msg}`;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        function loadSampleImport() {
            document.getElementById('import-textarea').value = `Hypothesis - (/haɪˈpɑː.θə.sɪs/) Giả thuyết nghiên cứu. | The research team formulated a clear hypothesis before starting the lab experiment.
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
Internship - (/ˈɪntɜːrnʃɪp/) Kỳ thực tập. | FPT students complete a four-month software engineering internship in their third year.
Curriculum - (/kəˈrɪk.jə.ləm/) Chương trình học. | The academic curriculum is updated annually to match tech industry demands.
Presentation - (/ˌprez.ənˈteɪ.ʃən/) Bài thuyết trình. | Each project team gave a ten-minute presentation to the industry experts.
Attendance - (/əˈten.dəns/) Điểm danh / Chuyên cần. | High attendance in lab sessions is mandatory for passing the module.
Tuition - (/tuːˈɪʃ.ən/) Học phí đại học. | Students can manage and pay their semester tuition through the campus portal.`;
            document.getElementById('import-day-input').value = "2";
        }
    </script>
</body>
</html>
