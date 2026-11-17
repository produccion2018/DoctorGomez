/**
 * Catálogo de exámenes de laboratorio clínico usados en Colombia.
 * Cada examen: nombre (como se escribe en la orden), sinónimos / abreviaturas para buscar,
 * tipo de muestra y grupo. "remision" marca los que normalmente se procesan en un laboratorio
 * de referencia (pruebas especiales, biología molecular, etc.) o requieren condiciones especiales.
 *
 * No incluye códigos CUPS: se deben tomar de la tabla oficial vigente del Ministerio de Salud.
 * Para ampliar el catálogo, agregue filas en la lista del grupo que corresponda.
 */
export type TipoMuestra = "Sangre" | "Orina" | "Materia fecal" | "Cultivo" | "Otras muestras";
export type Examen = { nombre: string; sin: string[]; muestra: TipoMuestra; grupo: string; remision?: boolean; nota?: string };

// Formato de cada fila: "Nombre | sinónimo, sinónimo | *" (el * final = remisión / condición especial)
const G: { grupo: string; muestra: TipoMuestra; filas: string[] }[] = [
  { grupo: "Hematología", muestra: "Sangre", filas: [
    "Hemograma completo|cuadro hemático, CH, hemograma IV, biometría hemática, BHC, hemoleucograma",
    "Hemoglobina|Hb, Hgb",
    "Hematocrito|Hto, Hct",
    "Hemoglobina y hematocrito|Hb y Hto, H y H",
    "Recuento de plaquetas|plaquetas, PLT, trombocitos",
    "Recuento de leucocitos|leucocitos, glóbulos blancos, WBC",
    "Recuento diferencial de leucocitos|diferencial, fórmula leucocitaria",
    "Reticulocitos|recuento de reticulocitos",
    "Extendido de sangre periférica|frotis de sangre periférica, ESP, lámina periférica",
    "Velocidad de sedimentación (VSG)|VSG, eritrosedimentación, sedimentación globular, VES",
    "Grupo sanguíneo y Rh|hemoclasificación, grupo y Rh, ABO",
    "Prueba de Coombs directa|Coombs directo, antiglobulina directa",
    "Prueba de Coombs indirecta|Coombs indirecto, rastreo de anticuerpos irregulares",
    "Electroforesis de hemoglobina|electroforesis Hb, hemoglobinopatías|*",
    "Recuento de eosinófilos|eosinófilos",
    "Gota gruesa|malaria, paludismo, hemoparásitos",
  ]},
  { grupo: "Glucosa y diabetes", muestra: "Sangre", filas: [
    "Glucosa en ayunas|glicemia, glucemia, glicemia basal, glucosa basal, azúcar en sangre",
    "Glucosa posprandial|glicemia posprandial, glucemia pospandrial, glucosa 2 horas",
    "Glucometría|glucosa capilar, dextrometer, dextro",
    "Curva de tolerancia a la glucosa|PTOG, prueba de tolerancia oral a la glucosa, test de O'Sullivan, carga de glucosa",
    "Hemoglobina glicosilada (HbA1c)|HbA1c, A1c, hemoglobina glucosilada, hemoglobina glicada, glicohemoglobina",
    "Insulina|insulina basal, insulinemia",
    "Péptido C|peptido c",
    "Fructosamina|",
    "Índice HOMA|HOMA-IR, resistencia a la insulina",
  ]},
  { grupo: "Función renal y electrolitos", muestra: "Sangre", filas: [
    "Creatinina|creatinina sérica, creatinina en suero, TFG, filtrado glomerular, función renal",
    "Nitrógeno ureico (BUN)|BUN, nitrógeno ureico en sangre",
    "Urea|urea sérica",
    "Ácido úrico|uricemia, acido urico",
    "Cistatina C|cistatina",
    "Ionograma|electrolitos, electrolitos séricos, ionograma sérico, Na K Cl",
    "Sodio|Na, natremia",
    "Potasio|K, kalemia, potasemia",
    "Cloro|Cl, cloruro",
    "Calcio total|Ca, calcemia, calcio sérico",
    "Calcio iónico|calcio ionizado, Ca++",
    "Fósforo|fosfato, P",
    "Magnesio|Mg, magnesemia",
    "Bicarbonato|HCO3, CO2 total",
    "Osmolaridad sérica|osmolalidad",
  ]},
  { grupo: "Perfil lipídico", muestra: "Sangre", filas: [
    "Perfil lipídico|lípidos, lipidograma, perfil de lípidos, colesterol y triglicéridos",
    "Colesterol total|colesterol",
    "Colesterol HDL|HDL, colesterol bueno",
    "Colesterol LDL|LDL, colesterol malo, LDL directo",
    "Colesterol VLDL|VLDL",
    "Triglicéridos|TG, trigliceridos",
    "Apolipoproteína B|Apo B|*",
    "Lipoproteína (a)|Lp(a), lipoproteína a|*",
  ]},
  { grupo: "Hígado y páncreas", muestra: "Sangre", filas: [
    "Pruebas de función hepática|perfil hepático, PFH, pruebas hepáticas",
    "Transaminasas (AST/TGO, ALT/TGP)|transaminasas, TGO, TGP, AST, ALT, GOT, GPT",
    "Aspartato aminotransferasa (AST/TGO)|AST, TGO, GOT",
    "Alanina aminotransferasa (ALT/TGP)|ALT, TGP, GPT",
    "Bilirrubinas|bilirrubina total y directa, bilirrubina indirecta, BT BD BI",
    "Fosfatasa alcalina|FA, FAL, ALP",
    "Gamma GT (GGT)|GGT, gamma glutamil transferasa, gamma glutamil transpeptidasa",
    "Albúmina|albumina sérica",
    "Proteínas totales|proteínas totales y diferenciadas, relación albúmina/globulina",
    "Deshidrogenasa láctica (LDH)|LDH, DHL, lactato deshidrogenasa",
    "Amilasa|amilasa sérica",
    "Lipasa|lipasa sérica",
    "Amonio|amoníaco",
  ]},
  { grupo: "Corazón y músculo", muestra: "Sangre", filas: [
    "Troponina|troponina I, troponina T, TnI, TnT, troponina ultrasensible, hs-troponina",
    "CPK total|CPK, CK, creatina quinasa, creatina fosfoquinasa, creatinfosfoquinasa, creatinquinasa",
    "CK-MB|CKMB, CPK MB, creatina quinasa MB, fracción MB",
    "NT-proBNP|BNP, péptido natriurético, pro BNP, péptido natriurético cerebral",
    "Mioglobina|",
    "Dímero D|dimero D, D-dímero",
    "Homocisteína|homocisteina|*",
  ]},
  { grupo: "Coagulación", muestra: "Sangre", filas: [
    "Tiempo de protrombina (TP/INR)|TP, INR, PT, tiempo de protrombina",
    "Tiempo parcial de tromboplastina (TPT)|TPT, PTT, TTPa, TTP",
    "Fibrinógeno|fibrinogeno",
    "Tiempo de trombina|TT",
    "Anti factor Xa|anti-Xa, heparina de bajo peso|*",
    "Factor VIII|factor 8|*",
    "Anticoagulante lúpico|lupus anticoagulante|*",
  ]},
  { grupo: "Inflamación e infección", muestra: "Sangre", filas: [
    "Proteína C reactiva (PCR)|PCR, PCR cuantitativa, proteína C reactiva ultrasensible, hs-PCR",
    "Procalcitonina|PCT",
    "Ferritina|ferritina sérica",
    "Lactato|ácido láctico, lactato sérico",
    "Antiestreptolisinas (ASTOs)|ASO, ASTO, antiestreptolisina O",
  ]},
  { grupo: "Hierro y vitaminas", muestra: "Sangre", filas: [
    "Hierro sérico|Fe, sideremia, hierro",
    "Transferrina|",
    "Capacidad de fijación del hierro (TIBC)|TIBC, capacidad total de fijación, saturación de transferrina, perfil de hierro",
    "Vitamina B12|B12, cobalamina, cianocobalamina",
    "Ácido fólico|folato, folatos séricos",
    "Vitamina D|25 OH vitamina D, 25-hidroxivitamina D, calcidiol",
    "Zinc|zinc sérico|*",
  ]},
  { grupo: "Tiroides y hormonas", muestra: "Sangre", filas: [
    "TSH|hormona estimulante de tiroides, tirotropina, tiroides",
    "T4 libre|T4L, tiroxina libre, FT4",
    "T4 total|tiroxina total",
    "T3|T3 total, triyodotironina",
    "T3 libre|FT3",
    "Anticuerpos antiperoxidasa (anti-TPO)|anti TPO, antitiroideos, antimicrosomales",
    "Anticuerpos antitiroglobulina|anti TG",
    "Tiroglobulina|",
    "Hormona paratiroidea (PTH)|PTH, paratohormona, parathormona, PTH intacta",
    "Cortisol|cortisol sérico, cortisol AM",
    "ACTH|corticotropina|*",
    "Prolactina|PRL",
    "Hormona foliculoestimulante (FSH)|FSH",
    "Hormona luteinizante (LH)|LH",
    "Estradiol|E2",
    "Progesterona|",
    "Testosterona total|testosterona",
    "Testosterona libre|*",
    "Gonadotropina coriónica (HCG beta)|prueba de embarazo en sangre, BHCG, beta HCG, HCG cuantitativa",
    "Hormona de crecimiento (GH)|GH, somatotropina|*",
    "Aldosterona|*",
    "Renina|actividad de renina plasmática|*",
    "Metanefrinas plasmáticas|metanefrinas|*",
  ]},
  { grupo: "Marcadores tumorales", muestra: "Sangre", filas: [
    "Antígeno prostático (PSA)|PSA, PSA total, antígeno prostático específico",
    "PSA libre|antígeno prostático libre",
    "Antígeno carcinoembrionario (CEA)|CEA, ACE",
    "CA 125|CA-125",
    "CA 19-9|CA19-9",
    "CA 15-3|CA15-3",
    "Alfafetoproteína (AFP)|AFP, alfa feto proteína",
    "Beta 2 microglobulina|*",
  ]},
  { grupo: "Inmunología y reumatología", muestra: "Sangre", filas: [
    "Factor reumatoide|FR, látex",
    "Anticuerpos antinucleares (ANA)|ANA, antinucleares, ANAS",
    "Anticuerpos anti-DNA|anti DNA, anti dsDNA",
    "Anticuerpos anti-péptido citrulinado (anti-CCP)|anti CCP, ACPA|*",
    "ANCA|anticuerpos anticitoplasma de neutrófilo|*",
    "Anticuerpos antifosfolípidos|anticardiolipinas, beta 2 glicoproteína|*",
    "Complemento C3|C3",
    "Complemento C4|C4",
    "Inmunoglobulina IgE total|IgE",
    "Inmunoglobulinas (IgG, IgA, IgM)|IgG, IgA, IgM",
    "Electroforesis de proteínas|proteinograma|*",
  ]},
  { grupo: "Serologías e infecciosas", muestra: "Sangre", filas: [
    "VIH (prueba de cuarta generación)|VIH, HIV, ELISA VIH, prueba de VIH, Ag/Ac VIH",
    "Carga viral VIH|*",
    "Hepatitis B (HBsAg)|HBsAg, antígeno de superficie hepatitis B",
    "Anticuerpos anti-core hepatitis B (anti-HBc)|anti HBc, core total",
    "Anticuerpos anti-HBs|anti HBs, anticuerpos de superficie, títulos hepatitis B",
    "Hepatitis C (anticuerpos)|VHC, HCV, anti HCV, hepatitis C",
    "Hepatitis A IgM|VHA, HAV IgM",
    "VDRL|sífilis, serología, RPR, prueba no treponémica",
    "Prueba treponémica para sífilis|FTA-ABS, TPHA, prueba rápida sífilis",
    "Toxoplasma IgG e IgM|toxoplasmosis, TORCH",
    "Rubéola IgG e IgM|rubeola",
    "Citomegalovirus IgG e IgM|CMV",
    "Dengue NS1|antígeno NS1, dengue",
    "Dengue IgG e IgM|serología dengue",
    "Chikungunya IgM|*",
    "Antígeno febriles|febriles, Widal, Huddleson, Weil-Felix",
    "Epstein-Barr IgM|mononucleosis, VCA|*",
    "Helicobacter pylori (anticuerpos)|H. pylori en sangre",
    "Prueba de antígeno SARS-CoV-2|COVID antígeno, prueba rápida COVID",
  ]},
  { grupo: "Gases y medio interno", muestra: "Sangre", filas: [
    "Gases arteriales|gasometría arterial, GA, pH arterial",
    "Gases venosos|gasometría venosa",
  ]},
  { grupo: "Niveles de medicamentos", muestra: "Sangre", filas: [
    "Niveles de digoxina|digoxinemia|*",
    "Niveles de vancomicina|vancomicinemia|*",
    "Niveles de tacrolimus|*",
    "Niveles de ácido valproico|valproato|*",
    "Niveles de fenitoína|*",
    "Niveles de litio|litemia|*",
  ]},
  { grupo: "Orina", muestra: "Orina", filas: [
    "Uroanálisis|parcial de orina, orina completa, citoquímico de orina, examen general de orina, EGO, orina",
    "Sedimento urinario|sedimento de orina",
    "Proteinuria en orina de 24 horas|proteínas en orina de 24 h, proteinuria 24 h",
    "Depuración de creatinina en orina de 24 horas|depuración de creatinina, aclaramiento de creatinina, DCE",
    "Microalbuminuria|albuminuria, albúmina en orina, microalbúmina",
    "Relación albúmina/creatinina en orina|RAC, índice albúmina creatinina, microalbuminuria aislada",
    "Relación proteína/creatinina en orina|RPC, índice proteinuria creatinuria",
    "Creatinina en orina|creatinuria",
    "Electrolitos en orina|sodio urinario, potasio urinario, ionograma urinario",
    "Calcio en orina de 24 horas|calciuria",
    "Ácido úrico en orina|uricosuria",
    "Prueba de embarazo en orina|HCG en orina, test de embarazo",
    "Osmolaridad urinaria|osmolalidad en orina",
    "Gram de orina sin centrifugar|gram de orina",
    "Drogas de abuso en orina|toxicológico, cannabis, cocaína|*",
  ]},
  { grupo: "Materia fecal", muestra: "Materia fecal", filas: [
    "Coprológico|examen de heces, coproscópico, parasitológico, coprológico directo, copro",
    "Coproscópico|coprológico, análisis de materia fecal",
    "Coprológico por concentración|parasitológico seriado, coprológico seriado",
    "Sangre oculta en heces|SOH, sangre oculta en materia fecal, guayaco, test inmunoquímico fecal, FIT",
    "Rotavirus en heces|rotavirus",
    "Helicobacter pylori en heces (antígeno)|antígeno H. pylori",
    "Calprotectina fecal|calprotectina|*",
    "Azúcares reductores en heces|sustancias reductoras",
    "pH fecal|",
    "Leucocitos en heces|moco fecal",
  ]},
  { grupo: "Cultivos y microbiología", muestra: "Cultivo", filas: [
    "Hemocultivo|cultivo de sangre, hemocultivos",
    "Urocultivo|cultivo de orina, urocultivo con antibiograma",
    "Coprocultivo|cultivo de heces, cultivo de materia fecal",
    "Cultivo de secreción de herida|cultivo de herida, cultivo de úlcera",
    "Cultivo de secreción faríngea|frotis faríngeo, cultivo de garganta, estreptococo",
    "Cultivo de secreción vaginal|frotis vaginal, flujo vaginal",
    "Cultivo de secreción uretral|secreción uretral",
    "Cultivo de esputo|cultivo de expectoración",
    "Cultivo de punta de catéter|punta de catéter",
    "Cultivo de líquido cefalorraquídeo|cultivo LCR",
    "Cultivo de líquido pleural|",
    "Cultivo de líquido peritoneal|cultivo de líquido ascítico, líquido de diálisis",
    "Cultivo de líquido articular|líquido sinovial",
    "Cultivo para hongos|KOH y cultivo micológico, micológico",
    "Antibiograma|sensibilidad antimicrobiana",
    "Gram|tinción de Gram, coloración de Gram",
    "KOH|examen directo para hongos, hidróxido de potasio",
    "Baciloscopia|BK, baciloscopia seriada, tuberculosis, Ziehl-Neelsen",
    "Cultivo para micobacterias|cultivo para BK, cultivo de tuberculosis|*",
  ]},
  { grupo: "Otras muestras", muestra: "Otras muestras", filas: [
    "Citoquímico de líquido cefalorraquídeo|LCR, citoquímico de LCR",
    "Citoquímico de líquido pleural|líquido pleural",
    "Citoquímico de líquido peritoneal|líquido ascítico, ascitis",
    "Citoquímico de líquido articular|líquido sinovial",
    "Frotis de flujo vaginal|frotis vaginal, flujo, Gram y fresco",
    "Hisopado nasofaríngeo|hisopado, influenza, virus respiratorios",
    "PCR para SARS-CoV-2|COVID PCR, RT-PCR COVID|*",
    "Panel de virus respiratorios|panel respiratorio, filmarray|*",
    "Citología cervicovaginal|citología, Papanicolaou, PAP",
    "Prueba de VPH|virus del papiloma humano, VPH ADN|*",
    "Espermograma|seminograma, análisis de semen|*",
    "Sudor (test de cloro en sudor)|test del sudor|*",
  ]},
];

