(function () {
  'use strict';

  var questions = window.EXAM_QUESTIONS || [];
  var letters = ['ก', 'ข', 'ค', 'ง'];
  var totalSeconds = 180 * 60;
  var current = 0;
  var answers = [];
  var flags = [];
  var remaining = totalSeconds;
  var timerId = null;

  function el(id) { return document.getElementById(id); }

  function initArrays() {
    answers = new Array(questions.length);
    flags = new Array(questions.length);
    for (var i = 0; i < questions.length; i += 1) {
      answers[i] = null;
      flags[i] = false;
    }
  }

  function formatTime(seconds) {
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = seconds % 60;
    return [h, m, s].map(function (v) { return String(v).padStart(2, '0'); }).join(':');
  }

  function startExam() {
    try {
      if (!questions.length) throw new Error('ไม่พบข้อมูลข้อสอบ กรุณาตรวจสอบว่าอัปโหลด questions.js แล้ว');
      var name = el('candidateName').value.trim() || 'ผู้เข้าสอบ';
      el('candidateDisplay').textContent = 'ผู้เข้าสอบ: ' + name;
      el('startError').hidden = true;
      el('startScreen').hidden = true;
      el('examScreen').hidden = false;
      buildGrid();
      renderQuestion();
      el('timerDisplay').textContent = formatTime(remaining);
      timerId = window.setInterval(tick, 1000);
      window.scrollTo(0, 0);
    } catch (err) {
      el('startError').textContent = err.message || 'ไม่สามารถเริ่มข้อสอบได้';
      el('startError').hidden = false;
    }
  }

  function tick() {
    remaining -= 1;
    if (remaining < 0) remaining = 0;
    el('timerDisplay').textContent = formatTime(remaining);
    if (remaining === 0) submitExam(true);
  }

  function buildGrid() {
    var grid = el('questionGrid');
    grid.innerHTML = '';
    questions.forEach(function (_, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'number-btn';
      button.textContent = String(index + 1);
      button.addEventListener('click', function () {
        current = index;
        renderQuestion();
      });
      grid.appendChild(button);
    });
  }

  function renderQuestion() {
    var q = questions[current];
    el('questionMeta').textContent = 'ข้อ ' + (current + 1) + ' จาก ' + questions.length + ' • ' + q.category;
    el('questionText').textContent = q.question;
    var box = el('optionsBox');
    box.innerHTML = '';

    q.options.forEach(function (optionText, optionIndex) {
      var label = document.createElement('label');
      label.className = 'option' + (answers[current] === optionIndex ? ' selected' : '');
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'answerOption';
      radio.checked = answers[current] === optionIndex;
      radio.addEventListener('change', function () {
        answers[current] = optionIndex;
        renderQuestion();
      });
      var text = document.createElement('span');
      text.innerHTML = '<b>' + letters[optionIndex] + '.</b> ' + escapeHtml(optionText);
      label.appendChild(radio);
      label.appendChild(text);
      box.appendChild(label);
    });

    el('prevButton').disabled = current === 0;
    el('nextButton').disabled = current === questions.length - 1;
    el('flagButton').textContent = flags[current] ? '⚑ ยกเลิกเครื่องหมาย' : '⚑ ทำเครื่องหมาย';
    updateStatus();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char];
    });
  }

  function updateStatus() {
    var buttons = document.querySelectorAll('.number-btn');
    var answered = 0;
    for (var i = 0; i < answers.length; i += 1) {
      if (answers[i] !== null) answered += 1;
      buttons[i].className = 'number-btn' + (answers[i] !== null ? ' done' : '') + (flags[i] ? ' flagged' : '') + (i === current ? ' current' : '');
    }
    el('statusText').textContent = 'ตอบแล้ว ' + answered + '/' + questions.length + ' • เหลือ ' + (questions.length - answered);
    el('progressBar').style.width = ((answered / questions.length) * 100) + '%';
  }

  function submitExam(autoSubmit) {
    var blank = answers.filter(function (v) { return v === null; }).length;
    if (!autoSubmit && !window.confirm('ยังไม่ได้ตอบ ' + blank + ' ข้อ ต้องการส่งข้อสอบหรือไม่?')) return;
    if (timerId) window.clearInterval(timerId);
    el('examScreen').hidden = true;
    el('resultScreen').hidden = false;

    var score = 0;
    var categories = {};
    questions.forEach(function (q, index) {
      if (!categories[q.category]) categories[q.category] = [0, 0];
      categories[q.category][1] += 1;
      if (answers[index] === q.answer) {
        score += 1;
        categories[q.category][0] += 1;
      }
    });

    el('scoreDisplay').textContent = score + '/' + questions.length;
    var used = totalSeconds - remaining;
    el('resultSummary').innerHTML = (score >= 60 ? '<b style="color:#15803d">ผ่านเกณฑ์ฝึก 60%</b>' : '<b style="color:#b91c1c">ยังไม่ถึงเกณฑ์ฝึก 60%</b>') + '<br>เวลาที่ใช้ ' + Math.floor(used / 60) + ' นาที ' + (used % 60) + ' วินาที';

    var rows = '';
    Object.keys(categories).forEach(function (category) {
      var v = categories[category];
      rows += '<tr><td>' + escapeHtml(category) + '</td><td>' + v[0] + '</td><td>' + v[1] + '</td><td>' + Math.round(v[0] * 100 / v[1]) + '%</td></tr>';
    });
    el('categoryRows').innerHTML = rows;
    window.scrollTo(0, 0);
  }

  function showReview() {
    var html = '<h2>เฉลยละเอียด</h2>';
    questions.forEach(function (q, index) {
      var correct = answers[index] === q.answer;
      html += '<div class="card review-item ' + (correct ? 'ok' : '') + '">';
      html += '<b>ข้อ ' + (index + 1) + ' • ' + escapeHtml(q.category) + '</b>';
      html += '<p>' + escapeHtml(q.question) + '</p>';
      html += '<p>คำตอบของคุณ: ' + (answers[index] === null ? 'ไม่ได้ตอบ' : letters[answers[index]] + '. ' + escapeHtml(q.options[answers[index]])) + ' ' + (correct ? '✅' : '❌') + '</p>';
      html += '<p><b>คำตอบที่ถูก: ' + letters[q.answer] + '. ' + escapeHtml(q.options[q.answer]) + '</b></p>';
      html += '<div class="explanation"><b>อธิบาย:</b> ' + escapeHtml(q.explanation) + '</div></div>';
    });
    el('reviewBox').innerHTML = html;
    el('reviewBox').hidden = false;
    el('reviewBox').scrollIntoView({ behavior: 'smooth' });
  }

  function attachEvents() {
    el('startButton').addEventListener('click', startExam);
    el('candidateName').addEventListener('keydown', function (event) { if (event.key === 'Enter') startExam(); });
    el('prevButton').addEventListener('click', function () { if (current > 0) { current -= 1; renderQuestion(); } });
    el('nextButton').addEventListener('click', function () { if (current < questions.length - 1) { current += 1; renderQuestion(); } });
    el('flagButton').addEventListener('click', function () { flags[current] = !flags[current]; renderQuestion(); });
    el('submitButton').addEventListener('click', function () { submitExam(false); });
    el('reviewButton').addEventListener('click', showReview);
    el('restartButton').addEventListener('click', function () { window.location.reload(); });
    el('printButton').addEventListener('click', function () { window.print(); });
  }

  initArrays();
  attachEvents();
}());
