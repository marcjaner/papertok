# Publisher logos

These logos label the platforms in "Through your library" in the institution
dialog. They are bundled with the app because publishers block hotlinking, and so
the browser fetches nothing from a third party at runtime. A logo only identifies
the platform the library reaches; it does not imply an endorsement or a
relationship with PaperTok. Every platform in the Worker's `SERVICE_CATALOGUE`
needs one here; `publisherLogos.test.js` fails otherwise, and so does a file
without a row in one of the tables below.

## Public domain logos from Wikimedia Commons

Every file in this table is a public domain logo on Wikimedia Commons; the mark
belongs to its owner. The first twelve were retrieved 2026-10-13, the rest
2026-10-14. The files are unchanged except that `sciencedirect.svg`, `nature.svg`,
`tandf.svg`, `science.svg`, `iop.svg`, `acm.svg`, `ams.svg` and `karger.svg`
gained a `viewBox` taken from their own `width` and `height`, and that editor
metadata, `data-name` attributes and `<title>` elements were removed from
`jstor.svg`, `mitpress.svg`, `acm.svg`, `nejm.svg` and `spie.svg` (`nejm.svg` also
lost an unused `<pattern>` of embedded bitmaps).

| File | Commons title | Description page |
| --- | --- | --- |
| `acs.svg` | File:American Chemical Society logo 2026.svg | https://commons.wikimedia.org/wiki/File:American_Chemical_Society_logo_2026.svg |
| `ieee.svg` | File:IEEE logo.svg | https://commons.wikimedia.org/wiki/File:IEEE_logo.svg |
| `iop.svg` | File:Instituteofphysics.svg | https://commons.wikimedia.org/wiki/File:Instituteofphysics.svg |
| `nature.svg` | File:Nature Research logotype.svg | https://commons.wikimedia.org/wiki/File:Nature_Research_logotype.svg |
| `oup.svg` | File:OUP logo.svg | https://commons.wikimedia.org/wiki/File:OUP_logo.svg |
| `rsc.svg` | File:RSC-brand-guidelines-2019 tcm18-246471.svg | https://commons.wikimedia.org/wiki/File:RSC-brand-guidelines-2019_tcm18-246471.svg |
| `sage.svg` | File:SAGE Publishing logo 2023.svg | https://commons.wikimedia.org/wiki/File:SAGE_Publishing_logo_2023.svg |
| `science.svg` | File:Science AAAS logo.svg | https://commons.wikimedia.org/wiki/File:Science_AAAS_logo.svg |
| `sciencedirect.svg` | File:ScienceDirect logo 2020.svg | https://commons.wikimedia.org/wiki/File:ScienceDirect_logo_2020.svg |
| `springerlink.svg` | File:Springer Nature Logo.svg | https://commons.wikimedia.org/wiki/File:Springer_Nature_Logo.svg |
| `tandf.svg` | File:Taylor and Francis.svg | https://commons.wikimedia.org/wiki/File:Taylor_and_Francis.svg |
| `wiley.svg` | File:Wiley logo.svg | https://commons.wikimedia.org/wiki/File:Wiley_logo.svg |
| `acm.svg` | File:Association for Computing Machinery (ACM) logo.svg | https://commons.wikimedia.org/wiki/File:Association_for_Computing_Machinery_(ACM)_logo.svg |
| `ams.svg` | File:American Mathematical Society logo.svg | https://commons.wikimedia.org/wiki/File:American_Mathematical_Society_logo.svg |
| `asce.svg` | File:ASCE logo.svg | https://commons.wikimedia.org/wiki/File:ASCE_logo.svg |
| `brill.svg` | File:Logo of De Gruyter Brill.svg | https://commons.wikimedia.org/wiki/File:Logo_of_De_Gruyter_Brill.svg |
| `degruyter.svg` | File:Logo of De Gruyter Brill.svg | https://commons.wikimedia.org/wiki/File:Logo_of_De_Gruyter_Brill.svg |
| `jstor.svg` | File:JSTOR wordmark.svg | https://commons.wikimedia.org/wiki/File:JSTOR_wordmark.svg |
| `karger.svg` | File:Logo Karger.svg | https://commons.wikimedia.org/wiki/File:Logo_Karger.svg |
| `mitpress.svg` | File:MIT Press logo (black).svg | https://commons.wikimedia.org/wiki/File:MIT_Press_logo_(black).svg |
| `nejm.svg` | File:The New England Journal of Medicine logo.svg | https://commons.wikimedia.org/wiki/File:The_New_England_Journal_of_Medicine_logo.svg |
| `spie.svg` | File:SPIE DL Logo.svg | https://commons.wikimedia.org/wiki/File:SPIE_DL_Logo.svg |

