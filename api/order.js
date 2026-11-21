export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  try {
    const { name, phone, city, comment, items, total } = req.body || {};
    if (!name || !phone || !city || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ok:false,error:'Заполните обязательные поля и добавьте товар.'});
    }
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_OWNER_CHAT_ID;
    if (!token || !chatId) return res.status(500).json({ok:false,error:'Telegram не настроен на сервере.'});
    const lines = items.map(i => `• ${i.name} × ${i.qty} — ${i.subtotal} ₽`).join('\n');
    const text = `🛍 НОВЫЙ ЗАКАЗ — «Маленькие открытия»\n\n${lines}\n\n💰 Итого: ${total} ₽\n\n👤 Имя: ${name}\n📞 Телефон/Telegram: ${phone}\n📍 Город: ${city}\n💬 Комментарий: ${comment || '—'}`;
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({chat_id:chatId,text})
    });
    const data = await tg.json();
    if (!data.ok) return res.status(502).json({ok:false,error:'Telegram: ' + (data.description || 'Неизвестная ошибка')});
    return res.status(200).json({ok:true});
  } catch (e) { return res.status(500).json({ok:false,error:'Ошибка сервера.'}); }
}
