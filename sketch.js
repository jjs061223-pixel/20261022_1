// 設定六道幼兒生活常識配對題，圖示會以畫布動畫呈現。
const questions = [
  { icon: "🚰", answer: "飯前便後要洗手", prompt: "小朋友，吃東西前和上完廁所後，我們要記得做什麼呢？", color: "#b9e7e5" }, // 洗手好習慣與親切提問。
  { icon: "🚦", answer: "走斑馬線看綠燈", prompt: "過馬路的時候，要走哪裡，又要看什麼燈呢？", color: "#ffd98e" }, // 交通安全常識與親切提問。
  { icon: "🪥", answer: "每天早晚都刷牙", prompt: "想讓牙齒亮晶晶，早上和晚上要記得做什麼呢？", color: "#ffc5b9" }, // 口腔清潔常識與親切提問。
  { icon: "♻️", answer: "寶特瓶要放回收", prompt: "喝完飲料的寶特瓶，可以放到哪裡讓它重新利用呢？", color: "#cbe8ad" }, // 資源回收常識與親切提問。
  { icon: "🥦", answer: "多吃蔬菜和水果", prompt: "想要健康長大，除了飯飯，也要多吃什麼呢？", color: "#d9d2f7" }, // 均衡飲食常識與親切提問。
  { icon: "🌙", answer: "晚上早睡有精神", prompt: "晚上早一點睡覺，隔天起床才會怎麼樣呢？", color: "#f7d3a2" } // 規律作息常識與親切提問。
]; // 完成題目資料。

// 建立測驗互動需要的全域狀態。
let answers = Array(6).fill(null); // 儲存每個圖片位置所選的文字答案。
let order = []; // 儲存亂數排列後的文字答案編號。
let cards = []; // 儲存上方圖片卡片位置。
let choices = []; // 儲存下方文字選項位置。
let dragged = null; // 儲存正在拖曳的答案編號。
let sourceSlot = -1; // 儲存答案開始拖曳時所在的圖片位置。
let submitted = false; // 記錄是否已經交卷。
let score = 0; // 儲存答對題數。
let confetti = []; // 儲存高分彩帶動畫粒子。
let submitButton = {}; // 儲存交卷按鈕範圍。
let restartButton = {}; // 儲存重新開始按鈕範圍。

function setup() { // 初始化全螢幕畫布和文字樣式。
  createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器尺寸的畫布。
  textFont("Trebuchet MS, Arial, sans-serif"); // 設定容易閱讀的字體。
  order = shuffle([0, 1, 2, 3, 4, 5]); // 隨機排列六個文字選項。
  noStroke(); // 關閉預設圖形外框。
} // 完成畫布初始化。

function draw() { // 持續繪製測驗畫面和插圖動畫。
  background("#f7f8f1"); // 設定柔和明亮的畫布背景。
  drawHeader(); // 繪製標題和測驗進度。
  drawCards(); // 繪製上方六個圖片配對位置。
  drawChoices(); // 繪製下方六個文字選項。
  drawSubmit(); // 繪製交卷按鈕和完成提示。
  if (submitted) drawResult(); // 交卷後顯示成績與彩帶。
} // 完成當前畫面繪製。

function isMobile() { // 判斷是否需要使用窄螢幕版面。
  return width < 760; // 小於 760 像素時改用手機排列。
} // 完成裝置寬度判斷。

function getCardRects() { // 計算六個圖片卡片的響應式位置。
  const columns = isMobile() ? 3 : 6; // 手機每列三張，桌機每列六張。
  const margin = isMobile() ? 16 : 42; // 設定卡片區左右留白。
  const gap = isMobile() ? 10 : 14; // 設定卡片間距。
  const top = isMobile() ? 130 : 168; // 設定第一列卡片的垂直位置。
  const cardWidth = (width - margin * 2 - gap * (columns - 1)) / columns; // 計算卡片寬度。
  const cardHeight = isMobile() ? min(126, height * 0.19) : min(250, height * 0.28); // 計算卡片高度。
  return questions.map((item, index) => ({ x: margin + (index % columns) * (cardWidth + gap), y: top + floor(index / columns) * (cardHeight + gap), w: cardWidth, h: cardHeight })); // 回傳六個卡片座標。
} // 完成卡片座標計算。

