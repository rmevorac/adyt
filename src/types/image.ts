export interface ImageNote {
  reviseNote?: string;
  rejectNote?: string;
  reelNote?: string;
}

export interface ImageUpdateData {
  selected?: boolean;
  revise?: boolean;
  reject?: boolean;
  reviseNote?: string;
  rejectNote?: string;
  reelNote?: string;
}

export type NoteType = 'reviseNote' | 'rejectNote' | 'reelNote';

// Individual image with status fields for selection/revision/rejection
export interface ImageVariation {
  id: string;
  url: string;
  notes?: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
}

// Structure returned by the API
export interface APIImage {
  id: string;
  url: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
  reviseNote?: string;
  rejectNote?: string;
  variations: string[];
}

// Concept that contains multiple image variations
export interface ImageConcept {
  id: string;
  name: string;
  directoryPath: string;
  variations: ImageVariation[];
  selectedVariationId?: string;
}

// Backward compatibility for existing code
export interface ImageItem {
  id: string;
  conceptId: string;
  url: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
  notes?: string;
  variations: ImageVariation[];
  selectedVariation?: string;
}

export interface ImageCardProps {
  image: ImageItem;
  onSelect: (id: string) => void;
  onRevise: (id: string) => void;
  onReject: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
  onVariationSelect: (conceptId: string, variationId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isFullScreen?: boolean;
  onFullScreenChange: (isOpen: boolean) => void;
  nextImageUrl?: string;
  previousImageUrl?: string;
}

export interface LocalState {
  selected: boolean;
  revise: boolean;
  reject: boolean;
}

// Union type for compatibility with existing code
export type ImageType = ImageItem | ImageVariation;

// Helper function to convert ImageItem to ImageConcept
export function convertToImageConcept(item: ImageItem): ImageConcept {
  // Extract directory path from the URL
  const pathParts = item.url.split('/');
  pathParts.pop(); // Remove the filename
  const directoryPath = pathParts.join('/');
  
  return {
    id: item.conceptId,
    name: item.url.split('/').pop() || '',
    directoryPath,
    variations: item.variations,
    selectedVariationId: item.selectedVariation
  };
}

// Helper function to convert ImageConcept to ImageItem (for backward compatibility)
export function convertToImageItem(concept: ImageConcept): ImageItem {
  // Get the first variation or selected variation to display by default
  const defaultVariation = concept.variations.find(v => 
    concept.selectedVariationId ? v.id === concept.selectedVariationId : true
  ) || concept.variations[0];
  
  if (concept.variations.length === 0) {
    throw new Error('ImageConcept must have at least one variation');
  }
  
  return {
    // Use the ID of the default variation, but this is just for display purposes
    id: defaultVariation.id,
    conceptId: concept.id,
    // Use the URL of the default variation for the initial display
    url: defaultVariation.url,
    selected: defaultVariation.selected,
    revise: defaultVariation.revise,
    reject: defaultVariation.reject,
    notes: defaultVariation.notes,
    // All variations are equal - we don't distinguish the "main" one anymore
    variations: concept.variations,
    selectedVariation: concept.selectedVariationId
  };
} 