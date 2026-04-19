const STORAGE_KEY = 'flex-tracker-v1';
const PRESET_KEY = 'flex-warehouse-presets-v1';

const DEFAULT_WAREHOUSES = [
  'C014 - Cupertino',
  'C385 - Campbell',
  'C350 - Santa Clara Agnew',
  'C193 - San Jose Almaden',
  'C030 - Los Altos',
  'C432 - Sunnyvale Heritage',
  'CCH6 - Santa Clara Lucky',
  'CCW7 - San Jose FoodMaxx',
  '自定义输入'
];

const state = {
  records: loadRecords(),
  warehousePresets: loadWarehousePresets()
};

const els = {
  tabButtons: [...document.querySelectorAll('.tab')],
  panels: [...document.querySelectorAll('.tab-panel')],
  tabbar: document.getElementById('tabbar'),
  menuToggle: document.getElementById('menuToggle'),
  recordDate: document.getElementById('recordDate'),
  recordTime: document.getElementById('recordTime'),
  recordWeekday: document.getElementById('recordWeekday'),
  recordPeriod: document.getElementById('recordPeriod'),
  waveCount: document.getElementById('waveCount'),
  recordNote: document.getElementById('recordNote'),
  wavesContainer: document.getElementById('wavesContainer'),
  regenWavesBtn: document.getElementById('regenWavesBtn'),
  saveRecordBtn: document.getElementById('saveRecordBtn'),
  resetFormBtn: document.getElementById('resetFormBtn'),
  refreshStatsBtn: document.getElementById('refreshStatsBtn'),
  statsWeekdayFilter: document.getElementById('statsWeekdayFilter'),
  statsPeriodFilter: document.getElementById('statsPeriodFilter'),
  statsSummary: document.getElementById('statsSummary'),
  statsList: document.getElementById('statsList'),
  refreshRecordsBtn: document.getElementById('refreshRecordsBtn'),
  recordsList: document.getElementById('recordsList'),
  warehousePresetInput: document.getElementById('warehousePresetInput'),
  saveWarehousePresetBtn: document.getElementById('saveWarehousePresetBtn'),
  resetWarehousePresetBtn: document.getElementById('resetWarehousePresetBtn'),
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  importJsonInput: document.getElementById('importJsonInput'),
  clearAllBtn: document.getElementById('clearAllBtn')
};

init();

function init() {
  bindTabs();
  bindFormBasics();
  bindSettings();
  seedDefaults();
  renderWaveForms();
  renderStats();
  renderRecords();
}

function bindTabs() {
  els.tabButtons.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  els.menuToggle.addEventListener('click', () => {
    els.tabbar.classList.toggle('hidden');
  });
}

function switchTab(tabId) {
  els.tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  els.panels.forEach(p => p.classList.toggle('active', p.id === tabId));
}

function bindFormBasics() {
  els.recordDate.addEventListener('change', syncWeekdayFromDate);
  els.recordTime.addEventListener('change', syncPeriodFromTime);
  els.waveCount.addEventListener('change', renderWaveForms);
  els.regenWavesBtn.addEventListener('click', renderWaveForms);
  els.resetFormBtn.addEventListener('click', resetForm);
  els.saveRecordBtn.addEventListener('click', saveRecord);
  els.refreshStatsBtn.addEventListener('click', renderStats);
  els.refreshRecordsBtn.addEventListener('click', renderRecords);
  els.statsWeekdayFilter.addEventListener('change', renderStats);
  els.statsPeriodFilter.addEventListener('change', renderStats);
}

function bindSettings() {
  els.saveWarehousePresetBtn.addEventListener('click', saveWarehousePresets);
  els.resetWarehousePresetBtn.addEventListener('click', () => {
    state.warehousePresets = [...DEFAULT_WAREHOUSES];
    persistWarehousePresets();
    els.warehousePresetInput.value = state.warehousePresets.join('\n');
    renderWaveForms();
    alert('已恢复默认仓库列表。');
  });

  els.exportJsonBtn.addEventListener('click', exportJson);
  els.importJsonInput.addEventListener('change', importJson);
  els.clearAllBtn.addEventListener('click', clearAllData);
}

function seedDefaults() {
  const now = new Date();
  els.recordDate.value = toDateInputValue(now);
  els.recordTime.value = toTimeInputValue(now);
  syncWeekdayFromDate();
  syncPeriodFromTime();
  els.warehousePresetInput.value = state.warehousePresets.join('\n');
}

function syncWeekdayFromDate() {
  els.recordWeekday.value = getChineseWeekday(els.recordDate.value);
}

