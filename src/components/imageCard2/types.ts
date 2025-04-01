import { ImageVariation as GlobalImageVariation, LocalState as GlobalLocalState } from '../../types/image';

// Define the core image type (unified for both main and variation images)
export interface ImageType {
  id: string;
  url: string;
  notes?: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
}

// Define the collection type that contains variations
export interface ImageCollection {
  id: string;
  conceptId: string;  // ID for the group of variations
  url: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
  notes?: string;
  variations: ImageType[];
  selectedVariation?: string;  // ID of the selected variation
}

// New concept-based structure (compatible with our global types)
export interface ImageConceptType {
  id: string;
  name: string;
  directoryPath: string;
  variations: ImageType[];
  selectedVariationId?: string;
}

// Using the global LocalState type
export type LocalState = GlobalLocalState;

// Props for the menu component
export interface ImageMenuProps {
  isCurrentlySelected: boolean;
  isCurrentlyRevise: boolean;
  isCurrentlyReject: boolean;
  onSelect: () => void;
  onRevise: () => void;
  onReject: () => void;
  className?: string;
}

// Props for the image notes component
export interface ImageNotesProps {
  notes?: string;
  isSelected: boolean;
  isRevise: boolean;
  isReject: boolean;
  onChange: (notes: string) => void;
}

// Props for the image display component
export interface ImageDisplayProps {
  imageUrl: string;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  scale: number;
  position: { x: number, y: number };
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
  onLoad: () => void;
}

// Props for the variations component
export interface ImageVariationsProps {
  // mainImage is now just the currently displayed variation, kept for backward compatibility
  mainImage: ImageType;
  // This contains all variations including what was previously the "main image"
  variations: ImageType[];
  selectedId: string;
  onVariationSelect: (id: string) => void;
  localStates: Record<string, LocalState>;
}

// Helper functions to convert between legacy and new formats
export function convertToLegacyFormat(concept: ImageConceptType): ImageCollection {
  // If there's a selected variation, use it as the main image
  // Otherwise use the first variation as the main image
  const mainVariation = concept.selectedVariationId 
    ? concept.variations.find(v => v.id === concept.selectedVariationId)
    : concept.variations[0];
    
  if (!mainVariation) {
    throw new Error('Concept must have at least one variation');
  }
  
  // Filter out the main variation from the variations array
  const otherVariations = concept.variations.filter(v => v.id !== mainVariation.id);
  
  return {
    id: mainVariation.id,
    conceptId: concept.id,
    url: mainVariation.url,
    selected: mainVariation.selected,
    revise: mainVariation.revise,
    reject: mainVariation.reject,
    notes: mainVariation.notes,
    variations: otherVariations,
    selectedVariation: concept.selectedVariationId
  };
}

export function convertToConceptFormat(collection: ImageCollection): ImageConceptType {
  // Create a full list of variations including the main image
  const allVariations = [
    {
      id: collection.id,
      url: collection.url,
      notes: collection.notes,
      selected: collection.selected,
      revise: collection.revise,
      reject: collection.reject
    },
    ...collection.variations
  ];
  
  // Extract directory path from the URL
  const urlParts = collection.url.split('/');
  urlParts.pop(); // Remove the filename
  const directoryPath = urlParts.join('/');
  
  return {
    id: collection.conceptId,
    name: directoryPath.split('/').pop() || '',
    directoryPath,
    variations: allVariations,
    selectedVariationId: collection.selectedVariation
  };
} 