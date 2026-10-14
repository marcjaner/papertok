import aacr from '../../assets/publishers/aacr.svg';
import acm from '../../assets/publishers/acm.svg';
import acp from '../../assets/publishers/acp.svg';
import acs from '../../assets/publishers/acs.svg';
import aea from '../../assets/publishers/aea.svg';
import aha from '../../assets/publishers/aha.svg';
import aip from '../../assets/publishers/aip.svg';
import ams from '../../assets/publishers/ams.svg';
import annualreviews from '../../assets/publishers/annualreviews.svg';
import apa from '../../assets/publishers/apa.svg';
import aps from '../../assets/publishers/aps.svg';
import asce from '../../assets/publishers/asce.svg';
import asme from '../../assets/publishers/asme.svg';
import biologists from '../../assets/publishers/biologists.svg';
import brill from '../../assets/publishers/brill.svg';
import cambridge from '../../assets/publishers/cambridge.svg';
import chicago from '../../assets/publishers/chicago.svg';
import degruyter from '../../assets/publishers/degruyter.svg';
import emerald from '../../assets/publishers/emerald.svg';
import ieee from '../../assets/publishers/ieee.svg';
import iop from '../../assets/publishers/iop.svg';
import jama from '../../assets/publishers/jama.svg';
import jstor from '../../assets/publishers/jstor.svg';
import karger from '../../assets/publishers/karger.svg';
import mitpress from '../../assets/publishers/mitpress.svg';
import nature from '../../assets/publishers/nature.svg';
import nejm from '../../assets/publishers/nejm.svg';
import optica from '../../assets/publishers/optica.svg';
import oup from '../../assets/publishers/oup.svg';
import portland from '../../assets/publishers/portland.svg';
import rsc from '../../assets/publishers/rsc.svg';
import sage from '../../assets/publishers/sage.svg';
import science from '../../assets/publishers/science.svg';
import sciencedirect from '../../assets/publishers/sciencedirect.svg';
import siam from '../../assets/publishers/siam.svg';
import spie from '../../assets/publishers/spie.svg';
import springerlink from '../../assets/publishers/springerlink.svg';
import tandf from '../../assets/publishers/tandf.svg';
import thieme from '../../assets/publishers/thieme.svg';
import wiley from '../../assets/publishers/wiley.svg';

// Keyed by the Worker catalogue's platform id. Each import is named after its
// file, which `publisherLogos.test.js` relies on to check the map from source.
const LOGOS = {
  aacr,
  acm,
  acp,
  acs,
  aea,
  aha,
  aip,
  ams,
  annualreviews,
  apa,
  aps,
  asce,
  asme,
  biologists,
  brill,
  cambridge,
  chicago,
  degruyter,
  emerald,
  ieee,
  iop,
  jama,
  jstor,
  karger,
  mitpress,
  nature,
  nejm,
  optica,
  oup,
  portland,
  rsc,
  sage,
  science,
  sciencedirect,
  siam,
  spie,
  springerlink,
  tandf,
  thieme,
  wiley,
};

export function publisherLogoFor(id) {
  return Object.hasOwn(LOGOS, id) ? LOGOS[id] : null;
}
