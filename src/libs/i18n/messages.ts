export const messages = {
  uz: {
    welcome:
      '👋 Salom, {name}!\n\nHimoyachi Bot - kompyuteringizni nazorat qiling.',
    error: '❌ Xatolik yuz berdi',
    startFirst: '❌ Avval /start bosing',
    menu: '📋 Menu:',

    // Device
    deviceAdded: "✅ Qurilma qo'shildi!",
    deviceDeleted: "✅ Qurilma o'chirildi!",
    deviceNotFound: '❌ Qurilma topilmadi',
    deviceRenamed: "✅ Qurilma nomi o'zgartirildi: *{name}*",
    noDevices: "📱 Sizda hali qurilma yo'q.\n\n/add - Yangi qurilma qo'shish",
    enterDeviceName: '📛 Qurilma nomini kiriting:',
    invalidDeviceName: "❌ Qurilma nomi noto'g'ri. Qayta kiriting:",
    selectOS: '💻 OS tanlang:',
    osSelected: '✅ OS tanlandi: {os}\n\n📝 Izoh kiriting (yoki "-" yozing):',
    yourKey: '🔑 Sizning kalitingiz:',
    totalDevices: '📱 Jami: {count} ta qurilma',

    // Delete/Rename
    confirmDelete: "🗑 *{name}* ni o'chirmoqchimisiz?",
    yesDelete: "✅ Ha, o'chirish",
    noCancel: "❌ Yo'q",
    cancelled: '❌ Bekor qilindi',
    enterNewName: '✏️ *{name}* uchun yangi nom kiriting:',
    nameTooShort: "❌ Nom kamida 2 ta belgi bo'lishi kerak. Qayta kiriting:",

    // Buttons
    btnAdd: "➕ Qurilma qo'shish",
    btnDevices: '📱 Qurilmalarim',
    btnStats: '📊 Statistika',
    btnLang: '🌐 Til',
    btnHelp: '❓ Yordam',
    btnBack: '⬅️ Orqaga',
    btnRename: "✏️ Nomini o'zgartirish",
    btnDelete: "🗑 O'chirish",
    btnShutdown: "⏹ O'chirish",
    btnRestart: '🔄 Qayta yuklash',
    btnLock: '🔒 Qulflash',

    // Stats
    stats:
      "📊 *Statistika*\n\n📱 *Qurilmalar:* {total} ta\n   🟢 Active: {active}\n   🟡 Pending: {pending}\n   🔴 Inactive: {inactive}\n\n🔔 *Jami alertlar:* {alerts} ta\n\n📅 Ro'yxatdan o'tgan: {date}",

    // Lang
    selectLang: '🌐 Tilni tanlang:',
    langChanged: "✅ Til o'zgartirildi: O'zbek",

    // Alert
    deviceConnected:
      '✅ *Qurilma ulandi!*\n\n📍 Qurilma: {device}\n👤 User: {user}\n🕐 Vaqt: {time}\n\nEndi kompyuter yonganda xabar olasiz 📱',
    devicePowerOn:
      '⚠️ *Kompyuter yondi!*\n\n📍 Qurilma: {device}\n👤 User: {user}\n🕐 Vaqt: {time}',
    deviceOffline:
      '⚠️ *Qurilma offline!*\n\n📍 Qurilma: {device}\n🕐 Oxirgi signal: {time}\n\nTekshiring:\n• Kompyuter yoniqmi?\n• Internet bormi?\n• Script ishlayaptimi?',

    // Help
    help: `🛡 Himoyachi Bot - Yordam

Asosiy buyruqlar:
/start - Botni boshlash
/add - Yangi qurilma qo'shish
/list - Qurilmalarim
/stats - Statistika
/lang - Til o'zgartirish
/setup - Sozlash yo'riqnomasi
/help - Yordam

Qanday ishlaydi?
1) /add orqali qurilma qo'shasiz
2) Bot kalit beradi
3) Kompyuter signal yuborsa — sizga xabar keladi

Savol bo'lsa: @odilov07ko`,
  },

  ru: {
    welcome:
      '👋 Привет, {name}!\n\nHimoyachi Bot - контролируйте свой компьютер.',
    error: '❌ Произошла ошибка',
    startFirst: '❌ Сначала нажмите /start',
    menu: '📋 Меню:',

    // Device
    deviceAdded: '✅ Устройство добавлено!',
    deviceDeleted: '✅ Устройство удалено!',
    deviceNotFound: '❌ Устройство не найдено',
    deviceRenamed: '✅ Название изменено: *{name}*',
    noDevices: '📱 У вас пока нет устройств.\n\n/add - Добавить устройство',
    enterDeviceName: '📛 Введите название устройства:',
    invalidDeviceName: '❌ Неверное название. Попробуйте снова:',
    selectOS: '💻 Выберите ОС:',
    osSelected: '✅ ОС выбрана: {os}\n\n📝 Введите описание (или "-"):',
    yourKey: '🔑 Ваш ключ:',
    totalDevices: '📱 Всего: {count} устройств',

    // Delete/Rename
    confirmDelete: '🗑 Удалить *{name}*?',
    yesDelete: '✅ Да, удалить',
    noCancel: '❌ Нет',
    cancelled: '❌ Отменено',
    enterNewName: '✏️ Введите новое название для *{name}*:',
    nameTooShort: '❌ Минимум 2 символа. Попробуйте снова:',

    // Buttons
    btnAdd: '➕ Добавить устройство',
    btnDevices: '📱 Мои устройства',
    btnStats: '📊 Статистика',
    btnLang: '🌐 Язык',
    btnHelp: '❓ Помощь',
    btnBack: '⬅️ Назад',
    btnRename: '✏️ Переименовать',
    btnDelete: '🗑 Удалить',
    btnShutdown: '⏹ Выключить',
    btnRestart: '🔄 Перезагрузить',
    btnLock: '🔒 Заблокировать',

    // Stats
    stats:
      '📊 *Статистика*\n\n📱 *Устройства:* {total}\n   🟢 Active: {active}\n   🟡 Pending: {pending}\n   🔴 Inactive: {inactive}\n\n🔔 *Всего алертов:* {alerts}\n\n📅 Регистрация: {date}',

    // Lang
    selectLang: '🌐 Выберите язык:',
    langChanged: '✅ Язык изменён: Русский',

    // Alert
    deviceConnected:
      '✅ *Устройство подключено!*\n\n📍 Устройство: {device}\n👤 Пользователь: {user}\n🕐 Время: {time}\n\nТеперь вы будете получать уведомления 📱',
    devicePowerOn:
      '⚠️ *Компьютер включён!*\n\n📍 Устройство: {device}\n👤 Пользователь: {user}\n🕐 Время: {time}',
    deviceOffline:
      '⚠️ *Устройство офлайн!*\n\n📍 Устройство: {device}\n🕐 Последний сигнал: {time}\n\nПроверьте:\n• Включён ли компьютер?\n• Есть ли интернет?\n• Работает ли скрипт?',

    // Help
    help: `🛡 Himoyachi Bot - Помощь

Основные команды:
/start - Запустить бота
/add - Добавить устройство
/list - Мои устройства
/stats - Статистика
/lang - Сменить язык
/setup - Инструкция настройки
/help - Помощь

Как это работает?
1) Добавьте устройство через /add
2) Бот даст вам ключ
3) При включении компьютера — получите уведомление

Вопросы: @odilov07ko`,
  },

  en: {
    welcome: '👋 Hello, {name}!\n\nHimoyachi Bot - monitor your computer.',
    error: '❌ An error occurred',
    startFirst: '❌ Please /start first',
    menu: '📋 Menu:',

    // Device
    deviceAdded: '✅ Device added!',
    deviceDeleted: '✅ Device deleted!',
    deviceNotFound: '❌ Device not found',
    deviceRenamed: '✅ Device renamed: *{name}*',
    noDevices: '📱 You have no devices yet.\n\n/add - Add a device',
    enterDeviceName: '📛 Enter device name:',
    invalidDeviceName: '❌ Invalid name. Try again:',
    selectOS: '💻 Select OS:',
    osSelected: '✅ OS selected: {os}\n\n📝 Enter description (or "-"):',
    yourKey: '🔑 Your key:',
    totalDevices: '📱 Total: {count} devices',

    // Delete/Rename
    confirmDelete: '🗑 Delete *{name}*?',
    yesDelete: '✅ Yes, delete',
    noCancel: '❌ No',
    cancelled: '❌ Cancelled',
    enterNewName: '✏️ Enter new name for *{name}*:',
    nameTooShort: '❌ Minimum 2 characters. Try again:',

    // Buttons
    btnAdd: '➕ Add device',
    btnDevices: '📱 My devices',
    btnStats: '📊 Statistics',
    btnLang: '🌐 Language',
    btnHelp: '❓ Help',
    btnBack: '⬅️ Back',
    btnRename: '✏️ Rename',
    btnDelete: '🗑 Delete',
    btnShutdown: '⏹ Shutdown',
    btnRestart: '🔄 Restart',
    btnLock: '🔒 Lock',

    // Stats
    stats:
      '📊 *Statistics*\n\n📱 *Devices:* {total}\n   🟢 Active: {active}\n   🟡 Pending: {pending}\n   🔴 Inactive: {inactive}\n\n🔔 *Total alerts:* {alerts}\n\n📅 Registered: {date}',

    // Lang
    selectLang: '🌐 Select language:',
    langChanged: '✅ Language changed: English',

    // Alert
    deviceConnected:
      '✅ *Device connected!*\n\n📍 Device: {device}\n👤 User: {user}\n🕐 Time: {time}\n\nYou will now receive notifications 📱',
    devicePowerOn:
      '⚠️ *Computer turned on!*\n\n📍 Device: {device}\n👤 User: {user}\n🕐 Time: {time}',
    deviceOffline:
      '⚠️ *Device offline!*\n\n📍 Device: {device}\n🕐 Last signal: {time}\n\nPlease check:\n• Is the computer on?\n• Is there internet?\n• Is the script running?',

    // Help
    help: `🛡 Himoyachi Bot - Help

Main commands:
/start - Start the bot
/add - Add a device
/list - My devices
/stats - Statistics
/lang - Change language
/setup - Setup instructions
/help - Help

How it works?
1) Add a device via /add
2) Bot gives you a key
3) When computer turns on — you get notified

Questions: @odilov07ko`,
  },
};

export type Lang = 'uz' | 'ru' | 'en';
export type MessageKey = keyof typeof messages.uz;

export function t(
  lang: Lang,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  let text = messages[lang]?.[key] || messages.uz[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return text;
}
