# DNS Muammosini Avtomatik Tuzatish
# Administrator huquqi kerak!

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🔧 DNS AVTOMATIK TUZATISH                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Administrator tekshiruvi
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ XATO: Bu script Administrator huquqi bilan ishga tushirilishi kerak!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Qanday ishga tushirish:" -ForegroundColor Yellow
    Write-Host "1. PowerShell ni o'ng tugma bilan bosing" -ForegroundColor Yellow
    Write-Host "2. 'Run as Administrator' ni tanlang" -ForegroundColor Yellow
    Write-Host "3. Ushbu scriptni qayta ishga tushiring" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Administrator huquqi tasdiqlandi" -ForegroundColor Green
Write-Host ""

# Barcha network adapterlarni olish
Write-Host "🔍 Network adapterlarni qidiryapman..." -ForegroundColor Cyan
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }

if ($adapters.Count -eq 0) {
    Write-Host "❌ Faol network adapter topilmadi!" -ForegroundColor Red
    Write-Host "Wi-Fi yoki Ethernet ulanishini tekshiring" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Topilgan adapterlar: $($adapters.Count)" -ForegroundColor Green
Write-Host ""

foreach ($adapter in $adapters) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "📡 Adapter: $($adapter.Name)" -ForegroundColor Cyan
    Write-Host "   Status: $($adapter.Status)" -ForegroundColor White
    Write-Host "   Interface: $($adapter.InterfaceDescription)" -ForegroundColor White
    
    try {
        # Hozirgi DNS ni ko'rsatish
        $currentDNS = Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4
        Write-Host "   Hozirgi DNS: $($currentDNS.ServerAddresses -join ', ')" -ForegroundColor Yellow
        
        # Google DNS ni o'rnatish
        Write-Host "   🔧 Google DNS o'rnatilmoqda..." -ForegroundColor Cyan
        Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ServerAddresses ("8.8.8.8", "8.8.4.4")
        
        # Yangi DNS ni tekshirish
        $newDNS = Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4
        Write-Host "   ✅ Yangi DNS: $($newDNS.ServerAddresses -join ', ')" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Xato: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# DNS Cache ni tozalash
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🧹 DNS Cache tozalanmoqda..." -ForegroundColor Cyan

try {
    ipconfig /flushdns | Out-Null
    Write-Host "✅ DNS Cache tozalandi" -ForegroundColor Green
} catch {
    Write-Host "⚠️  DNS Cache tozalashda xato" -ForegroundColor Yellow
}

Write-Host ""

# DNS ni qayta ro'yxatdan o'tkazish
Write-Host "🔄 DNS qayta ro'yxatdan o'tkazilmoqda..." -ForegroundColor Cyan

try {
    ipconfig /registerdns | Out-Null
    Write-Host "✅ DNS qayta ro'yxatdan o'tkazildi" -ForegroundColor Green
} catch {
    Write-Host "⚠️  DNS qayta ro'yxatdan o'tkazishda xato" -ForegroundColor Yellow
}

Write-Host ""

# Test
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🧪 DNS test qilinmoqda..." -ForegroundColor Cyan
Write-Host ""

# Google.com test
try {
    $googleTest = Resolve-DnsName -Name "google.com" -Type A -ErrorAction Stop
    Write-Host "✅ Google.com: Ishlayapti" -ForegroundColor Green
    Write-Host "   IP: $($googleTest[0].IPAddress)" -ForegroundColor White
} catch {
    Write-Host "❌ Google.com: Ishlamayapti" -ForegroundColor Red
}

Write-Host ""

# MongoDB Atlas test
try {
    $mongoTest = Resolve-DnsName -Name "cloud.mongodb.com" -Type A -ErrorAction Stop
    Write-Host "✅ MongoDB Atlas: Ishlayapti" -ForegroundColor Green
    Write-Host "   IP: $($mongoTest[0].IPAddress)" -ForegroundColor White
} catch {
    Write-Host "❌ MongoDB Atlas: Ishlamayapti" -ForegroundColor Red
}

Write-Host ""

# Xulosa
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  ✅ TAYYOR!                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "DNS sozlamalari o'zgartirildi!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Keyingi qadamlar:" -ForegroundColor Yellow
Write-Host "1. Kompyuterni restart qiling (tavsiya etiladi)" -ForegroundColor White
Write-Host "2. MongoDB Atlas da IP whitelist qo'shing:" -ForegroundColor White
Write-Host "   → https://cloud.mongodb.com" -ForegroundColor Cyan
Write-Host "   → Network Access → Add IP: 0.0.0.0/0" -ForegroundColor Cyan
Write-Host "3. Serverni ishga tushiring:" -ForegroundColor White
Write-Host "   → npm start" -ForegroundColor Cyan
Write-Host ""

pause
