## Adımlar
1. Sunucuya Bağlanma ve Dosyayı Açma
- SSH ile DigitalOcean droplet’ınıza bağlanacağım.
- `\var\www\odanet-backend\src\server\server.ts` dosyasını açıp `app.listen(...)` satırını bulacağım.

2. Bind Adresini Güncelleme
- Satırı `app.listen(PORT, "0.0.0.0", () => { ... })` formatına dönüştüreceğim.
- Gerekirse log satırını tam olarak şu şekilde güncelleyeceğim: `Backend running at http://0.0.0.0:4000`.

3. Derleme ve Yeniden Başlatma
- `cd /var/www/odanet-backend`
- `npm run build`
- `pkill node`
- `npm run start`

4. Doğrulama
- Terminalde beklenen mesajı doğrulayacağım: `Backend running at http://0.0.0.0:4000`.
- Dış erişim testi için droplet IP’si/alan adınız üzerinden `http://<IP veya domain>:4000` isteği atarak erişilebilirliği kontrol edeceğim (gerekirse `curl` ile `health` veya `login` endpoint’i test edilir).

5. Ağ ve Güvenlik Kontrolleri (Gerekirse)
- Sunucu tarafında `ufw` veya DigitalOcean Firewall üzerinde 4000/tcp inbound kuralı açık mı kontrol edeceğim.
- Eğer Nginx/Proxy kullanıyorsanız, upstream yönlendirmesi ve izinli portlar doğru mu diye bakacağım. (Bu adım sadece dış erişim hâlâ başarısızsa uygulanır.)

6. Sonuç Paylaşımı
- Tüm adımların çıktılarını ve doğrulama sonucunu ileteceğim.
- Login akışının çalıştığını dışarıdan bir istekle doğrulayıp raporlayacağım.

## Notlar
- `PORT` değeriniz farklıysa (örn. `.env` içinden geliyorsa), mevcut değeri koruyarak yalnızca host’u `0.0.0.0` yapacağım.
- Mevcut `app.listen` satırı başka bir yardımcı fonksiyon veya wrapper içindeyse, ilgili çağrıda host parametresini güncelleyeceğim.
- Herhangi bir hata durumunda değişiklikleri geri alıp alternatif çözümler (ör. proxy/Nginx yapılandırması) uygulamaya hazırım.

Onayınızdan sonra hemen uygulamaya geçebilirim.