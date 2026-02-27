// ═══════════════════════════════════════════════════════════════════
// GENE DATABASE — ~200 clinically relevant genes (hg38 coordinates)
//
// Categories: cancer, cardio, nicu, rare_disease, pgx
// Coordinates are from GRCh38/hg38 RefSeq annotations.
//
// TODO [REAL GENE DB]: Replace with a proper MANE Select gene
// annotation file for production. Current coords are representative
// but should be verified against Ensembl/RefSeq for exact boundaries.
// Consider adding: Ensembl gene IDs, HGNC IDs, transcript IDs,
// and real exon coordinates from GTF/GFF3.
// ═══════════════════════════════════════════════════════════════════

var GENE_DB = [
  // ── ACMG SF v3.2 — Cancer Predisposition ────────────────────────
  { symbol:'BRCA1',  name:'BRCA1 DNA repair associated',             chr:'chr17', start:43044295,  end:43170245,  cat:['cancer'] },
  { symbol:'BRCA2',  name:'BRCA2 DNA repair associated',             chr:'chr13', start:32315086,  end:32400268,  cat:['cancer'] },
  { symbol:'TP53',   name:'Tumor protein p53',                       chr:'chr17', start:7668402,   end:7687550,   cat:['cancer'] },
  { symbol:'APC',    name:'APC regulator of WNT signaling',          chr:'chr5',  start:112707498, end:112846239, cat:['cancer'] },
  { symbol:'MLH1',   name:'MutL homolog 1',                          chr:'chr3',  start:36993330,  end:37050918,  cat:['cancer'] },
  { symbol:'MSH2',   name:'MutS homolog 2',                          chr:'chr2',  start:47403068,  end:47709833,  cat:['cancer'] },
  { symbol:'MSH6',   name:'MutS homolog 6',                          chr:'chr2',  start:47695530,  end:47810101,  cat:['cancer'] },
  { symbol:'PMS2',   name:'PMS1 homolog 2',                          chr:'chr7',  start:5970925,   end:6009106,   cat:['cancer'] },
  { symbol:'RB1',    name:'RB transcriptional corepressor 1',        chr:'chr13', start:48303747,  end:48481890,  cat:['cancer'] },
  { symbol:'PTEN',   name:'Phosphatase and tensin homolog',          chr:'chr10', start:87863625,  end:87971930,  cat:['cancer'] },
  { symbol:'VHL',    name:'Von Hippel-Lindau tumor suppressor',      chr:'chr3',  start:10141788,  end:10153680,  cat:['cancer'] },
  { symbol:'RET',    name:'Ret proto-oncogene',                      chr:'chr10', start:43077068,  end:43130351,  cat:['cancer'] },
  { symbol:'NF2',    name:'Neurofibromin 2',                         chr:'chr22', start:29603556,  end:29698600,  cat:['cancer'] },
  { symbol:'TSC1',   name:'TSC complex subunit 1',                   chr:'chr9',  start:132891348, end:132945370, cat:['cancer','rare_disease'] },
  { symbol:'TSC2',   name:'TSC complex subunit 2',                   chr:'chr16', start:2047936,   end:2089491,   cat:['cancer','rare_disease'] },
  { symbol:'SMAD4',  name:'SMAD family member 4',                    chr:'chr18', start:51028394,  end:51085042,  cat:['cancer'] },
  { symbol:'CDH1',   name:'Cadherin 1',                              chr:'chr16', start:68737292,  end:68835537,  cat:['cancer'] },
  { symbol:'STK11',  name:'Serine/threonine kinase 11',              chr:'chr19', start:1205798,   end:1228434,   cat:['cancer'] },
  { symbol:'MUTYH',  name:'MutY DNA glycosylase',                    chr:'chr1',  start:45329163,  end:45340470,  cat:['cancer'] },
  { symbol:'MEN1',   name:'Menin 1',                                 chr:'chr11', start:64803513,  end:64809864,  cat:['cancer'] },
  { symbol:'SDHB',   name:'Succinate dehydrogenase complex B',       chr:'chr1',  start:17345216,  end:17380670,  cat:['cancer'] },
  { symbol:'SDHC',   name:'Succinate dehydrogenase complex C',       chr:'chr1',  start:161284197, end:161335450, cat:['cancer'] },
  { symbol:'SDHD',   name:'Succinate dehydrogenase complex D',       chr:'chr11', start:112086872, end:112095901, cat:['cancer'] },
  { symbol:'SDHAF2', name:'SDH assembly factor 2',                   chr:'chr11', start:61395750,  end:61415080,  cat:['cancer'] },
  { symbol:'BMPR1A', name:'Bone morphogenetic protein receptor 1A',  chr:'chr10', start:86756602,  end:86932838,  cat:['cancer'] },
  { symbol:'PALB2',  name:'Partner and localizer of BRCA2',          chr:'chr16', start:23603160,  end:23641310,  cat:['cancer'] },
  { symbol:'ATM',    name:'ATM serine/threonine kinase',             chr:'chr11', start:108222484, end:108369102, cat:['cancer'] },
  { symbol:'CHEK2',  name:'Checkpoint kinase 2',                     chr:'chr22', start:28687743,  end:28742422,  cat:['cancer'] },
  { symbol:'RAD51C', name:'RAD51 paralog C',                         chr:'chr17', start:58692573,  end:58735611,  cat:['cancer'] },
  { symbol:'RAD51D', name:'RAD51 paralog D',                         chr:'chr17', start:35097661,  end:35109468,  cat:['cancer'] },
  { symbol:'BAP1',   name:'BRCA1 associated protein 1',              chr:'chr3',  start:52401064,  end:52411444,  cat:['cancer'] },
  { symbol:'DICER1', name:'Dicer 1 ribonuclease III',                chr:'chr14', start:95086226,  end:95158010,  cat:['cancer'] },
  { symbol:'WT1',    name:'WT1 transcription factor',                chr:'chr11', start:32389071,  end:32435260,  cat:['cancer'] },
  { symbol:'CDK4',   name:'Cyclin dependent kinase 4',               chr:'chr12', start:57747727,  end:57752447,  cat:['cancer'] },
  { symbol:'CDKN2A', name:'Cyclin dependent kinase inhibitor 2A',    chr:'chr9',  start:21967752,  end:21995301,  cat:['cancer'] },
  { symbol:'BRIP1',  name:'BRCA1 interacting helicase 1',            chr:'chr17', start:61679186,  end:61863558,  cat:['cancer'] },
  { symbol:'EPCAM',  name:'Epithelial cell adhesion molecule',       chr:'chr2',  start:47345163,  end:47387601,  cat:['cancer'] },

  // ── ACMG SF v3.2 — Cardiovascular ───────────────────────────────
  { symbol:'SCN5A',  name:'Sodium voltage-gated channel alpha 5',    chr:'chr3',  start:38548062,  end:38649172,  cat:['cardio'] },
  { symbol:'FBN1',   name:'Fibrillin 1',                             chr:'chr15', start:48408313,  end:48645709,  cat:['cardio'] },
  { symbol:'MYH7',   name:'Myosin heavy chain 7',                    chr:'chr14', start:23412738,  end:23435747,  cat:['cardio'] },
  { symbol:'MYBPC3', name:'Myosin binding protein C3',               chr:'chr11', start:47331397,  end:47352694,  cat:['cardio'] },
  { symbol:'KCNQ1',  name:'Potassium channel voltage-gated Q1',     chr:'chr11', start:2444990,   end:2849109,   cat:['cardio'] },
  { symbol:'KCNH2',  name:'Potassium channel voltage-gated H2',     chr:'chr7',  start:150642043,  end:150675403, cat:['cardio'] },
  { symbol:'LMNA',   name:'Lamin A/C',                               chr:'chr1',  start:156052369, end:156109880, cat:['cardio'] },
  { symbol:'DSP',    name:'Desmoplakin',                              chr:'chr6',  start:7541736,   end:7586946,   cat:['cardio'] },
  { symbol:'PKP2',   name:'Plakophilin 2',                           chr:'chr12', start:32828894,  end:32920045,  cat:['cardio'] },
  { symbol:'DSC2',   name:'Desmocollin 2',                           chr:'chr18', start:31060036,  end:31100734,  cat:['cardio'] },
  { symbol:'DSG2',   name:'Desmoglein 2',                            chr:'chr18', start:31494819,  end:31543377,  cat:['cardio'] },
  { symbol:'TMEM43', name:'Transmembrane protein 43',                chr:'chr3',  start:14125770,  end:14153615,  cat:['cardio'] },
  { symbol:'RYR2',   name:'Ryanodine receptor 2',                    chr:'chr1',  start:237042318, end:237833982, cat:['cardio'] },
  { symbol:'ACTC1',  name:'Actin alpha cardiac muscle 1',            chr:'chr15', start:34784865,  end:34791222,  cat:['cardio'] },
  { symbol:'MYL2',   name:'Myosin light chain 2',                    chr:'chr12', start:110919127, end:110932426, cat:['cardio'] },
  { symbol:'MYL3',   name:'Myosin light chain 3',                    chr:'chr3',  start:46886504,  end:46893728,  cat:['cardio'] },
  { symbol:'TNNT2',  name:'Troponin T2 cardiac type',                chr:'chr1',  start:201328136, end:201346805, cat:['cardio'] },
  { symbol:'TNNI3',  name:'Troponin I3 cardiac type',                chr:'chr19', start:55151322,  end:55157716,  cat:['cardio'] },
  { symbol:'TNNC1',  name:'Troponin C1 slow skeletal/cardiac',       chr:'chr3',  start:52451068,  end:52454073,  cat:['cardio'] },
  { symbol:'TPM1',   name:'Tropomyosin 1',                           chr:'chr15', start:63044783,  end:63073455,  cat:['cardio'] },
  { symbol:'MYH11',  name:'Myosin heavy chain 11',                   chr:'chr16', start:15703143,  end:15857040,  cat:['cardio'] },
  { symbol:'ACTA2',  name:'Actin alpha 2 smooth muscle',             chr:'chr10', start:88935075,  end:88991139,  cat:['cardio'] },
  { symbol:'TGFBR1', name:'TGF beta receptor 1',                    chr:'chr9',  start:99104038,   end:99154192,  cat:['cardio'] },
  { symbol:'TGFBR2', name:'TGF beta receptor 2',                    chr:'chr3',  start:30606502,   end:30694142,  cat:['cardio'] },
  { symbol:'SMAD3',  name:'SMAD family member 3',                    chr:'chr15', start:67063763,  end:67195195,  cat:['cardio'] },
  { symbol:'COL3A1', name:'Collagen type III alpha 1 chain',         chr:'chr2',  start:188974373, end:189012746, cat:['cardio'] },
  { symbol:'FLNC',   name:'Filamin C',                               chr:'chr7',  start:128829501, end:128859255, cat:['cardio'] },
  { symbol:'CACNA1S',name:'Calcium channel voltage-dependent L S',   chr:'chr1',  start:201008702, end:201081702, cat:['cardio'] },

  // ── ACMG SF v3.2 — Metabolic / Other ───────────────────────────
  { symbol:'LDLR',   name:'Low density lipoprotein receptor',        chr:'chr19', start:11089362,  end:11133830,  cat:['cardio'] },
  { symbol:'APOB',   name:'Apolipoprotein B',                        chr:'chr2',  start:21001429,  end:21044073,  cat:['cardio'] },
  { symbol:'PCSK9',  name:'Proprotein convertase subtilisin/kexin 9',chr:'chr1',  start:55039475,  end:55064852,  cat:['cardio'] },
  { symbol:'ATP7B',  name:'ATPase copper transporting beta',         chr:'chr13', start:51930572,  end:52012297,  cat:['rare_disease'] },
  { symbol:'GAA',    name:'Alpha glucosidase acid',                  chr:'chr17', start:80101535,  end:80119881,  cat:['rare_disease'] },
  { symbol:'GLA',    name:'Galactosidase alpha',                     chr:'chrX',  start:101397803, end:101407925, cat:['rare_disease'] },
  { symbol:'HFE',    name:'Homeostatic iron regulator',              chr:'chr6',  start:26087282,  end:26098571,  cat:['rare_disease'] },
  { symbol:'BTD',    name:'Biotinidase',                              chr:'chr3',  start:15618835,  end:15663980,  cat:['rare_disease','nicu'] },
  { symbol:'OTC',    name:'Ornithine transcarbamylase',              chr:'chrX',  start:38211847,  end:38280703,  cat:['rare_disease','nicu'] },
  { symbol:'SERPINA1',name:'Serpin family A member 1',               chr:'chr14', start:94376747,  end:94390693,  cat:['rare_disease'] },
  { symbol:'RYR1',   name:'Ryanodine receptor 1',                    chr:'chr19', start:38433691,  end:38587466,  cat:['rare_disease'] },

  // ── Neonatal / Rare Disease Core ────────────────────────────────
  { symbol:'CFTR',   name:'CF transmembrane conductance regulator',  chr:'chr7',  start:117287120, end:117715971, cat:['nicu','rare_disease'] },
  { symbol:'SMN1',   name:'Survival of motor neuron 1',              chr:'chr5',  start:70924941,  end:70953015,  cat:['nicu','rare_disease'] },
  { symbol:'SMN2',   name:'Survival of motor neuron 2',              chr:'chr5',  start:70049524,  end:70077595,  cat:['nicu','rare_disease'] },
  { symbol:'DMD',    name:'Dystrophin',                               chr:'chrX',  start:31097677,  end:33339609,  cat:['nicu','rare_disease'] },
  { symbol:'NF1',    name:'Neurofibromin 1',                          chr:'chr17', start:31094927,  end:31377677,  cat:['nicu','rare_disease','cancer'] },
  { symbol:'PKD1',   name:'Polycystin 1',                             chr:'chr16', start:2138710,   end:2185899,   cat:['rare_disease'] },
  { symbol:'PKD2',   name:'Polycystin 2',                             chr:'chr4',  start:88007657,  end:88077777,  cat:['rare_disease'] },
  { symbol:'HBB',    name:'Hemoglobin subunit beta',                  chr:'chr11', start:5225464,   end:5229395,   cat:['nicu','rare_disease'] },
  { symbol:'HBA1',   name:'Hemoglobin subunit alpha 1',              chr:'chr16', start:176681,    end:177522,    cat:['nicu','rare_disease'] },
  { symbol:'HBA2',   name:'Hemoglobin subunit alpha 2',              chr:'chr16', start:172847,    end:173710,    cat:['nicu','rare_disease'] },
  { symbol:'HEXA',   name:'Hexosaminidase subunit alpha',            chr:'chr15', start:72338399,  end:72371610,  cat:['nicu','rare_disease'] },
  { symbol:'PAH',    name:'Phenylalanine hydroxylase',               chr:'chr12', start:102836889, end:102958410, cat:['nicu','rare_disease'] },
  { symbol:'GBA1',   name:'Glucosylceramidase beta 1',               chr:'chr1',  start:155234452, end:155244699, cat:['nicu','rare_disease'] },
  { symbol:'ASPA',   name:'Aspartoacylase',                           chr:'chr17', start:3476948,   end:3507338,   cat:['nicu','rare_disease'] },
  { symbol:'FANCC',  name:'FA complementation group C',              chr:'chr9',  start:97861332,  end:98079480,  cat:['nicu','rare_disease'] },
  { symbol:'CYP21A2',name:'Cytochrome P450 family 21 A2',           chr:'chr6',  start:32038265,  end:32041670,  cat:['nicu','rare_disease'] },
  { symbol:'SLC12A3',name:'Solute carrier family 12 member 3',      chr:'chr16', start:56872026,  end:56931939,  cat:['rare_disease'] },
  { symbol:'MEFV',   name:'MEFV innate immunity regulator',          chr:'chr16', start:3242173,   end:3256627,   cat:['rare_disease'] },
  { symbol:'COL1A1', name:'Collagen type I alpha 1 chain',           chr:'chr17', start:50184101,  end:50201632,  cat:['rare_disease'] },
  { symbol:'COL1A2', name:'Collagen type I alpha 2 chain',           chr:'chr7',  start:94394561,  end:94431232,  cat:['rare_disease'] },
  { symbol:'FGFR3',  name:'Fibroblast growth factor receptor 3',    chr:'chr4',  start:1793293,   end:1808872,   cat:['nicu','rare_disease'] },
  { symbol:'DMPK',   name:'DM1 protein kinase',                      chr:'chr19', start:45769709,  end:45782556,  cat:['rare_disease'] },
  { symbol:'FMR1',   name:'Fragile X messenger ribonucleoprotein 1', chr:'chrX',  start:147911919, end:147951127, cat:['nicu','rare_disease'] },
  { symbol:'HTT',    name:'Huntingtin',                               chr:'chr4',  start:3074681,   end:3243959,   cat:['rare_disease'] },
  { symbol:'MECP2',  name:'Methyl CpG binding protein 2',            chr:'chrX',  start:154021573, end:154097717, cat:['nicu','rare_disease'] },
  { symbol:'SCN1A',  name:'Sodium voltage-gated channel alpha 1',    chr:'chr2',  start:165990038, end:166149176, cat:['nicu','rare_disease'] },
  { symbol:'KCNJ11', name:'Potassium inwardly-rectifying channel J11',chr:'chr11', start:17385248,  end:17389382,  cat:['nicu','rare_disease'] },
  { symbol:'ABCC8',  name:'ATP binding cassette subfamily C8',       chr:'chr11', start:17414432,  end:17498449,  cat:['nicu','rare_disease'] },
  { symbol:'GJB2',   name:'Gap junction protein beta 2',              chr:'chr13', start:20187470,  end:20192938,  cat:['nicu','rare_disease'] },
  { symbol:'SLC26A4',name:'Solute carrier family 26 member 4',      chr:'chr7',  start:107660828, end:107717790, cat:['nicu','rare_disease'] },
  { symbol:'ACADM',  name:'Acyl-CoA dehydrogenase medium chain',    chr:'chr1',  start:75724347,  end:75763678,  cat:['nicu','rare_disease'] },
  { symbol:'ACADL',  name:'Acyl-CoA dehydrogenase long chain',      chr:'chr2',  start:210179702, end:210214379, cat:['nicu','rare_disease'] },
  { symbol:'HADHA',  name:'Hydroxyacyl-CoA dehydrogenase alpha',    chr:'chr2',  start:26190634,  end:26242531,  cat:['nicu','rare_disease'] },
  { symbol:'IVD',    name:'Isovaleryl-CoA dehydrogenase',           chr:'chr15', start:40384464,  end:40400660,  cat:['nicu','rare_disease'] },
  { symbol:'BCKDHA', name:'BCKD E1 subunit alpha',                  chr:'chr19', start:41399093,  end:41424627,  cat:['nicu','rare_disease'] },
  { symbol:'GALT',   name:'Galactose-1-phosphate uridylyltransferase',chr:'chr9', start:34636562,  end:34640421,  cat:['nicu','rare_disease'] },
  { symbol:'PCCA',   name:'Propionyl-CoA carboxylase subunit A',    chr:'chr13', start:100315277, end:100638133, cat:['nicu','rare_disease'] },
  { symbol:'PCCB',   name:'Propionyl-CoA carboxylase subunit B',    chr:'chr3',  start:135969258, end:136075822, cat:['nicu','rare_disease'] },
  { symbol:'MUT',    name:'Methylmalonyl-CoA mutase',                chr:'chr6',  start:49397858,  end:49430458,  cat:['nicu','rare_disease'] },
  { symbol:'ASS1',   name:'Argininosuccinate synthase 1',            chr:'chr9',  start:130444834, end:130501736, cat:['nicu','rare_disease'] },
  { symbol:'ASL',    name:'Argininosuccinate lyase',                  chr:'chr7',  start:66068784,  end:66086160,  cat:['nicu','rare_disease'] },
  { symbol:'SLC22A5',name:'Carnitine transporter OCTN2',            chr:'chr5',  start:132369677, end:132395507, cat:['nicu','rare_disease'] },
  { symbol:'MMACHC', name:'Metabolism of cobalamin associated C',    chr:'chr1',  start:45508583,  end:45519773,  cat:['nicu','rare_disease'] },
  { symbol:'CBS',    name:'Cystathionine beta-synthase',              chr:'chr21', start:43053190,  end:43076627,  cat:['nicu','rare_disease'] },
  { symbol:'GCDH',   name:'Glutaryl-CoA dehydrogenase',             chr:'chr19', start:12886478,  end:12896047,  cat:['nicu','rare_disease'] },
  { symbol:'BCKDHB', name:'BCKD E1 subunit beta',                   chr:'chr6',  start:80149662,  end:80381030,  cat:['nicu','rare_disease'] },
  { symbol:'DBT',    name:'Dihydrolipoamide branched chain transacylase',chr:'chr1', start:100130798, end:100199648, cat:['nicu','rare_disease'] },
  { symbol:'ETFA',   name:'Electron transfer flavoprotein subunit A',chr:'chr15', start:76168613,  end:76196437,  cat:['nicu','rare_disease'] },
  { symbol:'ETFB',   name:'Electron transfer flavoprotein subunit B',chr:'chr19', start:43525917,  end:43537506,  cat:['nicu','rare_disease'] },
  { symbol:'ETFDH',  name:'Electron transfer flavoprotein dehydrogenase',chr:'chr4', start:158676730, end:158720483, cat:['nicu','rare_disease'] },

  // ── Pharmacogenomics ────────────────────────────────────────────
  { symbol:'CYP2D6', name:'Cytochrome P450 2D6',                    chr:'chr22', start:42126499,  end:42130881,  cat:['pgx'] },
  { symbol:'CYP2C19',name:'Cytochrome P450 2C19',                   chr:'chr10', start:94762681,  end:94855547,  cat:['pgx'] },
  { symbol:'CYP2C9', name:'Cytochrome P450 2C9',                    chr:'chr10', start:94938683,  end:94990091,  cat:['pgx'] },
  { symbol:'CYP3A4', name:'Cytochrome P450 3A4',                    chr:'chr7',  start:99756960,  end:99784265,  cat:['pgx'] },
  { symbol:'CYP3A5', name:'Cytochrome P450 3A5',                    chr:'chr7',  start:99648194,  end:99680953,  cat:['pgx'] },
  { symbol:'CYP1A2', name:'Cytochrome P450 1A2',                    chr:'chr15', start:74748820,  end:74756668,  cat:['pgx'] },
  { symbol:'CYP2B6', name:'Cytochrome P450 2B6',                    chr:'chr19', start:41004947,  end:41032020,  cat:['pgx'] },
  { symbol:'DPYD',   name:'Dihydropyrimidine dehydrogenase',        chr:'chr1',  start:97543299,  end:98386615,  cat:['pgx'] },
  { symbol:'TPMT',   name:'Thiopurine S-methyltransferase',         chr:'chr6',  start:18128542,  end:18155374,  cat:['pgx'] },
  { symbol:'NUDT15', name:'Nudix hydrolase 15',                      chr:'chr13', start:48037687,  end:48047403,  cat:['pgx'] },
  { symbol:'VKORC1', name:'Vitamin K epoxide reductase complex 1',  chr:'chr16', start:31090855,  end:31096068,  cat:['pgx'] },
  { symbol:'UGT1A1', name:'UDP glucuronosyltransferase 1A1',        chr:'chr2',  start:233757876, end:233773299, cat:['pgx'] },
  { symbol:'SLCO1B1',name:'Solute carrier organic anion 1B1',       chr:'chr12', start:21130388,  end:21241068,  cat:['pgx'] },
  { symbol:'ABCG2',  name:'ATP-binding cassette sub-family G2',     chr:'chr4',  start:88090264,  end:88158898,  cat:['pgx'] },
  { symbol:'NAT2',   name:'N-acetyltransferase 2',                   chr:'chr8',  start:18248755,  end:18258723,  cat:['pgx'] },
  { symbol:'G6PD',   name:'Glucose-6-phosphate dehydrogenase',      chr:'chrX',  start:154531391, end:154547572, cat:['pgx','nicu'] },
  { symbol:'IFNL3',  name:'Interferon lambda 3',                     chr:'chr19', start:39243142,  end:39245034,  cat:['pgx'] },
  { symbol:'CACNA1C',name:'Calcium voltage-gated channel alpha1 C', chr:'chr12', start:1970786,   end:2697950,   cat:['pgx'] },
  { symbol:'ANKK1',  name:'Ankyrin repeat and kinase domain 1',     chr:'chr11', start:113386140, end:113400418, cat:['pgx'] },

  // ── Additional Cancer (commonly tested) ─────────────────────────
  { symbol:'KRAS',   name:'KRAS proto-oncogene',                     chr:'chr12', start:25205246,  end:25250936,  cat:['cancer'] },
  { symbol:'BRAF',   name:'B-Raf proto-oncogene',                    chr:'chr7',  start:140719327, end:140924929, cat:['cancer'] },
  { symbol:'EGFR',   name:'Epidermal growth factor receptor',       chr:'chr7',  start:55019017,  end:55211628,  cat:['cancer'] },
  { symbol:'ALK',    name:'ALK receptor tyrosine kinase',            chr:'chr2',  start:29192774,  end:29921566,  cat:['cancer'] },
  { symbol:'ERBB2',  name:'Erb-b2 receptor tyrosine kinase 2',      chr:'chr17', start:39687914,  end:39730426,  cat:['cancer'] },
  { symbol:'PIK3CA', name:'PI3K catalytic subunit alpha',            chr:'chr3',  start:179148114, end:179240093, cat:['cancer'] },
  { symbol:'NRAS',   name:'NRAS proto-oncogene',                     chr:'chr1',  start:114704469, end:114716771, cat:['cancer'] },
  { symbol:'MET',    name:'MET proto-oncogene',                      chr:'chr7',  start:116672196, end:116798386, cat:['cancer'] },
  { symbol:'KIT',    name:'KIT proto-oncogene',                      chr:'chr4',  start:54657918,  end:54740715,  cat:['cancer'] },
  { symbol:'PDGFRA', name:'Platelet derived growth factor receptor A',chr:'chr4', start:54229097,  end:54298245,  cat:['cancer'] },
  { symbol:'IDH1',   name:'Isocitrate dehydrogenase 1',             chr:'chr2',  start:208236227, end:208255071, cat:['cancer'] },
  { symbol:'IDH2',   name:'Isocitrate dehydrogenase 2',             chr:'chr15', start:90083045,  end:90102474,  cat:['cancer'] },
  { symbol:'FGFR2',  name:'Fibroblast growth factor receptor 2',    chr:'chr10', start:121478332, end:121598458, cat:['cancer'] },
  { symbol:'FGFR1',  name:'Fibroblast growth factor receptor 1',    chr:'chr8',  start:38411139,  end:38468834,  cat:['cancer'] },
  { symbol:'ROS1',   name:'ROS proto-oncogene 1',                    chr:'chr6',  start:117288300, end:117425769, cat:['cancer'] },
  { symbol:'NTRK1',  name:'Neurotrophic receptor tyrosine kinase 1',chr:'chr1',  start:156815751, end:156881850, cat:['cancer'] },
  { symbol:'NTRK2',  name:'Neurotrophic receptor tyrosine kinase 2',chr:'chr9',  start:84668395,  end:85020940,  cat:['cancer'] },
  { symbol:'NTRK3',  name:'Neurotrophic receptor tyrosine kinase 3',chr:'chr15', start:87859721,  end:88256692,  cat:['cancer'] },

  // ── Additional Rare Disease (commonly screened in NICU) ─────────
  { symbol:'ABCA4',  name:'ATP binding cassette subfamily A4',      chr:'chr1',  start:94458394,  end:94586688,  cat:['rare_disease'] },
  { symbol:'USH2A',  name:'Usherin',                                  chr:'chr1',  start:215622891, end:216423448, cat:['rare_disease'] },
  { symbol:'DYSF',   name:'Dysferlin',                                chr:'chr2',  start:71453143,  end:71686763,  cat:['rare_disease'] },
  { symbol:'SGCG',   name:'Sarcoglycan gamma',                       chr:'chr13', start:23290210,  end:23481427,  cat:['rare_disease'] },
  { symbol:'LAMA2',  name:'Laminin subunit alpha 2',                 chr:'chr6',  start:129204285, end:129837710, cat:['rare_disease'] },
  { symbol:'EYA1',   name:'EYA transcriptional coactivator 1',      chr:'chr8',  start:71197678,  end:71562993,  cat:['rare_disease'] },
  { symbol:'FOXP3',  name:'Forkhead box P3',                         chr:'chrX',  start:49250436,  end:49266240,  cat:['rare_disease','nicu'] },
  { symbol:'IL2RG',  name:'Interleukin 2 receptor subunit gamma',   chr:'chrX',  start:71107404,  end:71111867,  cat:['nicu','rare_disease'] },
  { symbol:'ADA',    name:'Adenosine deaminase',                      chr:'chr20', start:44619522,  end:44652233,  cat:['nicu','rare_disease'] },
  { symbol:'JAG1',   name:'Jagged canonical Notch ligand 1',        chr:'chr20', start:10637684,  end:10674043,  cat:['nicu','rare_disease'] },
  { symbol:'NOTCH2', name:'Notch receptor 2',                        chr:'chr1',  start:119911553, end:120069148, cat:['nicu','rare_disease'] },
  { symbol:'PTCH1',  name:'Patched 1',                                chr:'chr9',  start:95444558,  end:95516754,  cat:['rare_disease'] },
  { symbol:'CLCN7',  name:'Chloride voltage-gated channel 7',       chr:'chr16', start:1493513,   end:1523614,   cat:['rare_disease'] },
  { symbol:'TCIRG1', name:'T cell immune regulator 1',               chr:'chr11', start:68039153,  end:68051508,  cat:['rare_disease'] },
  { symbol:'WAS',    name:'Wiskott-Aldrich syndrome protein',        chr:'chrX',  start:48683812,  end:48691421,  cat:['nicu','rare_disease'] },
  { symbol:'CYBB',   name:'Cytochrome b-245 beta chain',            chr:'chrX',  start:37639270,  end:37672714,  cat:['nicu','rare_disease'] },
  { symbol:'RAG1',   name:'Recombination activating 1',              chr:'chr11', start:36532252,  end:36543609,  cat:['nicu','rare_disease'] },
  { symbol:'RAG2',   name:'Recombination activating 2',              chr:'chr11', start:36573710,  end:36579795,  cat:['nicu','rare_disease'] },
  { symbol:'AIRE',   name:'Autoimmune regulator',                    chr:'chr21', start:44527491,  end:44540315,  cat:['rare_disease'] },
  { symbol:'PHOX2B', name:'Paired like homeobox 2B',                chr:'chr4',  start:41745971,  end:41750947,  cat:['nicu','rare_disease'] },
  { symbol:'GATA4',  name:'GATA binding protein 4',                  chr:'chr8',  start:11534468,  end:11617511,  cat:['cardio','nicu'] },
  { symbol:'NKX2-5', name:'NK2 homeobox 5',                          chr:'chr5',  start:173231356, end:173235199, cat:['cardio','nicu'] },
  { symbol:'TBX5',   name:'T-box transcription factor 5',           chr:'chr12', start:114354127, end:114406854, cat:['cardio','nicu'] },
  { symbol:'PTPN11', name:'Protein tyrosine phosphatase 11',        chr:'chr12', start:112418942, end:112509918, cat:['nicu','rare_disease'] },
  { symbol:'RAF1',   name:'Raf-1 proto-oncogene',                    chr:'chr3',  start:12583575,  end:12664272,  cat:['nicu','rare_disease'] },
  { symbol:'SOS1',   name:'SOS Ras/Rac guanine nucleotide exchange 1',chr:'chr2', start:38984283, end:39124477,  cat:['nicu','rare_disease'] },
  { symbol:'HRAS',   name:'HRas proto-oncogene',                     chr:'chr11', start:532242,    end:535550,    cat:['nicu','rare_disease'] },
  { symbol:'SPINK1', name:'Serine peptidase inhibitor Kazal type 1', chr:'chr5',  start:147688413, end:147699899, cat:['rare_disease'] },
  { symbol:'PRSS1',  name:'Serine protease 1',                       chr:'chr7',  start:142740198, end:142743550, cat:['rare_disease'] },
  { symbol:'CTRC',   name:'Chymotrypsin C',                          chr:'chr1',  start:15456672,  end:15464432,  cat:['rare_disease'] },
  { symbol:'ABCB4',  name:'ATP binding cassette subfamily B4',      chr:'chr7',  start:87396651,  end:87472356,  cat:['rare_disease'] },
  { symbol:'ABCB11', name:'ATP binding cassette subfamily B11',     chr:'chr2',  start:168919539, end:169030288, cat:['rare_disease'] },
  { symbol:'ATP8B1', name:'ATPase phospholipid transporting 8B1',   chr:'chr18', start:55311498,  end:55434273,  cat:['rare_disease'] },
  { symbol:'GNPTAB', name:'GlcNAc-1-phosphotransferase alpha/beta', chr:'chr12', start:101778715, end:101862283, cat:['rare_disease'] },
  { symbol:'IDUA',   name:'Alpha-L-iduronidase',                     chr:'chr4',  start:980621,    end:999215,    cat:['nicu','rare_disease'] },
  { symbol:'IDS',    name:'Iduronate 2-sulfatase',                    chr:'chrX',  start:149482613, end:149506582, cat:['nicu','rare_disease'] },
  { symbol:'SGSH',   name:'N-sulfoglucosamine sulfohydrolase',      chr:'chr17', start:80247135,  end:80258933,  cat:['nicu','rare_disease'] },
  { symbol:'NAGLU',  name:'N-acetyl-alpha-glucosaminidase',          chr:'chr17', start:42068704,  end:42076840,  cat:['nicu','rare_disease'] },
  { symbol:'GALNS',  name:'Galactosamine-6-sulfatase',               chr:'chr16', start:88875685,  end:88923207,  cat:['nicu','rare_disease'] },
  { symbol:'GLB1',   name:'Galactosidase beta 1',                    chr:'chr3',  start:33055524,  end:33150694,  cat:['nicu','rare_disease'] },
  { symbol:'ARSB',   name:'Arylsulfatase B',                         chr:'chr5',  start:78073060,  end:78278265,  cat:['nicu','rare_disease'] },
  { symbol:'GUSB',   name:'Glucuronidase beta',                      chr:'chr7',  start:65960684,  end:65982278,  cat:['nicu','rare_disease'] },
  { symbol:'HGSNAT', name:'Heparan-alpha-glucosaminide N-acetyltransferase',chr:'chr8', start:42994093, end:43063393, cat:['nicu','rare_disease'] },
  { symbol:'HEXB',   name:'Hexosaminidase subunit beta',             chr:'chr5',  start:74632142,  end:74710764,  cat:['nicu','rare_disease'] },
  { symbol:'PPT1',   name:'Palmitoyl-protein thioesterase 1',       chr:'chr1',  start:40538005,  end:40563376,  cat:['nicu','rare_disease'] },
  { symbol:'TPP1',   name:'Tripeptidyl peptidase 1',                 chr:'chr11', start:6612482,   end:6619980,   cat:['nicu','rare_disease'] },
  { symbol:'CLN3',   name:'CLN3 lysosomal/endosomal transmembrane', chr:'chr16', start:28477791,  end:28493508,  cat:['nicu','rare_disease'] },
];