function syncPeriodFromTime() {
  const value = els.recordTime.value;
  if (!value) return;
  const hour = Number(value.split(':')[0]);
  els.recordPeriod.value = hour < 12 ? '上午' : '下午';
}

function renderWaveForms() {
  const count = Number(els.waveCount.value || 1);
  els.wavesContainer.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const node = document.getElementById('waveTemplate').content.cloneNode(true);
    const wrapper = node.querySelector('.wave-card');
    wrapper.dataset.waveIndex = String(i);
    node.querySelector('.wave-title').textContent = `第 ${i} 波`;

    const capturedSelect = node.querySelector('.wave-captured');
    const capturedSection = node.querySelector('.captured-section');
    const capturedForm = node.querySelector('.captured-form');
    capturedForm.appendChild(createOfferItem(true));

    capturedSelect.addEventListener('change', () => {
      capturedSection.classList.toggle('hidden', capturedSelect.value !== '是');
    });

    const addOfferBtn = node.querySelector('.add-offer-btn');
    const offersContainer = node.querySelector('.offers-container');
    offersContainer.appendChild(createOfferItem(false));
    addOfferBtn.addEventListener('click', () => offersContainer.appendChild(createOfferItem(false)));

    els.wavesContainer.appendChild(node);
  }
}

function createOfferItem(isCaptured) {
  const node = document.getElementById('offerTemplate').content.cloneNode(true);
  const item = node.querySelector('.offer-item');
  const select = node.querySelector('.offer-warehouse-select');
  const custom = node.querySelector('.offer-warehouse-custom');
  populateWarehouseSelect(select);
  select.addEventListener('change', () => {
    const customMode = select.value === '自定义输入';
    custom.classList.toggle('hidden', !customMode);
  });

  const execDateInput = node.querySelector('.offer-exec-date');
  const execWeekdayInput = node.querySelector('.offer-exec-weekday');
  execDateInput.addEventListener('change', () => {
    execWeekdayInput.value = getChineseWeekday(execDateInput.value);
  });

  node.querySelector('.remove-offer-btn').addEventListener('click', () => {
    const container = item.parentElement;
    item.remove();
    if (!isCaptured && container && container.children.length === 0) {
      container.appendChild(createOfferItem(false));
    }
  });
  return node;
}

function populateWarehouseSelect(select) {
  select.innerHTML = '';
  state.warehousePresets.forEach(preset => {
    const opt = document.createElement('option');
    opt.value = preset;
    opt.textContent = preset;
    select.appendChild(opt);
  });
}

function saveRecord() {
  if (!els.recordDate.value || !els.recordTime.value) {
    alert('请先填写观察日期和观察时间。');
    return;
  }
  const record = {
    id: crypto.randomUUID(),
    observedDate: els.recordDate.value,
    observedTimeMinute: els.recordTime.value.slice(0,5),
    observedWeekday: els.recordWeekday.value,
    observedPeriod: els.recordPeriod.value,
    waveCount: Number(els.waveCount.value),
    note: els.recordNote.value.trim(),
    createdAt: new Date().toISOString(),
    waves: collectWaves()
  };

  if (record.waves.some(w => w.offers.length === 0)) {
    alert('每一波至少保留一条看到的出单记录。');
    return;
  }

  state.records.unshift(record);
  persistRecords();
  renderStats();
  renderRecords();
  switchTab('recordsTab');
  alert('已保存。');
}

function collectWaves() {
  const waveCards = [...document.querySelectorAll('.wave-card')];
  return waveCards.map((card, idx) => {
    const captured = card.querySelector('.wave-captured').value;
    return {
      index: idx + 1,
      seenAt: card.querySelector('.wave-seconds').value || '',
      offerCountSeen: Number(card.querySelector('.wave-offer-count').value || 0),
      captured,
      offers: collectOfferItems(card.querySelector('.offers-container')),
      capturedOffer: captured === '是' ? collectOfferItems(card.querySelector('.captured-form'))[0] : null
    };
  });
}

function collectOfferItems(container) {
  const items = [...container.querySelectorAll('.offer-item')];
  return items.map(item => {
    const select = item.querySelector('.offer-warehouse-select');
    const custom = item.querySelector('.offer-warehouse-custom');
    const warehouse = select.value === '自定义输入' ? (custom.value.trim() || '未命名仓库') : select.value;
    return {
      warehouse,
      type: item.querySelector('.offer-type').value,
      execDate: item.querySelector('.offer-exec-date').value,
      execWeekday: item.querySelector('.offer-exec-weekday').value,
      startTime: item.querySelector('.offer-start').value,
      endTime: item.querySelector('.offer-end').value,
      price: Number(item.querySelector('.offer-price').value || 0),
      weekBucket: item.querySelector('.offer-week-bucket').value
    };
  }).filter(x => x.warehouse);
}

