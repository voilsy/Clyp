// ═══════════════════════════════════════
//  ELECTRON WINDOW CONTROLS
// ═══════════════════════════════════════
if (window.electronAPI) {
  document.getElementById('btn-min').addEventListener('click', () => window.electronAPI.minimizeWindow());
  document.getElementById('btn-max').addEventListener('click', () => window.electronAPI.maximizeWindow());
  document.getElementById('btn-close').addEventListener('click', () => window.electronAPI.closeWindow());
}

// ═══════════════════════════════════════
//  DATA & STATE
// ═══════════════════════════════════════
let ACCS=[
  {id:1,icon:'🎮',name:'Steam',email:'alex@gmail.com',tag:'Game',tc:'game',url:'store.steampowered.com',added:'2026-03-15T12:00:00.000Z',changed:'2026-05-10T12:00:00.000Z',pass:'K7#mQ2!xLp@9vN3w',has2fa:true,lastUsed: Date.now() - 10000},
  {id:2,icon:'🛒',name:'Amazon',email:'alex@gmail.com',tag:'Retail',tc:'retail',url:'amazon.com',added:'2026-01-05T12:00:00.000Z',changed:'2026-01-05T12:00:00.000Z',pass:'mXp@3!kLqR9z',has2fa:false,lastUsed: Date.now() - 50000},
];
let nid=11, selId=1, passVis=false, gMode=0, fMode='all', editId=null, selIcon='🔑'; let backupVis = false; // Хранит статус: скрыты или показаны резервные коды в просмотре
let curGenEntropy = 0; // Хранит энтропию текущего сгенерированного пароля

let NOTES=[
  {id:1,title:'AWS Root Credentials',body:'Root access key ID: AKIA...\nSecret: stored in 1password',date:'2025-05-02T12:00:00.000Z',tags:['Work','Credentials'],pinned:true},
  {id:2,title:'Home WiFi Passwords',body:'Home: SuperSecret2024!',date:'2025-04-28T12:00:00.000Z',tags:['Personal'],pinned:false},
];
let nnid=6, selNid=1, nSaveT=null, nFilt='all';
let curSort = 'az';

// --- ЛОГИКА СОХРАНЕНИЯ И ПРИМЕНЕНИЯ ---
let SETT = { theme: 'system', color: 'blue', font: 'Regular', date: 'DD.MM.YYYY', lang: 'en', autoBackup: false, passExpiry: true, weakWarn: true, autoUpdate: true, lastBackup: 0, releaseNotes: '', releaseVersion: ''};
let TEMP_SETT = { ...SETT };

// ГЛАВНАЯ ФУНКЦИЯ СОХРАНЕНИЯ: собирает все массивы и отправляет на жесткий диск
function syncData() {
  if (window.electronAPI) {
    window.electronAPI.saveData({
      SETT: SETT,
      ACCS: ACCS,
      NOTES: NOTES,
      nid: nid,
      nnid: nnid
    });
  }
}

function toggleSett(key, btn) {
  btn.classList.toggle('on');
  TEMP_SETT[key] = btn.classList.contains('on');
}

function checkAutoBackup() {
  if (!SETT.autoBackup) return;
  const now = new Date();
  let d = new Date(now);
  d.setHours(6, 0, 0, 0);
  let day = d.getDay();
  let diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  if (now.getTime() < d.getTime()) d.setDate(d.getDate() - 7);
  const scheduledTime = d.getTime();
  const lastBackup = SETT.lastBackup || 0;
  
  if (lastBackup < scheduledTime && now.getTime() >= scheduledTime) {
    toast('tAutoBackup');
    exportVault(true);
    SETT.lastBackup = now.getTime();
    TEMP_SETT.lastBackup = now.getTime();
  }
  syncData();
}

