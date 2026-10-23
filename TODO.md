# LUXA AI — Geliştirme Durumu

## İlk aşama: Responsive Türkçe sohbet arayüzü

- [x] Marka adı `LUXA AI`, slogan `Yapay zekâ, daha doğal.` ve mevcut görsel sistem korunur.
- [x] Açık/koyu tema, masaüstü düzeni, mobil kenar çubuğu ve responsive sohbet arayüzü çalışır.
- [x] Yeni sohbet, mesaj yazma alanı ve gönderme düğmesi çalışır.

## İkinci aşama: Sunucu tarafı Manus LLM bağlantısı

- [x] Mevcut proje incelendi; yeni proje oluşturulmadı ve mevcut tasarım yeniden yapılmadı.
- [x] WebDev yapılandırmasında `server:true`, `database:false` ve AI capability durumu doğrulandı.
- [x] En ekonomik kullanılabilir model olarak doğrulanmış `gemini-3.5-flash-lite` sunucu kodunda seçildi.
- [x] Sunucu tarafı `POST /api/chat` endpointi eklendi.
- [x] Manus platform kimlik bilgileri yalnızca sunucu ortamından okunur; istemci koduna anahtar veya Authorization başlığı çıkarılmaz.
- [x] İstemci, mevcut sohbet görünümünü koruyarak `/api/chat` endpointine mesaj geçmişi gönderir.
- [x] Gerçek yanıt geldiğinde asistan mesajı kullanıcıya gösterilecek şekilde bağlantı akışı uygulandı.
- [x] Yapılandırma, yetkilendirme, limit, zaman aşımı, ağ ve boş yanıt durumları için anlaşılır hata akışları eklendi.
- [x] `/health` ve statik dosya servisleri AI çağrısı yapmadan doğrulandı.
- [x] Geçersiz `/api/chat` isteği AI çağrısı yapılmadan `400` hata yanıtıyla doğrulandı.
- [x] JavaScript sözdizimi, package manifesti ve istemci tarafı gizli bilgi taraması başarılı.
- [ ] Gerçek LLM completion çağrısı yapılmadı; kullanım maliyeti doğurabileceği için kullanıcı onayı bekleniyor.
- [ ] Kısa Türkçe test mesajı ve ikinci bağlam testi yapılmadı.
- [ ] Yayınlama yapılmadı; sohbet geçmişi veritabanı ve alan adı kapsam dışı tutuldu.

## Üçüncü aşama: Brave Search web araması

- [x] Brave Search API anahtarı güvenli sunucu secret alanına kaydedildi; frontend, `app.js`, tarayıcı, loglar ve hata mesajları anahtarı içermez.
- [x] Normal sohbetlerde mevcut Gemini `/api/chat` akışı korunur; yalnızca güncel bilgi veya internet araştırması gerektiğinde web araması çalışır.
- [x] Web araması gerektiğinde Brave Search sonuçlarından başlık, kısa açıklama, kaynak adı ve orijinal URL alınır; sonuçlar Gemini yanıtına güvenli bağlam olarak sunulur.
- [x] LUXA yanıtında ilgili kaynak bağlantıları gösterilir; istemci kaynak URL’lerini güvenli DOM API ile tıklanabilir kartlara dönüştürür.
- [x] Brave API planını korumak için uygulama içi günlük arama sınırı, 8 saniye zaman aşımı, 5 sonuç üst sınırı ve 401/403/429/5xx hata yönetimi uygulandı; ücretli plana otomatik geçiş veya ödeme başlatılmadı.
- [x] Tek kontrollü güncel bilgi testi yapıldı: `/health` `braveConfigured:true` döndürdü; birleşik test `HTTP 200`, `webSearched:true`, 5 kaynak ve 5 geçerli HTTP(S) URL döndürdü.
- [x] Aynı birleşik testte Gemini’den gerçek LUXA yanıtı alındı; mevcut Gemini sohbet akışının çalıştığı doğrulandı.
- [ ] Brave Search plan panelindeki gerçek kalan bakiye bu ortamdan okunmadı; testte 1 arama isteği kullanıldı.
- [ ] Yayınlama yapılmadı; sohbet geçmişi veritabanı ve alan adı kapsam dışı tutuldu.

