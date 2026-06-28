/**
 * Browser build of bonding-question-filters.mjs for worksheet-logic.js
 */
(function (global) {
  "use strict";

  const PAGE_MIN = 58;
  const PAGE_MAX = 125;
  const ALLOWED_QTYPES = new Set(["ionic-bond", "covalent-bond"]);

  function requiresTableOrDiagram(stem) {
    const s = String(stem || "").toLowerCase();
    if (/complete the (following )?table/.test(s)) return true;
    if (/following table|table below|table shows|table gives|above table|in the table/.test(s)) return true;
    if (/use data from the table|refer to the (above |following )?table/.test(s)) return true;
    if (/melting point.*boiling point/.test(s) && /\b[wx yz]\b/.test(s)) return true;
    if (/diagram below|diagram above|shown below|look at the diagram|diagram represents|diagram is incomplete/.test(s)) return true;
    if (/dot-and-cross diagram|dot and cross diagram/.test(s)) return true;
    if (/complete the diagram|complete the (following )?diagram/.test(s)) return true;
    if (/draw (an |the )?electron diagram|draw electron diagrams/.test(s)) return true;
    if (/label the (above )?diagram|labelled diagram|labeled diagram|simple diagram/.test(s)) return true;
    if (/aid of a (labelled |labeled )?diagram|with the help of a (simple )?diagram/.test(s)) return true;
    if (/in the following box|in the box below/.test(s)) return true;
    if (/set-up.*shown|structural formula/.test(s)) return true;
    if (/\bsketch\b/.test(s)) return true;
    if (/electron diagrams?, showing electrons/.test(s)) return true;
    if (/filter paper|middle of the filter paper/.test(s)) return true;
    return false;
  }

  function isOutOfScopeTopic(stem) {
    const s = String(stem || "").toLowerCase();
    if (/\bisotope/.test(s)) return true;
    if (/relative atomic mass|relative abundance/.test(s)) return true;
    if (/calculate the relative atomic mass/.test(s)) return true;
    if (/\b(deuterium|tritium|protium)\b/.test(s)) return true;
    if (/mass number of/.test(s)) return true;
    if (/abundance of/.test(s)) return true;
    if (/atomic number/.test(s)) return true;
    if (/mass number/.test(s)) return true;
    if (/\b(proton|neutron|electron)s?\b/.test(s) && !/ionic|covalent|bond|compound|molecule|lattice/.test(s)) return true;
    if (/subatomic|nucleus/.test(s)) return true;
    if (/numbers of protons|numbers of electrons|numbers of neutrons/.test(s)) return true;
    if (/full atomic symbol/.test(s)) return true;
    if (/structure of (a |an )?atom\b/.test(s)) return true;
    if (/balance the equation|balanced equation|balancing the equation/.test(s)) return true;
    if (/write the equation for|chemical equation for the reaction|construct the equation/.test(s)) return true;
    if (/equation below|in the equation below|the equation below shows/.test(s)) return true;
    if (/\b\d{1,3}\s+\d{1,3}\s+\d{1,3}\b/.test(s)) return true;
    if (/\b[A-Za-z]{1,2}\s+\d{1,3}\s+\d{1,3}\b/.test(s)) return true;
    if (/electronic arrangement of (ge|si|al|mg|na|cl|ar)/i.test(s)) return true;
    return false;
  }

  function isBondingBankEntry(entry) {
    if (!entry) return false;
    const page = entry.topic_page;
    if (page == null || page < PAGE_MIN || page > PAGE_MAX) return false;
    if (!ALLOWED_QTYPES.has(entry.qtype)) return false;
    if (requiresTableOrDiagram(entry.stem_en)) return false;
    if (isOutOfScopeTopic(entry.stem_en)) return false;
    return true;
  }

  global.BondingQuestionFilters = {
    PAGE_MIN,
    PAGE_MAX,
    ALLOWED_QTYPES,
    requiresTableOrDiagram,
    isOutOfScopeTopic,
    isBondingBankEntry,
  };
})(typeof window !== "undefined" ? window : globalThis);