// ═══════════════════════════════════════
//  DICTIONARY (СЛОВАРЬ КЛЮЧЕЙ ПЕРЕВОДА)
// ═══════════════════════════════════════
const DICT = {
  en: {
    navGen: 'Generator', navAdd: 'Add Account', navAcc: 'Accounts', navNot: 'Secure Notes', navSet: 'Settings',
    tGen: 'Password Generator', tAdd: 'Add to Vault', tAcc: 'Accounts', tNot: 'Secure Notes', tSet: 'Settings',
    btnDiscard: 'Discard', btnSave: 'Save Changes', btnCancel: 'Cancel', btnAddV: 'Save to Vault',
    searchA: 'Search accounts…', searchN: 'Search notes…',
    gRand: 'Random', gPass: 'Passphrase', gPin: 'PIN',
    gLbl1: 'Generated Password', gLbl2: 'Options', gLbl3: 'Character Types', gLbl4: 'Entropy & Stats', gLbl5: 'Recent History',
    gCopy: 'Copy', gRegen: 'Regenerate', gStr: 'Strength', gLen: 'Length', gWc: 'Word count', gPlen: 'PIN Length',
    gAmb: 'Avoid ambiguous chars', gRep: 'No repeated characters', gCap: 'Capitalize words', gInc: 'Include numbers',
    gSub1: 'Skip 0, O, l, 1, I…', gBtnGen: 'Generate New Password', gBtnUse: 'Use in Add Account',
    gChar: 'Characters', gCrack: 'Crack time', gCs: 'Charset',
    cSec: 'seconds', cHr: 'hours', cYr: 'years', cCen: 'centuries',
    strW: 'Weak', strF: 'Fair', strG: 'Strong', strS: 'Very Strong',
    aLbl1: 'Service Details', aLbl2: 'Credentials', aLbl3: 'Icon', aLbl4: 'Additional', aLbl5: 'Live Preview', aLbl6: 'Security Score', aLbl7: 'Checklist',
    aSn: 'Service Name', aUrl: 'Website URL', aCat: 'Category', aUser: 'Username / Email', aPass: 'Password',
    aGenP: 'Generate Strong Password', a2fa: 'Enable 2FA (TOTP)', a2faSub: 'Add TOTP secret key', aTotpK: 'TOTP Secret Key',
    acSort: 'Sort:', acAll: 'All', acBtnAdd: 'Add Account',
    acSort1: 'A–Z', acSort2: 'Z–A', acSort3: 'Recently Used', acSort4: 'Date Added',
    acCEm: 'Copy Email', acCPw: 'Copy Password', acEdit: 'Edit', acDel: 'Delete',
    acL1: 'Credentials', acL2: 'Two-Factor Auth', acL3: 'Security',
    acU: 'Username', acP: 'Password', acW: 'Website', acTotp: 'TOTP CODE', acRef: 'Refreshes in',
    aBackup: "Backup Codes", acBkpCodes: "BACKUP CODES", tBackupCopied: "Backup codes copied!",
    acStr: 'Strength', acChg: 'Changed', acAge: 'Password Age', acUnique: 'Uniqueness', unqYes: 'Unique', unqNo: 'Reused in', ageFresh: 'Fresh', ageOld: 'Stale', ageCrit: 'Old', dPlural: 'days',
    nNew: '+ New', nBtn: 'New Note', nTags: 'Tags:',
    mDelT: 'Delete Account?', mDelS: 'This will permanently remove this account from your vault. This action cannot be undone.', mDelBtn: 'Delete',
    ssGen: 'General', ssVlt: 'Vault', ssUpd: 'Updates',
    sgTit: 'General Settings', sgThm: 'Theme', sgThmS: 'Light, dark, or follow system', optSys: 'System', optLi: 'Light', optDa: 'Dark',
    sgAcc: 'Accent Color', sgAccS: 'Choose your primary color',
    sgFnt: 'Interface Size', sgFntS: 'Change interface size', optReg: 'Regular', optLg: 'Large', optXl: 'Extra Large',
    sgLan: 'Language & Region', sgDat: 'Date Format', sgDatS: 'How dates are displayed',
    sgSup: 'Support', sgFeed: 'Send Feedback', sgFeedS: 'Help us improve Clyp', sgFeedB: 'Feedback',
    svTit: 'Vault & Data', svBkp: 'Automatic Backup', svBkpS: 'Weekly automated backup', svExp: 'Password Expiry', svExpS: 'Remind to update old passwords',
    svWk: 'Weak Password Warnings', svWkS: 'Alert for passwords that are easy to crack',
    svIE: 'Import & Export', svImpC: 'Import Passwords', svImpCS: 'Import JSON (Chrome or Old App)', svImpB: 'Import',
    svExpV: 'Export Vault Backup', svExpVS: 'Download vault backup', svExpB: 'Export',
    svExpC: 'Export to CSV', svExpCS: '⚠ Passwords will be unencrypted', svExpCB: 'Export CSV',
    svDan: 'Danger Zone', svDel: 'Delete All Data', svDelS: 'Permanently wipe all accounts and notes', svDelB: 'Erase Vault',
    suTit: 'Updates', suChk: 'Check for Updates', suAut: 'Automatic Updates', suAutS: 'Download and install updates automatically', suRel: 'Release Notes',
    // Системные уведомления и Empty States
    tSaved: 'Settings saved successfully!', tDiscarded: 'Changes discarded', tAccentUpdated: 'Accent color updated',
    tFontUpdated: 'Interface size updated', tDateSaved: 'Date format saved', tNoAcc: 'No accounts found',
    tNoNotes: 'No notes found', tCopied: 'Copied!', tPassCopied: 'Password copied!', tEmailCopied: 'Email copied!',
    tNoteCopied: 'Note copied!', tAccAdded: 'Added to vault!', tAccUpdated: 'Updated!', tAccDeleted: 'Account deleted',
    tNoteDeleted: 'Note deleted', tNotePinned: 'Note pinned!', tNoteUnpinned: 'Note unpinned',
    tNoNoteSel: "Select a note or create a new one", tSaving: "Saving...", tSavedNote: "Saved",
    tFeedbackDisabled: 'Feedback is currently disabled', tEraseSuccess: 'All data has been permanently erased.',
    tImportSuccess: 'Successfully imported accounts!', tImportFail: 'No valid accounts found in file.',
    tParseFail: 'Failed to parse JSON file.', tBackupSuccess: 'Vault backup exported successfully!',
    tCsvSuccess: 'CSV exported successfully!', tEmptyVault: 'Vault is empty!', tEnterService: 'Please enter a service name',
    tEnterPass: 'Please enter a password', tEnterUser: 'Please enter a username or email', tAutoBackup: 'Running scheduled automatic backup...',
    tPassInserted: 'Password inserted!', tStrongGen: 'Strong password generated!', tAddedPrefix: 'Added ',
    tWarnTit: 'Warnings', tWeakDetect: 'Weak password detected', tExpDetect: 'Password is older than 90 days', tNotFnd: 'Not found',
    ftueTit1: "Hello! My name is Clyp", ftueSub1: "I'm your new best friend for password management. Let's set everything up in just a few clicks.",
    ftueTit2: "Choose your language", ftueTit3: "Make it yours", ftueTheme: "Theme", ftueAcc: "Accent Color",
    ftueTit4: "Almost done!", ftueSub4: "If you are coming from an old app, you can import your passwords right now. Or just start fresh!",
    ftueImp: "Import JSON File", ftueNot: "(You can always change these settings later in the app)",
    tImporting: "Processing...", tImportDone: "Success!", tImportError: "Failed",
    tUpdChecking: "Checking updates server...", tUpdLatest: "No updates found", tUpdAvailable: "Downloading update...", tUpdPending: "Update is pending download", tUpdReady: "Update is ready to install", tUpdError: "Connection error",
  },
  ru: {
    navGen: 'Генератор', navAdd: 'Добавить', navAcc: 'Аккаунты', navNot: 'Заметки', navSet: 'Настройки',
    tGen: 'Генератор паролей', tAdd: 'Добавить в хранилище', tAcc: 'Аккаунты', tNot: 'Секретные заметки', tSet: 'Настройки',
    btnDiscard: 'Сбросить', btnSave: 'Сохранить', btnCancel: 'Отмена', btnAddV: 'Сохранить',
    searchA: 'Поиск аккаунтов…', searchN: 'Поиск заметок…',
    gRand: 'Случайный', gPass: 'Фраза', gPin: 'ПИН-код',
    gLbl1: 'Сгенерированный пароль', gLbl2: 'Опции', gLbl3: 'Типы символов', gLbl4: 'Статистика', gLbl5: 'История генерации',
    gCopy: 'Копировать', gRegen: 'Обновить', gStr: 'Надежность', gLen: 'Длина', gWc: 'Количество слов', gPlen: 'Длина ПИН-кода',
    gAmb: 'Без похожих символов', gRep: 'Без повторений', gCap: 'Заглавные буквы', gInc: 'Включая цифры',
    gSub1: 'Пропускать 0, O, l, 1, I…', gBtnGen: 'Сгенерировать новый', gBtnUse: 'Использовать для аккаунта',
    gChar: 'Символов', gCrack: 'Взлом займет', gCs: 'Алфавит',
    cSec: 'секунды', cHr: 'часы', cYr: 'годы', cCen: 'века',
    strW: 'Слабый', strF: 'Средний', strG: 'Надежный', strS: 'Отличный',
    aLbl1: 'Детали сервиса', aLbl2: 'Данные для входа', aLbl3: 'Иконка', aLbl4: 'Дополнительно', aLbl5: 'Предпросмотр', aLbl6: 'Оценка безопасности', aLbl7: 'Чек-лист',
    aSn: 'Название сервиса', aUrl: 'Веб-сайт', aCat: 'Категория', aUser: 'Юзернейм / Email', aPass: 'Пароль',
    aGenP: 'Сгенерировать надежный', a2fa: 'Включить 2FA (TOTP)', a2faSub: 'Добавить секретный ключ', aTotpK: 'Секретный ключ TOTP',
    acSort: 'Сортировка:', acAll: 'Все', acBtnAdd: 'Добавить аккаунт',
    acSort1: 'А–Я', acSort2: 'Я–А', acSort3: 'Недавние', acSort4: 'Сначала старые',
    acCEm: 'Скопировать Email', acCPw: 'Скопировать пароль', acEdit: 'Изменить', acDel: 'Удалить',
    acL1: 'Данные для входа', acL2: 'Двухфакторная аутентификация', acL3: 'Безопасность',
    acU: 'Имя', acP: 'Пароль', acW: 'Веб-сайт', acTotp: 'КОД TOTP', acRef: 'Обновится через',
    aBackup: "Резервные коды", acBkpCodes: "РЕЗЕРВНЫЕ КОДЫ", tBackupCopied: "Резервные коды скопированы!",
    acStr: 'Надежность', acChg: 'Изменен', acAge: 'Возраст', acUnique: 'Уникальность', unqYes: 'Уникальный', unqNo: 'Повторов:', ageFresh: 'Свежий', ageOld: 'Устаревает', ageCrit: 'Старый', dPlural: 'дн.',
    nNew: '+ Новая', nBtn: 'Новая заметка', nTags: 'Теги:',
    mDelT: 'Удалить аккаунт?', mDelS: 'Это навсегда удалит аккаунт из вашего хранилища. Это действие необратимо.', mDelBtn: 'Удалить',
    ssGen: 'Основные', ssVlt: 'Хранилище', ssUpd: 'Обновления',
    sgTit: 'Основные настройки', sgThm: 'Тема', sgThmS: 'Светлая, темная или системная', optSys: 'Системная', optLi: 'Светлая', optDa: 'Темная',
    sgAcc: 'Акцентный цвет', sgAccS: 'Выберите основной цвет',
    sgFnt: 'Размер интерфейса', sgFntS: 'Измените размер интерфейса', optReg: 'Обычный', optLg: 'Увеличенный', optXl: 'Очень крупный',
    sgLan: 'Язык и Регион', sgDat: 'Формат даты', sgDatS: 'Вариант отображения дат',
    sgSup: 'Поддержка', sgFeed: 'Отправить отзыв', sgFeedS: 'Помогите нам стать лучше', sgFeedB: 'Отзыв',
    svTit: 'Хранилище и Данные', svBkp: 'Резервное копирование', svBkpS: 'Еженедельное автоматическое создание резервной копии', svExp: 'Срок действия паролей', svExpS: 'Напоминать об обновлении старых паролей',
    svWk: 'Слабые пароли', svWkS: 'Предупреждать о паролях, которые легко взломать',
    svIE: 'Импорт и Экспорт', svImpC: 'Импорт паролей', svImpCS: 'Поддержка JSON (со старого приложения)', svImpB: 'Импорт',
    svExpV: 'Резервная копия хранилища', svExpVS: 'Сохранить резервную копию хранилища', svExpB: 'Экспорт',
    svExpC: 'Экспорт в CSV', svExpCS: '⚠ Пароли будут не зашифрованы', svExpCB: 'Export CSV',
    svDan: 'Опасная зона', svDel: 'Удалить все данные', svDelS: 'Безвозвратно стереть все аккаунты и заметки', svDelB: 'Стереть хранилище',
    suTit: 'Обновления', suChk: 'Проверить обновления', suAut: 'Автообновление', suAutS: 'Автоматически устанавливать обновления', suRel: 'Список изменений',
    // Системные уведомления и Empty States
    tSaved: 'Настройки успешно сохранены!', tDiscarded: 'Изменения сброшены', tAccentUpdated: 'Акцентный цвет обновлен',
    tFontUpdated: 'Размер интерфейса обновлен', tDateSaved: 'Формат даты сохранен', tNoAcc: 'Аккаунтов не найдено',
    tNoNotes: 'Заметки не найдено', tCopied: 'Скопировано!', tPassCopied: 'Пароль скопирован!', tEmailCopied: 'Email скопирован!',
    tNoteCopied: 'Заметка скопирована!', tAccAdded: 'Добавлен в хранилище!', tAccUpdated: 'Обновлен!', tAccDeleted: 'Аккаунт удален',
    tNoteDeleted: 'Заметка удалена', tNotePinned: 'Заметка закреплена!', tNoteUnpinned: 'Заметка откреплена',
    tNoNoteSel: "Выберите заметку или создайте новую", tSaving: "Сохранение...", tSavedNote: "Сохранено",
    tFeedbackDisabled: 'Отправка отзывов сейчас отключена', tEraseSuccess: 'Все данные были безвозвратно удалены.',
    tImportSuccess: 'Аккаунты успешно импортированы!', tImportFail: 'Доступных аккаунтов в файле не было найдено.',
    tParseFail: 'Ошибка чтения JSON файла.', tBackupSuccess: 'Резервная копия успешно экспортирована!',
    tCsvSuccess: 'CSV успешно экспортирован!', tEmptyVault: 'Хранилище пустое!', tEnterService: 'Пожалуйста, введите название сервиса',
    tEnterPass: 'Пожалуйста, введите пароль', tEnterUser: 'Пожалуйста, введите имя пользователя или email', tAutoBackup: 'Запуск автоматического резервного копирования...',
    tPassInserted: 'Пароль вставлен!', tStrongGen: 'Надежный пароль сгенерирован!', tAddedPrefix: 'Добавлен ',
    tWarnTit: 'Внимание', tWeakDetect: 'Обнаружен слабый пароль', tExpDetect: 'Пароль не менялся более 90 дней', tNotFnd: 'Не найдено',
    ftueTit1: "Привет! Меня зовут Clyp", ftueSub1: "Я твой новый лучший друг в управлении паролями. Давай всё настроим за пару кликов.",
    ftueTit2: "Выбери язык", ftueTit3: "Настрой под себя", ftueTheme: "Тема", ftueAcc: "Акцентный цвет",
    ftueTit4: "Почти готово!", ftueSub4: "Если ты переходишь со старой программы, можешь импортировать пароли прямо сейчас. Или начать с чистого листа!",
    ftueImp: "Импорт JSON файла", ftueNot: "(Ты всегда сможешь изменить это в настройках)",
    tImporting: "Обработка...", tImportDone: "Успешно!", tImportError: "Ошибка",
    tUpdChecking: "Проверка серверов обновлений...", tUpdLatest: "Обновлений не найдено", tUpdAvailable: "Скачивание обновления...", tUpdPending: "Обновление ожидает загрузки", tUpdReady: "Обновление готово к установке", tUpdError: "Ошибка подключения",
  },
  uk: {
    navGen: 'Генератор', navAdd: 'Додати', navAcc: 'Акаунти', navNot: 'Нотатки', navSet: 'Налаштування',
    tGen: 'Генератор паролів', tAdd: 'Додати у сховище', tAcc: 'Акаунти', tNot: 'Секретні нотатки', tSet: 'Налаштування',
    btnDiscard: 'Скинути', btnSave: 'Зберегти', btnCancel: 'Скасувати', btnAddV: 'Зберегти',
    searchA: 'Пошук акаунтів…', searchN: 'Пошук нотаток…',
    gRand: 'Випадковий', gPass: 'Фраза', gPin: 'ПІН-код',
    gLbl1: 'Згенерований пароль', gLbl2: 'Опції', gLbl3: 'Типи символів', gLbl4: 'Статистика', gLbl5: 'Історія генерації',
    gCopy: 'Копіювати', gRegen: 'Оновити', gStr: 'Надійність', gLen: 'Довжина', gWc: 'Кількість слів', gPlen: 'Довжина ПІН-коду',
    gAmb: 'Без схожих символів', gRep: 'Без повторень', gCap: 'Великі літери', gInc: 'Включаючи цифри',
    gSub1: 'Пропускати 0, O, l, 1, I…', gBtnGen: 'Згенерувати новий', gBtnUse: 'Використати для акаунта',
    gChar: 'Символів', gCrack: 'Злам займе', gCs: 'Алфавіт',
    cSec: 'секунди', cHr: 'години', cYr: 'роки', cCen: 'століття',
    strW: 'Слабкий', strF: 'Середній', strG: 'Надійний', strS: 'Відмінний',
    aLbl1: 'Деталі сервісу', aLbl2: 'Дані для входу', aLbl3: 'Іконка', aLbl4: 'Додатково', aLbl5: 'Попередній перегляд', aLbl6: 'Оцінка безпеки', aLbl7: 'Чек-лист',
    aSn: 'Назва сервісу', aUrl: 'Веб-сайт', aCat: 'Категорія', aUser: 'Ім\'я користувача / Email', aPass: 'Пароль',
    aGenP: 'Згенерувати надійний', a2fa: 'Увімкнути 2FA (TOTP)', a2faSub: 'Додати секретний ключ', aTotpK: 'Секретний ключ TOTP',
    acSort: 'Сортування:', acAll: 'Всі', acBtnAdd: 'Додати акаунт',
    acSort1: 'А–Я', acSort2: 'Я–А', acSort3: 'Нещодавні', acSort4: 'Дата додавання',
    acCEm: 'Скопіювати Email', acCPw: 'Скопіювати пароль', acEdit: 'Змінити', acDel: 'Видалити',
    acL1: 'Дані для входу', acL2: 'Двофакторна автентифікація', acL3: 'Безпека',
    acU: 'Ім\'я', acP: 'Пароль', acW: 'Веб-сайт', acTotp: 'КОД TOTP', acRef: 'Оновиться через',
    aBackup: "Резервні коди", acBkpCodes: "РЕЗЕРВНІ КОДИ", tBackupCopied: "Резервні коди скопійовано!",
    acStr: 'Надійність', acChg: 'Змінено', acAge: 'Вік', acUnique: 'Унікальність', unqYes: 'Унікальний', unqNo: 'Повторів:', ageFresh: 'Свіжий', ageOld: 'Застаріває', ageCrit: 'Старий', dPlural: 'дн.',
    nNew: '+ Нова', nBtn: 'Нова нотатка', nTags: 'Теги:',
    mDelT: 'Видалити акаунт?', mDelS: 'Це назавжди видалить акаунт з вашого сховища. Цю дію неможливо скасувати.', mDelBtn: 'Видалити',
    ssGen: 'Основні', ssVlt: 'Сховище', ssUpd: 'Оновлення',
    sgTit: 'Основні налаштування', sgThm: 'Тема', sgThmS: 'Світла, темна або системна', optSys: 'Системна', optLi: 'Світла', optDa: 'Темна',
    sgAcc: 'Акцентний колір', sgAccS: 'Оберіть основний колір',
    sgFnt: 'Розмір інтерфейсу', sgFntS: 'Змінює масштаб програми', optReg: 'Звичайний', optLg: 'Збільшений', optXl: 'Дуже великий',
    sgLan: 'Мова та Регіон', sgDat: 'Формат дати', sgDatS: 'Варіант відображення дат',
    sgSup: 'Підтримка', sgFeed: 'Надіслати відгук', sgFeedS: 'Допоможіть нам стати краще', sgFeedB: 'Відгук',
    svTit: 'Сховище та Дані', svBkp: 'Резервне копіювання', svBkpS: 'Щотижневе автоматичне створення резервної копії', svExp: 'Термін дії паролів', svExpS: 'Нагадувати про оновлення старих паролів',
    svWk: 'Слабкі паролі', svWkS: 'Попереджати про паролі, які легко зламати',
    svIE: 'Import & Export', svImpC: 'Імпорт паролів', svImpCS: 'Підтримка JSON (зі старої програми)', svImpB: 'Імпорт',
    svExpV: 'Резервна копія сховища', svExpVS: 'Завантажити резервну копію програми', svExpB: 'Експорт',
    svExpC: 'Експорт в CSV', svExpCS: '⚠ Паролі будуть незашифровані', svExpCB: 'Експорт CSV',
    svDan: 'Небезпечна зона', svDel: 'Видалити всі дані', svDelS: 'Назавжди стерти всі акаунти та нотатки', svDelB: 'Стерти сховище',
    suTit: 'Оновлення', suChk: 'Перевірити оновлення', suAut: 'Автооновлення', suAutS: 'Автоматично встановлювати оновлення', suRel: 'Список змін',
    // Системные уведомления и Empty States
    tSaved: 'Налаштування успішно збережено!', tDiscarded: 'Зміни скинуто', tAccentUpdated: 'Акцентний колір оновлено',
    tFontUpdated: 'Розмір інтерфейсу оновлено', tDateSaved: 'Формат дати збережено', tNoAcc: 'Акаунтів не знайдено',
    tNoNotes: 'Нотаток не знайдено', tCopied: 'Скопійовано!', tPassCopied: 'Пароль скопійовано!', tEmailCopied: 'Email скопійовано!',
    tNoteCopied: 'Нотатку скопійовано!', tAccAdded: 'Додано до сховища!', tAccUpdated: 'Оновлено!', tAccDeleted: 'Акаунт видалено',
    tNoteDeleted: 'Нотатку видалено', tNotePinned: 'Нотатку закріплено!', tNoteUnpinned: 'Нотатку відкріплено',
    tNoNoteSel: "Оберіть нотатку або створіть нову", tSaving: "Збереження...", tSavedNote: "Збережено",
    tFeedbackDisabled: 'Надсилання відгуків наразі вимкнено', tEraseSuccess: 'Усі дані були безповоротно видалені.',
    tImportSuccess: 'Акаунти успішно імпортовано!', tImportFail: 'Доступних акаунтів у файлі не знайдено.',
    tParseFail: 'Помилка читання JSON файлу.', tBackupSuccess: 'Резервну копію успішно експортовано!',
    tCsvSuccess: 'CSV успішно експортовано!', tEmptyVault: 'Сховище порожнє!', tEnterService: 'Будь ласка, введіть назву сервісу',
    tEnterPass: 'Будь ласка, введіть пароль', tEnterUser: 'Будь ласка, введіть ім\'я користувача або email', tAutoBackup: 'Запуск автоматического резервного копіювання...',
    tPassInserted: 'Пароль вставлено!', tStrongGen: 'Надійний пароль згенеровано!', tAddedPrefix: 'Додано ',
    tWarnTit: 'Увага', tWeakDetect: 'Виявлено слабкий пароль', tExpDetect: 'Пароль не змінювався понад 90 днів', tNotFnd: 'Не знайдено',
    ftueTit1: "Привіт! Мене звати Clyp", ftueSub1: "Я твій новий найкращий друг у керуванні паролями. Давай усе налаштуємо за кілька кліків.",
    ftueTit2: "Обери мову", ftueTit3: "Налаштуй під себе", ftueTheme: "Тема", ftueAcc: "Акцентний колір",
    ftueTit4: "Майже готово!", ftueSub4: "Якщо ти переходиш зі старої програми, можеш імпортувати паролі прямо зараз. Або почати з чистого аркуша!",
    ftueImp: "Імпорт JSON файлу", ftueNot: "(Ти завжди зможеш змінити це в налаштуваннях)",
    tImporting: "Обробка...", tImportDone: "Успішно!", tImportError: "Помилка",
    tUpdChecking: "Перевірка серверів оновлень...", tUpdLatest: "Оновлень не знайдено", tUpdAvailable: "Завантаження оновлення...", tUpdPending: "Оновлення очікує на завантаження", tUpdReady: "Оновлення готове до встановлення", tUpdError: "Помилка підключення",
  }
};

const PALETTES = {
  blue: { base: '#3B82F6', lt: 'rgba(59,130,246,0.15)', md: '#60A5FA', dk: '#1D4ED8', glow: 'rgba(59,130,246,0.25)' },
  green: { base: '#10B981', lt: 'rgba(16,185,129,0.15)', md: '#34D399', dk: '#047857', glow: 'rgba(16,185,129,0.25)' },
  purple: { base: '#8B5CF6', lt: 'rgba(139,92,246,0.15)', md: '#A78BFA', dk: '#6D28D9', glow: 'rgba(139,92,246,0.25)' },
  pink: { base: '#EC4899', lt: 'rgba(236,72,153,0.15)', md: '#F472B6', dk: '#BE185D', glow: 'rgba(236,72,153,0.25)' },
  orange: { base: '#F59E0B', lt: 'rgba(245,158,11,0.15)', md: '#FCD34D', dk: '#B45309', glow: 'rgba(245,158,11,0.25)' }
};

function fmtDate(dStr) {
  if (!dStr) return '';
  let d = new Date(dStr);
  if (isNaN(d.getTime())) return dStr;
  const DD = String(d.getDate()).padStart(2, '0');
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const YYYY = d.getFullYear();
  if (SETT.date === 'MM/DD/YYYY') return `${MM}/${DD}/${YYYY}`;
  if (SETT.date === 'YYYY-MM-DD') return `${YYYY}-${MM}-${DD}`;
  return `${DD}.${MM}.${YYYY}`;
}