## Brave Search son düzeltme ve doğrulama

- [x] Kullanıcının amacı veya güncellik ihtiyacı açıkça internet araştırması gerektirmedikçe Brave çağrılmaz; basit selamlaşma, günlük sohbet, şiir, çeviri, düzenleme, matematik ve genel kod açıklamalarında arama yapılmaz.
- [x] Güncel haber, son durum, en son gelişmeler, güncel fiyat ve açık internet araştırması isteklerinde en fazla bir Brave çağrısı yapılır.
- [x] Başarılı arama açıkça modele bildirilir; başlık, açıklama, URL ve API tarafından sağlanan tarih alanı varsa kaynak bağlamına eklenir.
- [x] Model, sağlanan kaynaklara dayanır; kaynakların desteklemediği bilgileri uydurmaz ve başarılı aramada canlı arama yapamıyormuş gibi davranmaz.
- [x] Arama başarısız veya sonuçsuz olduğunda kullanıcıya dürüst ve özel hata bilgisi verilir; Gemini’ye kaynaksız güncel yanıt ürettirilmez.
- [x] `webSearched` yalnızca gerçek ve yeterli arama sonucu elde edildiğinde `true` olur; kaynak kartları korunur.
- [x] Mevcut 8 saniye timeout, 5 sonuç sınırı, günlük 20 arama sınırı, tek mesajda tek arama ve otomatik tekrar yapmama davranışı korunur.
- [x] Mock/statik testlerle basit mesajlarda 0, güncel araştırma isteklerinde en fazla 1 arama kararı doğrulanır; ek gerçek API çağrısı onaysız yapılmaz.
- [x] Yayınlama, ödeme, otomatik yükleme ve yeni kalıcı kota altyapısı yapılmaz; süreç belleğindeki sayacın yeniden başlatmada sıfırlanma riski raporlanır.

## Yanıt token sınırı düzeltmesi

- [x] `gemini-3.5-flash-lite` için mevcut `max_completion_tokens: 500` sınırı, kaynak listesi tamamlanmadan kesilmeyi önlemek üzere yalnızca `900` olarak güncellendi.
- [x] `reasoning_effort: "none"`, Brave arama kararı, kaynak kartları, kota, timeout ve secret yönetimi değiştirilmedi.
- [x] Gerçek Gemini/Exa çağrısı yapılmadan sözdizimi, parametre, URL bütünlüğü ve secret sızıntısı kontrolleri çalıştırıldı.

## Genel amaçlı akıllı arama ve doğal sohbet iyileştirmeleri

- [x] Konuşma bağlamına dayalı takip soruları, ülke ve yanıt dili çıkarımı, dünya geneli arama tercihi ve arama niyeti için Unicode uyumlu Türkçe eşleştirme uygulandı.
- [x] Basit sohbet, selamlaşma, şiir, çeviri, düzenleme, matematik ve genel kod açıklamalarında arama kararı korunurken güncel ve açık araştırma istekleri için en fazla bir Brave araması korunur.
- [x] Normal sohbetlerde web araması yapılmadığı ve arama başarısız/sonuçsuz durumlarının ayrı durum alanlarıyla istemciye aktarıldığı doğrulandı.
- [x] Gemini yanıtının `finish_reason` değeri hassas veri içermeden güvenli sunucu kaydına eklendi; kaynak URL'leri model metninden bağımsız gerçek Brave sonuçlarından korunur.
- [x] Kaynak kartlarına açıklama ve geçerli yayın tarihi gösterimi eklendi; mevcut başlık, kaynak adı ve tam URL korunur.
- [x] 19 arama niyeti mock senaryosu, takip bağlamı, sorgu oluşturma, ülke/dil çıkarımı, sözdizimi, diff ve secret sızıntısı kontrolleri başarıyla geçti.
- [ ] Canlı geliştirme sunucusu ve önizleme görsel kontrolü bu oturumun kalan adımıdır; gerçek Gemini/Exa çağrısı bu doğrulama kapsamında yeniden yapılmaz.

