'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Select from 'react-select';

interface SelectOption {
  value: string;
  label: string;
}

// Common tag categories with proper typing
const tagCategories: Record<string, SelectOption[]> = {
  'Media Genres': [
    { value: 'urn:tag:genre:media:action', label: 'Action' },
    { value: 'urn:tag:genre:media:comedy', label: 'Comedy' },
    { value: 'urn:tag:genre:media:drama', label: 'Drama' },
    { value: 'urn:tag:genre:media:thriller', label: 'Thriller' },
    { value: 'urn:tag:genre:media:sci_fi', label: 'Sci-Fi' },
    { value: 'urn:tag:genre:media:horror', label: 'Horror' },
    { value: 'urn:tag:genre:media:fantasy', label: 'Fantasy' },
    { value: 'urn:tag:genre:media:documentary', label: 'Documentary' },
    { value: 'urn:tag:genre:media:animation', label: 'Animation' }
  ],
  'Restaurant Cuisines': [
    { value: 'urn:tag:genre:restaurant:Italian', label: 'Italian' },
    { value: 'urn:tag:genre:restaurant:Chinese', label: 'Chinese' },
    { value: 'urn:tag:genre:restaurant:Mexican', label: 'Mexican' },
    { value: 'urn:tag:genre:restaurant:Japanese', label: 'Japanese' },
    { value: 'urn:tag:genre:restaurant:American', label: 'American' },
    { value: 'urn:tag:genre:restaurant:French', label: 'French' },
    { value: 'urn:tag:genre:restaurant:Indian', label: 'Indian' },
    { value: 'urn:tag:genre:restaurant:Thai', label: 'Thai' }
  ],
  'Music Genres': [
    { value: 'urn:tag:genre:music:rock', label: 'Rock' },
    { value: 'urn:tag:genre:music:pop', label: 'Pop' },
    { value: 'urn:tag:genre:music:hip_hop', label: 'Hip Hop' },
    { value: 'urn:tag:genre:music:electronic', label: 'Electronic' },
    { value: 'urn:tag:genre:music:jazz', label: 'Jazz' },
    { value: 'urn:tag:genre:music:classical', label: 'Classical' },
    { value: 'urn:tag:genre:music:country', label: 'Country' },
    { value: 'urn:tag:genre:music:r_and_b', label: 'R&B' }
  ],
  'Book Genres': [
    { value: 'urn:tag:genre:book:fiction', label: 'Fiction' },
    { value: 'urn:tag:genre:book:non_fiction', label: 'Non-Fiction' },
    { value: 'urn:tag:genre:book:sci_fi', label: 'Science Fiction' },
    { value: 'urn:tag:genre:book:fantasy', label: 'Fantasy' },
    { value: 'urn:tag:genre:book:mystery', label: 'Mystery' },
    { value: 'urn:tag:genre:book:thriller', label: 'Thriller' },
    { value: 'urn:tag:genre:book:romance', label: 'Romance' },
    { value: 'urn:tag:genre:book:biography', label: 'Biography' }
  ],
  'Popular Tags': [
    { value: 'urn:tag:genre:media:popular', label: 'Popular Media' },
    { value: 'urn:tag:genre:music:popular', label: 'Popular Music' },
    { value: 'urn:tag:genre:restaurant:popular', label: 'Popular Restaurants' }
  ],
  'default': [] // Empty fallback
};

interface PreselectedTagsSelectorProps {
  onTagsChange: (tags: SelectOption[]) => void;
  includeParam?: string; // Parameter name to include tags in (default: signal.interests.tags)
  filterParam?: string;  // Alternative parameter name (e.g., filter.tags)
  className?: string;
  label?: string;
}

export default function PreselectedTagsSelector({
  onTagsChange,
  includeParam = 'signal.interests.tags',
  filterParam,
  className = '',
  label = 'Select Tags'
}: PreselectedTagsSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<SelectOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<SelectOption[]>([]);

  // Update available tags when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setAvailableTags(tagCategories['default']);
      return;
    }
    
    setAvailableTags(tagCategories[selectedCategory] || tagCategories['default']);
  }, [selectedCategory]);

  // Notify parent component when selected tags change
  useEffect(() => {
    onTagsChange(selectedTags);
  }, [selectedTags, onTagsChange]);

  // Create the parameter object for API calls
  const getParamsObject = (): Record<string, string> => {
    if (selectedTags.length === 0) return {};

    const tagsString = selectedTags.map(t => t.value).join(',');
    
    if (filterParam) {
      return {
        [filterParam]: tagsString
      };
    }
    
    return {
      [includeParam]: tagsString
    };
  };

  const categoryOptions = Object.keys(tagCategories)
    .filter(key => key !== 'default') // Hide default category from dropdown
    .map(category => ({
      value: category,
      label: category
    }));

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium">{label}</label>
      <div className="space-y-2">
        <Select
          options={categoryOptions}
          onChange={(option) => {
            setSelectedCategory(option?.value || null);
            // Reset selected tags when changing category
            setSelectedTags([]);
          }}
          value={categoryOptions.find(option => option.value === selectedCategory) || null}
          placeholder="Select a tag category..."
          className="mb-2"
        />
        <Select
          isMulti
          options={availableTags}
          onChange={(options) => setSelectedTags(options as SelectOption[])}
          value={selectedTags}
          placeholder="Select tags..."
          isDisabled={!selectedCategory}
        />
      </div>
    </div>
  );
}

// Export helper functions for reuse in other components
export { tagCategories, type SelectOption }; 