function drawHeader() { // 繪製測驗頁首。
  const margin = isMobile() ? 18 : 42; // 設定頁首左右留白。
  fill("#31584f"); // 設定品牌文字顏色。
  textAlign(LEFT, CENTER); // 將品牌文字靠左對齊。
  textSize(isMobile() ? 13 : 15); // 設定品牌文字大小。
  text("小小生活研究所", margin, 30); // 顯示測驗名稱。
  fill("#7c8d7f"); // 設定進度文字顏色。
  textAlign(RIGHT, CENTER); // 將進度文字靠右對齊。
  text(`${answers.filter((item) => item !== null).length} / 6 已配對`, width - margin, 30); // 顯示已配對題數。
  fill("#213c36"); // 設定標題顏色。
  textAlign(CENTER, CENTER); // 將主標題置中。
  textStyle(BOLD); // 加粗主標題。
  textSize(isMobile() ? 27 : 38); // 依裝置調整主標題大小。
  text("生活小達人", width / 2, isMobile() ? 73 : 87); // 顯示測驗標題。
  textStyle(NORMAL); // 還原一般字重。
  fill("#61766a"); // 設定說明文字顏色。
  textSize(isMobile() ? 12 : 15); // 設定說明文字大小。
  text("把下方的生活好習慣，拖曳到正確的圖案下方", width / 2, isMobile() ? 103 : 121); // 顯示操作提示。
  restartButton = { x: width - margin - 66, y: 48, w: 66, h: 28 }; // 設定重新開始按鈕範圍。
  fill("#e5eee4"); // 設定重新開始按鈕底色。
  rect(restartButton.x, restartButton.y, restartButton.w, restartButton.h, 14); // 繪製重新開始按鈕。
  fill("#31584f"); // 設定按鈕文字顏色。
  textAlign(CENTER, CENTER); // 將按鈕文字置中。
  textSize(11); // 設定按鈕文字大小。
  text("重新開始", restartButton.x + 33, restartButton.y + 14); // 顯示重新開始文字。
} // 完成頁首繪製。

function drawCards() { // 繪製六個圖片位置和動畫插圖。
  cards = getCardRects(); // 更新六個卡片座標。
  cards.forEach((card, index) => { // 逐一繪製每張題目卡片。
    fill("#ffffff"); // 設定卡片底色。
    rect(card.x, card.y, card.w, card.h, 16); // 繪製白色圓角卡片。
    fill(questions[index].color); // 設定插圖背景顏色。
    rect(card.x + 8, card.y + 8, card.w - 16, card.h * 0.57, 12); // 繪製彩色插圖區。
    const bounce = sin(frameCount * 0.07 + index) * (isMobile() ? 2 : 4); // 計算插圖彈跳幅度。
    textAlign(CENTER, CENTER); // 將插圖符號置中。
    textSize(isMobile() ? 38 : 58); // 設定插圖符號大小。
    text(questions[index].icon, card.x + card.w / 2, card.y + card.h * 0.31 + bounce); // 繪製上下彈跳的生活圖示。
    const slotY = card.y + card.h * 0.68; // 計算答案放置區的垂直位置。
    const slotH = card.h * 0.23; // 計算答案放置區的高度。
    fill(answers[index] === null ? "#f3f5ef" : "#e4f0e5"); // 依配對狀態設定放置區顏色。
    rect(card.x + 7, slotY, card.w - 14, slotH, 9); // 繪製答案放置區。
    fill(answers[index] === null ? "#9aa79d" : "#31584f"); // 設定提示或答案文字顏色。
    textSize(isMobile() ? 10 : 12); // 設定提示或答案文字大小。
    text(answers[index] === null ? "拖曳到這裡" : questions[answers[index]].answer, card.x + card.w / 2, slotY + slotH / 2); // 將放置提示或已選答案置於放置區正中央。
  }); // 完成六張卡片繪製。
} // 完成題目卡片繪製。