// ═══════════════════════════════════════════════════════════════════
// GENE SEARCH INDEX
// Built once at load for fast autocomplete. Lowercase symbols,
// names, and aliases for prefix/substring matching.
// ═══════════════════════════════════════════════════════════════════
var GENE_INDEX = GENE_DB.map(function(g, idx) {
  return {
    idx: idx,
    lowerSymbol: g.symbol.toLowerCase(),
    lowerName: g.name.toLowerCase(),
    terms: (g.symbol + ' ' + g.name).toLowerCase()
  };
});

function searchGenes(query, limit) {
  if (!query) return [];
  var q = query.toLowerCase().trim();
  if (!q) return [];
  limit = limit || 10;

  // Score matches: exact symbol match > prefix match > substring match
  var scored = [];
  for (var i = 0; i < GENE_INDEX.length; i++) {
    var gi = GENE_INDEX[i];
    var score = 0;
    if (gi.lowerSymbol === q) score = 100;
    else if (gi.lowerSymbol.indexOf(q) === 0) score = 80;
    else if (gi.lowerSymbol.indexOf(q) >= 0) score = 60;
    else if (gi.lowerName.indexOf(q) >= 0) score = 40;
    else continue;
    scored.push({ gene: GENE_DB[gi.idx], score: score });
  }

  scored.sort(function(a, b) { return b.score - a.score; });
  return scored.slice(0, limit).map(function(s) { return s.gene; });
}

