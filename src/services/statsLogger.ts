import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import type { WurmItem } from '../types';

export interface AppraisalMetadata {
  hasScreenshot: boolean;
  hasExamine: boolean;
  lang: string;
}

// ── Client-side Security Guardrails ──────────────────────────────────────────
// 1. Cooldown: evita que o mesmo jogador envie múltiplas análises em sequência
//    rápida (ex: double-click no botão Analyze).
const COOLDOWN_MS = 15_000; // 15 segundos entre envios
let lastSubmitTime = 0;

// 2. Limites máximos — espelham as constraints do banco para rejeitar localmente
//    antes mesmo de tentar enviar, reduzindo requisições inválidas.
const MAX_ITEMS_PER_APPRAISAL = 200;
const MAX_STRING_LENGTH = 200;

/** Trunca strings para não exceder os limites do banco de dados. */
function trunc(value: string | null | undefined, max = MAX_STRING_LENGTH): string | null {
  if (!value) return null;
  return value.length > max ? value.slice(0, max) : value;
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Logs the results of an appraisal to the global Supabase database in the background.
 * If Supabase is not configured (e.g. running locally without env keys), it runs in
 * "Smart Simulation Mode", printing all statistics to the developer console.
 */
export async function logAppraisalToDatabase(
  items: WurmItem[],
  meta: AppraisalMetadata
): Promise<void> {
  if (items.length === 0) return;

  // ── Cooldown check ────────────────────────────────────────────────────────
  const now = Date.now();
  if (now - lastSubmitTime < COOLDOWN_MS) {
    console.info(`[Supabase Stats] Cooldown ativo — próximo envio disponível em ${Math.ceil((COOLDOWN_MS - (now - lastSubmitTime)) / 1000)}s.`);
    return;
  }

  // ── Max items cap ─────────────────────────────────────────────────────────
  const safeItems = items.slice(0, MAX_ITEMS_PER_APPRAISAL);
  if (items.length > MAX_ITEMS_PER_APPRAISAL) {
    console.warn(`[Supabase Stats] Análise contém ${items.length} itens — enviando somente os primeiros ${MAX_ITEMS_PER_APPRAISAL}.`);
  }


  if (!isSupabaseConfigured || !supabase) {
    // === SMART SIMULATION FALLBACK ===
    console.group('%c🛡️ [Wurm Relic Appraiser] Simulação de Estatísticas (Local Fallback)', 'color: #d4b483; font-weight: bold; font-size: 1.1em;');
    console.log(`Modo simulação ativo: as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão configuradas.`);
    console.log(`Os seguintes dados estatísticos seriam catalogados de forma 100% anônima (sem armazenar imagens):`);
    console.log(`Meta: Idioma="${meta.lang}", Contém Print=${meta.hasScreenshot}, Contém Examine Log=${meta.hasExamine}`);
    
    console.group('Itens Analisados:');
    items.forEach((item, idx) => {
      console.group(`Item #${idx + 1}: "${item.rawName}"`);
      console.log(`• Nome Normalizado: "${item.normalizedName}"`);
      console.log(`• Metal/Material: ${item.metal ?? 'N/A'}`);
      console.log(`• Raridade: ${item.rarity}`);
      console.log(`• QL (Qualidade): ${item.ql ?? 'N/A'}`);
      console.log(`• Dano: ${item.damage ?? 'N/A'}`);
      console.log(`• Pontuação Final: ${item.score}`);
      console.log(`• Categoria: ${item.category}`);
      console.log(`• Tier: ${item.tier}`);
      console.log(`• Criador (Maker): ${item.maker ?? 'N/A'}`);
      console.log(`• É Skiller? ${item.isSkiller ? 'Sim' : 'Não'}`);

      if (item.runes && item.runes.length > 0) {
        console.group('Runas:');
        item.runes.forEach(rune => {
          console.log(`  - Deus: ${rune.god}, Metal: ${rune.metal}, Fonte: ${rune.source}, Efeitos:`, rune.effects);
        });
        console.groupEnd();
      }

      if (item.enchants && item.enchants.length > 0) {
        console.group('Encantamentos:');
        item.enchants.forEach(ench => {
          console.log(`  - Nome: ${ench.name}, Power: ${ench.power}`);
        });
        console.groupEnd();
      }

      if (item.imbuis && item.imbuis.length > 0) {
        console.group('Imbuis (Óleos/Imbuements):');
        item.imbuis.forEach(imb => {
          console.log(`  - Nome: ${imb.name}, Skill: ${imb.skill}, QL: ${imb.ql}`);
        });
        console.groupEnd();
      }
      
      console.groupEnd();
    });
    console.groupEnd();
    console.groupEnd();
    return;
  }

  // === SUPABASE REAL TRANSACTION BATCH ===
  try {
    // 1. Insert into 'appraisals'
    const { data: appraisalData, error: appraisalError } = await supabase
      .from('appraisals')
      .insert({
        source_language: trunc(meta.lang, 5),
        items_count: safeItems.length,
        has_screenshot: meta.hasScreenshot,
        has_examine: meta.hasExamine,
      })
      .select('id')
      .single();

    if (appraisalError || !appraisalData) {
      console.error('[Supabase Stats] Erro ao criar cabeçalho da análise:', appraisalError);
      return;
    }

    const appraisalId = appraisalData.id;
    lastSubmitTime = Date.now(); // ← marca o cooldown assim que o insert principal passa

    // 2. Loop and insert each item and its children sequentially to maintain bulletproof matching & relations
    for (const item of safeItems) {
      const { data: itemData, error: itemError } = await supabase
        .from('appraised_items')
        .insert({
          appraisal_id: appraisalId,
          raw_name: trunc(item.rawName),
          normalized_name: trunc(item.normalizedName),
          category: trunc(item.category, 50),
          metal: trunc(item.metal, 80),
          rarity: trunc(item.rarity, 20),
          ql: item.ql,
          damage: item.damage,
          score: Math.min(item.score, 10000), // cap de segurança espelhando constraint
          tier: trunc(item.tier, 20),
          maker: trunc(item.maker, 100),
          is_skiller: !!item.isSkiller,
        })
        .select('id')
        .single();

      if (itemError || !itemData) {
        console.error(`[Supabase Stats] Erro ao inserir item "${item.normalizedName}":`, itemError);
        continue;
      }

      const itemId = itemData.id;

      // 3. Insert Runes (if any)
      if (item.runes && item.runes.length > 0) {
        const runesPayload = item.runes.map(r => ({
          item_id: itemId,
          metal: r.metal,
          god: r.god,
          effects: r.effects,
          source: r.source,
        }));

        const { error: runeError } = await supabase
          .from('item_runes')
          .insert(runesPayload);

        if (runeError) {
          console.error(`[Supabase Stats] Erro ao salvar runas do item ${itemId}:`, runeError);
        }
      }

      // 4. Insert Enchants (if any)
      if (item.enchants && item.enchants.length > 0) {
        const enchantsPayload = item.enchants.map(e => ({
          item_id: itemId,
          name: e.name,
          power: e.power,
        }));

        const { error: enchantError } = await supabase
          .from('item_enchants')
          .insert(enchantsPayload);

        if (enchantError) {
          console.error(`[Supabase Stats] Erro ao salvar encantamentos do item ${itemId}:`, enchantError);
        }
      }

      // 5. Insert Imbuis (if any)
      if (item.imbuis && item.imbuis.length > 0) {
        const imbuisPayload = item.imbuis.map(im => ({
          item_id: itemId,
          name: im.name,
          skill: im.skill,
          ql: im.ql,
        }));

        const { error: imbuiError } = await supabase
          .from('item_imbuis')
          .insert(imbuisPayload);

        if (imbuiError) {
          console.error(`[Supabase Stats] Erro ao salvar imbuis do item ${itemId}:`, imbuiError);
        }
      }
    }

    console.log(`%c[Supabase Stats] Dados de ${items.length} itens catalogados no banco global com sucesso!`, 'color: #10b981; font-weight: bold;');
  } catch (err) {
    console.error('[Supabase Stats] Erro inesperado ao salvar estatísticas no banco de dados:', err);
  }
}
