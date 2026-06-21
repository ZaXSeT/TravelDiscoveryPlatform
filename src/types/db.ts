// Hand-authored Database type mirroring supabase/migrations (Phase 1). Replace with
// `supabase gen types typescript` output once a project is linked.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TravelStyleEnum =
  | "adventure"
  | "culture"
  | "food"
  | "nature"
  | "luxury";
export type JournalVisibilityEnum = "private" | "public";
export type ItinerarySourceEnum = "manual" | "generated";

// Must be a type alias (not an interface): supabase-js requires each Row to be
// assignable to Record<string, unknown>, which interfaces are not.
type Timestamps = {
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_path: string | null;
          bio: string | null;
          travel_dna: Json | null;
        } & Timestamps;
        Insert: {
          id: string;
          display_name: string;
          avatar_path?: string | null;
          bio?: string | null;
          travel_dna?: Json | null;
        };
        Update: {
          display_name?: string;
          avatar_path?: string | null;
          bio?: string | null;
          travel_dna?: Json | null;
        };
        Relationships: [];
      };
      destinations: {
        Row: {
          id: string;
          slug: string;
          name: string;
          country: string;
          region: string;
          summary: string;
          latitude: number;
          longitude: number;
          dna_adventure: number;
          dna_culture: number;
          dna_food: number;
          dna_nature: number;
          dna_nightlife: number;
          dna_budget_friendly: number;
          budget_accommodation: number;
          budget_food: number;
          budget_transport: number;
        } & Timestamps;
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          destination_id: string;
        } & Timestamps;
        Insert: { user_id: string; destination_id: string };
        Update: { destination_id?: string };
        Relationships: [];
      };
      itineraries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          destination_id: string | null;
          source: ItinerarySourceEnum;
          style: TravelStyleEnum | null;
          total_budget: number;
          start_date: string | null;
        } & Timestamps;
        Insert: {
          user_id: string;
          title: string;
          destination_id?: string | null;
          source?: ItinerarySourceEnum;
          style?: TravelStyleEnum | null;
          total_budget?: number;
          start_date?: string | null;
        };
        Update: {
          title?: string;
          destination_id?: string | null;
          total_budget?: number;
          start_date?: string | null;
        };
        Relationships: [];
      };
      itinerary_days: {
        Row: {
          id: string;
          itinerary_id: string;
          day_index: number;
          title: string | null;
        } & Timestamps;
        Insert: {
          itinerary_id: string;
          day_index: number;
          title?: string | null;
        };
        Update: { day_index?: number; title?: string | null };
        Relationships: [];
      };
      itinerary_items: {
        Row: {
          id: string;
          day_id: string;
          position: number;
          title: string;
          start_time: string | null;
          cost: number;
          note: string | null;
          destination_id: string | null;
        } & Timestamps;
        Insert: {
          day_id: string;
          position?: number;
          title: string;
          start_time?: string | null;
          cost?: number;
          note?: string | null;
          destination_id?: string | null;
        };
        Update: {
          position?: number;
          title?: string;
          start_time?: string | null;
          cost?: number;
          note?: string | null;
          destination_id?: string | null;
        };
        Relationships: [];
      };
      journals: {
        Row: {
          id: string;
          user_id: string | null;
          is_seed: boolean;
          author_label: string;
          slug: string;
          title: string;
          excerpt: string | null;
          body: string;
          cover_path: string | null;
          destination_id: string | null;
          visibility: JournalVisibilityEnum;
          published_at: string | null;
          deleted_at: string | null;
        } & Timestamps;
        Insert: {
          user_id: string;
          author_label: string;
          slug: string;
          title: string;
          body: string;
          excerpt?: string | null;
          cover_path?: string | null;
          destination_id?: string | null;
          visibility?: JournalVisibilityEnum;
          published_at?: string | null;
        };
        Update: {
          title?: string;
          excerpt?: string | null;
          body?: string;
          cover_path?: string | null;
          destination_id?: string | null;
          visibility?: JournalVisibilityEnum;
          published_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      journal_images: {
        Row: {
          id: string;
          journal_id: string;
          storage_path: string;
          position: number;
          alt: string | null;
        } & Timestamps;
        Insert: {
          journal_id: string;
          storage_path: string;
          position?: number;
          alt?: string | null;
        };
        Update: { position?: number; alt?: string | null };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      travel_style: TravelStyleEnum;
      journal_visibility: JournalVisibilityEnum;
      itinerary_source: ItinerarySourceEnum;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type WishlistRow = Database["public"]["Tables"]["wishlists"]["Row"];
export type ItineraryRow = Database["public"]["Tables"]["itineraries"]["Row"];
export type ItineraryDayRow =
  Database["public"]["Tables"]["itinerary_days"]["Row"];
export type ItineraryItemRow =
  Database["public"]["Tables"]["itinerary_items"]["Row"];
export type JournalRow = Database["public"]["Tables"]["journals"]["Row"];
export type JournalImageRow =
  Database["public"]["Tables"]["journal_images"]["Row"];
