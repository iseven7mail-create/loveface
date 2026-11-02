'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const form = $('selection-form');
  let current = null;
  let lastIndex = {female: -1, male: -1};
  // Rejection sampling keeps all choices equally likely. Orientation never enters the draw.
  function randomInt(max) {
    const limit = Math.floor(4294967296 / max) * max;
    const value = new Uint32Array(1);
    do { crypto.getRandomValues(value); } while (value[0] >= limit);
    return value[0] % max;
  }
  function selections() {
    const data = new FormData(form);
    const orientation = data.get('orientation');
    const gender = data.get('gender');
    const otherGender = orientation === 'same' ? gender : gender === 'male' ? 'female' : 'male';
    return {orientation, gender, pronoun: otherGender === 'female' ? '她' : '他'};
  }
  form.addEventListener('change', () => {
    const {orientation, gender, pronoun} = selections();
    $('gender-fieldset').disabled = !orientation;
    $('draw-button').disabled = !orientation || !gender;
    $('selection-note').textContent = !gender ? '接著選擇自己的性別，決定使用哪一版牌卡。' : `將使用${gender === 'male' ? '男' : '女'}版牌卡，心裡的對方稱為「${pronoun}」。`;
  });
  function draw() {
    const {orientation, gender, pronoun} = selections();
    if (!orientation || !gender) return;
    const deck = window.LOVE_CARDS[gender];
    // A redraw skips only the last card, to give the player a new reflection each time.
    let index = randomInt(deck.length - (lastIndex[gender] < 0 ? 0 : 1));
    if (lastIndex[gender] >= 0 && index >= lastIndex[gender]) index++;
    lastIndex[gender] = index;
    current = deck[index];
    const [headline, reading, action1, action2, say] = window.LOVE_ADVICE[current.key];
    const score = randomInt(101);
    const imagePath = `assets/${gender}/${current.webp.split('/').pop()}`;
    $('image-error').hidden = true;
    $('card-image').alt = `${gender === 'male' ? '男' : '女'}版 ${current.title}。牌面心聲：${current.dialogue}`;
    $('card-image').src = imagePath;
    $('large-card').src = imagePath;
    $('large-card').alt = $('card-image').alt;
    $('dialog-title').textContent = current.title;
    $('card-number').textContent = `NO. ${String(current.number).padStart(2, '0')} / 38`;
    $('card-title').textContent = current.title;
    $('quote').textContent = `「${current.dialogue}」`;
    $('result-context').textContent = `${gender === 'male' ? '男' : '女'}版牌卡 · 心裡的對方：${pronoun} · 借牌卡象徵，看看關係裡的自己。`;
    $('score').textContent = score;
    $('score-label').textContent = score >= 75 ? '讓這份心動，成為真誠的邀請。' : score >= 40 ? '慢慢了解，給彼此一點空間。' : '先照顧自己，不必急著追分數。';
    $('score-fill').style.width = `${score}%`;
    $('reading-title').textContent = headline;
    $('reading-text').textContent = `${reading} 想像與${pronoun}相處的時候，哪些片段讓你有共鳴？`;
    $('emotion').textContent = current.emotion;
    $('say').textContent = `「${say}」`;
    $('actions').replaceChildren(...[action1, action2].map(text => {
      const item = document.createElement('li'); item.textContent = text; return item;
    }));
    $('symbols').replaceChildren(...current.labels.flatMap(label => {
      const title = document.createElement('dt'); title.textContent = label.name;
      const body = document.createElement('dd'); body.textContent = label.body;
      return [title, body];
    }));
    document.querySelector('details').open = false;
    $('intro').hidden = true;
    $('result').hidden = false;
    $('result-title').focus({preventScroll:true});
    window.scrollTo({top:0, behavior:'instant'});
  }
  form.addEventListener('submit', event => { event.preventDefault(); if (form.reportValidity()) draw(); });
  $('redraw').addEventListener('click', draw);
  function reset() {
    $('result').hidden = true;
    $('intro').hidden = false;
    form.reset();
    $('gender-fieldset').disabled = true;
    $('draw-button').disabled = true;
    $('selection-note').textContent = '先選擇取向，再選擇自己的性別。';
    current = null;
    form.querySelector('input').focus({preventScroll:true});
    window.scrollTo({top:0, behavior:'instant'});
  }
  $('reset').addEventListener('click', reset);
  $('reset-top').addEventListener('click', reset);
  $('card-image').addEventListener('error', () => { $('image-error').hidden = false; });
  $('zoom-card').addEventListener('click', () => { if (current) { $('card-dialog').showModal(); document.querySelector('.dialog-scroll').scrollTop = 0; } });
  $('close-dialog').addEventListener('click', () => $('card-dialog').close());
  $('card-dialog').addEventListener('click', event => { if (event.target === $('card-dialog')) { const r = $('card-dialog').getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('card-dialog').close(); } });
})();