## Mobil metin kopyalama düzeltmesi

- [x] `app.js` ve `styles.css` incelendi; `contextmenu`, `selectstart`, `touchstart` veya `touchend` engelleyicisi ve `user-select:none` / `-webkit-touch-callout:none` kuralı bulunmadı.
- [x] Yanıt metni gerçek `.message-bubble` DOM düğümünde `textContent` olarak oluşturuluyor; yalnızca bu düğümde `user-select:text`, `-webkit-user-select:text` ve `-webkit-touch-callout:default` açıkça etkinleştirildi.
- [x] `server.mjs`, Gemini/Exa/Brave entegrasyonu, kaynak bağlantıları, sohbet kaydırması ve mesaj gönderme mantığı değiştirilmedi.
- [x] JavaScript sözdizimi, diff ve seçim engelleyici taraması geçti; önizlemede hesaplanan `userSelect:text` değeri doğrulandı.
- [ ] Gerçek Android Chrome cihazında uzun basma ve yerleşik “Kopyala” menüsü testi yapılmadı.

## Gemini ana sağlayıcı hazırlığı

- [x] Önceki `6a03e76` checkpoint'i korunarak sunucu tarafında Gemini normal sohbet çağrı katmanı hazırlandı; `GEMINI_API_KEY` yalnızca `server.mjs` içindeki sunucu ortamından okunuyor.
- [x] `/api/chat` ve mevcut frontend yanıt sözleşmesi korundu; normal sohbetlerde Google Search grounding çağrılmıyor.
- [x] Gemini `gemini-2.5-flash-lite` modeli ve `maxOutputTokens: 900` hazırlanan istekte tanımlandı; Gemini rolleri `user`/`model` olarak eşleniyor.
- [x] Google Search grounding yalnızca `GEMINI_SEARCH_GROUNDING_ENABLED=true` ve `GEMINI_SEARCH_BILLING_CONFIRMED=true` birlikte sağlanırsa etkinleşiyor; mevcut ortamda kapalı.
- [x] Gemini `groundingChunks`, `groundingSupports`, gerçek HTTP(S) URL doğrulaması, tekrar kaynak temizleme ve citation indeks eşleme kodu hazırlandı.
- [x] Grounding kapalıyken mevcut Brave arama yolu güncel sorgular için korunuyor ve Brave bağlamı Gemini yanıtına verilebiliyor; Gemini çağrı yolu kaldırıldı; Gemini tek AI sağlayıcısı olarak kullanılıyor.
- [x] Normal sohbet, Gemini body/role mapping, grounding kapalı koruma, mock grounding metadata, citation mapping, geçersiz URL filtreleme, hata durumları, sözdizimi ve secret sızıntısı kontrolleri canlı API çağrısı olmadan geçti.
- [x] `/health` ve `/manus-routes.json` ücretsiz kontrolü başarılı; Gemini yapılandırılmış, grounding kapalı, Gemini ve Exa yapılandırmaları korunmuş görünüyor.
- [ ] Gemini’ye gerçek normal sohbet çağrısı, gerçek Google Search grounding çağrısı, gerçek kaynak URL’leri ve ücret/kota davranışı henüz doğrulanmadı.

## Google Search grounding hazırlığı

