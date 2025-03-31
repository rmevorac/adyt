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

// Local state for tracking UI feedback
export interface LocalState {
  selected: boolean;
  revise: boolean;
  reject: boolean;
}

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
  mainImage: ImageType;
  variations: ImageType[];
  selectedId: string;
  onVariationSelect: (id: string) => void;
  localStates: Record<string, LocalState>;
} 