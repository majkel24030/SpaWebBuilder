// fix-pdf-download.js
// This script provides a global function to display PDFs in the browser

// Create a modal container once the document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Create a modal container for PDFs if it doesn't exist yet
  if (!document.getElementById('pdf-viewer-modal')) {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'pdf-viewer-modal';
    modalContainer.style.display = 'none';
    modalContainer.style.position = 'fixed';
    modalContainer.style.zIndex = '1000';
    modalContainer.style.left = '0';
    modalContainer.style.top = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modalContainer.style.overflow = 'auto';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = '5% auto';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.borderRadius = '5px';
    modalContent.style.position = 'relative';
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.style.color = '#aaa';
    closeButton.style.float = 'right';
    closeButton.style.fontSize = '28px';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = function() {
      modalContainer.style.display = 'none';
      
      // Clear iframe content when closing
      const existingIframe = document.getElementById('pdf-viewer-iframe');
      if (existingIframe) {
        existingIframe.src = '';
      }
    };
    
    // Add title
    const title = document.createElement('h2');
    title.id = 'pdf-viewer-title';
    title.style.margin = '0 0 20px 0';
    
    // Add container for buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginBottom = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    
    // Add download button
    const downloadButton = document.createElement('button');
    downloadButton.id = 'pdf-download-button';
    downloadButton.textContent = 'Pobierz PDF';
    downloadButton.style.padding = '8px 16px';
    downloadButton.style.backgroundColor = '#4CAF50';
    downloadButton.style.color = 'white';
    downloadButton.style.border = 'none';
    downloadButton.style.borderRadius = '4px';
    downloadButton.style.cursor = 'pointer';
    
    // Add print button
    const printButton = document.createElement('button');
    printButton.id = 'pdf-print-button';
    printButton.textContent = 'Drukuj';
    printButton.style.padding = '8px 16px';
    printButton.style.backgroundColor = '#2196F3';
    printButton.style.color = 'white';
    printButton.style.border = 'none';
    printButton.style.borderRadius = '4px';
    printButton.style.cursor = 'pointer';
    
    // Add iframe for the PDF
    const iframe = document.createElement('iframe');
    iframe.id = 'pdf-viewer-iframe';
    iframe.style.width = '100%';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    
    // Assemble modal
    buttonContainer.appendChild(downloadButton);
    buttonContainer.appendChild(printButton);
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(buttonContainer);
    modalContent.appendChild(iframe);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
      if (event.target === modalContainer) {
        modalContainer.style.display = 'none';
        
        // Clear iframe content when closing
        const existingIframe = document.getElementById('pdf-viewer-iframe');
        if (existingIframe) {
          existingIframe.src = '';
        }
      }
    });
  }
});

// Immediately export the downloadPDF function to the window object
window.downloadPDF = function(offerId, offerNumber) {
  console.log('Opening PDF for offer:', offerId, offerNumber);

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    alert('Nie jesteś zalogowany. Zaloguj się, aby wyświetlić PDF.');
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
    
    // Get the modal and set the iframe source
    const modal = document.getElementById('pdf-viewer-modal');
    const iframe = document.getElementById('pdf-viewer-iframe');
    const title = document.getElementById('pdf-viewer-title');
    const downloadButton = document.getElementById('pdf-download-button');
    const printButton = document.getElementById('pdf-print-button');
    
    if (modal && iframe && title) {
      // Set title and iframe source
      title.textContent = `Oferta ${offerNumber}`;
      iframe.src = blobUrl;
      
      // Setup download button
      if (downloadButton) {
        downloadButton.onclick = function() {
          const downloadLink = document.createElement('a');
          downloadLink.href = blobUrl;
          downloadLink.download = `Oferta_${offerNumber.replace(/\//g, '_')}.pdf`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        };
      }
      
      // Setup print button
      if (printButton) {
        printButton.onclick = function() {
          const printWindow = window.open(blobUrl, '_blank');
          if (printWindow) {
            printWindow.addEventListener('load', function() {
              printWindow.print();
            });
          } else {
            alert('Proszę zezwolić na otwieranie wyskakujących okien, aby wydrukować dokument.');
          }
        };
      }
      
      // Display the modal
      modal.style.display = 'block';
    }
  })
  .catch(error => {
    console.error('Error displaying PDF:', error);
    alert('Nie udało się wyświetlić pliku PDF. Spróbuj ponownie później.');
  });
};