- [x] `gemini-3.5-flash-lite` modelinin resmi Gemini belgelerinde Google Search grounding desteklediği doğrulandı.
- [x] Gemini REST isteğinde resmi `tools: [{ google_search: {} }]` yolu ve mevcut `groundingMetadata` kaynak/citation normalizasyonu korundu.
- [x] Grounding yalnızca `shouldSearchWeb()` güncel bilgi veya açık araştırma niyeti verdiğinde seçilir; normal sohbet ve selamlaşmalar grounding kullanmaz.
- [x] Grounding özelliği kod düzeyinde etkinleştirildi; ancak `GEMINI_SEARCH_BILLING_CONFIRMED=true` olmadan gerçek grounding çağrısı güvenlik nedeniyle kapalı kalır.
- [x] Gemini kaynak URL’leri yalnızca gerçek HTTP(S) `groundingChunks.web.uri` metadata’sından alınır; metadata veya geçerli kaynak yoksa kullanıcıya doğrulanmamış güncel yanıt verilmez.
- [x] Google’ın resmi fiyat sayfasında `gemini-3.5-flash-lite` için Free tier grounding’in kullanılamadığı, Paid tier’de aylık 5.000 arama isteğinin ücretsiz olduğu ve sonrasında 14 USD/1.000 arama sorgusu ücretlendirildiği doğrulandı.
- [ ] Bu proje için gerçek aktif kota/billing ekranı bu ortamdan doğrulanamadı; canlı Google Search grounding testi yapılmadı ve billing değiştirilmedi.

## Exa web araması hazırlığı

- [x] `EXA_API_KEY` Development secret’ı güvenli giriş kartıyla kaydedildi ve değeri gösterilmeden runtime’a senkronize edildi; mevcut Gemini, Brave ve Gemini secret’larına dokunulmadı.
- [x] `exa-search.mjs` ayrı sunucu modülü olarak eklendi; Exa REST Search isteği, timeout, HTTP hata eşleme, sanitized log kodu, gerçek HTTP(S) URL filtresi, başlık, içerik özeti ve yayın tarihi normalizasyonu içeriyor.
- [x] `server.mjs` içinde `EXA_SEARCH_ENABLED` kalıcı olarak etkinleştirildi; yalnızca açıkça `EXA_SEARCH_ENABLED=false` verilirse eski Brave yolu seçilir.
- [x] Exa etkinken güncel arama isteğinde yalnızca Exa çağrılır; Exa hata verir veya sonuç döndürmezse Brave otomatik olarak çağrılmaz. Brave kodu ve secret’ı geri alma için korunur. Normal sohbetler arama yapmaz.
- [x] Mock HTTP testleriyle normal sohbet, Exa sonuçlarının Gemini’ye bağlam ve gerçek kaynak URL’si olarak aktarılması, Exa hatasında Brave fallback, kaynak URL filtresi, timeout/hata sözleşmesi ve kaynak kartı veri şekli doğrulandı.
- [x] `node --check` (`server.mjs`, `exa-search.mjs`, `app.js`), `git diff --check`, frontend secret taraması ve WebDev JavaScript diagnostics kontrolleri geçti.
- [ ] Exa hesabının gerçek kalan ücretsiz kredisi ve billing katmanı bu ortamdan doğrulanmadı; önceki tek canlı test başarılıydı. Kalıcı etkinleştirme kullanıcı onayıyla yapıldı; yeni canlı test tekrarlanmadı.

## Son kullanıcı test düzeltmeleri