function getChoiceRects() { // 計算下方六個答案選項的位置。
  const columns = isMobile() ? 3 : 6; // 手機每列三個，桌機每列六個。
  const margin = isMobile() ? 16 : 42; // 設定選項區左右留白。
  const gap = isMobile() ? 9 : 12; // 設定選項間距。
  const lastCard = cards[cards.length - 1]; // 取得最後一張卡片的位置。
  const cardsBottom = lastCard.y + lastCard.h; // 計算整個圖片區的底部位置。
  const titleY = isMobile() ? cardsBottom + 23 : height * 0.56; // 設定文字選項區標題位置。
  const top = titleY + (isMobile() ? 25 : 34); // 設定第一排選項位置。
  const itemWidth = (width - margin * 2 - gap * (columns - 1)) / columns; // 計算選項寬度。
  const itemHeight = isMobile() ? min(48, height * 0.073) : 66; // 計算選項高度。
  return order.map((item, index) => ({ item, x: margin + (index % columns) * (itemWidth + gap), y: top + floor(index / columns) * (itemHeight + gap), w: itemWidth, h: itemHeight, titleY })); // 回傳選項座標。
} // 完成選項座標計算。

function drawChoices() { // 繪製可拖曳的六個文字答案。
  choices = getChoiceRects(); // 更新六個選項座標。
  fill("#31584f"); // 設定選項區標題顏色。
  textAlign(CENTER, CENTER); // 將選項區標題置中。
  textStyle(BOLD); // 加粗選項區標題。
  textSize(isMobile() ? 14 : 17); // 設定選項區標題大小。
  text("生活好習慣", width / 2, choices[0].titleY); // 顯示選項區標題。
  textStyle(NORMAL); // 還原一般字重。
  choices.forEach((choice) => { // 逐一繪製文字選項。
    if (answers.includes(choice.item) && dragged !== choice.item) return; // 略過已經配對的答案。
    fill(dragged === choice.item ? "#dce9dd" : "#ffffff"); // 設定選項底色。
    rect(choice.x, choice.y, choice.w, choice.h, 12); // 繪製白色圓角選項。
    fill("#31584f"); // 設定選項文字顏色。
    textAlign(CENTER, CENTER); // 將選項文字置中。
    textSize(isMobile() ? 10 : 13); // 設定選項文字大小。
    text(questions[choice.item].answer, choice.x + choice.w / 2, choice.y + choice.h / 2); // 將生活常識答案水平與垂直置中顯示。
  }); // 完成六個文字選項繪製。
  if (dragged !== null) drawDraggedChoice(); // 拖曳期間繪製跟隨游標的選項。
} // 完成文字選項繪製。

function drawDraggedChoice() { // 繪製目前跟隨游標的答案。
  const w = isMobile() ? min(190, width - 32) : 220; // 設定浮動選項寬度。
  const h = isMobile() ? 48 : 60; // 設定浮動選項高度。
  rectMode(CENTER); // 改用中心座標繪圖。
  fill("#31584f"); // 設定浮動選項底色。
  rect(mouseX, mouseY, w, h, 13); // 繪製游標下的浮動選項。
  fill("#ffffff"); // 設定浮動文字顏色。
  textAlign(CENTER, CENTER); // 將浮動文字置中。
  textSize(isMobile() ? 11 : 14); // 設定浮動文字大小。
  text(questions[dragged].answer, mouseX, mouseY, w - 12, h - 6); // 顯示正在拖曳的文字。
  rectMode(CORNER); // 還原一般繪圖座標模式。
} // 完成浮動選項繪製。

