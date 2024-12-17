const pdfUpload = document.getElementById("pdf-upload");
const bgPdfUpload = document.getElementById("bg-pdf-upload");
const applyBgButton = document.getElementById("apply-bg");
const downloadButton = document.getElementById("download-pdf");

let pdfDoc = null; // Documento PDF principal
let bgPdfDoc = null; // Documento PDF de fondo
let modifiedPdfDoc = null; // Documento PDF modificado

// Cargar PDF principal
pdfUpload.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const pdfData = new Uint8Array(e.target.result);
    pdfDoc = await PDFLib.PDFDocument.load(pdfData);
    alert("PDF principal cargado correctamente.");
  };
  reader.readAsArrayBuffer(file);
});

// Cargar PDF de fondo
bgPdfUpload.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const bgPdfData = new Uint8Array(e.target.result);
    bgPdfDoc = await PDFLib.PDFDocument.load(bgPdfData);
    alert("PDF de fondo cargado correctamente.");
  };
  reader.readAsArrayBuffer(file);
});

// Aplicar fondo al PDF principal
applyBgButton.addEventListener("click", async () => {
  if (!pdfDoc || !bgPdfDoc) {
    alert("Debes cargar ambos PDFs primero.");
    return;
  }

  // Crear una nueva copia del PDF principal para modificar
  modifiedPdfDoc = await PDFLib.PDFDocument.create();

  const pages = pdfDoc.getPages();
  const bgPages = bgPdfDoc.getPages();

  // Iterar por las páginas del PDF principal
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Usar la página de fondo correspondiente (repetir si es necesario)
    const bgPageIndex = i % bgPages.length;
    const bgPage = await modifiedPdfDoc.embedPage(bgPages[bgPageIndex]);

    // Crear una nueva página en el PDF modificado
    const newPage = modifiedPdfDoc.addPage([width, height]);

    // Dibujar la página de fondo
    newPage.drawPage(bgPage, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

    // Dibujar el contenido del PDF original sobre el fondo
    const pageContents = await pdfDoc.embedPage(page);
    newPage.drawPage(pageContents, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
  }

  alert("Fondo aplicado con éxito.");
});

// Descargar PDF modificado
downloadButton.addEventListener("click", async () => {
  if (!modifiedPdfDoc) {
    alert("Primero aplica el fondo.");
    return;
  }

  const pdfBytes = await modifiedPdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "PDF-con-fondo.pdf";
  link.click();
});
