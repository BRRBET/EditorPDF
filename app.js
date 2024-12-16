const pdfUpload = document.getElementById("pdf-upload");
const pdfCanvas = document.getElementById("pdf-canvas");
const changeBgButton = document.getElementById("change-bg");
const downloadButton = document.getElementById("download-pdf");
const ctx = pdfCanvas.getContext("2d");
let pdfDoc = null;

pdfUpload.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const pdfjsLib = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js");
  const fileReader = new FileReader();
  
  fileReader.onload = async (e) => {
    const pdfData = new Uint8Array(e.target.result);
    pdfDoc = await pdfjsLib.getDocument(pdfData).promise;

    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    pdfCanvas.width = viewport.width;
    pdfCanvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;
  };

  fileReader.readAsArrayBuffer(file);
});

changeBgButton.addEventListener("click", () => {
  ctx.fillStyle = "lightblue"; // Cambia el color según lo deseado
  ctx.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
});

downloadButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = pdfCanvas.toDataURL("image/png");
  link.download = "edited-pdf.png";
  link.click();
});