function drawSubmit() { // 繪製交卷按鈕和完成提醒。
  const complete = answers.every((item) => item !== null); // 檢查六個位置是否都已配對。
  const buttonW = isMobile() ? min(220, width - 40) : 250; // 設定交卷按鈕寬度。
  const buttonH = isMobile() ? 46 : 54; // 設定交卷按鈕高度。
  const lastChoice = choices[choices.length - 1]; // 取得最後一個選項的位置。
  const buttonY = isMobile() ? min(height - 58, lastChoice.y + lastChoice.h + 14) : height * 0.78; // 計算交卷按鈕位置。
  submitButton = { x: (width - buttonW) / 2, y: buttonY, w: buttonW, h: buttonH }; // 保存交卷按鈕座標。
  fill(complete ? "#e56848" : "#d5dcd4"); // 依完成狀態設定按鈕底色。
  rect(submitButton.x, submitButton.y, buttonW, buttonH, 15); // 繪製交卷按鈕。
  fill(complete ? "#ffffff" : "#7f8c82"); // 依完成狀態設定按鈕文字顏色。
  textAlign(CENTER, CENTER); // 將按鈕文字置中。
  textStyle(BOLD); // 加粗交卷文字。
  textSize(isMobile() ? 15 : 17); // 設定交卷文字大小。
  text("交卷看成績", width / 2, buttonY + buttonH / 2); // 顯示交卷按鈕文字。
  textStyle(NORMAL); // 還原一般字重。
  if (!complete && !submitted) { // 未完成配對時顯示提醒。
    fill("#849188"); // 設定提醒文字顏色。
    textSize(11); // 設定提醒文字大小。
    text("把六個答案都放好，就可以交卷囉！", width / 2, buttonY + buttonH + 15); // 提醒完成所有配對。
  } // 完成交卷提示繪製。
} // 完成交卷按鈕繪製。

function drawResult() { // 顯示作答成績和重新挑戰按鈕。
  if (score / 6 >= 0.8) drawConfetti(); // 達百分之八十以上時播放彩帶。
  fill("rgba(30, 48, 40, 0.4)"); // 設定成績視窗背景遮罩。
  rect(0, 0, width, height); // 覆蓋畫布背景。
  const panelW = min(isMobile() ? width - 36 : 430, width - 32); // 計算成績視窗寬度。
  const panelH = isMobile() ? 282 : 310; // 設定成績視窗高度。
  const panelX = (width - panelW) / 2; // 計算成績視窗水平位置。
  const panelY = (height - panelH) / 2; // 計算成績視窗垂直位置。
  fill("#fffdf7"); // 設定成績視窗底色。
  rect(panelX, panelY, panelW, panelH, 22); // 繪製白色圓角成績視窗。
  fill(score / 6 >= 0.8 ? "#e56848" : "#31584f"); // 依得分設定鼓勵文字顏色。
  textAlign(CENTER, CENTER); // 將成績內容置中。
  textSize(isMobile() ? 20 : 24); // 設定鼓勵文字大小。
  text(score / 6 >= 0.8 ? "太棒了，生活小達人！" : "完成挑戰，做得很好！", width / 2, panelY + 53); // 顯示鼓勵訊息。
  fill("#213c36"); // 設定百分比成績顏色。
  textStyle(BOLD); // 加粗百分比成績。
  textSize(isMobile() ? 58 : 68); // 設定百分比成績大小。
  text(`${round((score / 6) * 100)}%`, width / 2, panelY + 135); // 顯示百分比成績。
  textStyle(NORMAL); // 還原一般字重。
  fill("#718076"); // 設定答對題數顏色。
  textSize(15); // 設定答對題數文字大小。
  text(`答對 ${score} 題，共 6 題`, width / 2, panelY + 190); // 顯示答對題數。
  fill("#e56848"); // 設定重玩按鈕顏色。
  rect(panelX + 48, panelY + panelH - 66, panelW - 96, 46, 13); // 繪製重新挑戰按鈕。
  fill("#ffffff"); // 設定重玩按鈕文字顏色。
  textSize(15); // 設定重玩按鈕文字大小。
  text("再玩一次", width / 2, panelY + panelH - 43); // 顯示重新挑戰文字。
} // 完成成績視窗繪製。