function renderStats() {
  const weekdayFilter = els.statsWeekdayFilter.value;
  const periodFilter = els.statsPeriodFilter.value;
  const filtered = state.records.filter(r => (weekdayFilter === '全部' || r.observedWeekday === weekdayFilter) && (periodFilter === '全部' || r.observedPeriod === periodFilter));

  els.statsSummary.innerHTML = '';
  const totalWaves = filtered.reduce((sum, r) => sum + r.waves.length, 0);
  const capturedCount = filtered.reduce((sum, r) => sum + r.waves.filter(w => w.captured === '是').length, 0);
  const nodes = new Set(filtered.map(r => `${r.observedWeekday}|${r.observedPeriod}|${r.observedTimeMinute}`));

  [
    ['记录总数', filtered.length],
    ['规律节点', nodes.size],
    ['抢到波次', capturedCount + ' / ' + totalWaves]
  ].forEach(([label, value]) => {
    const div = document.createElement('div');
    div.className = 'summary-pill';
    div.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    els.statsSummary.appendChild(div);
  });

  const groups = groupByNode(filtered);
  const groupList = Object.values(groups).sort((a,b) => b.records.length - a.records.length);
  if (groupList.length === 0) {
    els.statsList.innerHTML = '<div class="empty-note">还没有符合筛选条件的数据。</div>';
    return;
  }

  els.statsList.innerHTML = '';
  groupList.forEach(group => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    const warehouseFreq = countMap(flatten(group.records.map(r => r.waves.flatMap(w => w.offers.map(o => o.warehouse)))));
    const weekBucketFreq = countMap(flatten(group.records.map(r => r.waves.flatMap(w => w.offers.map(o => o.weekBucket)))));
    const timeSlotFreq = countMap(flatten(group.records.map(r => r.waves.flatMap(w => w.offers.map(o => `${o.startTime || '--'}-${o.endTime || '--'}`)))));
    const prices = flatten(group.records.map(r => r.waves.flatMap(w => w.offers.map(o => o.price).filter(Boolean))));
    const wavePattern = countMap(group.records.map(r => `${r.waveCount}波`));
    const capturedWaveCount = group.records.reduce((sum, r) => sum + r.waves.filter(w => w.captured === '是').length, 0);
    const totalWaveCount = group.records.reduce((sum, r) => sum + r.waves.length, 0);

    card.innerHTML = `
      <div class="record-head">
        <div>
          <h3 class="inline-title">${group.weekday} / ${group.period} / ${group.time}</h3>
          <div class="meta-line">
            <span class="chip primary">出现 ${group.records.length} 次</span>
            <span class="chip">抢到率 ${(totalWaveCount ? (capturedWaveCount/totalWaveCount*100) : 0).toFixed(0)}%</span>
          </div>
        </div>
      </div>
      <div class="offer-chip-wrap">
        ${renderTopChips('常见仓库', warehouseFreq)}
      </div>
      <div class="offer-chip-wrap">
        ${renderTopChips('波次结构', wavePattern)}
      </div>
      <div class="offer-chip-wrap">
        ${renderTopChips('执行归属', weekBucketFreq)}
      </div>
      <div class="offer-chip-wrap">
        ${renderTopChips('常见时间段', timeSlotFreq)}
      </div>
      <div class="meta-line">
        <span class="chip">价格均值 ${prices.length ? '$' + average(prices).toFixed(2) : '暂无'}</span>
        <span class="chip">最高 ${prices.length ? '$' + Math.max(...prices).toFixed(2) : '暂无'}</span>
        <span class="chip">最低 ${prices.length ? '$' + Math.min(...prices).toFixed(2) : '暂无'}</span>
      </div>
    `;
    els.statsList.appendChild(card);
  });
}

