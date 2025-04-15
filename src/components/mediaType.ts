
import { toast } from "@/components/ui/use-toast";

interface MediaType {
  id: string;
  name: string;
  description?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export const getMediaTypes = async (): Promise<MediaType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/media_types`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch media types');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching media types:', error);
    toast({
      title: "Error",
      description: "Failed to fetch media types",
      variant: "destructive",
    });
    return [];
  }
};

export const createMediaType = async (mediaType: { name: string, description?: string }): Promise<MediaType | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables/media_types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mediaType),
    });

    if (!response.ok) {
      throw new Error('Failed to create media type');
    }

    const data = await response.json();
    toast({
      title: "Success",
      description: "Media type created successfully",
    });
    
    return data;
  } catch (error) {
    console.error('Error creating media type:', error);
    toast({
      title: "Error",
      description: "Failed to create media type",
      variant: "destructive",
    });
    return null;
  }
};
