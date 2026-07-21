-- ============================================================
-- SISTEMA DE CONTATOS - POSTGRESQL 18
-- VERSAO 1:
-- - IMPORTACAO DE NUMEROS
-- - CADASTRO MANUAL
-- - FORMULARIO PUBLICO PROPRIO
--
-- BANCO PREPARADO PARA A FUTURA VERSAO 2 COM WHATSAPP
-- ============================================================

BEGIN;

DROP TABLE IF EXISTS mensagens_whatsapp CASCADE;
DROP TABLE IF EXISTS sessoes_whatsapp CASCADE;
DROP TABLE IF EXISTS campanha_destinatarios CASCADE;
DROP TABLE IF EXISTS campanhas CASCADE;
DROP TABLE IF EXISTS historico_alteracoes CASCADE;
DROP TABLE IF EXISTS tentativas_contato CASCADE;
DROP TABLE IF EXISTS consentimentos CASCADE;
DROP TABLE IF EXISTS importacao_itens CASCADE;
DROP TABLE IF EXISTS importacoes CASCADE;
DROP TABLE IF EXISTS contatos CASCADE;
DROP TABLE IF EXISTS origens_listas CASCADE;
DROP TABLE IF EXISTS problemas CASCADE;
DROP TABLE IF EXISTS bairros CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome_completo VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil_acesso VARCHAR(20) NOT NULL DEFAULT 'operador',
  usuario_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ck_usuarios_perfil
    CHECK (perfil_acesso IN ('administrador', 'operador'))
);