function renderRecords() {
  if (state.records.length === 0) {
    els.recordsList.innerHTML = '<div class="empty-note">还没有记录。</div>';
    return;
  }
  els.recordsList.innerHTML = '';
  state.records.forEach(record => {
    const card = document.createElement('div');
    card.className = 'record-card';
    const capturedOffers = record.waves.filter(w => w.capturedOffer).map(w => `第${w.index}波: ${formatOffer(w.capturedOffer)}`);
    const seenWarehouses = countMap(flatten(record.waves.map(w => w.offers.map(o => o.warehouse))));
    card.innerHTML = `
      <div class="record-head">
        <div>
          <h3 class="inline-title">${record.observedDate} ${record.observedWeekday} ${record.observedPeriod} ${record.observedTimeMinute}</h3>
          <div class="meta-line">
            <span class="chip">${record.waveCount} 波</span>
            <span class="chip">仓库 ${Object.keys(seenWarehouses).length} 个</span>
          </div>
        </div>
        <button class="danger-text-btn" data-delete-id="${record.id}">删除</button>
      </div>
      <div class="offer-chip-wrap">
        ${Object.entries(seenWarehouses).slice(0,8).map(([k,v]) => `<span class="chip">${k} × ${v}</span>`).join('')}
      </div>
      <div class="meta-line">
        <span class="chip primary">抢到：${capturedOffers.length ? capturedOffers.join('；') : '无'}</span>
      </div>
      ${record.note ? `<p class="muted">备注：${escapeHtml(record.note)}</p>` : ''}
    `;
    els.recordsList.appendChild(card);
  });

  [...document.querySelectorAll('[data-delete-id]')].forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteId;
      if (!confirm('确定删除这条记录？')) return;
      state.records = state.records.filter(r => r.id !== id);
      persistRecords();
      renderStats();
      renderRecords();
    });
  });
}

function saveWarehousePresets() {
  const lines = els.warehousePresetInput.value.split('\n').map(x => x.trim()).filter(Boolean);
  if (!lines.length) {
    alert('仓库列表不能为空。');
    return;
  }
  if (!lines.includes('自定义输入')) lines.push('自定义输入');
  state.warehousePresets = lines;
  persistWarehousePresets();
  renderWaveForms();
  alert('仓库列表已保存。');
}

function exportJson() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    warehousePresets: state.warehousePresets,
    records: state.records
  };
  downloadBlob(JSON.stringify(payload, null, 2), `flex-tracker-backup-${todayCompact()}.json`, 'application/json');
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result));
      if (!Array.isArray(payload.records)) throw new Error('JSON 格式不正确');
      state.records = payload.records;
      if (Array.isArray(payload.warehousePresets) && payload.warehousePresets.length) {
        state.warehousePresets = payload.warehousePresets;
        persistWarehousePresets();
        els.warehousePresetInput.value = state.warehousePresets.join('\n');
      }
      persistRecords();
      renderWaveForms();
      renderStats();
      renderRecords();
      alert('导入成功。');
    } catch (err) {
      alert('导入失败：' + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file, 'utf-8');
}

function clearAllData() {
  if (!confirm('确定清空全部记录吗？这个操作不能撤销。')) return;
  state.records = [];
  persistRecords();
  renderStats();
  renderRecords();
  alert('已清空。');
}

function resetForm() {
  seedDefaults();
  els.recordNote.value = '';
  els.waveCount.value = '1';
  renderWaveForms();
}

function groupByNode(records) {
  return records.reduce((acc, record) => {
    const key = `${record.observedWeekday}|${record.observedPeriod}|${record.observedTimeMinute}`;
    if (!acc[key]) {
      acc[key] = {
        key,
        weekday: record.observedWeekday,
        period: record.observedPeriod,
        time: record.observedTimeMinute,
        records: []
      };
    }
    acc[key].records.push(record);
    return acc;
  }, {});
}

function renderTopChips(label, mapObj) {
  const top = Object.entries(mapObj).sort((a,b) => b[1]-a[1]).slice(0, 5);
  if (!top.length) return `<span class="chip">${label}：暂无</span>`;
  return top.map(([k,v], idx) => `<span class="chip ${idx===0 ? 'primary' : ''}">${label}：${escapeHtml(k)} × ${v}</span>`).join('');
}

function formatOffer(offer) {
  if (!offer) return '无';
  return `${offer.warehouse} / ${offer.execDate || '--'} / ${offer.startTime || '--'}-${offer.endTime || '--'} / $${Number(offer.price || 0).toFixed(2)}`;
}

function countMap(arr) {
  return arr.reduce((acc, item) => {
    if (!item) return acc;
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

function average(nums) {
  return nums.reduce((a,b) => a+b, 0) / nums.length;
}

function flatten(arr) {
  return arr.flat ? arr.flat() : [].concat(...arr);
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function persistRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
}

function loadWarehousePresets() {
  try {
    const data = JSON.parse(localStorage.getItem(PRESET_KEY) || 'null');
    return Array.isArray(data) && data.length ? data : [...DEFAULT_WAREHOUSES];
  } catch {
    return [...DEFAULT_WAREHOUSES];
  }
}

function persistWarehousePresets() {
  localStorage.setItem(PRESET_KEY, JSON.stringify(state.warehousePresets));
}

function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toTimeInputValue(date) {
  return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

function getChineseWeekday(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '';
  return ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
}

function todayCompact() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
