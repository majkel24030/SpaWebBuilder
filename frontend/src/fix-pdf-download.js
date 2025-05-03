// fix-pdf-download.js
// This script provides a global function to download PDFs from the API

// Immediately export the downloadPDF function to the window object
window.downloadPDF = function(offerId, offerNumber) {
  console.log('Downloading PDF for offer:', offerId, offerNumber);

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    alert('Nie jesteś zalogowany. Zaloguj się, aby pobrać PDF.');
    return;
  }

  // Create a request to get the PDF blob
  fetch(`/api/offers/${offerId}/pdf`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/pdf',
    }
  })
  .then(response => {
    console.log('PDF response status:', response.status);
    if (!response.ok) {
      throw new Error(`Błąd pobierania PDF: ${response.status}`);
    }
    return response.blob();
  })
  .then(blob => {
    console.log('PDF blob received, size:', blob.size, 'bytes');
    
    // Create a blob URL
    const blobUrl = window.URL.createObjectURL(blob);
    console.log('Created blob URL:', blobUrl);
    
    // Create a temporary link element
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = `Oferta_${offerNumber.replace(/\//g, '_')}.pdf`;
    
    // Append to the document, click it, and remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(blobUrl);
      console.log('PDF download complete and resources cleaned up');
    }, 1000);
  })
  .catch(error => {
    console.error('Error downloading PDF:', error);
    alert('Nie udało się pobrać pliku PDF. Spróbuj ponownie później.');
  });
};