- [x] İlk Exa aramasından dönen gerçek başlık, açıklama, yayın tarihi ve URL alanları frontend konuşma geçmişindeki assistant mesajıyla birlikte sonraki `/api/chat` isteklerine taşınıyor.
- [x] “En önemlisi hangisi?” gibi takip sorularında önceki gerçek kaynak bağlamı Gemini’ye yeniden veriliyor; aynı kaynak kartları gereksiz yere tekrarlanmıyor.
- [x] Kullanıcı açıkça kaynak/bağlantı istediğinde ilk aramada kullanılan gerçek URL’ler yeniden gösteriliyor; yeni URL uydurulmuyor ve Exa tekrar çağrılmıyor.
- [x] Gemini timeout bütçesi Exa araması + Gemini yanıtı + istemci timeout sırasına göre uyumlandı (`55s` Gemini, `70s` istemci); timeout/ağ hataları yalnızca güvenli aşama koduyla sunucuya kaydediliyor.
- [x] Kullanıcıya teknik sağlayıcı veya timeout metni gösterilmiyor; hata metni tam olarak `LUXA AI yanıt veremedi. Tekrar dene.` ve tek kullanımlık `Tekrar dene` eylemiyle gösteriliyor.
- [x] Normal mesaj, kaynak kartı, mobil responsive stil, Exa etkinliği ve Brave’in otomatik arama dışı kalması korunuyor.
- [x] Mock kaynak takip akışı, URL korunumu, Exa çağrı sayısı, source-card tekrar azaltma, timeout HTTP sözleşmesi, güvenli log, frontend generic hata ve tek retry davranışı doğrulandı.
- [x] “Haberlerden en önemlisini seçmesini iste” gibi Türkçe ek almış takip ifadeleri için niyet algılama düzeltildi ve aynı mock akışında yeniden doğrulandı.
- [x] Kaynak isteyen “Kullandığın kaynakları tıklanabilir bağlantılarla göster” kalıbı ve “neden önemli?” takip sorusu mevcut gerçek kaynakları yeniden kullanacak şekilde genişletildi.
- [x] Gemini model geçmişi son 12 mesaj ve mesaj başına 4.000 karakterle sınırlandırıldı; kaynak kayıtları ayrı yapılandırılmış alanlardan aktarılmaya devam ediyor.
- [x] Gemini timeoutu `55s`, istemci timeoutu `70s` olarak ayarlandı; Exa’nın `8s` arama bütçesiyle toplam akış istemci tarafından erken kesilmiyor.
- [x] Üç mesajlı mock kabul akışında ilk Exa araması, kaynaklı takip sorusu ve açık kaynak bağlantısı isteği başarıyla tamamlandı; Exa yalnızca bir kez çağrıldı ve ilk gerçek URL korundu.
- [x] Normal sohbet, genel bilgi ve uzun analiz mock akışlarında Exa çağrılmadı; yalnızca Gemini çağrıldı.
- [x] Retry koruması, tam kullanıcı hata metni, istemci secret taraması, son sağlık endpoint’i, rota manifesti ve önizleme DOM kontrolleri tamamlandı.
- [x] Sunucu, assistant ile başlayan, art arda aynı role sahip veya assistant ile biten bozuk geçmişleri Gemini’ye göndermeden `invalid_messages` olarak reddediyor.
- [x] Sağlayıcı 4xx/5xx, timeout ve network hata kayıtlarına yalnızca durum kodu, sanitize edilmiş hata kodu, mesaj sayısı ve kaynak bağlamı uzunluğu ekleniyor; kullanıcı içeriği ve secret’lar kaydedilmiyor.
- [x] Gerçek Gemini/Exa akışıyla çelişen eski “Prototip modu / AI bağlantısı bekleniyor” metinleri kaldırıldı; arayüzde teknik olmayan LUXA AI marka metinleri kullanılıyor.
- [ ] Önceki `503 UNAVAILABLE` kayıtlarının sağlayıcı kaynaklı mı yoksa proje/runtime kaynaklı mı olduğu yeni canlı çağrı yapılmadan kesinleştirilemedi.

## Prompt mimarisi ve canlı haber fallback düzeltmesi

