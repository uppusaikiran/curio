'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { getEntityTypes, getTagTypes, searchTags } from '@/lib/qlooService';
import { QlooEntityType, QlooTagType, QlooTag } from '@/types/qloo';

interface InsightsQueryBuilderProps {
  onQuerySubmit: (params: Record<string, any>) => void;
  isLoading: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

// Prepopulated tag options by category
const prepopulatedTags: Record<string, SelectOption[]> = {
  // Common genre tags for media
  'urn:tag:genre:media': [
    { value: 'urn:tag:genre:media:action', label: 'Action' },
    { value: 'urn:tag:genre:media:comedy', label: 'Comedy' },
    { value: 'urn:tag:genre:media:drama', label: 'Drama' },
    { value: 'urn:tag:genre:media:thriller', label: 'Thriller' },
    { value: 'urn:tag:genre:media:sci_fi', label: 'Sci-Fi' },
    { value: 'urn:tag:genre:media:horror', label: 'Horror' },
    { value: 'urn:tag:genre:media:fantasy', label: 'Fantasy' },
    { value: 'urn:tag:genre:media:documentary', label: 'Documentary' },
    { value: 'urn:tag:genre:media:animation', label: 'Animation' },
    { value: 'urn:tag:genre:media:popular', label: 'Popular' }
  ],
  // Restaurant/cuisine tags
  'urn:tag:genre:restaurant': [
    { value: 'urn:tag:genre:restaurant:Italian', label: 'Italian' },
    { value: 'urn:tag:genre:restaurant:Chinese', label: 'Chinese' },
    { value: 'urn:tag:genre:restaurant:Mexican', label: 'Mexican' },
    { value: 'urn:tag:genre:restaurant:Japanese', label: 'Japanese' },
    { value: 'urn:tag:genre:restaurant:American', label: 'American' },
    { value: 'urn:tag:genre:restaurant:French', label: 'French' },
    { value: 'urn:tag:genre:restaurant:Indian', label: 'Indian' },
    { value: 'urn:tag:genre:restaurant:Thai', label: 'Thai' }
  ],
  // Music genre tags
  'urn:tag:genre:music': [
    { value: 'urn:tag:genre:music:rock', label: 'Rock' },
    { value: 'urn:tag:genre:music:pop', label: 'Pop' },
    { value: 'urn:tag:genre:music:hip_hop', label: 'Hip Hop' },
    { value: 'urn:tag:genre:music:electronic', label: 'Electronic' },
    { value: 'urn:tag:genre:music:jazz', label: 'Jazz' },
    { value: 'urn:tag:genre:music:classical', label: 'Classical' },
    { value: 'urn:tag:genre:music:country', label: 'Country' },
    { value: 'urn:tag:genre:music:r_and_b', label: 'R&B' },
    { value: 'urn:tag:genre:music:popular', label: 'Popular' }
  ],
  // Book genre tags
  'urn:tag:genre:book': [
    { value: 'urn:tag:genre:book:fiction', label: 'Fiction' },
    { value: 'urn:tag:genre:book:non_fiction', label: 'Non-Fiction' },
    { value: 'urn:tag:genre:book:sci_fi', label: 'Science Fiction' },
    { value: 'urn:tag:genre:book:fantasy', label: 'Fantasy' },
    { value: 'urn:tag:genre:book:mystery', label: 'Mystery' },
    { value: 'urn:tag:genre:book:thriller', label: 'Thriller' },
    { value: 'urn:tag:genre:book:romance', label: 'Romance' },
    { value: 'urn:tag:genre:book:biography', label: 'Biography' }
  ],
  // Default tags for fallback
  'default': [
    { value: 'urn:tag:genre:media:popular', label: 'Popular Media' },
    { value: 'urn:tag:genre:music:popular', label: 'Popular Music' },
    { value: 'urn:tag:genre:restaurant:popular', label: 'Popular Restaurants' },
    { value: 'urn:tag:genre:book:popular', label: 'Popular Books' }
  ]
};

export default function InsightsQueryBuilder({ onQuerySubmit, isLoading }: InsightsQueryBuilderProps) {
  const [entityTypes, setEntityTypes] = useState<SelectOption[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string | null>(null);

  const [tagTypes, setTagTypes] = useState<SelectOption[]>([]);
  const [selectedTagType, setSelectedTagType] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<SelectOption[]>([]);
  
  const [availableTags, setAvailableTags] = useState<SelectOption[]>([]);
  
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [gender, setGender] = useState<SelectOption | null>(null);
  const [location, setLocation] = useState('');

  // Fetch data for form dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        const [entityTypesData, tagTypesData] = await Promise.all([
          getEntityTypes(),
          getTagTypes(),
        ]);
        setEntityTypes(entityTypesData.map((t: QlooEntityType) => ({ value: t.id, label: t.name })));
        setTagTypes(tagTypesData.map((t: QlooTagType) => ({ value: t.id, label: t.name })));
      } catch (error) {
        console.error("Failed to fetch data for query builder", error);
      }
    }
    fetchData();
  }, []);

  // Update available tags when tag type is selected
  useEffect(() => {
    if (!selectedTagType) {
      setAvailableTags(prepopulatedTags.default || []);
      return;
    }
    
    // Find the most specific match in our prepopulated tags
    const exactMatch = prepopulatedTags[selectedTagType];
    if (exactMatch) {
      setAvailableTags(exactMatch);
      return;
    }
    
    // Try to find a parent category match
    const potentialParentKeys = Object.keys(prepopulatedTags)
      .filter(key => selectedTagType.startsWith(key))
      .sort((a, b) => b.length - a.length); // Sort by longest match first
    
    if (potentialParentKeys.length > 0) {
      setAvailableTags(prepopulatedTags[potentialParentKeys[0]] || []);
    } else {
      // Fallback to default tags
      setAvailableTags(prepopulatedTags.default || []);
    }
  }, [selectedTagType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, any> = {};
    if (selectedEntityType) params['filter.type'] = selectedEntityType;
    if (selectedTags.length > 0) params['signal.interests.tags'] = selectedTags.map(t => t.value).join(',');
    if (minAge) params['signal.demographics.age.min'] = minAge;
    if (maxAge) params['signal.demographics.age.max'] = maxAge;
    if (gender) params['signal.demographics.gender'] = gender.value;
    if (location) params['signal.location'] = location;
    
    onQuerySubmit(params);
  };
  
  const genderOptions: SelectOption[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-background">
      <h3 className="text-lg font-semibold">Insights Query Builder</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Target Entity Type</label>
        <Select
          options={entityTypes}
          onChange={(option) => setSelectedEntityType(option?.value || null)}
          value={entityTypes.find(option => option.value === selectedEntityType)}
          placeholder="Select an entity type..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Filter by Tags</label>
        <div className="space-y-2">
          <Select
            options={tagTypes}
            onChange={(option) => setSelectedTagType(option?.value || null)}
            value={tagTypes.find(option => option.value === selectedTagType)}
            placeholder="First, select a tag type..."
          />
          <Select
            isMulti
            options={availableTags}
            onChange={(options) => setSelectedTags(options as SelectOption[])}
            value={selectedTags}
            placeholder="Select from available tags..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Demographics</label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Min Age"
            value={minAge}
            onChange={(e) => setMinAge(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Max Age"
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mt-2">
           <Select
              options={genderOptions}
              onChange={(option) => setGender(option as SelectOption)}
              value={gender}
              placeholder="Select gender..."
            />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          placeholder="e.g., New York, NY"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>


      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Loading...' : 'Get Insights'}
      </Button>
    </form>
  );
} 