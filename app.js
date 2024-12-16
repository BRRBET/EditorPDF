const pdfUpload = document.getElementById("pdf-upload");
const imageUpload = document.getElementById("image-upload");
const applyBgButton = document.getElementById("apply-bg");
const downloadButton = document.getElementById("download-pdf");

let pdfDoc = null; // Documento PDF cargado
let bgImage = null; // Imagen de fondo cargada

// Cargar PDF
pdfUpload.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const pdfData = new Uint8Array(e.target.result);
    pdfDoc = await PDFLib.PDFDocument.load(pdfData);
    alert("PDF cargado correctamente.");
  };
  reader.readAsArrayBuffer(file);
});

// Cargar imagen de fondo
imageUpload.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    bgImage = e.target.result; // Base64 de la imagen
    alert("Imagen de fondo cargada correctamente.");
  };
  reader.readAsDataURL(file);
});

// Aplicar fondo al PDF
applyBgButton.addEventListener("click", async () => {
  if (!pdfDoc || !bgImage) {
    alert("Debes cargar un PDF y una imagen de fondo primero.");
    return;
  }

  const imageBytes = await fetch(bgImage).then((res) => res.arrayBuffer());
  const imgType = bgImage.startsWith("data:image/png") ? "png" : "jpg";

  // Embedir la imagen como fondo
  const embedImage =
    imgType === "png"
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.drawImage(embedImage, {
      x: 0,
      y: 0,
      width,
      height,
      opacity: 0.5, // Cambiar opacidad si es necesario
    });
  });

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
