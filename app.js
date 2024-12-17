const pdfUpload = document.getElementById("pdf-upload");
const bgUpload = document.getElementById("bg-upload");
const applyBgButton = document.getElementById("apply-bg");
const downloadButton = document.getElementById("download-pdf");

let pdfDoc = null; // Documento PDF principal
let bgPdfDoc = null; // Documento PDF de fondo
let bgImage = null; // Imagen de fondo
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

// Cargar fondo (PDF o imagen)
bgUpload.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const fileType = file.type;
  const reader = new FileReader();

  reader.onload = async (e) => {
    if (fileType === "application/pdf") {
      const bgPdfData = new Uint8Array(e.target.result);
      bgPdfDoc = await PDFLib.PDFDocument.load(bgPdfData);
      bgImage = null; // Limpiar cualquier imagen previa
      alert("Fondo PDF cargado correctamente.");
    } else if (fileType.startsWith("image/")) {
      bgImage = e.target.result; // Guardar la imagen en formato base64
      bgPdfDoc = null; // Limpiar cualquier PDF previo
      alert("Imagen de fondo cargada correctamente.");
    } else {
      alert("Formato no soportado. Carga un PDF o una imagen.");
    }
  };

  reader.readAsArrayBuffer(fileType === "application/pdf" ? file : null);
  reader.readAsDataURL(fileType.startsWith("image/") ? file : null);
});

// Aplicar fondo al PDF principal
applyBgButton.addEventListener("click", async () => {
  if (!pdfDoc || (!bgPdfDoc && !bgImage)) {
    alert("Debes cargar un PDF principal y un fondo (PDF o imagen).");
    return;
  }

  // Crear una copia del PDF principal para modificar
  modifiedPdfDoc = await PDFLib.PDFDocument.create();

  const pages = pdfDoc.getPages();
  const bgPages = bgPdfDoc ? bgPdfDoc.getPages() : null;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Crear una nueva página en el PDF modificado
    const newPage = modifiedPdfDoc.addPage([width, height]);

    // Si el fondo es un PDF
    if (bgPages) {
      const bgPageIndex = i % bgPages.length;
      const bgPage = await modifiedPdfDoc.embedPage(bgPages[bgPageIndex]);
      newPage.drawPage(bgPage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }

    // Si el fondo es una imagen
    if (bgImage) {
      const imageBytes = await fetch(bgImage).then((res) => res.arrayBuffer());
      const imgType = bgImage.startsWith("data:image/png") ? "png" : "jpg";
      const embedImage =
        imgType === "png"
          ? await modifiedPdfDoc.embedPng(imageBytes)
          : await modifiedPdfDoc.embedJpg(imageBytes);
      newPage.drawImage(embedImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }

    // Dibujar el contenido original del PDF principal sobre el fondo
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