CREATE TABLE bairros (
  id_bairro SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome_bairro VARCHAR(120) NOT NULL UNIQUE,
  bairro_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE problemas (
  id_problema INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome_problema VARCHAR(150) NOT NULL UNIQUE,
  problema_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE origens_listas (
  id_origem BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome_origem VARCHAR(150) NOT NULL UNIQUE,
  descricao_origem VARCHAR(300),
  origem_ativa BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contatos (
  id_contato BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome_completo VARCHAR(150),
  numero_telefone_original VARCHAR(30) NOT NULL,
  numero_telefone_normalizado VARCHAR(20) NOT NULL UNIQUE,
  id_bairro SMALLINT,
  id_problema INTEGER,
  id_origem BIGINT,
  idade SMALLINT,
  faixa_etaria_eleitoral VARCHAR(40) NOT NULL DEFAULT 'idade_nao_informada',
  participacao_eleicao_anterior VARCHAR(30),
  forma_entrada VARCHAR(30) NOT NULL DEFAULT 'importacao',
  status_contato VARCHAR(40) NOT NULL DEFAULT 'aguardando_contato',
  telefone_valido BOOLEAN NOT NULL DEFAULT TRUE,
  contato_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  id_usuario_cadastro BIGINT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_contatos_bairro
    FOREIGN KEY (id_bairro) REFERENCES bairros(id_bairro),

  CONSTRAINT fk_contatos_problema
    FOREIGN KEY (id_problema) REFERENCES problemas(id_problema),

  CONSTRAINT fk_contatos_origem
    FOREIGN KEY (id_origem) REFERENCES origens_listas(id_origem),

  CONSTRAINT fk_contatos_usuario
    FOREIGN KEY (id_usuario_cadastro) REFERENCES usuarios(id_usuario),

  CONSTRAINT ck_contatos_idade
    CHECK (idade IS NULL OR (idade >= 0 AND idade <= 120)),

  CONSTRAINT ck_contatos_forma_entrada
    CHECK (forma_entrada IN (
      'importacao',
      'cadastro_manual',
      'formulario_publico'
    )),

  CONSTRAINT ck_contatos_faixa
    CHECK (faixa_etaria_eleitoral IN (
      'menor_de_16',
      'tera_16_ate_eleicao',
      'entre_16_e_17',
      '18_ou_mais',
      'idade_nao_informada'
    )),

  CONSTRAINT ck_contatos_participacao
    CHECK (
      participacao_eleicao_anterior IS NULL OR
      participacao_eleicao_anterior IN (
        'sim',
        'nao',
        'ainda_nao_tinha_idade',
        'prefiro_nao_responder'
      )
    ),

  CONSTRAINT ck_contatos_status
    CHECK (status_contato IN (
      'aguardando_contato',
      'aguardando_resposta',
      'respondeu',
      'autorizou_mensagens',
      'nao_autorizou_mensagens',
      'sem_resposta',
      'nao_deseja_contato'
    ))
);

CREATE TABLE importacoes (
  id_importacao BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_usuario_responsavel BIGINT NOT NULL,
  id_origem BIGINT NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(10) NOT NULL,
  quantidade_total INTEGER NOT NULL DEFAULT 0,
  quantidade_importados INTEGER NOT NULL DEFAULT 0,
  quantidade_duplicados INTEGER NOT NULL DEFAULT 0,
  quantidade_invalidos INTEGER NOT NULL DEFAULT 0,
  status_importacao VARCHAR(30) NOT NULL DEFAULT 'processando',
  resumo_erros JSONB,
  iniciado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finalizado_em TIMESTAMPTZ,

  CONSTRAINT fk_importacoes_usuario
    FOREIGN KEY (id_usuario_responsavel) REFERENCES usuarios(id_usuario),

  CONSTRAINT fk_importacoes_origem
    FOREIGN KEY (id_origem) REFERENCES origens_listas(id_origem),

  CONSTRAINT ck_importacoes_tipo
    CHECK (tipo_arquivo IN ('csv', 'xlsx')),

  CONSTRAINT ck_importacoes_status
    CHECK (status_importacao IN (
      'processando',
      'concluida',
      'concluida_com_erros',
      'falhou'
    ))
);

CREATE TABLE importacao_itens (
  id_importacao_item BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_importacao BIGINT NOT NULL,
  numero_linha INTEGER NOT NULL,
  telefone_original VARCHAR(30),
  telefone_normalizado VARCHAR(20),
  resultado_item VARCHAR(30) NOT NULL,
  detalhe_erro VARCHAR(400),
  id_contato BIGINT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_itens_importacao
    FOREIGN KEY (id_importacao)
    REFERENCES importacoes(id_importacao)
    ON DELETE CASCADE,

  CONSTRAINT fk_itens_contato
    FOREIGN KEY (id_contato) REFERENCES contatos(id_contato),

  CONSTRAINT ck_itens_resultado
    CHECK (resultado_item IN (
      'importado',
      'duplicado',
      'invalido',
      'atualizado'
    ))
);

CREATE TABLE consentimentos (
  id_consentimento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_contato BIGINT NOT NULL,
  tipo_consentimento VARCHAR(40) NOT NULL,
  resposta VARCHAR(10) NOT NULL,
  texto_apresentado TEXT NOT NULL,
  versao_texto VARCHAR(30) NOT NULL,
  id_usuario_responsavel BIGINT,
  data_hora_resposta TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_consentimentos_contato
    FOREIGN KEY (id_contato) REFERENCES contatos(id_contato),

  CONSTRAINT fk_consentimentos_usuario
    FOREIGN KEY (id_usuario_responsavel) REFERENCES usuarios(id_usuario),

  CONSTRAINT ck_consentimentos_tipo
    CHECK (tipo_consentimento IN (
      'armazenamento_dados',
      'mensagens_whatsapp'
    )),

  CONSTRAINT ck_consentimentos_resposta
    CHECK (resposta IN ('sim', 'nao'))
);

CREATE TABLE tentativas_contato (
  id_tentativa BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_contato BIGINT NOT NULL,
  id_usuario_responsavel BIGINT NOT NULL,
  tipo_tentativa VARCHAR(20) NOT NULL,
  resultado_tentativa VARCHAR(30) NOT NULL,
  data_hora_tentativa TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observacao VARCHAR(300),

  CONSTRAINT fk_tentativas_contato
    FOREIGN KEY (id_contato) REFERENCES contatos(id_contato),

  CONSTRAINT fk_tentativas_usuario
    FOREIGN KEY (id_usuario_responsavel) REFERENCES usuarios(id_usuario),

  CONSTRAINT ck_tentativas_tipo
    CHECK (tipo_tentativa IN ('primeiro_contato', 'lembrete')),

  CONSTRAINT ck_tentativas_resultado
    CHECK (resultado_tentativa IN (
      'aguardando_resposta',
      'respondeu',
      'sem_resposta',
      'nao_deseja_contato'
    ))
);

CREATE TABLE historico_alteracoes (
  id_historico BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_usuario_responsavel BIGINT,
  tipo_acao VARCHAR(80) NOT NULL,
  nome_tabela VARCHAR(80) NOT NULL,
  id_registro BIGINT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  data_hora_alteracao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_historico_usuario
    FOREIGN KEY (id_usuario_responsavel) REFERENCES usuarios(id_usuario)
);

-- TABELAS RESERVADAS PARA A FUTURA VERSAO 2

CREATE TABLE campanhas (
  id_campanha BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_usuario_responsavel BIGINT NOT NULL,
  nome_campanha VARCHAR(150) NOT NULL,
  mensagem_utilizada TEXT NOT NULL,
  finalidade VARCHAR(250) NOT NULL,
  limite_operacional INTEGER NOT NULL DEFAULT 240,
  status_campanha VARCHAR(30) NOT NULL DEFAULT 'rascunho',
  criada_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  iniciada_em TIMESTAMPTZ,
  finalizada_em TIMESTAMPTZ,

  CONSTRAINT fk_campanhas_usuario
    FOREIGN KEY (id_usuario_responsavel) REFERENCES usuarios(id_usuario),

  CONSTRAINT ck_campanhas_limite
    CHECK (limite_operacional > 0),

  CONSTRAINT ck_campanhas_status
    CHECK (status_campanha IN (
      'rascunho',
      'programada',
      'processando',
      'concluida',
      'cancelada',
      'falhou'
    ))
);

CREATE TABLE campanha_destinatarios (
  id_campanha_destinatario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_campanha BIGINT NOT NULL,
  id_contato BIGINT NOT NULL,
  status_envio VARCHAR(40) NOT NULL DEFAULT 'pendente',
  id_mensagem_externa VARCHAR(190),
  erro_envio VARCHAR(500),
  enviada_em TIMESTAMPTZ,
  entregue_em TIMESTAMPTZ,
  respondida_em TIMESTAMPTZ,
  pedido_interrupcao BOOLEAN NOT NULL DEFAULT FALSE,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_destinatarios_campanha
    FOREIGN KEY (id_campanha)
    REFERENCES campanhas(id_campanha)
    ON DELETE CASCADE,

  CONSTRAINT fk_destinatarios_contato
    FOREIGN KEY (id_contato) REFERENCES contatos(id_contato),

  CONSTRAINT uq_campanha_contato
    UNIQUE (id_campanha, id_contato),

  CONSTRAINT ck_destinatarios_status
    CHECK (status_envio IN (
      'pendente',
      'bloqueado_sem_consentimento',
      'enviado',
      'entregue',
      'nao_entregue',
      'respondido',
      'falhou'
    ))
);

CREATE TABLE sessoes_whatsapp (
  id_sessao BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_contato BIGINT NOT NULL UNIQUE,
  etapa_atual VARCHAR(60) NOT NULL,
  dados_temporarios JSONB,
  expira_em TIMESTAMPTZ NOT NULL,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_sessoes_contato
    FOREIGN KEY (id_contato) REFERENCES contatos(id_contato)
);

CREATE TABLE mensagens_whatsapp (
  id_mensagem BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_contato BIGINT NOT NULL,
  id_campanha BIGINT,
  id_mensagem_externa VARCHAR(190) UNIQUE,
  direcao VARCHAR(10) NOT NULL,
  tipo_mensagem VARCHAR(30) NOT NULL,
  conteudo TEXT,
  status_mensagem VARCHAR(30),
  recebida_ou_enviada_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  erro_mensagem VARCHAR(500),

  CONSTRAINT fk_mensagens_contato
    FOREIGN KEY (id_contato) REFERENCES contatos(id_contato),

  CONSTRAINT fk_mensagens_campanha
    FOREIGN KEY (id_campanha) REFERENCES campanhas(id_campanha)
);

CREATE INDEX idx_contatos_nome ON contatos (nome_completo);
CREATE INDEX idx_contatos_bairro ON contatos (id_bairro);
CREATE INDEX idx_contatos_problema ON contatos (id_problema);
CREATE INDEX idx_contatos_origem ON contatos (id_origem);
CREATE INDEX idx_contatos_forma_entrada ON contatos (forma_entrada);
CREATE INDEX idx_contatos_status ON contatos (status_contato);
CREATE INDEX idx_consentimentos_contato_tipo
  ON consentimentos (id_contato, tipo_consentimento, data_hora_resposta DESC);
CREATE INDEX idx_tentativas_contato
  ON tentativas_contato (id_contato, data_hora_tentativa DESC);
CREATE INDEX idx_historico_periodo
  ON historico_alteracoes (data_hora_alteracao);

CREATE OR REPLACE FUNCTION atualizar_campo_atualizado_em()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_usuarios_atualizado
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION atualizar_campo_atualizado_em();

CREATE TRIGGER trg_bairros_atualizado
BEFORE UPDATE ON bairros
FOR EACH ROW
EXECUTE FUNCTION atualizar_campo_atualizado_em();

CREATE TRIGGER trg_problemas_atualizado
BEFORE UPDATE ON problemas
FOR EACH ROW
EXECUTE FUNCTION atualizar_campo_atualizado_em();

CREATE TRIGGER trg_origens_atualizado
BEFORE UPDATE ON origens_listas
FOR EACH ROW
EXECUTE FUNCTION atualizar_campo_atualizado_em();

CREATE TRIGGER trg_contatos_atualizado
BEFORE UPDATE ON contatos
FOR EACH ROW
EXECUTE FUNCTION atualizar_campo_atualizado_em();

COMMIT;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
