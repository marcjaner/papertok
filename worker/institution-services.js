/**
 * Which publisher platforms a reader's library subscribes to.
 *
 * Each platform in the catalogue is probed with the same providers, in the
 * same order, as `/access`: GetFTR with a paywalled DOI from that platform,
 * then the library's link resolver with the ISSN and year of one of its
 * journals. The catalogue already knows the journal, so Crossref is not asked.
 * A platform is listed when its probe is entitled; the list describes the
 * library and is informative only, the per-paper answer stays with `/access`.
 */

import {
  INSTITUTION_RESOLVERS,
  InstitutionAccessError,
  askGetFtr,
  askResolver,
} from './institution-access.js';

export const INSTITUTION_SERVICES_PATH = '/institution/services';

// One deadline for every probe together. The whole catalogue at up to two
// requests per platform must not run past the browser's wait (measured with
// 53 platforms against USAL's resolver on 2026-10-14: 2.8 s), and a probe cut short
// is reported as `partial` rather than as a platform the library lacks.
const SERVICES_DEADLINE_MS = 12000;
const PROBE_CONCURRENCY = 4;
const FAILED = Symbol('failed');
const UNCHECKED = Symbol('unchecked');

// `color` and `monogram` are brand data for the tile the client draws; the
// publishers' logos and favicons are trademarks and are not fetched.
// `issn` and `year` name a flagship journal for the resolver, `doi` a
// paywalled article of it for GetFTR; none of the three leaves the Worker.
// The DOI must stay closed: GetFTR says yes to open content for anyone, which
// would list the platform for every library. Each was closed in Unpaywall
// (`is_oa: false`) and matched its ISSN and year in Crossref on 2026-10-13;
// the platforms from JSTOR on were checked the same way through OpenAlex's
// `open_access.is_oa` (Unpaywall's data) on 2026-10-14, after 19 university
// resolvers confirmed each is commonly subscribed. ScienceDirect uses the
// Journal of Alloys and Compounds rather than Cell, whose open archive frees
// every article after a year. For the same reason PNAS, ASM, Cold Spring
// Harbor and Rockefeller University Press are left out: their articles all
// open after an embargo, so none stays closed.
// `packageHint` is the word a library's own package for the platform carries
// ("Wiley Online Library All Journals"): a package without it is an
// aggregator's (ProQuest, EBSCO), and the row says so.
export const SERVICE_CATALOGUE = Object.freeze([
  { id: 'sciencedirect', packageHint: 'ScienceDirect', name: 'ScienceDirect', publisher: 'Elsevier', url: 'https://www.sciencedirect.com', monogram: 'SD', color: '#FF6C00', issn: '0925-8388', year: 2021, doi: '10.1016/j.jallcom.2021.161513' },
  { id: 'nature', packageHint: 'Nature', name: 'Nature', publisher: 'Springer Nature', url: 'https://www.nature.com', monogram: 'N', color: '#1C1C1C', issn: '0028-0836', year: 2020, doi: '10.1038/s41586-020-2782-y' },
  { id: 'springerlink', packageHint: 'SpringerLink', name: 'SpringerLink', publisher: 'Springer Nature', url: 'https://link.springer.com', monogram: 'SL', color: '#2B5E9B', issn: '0022-2461', year: 2021, doi: '10.1007/s10853-021-06462-4' },
  { id: 'wiley', packageHint: 'Wiley', name: 'Wiley Online Library', publisher: 'Wiley', url: 'https://onlinelibrary.wiley.com', monogram: 'W', color: '#1F3F77', issn: '1521-4095', year: 2021, doi: '10.1002/adma.202100824' },
  { id: 'acs', packageHint: 'American Chemical Society', name: 'ACS Publications', publisher: 'American Chemical Society', url: 'https://pubs.acs.org', monogram: 'ACS', color: '#1F4E79', issn: '0002-7863', year: 2021, doi: '10.1021/jacs.1c00601' },
  { id: 'ieee', packageHint: 'IEEE', name: 'IEEE Xplore', publisher: 'IEEE', url: 'https://ieeexplore.ieee.org', monogram: 'IEEE', color: '#00629B', issn: '0018-9219', year: 2021, doi: '10.1109/jproc.2021.3107494' },
  { id: 'tandf', packageHint: 'Taylor', name: 'Taylor & Francis Online', publisher: 'Taylor & Francis', url: 'https://www.tandfonline.com', monogram: 'T&F', color: '#0A5485', issn: '0020-7179', year: 2021, doi: '10.1080/00207179.2021.1910863' },
  { id: 'sage', packageHint: 'SAGE', name: 'SAGE Journals', publisher: 'SAGE', url: 'https://journals.sagepub.com', monogram: 'SAGE', color: '#1D6E5B', issn: '0049-1241', year: 2013, doi: '10.1177/0049124113500475' },
  { id: 'oup', packageHint: 'Oxford', name: 'Oxford Academic', publisher: 'Oxford University Press', url: 'https://academic.oup.com', monogram: 'OUP', color: '#002147', issn: '0033-5533', year: 2021, doi: '10.1093/qje/qjab022' },
  { id: 'science', packageHint: 'AAAS', name: 'Science', publisher: 'AAAS', url: 'https://www.science.org', monogram: 'Sci', color: '#B3252E', issn: '0036-8075', year: 2020, doi: '10.1126/science.abd8911' },
  { id: 'aps', packageHint: 'American Physical Society', name: 'APS Journals', publisher: 'American Physical Society', url: 'https://journals.aps.org', monogram: 'APS', color: '#1C3F74', issn: '0031-9007', year: 2021, doi: '10.1103/physrevlett.127.134301' },
  { id: 'cambridge', packageHint: 'Cambridge', name: 'Cambridge Core', publisher: 'Cambridge University Press', url: 'https://www.cambridge.org/core', monogram: 'CUP', color: '#D62E2E', issn: '0022-1120', year: 2021, doi: '10.1017/jfm.2021.143' },
  { id: 'rsc', packageHint: 'Royal Society of Chemistry', name: 'RSC Publishing', publisher: 'Royal Society of Chemistry', url: 'https://pubs.rsc.org', monogram: 'RSC', color: '#0B6E8F', issn: '1463-9076', year: 2021, doi: '10.1039/d1cp02473f' },
  { id: 'iop', packageHint: 'Institute of Physics', name: 'IOPscience', publisher: 'IOP Publishing', url: 'https://iopscience.iop.org', monogram: 'IOP', color: '#1D3C78', issn: '0953-8984', year: 2021, doi: '10.1088/1361-648x/ac1d6e' },
  { id: 'jstor', packageHint: 'JSTOR', name: 'JSTOR', publisher: 'ITHAKA', url: 'https://www.jstor.org', monogram: 'JST', color: '#990000', issn: '0003-0279', year: 2015, doi: '10.7817/jameroriesoci.135.3.453' },
  { id: 'degruyter', packageHint: 'Gruyter', name: 'De Gruyter', publisher: 'De Gruyter Brill', url: 'https://www.degruyterbrill.com', monogram: 'DG', color: '#00387A', issn: '0075-4102', year: 2021, doi: '10.1515/crelle-2020-0050' },
  { id: 'brill', packageHint: 'Brill', name: 'Brill', publisher: 'De Gruyter Brill', url: 'https://brill.com', monogram: 'B', color: '#0C3B5D', issn: '0042-4935', year: 2021, doi: '10.1163/15685330-00001116' },
  { id: 'annualreviews', packageHint: 'Annual Reviews', name: 'Annual Reviews', publisher: 'Annual Reviews', url: 'https://www.annualreviews.org', monogram: 'AR', color: '#7A1F2B', issn: '0066-4308', year: 2021, doi: '10.1146/annurev-psych-072420-122921' },
  { id: 'chicago', packageHint: 'University of Chicago', name: 'University of Chicago Press Journals', publisher: 'University of Chicago Press', url: 'https://www.journals.uchicago.edu', monogram: 'UCP', color: '#800000', issn: '0022-3808', year: 2021, doi: '10.1086/715075' },
  { id: 'mitpress', packageHint: 'MIT Press', name: 'MIT Press Direct', publisher: 'MIT Press', url: 'https://direct.mit.edu', monogram: 'MIT', color: '#1D1D1B', issn: '0899-7667', year: 2021, doi: '10.1162/neco_a_01382' },
  { id: 'aip', packageHint: 'AIP', name: 'AIP Publishing', publisher: 'AIP Publishing', url: 'https://pubs.aip.org', monogram: 'AIP', color: '#00539B', issn: '0021-9606', year: 2021, doi: '10.1063/5.0038058' },
  { id: 'optica', packageHint: 'Optica', name: 'Optica Publishing Group', publisher: 'Optica', url: 'https://opg.optica.org', monogram: 'OPG', color: '#002F5F', issn: '0146-9592', year: 2021, doi: '10.1364/ol.427142' },
  { id: 'acm', packageHint: 'ACM', name: 'ACM Digital Library', publisher: 'ACM', url: 'https://dl.acm.org', monogram: 'ACM', color: '#0085CA', issn: '0001-0782', year: 2021, doi: '10.1145/3447731' },
  { id: 'siam', packageHint: 'SIAM', name: 'SIAM Journals', publisher: 'SIAM', url: 'https://epubs.siam.org', monogram: 'SIAM', color: '#003E7E', issn: '0036-1429', year: 2021, doi: '10.1137/20m1386554' },
  { id: 'ams', packageHint: 'American Mathematical Society', name: 'AMS Journals', publisher: 'American Mathematical Society', url: 'https://www.ams.org/journals', monogram: 'AMS', color: '#1A4E8A', issn: '0894-0347', year: 2021, doi: '10.1090/jams/964' },
  { id: 'asce', packageHint: 'Civil Engineers', name: 'ASCE Library', publisher: 'ASCE', url: 'https://ascelibrary.org', monogram: 'ASCE', color: '#00467F', issn: '0733-9445', year: 2021, doi: '10.1061/(asce)st.1943-541x.0002959' },
  { id: 'asme', packageHint: 'ASME', name: 'ASME Digital Collection', publisher: 'ASME', url: 'https://asmedigitalcollection.asme.org', monogram: 'ASME', color: '#0060A9', issn: '0021-8936', year: 2021, doi: '10.1115/1.4051998' },
  { id: 'thieme', packageHint: 'Thieme', name: 'Thieme Connect', publisher: 'Thieme', url: 'https://www.thieme-connect.com', monogram: 'T', color: '#004F9F', issn: '0039-7881', year: 2021, doi: '10.1055/a-1401-4486' },
  { id: 'jama', packageHint: 'American Medical Association', name: 'JAMA Network', publisher: 'American Medical Association', url: 'https://jamanetwork.com', monogram: 'JAMA', color: '#B5121B', issn: '0098-7484', year: 2021, doi: '10.1001/jama.2021.5603' },
  { id: 'nejm', packageHint: 'New England Journal', name: 'NEJM', publisher: 'Massachusetts Medical Society', url: 'https://www.nejm.org', monogram: 'NEJM', color: '#C8102E', issn: '0028-4793', year: 2021, doi: '10.1056/nejmp2110516' },
  { id: 'karger', packageHint: 'Karger', name: 'Karger', publisher: 'Karger', url: 'https://karger.com', monogram: 'K', color: '#003C71', issn: '1018-8665', year: 2021, doi: '10.1159/000514687' },
  { id: 'aea', packageHint: 'American Economic', name: 'AEA Journals', publisher: 'American Economic Association', url: 'https://www.aeaweb.org/journals', monogram: 'AEA', color: '#1F3A60', issn: '0002-8282', year: 2021, doi: '10.1257/aer.20191204' },
  { id: 'emerald', packageHint: 'Emerald', name: 'Emerald Insight', publisher: 'Emerald Publishing', url: 'https://www.emerald.com', monogram: 'E', color: '#006A4E', issn: '0022-0418', year: 2021, doi: '10.1108/jd-11-2020-0189' },
  { id: 'apa', packageHint: 'PsycArticles', name: 'APA PsycNet', publisher: 'American Psychological Association', url: 'https://psycnet.apa.org', monogram: 'APA', color: '#2C5697', issn: '0033-295X', year: 2021, doi: '10.1037/rev0000265' },
  { id: 'aha', packageHint: 'American Heart', name: 'AHA Journals', publisher: 'American Heart Association', url: 'https://www.ahajournals.org', monogram: 'AHA', color: '#C10E21', issn: '0009-7322', year: 2021, doi: '10.1161/cir.0000000000001029' },
  { id: 'spie', packageHint: 'SPIE', name: 'SPIE Digital Library', publisher: 'SPIE', url: 'https://www.spiedigitallibrary.org', monogram: 'SPIE', color: '#0F4C81', issn: '0091-3286', year: 2021, doi: '10.1117/1.oe.60.9.094105' },
  { id: 'aacr', packageHint: 'Cancer Research', name: 'AACR Journals', publisher: 'American Association for Cancer Research', url: 'https://aacrjournals.org', monogram: 'AACR', color: '#00539F', issn: '0008-5472', year: 2021, doi: '10.1158/0008-5472.can-20-4090' },
  { id: 'biologists', packageHint: 'Company of Biologists', name: 'The Company of Biologists', publisher: 'The Company of Biologists', url: 'https://journals.biologists.com', monogram: 'CoB', color: '#00757F', issn: '0950-1991', year: 2021, doi: '10.1242/dev.199669' },
  { id: 'portland', packageHint: 'Portland', name: 'Portland Press', publisher: 'Portland Press', url: 'https://portlandpress.com', monogram: 'PP', color: '#003B5C', issn: '0264-6021', year: 2021, doi: '10.1042/bcj20210652' },
  { id: 'acp', packageHint: 'American College of Physicians', name: 'ACP Journals', publisher: 'American College of Physicians', url: 'https://www.acpjournals.org', monogram: 'ACP', color: '#002855', issn: '0003-4819', year: 2021, doi: '10.7326/aitc202105180' },
].map(entry => Object.freeze(entry)));