- [x] Gemini system instruction ve gerçek kaynak bağlamına, canlı arama altyapısına sahip LUXA kimliğini ve internet erişimi yokluğu kalıplarını kullanmama sert kuralı eklendi.
- [x] Exa/Brave araması hata, timeout veya boş sonuç verdiğinde `/api/chat` artık erken `502` dönmek yerine Gemini'yi kontrollü genel bilgi fallback talimatıyla çağırır; doğrulanmamış güncel ayrıntılar kaynak veya URL uydurulmadan sınırlandırılır.
- [x] Anlık haber kalıpları (`Bugün ... ne oldu?`, `son dakika`, `güncel haberler`) kesin arama niyeti olarak ayrıştırıldı ve sorguya gün/son dakika/haber gelişmeleri bağlamı eklendi.
- [x] Gemini yanıt katmanında yaygın internet erişimi reddi kalıpları güvenli biçimde doğrulama belirsizliği ifadesine dönüştürülür; frontend'in kullanıcıya gösterdiği teknik hata sözleşmesi korunur.
- [x] Mock doğrulama: İstanbul güncel haber sorgusu, Exa boş sonuç sonrası Gemini fallback, sert prompt kuralı, optimize sorgu, 2 Exa + 2 Gemini çağrı sırası ve yasak kalıp filtresi geçti.
- [x] Canlı doğrulama: `Bugün İstanbul'da neler oldu?` ve `Güncel haberler nedir?` tek kontrollü testlerle HTTP 200, Exa sağlayıcısı, gerçek kaynaklı yanıt ve yasak kalıp içermeyen Gemini çıktısı verdi.

## Cold-start zorunlu arama ve strict canlı bağlam

- [x] Güncel haber, anlık olay, “bugün”, “son dakika”, şehir ve “neler oldu” sorguları konuşma geçmişinden bağımsız zorunlu canlı arama olarak sınıflandırıldı.
- [x] Zorunlu sorgularda Exa, Gemini’den önce doğrudan çağrılır; mevcut kaynakların yeniden kullanılması ve Google grounding bu yolu bypass edemez.
- [x] İlk Exa çağrısı boş, hatalı veya üçten az kaynaklı olursa yalnızca bir kez `İstanbul son dakika haberleri` genişletilmiş sorgusuyla retry yapılır.
- [x] Zorunlu sorguda en az üç gerçek kaynak oluşmadan Gemini çağrılmaz; iki deneme de yetersizse `mandatory_search_failed` ile güvenli biçimde durulur.
- [x] Üç mock senaryo ve üç canlı `Bugün İstanbul'da yaşanan olayları açıkla` testi başarıyla tamamlandı; canlı testlerin her birinde Exa ilk çağrı, 5 kaynak ve HTTP 200 doğrulandı.

## Evrensel canlı arama mimarisi

- [x] Sabit haber/şehir/finans/oyun/hava kategorisi listesine bağımlı hard trigger kaldırıldı; karar zamansal ifadeler, değişim sinyalleri, değişken soru biçimleri ve durum/fiyat/skor/sonuç gibi genel dil eklerinden türetiliyor.
- [x] Finans, güncel haber, oyun yaması ve hava durumu örnekleri dahil farklı alanlarda değişken bilgi gerektiren sorgular, taze Exa kaynakları Gemini’ye gönderilmeden önce zorunlu arama olarak işleniyor.
- [x] Saf aritmetik ve güncel veri istemeyen normal sohbet regresyonu korundu; bu akışlarda Exa çağrısı yapılmıyor.
- [x] Üç mock turunda dört dinamik kategori sorgusunun tamamı Exa-first, 5 kaynaklı Gemini bağlamı ve başarılı yanıt ile geçti.
- [x] Final canlı turunda `Borsa bugün kaç`, `guncel haberler tr`, `LoL yeni yama ne zaman` ve `Kadıköy hava durumu` sorgularının tamamı HTTP 200, Exa, 5 kaynak ve `mandatoryLiveSearch=true` ile doğrulandı.

## Compound query handling ve arama bölme