export const EXAMENES: Examen[] = G.flatMap(({ grupo, muestra, filas }) =>
  filas.map((f) => {
    const [nombre = "", sin = "", marca = ""] = f.split("|");
    return { nombre: nombre.trim(), sin: sin.split(",").map((x) => x.trim()).filter(Boolean), muestra, grupo, ...(marca.trim() === "*" ? { remision: true } : {}) };
  }),
);

export const TIPOS_MUESTRA: TipoMuestra[] = ["Sangre", "Orina", "Materia fecal", "Cultivo", "Otras muestras"];

const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9+]+/g, " ").trim();

/** ¿Las palabras se parecen? (una letra de diferencia en palabras de 5 o más letras). */
function parecida(a: string, b: string) {
  if (a.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, dif = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++dif > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return dif + (a.length - i) + (b.length - j) <= 1;
}

// El orden del catálogo va de lo más pedido a lo menos pedido dentro de cada grupo: se usa para desempatar.
const INDICE = EXAMENES.map((e, i) => {
  const textos = [e.nombre, ...e.sin].map(n);
  return { e, i, textos, palabras: [...new Set(textos.flatMap((t) => t.split(" ")))] };
});

/**
 * Busca por nombre, abreviatura o sinónimo, sin importar tildes ni mayúsculas,
 * y tolera un error de tipeo ("hemogrma" → Hemograma). Primero lo que empieza igual.
 */
export function buscarExamenes(q: string, opciones: { muestra?: TipoMuestra | undefined; excluir?: Set<string>; max?: number } = {}): Examen[] {
  const t = n(q);
  if (!t) return [];
  const partes = t.split(" ");
  const puntaje = (x: (typeof INDICE)[number]) => {
    // todas las palabras escritas tienen que aparecer (como comienzo de palabra o parecidas)
    let total = 0;
    for (const p of partes) {
      if (x.textos.some((tx) => tx === p)) total += 100;
      else if (x.textos.some((tx) => tx.startsWith(p))) total += 60;
      else if (x.palabras.some((w) => w.startsWith(p))) total += 40;
      else if (p.length >= 3 && x.textos.some((tx) => tx.includes(p))) total += 20;
      else if (x.palabras.some((w) => parecida(p, w))) total += 10;
      else return 0;
    }
    if (n(x.e.nombre).startsWith(t)) total += 30;
    if (opciones.muestra && x.e.muestra === opciones.muestra) total += 15;
    return total;
  };
  return INDICE.filter((x) => !opciones.excluir?.has(n(x.e.nombre)))
    .map((x) => ({ e: x.e, i: x.i, p: puntaje(x) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p || a.i - b.i)
    .slice(0, opciones.max ?? 10)
    .map((x) => x.e);
}

export const examenPorNombre = (nombre: string) => EXAMENES.find((e) => n(e.nombre) === n(nombre));
export const normExamen = n;