/** Whether a package name is the platform's or its publisher's own. */
function namesPlatform(packageName, entry) {
  return String(packageName || '').toLowerCase().includes(entry.packageHint.toLowerCase());
}

/**
 * `{ collection, ownPlatform }` when the library subscribes (a null collection
 * when GetFTR said so), null when it does not, and UNCHECKED when a provider
 * answered without deciding (GetFTR's `maybe`, say) and none other is left.
 * Throws when no provider could answer, so the caller can report the list as
 * partial.
 */
async function probe(entry, { resolver, getFtr, entityId, rorId, env, fetchImpl, signal }) {
  if (getFtr) {
    let verdict = null;
    try {
      verdict = await askGetFtr({ doi: entry.doi, entityId, rorId }, env, fetchImpl, signal);
    } catch (error) {
      if (!resolver) throw error;
    }
    if (verdict) return verdict.status === 'entitled' ? { collection: null, ownPlatform: true } : null;
    if (!resolver) return UNCHECKED;
  }
  const answer = await askResolver(resolver, entry.issn, entry.year, fetchImpl, signal);
  if (!answer) throw new Error('unreadable resolver answer');
  // A free service is open access, which says nothing about the library. Among
  // the paid ones, the publisher's own package outranks an aggregator's: the
  // USAL lists Nature under a ProQuest collection before its "Nature" package,
  // and the row should name the package that is really the platform.
  const paid = answer.services.filter(service => service.url && !service.free);
  const own = paid.find(service => namesPlatform(service.name, entry));
  const subscription = own || paid[0];
  return subscription ? { collection: subscription.name, ownPlatform: Boolean(own) } : null;
}