function drawConfetti() { // 更新並繪製高分慶祝彩帶。
  if (confetti.length < 100) { // 彩帶不足時新增粒子。
    for (let index = 0; index < 4; index += 1) confetti.push({ x: random(width), y: random(-height, 0), speed: random(2, 6), color: random(["#e56848", "#f2bc55", "#60a99b", "#7e83c8", "#ed8fb2"]) }); // 製作彩色飄落粒子。
  } // 完成彩帶粒子補充。
  confetti.forEach((piece) => { // 逐一更新彩帶位置。
    piece.y += piece.speed; // 讓彩帶往下落。
    piece.x += sin(frameCount * 0.04 + piece.y) * 1.2; // 讓彩帶左右飄動。
    if (piece.y > height + 10) piece.y = random(-80, -10); // 讓離開畫面的彩帶重新出現。
    fill(piece.color); // 設定目前彩帶顏色。
    push(); // 保存目前繪圖狀態。
    translate(piece.x, piece.y); // 移動到彩帶位置。
    rotate(frameCount * 0.03 + piece.x); // 旋轉彩帶紙片。
    rectMode(CENTER); // 使用中心位置繪製紙片。
    rect(0, 0, 7, 13, 2); // 繪製一片彩帶。
    pop(); // 還原繪圖狀態。
  }); // 完成彩帶位置更新。
} // 完成彩帶動畫。

function inside(x, y, box) { // 判斷滑鼠是否位於指定範圍。
  return box && x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h; // 回傳範圍碰撞結果。
} // 完成範圍判斷。

function speakQuestion(index) { // 以繁體中文親切朗讀指定題目。
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return; // 瀏覽器不支援語音時安靜略過。
  window.speechSynthesis.cancel(); // 點選新圖片時停止前一段朗讀。
  const speech = new window.SpeechSynthesisUtterance(questions[index].prompt); // 建立目前圖片的語音內容。
  speech.lang = "zh-TW"; // 設定繁體中文語音。
  speech.rate = 0.88; // 放慢語速，讓幼兒容易聽清楚。
  speech.pitch = 1.18; // 提高音調，營造輕快親切的感覺。
  speech.volume = 1; // 將音量設定為瀏覽器允許的最大值。
  window.speechSynthesis.speak(speech); // 開始朗讀題目。
} // 完成語音朗讀。

