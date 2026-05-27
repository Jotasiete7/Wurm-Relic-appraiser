-- =====================================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS GLOBAL — WURM RELIC APPRAISER
-- Execute este script no "SQL Editor" do painel de controle do Supabase.
-- =====================================================================

-- 1. TABELA PRINCIPAL DE ANÁLISES (CABECALHO)
CREATE TABLE IF NOT EXISTS public.appraisals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    source_language TEXT NOT NULL,
    items_count INTEGER NOT NULL,
    has_screenshot BOOLEAN NOT NULL,
    has_examine BOOLEAN NOT NULL
);

-- 2. TABELA DOS ITENS AVALIADOS (DADOS E METADADOS DO ITEM)
CREATE TABLE IF NOT EXISTS public.appraised_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appraisal_id UUID NOT NULL REFERENCES public.appraisals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    raw_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    category TEXT NOT NULL,
    metal TEXT,
    rarity TEXT NOT NULL,
    ql NUMERIC,
    damage NUMERIC,
    score INTEGER NOT NULL,
    tier TEXT NOT NULL,
    maker TEXT,
    is_skiller BOOLEAN DEFAULT false NOT NULL
);

-- 3. TABELA DE RUNAS ACOPLADAS AOS ITENS
CREATE TABLE IF NOT EXISTS public.item_runes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.appraised_items(id) ON DELETE CASCADE,
    metal TEXT NOT NULL,
    god TEXT NOT NULL,
    effects TEXT[] NOT NULL,
    source TEXT NOT NULL
);

-- 4. TABELA DE ENCANTAMENTOS DOS ITENS
CREATE TABLE IF NOT EXISTS public.item_enchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.appraised_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    power INTEGER NOT NULL
);

-- 5. TABELA DE IMBUIS (ÓLEOS E IMBUEMENTS APLICADOS)
CREATE TABLE IF NOT EXISTS public.item_imbuis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.appraised_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    skill TEXT NOT NULL,
    ql NUMERIC NOT NULL
);

-- =====================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) PARA PROTEÇÃO E PRIVACIDADE
-- =====================================================================
ALTER TABLE public.appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraised_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_runes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_enchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_imbuis ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- POLÍTICAS DE INSERÇÃO PÚBLICA (ALLOW PUBLIC INSERT)
-- Permite que qualquer jogador envie dados estatísticos anonimizados sem precisar fazer login.
-- =====================================================================
CREATE POLICY "Permitir inserções públicas anônimas em appraisals" 
ON public.appraisals FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir inserções públicas anônimas em appraised_items" 
ON public.appraised_items FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir inserções públicas anônimas em item_runes" 
ON public.item_runes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir inserções públicas anônimas em item_enchants" 
ON public.item_enchants FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir inserções públicas anônimas em item_imbuis" 
ON public.item_imbuis FOR INSERT TO anon WITH CHECK (true);

-- =====================================================================
-- ÍNDICES DE PERFORMANCE (OTIMIZAÇÃO DE CONSULTAS E CRIAÇÃO DE DASHBOARDS FUTUROS)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_items_normalized_name ON public.appraised_items(normalized_name);
CREATE INDEX IF NOT EXISTS idx_items_tier ON public.appraised_items(tier);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON public.appraised_items(rarity);
CREATE INDEX IF NOT EXISTS idx_items_maker ON public.appraised_items(maker);
CREATE INDEX IF NOT EXISTS idx_runes_god ON public.item_runes(god);
CREATE INDEX IF NOT EXISTS idx_enchants_name ON public.item_enchants(name);

-- =====================================================================
-- FUNÇÕES DE AGREGAS E METRICAS GLOBAIS (SECURITY DEFINER)
-- Permite leitura de totais estatísticos agregados sem expor dados brutos.
-- =====================================================================

-- 1. Distribuição de Tiers Geral
CREATE OR REPLACE FUNCTION public.get_global_tier_stats()
RETURNS TABLE (tier TEXT, item_count BIGINT, percentage NUMERIC)
SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
      ai.tier,
      count(*) as item_count,
      round(count(*) * 100.0 / nullif((SELECT count(*) FROM public.appraised_items), 0), 1) as percentage
  FROM public.appraised_items ai
  GROUP BY ai.tier;
END;
$$ LANGUAGE plpgsql;

-- 2. Frequência de Runas por Divindade Geral
CREATE OR REPLACE FUNCTION public.get_global_rune_stats()
RETURNS TABLE (god TEXT, rune_count BIGINT, percentage NUMERIC)
SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
      ir.god,
      count(*) as rune_count,
      round(count(*) * 100.0 / nullif((SELECT count(*) FROM public.item_runes), 0), 1) as percentage
  FROM public.item_runes ir
  GROUP BY ir.god;
END;
$$ LANGUAGE plpgsql;

-- 3. Resumo de Métricas de Análise Geral
CREATE OR REPLACE FUNCTION public.get_global_summary_stats()
RETURNS TABLE (total_runs BIGINT, total_items BIGINT, total_runes BIGINT, total_enchants BIGINT)
SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
      (SELECT count(*) FROM public.appraisals) as total_runs,
      (SELECT count(*) FROM public.appraised_items) as total_items,
      (SELECT count(*) FROM public.item_runes) as total_runes,
      (SELECT count(*) FROM public.item_enchants) as total_enchants;
END;
$$ LANGUAGE plpgsql;