## Logos from the publishers' own sites

Commons has no public domain vector of these marks (checked 2026-10-13 and
2026-10-14), so these files come from each publisher's website. They are not
public domain. As with the rest, they only identify the platform the library
reaches, and the mark and its artwork belong to the publisher. Retrieved
2026-10-14. Where a site only had a white logo for a dark header, its white fills
were set to `#1d1d1b` for the light plate. XML prologs, DOCTYPEs and comments were removed from every file.

| File | Source | Changes |
| --- | --- | --- |
| `aacr.svg` | https://aacr.silverchair-cdn.com/data/SiteBuilderAssetsOriginals/Live/images/umbrella/umbrella-logo.svg | None |
| `acp.svg` | https://www.acpjournals.org/specs/products/acp/releasedAssets/images/acp-logo-b2352777bcde7cbeac8f5fc91a37811e.svg | `viewBox="0 0 361 42"` added |
| `aea.svg` | https://www.aeaweb.org/assets/afc4f66/images/logo.svg | None |
| `aha.svg` | https://www.ahajournals.org/pb-assets/images/logo-publisher-white-1696767979407.svg | White recoloured |
| `aip.svg` | https://publishing.aip.org/wp-content/themes/bedstone/images/AIPP-Master-Logo-white-01.svg | White recoloured; `data-name` removed |
| `annualreviews.svg` | https://www.annualreviews.org/images/hybrid/ar-logo.svg | White recoloured; fixed `width` and `height` removed |
| `apa.svg` | The "APA PsycNet" wordmark inlined in the header of https://psycnet.apa.org | Angular `_ng*` and `data-name` attributes removed |
| `aps.svg` | https://journals.aps.org/images/aps-logo.svg | None |
| `asme.svg` | https://asmedc.silverchair-cdn.com/UI/app/svg/umbrella/logo.svg?versionId=5200 | None |
| `biologists.svg` | https://cob.silverchair-cdn.com/UI/app/svg/umbrella/logo.svg | White text recoloured; a comment removed |
| `cambridge.svg` | The "Cambridge Core" wordmark inlined in the header of https://www.cambridge.org/core | White recoloured; the page's `title` element and `role` and `style` attributes removed; `width` and `height` set to the `viewBox` |
| `chicago.svg` | https://press.uchicago.edu/.resources/ucp/img/logo.svg | `viewBox` added |
| `emerald.svg` | https://emer.silverchair-cdn.com/data/SiteBuilderAssetsOriginals/Live/Images/umbrella/umbrella-logo.svg | None |
| `jama.svg` | https://cdn.jamanetwork.com/UI/app/svg/journals/jamanetwork_brandingcolor.svg | XML prolog removed |
| `optica.svg` | The "OPTICA" wordmark inlined in the header of https://www.optica.org | `xmlns` added; `currentColor` set to `#000000` |
| `portland.svg` | https://port.silverchair-cdn.com/UI/app/svg/umbrella/logo-alternate.svg?versionId=8618 | None |
| `siam.svg` | https://www.siam.org/assets/images/accents/siam-logo.svg | Unused `class` attributes removed |
| `thieme.svg` | The header logo in https://www.thieme.com's script bundle (`assets/index.44a686bb7a8b5c2db873.js`) | The `<svg>` rebuilt from the bundle's eight path definitions; title dropped |
