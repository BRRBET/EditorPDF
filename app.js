const pdfUpload = document.getElementById("pdf-upload");
const bgPdfUpload = document.getElementById("bg-pdf-upload");
const applyBgButton = document.getElementById("apply-bg");
const downloadButton = document.getElementById("download-pdf");

let pdfDoc = null; // Documento PDF principal
let bgPdfDoc = null; // Documento PDF de fondo

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

  const pages = pdfDoc.getPages();
  const bgPages = bgPdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const bgPage = bgPages[i % bgPages.length]; // Repetir el fondo si tiene menos páginas

    const { width, height } = page.getSize();
    const bgPageRef = await pdfDoc.embedPage(bgPage);

    // Dibujar la página de fondo debajo del contenido
    page.drawPage(bgPageRef, {
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
  if (!pdfDoc) {
    alert("No hay PDF para descargar.");
    return;
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "PDF-con-fondo.pdf";
  link.click();
});