function updateLanguage() {
  const l = DICT[SETT.lang] || DICT.en;

  const tbt = document.querySelectorAll('.tbtitle');
  if(tbt[0]) tbt[0].textContent = l.tGen;
  if(tbt[1]) tbt[1].textContent = editId ? l.acEdit : l.tAdd;
  if(tbt[2]) tbt[2].textContent = l.tAcc;
  if(tbt[3]) tbt[3].textContent = l.tNot;
  if(tbt[4]) tbt[4].textContent = l.tSet;

  const navs = document.querySelectorAll('.sb .ni');
  if(navs[0]) navs[0].dataset.tip = l.navGen;
  if(navs[1]) navs[1].dataset.tip = l.navAdd;
  if(navs[2]) navs[2].dataset.tip = l.navAcc;
  if(navs[3]) navs[3].dataset.tip = l.navNot;
  if(navs[4]) navs[4].dataset.tip = l.navSet;

  const p4s = document.querySelector('#pg4 .btn-s'); if(p4s) p4s.textContent = l.btnDiscard;
  const p4p = document.querySelector('#pg4 .btn-p'); if(p4p) p4p.lastChild.textContent = l.btnSave;
  const p1s = document.querySelector('#pg1 .btn-s[onclick="cancelAdd()"]'); if(p1s) p1s.lastChild.textContent = l.btnCancel;
  const sbt = document.querySelector('#sbtxt'); if(sbt) sbt.textContent = l.btnAddV;

  const sa = document.querySelector('#pg2 .srch input'); if(sa) sa.placeholder = l.searchA;
  const sn = document.querySelector('#pg3 .srch input'); if(sn) sn.placeholder = l.searchN;

  const stabs = document.querySelectorAll('#pg0 .stab');
  if(stabs[0]) stabs[0].textContent = l.gRand; if(stabs[1]) stabs[1].textContent = l.gPass; if(stabs[2]) stabs[2].textContent = l.gPin;
  
  const gSlbl = document.querySelectorAll('#pg0 .slbl');
  if(gSlbl[0]) gSlbl[0].textContent = l.gLbl1; if(gSlbl[1]) gSlbl[1].textContent = l.gLbl2; if(gSlbl[2]) gSlbl[2].textContent = l.gLbl3; if(gSlbl[3]) gSlbl[3].textContent = l.gLbl4; if(gSlbl[4]) gSlbl[4].textContent = l.gLbl5;
  const gl = document.getElementById('len-lbl'); if(gl) gl.textContent = gMode===1 ? l.gWc : (gMode===2 ? l.gPlen : l.gLen);
  const go = document.querySelectorAll('#pg0 .opt-lbl');
  if(go[1]) go[1].textContent = l.gAmb; if(go[2]) go[2].textContent = l.gRep; if(go[3]) go[3].textContent = l.gCap; if(go[4]) go[4].textContent = l.gInc;
  const gs = document.querySelectorAll('#pg0 .opt-sub'); if(gs[0]) gs[0].textContent = l.gSub1;
  const gb = document.querySelectorAll('#pg0 .btn-p, #pg0 .btn-s');
  if(gb[0]) gb[0].lastChild.textContent = l.gBtnGen; if(gb[1]) gb[1].lastChild.textContent = l.gBtnUse;
  const gst = document.querySelectorAll('#pg0 .card:nth-child(1) span:nth-child(2)');
  if(gst[0]) gst[0].textContent = l.gChar; if(gst[1]) gst[1].textContent = l.gCrack; if(gst[2]) gst[2].textContent = l.gCs;

  const asl = document.querySelectorAll('#pg1 .slbl');
  if(asl[0]) asl[0].textContent = l.aLbl1; if(asl[1]) asl[1].textContent = l.aLbl2; if(asl[2]) asl[2].textContent = l.aLbl3; if(asl[3]) asl[3].textContent = l.aLbl4; if(asl[4]) asl[4].textContent = l.aLbl5; if(asl[5]) asl[5].textContent = l.aLbl6; if(asl[6]) asl[6].textContent = l.aLbl7;
  const afl = document.querySelectorAll('#pg1 .fl');
  if(afl[0]) afl[0].textContent = l.aSn; if(afl[1]) afl[1].textContent = l.aUrl; if(afl[2]) afl[2].textContent = l.aCat; if(afl[3]) afl[3].textContent = l.aUser; if(afl[4]) afl[4].textContent = l.aPass; if(afl[5]) afl[5].textContent = l.aTotpK;
  const bkpL = document.getElementById('lbl-backup');
  if (bkpL) bkpL.textContent = l.aBackup;
  const a2 = document.querySelector('#pg1 .opt-lbl'); if(a2) a2.textContent = l.a2fa;
  const a2s = document.querySelector('#pg1 .opt-sub'); if(a2s) a2s.textContent = l.a2faSub;
  const aGb = document.querySelector('#pg1 .btn-s[onclick="fillG()"]'); if(aGb) aGb.lastChild.textContent = l.aGenP;

  const tps = document.querySelector('#pg2 .topbar span'); if(tps) tps.textContent = l.acSort;
  const tpa = document.querySelector('#pg2 .topbar .btn-p'); if(tpa) tpa.lastChild.textContent = l.acBtnAdd;
  const acSortOpts = document.querySelectorAll('#sort-wrap .custom-opt');
  if(acSortOpts[0]) acSortOpts[0].textContent = l.acSort1; if(acSortOpts[1]) acSortOpts[1].textContent = l.acSort2; if(acSortOpts[2]) acSortOpts[2].textContent = l.acSort3; if(acSortOpts[3]) acSortOpts[3].textContent = l.acSort4;
  const svMap = {'az': l.acSort1, 'za': l.acSort2, 'recent': l.acSort3, 'added': l.acSort4};
  const sv = document.querySelector('#sort-val'); if(sv) sv.textContent = svMap[curSort] || l.acSort1;
  const acSlbl = document.querySelectorAll('#pg2 .det-body .slbl');
  if(acSlbl[0]) acSlbl[0].textContent = l.acL1; if(acSlbl[1]) acSlbl[1].textContent = l.acL2; if(acSlbl[2]) acSlbl[2].textContent = l.acL3;
// ИСПРАВЛЕНИЕ: Прямой перевод левых колонок в просмотре аккаунта
  const fkU = document.getElementById('lbl-view-user'); if (fkU) fkU.textContent = l.acU;
  const fkP = document.getElementById('lbl-view-pass'); if (fkP) fkP.textContent = l.acP;
  const fkW = document.getElementById('lbl-view-web'); if (fkW) fkW.textContent = l.acW;
  const fkS = document.getElementById('lbl-view-str'); if (fkS) fkS.textContent = l.acStr;
  const fkA = document.getElementById('lbl-view-age'); if (fkA) fkA.textContent = l.acAge;
  const fkQ = document.getElementById('lbl-view-unq'); if (fkQ) fkQ.textContent = l.acUnique;
  const detb = document.querySelectorAll(".det-hero .btn-s, .det-hero .btn-d");
  if(detb[0]) detb[0].lastChild.textContent = l.acCEm; if(detb[1]) detb[1].lastChild.textContent = l.acCPw; if(detb[2]) detb[2].lastChild.textContent = l.acEdit; if(detb[3]) detb[3].lastChild.textContent = l.acDel;
  // ИСПРАВЛЕНИЕ: Прямой и надежный перевод заголовков 2FA карточки по ID элементов
  const tfaTit = document.getElementById('lbl-tfa-title'); if (tfaTit) tfaTit.textContent = l.acL2;
  const tcod = document.getElementById('lbl-view-totp'); if (tcod) tcod.textContent = l.acTotp;
  const tref = document.getElementById('lbl-view-refreshes'); if (tref) tref.textContent = l.acRef;
  const bkpLView = document.getElementById('lbl-view-backup'); if (bkpLView) bkpLView.textContent = l.acBkpCodes;

  const nb = document.querySelector('#pg3 .btn-p'); if(nb) nb.lastChild.textContent = l.nBtn;
  const nn = document.querySelector('#pg3 .nl-hdr span[onclick]'); if(nn) nn.textContent = l.nNew;
  const nt = document.querySelector('#pg3 .ned-bar span'); if(nt) nt.textContent = l.nTags;
  const slbl = document.getElementById('slbl');
  if (slbl) slbl.textContent = l.tSavedNote;

  const mtit = document.querySelector('.modal-tit'); if(mtit) mtit.textContent = l.mDelT;
  const mdesc = document.querySelector('#del-modal p'); if(mdesc && mdesc.firstChild) mdesc.firstChild.textContent = l.mDelS.split('.')[0] + '. ';
  const mcanc = document.querySelector('#del-modal .btn-s'); if(mcanc) mcanc.textContent = l.btnCancel;
  const mdel = document.querySelector('#del-modal .btn-d'); if(mdel) mdel.lastChild.textContent = l.mDelBtn;

  const snis = document.querySelectorAll('.sett-nav .sni');
  if(snis[0]) snis[0].lastChild.textContent = l.ssGen; 
  if(snis[1]) snis[1].lastChild.textContent = l.ssVlt; 
  if(snis[2]) snis[2].lastChild.textContent = l.ssUpd;

  // ИСПРАВЛЕНИЕ: Мгновенно переводим динамический статус генератора при смене языка
  updStr(curGenEntropy, 'ss1', 'ss2', 'ss3', 'ss4', 'stxt');
  updCrack(curGenEntropy);

  const emptyState = document.querySelector('#ned-empty span');
  if (emptyState) emptyState.textContent = l.tNoNoteSel;

  if(document.getElementById('pg4').classList.contains('on')) rendSett();
}

function applySettingsState(s) {
  applyTheme(s.theme, true);
  setAccentColor(s.color, true);
  setFontSize(s.font, true);
  updateLanguage();
  if (typeof rendA === 'function') rendA(getF());
  if (typeof rendN === 'function') rendN();
  if (selId) selAcc(selId);
}
function setLang(c, el) {
  TEMP_SETT.lang = c;
  document.querySelectorAll('.lang-opt').forEach(o => o.classList.remove('on'));
  if(el) el.classList.add('on');
}
function saveSettings() {
  SETT = { ...TEMP_SETT };
  applySettingsState(SETT);
  toast('tSaved');
  syncData();
}
function discardSettings(silent) {
  TEMP_SETT = { ...SETT };
  applySettingsState(SETT);
  if (document.getElementById('pg4').classList.contains('on')) rendSett();
  if (!silent) toast('tDiscarded');
}
function setAccentColor(key, skipTemp) {
  if (!skipTemp) TEMP_SETT.color = key;
  const p = PALETTES[key];
  const root = document.documentElement;
  root.style.setProperty('--accent', p.base);
  root.style.setProperty('--accent-lt', p.lt);
  root.style.setProperty('--accent-md', p.md);
  root.style.setProperty('--accent-dk', p.dk);
  root.style.setProperty('--accent-glow', p.glow);
  document.querySelectorAll('.color-btn').forEach(b => {
    b.style.boxShadow = b.dataset.c === key ? '0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)' : '0 0 0 2px var(--bg-card), 0 0 0 0 transparent';
  });
}
function applyTheme(v, skipTemp) {
  if (!skipTemp) TEMP_SETT.theme = v;
  const isDark = v === 'dark' || (v === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('ic-sun').style.display = isDark ? 'none' : 'block';
  document.getElementById('ic-moon').style.display = isDark ? 'block' : 'none';
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (SETT.theme === 'system') applyTheme('system', true);
});
function setFontSize(size, skipTemp) {
  if (!skipTemp) TEMP_SETT.font = size;
  // Базовый масштаб = 1 (100%)
  let zoomLevel = 1;
  if (size === 'Large') zoomLevel = 1.1;       // 110%
  if (size === 'Extra Large') zoomLevel = 1.25; // 125%

  // Если мы в Electron, используем идеальный нативный зум
  if (window.electronAPI && window.electronAPI.setZoom) {
    window.electronAPI.setZoom(zoomLevel);
  } else {
    // Резервный вариант для работы просто в браузере
    document.body.style.zoom = zoomLevel; 
  }
}
function setDateFormat(fmt) {
  TEMP_SETT.date = fmt;
}