- [x] Tek mesajda birden fazla soru bulunduğunda sorgu; soru işareti, satır sonu, “ve”, “veya”, “bir de” ve “hem de” ayrımlarına göre en fazla dört bağımsız arama sorgusuna bölünüyor.
- [x] Alt sorgular Exa’ya paralel gönderiliyor; kaynaklar URL bazında deduplicate edilip en fazla 10 kaynaklık birleşik Gemini bağlamına aktarılıyor.
- [x] Çoklu sorgularda her alt soru için en az üç kaynak şartı korunuyor; eksik alt sorgu için yalnızca bir retry uygulanıyor ve tamamlanmayan alt sorgu varsa Gemini’ye eksik bağlamla çağrı yapılmıyor.
- [x] Gemini system instruction, çoklu soruları kullanıcı sırasını koruyarak ayrı ve eksiksiz maddeler halinde yanıtlamasını istiyor.
- [x] Mock doğrulama: finans compound query, paralel Exa çağrısı, deduplication, retry ve çoklu soru prompt talimatı geçti.
- [x] Üç tam temiz oturumda toplam altı canlı test geçti: her oturumda Dolar/Gram Altın ve GTA 6/Steam sorguları HTTP 200, iki alt sorgu, Exa, 10 kaynak ve her iki konuya ait yanıtla tamamlandı.

## Yanıt düşünme süresi UI

- [x] `/api/chat`, isteğin başlangıcından başarılı yanıtın tamamlanmasına kadar geçen gerçek süreyi `thinkingDurationMs` olarak döndürüyor; süre için sabit üst sınır uygulanmıyor.
- [x] Frontend, asistan yanıtının hemen üzerinde bağımsız kronometre badge’i gösteriyor; süre metni yanıt metnine karışmıyor.
- [x] Türkçe format: 60 saniyeden kısa sürelerde “LUXA X saniye düşündü”, 60 saniye ve üzerindeyse “LUXA X dakika Y saniye düşündü”.
- [x] Muted ton, küçük kronometre ikonu, erişilebilir `aria-label` ve mevcut açık/koyu tema değişkenleri kullanıldı.
- [x] Mock format testi ve canlı kısa sohbet/Exa araması kabul testi geçti.

## Kaynak kartı UI sınırı

- [x] Backend’in detaylı arama context’i korunuyor; birleşik aramalarda 10 kaynaklık analiz havuzu değişmedi.
- [x] Frontend kaynak kartı render’ında yalnızca `sources.slice(0, 5)` gösteriliyor.
- [x] Canlı kabul testi HTTP 200 ile 10 backend kaynağı ve 5 frontend render kaynağı doğruladı.

## Custom SVG avatar ve branding

- [x] Header ve mobil marka alanındaki metin tabanlı LA işaretleri iki yarım küreli, nöron çizgili neon turkuaz/şampanya beyin SVG ikonlarıyla değiştirildi.
- [x] Asistan mesaj avatarındaki LA kaldırıldı ve aynı AI beyin SVG dili kullanıldı.
- [x] Kullanıcı profil ve mesaj avatarındaki S kaldırıldı; kafa-omuz silüeti SVG ikonu eklendi.
- [x] Marka, profil ve mesaj avatarları dairesel, dikey hizalı ve yumuşak outer glow stilleriyle biçimlendirildi.
- [x] Metin avatarı taraması, syntax, diagnostics ve mobil önizleme görsel kontrolü geçti.

## LUXA AI özel profil görseli

- [x] Kullanıcının sağladığı neon mavi/pembe beyin görseli `/manus-storage/IMG_20261022_104051_f3374eab.jpg` olarak proje depolamasına yüklendi.
- [x] Header, mobil marka ve asistan mesaj avatarlarında önceki inline AI beyin SVG’si kaldırılıp aynı yüklenen görsel kullanıldı.
- [x] Kullanıcı profil kafa-omuz ikonu korundu; LUXA AI avatarı ile kullanıcı avatarı ayrımı sürdürüldü.
- [x] Dairesel kırpma, hizalama, glow ve mobil önizleme kontrolü geçti.

