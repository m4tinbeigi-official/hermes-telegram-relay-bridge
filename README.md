<p align="center">
  <a href="https://devsponsors.github.io">
    <img src="https://devsponsors.github.io/assets/badges/sponsor.svg" alt="DevSponsors Badge">
  </a>
</p>

# Hermes Telegram Relay Bridge 🚀

یک راهکار سبک و پایدار برای متصل کردن **Hermes Agent** به **تلگرام** در سرورهایی که با محدودیت شبکه یا فیلترینگ تلگرام (`api.telegram.org`) مواجه هستند، با استفاده از سیستم رله کلادفلر (Cloudflare Worker Relay).

---

## 💡 داستان و نحوه کارکرد (Architecture)

هنگامی که هرمس روی سرورهای داخلی یا محدود راه‌اندازی می‌شود، درخواست‌های مستقیم آن به `https://api.telegram.org` به دلیل قطع بودن پورت یا دامنه با `ConnectTimeout` مواجه می‌شوند.

این پروژه یک **پل دو مرحله‌ای (Two-Hop Bridge)** ایجاد می‌کند:
1. **Local Bridge Server (Node.js):** یک سرور محلی سبک روی پورت `8081` بالا می‌آورد.
2. **Cloudflare Worker Relay:** این بریج، هدرهای لازم (`x-relay-target` و `x-relay-path` و `Host`) را تنظیم کرده و ترافیک را به یک ورکر رله ارسال می‌کند.
3. **Hermes Agent:** با تغییر `platforms.telegram.base_url` به `http://127.0.0.1:8081/bot`، تمام ارتباطات ربات (اعم از Polling و ارسال پیام‌ها) به راحتی و با سرعت بالا بدون نیاز به وی‌پی‌ان‌های سنگین رد و بدل می‌شود.

```text
[ Telegram App ] 
       ▲
       │
[ Telegram Bot API ]
       ▲
       │
[ Cloudflare Relay Worker ]
       ▲
       │ (HTTPS with x-relay-target)
[ Local Bridge (bridge.js) ] (127.0.0.1:8081)
       ▲
       │
[ Hermes Agent Gateway ]
```

---

## 🛠️ ساختار فایل‌ها

- `bridge.js`: کد سرور بریج محلی Node.js (بدون نیاز به نصب پکیج‌های سنگین اضافی).
- `cloudflare-worker.js`: کد نمونه برای ساخت Cloudflare Worker اختصاصی.
- `setup.sh`: اسکریپت راه‌اندازی خودکار و دائمی کردن سرویس در سرور.

---

## 🚀 راهنمای نصب و راه‌اندازی سریع

### ۱. اجرای پل ارتباطی (Bridge)
کافیست پروژه را دانلود کرده و اسکریپت را اجرا کنید:

```bash
git clone https://github.com/<your-username>/hermes-telegram-relay-bridge.git
cd hermes-telegram-relay-bridge
chmod +x setup.sh
./setup.sh
```

یا به‌صورت دستی با Node:
```bash
node bridge.js
```

### ۲. تنظیم Hermes Agent

توکن ربات تلگرام و آیدی عددی خود را در فایل `~/.hermes/.env` قرار دهید:
```env
TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
TELEGRAM_ALLOWED_USERS="your_numeric_telegram_user_id"
```

سپس دستورات زیر را در ترمینال بزنید تا تلگرام فعال شده و به بریج متصل گردد:
```bash
# ۱. فعال‌سازی پلتفرم تلگرام
hermes config set platforms.telegram.enabled true

# ۲. هدایت آدرس پایه تلگرام به بریج محلی
hermes config set platforms.telegram.base_url "http://127.0.0.1:8081/bot"

# ۳. راه‌اندازی یا ری‌استارت گیت‌وی
hermes gateway restart
```

---

## 🌐 ایجاد Cloudflare Worker اختصاصی (اختیاری)

اگر تمایل دارید ورکر رله اختصاصی خودتان را داشته باشید:
1. در داشبورد [Cloudflare](https://dash.cloudflare.com) به بخش **Workers & Pages** بروید.
2. یک Worker جدید بسازید و کد موجود در `cloudflare-worker.js` را داخل آن قرار دهید و Deploy کنید.
3. در فایل `bridge.js` متغیر `RELAY_HOST` را با آدرس دامنه ورکر خود جایگزین کنید:
   ```javascript
   const RELAY_HOST = process.env.RELAY_HOST || 'your-worker.your-subdomain.workers.dev';
   ```

---

## 🔄 راه‌اندازی خودکار پس از ریبوت سرور

برای اطمینان از اینکه پس از ریستارت سرور بریج متوقف نمی‌شود:
```bash
(crontab -l 2>/dev/null; echo "@reboot nohup node /path/to/bridge.js >/dev/null 2>&1 &") | crontab -
```

---

## 📄 لایسنس
MIT
