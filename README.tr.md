<div align="center">

# Claude Code Academy

**Claude Code'u gerçekten kullanacağınız şekilde öğrenin.**

Geliştiriciler için seviyelendirilmiş, uygulamalı bir müfredat — İngilizce ve Türkçe 119 ders,
gerçek bir terminalde çalıştırılmış her özellik, kaynağına kadar izlenebilen her iddia.

[![Site](https://img.shields.io/badge/oku-cc.codechup.com-B75434?style=for-the-badge&labelColor=17130F)](https://cc.codechup.com/tr/)
[![Diller](https://img.shields.io/badge/EN%20%2F%20T%C3%9CRK%C3%87E-ikisi%20de%20tam-2F6585?style=for-the-badge&labelColor=17130F)](https://cc.codechup.com/tr/)
[![Lisans](https://img.shields.io/badge/lisans-MIT-2F6B4A?style=for-the-badge&labelColor=17130F)](LICENSE)

[![CI](https://github.com/codechup/claude-code-training/actions/workflows/ci.yml/badge.svg)](https://github.com/codechup/claude-code-training/actions/workflows/ci.yml)
[![Deploy](https://github.com/codechup/claude-code-training/actions/workflows/deploy.yml/badge.svg)](https://github.com/codechup/claude-code-training/actions/workflows/deploy.yml)
[![Changelog sapması](https://github.com/codechup/claude-code-training/actions/workflows/changelog-weekly.yml/badge.svg)](https://github.com/codechup/claude-code-training/actions/workflows/changelog-weekly.yml)
[![Bağlantılar](https://github.com/codechup/claude-code-training/actions/workflows/links-weekly.yml/badge.svg)](https://github.com/codechup/claude-code-training/actions/workflows/links-weekly.yml)

[English](README.md) · **Türkçe**

</div>

---

## Bu nedir

Yapay zekâ destekli kodlama araçları hakkındaki içeriğin çoğu bir özellik turudur. Bu bir
kurstur. Claude Code'u kurarak başlıyorsunuz ve paralel oturumlar arasında çoklu agent'lı iş
akışları çalıştırarak bitiriyorsunuz; her adımda çalıştırılacak bir şey, ters gidebilecek bir
şey ve dersin bir yolu diğerine tercih etmek için verdiği bir gerekçe var.

Hem agentic araçlarla yeni tanışan geliştiriciler için hem de Claude Code'u her gün kullanan ve
kimsenin anlatmadığı kısımları isteyenler için yazıldı — hook çıkış kodları, izin kuralı
söz dizimi, subagent tool kapsamı, plan dosyaları, prompt caching.

|                         |                                                          |
| ----------------------- | -------------------------------------------------------- |
| **Ders**                | İngilizce 119, Türkçe 119                                |
| **Seviye**              | 4, 21 modül boyunca                                      |
| **Süre**                | uçtan uca yaklaşık 33 saat                               |
| **Terminal kaydı**      | 261, gerçek oturumlardan alındı                          |
| **Atıf yapılan kaynak** | 142, her biri en son doğrulandığı tarihle                |
| **Doğrulandığı sürüm**  | Claude Code `2.1.265`                                    |
| **Ücret**               | ücretsiz, MIT, hesap yok, sayfa sayımı dışında takip yok |

## İçeriğin uyduğu üç kural

**Hiçbir şey ezberden yazılmaz.** Davranışa dair her iddia resmî dokümantasyona dayanır ve her
ders kaynaklarını doğrulama tarihiyle birlikte listeler. Haftalık bir iş, üst kaynaktaki
changelog ile kursun iddia ettiklerini karşılaştırır ve ayrıştıklarında bir issue açar.

**Uydurma çıktı yok.** 261 terminal kaydı, eşlik eden lab deposuna karşı gerçekten çalıştırılmış
oturumlardan alındı. Bir özellik gösterilemediğinde — bir masaüstü arayüzü, erken erişimdeki bir
komut — ders bir transcript uydurmak yerine bunu açıkça söyler.

**Her ders, öğrettiği şeyin _ne zaman kullanılmayacağını_ da söyler.** Küçük bir depo için dört
subagent'ın fazlalık olduğunu bilmek, birini nasıl yazacağınızı bilmek kadar değerlidir.

## Müfredat

<table>
<tr><td valign="top" width="50%">

**1. Seviye · Başlangıç** — 21 ders, 4,9 sa

> Kurun, kimlik doğrulaması yapın ve ilk gerçekten verimli oturumunuzu gerçekleştirin.

`m01` Claude Code'u çalışır hale getirmek
`m02` Claude Code ile konuşmak
`m03` Claude'a bellek kazandırmak
`m04` Yerleşik komutlar ve terminal

**2. Seviye · Orta Seviye** — 30 ders, 8,5 sa

> Aracı biçimlendirin: modeller, skill'ler, hook'lar ve sağlam git akışları.

`m05` Model ve efor seçmek
`m06` Skill'ler ve özel komutlar
`m07` Hook'lar
`m08` Claude ile git iş akışları
`m09` Agent'lar için prompt yazmak

</td><td valign="top" width="50%">

**3. Seviye · İleri Seviye** — 37 ders, 11,1 sa

> Devredin, bağlanın ve otomatikleştirin — güvenli biçimde.

`m10` Subagent'lar ve özel agent'lar
`m11` Model Context Protocol
`m12` Plugin'ler ve marketplace'ler
`m13` Headless, CI ve Agent SDK
`m14` Güvenli çalışmak
`m15` Claude Code'un çalıştığı her yer

**4. Seviye · Uzmanlık** — 31 ders, 8,4 sa

> Ölçekte, kendi başına, oturumlar ve ekipler arasında çalıştırın.

`m16` Çoklu agent orkestrasyonu
`m17` Otonom döngüler
`m18` Paralel oturumları koordine etmek
`m19` Artifact'ler, tasarım ve tarayıcılar
`m20` Ekip benimsemesi
`m21` Büyük kod tabanları ve altyapı

</td></tr></table>

Ayrıca bir **Playbook** (karar ağaçları, 93 iyi uygulama, 141 maddelik bir anti-pattern kataloğu,
bir sözlük ve 2025'ten bu yana nelerin değiştiğini anlatan bir changelog) ve bu sitenin nasıl
yapıldığını kendisini örnek alarak belgeleyen bir **Meta** bölümü.

## Lab

Uygulamalı her ders [`codechup/claude-code-lab`](https://github.com/codechup/claude-code-lab)
içinde bir tag adı verir — gerçek hatalarla tohumlanmış küçük bir TypeScript CLI ve HTTP servisi:

```bash
git clone https://github.com/codechup/claude-code-lab
cd claude-code-lab && npm ci
git checkout lesson/m10-03-start    # dersin beklediği durum
```

98 tag, alıştırma başına bir çift: öncesi için `-start`, sonrası için `-solution`.

## Nasıl yapıldı

MDX dersleri, Tailwind v4 ve Pagefind aramasıyla bir Astro statik sitesi; GitHub Actions ile bir
CDN arkasındaki statik bir sunucuya dağıtılıyor. Sunucu çalışma zamanı yok, veritabanı yok,
hesap yok.

Deponun kendisini okumaya değer kılan şey, kursun öğrettiği her şeyi kendisinin kullanması:

- **`.claude/`** — bu projenin üzerinde çalıştığı rule'lar, hook'lar, skill'ler ve subagent'lar.
  Meta bölümü bunların üzerinden satır satır geçiyor.
- **`plans/` + `STATE.md`** — 51 plan dosyası ve üretilmiş bir durum panosu. Kursun tamamı,
  plan sahiplenip ayrık worktree'lerde çalışan paralel Claude Code oturumları tarafından yazıldı; 4. Seviye bu deseni bu depoyu vaka çalışması olarak kullanarak öğretiyor.
- **Beş kapı** — içerik şeması ve EN/TR eşleşmesi, tip denetimi, public-hygiene ve ham renk
  taramalı lint, birim testleri, satır içi script'i yasaklayan bir build, ayrıca 390 px ve
  1280 px'te axe ile Playwright ve Lighthouse bütçeleri.

```bash
npm ci
npm run dev          # http://localhost:4321
npm run gate         # EN/TR eşleşmesi, frontmatter şeması, kod bloğu kuralları
npm test             # vitest
npm run build        # Astro + Pagefind + satır içi script denetimi
npx playwright test  # axe ile e2e
```

## Güncel kalmak

Claude Code çoğu hafta yeni sürüm çıkarıyor. Bir sürüme sabitlenen kurs sessizce çürür, bu yüzden
güncellik burada mekanik bir iş:

1. **Pazartesi çalışan bir iş** üst kaynaktaki changelog'u ayrıştırır, yalnızca bu kursun iddia
   ettiği sabitten yeni sürümleri tutar ve her kaydı etkilediği derslere yönlendirir — kayıttaki
   backtick'li tanımlayıcıları 119 dersin tamamından kurulmuş bir dizinle eşleştirerek. Araya bir
   model girmediği için haftalık maliyet sıfırdır.
2. Triyaj tablosunu taşıyan **tek bir issue** tutar ve bir kayıt üç hafta incelenmeden beklerse
   kırmızıya döner.
3. Ardından bir insan `/changelog-triage` çalıştırır; bu komut yalnızca bekleyen kayıtları ve
   dokundukları tam ders satırlarını görür — böylece bir güncellemenin maliyeti neyin değiştiğiyle
   orantılıdır, kursun büyüklüğüyle değil.
4. İçerik kapısı, incelenmiş sabitin üzerinde bir sürüm iddia eden bir dersi merge etmeyi
   reddeder; böylece sapma sessizce geçemez.

## Katkı

Araçla artık örtüşmeyen bir ders mi buldunuz? Bildirebileceğiniz en yararlı şey budur —
[eskimiş ders formuyla](https://github.com/codechup/claude-code-training/issues/new?template=lesson-outdated.yml)
bir issue açın.

Pull request'ler memnuniyetle karşılanır. `main` bir pull request, doğrusal bir geçmiş ve yeşil
kontroller ister; commit'ler kişisel kimlik ve oturum URL'si taşıyamaz, bunu bir pre-push hook'u
ve CI birlikte uygular. `CONTRIBUTING`
[Meta bölümünde](https://cc.codechup.com/tr/meta/contributing/).

## Lisans

[MIT](LICENSE) — kod, dersler ve çeviriler. Claude ve Claude Code, Anthropic'in ticari
markalarıdır; bu bağımsız ve bağlantısız bir kurstur.