## Özel kullanıcı profil görseli

- [x] Kullanıcının sağladığı turuncu-sarı profil görseli `/manus-storage/1000037943_15f47530.jpg` olarak proje depolamasına yüklendi.
- [x] Önceki kafa-omuz SVG’si kaldırıldı.
- [x] Yeni görsel `Misafir` profil alanında ve kullanıcı mesaj avatarlarında kullanılacak şekilde bağlandı.
- [x] LUXA AI neon beyin avatarı korunarak kullanıcı/LUXA avatar ayrımı sürdürüldü.
- [x] Masaüstü sidebar ve mobil görünüm kontrolleri, syntax ve diagnostics kontrolleri geçti.

## Fixed üst navigasyon

- [x] Header, sohbet kaydırılırken viewport’un üstünde kalacak şekilde `position: fixed`, `top: 0` ve `z-index: 100` ile sabitlendi.
- [x] Masaüstünde sidebar genişliği kadar yatay ofset, mobilde tam genişlik uygulandı.
- [x] Header için tema uyumlu yarı saydam arka plan ve `backdrop-filter: blur(12px)` eklendi.
- [x] Ana içerikte header yüksekliği kadar üst boşluk bırakıldı; mesajlar header altında başlamıyor.
- [x] Masaüstü ve mobil görsel kontrolleri ile gerçek preview scroll ölçümü başarılı.

## Anonim localStorage sohbet geçmişi

- [x] Giriş gerektirmeden `anonymous_user_id` oluşturulup tarayıcı localStorage’ında saklanıyor.
- [x] Mesaj gönderildiğinde sohbet başlığı, mesajlar, kaynaklar ve düşünme süresi metadata’sı `luxa_chat_history` altında JSON olarak kaydediliyor.
- [x] Sayfa yenilendiğinde kayıtlı sohbetler sol menüye yükleniyor ve sayaç güncelleniyor.
- [x] Sol menüdeki sohbet seçildiğinde mesajlar ana ekrana geri yükleniyor.
- [x] Sohbet silme düğmesi hem DOM’dan hem localStorage’dan kaldırıyor; mobilde de görünür kalıyor.
- [x] Preview kabul testi: yenileme sonrası 1 sohbet kaldı, tıklamayla 2 mesaj geri yüklendi ve silme sonrası sidebar/localStorage 0’a döndü.

## LUXA AI yeniden markalama ve sohbet dışa aktarma

- [x] Proje metin dosyalarında eski marka referansları temizlendi; arayüz, route manifesti, backend logları, Exa modülü, TODO ve paket adı LUXA standardına taşındı.
- [x] `package.json` proje adı `luxa-ai` olarak güncellendi.
- [x] Gemini sistem talimatlarına LUXA AI kimlik kuralı eklendi: kimlik/altyapı sorularında yalnızca `Ben LUXA AI'ım, size nasıl yardımcı olabilirim?` yanıtı kullanılacak.
- [x] LocalStorage’da tutulan sohbet geçmişi header’daki JSON ve Markdown düğmeleriyle indirilebilir hale getirildi.
- [x] JSON export; anonim kullanıcı kimliği, sohbet başlıkları, mesajlar, kaynaklar ve metadata’yı pretty-printed JSON olarak içeriyor.
- [x] Markdown export; sohbetleri, kullanıcı/asistan mesajlarını ve en fazla beş kaynak bağlantısını okunabilir biçimde içeriyor.
- [x] Export düğmeleri geçmiş yokken devre dışı; geçmiş yüklendiğinde etkin.
- [x] Preview kabul testi: JSON ve Markdown dosyaları gerçek tarayıcı indirmesiyle oluşturuldu; JSON’da 1 sohbet/2 mesaj, Markdown’da başlık, mesajlar ve kaynak bağlantısı doğrulandı.
