'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { VisualStyle, ProjectPurpose, ConceptCard, type ConceptData } from '../../components/lab';


// Define focus options with existing images
const styleOptions = [
  {
    id: 'product',
    label: 'Product-Focused',
    imageSrc: '/platform_images/jewelry_product.jpeg',
  },
  {
    id: 'model',
    label: 'Model/People-Centric',
    imageSrc: '/platform_images/jewelry_model.png',
  },
  {
    id: 'graphic',
    label: 'Graphic/Text-Heavy',
    imageSrc: '/platform_images/jewelry_graphic.png',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle/UGC Inspired',
    imageSrc: '/platform_images/jewelry_lifestyle.png',
  }
];

// Interface for concepts
interface Concept {
  id: string;
  data: ConceptData;
}

export default function LabPage() {
  // Client-side rendering flag
  const [mounted, setMounted] = useState(false);

  // State for project name
  const [projectName, setProjectName] = useState<string>('');
  
  // Update localStorage when project name changes
  useEffect(() => {
    if (mounted && projectName) {
      localStorage.setItem('currentProjectName', projectName);
    }
  }, [mounted, projectName]);
  
  // State for selected focus
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  
  // State for project purpose
  const [projectPurpose, setProjectPurpose] = useState<string>('');
  
  // State for number of images
  const [quantity, setQuantity] = useState<number>(5);
  
  // State for concepts
  const [concepts, setConcepts] = useState<Concept[]>([]);
  
  // Track which concept is currently expanded
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>(null);

  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure hydration consistency
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add a new concept
  const addConcept = useCallback(() => {
    const newConcept: Concept = {
      id: uuidv4(),
      data: {
        images: [],
        inspoLinks: [],
        notes: '',
      }
    };
    
    setConcepts((prevConcepts) => [...prevConcepts, newConcept]);
    // Auto-expand the newly added concept and collapse others
    setExpandedConceptId(newConcept.id);
  }, []);
  
  // Add initial concept
  useEffect(() => {
    if (mounted && concepts.length === 0) {
      addConcept();
    }
  }, [mounted, concepts.length, addConcept]);

  // Remove a concept
  const removeConcept = useCallback((id: string) => {
    setConcepts((prevConcepts) => {
      const filtered = prevConcepts.filter(concept => concept.id !== id);
      
      // If we're removing the expanded concept, expand the last one in the list
      if (expandedConceptId === id && filtered.length > 0) {
        setExpandedConceptId(filtered[filtered.length - 1].id);
      }
      
      return filtered;
    });
  }, [expandedConceptId]);

  // Update a concept
  const updateConcept = useCallback((id: string, data: ConceptData) => {
    setConcepts((prevConcepts) => 
      prevConcepts.map(concept => 
        concept.id === id ? { ...concept, data } : concept
      )
    );
  }, []);

  // Toggle concept expansion
  const toggleConceptExpansion = useCallback((id: string) => {
    setExpandedConceptId(prev => prev === id ? null : id);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if required fields are filled
    if (!projectName) {
      alert('Please enter a project name');
      return;
    }
    
    if (!projectPurpose) {
      alert('Please select a focus');
      return;
    }
    
    if (!selectedFocus) {
      alert('Please select a visual style');
      return;
    }
    
    try {
      // Set loading state
      setIsSubmitting(true);
      
      // First, get or create a user
      let userId = localStorage.getItem('userId') || '';
      
      if (!userId) {
        try {
          // Create a test user if none exists
          const userResponse = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: `test_${Date.now()}@example.com`,
              name: 'Test User'
            }),
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.user.id;
            localStorage.setItem('userId', userId);
          } else {
            console.error('Failed to create test user, using default');
            userId = 'default-user-id';
          }
        } catch (error) {
          console.error('Error creating user:', error);
          userId = 'default-user-id';
        }
      }
      
      // Ensure userId is a string
      if (!userId) {
        throw new Error('Failed to get or create user ID');
      }
      
      // Prepare project data
      const projectData = {
        name: projectName,
        description: projectPurpose,
        purpose: projectPurpose,
        focus: selectedFocus,
        quantity,
        concepts: concepts.map(concept => ({
          ...concept.data
        })),
        userId: userId as string
      };
      
      console.log('Submitting project:', projectData);
      
      // Send data to API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }
      
      const result = await response.json();
      console.log('Project created:', result);
      
      // Show success message
      alert('Your project has been created successfully!');
      
      // Reset form
      setProjectName('');
      setSelectedFocus(null);
      setProjectPurpose('');
      setQuantity(5);
      setConcepts([]);
      addConcept();
      
      // Clear current project name from localStorage
      localStorage.removeItem('currentProjectName');
      
    } catch (error) {
      console.error('Error creating project:', error);
      alert(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent hydration issues by not rendering until client-side
  if (!mounted) {
    return <div className="container mx-auto px-4 py-8 bg-white min-h-screen"></div>;
  }

  return (
    <main className="container mx-auto px-4 py-8 bg-white">
      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Section 1: Project Name */}
        <section>
          <div className="w-full">
            <h2 className="text-xl font-medium mb-4 text-gray-800">Project Name</h2>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter your project name"
              className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </section>
        
        {/* Section 2: Project Purpose with Number of Images */}
        <section>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="w-full md:w-1/2">
              <ProjectPurpose
                purpose={projectPurpose}
                onChange={setProjectPurpose}
              />
            </div>
            
            <div className="w-full md:w-1/3">
              <h2 className="text-xl font-medium mb-4 text-gray-800">Number of Images</h2>
              <div className="flex items-center justify-center max-w-[200px]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 w-10 rounded-l-lg border border-gray-200 flex items-center justify-center transition-colors"
                  disabled={quantity <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="relative flex-grow">
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 text-center w-full border-t border-b border-gray-200 text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 w-10 rounded-r-lg border border-gray-200 flex items-center justify-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Section 3: Visual Style */}
        <section>
          <VisualStyle 
            options={styleOptions}
            selected={selectedFocus}
            onChange={setSelectedFocus}
          />
        </section>
        
        {/* Section 4: Add Concept */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Concepts</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {concepts.map((concept, index) => (
              <ConceptCard
                key={concept.id}
                id={concept.id}
                index={index + 1}
                onRemove={removeConcept}
                onChange={updateConcept}
                isExpanded={expandedConceptId === concept.id}
                onToggleExpand={toggleConceptExpansion}
              />
            ))}
          </div>

          {/* Add Concept Button - Now at the bottom right */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={addConcept}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Concept
            </button>
          </div>
        </section>
        
        {/* CTA */}
        <section className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full md:w-auto px-8 py-4 font-medium rounded-lg shadow-sm transition-colors 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Project...
              </span>
            ) : (
              'Create Project'
            )}
          </button>
        </section>
      </form>
    </main>
  );
} 