function mousePressed() { // 處理拖曳開始和按鈕點擊。
  if (submitted) { // 成績畫面只處理再玩一次按鈕。
    const panelW = min(isMobile() ? width - 36 : 430, width - 32); // 計算成績視窗寬度。
    const panelH = isMobile() ? 282 : 310; // 計算成績視窗高度。
    const panelY = (height - panelH) / 2; // 計算成績視窗起始位置。
    if (mouseX > width / 2 - panelW / 2 + 30 && mouseX < width / 2 + panelW / 2 - 30 && mouseY > panelY + panelH - 76 && mouseY < panelY + panelH - 12) resetQuiz(); // 點擊重玩按鈕時重設測驗。
    return false; // 停止處理成績視窗背後的點擊。
  } // 完成成績畫面點擊處理。
  if (inside(mouseX, mouseY, restartButton)) { // 檢查是否點擊重新開始。
    resetQuiz(); // 重設測驗內容。
    return false; // 停止目前點擊處理。
  } // 完成重新開始按鈕判斷。
  if (inside(mouseX, mouseY, submitButton) && answers.every((item) => item !== null)) { // 檢查是否完成配對並點擊交卷。
    score = answers.reduce((sum, answer, slot) => sum + (answer === slot ? 1 : 0), 0); // 計算正確配對數。
    submitted = true; // 顯示成績結果。
    confetti = []; // 清除舊彩帶以便重新播放。
    return false; // 停止目前點擊處理。
  } // 完成交卷按鈕判斷。
  for (let index = 0; index < cards.length; index += 1) { // 檢查是否點擊圖片插圖區。
    const card = cards[index]; // 取得目前圖片卡片範圍。
    if (mouseX >= card.x && mouseX <= card.x + card.w && mouseY >= card.y && mouseY <= card.y + card.h * 0.64) { // 只在點擊卡片上方插圖時播放語音。
      speakQuestion(index); // 朗讀這張圖片對應的生活常識提問。
      return false; // 播放語音後不開始拖曳。
    } // 完成單張圖片點擊判斷。
  } // 完成所有圖片點擊檢查。
  for (let slot = 0; slot < cards.length; slot += 1) { // 檢查卡片上的已配對答案。
    const card = cards[slot]; // 取得目前卡片範圍。
    if (answers[slot] !== null && mouseX >= card.x && mouseX <= card.x + card.w && mouseY >= card.y + card.h * 0.66 && mouseY <= card.y + card.h * 0.95) { // 點選已配答案即可再次移動。
      dragged = answers[slot]; // 記錄正在拖曳的答案。
      sourceSlot = slot; // 記錄答案原位置。
      return false; // 開始拖曳後停止其他判斷。
    } // 完成已配答案的拖曳判斷。
  } // 完成卡片答案檢查。
  for (const choice of choices) { // 檢查下方文字選項。
    if (!answers.includes(choice.item) && inside(mouseX, mouseY, choice)) { // 只允許拖曳尚未配對的答案。
      dragged = choice.item; // 記錄正在拖曳的答案。
      sourceSlot = -1; // 標記答案來自選項區。
      return false; // 開始拖曳後停止其他判斷。
    } // 完成文字選項拖曳判斷。
  } // 完成所有文字選項檢查。
  return false; // 停止瀏覽器預設滑鼠行為。
} // 完成拖曳開始處理。

function mouseReleased() { // 將拖曳答案放入目標圖片卡片。
  if (dragged === null) return false; // 沒有拖曳答案時直接結束。
  const target = cards.findIndex((card) => mouseX >= card.x && mouseX <= card.x + card.w && mouseY >= card.y && mouseY <= card.y + card.h); // 找出滑鼠所在卡片。
  if (target !== -1) { // 放到卡片上時完成配對。
    if (sourceSlot !== -1 && sourceSlot !== target) answers[sourceSlot] = answers[target]; // 移動答案時保留目標原有配對。
    answers[target] = dragged; // 將拖曳答案放入目標卡片。
  } // 完成答案放置。
  dragged = null; // 清除正在拖曳的答案。
  sourceSlot = -1; // 清除答案原始位置。
  return false; // 停止瀏覽器預設滑鼠行為。
} // 完成答案放置處理。

function resetQuiz() { // 重設測驗以便重新遊玩。
  answers = Array(6).fill(null); // 清空所有配對答案。
  order = shuffle([0, 1, 2, 3, 4, 5]); // 重新排列六個文字選項。
  dragged = null; // 清除拖曳狀態。
  sourceSlot = -1; // 清除答案原始位置。
  submitted = false; // 關閉成績視窗。
  score = 0; // 清空上一輪成績。
  confetti = []; // 清空彩帶粒子。
} // 完成測驗重設。

function windowResized() { // 瀏覽器尺寸改變時重新調整畫布。
  resizeCanvas(windowWidth, windowHeight); // 維持全螢幕響應式畫布。
} // 完成畫布尺寸更新。
