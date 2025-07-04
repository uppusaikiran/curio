// Qloo API Types

// Interface for external service entries
export interface QlooExternalService {
  [key: string]: any;
  id: string;
}

export interface QlooNetflixInfo extends QlooExternalService {
  id: string;
}

export interface QlooImdbInfo extends QlooExternalService {
  id: string;
  user_rating?: number;
  user_rating_count?: number;
}

export interface QlooMetacriticInfo extends QlooExternalService {
  id: string;
  critic_rating?: number;
  user_rating?: number;
}

export interface QlooRottenTomatoesInfo extends QlooExternalService {
  id: string;
  critic_rating?: string;
  critic_rating_count?: string;
  user_rating?: string;
  user_rating_count?: string;
}

export interface QlooExternalServices {
  netflix?: QlooNetflixInfo[];
  wikidata?: QlooExternalService[];
  twitter?: QlooExternalService[];
  letterboxd?: QlooExternalService[];
  metacritic?: QlooMetacriticInfo[];
  rottentomatoes?: QlooRottenTomatoesInfo[];
  imdb?: QlooImdbInfo[];
  [key: string]: QlooExternalService[] | undefined;
}

export interface QlooEntity {
  name: string;
  entity_id: string;
  type: string;
  subtype?: string;
  properties?: {
    release_year?: number;
    release_date?: string;
    description?: string;
    content_rating?: string;
    duration?: number;
    image?: {
      url: string;
    };
    akas?: {
      value: string;
      languages: string[];
    }[];
    filming_location?: string;
    production_companies?: string[];
    release_country?: string[];
    short_descriptions?: {
      value: string;
      languages: string[];
    }[];
    websites?: string[];
    [key: string]: any;
  };
  popularity?: number;
  tags?: QlooTag[];
  disambiguation?: string;
  external?: QlooExternalServices;
  query?: {
    measurements?: {
      audience_growth?: number;
      [key: string]: number | undefined;
    };
  };
}

export interface QlooTag {
  id: string;
  name: string;
  type: string;
}

export interface QlooInsight {
  name: string;
  entity_id: string;
  type: string;
  subtype?: string;
  properties?: {
    release_year?: number;
    release_date?: string;
    description?: string;
    content_rating?: string;
    duration?: number;
    image?: {
      url: string;
    };
    image_url?: string;
    akas?: {
      value: string;
      languages: string[];
    }[];
    filming_location?: string;
    production_companies?: string[];
    release_country?: string[];
    short_descriptions?: {
      value: string;
      languages: string[];
    }[];
    websites?: string[];
    [key: string]: any;
  };
  popularity?: number;
  tags?: QlooTag[];
  score?: number;
  external?: QlooExternalServices;
  query?: {
    affinity?: number;
    measurements?: Record<string, number>;
  };
  disambiguation?: string;
}

export interface QlooAnalysisResult {
  entity: QlooEntity;
  tags: {
    id: string;
    name: string;
    type: string;
    score: number;
  }[];
  audiences?: {
    id: string;
    name: string;
    type: string;
    score: number;
  }[];
  related_entities?: QlooEntity[];
}

export interface QlooCompareResult {
  entity1: QlooEntity;
  entity2: QlooEntity;
  similarity_score: number;
  common_tags: {
    id: string;
    name: string;
    type: string;
    score1: number;
    score2: number;
  }[];
  common_audiences?: {
    id: string;
    name: string;
    type: string;
    score1: number;
    score2: number;
  }[];
}

export interface QlooTrendingEntity {
  name: string;
  entity_id: string;
  type: string;
  subtype?: string;
  properties?: {
    release_year?: number;
    release_date?: string;
    description?: string;
    content_rating?: string;
    duration?: number;
    image?: {
      url: string;
    };
    akas?: {
      value: string;
      languages: string[];
    }[];
    filming_location?: string;
    production_companies?: string[];
    release_country?: string[];
    short_descriptions?: {
      value: string;
      languages: string[];
    }[];
    websites?: string[];
    [key: string]: any;
  };
  popularity?: number;
  tags?: QlooTag[];
  rank?: number;
  score?: number;
  trend_score?: number;
  trend_direction?: string;
  disambiguation?: string;
  external?: QlooExternalServices;
  query?: {
    measurements?: {
      audience_growth?: number;
      [key: string]: number | undefined;
    };
  };
}

export interface QlooEntityType {
  id: string;
  name: string;
  description?: string;
}

export interface QlooTagType {
  id: string;
  name: string;
  description?: string;
}

export interface QlooAudienceType {
  id: string;
  name: string;
  description?: string;
}

export interface QlooAudience {
  id: string;
  name: string;
  type: string;
  description?: string;
  size?: number;
  score?: number;
}

// API Response Types

export interface QlooApiResponse<T> {
  success: boolean;
  results: T;
  duration?: number;
  query?: Record<string, any>;
}

export interface QlooEntitiesResults {
  entities: QlooEntity[];
  entity?: QlooEntity;
}

export interface QlooInsightsResults {
  entities: QlooInsight[];
}

export interface QlooAnalysisResults {
  analysis: QlooAnalysisResult;
}

export interface QlooCompareResults {
  comparison: QlooCompareResult;
}

export interface QlooTrendingResults {
  trending: QlooTrendingEntity[];
  period?: string;
}

export interface QlooEntityTypesResults {
  types: QlooEntityType[];
}

export interface QlooTagTypesResults {
  types: QlooTagType[];
}

export interface QlooTagsResults {
  tags: QlooTag[];
}

export interface QlooAudienceTypesResults {
  types: QlooAudienceType[];
}

export interface QlooAudiencesResults {
  audiences: QlooAudience[];
}

// Parameter Types

export interface QlooFilterParams {
  'filter.type'?: string;
  'filter.id'?: string;
  'filter.tags'?: string;
  'filter.content_rating'?: string;
  'filter.popularity.min'?: number;
  'filter.popularity.max'?: number;
  'filter.release_year.min'?: number;
  'filter.release_year.max'?: number;
  'filter.external.netflix'?: string;
  'filter.external.imdb'?: string;
  'filter.external.rottentomatoes'?: string;
  [key: string]: any;
}

export interface QlooSignalParams {
  'signal.interests.entities'?: string;
  'signal.interests.tags'?: string;
  'signal.demographics.age.min'?: number;
  'signal.demographics.age.max'?: number;
  'signal.demographics.gender'?: string;
  'signal.demographics.income'?: string;
  'signal.location'?: string;
  [key: string]: any;
}

export interface QlooOutputParams {
  take?: number;
  page?: number;
  offset?: number;
  sort_by?: 'affinity' | 'distance';
  'feature.explainability'?: boolean;
  'include.popularity'?: boolean;
  'include.tags'?: boolean;
  'include.metrics'?: string;
  [key: string]: any;
}

export type QlooParams = QlooFilterParams & QlooSignalParams & QlooOutputParams; 