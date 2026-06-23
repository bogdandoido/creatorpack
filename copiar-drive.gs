// =============================================
// MV Creator Pack — Copiar pasta no Google Drive
// =============================================
// INSTRUÇÕES:
// 1. Acesse https://script.google.com
// 2. Clique em "Novo projeto"
// 3. Cole TODO esse código no editor
// 4. Clique no ícone ▶ (Executar) ao lado de "copiarTudo"
// 5. Autorize o script quando pedir permissão
// 6. Aguarde — vai aparecer "Concluído" no log
// =============================================

var SOURCE_FOLDER_ID = "1kuc5RUVdJteD58B3-S3p_cVk1kly2mgY"; // Edição Pack
var DEST_FOLDER_ID   = "1VUxZQfdErHktDnvmCDOCxfgwSAuxidgN"; // MV Creator Pack

function copiarTudo() {
  var origem  = DriveApp.getFolderById(SOURCE_FOLDER_ID);
  var destino = DriveApp.getFolderById(DEST_FOLDER_ID);

  Logger.log("▶ Iniciando cópia de: " + origem.getName());
  Logger.log("▶ Destino: " + destino.getName());

  copiarPasta(origem, destino);

  Logger.log("✅ CONCLUÍDO! Tudo copiado com sucesso.");
}

function copiarPasta(pastaOrigem, pastaDestino) {
  // Copia todos os arquivos da pasta atual
  var arquivos = pastaOrigem.getFiles();
  var totalArquivos = 0;

  while (arquivos.hasNext()) {
    var arquivo = arquivos.next();
    arquivo.makeCopy(arquivo.getName(), pastaDestino);
    totalArquivos++;
    Logger.log("  📄 Copiado: " + arquivo.getName());
  }

  // Copia todas as subpastas recursivamente
  var subpastas = pastaOrigem.getFolders();

  while (subpastas.hasNext()) {
    var subpasta = subpastas.next();
    Logger.log("📁 Entrando na pasta: " + subpasta.getName());

    // Cria a mesma pasta no destino
    var novaSubpasta = pastaDestino.createFolder(subpasta.getName());

    // Entra na subpasta e repete o processo
    copiarPasta(subpasta, novaSubpasta);
  }
}
