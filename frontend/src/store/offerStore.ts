import { create } from 'zustand';
import { Offer, OfferItem, ProductConfig } from '../types';

interface OfferState {
  // Current offer being created/edited
  currentOffer: Offer | null;
  
  // Product being configured
  currentProduct: ProductConfig | null;
  
  // Initialize a new offer
  initOffer: (offerData: Partial<Offer>) => void;
  
  // Start a new product configuration
  initProductConfig: () => void;
  
  // Update product configuration values
  updateProductConfig: (
    field: keyof ProductConfig | string, 
    value: string | number | Record<string, string>
  ) => void;
  
  // Update specific option in product configuration
  updateProductOption: (category: string, optionId: string) => void;
  
  // Add configured product to the current offer
  addProductToOffer: (netPrice: number) => void;
  
  // Remove product from offer
  removeProductFromOffer: (index: number) => void;
  
  // Update customer info in current offer
  updateOfferInfo: (field: keyof Offer, value: any) => void;
  
  // Calculate offer totals
  calculateTotals: () => void;
  
  // Clear current offer
  clearOffer: () => void;
  
  // Set an existing offer for editing
  setOffer: (offer: Offer) => void;
}

export const useOfferStore = create<OfferState>()((set, get) => ({
  currentOffer: null,
  currentProduct: null,
  
  initOffer: (offerData: Partial<Offer>) => {
    const defaultOffer: Offer = {
      numer: '',
      data: new Date().toISOString().split('T')[0],
      klient: '',
      suma_netto: 0,
      suma_vat: 0,
      suma_brutto: 0,
      items: [],
      ...offerData
    };
    
    set({ currentOffer: defaultOffer });
  },
  
  initProductConfig: () => {
    set({
      currentProduct: {
        typ: '',
        szerokosc: 0,
        wysokosc: 0,
        options: {},
        ilosc: undefined
      }
    });
  },
  
  updateProductConfig: (field, value) => {
    const { currentProduct } = get();
    if (!currentProduct) return;
    
    // Handle nested fields for options
    if (typeof field === 'string' && field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'options' && typeof value === 'string') {
        set({
          currentProduct: {
            ...currentProduct,
            options: {
              ...currentProduct.options,
              [child]: value
            }
          }
        });
      }
    } else {
      // Handle top-level fields
      set({
        currentProduct: {
          ...currentProduct,
          [field]: value
        }
      });
    }
  },
  
  updateProductOption: (category, optionId) => {
    const { currentProduct } = get();
    if (!currentProduct) {
      console.error("Cannot update product option: currentProduct is null");
      return;
    }
    
    // Clone the current options
    const updatedOptions = { ...currentProduct.options };
    
    // If option ID is empty, remove this category from options
    if (!optionId) {
      delete updatedOptions[category];
      console.log(`Removed option for category ${category}`);
    } else {
      // Otherwise, set/update the option for this category
      updatedOptions[category] = optionId;
      console.log(`Set option for category ${category} to ${optionId}`);
    }
    
    // Update the product with new options
    const updatedProduct = {
      ...currentProduct,
      options: updatedOptions
    };
    
    console.log("Updated product configuration:", updatedProduct);
    
    set({ currentProduct: updatedProduct });
  },
  
  addProductToOffer: (netPrice) => {
    const { currentOffer, currentProduct } = get();
    if (!currentOffer || !currentProduct) return;
    
    const newItem: OfferItem = {
      typ: currentProduct.typ,
      szerokosc: currentProduct.szerokosc,
      wysokosc: currentProduct.wysokosc,
      konfiguracja: { ...currentProduct.options },
      cena_netto: netPrice,
      ilosc: currentProduct.ilosc
    };
    
    set({
      currentOffer: {
        ...currentOffer,
        items: [...currentOffer.items, newItem]
      },
      currentProduct: null
    });
    
    // Recalculate totals after adding a product
    get().calculateTotals();
  },
  
  removeProductFromOffer: (index) => {
    const { currentOffer } = get();
    if (!currentOffer) return;
    
    const updatedItems = [...currentOffer.items];
    updatedItems.splice(index, 1);
    
    set({
      currentOffer: {
        ...currentOffer,
        items: updatedItems
      }
    });
    
    // Recalculate totals after removing a product
    get().calculateTotals();
  },
  
  updateOfferInfo: (field, value) => {
    const { currentOffer } = get();
    if (!currentOffer) return;
    
    set({
      currentOffer: {
        ...currentOffer,
        [field]: value
      }
    });
  },
  
  calculateTotals: () => {
    const { currentOffer } = get();
    if (!currentOffer) return;
    
    const suma_netto = currentOffer.items.reduce(
      (sum, item) => {
        // Jeśli ilość nie jest zdefiniowana, traktujemy jako 1
        const quantity = typeof item.ilosc === 'number' ? item.ilosc : 1;
        return sum + (item.cena_netto * quantity);
      }, 
      0
    );
    
    const suma_vat = suma_netto * 0.23; // 23% VAT
    const suma_brutto = suma_netto + suma_vat;
    
    set({
      currentOffer: {
        ...currentOffer,
        suma_netto,
        suma_vat,
        suma_brutto
      }
    });
  },
  
  clearOffer: () => {
    set({
      currentOffer: null,
      currentProduct: null
    });
  },
  
  setOffer: (offer: Offer) => {
    set({ currentOffer: offer });
  }
}));
