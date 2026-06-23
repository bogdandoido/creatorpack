// =============================================
// MV Creator Pack — Copiar Drive (v2 - com checkpoint e sem duplicatas)
// =============================================
// INSTRUÇÕES:
// 1. Apaga TODO o código atual e cola esse
// 2. Salva com Cmd+S
// 3. Seleciona a função "iniciar" no dropdown
// 4. Clica Executar — ele vai rodar sozinho até terminar
// 5. Acompanhe pelo "Registro de execução"
// =============================================

var SOURCE_FOLDER_ID = "1kuc5RUVdJteD58B3-S3p_cVk1kly2mgY"; // Edição Pack
var DEST_FOLDER_ID   = "1VUxZQfdErHktDnvmCDOCxfgwSAuxidgN"; // MV Creator Pack
var TEMPO_LIMITE_MS  = 300000; // 5 minutos (seguro antes do timeout do Google)

// ▶ RODE ESSA FUNÇÃO PARA COMEÇAR (ou continuar)
function iniciar() {
  var props = PropertiesService.getScriptProperties();

  // Primeira vez: salva a fila de pastas pra copiar
  if (!props.getProperty("iniciado")) {
    props.setProperty("iniciado", "true");
    props.setProperty("fila", JSON.stringify([[SOURCE_FOLDER_ID, DEST_FOLDER_ID]]));
    props.setProperty("copiados", "0");
    Logger.log("▶ Iniciando do zero...");
  } else {
    Logger.log("▶ Continuando de onde parou...");
  }

  // Remove duplicatas antes de continuar
  limparDuplicatas(DEST_FOLDER_ID);

  copiarComCheckpoint();
}

// ▶ RODE ESSA FUNÇÃO SE QUISER RECOMEÇAR DO ZERO
function resetar() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log("🔄 Reset feito. Rode 'iniciar' para começar do zero.");
}

function copiarComCheckpoint() {
  var props     = PropertiesService.getScriptProperties();
  var inicio    = new Date().getTime();
  var fila      = JSON.parse(props.getProperty("fila") || "[]");
  var copiados  = parseInt(props.getProperty("copiados") || "0");

  while (fila.length > 0) {
    // Verifica se está perto do limite de tempo
    if (new Date().getTime() - inicio > TEMPO_LIMITE_MS) {
      props.setProperty("fila", JSON.stringify(fila));
      props.setProperty("copiados", copiados.toString());
      Logger.log("⏸ Pausando para evitar timeout. Total copiado até agora: " + copiados + " arquivos.");
      Logger.log("▶ Rode 'iniciar' novamente para continuar de onde parou.");
      return;
    }

    var par         = fila.shift();
    var origemId    = par[0];
    var destinoId   = par[1];
    var pastaOrigem = DriveApp.getFolderById(origemId);
    var pastaDestino= DriveApp.getFolderById(destinoId);

    // Copia arquivos da pasta atual
    var arquivos = pastaOrigem.getFiles();
    while (arquivos.hasNext()) {
      var arquivo = arquivos.next();
      // Só copia se ainda não existe no destino
      if (!arquivoExiste(pastaDestino, arquivo.getName())) {
        arquivo.makeCopy(arquivo.getName(), pastaDestino);
        copiados++;
        Logger.log("📄 Copiado: " + arquivo.getName());
      } else {
        Logger.log("⏭ Já existe, pulando: " + arquivo.getName());
      }
    }

    // Adiciona subpastas na fila (criando-as no destino se não existirem)
    var subpastas = pastaOrigem.getFolders();
    while (subpastas.hasNext()) {
      var sub     = subpastas.next();
      var subDest = getOuCriarPasta(pastaDestino, sub.getName());
      fila.push([sub.getId(), subDest.getId()]);
      Logger.log("📁 Pasta adicionada à fila: " + sub.getName());
    }
  }

  // Chegou aqui = terminou tudo
  props.deleteAllProperties();
  Logger.log("✅ CONCLUÍDO! Total de arquivos copiados: " + copiados);
}

// Busca pasta pelo nome ou cria se não existir (evita duplicatas)
function getOuCriarPasta(pai, nome) {
  var existentes = pai.getFoldersByName(nome);
  if (existentes.hasNext()) {
    return existentes.next();
  }
  return pai.createFolder(nome);
}

// Verifica se arquivo já existe na pasta destino
function arquivoExiste(pasta, nome) {
  var existentes = pasta.getFilesByName(nome);
  return existentes.hasNext();
}

// Remove pastas duplicadas na pasta destino
function limparDuplicatas(pastaId) {
  var pasta    = DriveApp.getFolderById(pastaId);
  var subpastas= pasta.getFolders();
  var vistas   = {};

  while (subpastas.hasNext()) {
    var sub  = subpastas.next();
    var nome = sub.getName();
    var mod  = sub.getLastUpdated();

    if (vistas[nome]) {
      // Mantém a mais recente, move a outra pra lixeira
      if (vistas[nome].getLastUpdated() < mod) {
        vistas[nome].setTrashed(true);
        Logger.log("🗑 Duplicata removida: " + vistas[nome].getName() + " (mais antiga)");
        vistas[nome] = sub;
      } else {
        sub.setTrashed(true);
        Logger.log("🗑 Duplicata removida: " + nome + " (mais antiga)");
      }
    } else {
      vistas[nome] = sub;
    }
  }
}