// ═══════════════════════════════════════
//  VAULT & DATA LOGIC (IMPORT, EXPORT, ERASE)
// ═══════════════════════════════════════
function importData(btn) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    let origHTML = "";
    const l = DICT[SETT.lang] || DICT.en;
    if (btn) {
      origHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;"><svg viewBox="25 25 50 50" style="width:14px;height:14px;margin-right:6px;animation:ring-rotate 2s linear infinite;"><circle stroke="currentColor" stroke-width="5" stroke-linecap="round" cx="50" cy="50" r="20" fill="none" style="stroke-dasharray:1,200;stroke-dashoffset:0;animation:ring-dash 1.5s ease-in-out infinite;"></circle></svg>${l.tImporting}</span>`;
    }

    const reader = new FileReader();
    
    reader.onload = ev => {
      setTimeout(() => {
        if (btn) {
          btn.innerHTML = origHTML;
          btn.disabled = false;
        }

        // Находим встроенный абсолютный контейнер статуса
        const statusEl = btn ? btn.parentElement.querySelector('.import-status') : null;
        if (statusEl) {
          statusEl.style.display = 'flex';
          // Микро-таймаут для запуска CSS-перехода
          setTimeout(() => {
            statusEl.style.opacity = '1';
            statusEl.style.transform = 'translateY(0)';
          }, 10);
        }

        try {
          const data = JSON.parse(ev.target.result);
          let importedCount = 0;
          
          if (Array.isArray(data)) {
            data.forEach(service => {
              if (service.ServiceName && Array.isArray(service.Accounts)) {
                service.Accounts.forEach(acc => {
                  const genUrl = service.ServiceName.toLowerCase().replace(/\s+/g, '') + '.com';
                  ACCS.unshift({
                    id: nid++, icon: '🔑', name: service.ServiceName, email: acc.Login || '',
                    tag: 'General', tc: 'general', url: genUrl, added: new Date().toISOString(),
                    changed: new Date().toISOString(), pass: acc.EncryptedPassword || '', has2fa: false, lastUsed: 0
                  });
                  importedCount++;
                });
              }
            });
          }
          
          if (importedCount > 0) {
            toast('tImportSuccess');
            syncData();
            if (typeof rendA === 'function') rendA(getF());
            if (statusEl) {
              statusEl.style.color = "var(--ok)";
              statusEl.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;margin-right:6px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-chk-tip"/></svg>${l.tImportDone}`;
            }
          } else {
            toast('tImportFail');
            if (statusEl) {
              statusEl.style.color = "var(--er)";
              statusEl.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;margin-right:6px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-win-close"/></svg>${l.tImportError}`;
            }
          }
        } catch(err) {
          toast('tParseFail');
          if (statusEl) {
            statusEl.style.color = "var(--er)";
            statusEl.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;margin-right:6px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-win-close"/></svg>${l.tImportError}`;
          }
        }

        // Плавное растворение и скрытие
        if (statusEl) {
          setTimeout(() => {
            statusEl.style.opacity = "0";
            statusEl.style.transform = "translateY(6px)";
            setTimeout(() => { statusEl.style.display = 'none'; }, 300);
          }, 2500);
        }

      }, 800);
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

function exportVault(isAuto = false) {
  const data = { accounts: ACCS, notes: NOTES, settings: SETT };
  const filename = `clyp-vault-${isAuto ? 'autobackup-' : ''}${new Date().toISOString().split('T')[0]}.json`;
  
  if (window.electronAPI && window.electronAPI.writeBackup) {
    window.electronAPI.writeBackup(filename, data).then(success => {
      if (success) {
        if (!isAuto) toast('tBackupSuccess');
      } else {
        if (!isAuto) toast('tUpdError');
      }
    });
  } else {
    // Резервный метод для работы в обычном браузере
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    if (!isAuto) toast('tBackupSuccess');
  }
}

function exportCSV() {
  if (ACCS.length === 0) { toast('tEmptyVault'); return; }
  let csv = 'Name,URL,Username,Password,Category\n';
  ACCS.forEach(a => {
    const name = `"${a.name.replace(/"/g, '""')}"`;
    const url = `"${a.url.replace(/"/g, '""')}"`;
    const email = `"${a.email.replace(/"/g, '""')}"`;
    const pass = `"${a.pass.replace(/"/g, '""')}"`;
    const tag = `"${a.tag.replace(/"/g, '""')}"`;
    csv += `${name},${url},${email},${pass},${tag}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clyp-passwords-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('tCsvSuccess');
}

let eraseTimer = null;
let eraseCountdown = 10;

function eraseVault() {
  const tSe = {
    en: { tit: 'Erase Vault?', desc: 'Are you ABSOLUTELY sure you want to delete ALL accounts and notes? This action cannot be undone.', cnc: 'Cancel', btn: 'Erase Vault' },
    ru: { tit: 'Стереть хранилище?', desc: 'Вы АБСОЛЮТНО уверены, что хотите удалить ВСЕ аккаунты и заметки? Это действие необратимо.', cnc: 'Отмена', btn: 'Стереть хранилище' },
    uk: { tit: 'Стерти сховище?', desc: 'Ви АБСОЛЮТНО впевнені, що хочете видалити ВСІ акаунти та нотатки? Цю дію неможливо скасувати.', cnc: 'Скасувати', btn: 'Стерти сховище' }
  };
  const lang = SETT.lang || 'en';
  const text = tSe[lang] || tSe.en;

  document.getElementById('erase-title').textContent = text.tit;
  document.getElementById('erase-desc').textContent = text.desc;
  document.getElementById('erase-cancel-btn').textContent = text.cnc;
  
  const btn = document.getElementById('erase-confirm-btn');
  btn.disabled = true;
  eraseCountdown = 10;
  btn.textContent = `${text.btn} (${eraseCountdown}s)`;
  document.getElementById('erase-modal').classList.add('on');
  
  clearInterval(eraseTimer);
  eraseTimer = setInterval(() => {
    eraseCountdown--;
    if (eraseCountdown > 0) {
      btn.textContent = `${text.btn} (${eraseCountdown}s)`;
    } else {
      clearInterval(eraseTimer);
      btn.disabled = false;
      btn.textContent = text.btn;
    }
  }, 1000);
}

function closeEraseM() {
  clearInterval(eraseTimer);
  document.getElementById('erase-modal').classList.remove('on');
}

function confErase() {
  ACCS = []; NOTES = [];
  if (typeof rendA === 'function') rendA(getF());
  if (typeof rendN === 'function') rendN();
  const l = DICT[SETT.lang] || DICT.en;
  
  const alist = document.getElementById("alist"); if (alist) alist.innerHTML = `<div style="padding:24px;text-align:center;color:var(--tx3);font-size:11px;font-weight:600">${l.tNoAcc}</div>`;
  const nlist = document.getElementById("nlist"); if (nlist) nlist.innerHTML = `<div style="padding:24px;text-align:center;color:var(--tx3);font-size:11px;font-weight:600">${l.tNoNotes}</div>`;
  
  clearAccDet();
  document.getElementById("n-tin").value = ""; document.getElementById("n-ta").value = ""; document.getElementById("wc").textContent = "0 words"; 
  selNid = null;
  toggleNoteEditor(false); // Добавили скрытие
  closeEraseM();
  toast('tEraseSuccess');
  syncData();
}

// ═══════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════
function SP(i, btn) {
  if (document.getElementById('pg4').classList.contains('on') && i !== 4) discardSettings(true);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  document.getElementById('pg' + i).classList.add('on');
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('on'));
  if (btn) btn.classList.add('on');
  if (i === 4) rendSett();
}
function goAdd(){ editId=null; clrAddForm(); SP(1,document.querySelectorAll('.ni')[1]); }
function cancelAdd() { clrAddForm(); editId = null; SP(2, document.querySelectorAll(".ni")[2]); }
function editA() {
  const a = ACCS.find((x) => x.id === selId);
  if (!a) return;
  editId = a.id;
  updateLanguage();
  document.getElementById("a-name").value = a.name;
  document.getElementById("a-url").value = "https://" + a.url;
  document.getElementById("a-email").value = a.email;
  document.getElementById("a-pass").value = a.pass;
  document.getElementById("a-cat").value = a.tag;
  document.getElementById("prev-ic").textContent = a.icon;
  selIcon = a.icon;
  
  // Восстанавливаем состояние поля 2FA:
  const tfaSw = document.getElementById("tfa-sw");
  if (a.has2fa) {
    tfaSw.classList.add("on");
    document.getElementById("tfa-fld").style.display = "";
    document.getElementById("a-totp").value = a.totpKey || "";
    document.getElementById("a-backup").value = a.backupCodes || "";
  } else {
    tfaSw.classList.remove("on");
    document.getElementById("tfa-fld").style.display = "none";
    document.getElementById("a-totp").value = "";
  }
  chkPS(a.pass); updPrev(); SP(1, document.querySelectorAll(".ni")[1]);
  document.getElementById("cat-val").textContent = a.tag || "Choose…";
  const copts = document.getElementById("cat-wrap")?.querySelectorAll(".custom-opt");
  if (copts) {
    copts.forEach((o) => o.classList.remove("on"));
    const target = Array.from(copts).find((o) => o.textContent === (a.tag || "Choose…"));
    if (target) target.classList.add("on");
  }
}
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  SETT.theme = newTheme; TEMP_SETT.theme = newTheme; applyTheme(newTheme, true);
  const tv = document.getElementById('theme-val');
  if (tv) {
    const l = DICT[SETT.lang] || DICT.en;
    tv.textContent = newTheme === 'light' ? l.optLi : l.optDa;
    document.querySelectorAll('#theme-wrap .custom-opt').forEach(o => o.classList.remove('on'));
    const opt = Array.from(document.querySelectorAll('#theme-wrap .custom-opt')).find(o => o.textContent.toLowerCase() === (newTheme === 'light' ? l.optLi.toLowerCase() : l.optDa.toLowerCase()));
    if(opt) opt.classList.add('on');
  }
  syncData();
}

// ═══════════════════════════════════════
//  GENERATOR
// ═══════════════════════════════════════
const CH={U:'ABCDEFGHJKLMNPQRSTUVWXYZ',L:'abcdefghjkmnpqrstuvwxyz',D:'23456789',S:'!@#$%^&*-_=+?',E:'{}[]<>|~`'};
const WDS=['correct','horse','battery','staple','ocean','river','mountain','falcon','silver','cloud','thunder','ember','stone','sage','bloom','haven','swift','brave','quiet','noble','frost','amber','cedar','maple','onyx','pearl','ruby','coral','lunar','solar','crystal','forge','shadow','echo','vivid','nimble'];
function genP(){
  if (gMode === 1) {
    genPhr();
    return;
  }
  if (gMode === 2) {
    genPIN();
    return;
  }
  const len = parseInt(document.getElementById("lslider").value);
  const chips = document.querySelectorAll("#copt .cchip.on");
  let cs = "";
  chips.forEach((c) => {
    const t = c.textContent;
    if (t === "ABC") cs += CH.U;
    if (t === "abc") cs += CH.L;
    if (t === "123") cs += CH.D;
    if (t === "!@#") cs += CH.S;
    if (t === "{}[]") cs += CH.E;
  });
  if (!cs) cs = CH.L + CH.D;
  let p = "";
  for (let i = 0; i < len; i++) p += cs[Math.floor(Math.random() * cs.length)];
  document.getElementById("pout").textContent = p;
  document.getElementById("stchars").textContent = len;
  document.getElementById("stcs").textContent = cs.length;
  const ent = Math.round(len * Math.log2(cs.length));
  curGenEntropy = ent;
  document.getElementById("entv").textContent = ent;
  updRing(ent);
  updStr(ent, "ss1", "ss2", "ss3", "ss4", "stxt");
  updCrack(ent);
  addH(p);
}
function genPhr() {
  const cnt = parseInt(document.getElementById("lslider").value); 
  
  // Получаем состояние переключателей напрямую из DOM
  const poptSwitches = document.querySelectorAll('#popt .sw');
  const doCap = poptSwitches[0] ? poptSwitches[0].classList.contains('on') : false;
  const doNum = poptSwitches[1] ? poptSwitches[1].classList.contains('on') : false;

  const ws = [];
  for (let i = 0; i < cnt; i++) {
    let word = WDS[Math.floor(Math.random() * WDS.length)];
    // Если включены заглавные буквы
    if (doCap) word = word.charAt(0).toUpperCase() + word.slice(1);
    // Если включены цифры (добавляем случайную цифру в конец слова)
    if (doNum) word += Math.floor(Math.random() * 10);
    ws.push(word);
  }
  
  const p = ws.join("·");
  document.getElementById("pout").textContent = p;
  document.getElementById("phrase-wrap").style.display = "block";
  document.getElementById("phrase-out").innerHTML = ws
    .map((w, i) => `<span class="pw">${w}</span>${i < ws.length - 1 ? '<span style="font-size:14px;color:var(--tx3);display:flex;align-items:center">·</span>' : ""}`)
    .join("");
    
  // Немного увеличиваем энтропию, если включены усложнения
  const entBonus = (doCap ? 1 : 0) + (doNum ? 3.32 : 0);
  const ent = Math.round(cnt * (Math.log2(WDS.length) + entBonus));
  curGenEntropy = ent;
  
  document.getElementById("entv").textContent = ent;
  updRing(ent);
  updStr(ent, "ss1", "ss2", "ss3", "ss4", "stxt");
  addH(p);
}

function genPIN() {
  const len = parseInt(document.getElementById("lslider").value); // И исправлено тут
  let p = "";
  for (let i = 0; i < len; i++) p += Math.floor(Math.random() * 10);
  document.getElementById("pout").textContent = p;
  document.getElementById("phrase-wrap").style.display = "none";
  const ent = Math.round(len * Math.log2(10));
  document.getElementById("entv").textContent = ent;
  curGenEntropy = ent;
  updRing(ent);
  updStr(ent, "ss1", "ss2", "ss3", "ss4", "stxt");
  addH(p);
}
function updRing(e) {
  const el = document.getElementById("ering");
  if (el) el.setAttribute("stroke-dashoffset", Math.round(170 * (1 - Math.min(e / 128, 1))));
}
function updCrack(e) {
  const el = document.getElementById("stcrack");
  if (!el) return;
  const l = DICT[SETT.lang] || DICT.en;
  if (e < 30) el.textContent = l.cSec;
  else if (e < 50) el.textContent = l.cHr;
  else if (e < 70) el.textContent = l.cYr;
  else el.textContent = l.cCen;
}
function updStr(e,s1,s2,s3,s4,lid){
  const l = DICT[SETT.lang] || DICT.en;
  let lv,cl,tx;if(e<30){lv=1;cl='var(--ts)';tx=l.strW;}else if(e<60){lv=2;cl='var(--tf)';tx=l.strF;}else if(e<90){lv=3;cl='var(--tg)';tx=l.strG;}else{lv=4;cl='var(--tb)';tx=l.strS;}
  const cs=['w','f','g','s'];[[s1,1],[s2,2],[s3,3],[s4,4]].forEach(([id,n])=>{const el=document.getElementById(id);if(!el)return;el.className='strseg';if(n<=lv)el.classList.add(cs[lv-1]);});
  if(lid){const le=document.getElementById(lid);if(le){le.textContent=tx;le.style.color=cl;}}
}
function setGT(i,btn){
  gMode=i;
  document.querySelectorAll('.stab').forEach(t=>t.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('copt').style.display=i===0?'':'none';
  document.getElementById('popt').style.display=i===1?'':'none';
  document.getElementById('pinopt').style.display=i===2?'':'none';
  document.getElementById('phrase-wrap').style.display='none';
  const sl = document.getElementById('lslider');
  if (i === 0) { sl.min = 8; sl.max = 64; sl.value = 16; }
  if (i === 1) { sl.min = 3; sl.max = 8; sl.value = 4; }
  if (i === 2) { sl.min = 4; sl.max = 12; sl.value = 6; }
  document.getElementById('lval').textContent = sl.value;
  updSlBg(sl);
  updateLanguage();
}
function onLen(el) { document.getElementById("lval").textContent = el.value; updSlBg(el); }
function updSlBg(el) { const p = ((el.value - el.min) / (el.max - el.min)) * 100; el.style.background = `linear-gradient(to right,var(--accent) 0%,var(--accent) ${p}%,var(--brm) ${p}%)`; }
function toggleCC(el) { el.classList.toggle("on"); }
function copyP() { cpF(document.getElementById("pout").textContent, "tPassCopied"); }
function useInVault() {
  const p = document.getElementById("pout").textContent;
  goAdd();
  setTimeout(() => {
    const i = document.getElementById("a-pass"); i.value = p; i.type = "text";
    setTimeout(() => (i.type = "password"), 2200); chkPS(p); toast("tPassInserted");
  }, 80);
}
function addH(p) {
  const l = document.getElementById("hlist");
  if (!l) return;
  const el = document.createElement("div");
  el.className = "hist";
  el.innerHTML = `<svg style="width:14px;height:14px;stroke:var(--tx3);fill:none;stroke-width:2;stroke-linecap:round" viewBox="0 0 24 24"><use href="#ic-password"/></svg><div class="hist-p">${p.substring(0, 22)}${p.length > 22 ? "…" : ""}</div><button class="ibtn" style="width:22px;height:22px" onclick="cpF('${p.replace(/'/g, "\\'")}','tCopied')"><svg viewBox="0 0 24 24"><use href="#ic-copy"/></svg></button>`;
  l.insertBefore(el, l.firstChild);
  if (l.children.length > 8) l.removeChild(l.lastChild);
}

// ═══════════════════════════════════════
//  ADD ACCOUNT
// ═══════════════════════════════════════
function selIco(el, ic) { document.querySelectorAll(".iopt").forEach((o) => o.classList.remove("on")); el.classList.add("on"); selIcon = ic; document.getElementById("prev-ic").textContent = ic; }
function togTag(el) { const a = el.dataset.a === "1"; el.dataset.a = a ? "0" : "1"; el.style.borderColor = a ? "transparent" : el.style.color; }
function updPrev(){
  const nm = document.getElementById("a-name").value || "Service Name";
  const em = document.getElementById("a-email").value || "your@email.com";
  const ct = document.getElementById("a-cat").value;
  document.getElementById("prev-name").textContent = nm;
  document.getElementById("prev-em").textContent = em;
  const tEl = document.getElementById("prev-tag");
  if (ct) {
    tEl.style.display = "inline-block";
    tEl.textContent = ct;
    const tc = ct.toLowerCase();
    tEl.style.background = `var(--tag-${tc}-bg)`;
    tEl.style.color = `var(--tag-${tc})`;
  } else tEl.style.display = "none";
  let sc = 10;
  if (document.getElementById('a-name').value) { sc += 20; setTip('tip-name', 'ok', 'ic-chk-tip', 'Service name provided'); } else setTip('tip-name', 'wn', 'ic-warn-tip', 'Add service name');
  if (document.getElementById('a-email').value) { sc += 20; setTip('tip-em', 'ok', 'ic-chk-tip', 'Username added'); } else setTip('tip-em', 'wn', 'ic-warn-tip', 'Add username or email');
  
  // Рассчитываем реальную сложность пароля для честного Security Score
  const pw = document.getElementById('a-pass').value;
  let pCpx = 0; if (pw.length >= 8) pCpx++; if (pw.length >= 12) pCpx++; if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) pCpx++; if (/[0-9]/.test(pw)) pCpx++; if (/[^A-Za-z0-9]/.test(pw)) pCpx++;
  const lv = pCpx < 2 ? 1 : pCpx < 3 ? 2 : pCpx < 5 ? 3 : 4;

  if (lv === 4) { sc += 35; setTip('tip-pass', 'ok', 'ic-chk-tip', 'Strong password set'); }
  else if (lv === 3) { sc += 25; setTip('tip-pass', 'ok', 'ic-chk-tip', 'Good password set'); }
  else if (lv === 2) { sc += 16; setTip('tip-pass', 'wn', 'ic-warn-tip', 'Password could be stronger'); }
  else if (pw.length > 0) { sc += 6; setTip('tip-pass', 'wn', 'ic-warn-tip', 'Password is too short'); }
  else { setTip('tip-pass', 'wn', 'ic-warn-tip', 'Password not set'); }

  if (document.getElementById('tfa-sw').classList.contains('on')) { sc += 15; setTip('tip-2fa', 'ok', 'ic-chk-tip', '2FA enabled'); } else setTip('tip-2fa', 'er', 'ic-circle-tip', 'Consider enabling 2FA');
  sc = Math.min(sc, 100);
  document.getElementById("sc-num").textContent = sc;
  document.getElementById("sc-fill").style.width = sc + "%";

  const l = DICT[SETT.lang] || DICT.en;
  const [scol, slbl] =
    sc >= 85
      ? ["var(--tb)", l.strS]
      : sc >= 65
        ? ["var(--tg)", l.strG]
        : sc >= 40
          ? ["var(--tf)", l.strF]
          : ["var(--ts)", l.strW];
  document.getElementById("sc-num").style.color = scol;
  document.getElementById("sc-fill").style.background = scol;
  document.getElementById("sc-lbl").textContent = slbl;
}
function setTip(id, ty, ic, tx) {
  const el = document.getElementById(id); if (!el) return;
  el.className = "tip " + ty;
  el.innerHTML = `<svg viewBox="0 0 24 24" style="width:14px;height:14px;flex-shrink:0;margin-top:1px;"><use href="#${ic}"/></svg><span>${tx}</span>`;
}
function chkPS(v) {
  let s = 0; if (v.length >= 8) s++; if (v.length >= 12) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/[0-9]/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
  const lv = s < 2 ? 1 : s < 3 ? 2 : s < 5 ? 3 : 4;
  const cs = ["w", "f", "g", "s"];
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById("as" + i); if (!el) return;
    el.className = "strseg"; if (i <= lv) el.classList.add(cs[lv - 1]);
  }
  updPrev();
}
function fillG() {
  let p = ""; const all = CH.U + CH.L + CH.D + CH.S;
  for (let i = 0; i < 18; i++) p += all[Math.floor(Math.random() * all.length)];
  const inp = document.getElementById("a-pass"); inp.type = "text"; inp.value = p;
  setTimeout(() => (inp.type = "password"), 2200); chkPS(p); toast("tStrongGen");
}
function tog2FA(btn) { btn.classList.toggle("on"); document.getElementById("tfa-fld").style.display = btn.classList.contains("on") ? "" : "none"; updPrev(); }
function togPV(id) { const i = document.getElementById(id); i.type = i.type === "password" ? "text" : "password"; }
function saveAcc(){
  const today = new Date().toISOString();
  const nm = document.getElementById("a-name").value.trim();
  const em = document.getElementById("a-email").value.trim();
  const pw = document.getElementById("a-pass").value;
  const url = document.getElementById("a-url").value.replace(/https?:\/\//, "");
  const ct = document.getElementById("a-cat").value || "General";
  
  // Добавили чтение и очистку ключа:
  const h2 = document.getElementById("tfa-sw").classList.contains("on");
  const totpK = document.getElementById("a-totp").value.replace(/\s+/g, '').toUpperCase(); 
  const bkpCodes = document.getElementById("a-backup").value.trim();

  if (!nm) { toast("tEnterService"); return; }
  if (!em) { toast("tEnterUser"); return; }
  if (!pw) { toast("tEnterPass"); return; }
  if (editId) {
    const idx = ACCS.findIndex((x) => x.id === editId);
    if (idx !== -1) {
      ACCS[idx] = { ...ACCS[idx], name: nm, email: em, pass: pw, url: url || ACCS[idx].url, tag: ct, tc: ct.toLowerCase(), has2fa: h2, totpKey: totpK, backupCodes: bkpCodes, icon: selIcon, changed: today };
      toast("tAccUpdated"); selId = editId;
    }
  } else {
    const na = { id: nid++, icon: selIcon, name: nm, email: em, tag: ct, tc: ct.toLowerCase(), url: url || "vault.local", added: today, changed: today, pass: pw, has2fa: h2, totpKey: totpK, backupCodes: bkpCodes};
    ACCS.unshift(na); selId = na.id; toast("tStrongGen");
  }
  editId = null; clrAddForm(); rendA(getF()); selAcc(selId); SP(2, document.querySelectorAll(".ni")[2]);
  syncData();
}
function clrAddForm(){
  ["a-name", "a-url", "a-email", "a-notes", "a-totp", "a-backup"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const ap = document.getElementById("a-pass");
  if (ap) ap.value = "";
  const ct = document.getElementById("a-cat");
  if (ct) ct.value = "";
  selIcon = "🔑";
  document.getElementById("prev-ic").textContent = "🔑";
  document.getElementById("prev-name").textContent = "Service Name";
  document.getElementById("prev-em").textContent = "your@email.com";
  document.getElementById("prev-tag").style.display = "none";
  document.querySelectorAll(".iopt").forEach((o) => o.classList.remove("on"));
  document.querySelector(".iopt").classList.add("on");
  ["as1", "as2", "as3", "as4"].forEach((id) => {
    const e = document.getElementById(id);
    if (e) e.className = "strseg";
  });
  const tw = document.getElementById("tfa-sw");
  if (tw) {
    tw.classList.remove("on");
    document.getElementById("tfa-fld").style.display = "none";
  }
  updPrev();
  const cval = document.getElementById("cat-val");
  if (cval) cval.textContent = "Choose…";
  const copts = document
    .getElementById("cat-wrap")
    ?.querySelectorAll(".custom-opt");
  if (copts) {
    copts.forEach((o) => o.classList.remove("on"));
    copts[0].classList.add("on");
  }
  updateLanguage();
}
function toggleCatMenu(e) { document.getElementById('cat-wrap').classList.toggle('open'); e.stopPropagation(); }
function setCat(val, txt, el) {
  if(event) event.stopPropagation(); 
  document.getElementById('cat-val').textContent = txt; 
  document.getElementById('a-cat').value = val;
  const opts = document.getElementById('cat-wrap').querySelectorAll('.custom-opt');
  opts.forEach(o => o.classList.remove('on')); el.classList.add('on'); 
  document.getElementById('cat-wrap').classList.remove('open'); updPrev(); 
}
function toggleCustomMenu(id, e) { const wrap = document.getElementById(id); if (wrap) wrap.classList.toggle('open'); if (e) e.stopPropagation(); }
function updateCustomSel(wrapId, txt, el) {
  if (event) event.stopPropagation();
  const wrap = document.getElementById(wrapId); if (!wrap) return;
  wrap.querySelector('.custom-sel-val').textContent = txt;
  wrap.querySelectorAll('.custom-opt').forEach(o => o.classList.remove('on'));
  el.classList.add('on'); wrap.classList.remove('open');
}

// ═══════════════════════════════════════
//  ACCOUNTS
// ═══════════════════════════════════════
function rendA(items){
  const l=document.getElementById('alist'); const c=document.getElementById('a-count'); if(c) c.textContent=`(${ACCS.length})`;
  const cl = DICT[SETT.lang] || DICT.en;
  l.innerHTML=items.length===0?`<div style="padding:24px;text-align:center;color:var(--tx3);font-size:11px;font-weight:600">${cl.tNoAcc}</div>`:items.map(a=>`<div class="ai${a.id===selId?' on':''}" onclick="selAcc(${a.id})"><div class="aico">${a.icon}</div><div style="flex:1;min-width:0"><div class="an">${a.name}</div><div class="ae">${a.email}</div></div><div class="atag" style="background:var(--tag-${a.tc}-bg);color:var(--tag-${a.tc})">${a.tag}</div></div>`).join('');
}
function selAcc(id) {
  selId = id; passVis = false;
  const a = ACCS.find((x) => x.id === id); if (!a) return;
  rendA(getF());
  
  const hero = document.querySelector('.det-hero');
  const body = document.querySelector('.det-body');
  if (hero) hero.style.display = 'flex';
  if (body) body.style.display = 'flex';

  document.getElementById("dico").textContent = a.icon;
  document.getElementById("dname").textContent = a.name;
  document.getElementById("durl").textContent = a.url;
  document.getElementById("dem").textContent = a.email;
  document.getElementById("dsite").textContent = a.url;
  document.getElementById("dbdg").textContent = a.tag;
  document.getElementById("dbdg").style.background = `var(--tag-${a.tc}-bg)`;
  document.getElementById("dbdg").style.color = `var(--tag-${a.tc})`;
  document.getElementById("dbdg").style.display = "inline-block";
  document.getElementById("dpass").textContent = "••••••••••••";
  const copyTotpBtn = document.querySelector('.totp-w .ibtn');
  if (copyTotpBtn) copyTotpBtn.onclick = () => copyTOTP();

  const l = DICT[SETT.lang] || DICT.en;
  document.getElementById("dadd").textContent = l.tAddedPrefix + fmtDate(a.added);

  let s = 0; const v = a.pass;
  if(v.length>=8) s++; if(v.length>=12) s++; if(/[A-Z]/.test(v)&&/[a-z]/.test(v)) s++; if(/[0-9]/.test(v)) s++; if(/[^A-Za-z0-9]/.test(v)) s++;
  const lv = s<2 ? 1 : s<3 ? 2 : s<5 ? 3 : 4;
  
  const txts = [l.strW, l.strF, l.strG, l.strS];
  const cs = ['w','f','g','s'];
  const clrs = ['var(--ts)','var(--tf)','var(--tg)','var(--tb)'];
  
  for(let i=1; i<=4; i++){
    const el = document.getElementById('ds'+i); el.className = 'strseg'; if(i<=lv) el.classList.add(cs[lv-1]);
  }
  const slbl = document.getElementById('d-str-lbl'); slbl.textContent = txts[lv-1]; slbl.style.color = clrs[lv-1];

  // 1. Расчет возраста пароля
  const changedTime = new Date(a.changed || a.added).getTime();
  const daysOld = Math.floor((Date.now() - changedTime) / (1000 * 3600 * 24));
  const dAge = document.getElementById('d-age');
  
  if (daysOld < 90) {
      dAge.style.color = 'var(--ok)';
      dAge.innerHTML = `<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-chk-tip"/></svg>${daysOld} ${l.dPlural} (${l.ageFresh})`;
  } else if (daysOld < 180) {
      dAge.style.color = 'var(--wn)';
      dAge.innerHTML = `<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-warn-tip"/></svg>${daysOld} ${l.dPlural} (${l.ageOld})`;
  } else {
      dAge.style.color = 'var(--er)';
      dAge.innerHTML = `<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-circle-tip"/></svg>${daysOld} ${l.dPlural} (${l.ageCrit})`;
  }

  // 2. Расчет уникальности (работает за доли миллисекунды)
  const samePassCount = ACCS.filter(x => x.pass === a.pass).length;
  const dUnq = document.getElementById('d-unq');
  
  if (samePassCount === 1) {
      dUnq.style.color = 'var(--ok)';
      dUnq.innerHTML = `<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-chk-tip"/></svg>${l.unqYes}`;
  } else {
      const reusedCount = samePassCount - 1;
      dUnq.style.color = 'var(--er)';
      dUnq.innerHTML = `<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-win-close"/></svg>${l.unqNo} ${reusedCount}`;
  }

  // === ПРЕДУПРЕЖДЕНИЯ (WARNINGS) ===
  const fcard = document.getElementById('d-age').closest('.fcard');
  let warnRow = document.getElementById('sec-warn-row');
  if (warnRow) warnRow.remove();

  let warnings = [];
  if (SETT.weakWarn && lv < 3) {
    warnings.push(`<div style="display:flex;align-items:center;gap:6px;color:var(--wn);"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><use href="#ic-warn-tip"/></svg> ${l.tWeakDetect}</div>`);
  }
  if (SETT.passExpiry) {
    const daysOld = Math.floor((Date.now() - new Date(a.changed || a.added).getTime()) / (1000 * 3600 * 24));
    if (daysOld >= 90) {
      warnings.push(`<div style="display:flex;align-items:center;gap:6px;color:var(--er);"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><use href="#ic-circle-tip"/></svg> ${l.tExpDetect}</div>`);
    }
  }
  if (warnings.length > 0) {
    const row = document.createElement('div'); row.className = 'fr'; row.id = 'sec-warn-row';
    row.innerHTML = `<div class="fk" style="color:var(--er)">${l.tWarnTit}</div><div class="fv" style="display:flex;flex-direction:column;gap:8px;font-weight:700;">${warnings.join('')}</div>`;
    fcard.appendChild(row);
  }
  updateTOTPUI();
  // Настройка новой единой карточки двухфакторной аутентификации
  backupVis = false; // Сбрасываем флаг глазка при переключении
  const totpWrap = document.getElementById('totp-wrap');
  const bRow = document.getElementById('dbackup-row');
  const dBackupTxt = document.getElementById('d-backup-txt');

  if (a.has2fa) {
      totpWrap.style.display = 'flex';
      // Если есть резервные коды — показываем вторую строчку внутри карточки
      if (a.backupCodes) {
          bRow.style.display = 'flex';
          dBackupTxt.textContent = "••••••••••••";
      } else {
          bRow.style.display = 'none';
      }
  } else {
      totpWrap.style.display = 'none';
  }
}
function getF(src) { const s = src || ACCS; return fMode === "all" ? s : s.filter((a) => a.tc === fMode); }
function setF(f, btn) { fMode = f; document.querySelectorAll(".fchip").forEach((c) => c.classList.remove("on")); btn.classList.add("on"); rendA(getF()); }
function filterA(q) { rendA(getF(ACCS.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()) || a.email.includes(q.toLowerCase())))); }
function sortA(m){
  curSort = m;
  if(m==='az')ACCS.sort((a,b)=>a.name.localeCompare(b.name));
  else if(m==='za')ACCS.sort((a,b)=>b.name.localeCompare(a.name));
  else if(m==='added')ACCS.sort((a,b)=>b.id-a.id);
  else if(m==='recent') ACCS.sort((a,b)=>(b.lastUsed || 0)-(a.lastUsed || 0));
  rendA(getF());
}
function togDP() { passVis = !passVis; const a = ACCS.find((x) => x.id === selId); document.getElementById("dpass").textContent = passVis ? a.pass : "••••••••••••"; }
function cpDE() { const a = ACCS.find((x) => x.id === selId); if (a) cpF(a.email, "tEmailCopied"); markUsed(); }
function cpDP() { const a = ACCS.find((x) => x.id === selId); if (a) cpF(a.pass, "tPassCopied"); markUsed(); }
function delA() { const a = ACCS.find((x) => x.id === selId); if (!a) return; document.getElementById("del-name").textContent = a.name; document.getElementById("del-modal").classList.add("on"); }
function confDel() {
  ACCS = ACCS.filter((x) => x.id !== selId); closeM();
  const l = DICT[SETT.lang] || DICT.en;
  if (ACCS.length > 0) { 
    selId = ACCS[0].id; rendA(getF()); selAcc(selId); 
  } else { 
    document.getElementById("alist").innerHTML = `<div style="padding:24px;text-align:center;color:var(--tx3);font-size:11px;font-weight:600">${l.tNoAcc}</div>`; 
    clearAccDet(); 
    const c = document.getElementById('a-count'); if (c) c.textContent = `(${ACCS.length})`;
  }
  toast("tAccDeleted");
  syncData();
}
function closeM() { document.getElementById("del-modal").classList.remove("on"); }

function clearAccDet() {
  selId = null;
  const hero = document.querySelector('.det-hero');
  const body = document.querySelector('.det-body');
  if (hero) hero.style.display = 'none';
  if (body) body.style.display = 'none';
}

function setSort(m, txt, el) {
  if (event) event.stopPropagation(); 
  document.getElementById('sort-val').textContent = txt; 
  document.querySelectorAll('.custom-opt').forEach(o => o.classList.remove('on'));
  el.classList.add('on'); 
  document.getElementById('sort-wrap').classList.remove('open'); 
  sortA(m);
}
function toggleSortMenu(e) { const wrap = document.getElementById('sort-wrap'); wrap.classList.toggle('open'); e.stopPropagation(); }
document.addEventListener('click', (e) => {
  document.querySelectorAll('.custom-sel-wrap.open').forEach(wrap => { if (!wrap.contains(e.target)) wrap.classList.remove('open'); });
});
function markUsed() {
  const a = ACCS.find(x => x.id === selId); if (a) { a.lastUsed = Date.now(); if (curSort === 'recent') sortA('recent'); }
  syncData();
}

// ═══════════════════════════════════════
//  NOTES
// ═══════════════════════════════════════
function rendN(src){
  const l=document.getElementById('nlist'); const c=document.getElementById('n-count'); if(c) c.textContent=`(${NOTES.length})`;
  const items=src||NOTES; const pinned=items.filter(n=>n.pinned); const rest=items.filter(n=>!n.pinned); const ord=[...pinned,...rest];
  const cl = DICT[SETT.lang] || DICT.en;
  l.innerHTML=ord.length===0?`<div style="padding:24px;text-align:center;color:var(--tx3);font-size:11px;font-weight:600">${cl.tNoNotes}</div>`:ord.map(n=>`<div class="ni2${n.id===selNid?' on':''}" onclick="selN(${n.id})"><div style="display:flex;align-items:center;gap:5px"><div class="ntit">${n.title||'Untitled'}</div>${n.pinned?'<span style="font-size:11px">📌</span>':''}</div><div class="nprev">${n.body.replace(/\n/g,' ').substring(0,50)}…</div><div class="nmeta"><div class="ndate">${fmtDate(n.date)}</div>${n.tags.map(t=>`<span class="ntag">${t}</span>`).join('')}</div></div>`).join('');
}
// Управление видимостью редактора заметок
function toggleNoteEditor(show) {
  const hdr = document.querySelector('.ned-hdr');
  const body = document.querySelector('.ned-body');
  const bar = document.querySelector('.ned-bar');
  let empty = document.getElementById('ned-empty');

  if (!empty) {
    empty = document.createElement('div');
    empty.id = 'ned-empty';
    empty.style.cssText = 'display:flex; flex:1; align-items:center; justify-content:center; flex-direction:column; gap:12px; color:var(--tx3); font-size:13px; font-weight:600;';
    const l = DICT[SETT.lang] || DICT.en;
    empty.innerHTML = `<svg viewBox="0 0 24 24" style="width:32px;height:32px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;opacity:0.5"><use href="#ic-notes"/></svg><span>${l.tNoNoteSel}</span>`;
    document.querySelector('.ned').appendChild(empty);
  }

  if (show) {
    if(hdr) hdr.style.display = 'flex';
    if(body) body.style.display = 'flex';
    if(bar) bar.style.display = 'flex';
    if(empty) empty.style.display = 'none';
  } else {
    if(hdr) hdr.style.display = 'none';
    if(body) body.style.display = 'none';
    if(bar) bar.style.display = 'none';
    if(empty) empty.style.display = 'flex';
  }
}

// Управление статусом "Сохранение..." / "Сохранено"
let saveStatusT = null;
function setSaveStatus(state) {
  const lbl = document.getElementById('slbl');
  if(!lbl) return;
  const l = DICT[SETT.lang] || DICT.en;
  clearTimeout(saveStatusT);

  if (state === 'saving') {
    lbl.textContent = l.tSaving;
    lbl.style.color = 'var(--tx3)'; // Серый цвет процесса
  } else if (state === 'saved') {
    lbl.textContent = l.tSavedNote;
    lbl.style.color = 'var(--ok)'; // Зеленая вспышка успеха
    
    // Через 2 секунды плавно возвращаем в базовый серый цвет
    saveStatusT = setTimeout(() => { 
      lbl.style.color = 'var(--tx3)'; 
    }, 2000);
  } else if (state === 'idle') {
    // Базовое состояние при открытии заметки
    lbl.textContent = l.tSavedNote;
    lbl.style.color = 'var(--tx3)';
  }
}

function selN(id) {
  selNid = id; const n = NOTES.find((x) => x.id === id); if (!n) return;
  toggleNoteEditor(true); setSaveStatus('idle'); // Показываем редактор и прячем статус
  rendN(); document.getElementById("n-tin").value = n.title; document.getElementById("n-ta").value = n.body; updWC(n.body);
  document.getElementById("pin-btn").style.color = n.pinned ? "var(--accent)" : "";
  document.querySelectorAll(".ntchip").forEach((c) => c.classList.toggle("on", n.tags.includes(c.textContent)));
}
function newN() {
  const n = { id: nnid++, title: "", body: "", date: new Date().toISOString(), tags: [], pinned: false };
  NOTES.unshift(n); selNid = n.id; 
  toggleNoteEditor(true); setSaveStatus('idle');
  rendN();
  document.getElementById("n-tin").value = ""; document.getElementById("n-ta").value = ""; document.getElementById("n-tin").focus();
  document.querySelectorAll(".ntchip").forEach((c) => c.classList.remove("on"));
  syncData();
}
function delN() {
  NOTES = NOTES.filter((x) => x.id !== selNid);
  if (NOTES.length > 0) {
    selN(NOTES[0].id); 
  } else { 
    document.getElementById("n-tin").value = ""; document.getElementById("n-ta").value = ""; document.getElementById("wc").textContent = "0 words"; 
    rendN(); selNid = null;
    toggleNoteEditor(false); // Прячем редактор, так как заметок 0
  }
  toast("tNoteDeleted");
  syncData();
}
function onNT(v) { const n = NOTES.find((x) => x.id === selNid); if (n) { n.title = v; setSaveStatus('saving'); schedSave(); } }
function onNC(v) { const n = NOTES.find((x) => x.id === selNid); if (n) { n.body = v; setSaveStatus('saving'); schedSave(); updWC(v); } }
function togNT(el) {
  el.classList.toggle("on"); const n = NOTES.find((x) => x.id === selNid); if (!n) return; const t = el.textContent;
  if (el.classList.contains("on") && !n.tags.includes(t)) n.tags.push(t); else n.tags = n.tags.filter((x) => x !== t); 
  setSaveStatus('saving'); schedSave();
}
function schedSave() {
  clearTimeout(nSaveT);
  nSaveT = setTimeout(() => {
    rendN();
    syncData();
    setSaveStatus('saved'); // Выводим "Сохранено" после окончания печати
  }, 700);
}
function updWC(t) { const w = t.trim().split(/\s+/).filter((w) => w).length; document.getElementById("wc").textContent = `${w} words`; }
function pinN() {
  const n = NOTES.find((x) => x.id === selNid); if (!n) return;
  n.pinned = !n.pinned; document.getElementById("pin-btn").style.color = n.pinned ? "var(--accent)" : "";
  rendN(); toast(n.pinned ? "tNotePinned" : "tNoteUnpinned");
  syncData();
}
function cpNoteContent() { const n = NOTES.find((x) => x.id === selNid); if (n) cpF(n.body, "tNoteCopied"); }
function setNF(f, btn) {
  nFilt = f; document.querySelectorAll(".nl-hdr .fchip").forEach((c) => c.classList.remove("on")); btn.classList.add("on");
  let fi = NOTES; if (f === "pinned") fi = NOTES.filter((n) => n.pinned); else if (f !== "all") fi = NOTES.filter((n) => n.tags.some((t) => t.toLowerCase() === f));
  rendN(fi);
}
function filtN(q) { const ql = q.toLowerCase(); rendN(NOTES.filter((n) => n.title.toLowerCase().includes(ql) || n.body.toLowerCase().includes(ql))); }

// ═══════════════════════════════════════
//  SETTINGS RENDERER
// ═══════════════════════════════════════
let curSS='general';
let updState='idle';

const SS = {
  general: () => {
    const l = DICT[TEMP_SETT.lang] || DICT.en;
    return `
    <div class="sh">${l.sgTit}</div>
    <div class="scard" style="overflow:visible">
      <div class="srow"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-theme"/></svg></div><div style="flex:1"><div class="slbl2">${l.sgThm}</div><div class="ssub">${l.sgThmS}</div></div>
        <div class="custom-sel-wrap sctrl" id="theme-wrap" data-action="toggleCustomMenu" data-target="theme-wrap">
          <div class="custom-sel-val" id="theme-val">${TEMP_SETT.theme === "system" ? l.optSys : (TEMP_SETT.theme === "light" ? l.optLi : l.optDa)}</div>
          <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M7 9.5L12 14.5L17 9.5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div class="custom-sel-opts">
            <div class="custom-opt ${TEMP_SETT.theme === "system" ? "on" : ""}" data-action="setTheme" data-theme="system" data-text="${l.optSys}">${l.optSys}</div>
            <div class="custom-opt ${TEMP_SETT.theme === "light" ? "on" : ""}" data-action="setTheme" data-theme="light" data-text="${l.optLi}">${l.optLi}</div>
            <div class="custom-opt ${TEMP_SETT.theme === "dark" ? "on" : ""}" data-action="setTheme" data-theme="dark" data-text="${l.optDa}">${l.optDa}</div>
          </div>
        </div>
      </div>
      <div class="srow"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-color"/></svg></div><div style="flex:1"><div class="slbl2">${l.sgAcc}</div><div class="ssub">${l.sgAccS}</div></div>
        <div style="display:flex;gap:8px;" class="sctrl">
          <div class="color-btn" data-c="blue" style="width:20px;height:20px;border-radius:50%;background:#3B82F6;cursor:pointer;box-shadow:${TEMP_SETT.color === "blue" ? "0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)" : "0 0 0 2px var(--bg-card), 0 0 0 0 transparent"};" data-action="setColor" data-color="blue"></div>
          <div class="color-btn" data-c="green" style="width:20px;height:20px;border-radius:50%;background:#10B981;cursor:pointer;box-shadow:${TEMP_SETT.color === "green" ? "0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)" : "0 0 0 2px var(--bg-card), 0 0 0 0 transparent"};" data-action="setColor" data-color="green"></div>
          <div class="color-btn" data-c="purple" style="width:20px;height:20px;border-radius:50%;background:#8B5CF6;cursor:pointer;box-shadow:${TEMP_SETT.color === "purple" ? "0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)" : "0 0 0 2px var(--bg-card), 0 0 0 0 transparent"};" data-action="setColor" data-color="purple"></div>
          <div class="color-btn" data-c="pink" style="width:20px;height:20px;border-radius:50%;background:#EC4899;cursor:pointer;box-shadow:${TEMP_SETT.color === "pink" ? "0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)" : "0 0 0 2px var(--bg-card), 0 0 0 0 transparent"};" data-action="setColor" data-color="pink"></div>
          <div class="color-btn" data-c="orange" style="width:20px;height:20px;border-radius:50%;background:#F59E0B;cursor:pointer;box-shadow:${TEMP_SETT.color === "orange" ? "0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)" : "0 0 0 2px var(--bg-card), 0 0 0 0 transparent"};" data-action="setColor" data-color="orange"></div>
        </div>
      </div>
      <div class="srow"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-font"/></svg></div><div style="flex:1"><div class="slbl2">${l.sgFnt}</div><div class="ssub">${l.sgFntS}</div></div>
        <div class="custom-sel-wrap sctrl" id="font-wrap" data-action="toggleCustomMenu" data-target="font-wrap">
          <div class="custom-sel-val" id="font-val">${TEMP_SETT.font === 'Regular' ? l.optReg : (TEMP_SETT.font === 'Large' ? l.optLg : l.optXl)}</div>
          <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M7 9.5L12 14.5L17 9.5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div class="custom-sel-opts">
            <div class="custom-opt ${TEMP_SETT.font === "Regular" ? "on" : ""}" data-action="setScale" data-size="Regular" data-text="${l.optReg}">${l.optReg}</div>
            <div class="custom-opt ${TEMP_SETT.font === "Large" ? "on" : ""}" data-action="setScale" data-size="Large" data-text="${l.optLg}">${l.optLg}</div>
            <div class="custom-opt ${TEMP_SETT.font === "Extra Large" ? "on" : ""}" data-action="setScale" data-size="Extra Large" data-text="${l.optXl}">${l.optXl}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="slbl" style="margin-top:4px">${l.sgLan}</div>
    <div class="scard" style="overflow:visible">
      <div class="lang-grid">${[
        {code:'en',flag:'🇺🇸',name:'English',sub:'US'},
        {code:'uk',flag:'🇺🇦',name:'Українська',sub:'UA'},
        {code:'ru',flag:'🇷🇺',name:'Русский',sub:'RU'}
      ].map(lg=>`<div class="lang-opt${TEMP_SETT.lang===lg.code?' on':''}" data-action="setLang" data-lang="${lg.code}"><div class="lang-flag">${lg.flag}</div><div class="lang-name">${lg.name}</div><div class="lang-code">${lg.sub}</div></div>`).join('')}</div>
      <div class="srow" style="border-top:1px solid var(--br)"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-date"/></svg></div><div style="flex:1"><div class="slbl2">${l.sgDat}</div><div class="ssub">${l.sgDatS}</div></div>
        <div class="custom-sel-wrap sctrl" id="date-wrap" data-action="toggleCustomMenu" data-target="date-wrap">
          <div class="custom-sel-val" id="date-val">${TEMP_SETT.date}</div>
          <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M7 9.5L12 14.5L17 9.5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div class="custom-sel-opts">
            <div class="custom-opt ${TEMP_SETT.date === "MM/DD/YYYY" ? "on" : ""}" data-action="setDate" data-date="MM/DD/YYYY">MM/DD/YYYY</div>
            <div class="custom-opt ${TEMP_SETT.date === "DD.MM.YYYY" ? "on" : ""}" data-action="setDate" data-date="DD.MM.YYYY">DD.MM.YYYY</div>
            <div class="custom-opt ${TEMP_SETT.date === "YYYY-MM-DD" ? "on" : ""}" data-action="setDate" data-date="YYYY-MM-DD">YYYY-MM-DD</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="slbl" style="margin-top:4px">${l.sgSup}</div>
    <div class="scard">
      <div class="srow"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-feedback"/></svg></div><div style="flex:1"><div class="slbl2">${l.sgFeed}</div><div class="ssub">${l.sgFeedS}</div></div><button class="btn-s sctrl" style="height:29px;font-size:11px;opacity:0.5;cursor:not-allowed;" data-action="toast" data-key="tFeedbackDisabled">${l.sgFeedB}</button></div>
    </div>`
  },

  vault: () => {
    const l = DICT[TEMP_SETT.lang] || DICT.en;
    return `
    <div class="sh">${l.svTit}</div>
    <div class="scard">
      <div class="srow"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-backup"/></svg></div><div style="flex:1"><div class="slbl2">${l.svBkp}</div><div class="ssub">${l.svBkpS} · Last: ${SETT.lastBackup ? fmtDate(new Date(SETT.lastBackup).toISOString()) : 'Never'}</div></div><button class="sw ${TEMP_SETT.autoBackup ? 'on' : ''} sctrl" data-action="toggleSett" data-key="autoBackup"></button></div>
      <div class="srow"><div class="sico" style="background:var(--ok-bg); color:var(--ok)"><svg viewBox="0 0 24 24"><use href="#ic-inner-exp"/></svg></div><div style="flex:1"><div class="slbl2">${l.svExp}</div><div class="ssub">${l.svExpS}</div></div><button class="sw ${TEMP_SETT.passExpiry ? 'on' : ''} sctrl" data-action="toggleSett" data-key="passExpiry"></button></div>
      <div class="srow"><div class="sico" style="background:var(--wn-bg); color:var(--wn)"><svg viewBox="0 0 24 24"><use href="#ic-password"/></svg></div><div style="flex:1"><div class="slbl2">${l.svWk}</div><div class="ssub">${l.svWkS}</div></div><button class="sw ${TEMP_SETT.weakWarn ? 'on' : ''} sctrl" data-action="toggleSett" data-key="weakWarn"></button></div>
    </div>

    <div class="slbl" style="margin-top:4px">${l.svIE}</div>
    <div class="scard">
      <div class="srow"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-imp"/></svg></div><div style="flex:1"><div class="slbl2">${l.svImpC}</div><div class="ssub">${l.svImpCS}</div></div><button class="btn-s sctrl" style="height:29px;font-size:11px" data-action="importData">${l.svImpB}</button></div>
      <div class="srow"><div class="sico" style="background:var(--wn-bg); color:var(--wn)"><svg viewBox="0 0 24 24"><use href="#ic-inner-backup"/></svg></div><div style="flex:1"><div class="slbl2">${l.svExpV}</div><div class="ssub">${l.svExpVS}</div></div><button class="btn-s sctrl" style="height:29px;font-size:11px" data-action="exportVault">${l.svExpB}</button></div>
      <div class="srow"><div class="sico" style="background:var(--wn-bg); color:var(--wn)"><svg viewBox="0 0 24 24"><use href="#ic-inner-backup"/></svg></div><div style="flex:1"><div class="slbl2">${l.svExpC}</div><div class="ssub" style="color:var(--er)">${l.svExpCS}</div></div><button class="btn-d sctrl" style="height:29px;font-size:11px" data-action="exportCSV">${l.svExpCB}</button></div>
    </div>

    <div class="slbl" style="margin-top:4px">${l.svDan}</div>
    <div class="scard">
      <div class="srow"><div class="sico" style="background:var(--er-bg); color:var(--er)"><svg viewBox="0 0 24 24"><use href="#ic-delete"/></svg></div><div style="flex:1"><div class="slbl2" style="color:var(--er)">${l.svDel}</div><div class="ssub">${l.svDelS}</div></div><button class="btn-d sctrl" style="height:29px;font-size:11px" data-action="eraseVault">${l.svDelB}</button></div>
    </div>`
  },

  updates: () => {
    const l = DICT[TEMP_SETT.lang] || DICT.en;
    return `
    <div class="sh">${l.suTit}</div>
    <div class="upd-panel">
      <div class="upd-hero" style="border-bottom:none;">
        <div class="upd-ico" id="upd-ico"><svg viewBox="0 0 24 24"><use href="#ic-logo"/></svg></div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="font-size:13px;font-weight:800;letter-spacing:-.015em" id="upd-title">Clyp v...</div>
            <div class="upd-badge" id="upd-badge" style="background:var(--ok-bg);color:var(--ok);padding:4px 10px;font-size:11px;display:flex;align-items:center;gap:4px;">
              <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-chk-tip"/></svg>Up to date
            </div>
          </div>
          <div style="font-size:11px;color:var(--tx3);font-weight:500" id="upd-sub">Current version</div>
        </div>
        <button class="btn-p" id="upd-btn" data-action="runUpdateCheck" style="height:34px;font-size:12px">
          <svg viewBox="0 0 24 24"><use href="#ic-inner-upd"/></svg><span id="upd-btn-lbl">${l.suChk}</span>
        </button>
      </div>
      <div class="upd-prog-wrap" id="upd-prog-sec" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:11px;font-weight:700;color:var(--tx2)" id="upd-prog-lbl">Checking servers…</span>
          <span style="font-size:11px;font-weight:800;color:var(--accent);display:none;" id="upd-pct">0%</span>
        </div>
        <div class="upd-prog-bar"><div class="upd-prog-fill" id="upd-prog-fill"></div></div>
        <div class="upd-log" id="upd-log"></div>
      </div>
      <div class="srow" style="border-top:1px solid var(--br);"><div class="sico" style="background:var(--accent-lt); color:var(--accent);"><svg viewBox="0 0 24 24"><use href="#ic-inner-sync"/></svg></div><div style="flex:1"><div class="slbl2">${l.suAut}</div><div class="ssub">${l.suAutS}</div></div><button class="sw ${TEMP_SETT.autoUpdate ? 'on' : ''} sctrl" data-action="toggleSett" data-key="autoUpdate"></button></div>
    </div>

    <div class="slbl" style="margin-top:16px">${l.suRel}</div>
    <div class="scard">
      <div id="release-notes-container" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;min-height:50px;justify-content:center;">
        <div style="font-size:11px;color:var(--tx3);font-weight:600;text-align:center;">Загрузка данных релиза...</div>
      </div>
    </div>`;
  }
};

function setSS(k, btn) { curSS = k; document.querySelectorAll(".sni").forEach((b) => b.classList.remove("on")); btn.classList.add("on"); rendSett(); }
function rendSett() { 
  const el = document.getElementById("sett-body"); 
  if (el) el.innerHTML = (SS[curSS] || SS.general)(); 
  
  if (curSS === 'updates' && window.electronAPI && window.electronAPI.getVersion) {
    window.electronAPI.getVersion().then(v => {
      const tit = document.getElementById('upd-title');
      if(tit) tit.textContent = `Clyp v${v}`;
      
      const relContainer = document.getElementById('release-notes-container');
      if (!relContainer) return;

      // Внутренняя функция для красивой отрисовки заметок
      const drawNotes = (relVer, relNotes) => {
        if (!relVer || !relNotes) return;
        const cleanNotes = relNotes.split('\n').filter(line => line.trim() !== '').join('<br style="content: \'\'; display: block; margin: 4px 0;">');
        const isCurrent = (relVer === v);
        
        relContainer.innerHTML = `
          <div style="padding-bottom: 2px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:12px;font-weight:800;color:var(--tx1)">v${relVer}</span>
              <span class="bdg" style="background:var(--${isCurrent ? 'ok-bg' : 'accent-lt'});color:var(--${isCurrent ? 'ok' : 'accent'});display:flex;align-items:center;gap:4px;padding:2px 6px;">
                <svg viewBox="0 0 24 24" style="width:10px;height:10px;stroke:currentColor;fill:none;stroke-width:2.5;"><use href="#${isCurrent ? 'ic-chk-tip' : 'ic-inner-upd'}"/></svg>${isCurrent ? 'Current' : 'New Release'}
              </span>
            </div>
            <div style="font-size:11px;color:var(--tx2);font-weight:500;line-height:1.4;letter-spacing:0.01em;" class="gh-notes">${cleanNotes}</div>
          </div>`;
      };

      // 1. Сначала мгновенно показываем то, что сохранено локально (оффлайн кэш)
      if (SETT.releaseVersion && SETT.releaseNotes) {
        drawNotes(SETT.releaseVersion, SETT.releaseNotes);
      }

      // 2. Делаем независимый тихий запрос напрямую в GitHub API
      fetch('https://api.github.com/repos/voilsy/Clyp/releases/latest')
        .then(res => res.json())
        .then(data => {
          if (data && data.tag_name) {
            // GitHub отдает tag_name в формате "v1.1.1", отрезаем "v"
            const ghVersion = data.tag_name.replace('v', '');
            const ghNotes = data.body;
            
            // Перерисовываем с самыми свежими данными
            drawNotes(ghVersion, ghNotes);
            
            // Сохраняем в память и на диск, чтобы при отсутствии интернета всё работало
            SETT.releaseVersion = ghVersion;
            SETT.releaseNotes = ghNotes;
            syncData();
          }
        })
        .catch(err => {
          // Если нет интернета и нет кэша
          if (!SETT.releaseVersion) {
            relContainer.innerHTML = `<div style="font-size:11px;color:var(--tx3);text-align:center;font-weight:600;">Нет подключения к GitHub</div>`;
          }
        });
    });
  }
}

// ═══════════════════════════════════════
//  REAL AUTO-UPDATER LOGIC
// ═══════════════════════════════════════

function runUpdateCheck() {
  const btn = document.getElementById('upd-btn');
  const lbl = document.getElementById('upd-btn-lbl');
  const sec = document.getElementById('upd-prog-sec');
  const fill = document.getElementById('upd-prog-fill');
  const pLbl = document.getElementById('upd-prog-lbl');
  const pct = document.getElementById('upd-pct');
  const log = document.getElementById('upd-log');
  const badge = document.getElementById('upd-badge');
  const l = DICT[SETT.lang] || DICT.en;

  if (updState === 'checking' || updState === 'downloading') return;

  if (updState === 'ready') {
    if (window.electronAPI && window.electronAPI.installUpdate) {
      window.electronAPI.installUpdate();
    }
    return;
  }

  if (updState === 'ready-to-download') {
    updState = 'downloading';
    btn.disabled = true;
    btn.classList.add('spinning');
    lbl.style.display = 'none';
    pLbl.textContent = l.tUpdAvailable;
    pct.style.display = 'inline';
    if (window.electronAPI && window.electronAPI.downloadUpdate) {
      window.electronAPI.downloadUpdate();
    }
    return;
  }

  updState = 'checking';
  btn.disabled = true;
  btn.classList.add('spinning');
  lbl.style.display = 'none';

  sec.style.display = '';
  fill.style.width = '0%';
  pct.style.display = 'none';
  pLbl.textContent = l.tUpdChecking;
  
  log.textContent = '> Connecting to GitHub update servers...\n';
  badge.style.background = 'var(--wn-bg)';
  badge.style.color = 'var(--wn)';
  badge.innerHTML = `<svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-warn-tip"/></svg> Checking...`;

  if (window.electronAPI && window.electronAPI.checkForUpdates) {
    window.electronAPI.checkForUpdates();
  } else {
    btn.classList.remove('spinning');
    lbl.style.display = 'inline';
    log.textContent += '> Error: Auto-update backend is unavailable (Browser mode?)\n';
    updState = 'idle';
    btn.disabled = false;
    lbl.textContent = l.suChk;
  }
}

// ═══════════════════════════════════════
//  IPC LISTENERS (Слушаем ответы от GitHub)
// ═══════════════════════════════════════
if (window.electronAPI) {
  if (window.electronAPI.onUpdateStatus) {
    window.electronAPI.onUpdateStatus((data) => {
      const log = document.getElementById('upd-log');
      const pLbl = document.getElementById('upd-prog-lbl');
      const badge = document.getElementById('upd-badge');
      const btn = document.getElementById('upd-btn');
      const lbl = document.getElementById('upd-btn-lbl');
      const fill = document.getElementById('upd-prog-fill');
      const pct = document.getElementById('upd-pct');
      const l = DICT[SETT.lang] || DICT.en;

      const settNavBtn = document.querySelector('.sb .ni[data-page="4"]');
      const updTabBtn = document.querySelector('.sni[data-tab="updates"]');

      if (btn) btn.classList.remove('spinning');

      if (!log) return; 

      log.textContent += '> ' + data.msg + '\n';
      log.scrollTop = log.scrollHeight; 

      if (data.status === 'available') {
        if (settNavBtn) settNavBtn.classList.add('has-update');
        if (updTabBtn) updTabBtn.classList.add('has-update');
        
        SETT.releaseNotes = data.notes || '';
        SETT.releaseVersion = data.version || '';
        syncData();

        const relContainer = document.getElementById('release-notes-container');
        if (relContainer) {
          const cleanNotes = data.notes 
            ? data.notes.split('\n').filter(line => line.trim() !== '').join('<br style="content: \'\'; display: block; margin: 4px 0;">')
            : 'No release details provided.';

          relContainer.innerHTML = `
            <div style="padding-bottom: 2px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="font-size:12px;font-weight:800;color:var(--tx1)">v${data.version}</span>
                <span class="bdg" style="background:var(--accent-lt);color:var(--accent);display:flex;align-items:center;gap:4px;padding:2px 6px;">
                  <svg viewBox="0 0 24 24" style="width:10px;height:10px;stroke:currentColor;fill:none;stroke-width:2.5;"><use href="#ic-inner-upd"/></svg>New Release
                </span>
              </div>
              <div style="font-size:11px;color:var(--tx2);font-weight:500;line-height:1.4;letter-spacing:0.01em;" class="gh-notes">${cleanNotes}</div>
            </div>`;
        }

        const updPanel = document.querySelector('.upd-panel');
        if (updPanel) updPanel.style.display = 'block'; 

        if (SETT.autoUpdate) {
          window.electronAPI.downloadUpdate();
          updState = 'downloading';
          pLbl.textContent = l.tUpdAvailable;
          if (pct) pct.style.display = 'inline';
        } else {
          updState = 'ready-to-download';
          if (btn) {
            btn.disabled = false;
            lbl.style.display = 'inline';
            lbl.textContent = 'Download';
          }
          pLbl.textContent = l.tUpdPending;
          if (pct) pct.style.display = 'none';
          badge.style.background = 'var(--wn-bg)';
          badge.style.color = 'var(--wn)';
          badge.innerHTML = `<svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-warn-tip"/></svg> Available`;
        }
      } 
      else if (data.status === 'latest') {
        if (settNavBtn) settNavBtn.classList.remove('has-update');
        if (updTabBtn) updTabBtn.classList.remove('has-update');

        updState = 'idle';
        if (btn) { btn.disabled = false; lbl.style.display = 'inline'; lbl.textContent = l.suChk; }
        badge.style.background = 'var(--ok-bg)';
        badge.style.color = 'var(--ok)';
        badge.innerHTML = `<svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-chk-tip"/></svg> Up to date`;
        pLbl.textContent = l.tUpdLatest;
        if (pct) pct.style.display = 'none';
        if (fill) { fill.style.width = '100%'; fill.style.background = 'var(--ok)'; }
      } 
      else if (data.status === 'ready') {
        if (settNavBtn) settNavBtn.classList.add('has-update');
        if (updTabBtn) updTabBtn.classList.add('has-update');

        updState = 'ready';
        if (btn) { btn.disabled = false; lbl.style.display = 'inline'; lbl.textContent = 'Install & Restart'; btn.style.background = 'var(--ok)'; }
        badge.style.background = 'var(--ok-bg)';
        badge.style.color = 'var(--ok)';
        badge.innerHTML = `<svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-chk-tip"/></svg> Downloaded`;
        pLbl.textContent = l.tUpdReady;
        if (pct) pct.style.display = 'none';
      } 
      else if (data.status === 'error') {
        if (settNavBtn) settNavBtn.classList.remove('has-update');
        if (updTabBtn) updTabBtn.classList.remove('has-update');

        updState = 'idle';
        if (btn) { btn.disabled = false; lbl.style.display = 'inline'; lbl.textContent = l.suChk; }
        badge.style.background = 'var(--er-bg)';
        badge.style.color = 'var(--er)';
        badge.innerHTML = `<svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;"><use href="#ic-circle-tip"/></svg> Error`;
        pLbl.textContent = l.tUpdError;
        if (pct) pct.style.display = 'none';
        if (fill) fill.style.background = 'var(--er)';
      }
    });
  }

  if (window.electronAPI.onUpdateProgress) {
    window.electronAPI.onUpdateProgress((percent) => {
      const fill = document.getElementById('upd-prog-fill');
      const pct = document.getElementById('upd-pct');
      if (fill) fill.style.width = percent + '%';
      if (pct) pct.textContent = percent + '%';
    });
  }
}

// ═══════════════════════════════════════
//  TOAST & COPY (УМНАЯ СИСТЕМА ТОСТОВ)
// ═══════════════════════════════════════
let tt, ttHide;
function toast(msgKey) {
  const l = DICT[SETT.lang] || DICT.en;
  const resolvedMsg = l[msgKey] || msgKey; 
  
  let t = document.querySelector(".toast"); 
  if (t) { clearTimeout(ttHide); t.remove(); }
  
  t = document.createElement("div"); 
  t.className = "toast"; 
  t.textContent = resolvedMsg;
  document.body.appendChild(t);
  
  clearTimeout(tt); 
  tt = setTimeout(() => {
    t.classList.add('hide');
    ttHide = setTimeout(() => t.remove(), 300);
  }, 2100);
}
function cpF(v, msgKey) { navigator.clipboard.writeText(v).catch(() => {}); toast(msgKey); }

// ═══════════════════════════════════════
//  REAL TOTP ALGORITHM & TIMER
// ═══════════════════════════════════════

function base32ToBuffer(base32) {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (let i = 0; i < base32.length; i++) {
    let val = base32chars.indexOf(base32.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  let buffer = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  return buffer;
}

async function generateTOTP(secret) {
  if (!secret) return "NO KEY";
  try {
    const keyBuffer = base32ToBuffer(secret.toUpperCase());
    if (keyBuffer.length === 0) return "INVALID";
    const key = await window.crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
    
    const epoch = Math.floor(Date.now() / 1000 / 30);
    const timeBuffer = new ArrayBuffer(8);
    new DataView(timeBuffer).setUint32(4, epoch, false);
    
    const signature = await window.crypto.subtle.sign("HMAC", key, timeBuffer);
    const hmac = new Uint8Array(signature);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    
    const totp = (code % 1000000).toString().padStart(6, '0');
    return totp.slice(0, 3) + " " + totp.slice(3);
  } catch (e) {
    return "ERROR";
  }
}

async function updateTOTPUI() {
  const epoch = Math.floor(Date.now() / 1000);
  const tsec = 30 - (epoch % 30);
  
  const elCd = document.getElementById('tcd'); if (elCd) elCd.textContent = tsec + 's';
  const r = document.getElementById('tring'); if (r) r.setAttribute('stroke-dashoffset', Math.round(88 * (1 - tsec / 30)));
  
  if (selId) {
    const a = ACCS.find(x => x.id === selId);
    const tcodeEl = document.getElementById('tcode');
    if (a && a.has2fa && tcodeEl) {
      tcodeEl.textContent = await generateTOTP(a.totpKey);
    }
  }
}
setInterval(updateTOTPUI, 1000);

function copyTOTP() {
  const el = document.getElementById('tcode');
  if (el && !el.textContent.includes("KEY") && !el.textContent.includes("ERROR")) {
    cpF(el.textContent.replace(/\s/g, ''), "tCopied");
  }
}

// ═══════════════════════════════════════
//  CENTRAL EVENT ROUTER (CSP COMPLIANT)
// ═══════════════════════════════════════
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  if (action === 'nav') SP(parseInt(target.dataset.page), target);
  if (action === 'goAdd') goAdd();
  if (action === 'cancelAdd') cancelAdd();
  if (action === 'toggleTheme') toggleTheme();

  if (action === 'setGT') setGT(parseInt(target.dataset.tab), target);
  if (action === 'genP') genP();
  if (action === 'copyP') copyP();
  if (action === 'useInVault') useInVault();
  if (action === 'toggleCC') toggleCC(target);
  if (action === 'toggleSw') target.classList.toggle('on');

  if (action === 'saveAcc') saveAcc();
  if (action === 'selIco') selIco(target, target.dataset.icon);
  if (action === 'tog2FA') tog2FA(target);
  if (action === 'togPV') togPV(target.dataset.target);
  if (action === 'setF') setF(target.dataset.filter, target);
  if (action === 'cpDE') cpDE();
  if (action === 'cpDP') cpDP();
  if (action === 'editA') editA();
  if (action === 'delA') delA();
  if (action === 'confDel') confDel();
  if (action === 'closeM') closeM();
  if (action === 'toggleSort') toggleSortMenu(e);
  if (action === 'setSort') setSort(target.dataset.sort, target.dataset.text, target);
  if (action === 'openUrl') {
    const a = ACCS.find(x => x.id === selId);
    if (a && a.url) window.open(a.url.startsWith('http') ? a.url : 'https://' + a.url, '_blank');
  }
  if (action === 'fillG') fillG();
  if (action === 'setCat') setCat(target.dataset.val, target.dataset.text, target);
  if (action === 'copyTOTP') copyTOTP();

  if (action === 'togBackupVis') {
    const a = ACCS.find(x => x.id === selId);
    if (a) {
      backupVis = !backupVis;
      document.getElementById("d-backup-txt").textContent = backupVis ? a.backupCodes : "••••••••••••";
    }
  }
  
  if (action === 'copyBackup') {
    const a = ACCS.find(x => x.id === selId);
    if (a && a.backupCodes) {
      cpF(a.backupCodes, "tBackupCopied");
      markUsed();
    }
  }

  if (action === 'newN') newN();
  if (action === 'pinN') pinN();
  if (action === 'delN') delN();
  if (action === 'cpNote') cpNoteContent();
  if (action === 'togNT') togNT(target);
  if (action === 'setNF') setNF(target.dataset.filter, target);

  if (action === 'setSS') setSS(target.dataset.tab, target);
  if (action === 'saveSettings') saveSettings();
  if (action === 'discardSettings') discardSettings();
  if (action === 'toggleCustomMenu') toggleCustomMenu(target.dataset.target, e);
  if (action === 'importData') importData(target);
  if (action === 'exportVault') exportVault();
  if (action === 'exportCSV') exportCSV();
  if (action === 'eraseVault') eraseVault();
  if (action === 'closeEraseM') closeEraseM();
  if (action === 'confErase') confErase();
  if (action === 'runUpdateCheck') runUpdateCheck();

  if (action === 'setTheme') { updateCustomSel(target.closest('.custom-sel-wrap').id, target.dataset.text, target); applyTheme(target.dataset.theme); syncData(); }
  if (action === 'setColor') { setAccentColor(target.dataset.color); syncData(); }
  if (action === 'setScale') { updateCustomSel(target.closest('.custom-sel-wrap').id, target.dataset.text, target); setFontSize(target.dataset.size); syncData(); }
  if (action === 'setLang') { setLang(target.dataset.lang, target); updateLanguage(); syncData(); }
  if (action === 'setDate') { updateCustomSel(target.closest('.custom-sel-wrap').id, target.dataset.date, target); setDateFormat(target.dataset.date); syncData(); }
  if (action === 'toast') toast(target.dataset.key);
  if (action === 'toggleSett') { toggleSett(target.dataset.key, target); syncData(); }

  if (action === 'ftueNext') ftueNext();
  if (action === 'ftuePrev') ftuePrev();
  if (action === 'setFLang') setFLang(target);
  if (action === 'setFTheme') setFTheme(target);
  if (action === 'setFColor') setFColor(target);
  if (action === 'setFScale') setFScale(target);
});

document.addEventListener('input', (e) => {
  const target = e.target;
  if (target.id === 'lslider') onLen(target);
  if (target.id === 'a-name' || target.id === 'a-email') updPrev();
  if (target.id === 'a-pass') chkPS(target.value);
  if (target.id === 'n-tin') onNT(target.value);
  if (target.id === 'n-ta') onNC(target.value);
  if (target.hasAttribute('data-search')) {
    if (target.dataset.search === 'accounts') filterA(target.value);
    if (target.dataset.search === 'notes') filtN(target.value);
  }
});

// ═══════════════════════════════════════
//  FIRST TIME USER EXPERIENCE (FTUE) & INIT
// ═══════════════════════════════════════
let fStep = 0;
const fMax = 3;

function getFtueContent() {
  const l = DICT[TEMP_SETT.lang] || DICT.en;
  
  return [
    `
    <div class="ftue-title">${l.ftueTit1}</div>
    <div class="ftue-sub">${l.ftueSub1}</div>
    `,

    `
    <div class="ftue-title" style="margin-bottom:8px">${l.ftueTit2}</div>
    <div class="lang-grid" style="width:100%; padding:0; gap:12px;">
      <div class="lang-opt ${TEMP_SETT.lang==='en'?'on':''}" data-action="setFLang" data-lang="en"><div class="lang-flag">🇺🇸</div><div class="lang-name">English</div><div class="lang-code">US</div></div>
      <div class="lang-opt ${TEMP_SETT.lang==='uk'?'on':''}" data-action="setFLang" data-lang="uk"><div class="lang-flag">🇺🇦</div><div class="lang-name">Українська</div><div class="lang-code">UA</div></div>
      <div class="lang-opt ${TEMP_SETT.lang==='ru'?'on':''}" data-action="setFLang" data-lang="ru"><div class="lang-flag">🇷🇺</div><div class="lang-name">Русский</div><div class="lang-code">RU</div></div>
    </div>
    `,

    `
    <div class="ftue-title" style="margin-bottom:8px">${l.ftueTit3}</div>
    <div class="scard" style="width:100%; overflow:visible; text-align:left;">
      <div class="srow"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-theme"/></svg></div><div style="flex:1;"><div class="slbl2">${l.ftueTheme}</div></div>
        <div class="custom-sel-wrap sctrl" id="f-theme-wrap" data-action="toggleCustomMenu" data-target="f-theme-wrap">
          <div class="custom-sel-val" id="f-theme-val">${TEMP_SETT.theme === 'system' ? l.optSys : (TEMP_SETT.theme === 'light' ? l.optLi : l.optDa)}</div>
          <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M7 9.5L12 14.5L17 9.5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div class="custom-sel-opts">
            <div class="custom-opt ${TEMP_SETT.theme==='system'?'on':''}" data-action="setFTheme" data-theme="system" data-text="${l.optSys}">${l.optSys}</div>
            <div class="custom-opt ${TEMP_SETT.theme==='light'?'on':''}" data-action="setFTheme" data-theme="light" data-text="${l.optLi}">${l.optLi}</div>
            <div class="custom-opt ${TEMP_SETT.theme==='dark'?'on':''}" data-action="setFTheme" data-theme="dark" data-text="${l.optDa}">${l.optDa}</div>
          </div>
        </div>
      </div>
      
      <div class="srow"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-font"/></svg></div><div style="flex:1;"><div class="slbl2">${l.sgFnt}</div></div>
        <div class="custom-sel-wrap sctrl" id="f-font-wrap" data-action="toggleCustomMenu" data-target="f-font-wrap">
          <div class="custom-sel-val" id="f-font-val">${TEMP_SETT.font === 'Regular' ? l.optReg : (TEMP_SETT.font === 'Large' ? l.optLg : l.optXl)}</div>
          <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M7 9.5L12 14.5L17 9.5" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div class="custom-sel-opts">
            <div class="custom-opt ${TEMP_SETT.font==='Regular'?'on':''}" data-action="setFScale" data-size="Regular">${l.optReg}</div>
            <div class="custom-opt ${TEMP_SETT.font==='Large'?'on':''}" data-action="setFScale" data-size="Large">${l.optLg}</div>
            <div class="custom-opt ${TEMP_SETT.font==='Extra Large'?'on':''}" data-action="setFScale" data-size="Extra Large">${l.optXl}</div>
          </div>
        </div>
      </div>

      <div class="srow" style="border-bottom:none;"><div class="sico" style="background:var(--accent-lt); color:var(--accent)"><svg viewBox="0 0 24 24"><use href="#ic-inner-color"/></svg></div><div style="flex:1;"><div class="slbl2">${l.ftueAcc}</div></div>
        <div style="display:flex;gap:8px;" class="sctrl">
          <div class="color-btn" data-c="blue" style="width:20px;height:20px;border-radius:50%;background:#3B82F6;cursor:pointer;box-shadow:${TEMP_SETT.color==='blue'?'0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)':'0 0 0 2px var(--bg-card), 0 0 0 0 transparent'};" data-action="setFColor" data-color="blue"></div>
          <div class="color-btn" data-c="green" style="width:20px;height:20px;border-radius:50%;background:#10B981;cursor:pointer;box-shadow:${TEMP_SETT.color==='green'?'0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)':'0 0 0 2px var(--bg-card), 0 0 0 0 transparent'};" data-action="setFColor" data-color="green"></div>
          <div class="color-btn" data-c="purple" style="width:20px;height:20px;border-radius:50%;background:#8B5CF6;cursor:pointer;box-shadow:${TEMP_SETT.color==='purple'?'0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)':'0 0 0 2px var(--bg-card), 0 0 0 0 transparent'};" data-action="setFColor" data-color="purple"></div>
          <div class="color-btn" data-c="pink" style="width:20px;height:20px;border-radius:50%;background:#EC4899;cursor:pointer;box-shadow:${TEMP_SETT.color==='pink'?'0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)':'0 0 0 2px var(--bg-card), 0 0 0 0 transparent'};" data-action="setFColor" data-color="pink"></div>
          <div class="color-btn" data-c="orange" style="width:20px;height:20px;border-radius:50%;background:#F59E0B;cursor:pointer;box-shadow:${TEMP_SETT.color==='orange'?'0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)':'0 0 0 2px var(--bg-card), 0 0 0 0 transparent'};" data-action="setFColor" data-color="orange"></div>
        </div>
      </div>
    </div>
    `,

    `
    <div class="ftue-title" style="margin-bottom:8px">${l.ftueTit4}</div>
    <div class="ftue-sub" style="margin-bottom:24px;">${l.ftueSub4}</div>
    <div style="position:relative; width:100%;">
      <button class="btn-p" style="width:100%;height:44px;font-size:14px;" data-action="importData"><svg viewBox="0 0 24 24"><use href="#ic-inner-imp"/></svg>${l.ftueImp}</button>
      <div class="import-status" style="display:none; position:absolute; top:100%; left:0; right:0; justify-content:center; align-items:center; gap:6px; font-size:12px; font-weight:600; margin-top:10px; opacity:0; transform:translateY(-4px); transition: opacity 0.3s ease, transform 0.3s ease;"></div>
    </div>
    `
  ];
}

function renderFtue() {
  const content = getFtueContent();
  document.getElementById('ftue-body').innerHTML = content.map((html, i) => `<div class="ftue-step ${i===fStep?'on':''}">${html}</div>`).join('');
  
  const dotsWrap = document.getElementById('ftue-dots');
  if (!dotsWrap.innerHTML) {
    dotsWrap.innerHTML = content.map((_, i) => `<div class="ftue-dot ${i===fStep?'on':''}"></div>`).join('');
  } else {
    dotsWrap.querySelectorAll('.ftue-dot').forEach((d, i) => d.className = `ftue-dot ${i===fStep?'on':''}`);
  }
  
  const pBtn = document.getElementById('ftue-btn-prev');
  const nBtn = document.getElementById('ftue-btn-next');
  pBtn.disabled = (fStep === 0);
  
  if (fStep === fMax) {
    nBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width:22px;height:22px;"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    nBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
}

function setFScale(btn) { setFontSize(btn.dataset.size, false); renderFtue();}
function ftueNext() { if (fStep < fMax) { fStep++; renderFtue(); } else { finishFtue(); } }
function ftuePrev() { if (fStep > 0) { fStep--; renderFtue(); } }
function setFLang(btn) { TEMP_SETT.lang = btn.dataset.lang; SETT.lang = btn.dataset.lang; updateLanguage(); renderFtue(); }
function setFTheme(btn) { applyTheme(btn.dataset.theme, false); renderFtue(); }
function setFColor(btn) { setAccentColor(btn.dataset.color, false); renderFtue(); }

function finishFtue() {
  SETT = { ...TEMP_SETT };
  syncData(); 
  
  document.getElementById('ftue-wrap').style.opacity = '0';
  setTimeout(() => {
    document.getElementById('ftue-wrap').style.display = 'none';
    const sb = document.querySelector('.sb');
    const main = document.querySelector('.main');
    sb.style.display = 'flex';
    main.style.display = 'flex';
    
    sb.classList.add('reveal-anim');
    main.classList.add('reveal-anim');
    
    launchMainApp();
    toast('Welcome to Clyp!');
  }, 300);
}

async function initApp() {
  document.querySelector('.sb').style.display = 'none';
  document.querySelector('.main').style.display = 'none';
  
  let isFirstRun = false;

  if (window.electronAPI) {
    const savedData = await window.electronAPI.loadData();
    if (savedData) {
      if (savedData.SETT) { SETT = savedData.SETT; TEMP_SETT = { ...SETT }; }
      if (savedData.ACCS) ACCS = savedData.ACCS;
      if (savedData.NOTES) NOTES = savedData.NOTES;
      if (savedData.nid) nid = savedData.nid;
      if (savedData.nnid) nnid = savedData.nnid;
    } else {
      isFirstRun = true;
      ACCS = []; NOTES = []; nid = 1; nnid = 1; 
    }
  }

  applyTheme(SETT.theme, true);
  setAccentColor(SETT.color, true);

  setTimeout(() => {
    const loader = document.getElementById('loader-wrap');
    loader.style.opacity = '0'; 
    
    setTimeout(() => {
      loader.style.visibility = 'hidden';
      
      if (isFirstRun) {
        document.getElementById('ftue-wrap').style.display = 'flex';
        renderFtue();
      } else {
        const sb = document.querySelector('.sb');
        const main = document.querySelector('.main');
        sb.style.display = 'flex';
        main.style.display = 'flex';
        
        sb.classList.add('reveal-anim');
        main.classList.add('reveal-anim');
        
        launchMainApp();
      }
    }, 500); 
  }, 3000); 
}

function launchMainApp() {
  applySettingsState(SETT); checkAutoBackup(); sortA('az'); 
  if (ACCS.length > 0) selAcc(ACCS[0].id); else clearAccDet(); 
  rendN(); 
  if (NOTES.length > 0) {
    selN(NOTES[0].id); 
  } else {
    toggleNoteEditor(false);
  }
  rendSett(); genP(); updPrev();
  
  const ls = document.getElementById('lslider');
  if(ls) {
    const p = ((ls.value - ls.min) / (ls.max - ls.min)) * 100;
    ls.style.background = `linear-gradient(to right,var(--accent) 0%,var(--accent) ${p}%,var(--brm) ${p}%)`;
  }

  if (SETT.autoUpdate && window.electronAPI && window.electronAPI.checkForUpdates) {
    updState = 'background-checking'; 
    window.electronAPI.checkForUpdates();
  }
}

initApp();