function getGeneBySymbol(symbol) {
  for (var i = 0; i < GENE_DB.length; i++) {
    if (GENE_DB[i].symbol === symbol) return GENE_DB[i];
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// PRESET PANELS (gene subsets by category)
// ═══════════════════════════════════════════════════════════════════
var PANEL_PRESETS = {
  cancer: {
    name: 'Cancer Predisposition Panel',
    genes: GENE_DB.filter(function(g) { return g.cat.indexOf('cancer') >= 0; })
  },
  cardio: {
    name: 'Cardiovascular Panel',
    genes: GENE_DB.filter(function(g) { return g.cat.indexOf('cardio') >= 0; })
  },
  neonatal: {
    name: 'Neonatal Core (NICU)',
    genes: GENE_DB.filter(function(g) { return g.cat.indexOf('nicu') >= 0; })
  },
  rare_disease: {
    name: 'Rare Disease (Mendeliome)',
    genes: GENE_DB.filter(function(g) { return g.cat.indexOf('rare_disease') >= 0; })
  },
  pgx: {
    name: 'Pharmacogenomics',
    genes: GENE_DB.filter(function(g) { return g.cat.indexOf('pgx') >= 0; })
  },
  whole_exome: {
    name: 'Whole Exome',
    genes: GENE_DB.slice() // all genes represent exome subset
  },
};