export async function lookupInstitutionServices(
  { domain, entityId = null, rorId = null },
  { fetchImpl = (...args) => fetch(...args), env = {}, now = Date.now } = {},
) {
  const resolver = Object.hasOwn(INSTITUTION_RESOLVERS, domain) ? INSTITUTION_RESOLVERS[domain] : null;
  const getFtr = Boolean(env.GETFTR_API_KEY) && Boolean(entityId || rorId);
  if (!resolver && !getFtr) throw new InstitutionAccessError('INSTITUTION_NOT_SUPPORTED', 404);
  const context = { resolver, getFtr, entityId, rorId, env, fetchImpl, signal: AbortSignal.timeout(SERVICES_DEADLINE_MS) };

  const outcomes = new Array(SERVICE_CATALOGUE.length);
  let next = 0;
  const drain = async () => {
    while (next < SERVICE_CATALOGUE.length) {
      const index = next++;
      outcomes[index] = await probe(SERVICE_CATALOGUE[index], context).catch(() => FAILED);
    }
  };
  await Promise.all(Array.from({ length: PROBE_CONCURRENCY }, drain));

  if (outcomes.every(outcome => outcome === FAILED)) {
    throw new InstitutionAccessError('ACCESS_LOOKUP_UNAVAILABLE', 502);
  }
  const services = [];
  SERVICE_CATALOGUE.forEach(({ id, name, publisher, url, monogram, color }, index) => {
    const outcome = outcomes[index];
    if (outcome && outcome !== FAILED && outcome !== UNCHECKED) {
      services.push({ id, name, publisher, url, monogram, color, collection: outcome.collection, ownPlatform: outcome.ownPlatform });
    }
  });
  return {
    services,
    partial: outcomes.includes(FAILED),
    unchecked: outcomes.filter(outcome => outcome === UNCHECKED).length,
    checkedAt: new Date(now()).toISOString(),
  };
}
